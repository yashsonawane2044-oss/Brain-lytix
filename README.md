# 🧠 Brainlytix

> **Train Your Memory. Sharpen Your Attention. Level Up.**

Brainlytix is an interactive cognitive-training web game designed to make memory and attention practice simple, engaging, and progressively challenging.

It includes two independent game modes:

- 🧠 **Memory Test** — remember and reproduce changing sequences of characters, symbols, numbers, and arithmetic patterns.
- 🎯 **Attention Test** — focus on important information while handling increasingly complex visual and text-based challenges.

Each mode contains **50 independent levels** with its own progression system.

---

## 🎮 Why Brainlytix?

Brainlytix is built around a simple idea:

> **Don't just play a game — challenge your brain.**

The player starts with simple challenges and gradually works toward more complex patterns.

```text
                    🧠 BRAINLYTIX
                          │
              ┌───────────┴───────────┐
              │                       │
         🧠 MEMORY                🎯 ATTENTION
              │                       │
          50 LEVELS                50 LEVELS
              │                       │
              └───────────┬───────────┘
                          │
                    🏆 PROGRESS
```

---

## ✨ Features

### 🧠 Memory Test

- 50 independent levels
- Randomized challenges
- Letters and numbers
- Keyboard symbols
- Arithmetic operations
- Increasing sequence complexity
- Replayable completed levels
- Separate memory progress
- Level locking

### 🎯 Attention Test

- 50 independent levels
- Different challenge pattern from Memory Test
- Symbols and text patterns
- Distracting elements
- Arithmetic challenges
- Increasing complexity
- Separate attention progress
- Level locking

### 🔐 Authentication

- User registration
- User login
- Password hashing
- User-specific progress
- SQLite database

### 🎮 Game System

- Progressive difficulty
- Random challenge generation
- Score tracking
- Progress saving
- Replay support
- Locked levels
- Smooth UI animations
- Responsive interface

---

# 🧠 Memory Test

The Memory Test challenges the player to remember information and reproduce it correctly.

A simple challenge may look like:

```text
A
```

As the level increases:

```text
A7#
```

Higher levels can introduce:

```text
K4@9 + 7
```

And more complex combinations:

```text
B7#2 + 15 × 4 @ K9
```

The challenge becomes progressively more difficult through:

- More characters
- More symbols
- Numbers
- Arithmetic
- Mixed patterns
- Longer sequences

---

# 🎯 Attention Test

The Attention Test uses a different structure from the Memory Test.

The player must focus on relevant information while dealing with additional elements that require attention.

Challenges can include:

- Symbols
- Numbers
- Words
- Arithmetic operations
- Larger patterns
- Distracting information
- Increasing visual complexity

Memory and Attention therefore have **separate gameplay experiences**.

---

# 📈 Level Progression

Each game mode contains **50 levels**.

```text
🧠 MEMORY

Level 1 → Level 2 → Level 3 → ... → Level 50


🎯 ATTENTION

Level 1 → Level 2 → Level 3 → ... → Level 50
```

### Difficulty Structure

| Levels | Difficulty | Challenge |
|---|---|---|
| 1–5 | 🟢 Easy | Simple characters |
| 6–14 | 🟢 Easy → 🟡 Intermediate | Multiple characters |
| 15–20 | 🟡 Intermediate | Characters + arithmetic |
| 21–25 | 🟠 Hard | Longer patterns |
| 26–40 | 🔴 Very Hard | Multiple elements + arithmetic |
| 41–50 | 🔥 Extreme | Long and complex combinations |

---

# 🔒 Level Unlocking

Players cannot directly jump to an unfinished level.

For example:

```text
Level 1  ✅ Completed
   ↓
Level 2  🔓 Unlocked
   ↓
Level 3  🔒 Locked
   ↓
Level 4  🔒 Locked
```

A player must complete the previous level before moving forward.

If a locked level is selected, Brainlytix displays a message asking the player to complete the previous level first.

---

# 🔄 Replay System

Completed levels can be replayed.

When an old level is played again, Brainlytix can generate a different challenge.

Example:

### First attempt

```text
A7#K
```

### Replay

```text
P4@B
```

This keeps completed levels more interesting and prevents the player from simply memorizing the previous answer.

---

# 🏆 Separate Progress

Memory and Attention progress are completely independent.

Example:

```text
👤 Player: demo

🧠 MEMORY
Level 1   ✅
Level 2   ✅
Level 3   🔓
Level 4   🔒
Level 5   🔒

🎯 ATTENTION
Level 1   ✅
Level 2   🔒
Level 3   🔒
Level 4   🔒
Level 5   🔒
```

Completing a Memory level does **not** unlock an Attention level.

---

# 🔐 Authentication

Brainlytix uses Flask and SQLite for a simple authentication system.

### Test Account

```text
Username: demo
Password: demo123
```

Passwords are hashed using Werkzeug before being stored.

```python
generate_password_hash(password)
```

Passwords are verified using:

```python
check_password_hash(...)
```

> The test account is intended for local development and demonstration.

---

# 🛠️ Technology Stack

## Frontend

- HTML5
- CSS3
- JavaScript

## Backend

