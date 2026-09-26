from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

DATABASE = "brainlytix.db"


# =========================================================
# DATABASE
# =========================================================

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def create_tables():

    conn = get_db()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            test TEXT NOT NULL,
            level INTEGER NOT NULL,
            score INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    conn.commit()

    # -----------------------------------------------------
    # CREATE TEST USER
    # -----------------------------------------------------

    test_username = "demo"
    test_password = "demo123"

    existing_user = conn.execute(
        "SELECT id FROM users WHERE username = ?",
        (test_username,)
    ).fetchone()

    if existing_user is None:

        conn.execute(
            """
            INSERT INTO users (username, password)
            VALUES (?, ?)
            """,
            (
                test_username,
                generate_password_hash(test_password)
            )
        )

        conn.commit()

        print()
        print("=" * 50)
        print("TEST ACCOUNT CREATED")
        print("Username : demo")
        print("Password : demo123")
        print("=" * 50)
        print()

    conn.close()


# =========================================================
# HOME
# =========================================================

@app.route("/")
def home():

    return jsonify({
        "app": "Brainlytix",
        "status": "running"
    })


# =========================================================
# HEALTH CHECK
# =========================================================

@app.route("/api/health")
def health():

    return jsonify({
        "success": True,
        "status": "Backend is running"
    })


# =========================================================
# REGISTER
# =========================================================

@app.route("/api/register", methods=["POST"])
def register():

    data = request.get_json() or {}

    username = data.get("username")
    password = data.get("password")

    if not username or not password:

        return jsonify({
            "success": False,
            "message": "Username and password are required"
        }), 400

    username = username.strip()

    if len(username) < 3:

        return jsonify({
            "success": False,
            "message": "Username must contain at least 3 characters"
        }), 400

    if len(password) < 4:

        return jsonify({
            "success": False,
            "message": "Password must contain at least 4 characters"
        }), 400

    conn = get_db()

    try:

        conn.execute(
            """
            INSERT INTO users (username, password)
            VALUES (?, ?)
            """,
            (
                username,
                generate_password_hash(password)
            )
        )

        conn.commit()

        return jsonify({
            "success": True,
            "message": "Account created"
        })

    except sqlite3.IntegrityError:

        return jsonify({
            "success": False,
            "message": "Username already exists"
        }), 409

    finally:

        conn.close()


# =========================================================
# LOGIN
# =========================================================

@app.route("/api/login", methods=["POST"])
def login():

    data = request.get_json() or {}

    username = data.get("username")
    password = data.get("password")

    if not username or not password:

        return jsonify({
            "success": False,
            "message": "Username and password are required"
        }), 400

    conn = get_db()

    user = conn.execute(
        """
        SELECT *
        FROM users
        WHERE username = ?
        """,
        (username.strip(),)
    ).fetchone()

    conn.close()

    if user and check_password_hash(
        user["password"],
        password
    ):

        return jsonify({
            "success": True,
            "user_id": user["id"],
            "username": user["username"]
        })

    return jsonify({
        "success": False,
        "message": "Invalid username or password"
    }), 401


# =========================================================
# SAVE PROGRESS
# =========================================================

@app.route("/api/progress", methods=["POST"])
def save_progress():

    data = request.get_json() or {}

    user_id = data.get("user_id")
    test = data.get("test")
    level = data.get("level")
    score = data.get("score")

    if (
        user_id is None
        or not test
        or level is None
        or score is None
    ):

        return jsonify({
            "success": False,
            "message": "Missing progress data"
        }), 400

    if test not in ["memory", "attention"]:

        return jsonify({
            "success": False,
            "message": "Invalid test type"
        }), 400

    conn = get_db()

    # Prevent duplicate level records.
    existing = conn.execute(
        """
        SELECT id, score
        FROM progress
        WHERE user_id = ?
        AND test = ?
        AND level = ?
        """,
        (
            user_id,
            test,
            level
        )
    ).fetchone()

    if existing:

        # Keep the higher score.
        old_score = existing["score"]

        if score > old_score:

            conn.execute(
                """
                UPDATE progress
                SET score = ?
                WHERE id = ?
                """,
                (
                    score,
                    existing["id"]
                )
            )

    else:

        conn.execute(
            """
            INSERT INTO progress
            (user_id, test, level, score)
            VALUES (?, ?, ?, ?)
            """,
            (
                user_id,
                test,
                level,
                score
            )
        )

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Progress saved"
    })


# =========================================================
# GET PROGRESS
# =========================================================

@app.route(
    "/api/progress/<int:user_id>/<test>",
    methods=["GET"]
)
def get_progress(user_id, test):

    if test not in ["memory", "attention"]:

        return jsonify({
            "success": False,
            "message": "Invalid test type"
        }), 400

    conn = get_db()

    rows = conn.execute(
        """
        SELECT level, score
        FROM progress
        WHERE user_id = ?
        AND test = ?
        ORDER BY level
        """,
        (
            user_id,
            test
        )
    ).fetchall()

    conn.close()

    return jsonify([
        {
            "level": row["level"],
            "score": row["score"]
        }
        for row in rows
    ])


# =========================================================
# RUN
# =========================================================

if __name__ == "__main__":

    create_tables()

    print()
    print("Brainlytix backend started.")
    print("URL: http://127.0.0.1:5000")
    print()
    print("TEST LOGIN")
    print("Username: demo")
    print("Password: demo123")
    print()

    app.run(
        debug=True,
        port=5000
    )