- Python
- Flask
- Flask-CORS

## Database

- SQLite

## Security

- Werkzeug Password Hashing

---

# 🏗️ Architecture

```text
                    BRAINLYTIX
                        │
          ┌─────────────┴─────────────┐
          │                           │
      FRONTEND                     BACKEND
          │                           │
    HTML / CSS / JS                 Flask
          │                           │
          │                       REST API
          │                           │
          └──────────────┬────────────┘
                         │
                       SQLite
                         │
                  Users + Progress
```

---

# 📁 Project Structure

```text
Brainlytix/
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── brainlytix.db
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── .gitignore
└── README.md
```

> `brainlytix.db` is generated locally and should not be uploaded to GitHub.

---

# ⚙️ Installation

## 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

```bash
cd Brainlytix
```

---

## 2. Create a virtual environment

```bash
python -m venv venv
```

### Windows

```powershell
venv\Scripts\activate
```

---

## 3. Install dependencies

```powershell
cd backend
```

```powershell
pip install -r requirements.txt
```

---

# 🚀 Run the Backend

From the `backend` directory:

```powershell
python app.py
```

The backend will run at:

```text
http://127.0.0.1:5000
```

---

# ❤️ Backend Health Check

Open:

```text
http://127.0.0.1:5000/api/health
```

Expected response:

```json
{
    "success": true,
    "status": "Backend is running"
}
```

---

# 🌐 Run the Frontend

Open:

```text
frontend/index.html
```

You can use **VS Code Live Server** to run the frontend.

Make sure the Flask backend is running before testing login and progress features.

---

# 🔌 API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/` | Backend status |
| `GET` | `/api/health` | Health check |
| `POST` | `/api/register` | Create account |
| `POST` | `/api/login` | Authenticate user |
| `POST` | `/api/progress` | Save progress |
| `GET` | `/api/progress/<user_id>/<test>` | Load progress |

---

# 🔄 Application Flow

```text
                  Open Brainlytix
                         │
                         ▼
                       Login
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
        🧠 Memory Test        🎯 Attention Test
              │                     │
              ▼                     ▼
          50 Levels             50 Levels
              │                     │
              ▼                     ▼
         Score + Progress      Score + Progress
              │                     │
              └──────────┬──────────┘
                         ▼
                       SQLite
```

---

# 🧪 Testing Checklist

## Authentication

- [ ] Register a new account
- [ ] Login with correct credentials
- [ ] Reject incorrect password
- [ ] Reject unknown username

## Memory Test

- [ ] Level 1 works
- [ ] Completing Level 1 unlocks Level 2
- [ ] Locked levels cannot be opened
- [ ] Replay generates a new challenge
- [ ] Score is saved
- [ ] Progress is restored

## Attention Test

- [ ] Level 1 works
- [ ] Progress is independent from Memory
- [ ] Locked levels work
- [ ] Replay works
- [ ] Score is saved
- [ ] Progress is restored

## Backend

- [ ] Flask starts
- [ ] Health endpoint works
- [ ] Registration works
- [ ] Login works
- [ ] Progress saves
- [ ] Progress loads

---

# 🎓 What This Project Demonstrates

Brainlytix combines multiple development concepts into one practical project.

### Programming

- Python
- JavaScript
- HTML
- CSS

### Backend Development

- Flask
- REST APIs
- API requests
- CORS
- Database operations

### Database

- SQLite
- User records
- Progress tracking
- CRUD operations

### Authentication

- Registration
- Login
- Password hashing
- User identification

### Game Development

- Game logic
- Random challenge generation
- Level progression
- Level unlocking
- Score calculation
- Replay system

### Frontend Development

- Modern UI/UX
- Responsive layouts
- Animations
- Interactive level cards
- Dynamic game screens

---

# 🚧 Future Improvements

Possible future versions could include:

- 🏆 Achievements
- 🔥 Daily challenges
- 📊 Performance analytics
- 📈 Accuracy graphs
- 🎯 Adaptive difficulty
- 🥇 Leaderboards
- 👤 User profiles
- 📱 Progressive Web App
- 🌐 Online deployment
- 🔊 Sound effects
- 🎮 Additional cognitive game modes

---

# 🎯 Project Goal

Brainlytix is designed to turn simple cognitive exercises into a progressive game experience.

The player starts with:

```text
A
```

Then progresses to:

```text
A7#
```

Then:

```text
K4@9 + 7
```

And eventually faces complex patterns such as:

```text
B7#2 + 15 × 4 @ K9
```

The journey is:

```text
START
  ↓
LEARN
  ↓
PRACTICE
  ↓
IMPROVE
  ↓
CHALLENGE
  ↓
🔥 LEVEL 50
```

---

# 👨‍💻 Author

## Yash Sonawane

**AI/ML Student**

Interested in:

- Artificial Intelligence
- Machine Learning
- Computer Vision
- Web Development
- Practical AI Projects

---

# 📄 License

This project is created for **educational and portfolio purposes**.

---

## ⭐ Brainlytix

### 🧠 Train Your Memory
### 🎯 Sharpen Your Attention
### 🔥 Challenge Yourself
### 🏆 Reach Level 50
