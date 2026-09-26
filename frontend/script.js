"use strict";

/* =========================================================
   BRAINLYTIX
   Memory + Attention
   50 levels each
========================================================= */

const API = "http://127.0.0.1:5000";

let authMode = "login";

let currentUser = null;

let currentTest = null;

let currentLevel = 1;

let currentScore = 0;

let memoryProgress = [];

let attentionProgress = [];

let currentChallenge = null;

let challengeTimer = null;


/* =========================================================
   DOM
========================================================= */

const $ = (id) => document.getElementById(id);


/* =========================================================
   SCREEN CONTROL
========================================================= */

function showScreen(id) {

    document.querySelectorAll(".screen").forEach((screen) => {
        screen.classList.add("hidden");
    });

    const target = $(id);

    if (target) {
        target.classList.remove("hidden");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   AUTH TABS
========================================================= */

function setAuthMode(mode) {

    authMode = mode;

    $("loginTab").classList.toggle(
        "active",
        mode === "login"
    );

    $("registerTab").classList.toggle(
        "active",
        mode === "register"
    );

    $("authButton").textContent =
        mode === "login"
            ? "Login"
            : "Create Account";

    $("authMessage").textContent = "";

    $("password").value = "";
}


$("loginTab").addEventListener(
    "click",
    () => setAuthMode("login")
);

$("registerTab").addEventListener(
    "click",
    () => setAuthMode("register")
);


/* =========================================================
   AUTH
========================================================= */

$("authForm").addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const username =
            $("username").value.trim();

        const password =
            $("password").value;

        if (username.length < 3) {

            showAuthMessage(
                "Username must contain at least 3 characters."
            );

            return;
        }

        if (password.length < 4) {

            showAuthMessage(
                "Password must contain at least 4 characters."
            );

            return;
        }

        $("authButton").disabled = true;

        $("authButton").textContent =
            authMode === "login"
                ? "Logging in..."
                : "Creating...";

        try {

            const response = await fetch(
                `${API}/api/${authMode}`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        username,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {

                showAuthMessage(
                    data.message ||
                    "Something went wrong."
                );

                return;
            }

            if (authMode === "register") {

                showToast(
                    "Account created. You can now login."
                );

                setAuthMode("login");

                $("password").value = "";

                return;
            }

            currentUser = {
                id: data.user_id,
                username: data.username
            };

            localStorage.setItem(
                "brainlytixUser",
                JSON.stringify(currentUser)
            );

            await loadProgress();

            showHome();

        } catch (error) {

            console.error(error);

            showAuthMessage(
                "Backend is not connected. Start app.py first."
            );

        } finally {

            $("authButton").disabled = false;

            $("authButton").textContent =
                authMode === "login"
                    ? "Login"
                    : "Create Account";
        }
    }
);


function showAuthMessage(message) {

    $("authMessage").textContent = message;
}


/* =========================================================
   LOGIN SESSION
========================================================= */

function restoreSession() {

    const saved =
        localStorage.getItem("brainlytixUser");

    if (!saved) {

        showScreen("authScreen");

        return;
    }

    try {

        currentUser = JSON.parse(saved);

        if (!currentUser.id) {
            throw new Error("Invalid session");
        }

        loadProgress()
            .then(showHome)
            .catch(() => {

                localStorage.removeItem(
                    "brainlytixUser"
                );

                currentUser = null;

                showScreen("authScreen");
            });

    } catch {

        localStorage.removeItem(
            "brainlytixUser"
        );

        showScreen("authScreen");
    }
}


/* =========================================================
   LOGOUT
========================================================= */

$("logoutButton").addEventListener(
    "click",
    logout
);


function logout() {

    currentUser = null;

    memoryProgress = [];

    attentionProgress = [];

    localStorage.removeItem(
        "brainlytixUser"
    );

    $("username").value = "";

    $("password").value = "";

    setAuthMode("login");

    showScreen("authScreen");

    showToast("You have been logged out.");
}


/* =========================================================
   HOME
========================================================= */

function showHome() {

    if (!currentUser) {

        showScreen("authScreen");

        return;
    }

    $("welcomeUser").textContent =
        currentUser.username;

    updateHomeStats();

    showScreen("menuScreen");
}


$("memoryCard").addEventListener(
    "click",
    () => openLevels("memory")
);

$("attentionCard").addEventListener(
    "click",
    () => openLevels("attention")
);


/* =========================================================
   PROGRESS
========================================================= */

async function loadProgress() {

    if (!currentUser) return;

    const [memoryResponse, attentionResponse] =
        await Promise.all([

            fetch(
                `${API}/api/progress/${currentUser.id}/memory`
            ),

            fetch(
                `${API}/api/progress/${currentUser.id}/attention`
            )

        ]);

    if (!memoryResponse.ok ||
        !attentionResponse.ok) {

        throw new Error(
            "Could not load progress."
        );
    }

    memoryProgress =
        await memoryResponse.json();

    attentionProgress =
        await attentionResponse.json();

    updateHomeStats();
}


function updateHomeStats() {

    const memoryCompleted =
        getCompletedLevels("memory").length;

    const attentionCompleted =
        getCompletedLevels("attention").length;

    $("memoryProgress").textContent =
        `${memoryCompleted === 0 ? 1 : memoryCompleted + 1 > 50 ? 50 : memoryCompleted + 1} / 50`;

    $("attentionProgress").textContent =
        `${attentionCompleted === 0 ? 1 : attentionCompleted + 1 > 50 ? 50 : attentionCompleted + 1} / 50`;

    $("totalCompleted").textContent =
        memoryCompleted +
        attentionCompleted;
}


function getProgress(test) {

    return test === "memory"
        ? memoryProgress
        : attentionProgress;
}


function getCompletedLevels(test) {

    return getProgress(test)
        .map(item => Number(item.level))
        .filter(level => level >= 1 && level <= 50);
}


function getHighestCompleted(test) {

    const levels =
        getCompletedLevels(test);

    return levels.length
        ? Math.max(...levels)
        : 0;
}


function getUnlockedLevel(test) {

    return Math.min(
        getHighestCompleted(test) + 1,
        50
    );
}


function isCompleted(test, level) {

    return getCompletedLevels(test)
        .includes(level);
}


/* =========================================================
   LEVELS
========================================================= */

function openLevels(test) {

    if (!currentUser) {

        showScreen("authScreen");

        return;
    }

    currentTest = test;

    const isMemory =
        test === "memory";

    $("levelTestIcon").textContent =
        isMemory ? "🧠" : "🎯";

    $("levelTitle").textContent =
        isMemory
            ? "Memory Levels"
            : "Attention Levels";

    $("levelsHeading").textContent =
        isMemory
            ? "Build your memory"
            : "Sharpen your attention";

    $("levelsDescription").textContent =
        isMemory
            ? "Remember more as the challenges become harder."
            : "Stay focused as patterns become more challenging.";

    renderLevels();

    showScreen("levelsScreen");
}


$("levelsBackButton").addEventListener(
    "click",
    showHome
);


function renderLevels() {

    const grid = $("levelsGrid");

    grid.innerHTML = "";

    const completed =
        getCompletedLevels(currentTest);

    const unlocked =
        getUnlockedLevel(currentTest);

    $("completedCount").textContent =
        completed.length;

    for (let level = 1; level <= 50; level++) {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className = "level-btn";

        const completedLevel =
            completed.includes(level);

        const locked =
            level > unlocked;

        const difficulty =
            getDifficulty(level);

        if (completedLevel) {

            button.classList.add("completed");

        } else if (level === unlocked) {

            button.classList.add("current");

        }

        if (locked) {

            button.classList.add("locked");

            button.disabled = true;
        }

        button.innerHTML = `
            <span class="level-number">
                ${level}
            </span>

            <span class="level-name">
                ${difficulty}
            </span>

            <span class="level-status">
                ${completedLevel ? "✓" : locked ? "🔒" : "→"}
            </span>
        `;

        if (!locked) {

            button.addEventListener(
                "click",
                () => startLevel(level)
            );
        }

        grid.appendChild(button);
    }
}


function getDifficulty(level) {

    if (level <= 5) {
        return "Easy";
    }

    if (level <= 20) {
        return "Intermediate";
    }

    if (level <= 35) {
        return "Hard";
    }

    if (level <= 45) {
        return "Very Hard";
    }

    return "Expert";
}


/* =========================================================
   START LEVEL
========================================================= */

function startLevel(level) {

    clearChallengeTimer();

    currentLevel = level;

    currentScore = 0;

    $("gameScore").textContent =
        "0";

    $("gameTestName").textContent =
        currentTest === "memory"
            ? "Memory Test"
            : "Attention Test";

    $("gameIcon").textContent =
        currentTest === "memory"
            ? "🧠"
            : "🎯";

    $("gameLevelName").textContent =
        `Level ${level}`;

    $("progressText").textContent =
        `${level} / 50`;

    $("progressFill").style.width =
        `${(level / 50) * 100}%`;

    $("gameMessage").textContent = "";

    $("gameMessage").className =
        "game-message";

    $("nextLevelButton").classList.add(
        "hidden"
    );

    showScreen("gameScreen");

    if (currentTest === "memory") {

        startMemoryLevel(level);

    } else {

        startAttentionLevel(level);
    }
}


/* =========================================================
   MEMORY GAME
========================================================= */

function startMemoryLevel(level) {

    clearChallengeTimer();

    const challenge =
        createMemoryChallenge(level);

    currentChallenge = challenge;

    $("gameInstruction").textContent =
        "Remember everything you see.";

    $("challengeArea").innerHTML = `
        <div class="memory-items">
            ${challenge.items.map(
                (item, index) => `
                    <div
                        class="memory-item"
                        style="animation-delay:${index * 0.05}s">
                        ${escapeHTML(item)}
                    </div>
                `
            ).join("")}
        </div>
    `;

    $("answerArea").innerHTML = "";

    /*
       The game waits 10 seconds.
       There is no countdown shown to the player.
    */

    challengeTimer = setTimeout(() => {

        $("challengeArea").innerHTML = `
            <div class="ready-message">
                <h2>Now recall what you saw.</h2>
                <p>Enter the items in their original order.</p>
            </div>
        `;

        $("answerArea").innerHTML = `
            <input
                id="memoryAnswer"
                class="answer-input"
                type="text"
                placeholder="Example: A 7 HOUSE 3"
                autocomplete="off"
            >

            <button
                id="memorySubmit"
                class="primary-btn submit-answer"
                type="button">
                Check Answer
            </button>
        `;

        $("memorySubmit").addEventListener(
            "click",
            checkMemoryAnswer
        );

        $("memoryAnswer").addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {
                    checkMemoryAnswer();
                }

            }
        );

        $("memoryAnswer").focus();

    }, 10000);
}


/* =========================================================
   MEMORY CHALLENGE GENERATOR
========================================================= */

function createMemoryChallenge(level) {

    /*
       Difficulty pattern:

       1 - 5
       1 item

       6 - 14
       3 items

       15 - 20
       4 items

       21 - 25
       5 items

       26 - 40
       5-6 items

       41 - 50
       10 items
    */

    let count;

    if (level <= 5) {

        count = 1;

    } else if (level <= 14) {

        count = 3;

    } else if (level <= 20) {

        count = 4;

    } else if (level <= 25) {

        count = 5;

    } else if (level <= 40) {

        count = level % 2 === 0
            ? 6
            : 5;

    } else {

        count = 10;
    }

    const items = [];

    for (let i = 0; i < count; i++) {

        items.push(
            generateMemoryItem(
                level,
                i
            )
        );
    }

    /*
       Replay variation:
       Randomized item generation means
       replaying a completed level gives
       a different challenge.
    */

    return {
        items,
        level
    };
}


function generateMemoryItem(level, index) {

    const easyLetters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ";

    const symbols = [
        "@",
        "#",
        "%",
        "&",
        "*",
        "+",
        "=",
        "$",
        "?",
        "!",
        "~"
    ];

    const words = [
        "APPLE",
        "RIVER",
        "HOUSE",
        "TRAIN",
        "LIGHT",
        "WINDOW",
        "GARDEN",
        "BRIDGE",
        "PLANET",
        "MARKET",
        "FOREST",
        "SCHOOL"
    ];

    const arithmeticEasy = [
        "2+3",
        "5-2",
        "3+4",
        "8-3",
        "2×4"
    ];

    const arithmeticMedium = [
        "12+5",
        "18-7",
        "6×3",
        "20÷4",
        "15+8",
        "24-9"
    ];

    const arithmeticHard = [
        "14+27",
        "35-18",
        "7×8",
        "48÷6",
        "23+19",
        "64-27",
        "9×7",
        "81÷9"
    ];

    const arithmeticExpert = [
        "125+38",
        "240-87",
        "12×8",
        "144÷12",
        "37+68-12",
        "15×7-9",
        "180÷9+14",
        "250-75+18"
    ];

    /*
       Level 1-5:
       Letters only.
    */

    if (level <= 5) {

        return randomChar(easyLetters);
    }

    /*
       Level 6-14:
       Letters + small arithmetic.
    */

    if (level <= 14) {

        return Math.random() < 0.45
            ? randomItem(arithmeticEasy)
            : randomChar(easyLetters);
    }

    /*
       Level 15-20:
       Four items, words + arithmetic.
    */

    if (level <= 20) {

        return Math.random() < 0.55
            ? randomItem(words)
            : randomItem(arithmeticMedium);
    }

    /*
       Level 21-25:
       Five items.
    */

    if (level <= 25) {

        const pool = [
            ...words,
            ...arithmeticMedium,
            ...symbols
        ];

        return randomItem(pool);
    }

    /*
       Level 26-40:
       More complex.
    */

    if (level <= 40) {

        const pool = [
            ...words,
            ...symbols,
            ...arithmeticHard
        ];

        return randomItem(pool);
    }

    /*
       Level 41-50:
       Expert arithmetic + words + symbols.
    */

    const pool = [
        ...words,
        ...symbols,
        ...arithmeticHard,
        ...arithmeticExpert
    ];

    return randomItem(pool);
}


/* =========================================================
   MEMORY ANSWER
========================================================= */

function checkMemoryAnswer() {

    const input =
        $("memoryAnswer");

    if (!input) return;

    const userAnswer =
        normalizeAnswer(input.value);

    const correctAnswer =
        currentChallenge.items
            .map(item => normalizeAnswer(item))
            .join(" ");

    if (!userAnswer) {

        showGameMessage(
            "Please enter your answer.",
            "error"
        );

        return;
    }

    if (userAnswer === correctAnswer) {

        finishLevel(
            100 + currentLevel * 5
        );

    } else {

        showGameMessage(
            `Not quite. Correct sequence: ${currentChallenge.items.join(" ")}`,
            "error"
        );

        showRetryButton();
    }
}


/* =========================================================
   ATTENTION GAME
========================================================= */

function startAttentionLevel(level) {

    clearChallengeTimer();

    const challenge =
        createAttentionChallenge(level);

    currentChallenge = challenge;

    $("gameInstruction").textContent =
        challenge.instruction;

    $("challengeArea").innerHTML = `
        <div class="attention-grid">

            ${challenge.options.map(
                (item, index) => `
                    <button
                        type="button"
                        class="attention-option"
                        data-index="${index}">
                        ${escapeHTML(item)}
                    </button>
                `
            ).join("")}

        </div>
    `;

    $("answerArea").innerHTML = "";

    document
        .querySelectorAll(".attention-option")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const index =
                        Number(
                            button.dataset.index
                        );

                    checkAttentionAnswer(index);
                }
            );
        });
}


/* =========================================================
   ATTENTION CHALLENGE GENERATOR
========================================================= */

function createAttentionChallenge(level) {

    let size;

    if (level <= 5) {

        size = 4;

    } else if (level <= 14) {

        size = 6;

    } else if (level <= 20) {

        size = 8;

    } else if (level <= 30) {

        size = 9;

    } else if (level <= 40) {

        size = 12;

    } else {

        size = 16;
    }

    /*
       Different attention pattern from Memory.

       Memory:
       remember sequence.

       Attention:
       identify the single different
       symbol / word / number.
    */

    const basePool = [
        "●",
        "▲",
        "■",
        "◆",
        "★",
        "+",
        "=",
        "%",
        "#",
        "@"
    ];

    const wordPool = [
        "FOCUS",
        "TRAIN",
        "BRAIN",
        "LIGHT",
        "RIVER",
        "STONE",
        "MIND",
        "SMART"
    ];

    const numberPool = [
        "11",
        "22",
        "33",
        "44",
        "55",
        "66",
        "77",
        "88",
        "99"
    ];

    let pool;

    if (level <= 10) {

        pool = basePool;

    } else if (level <= 20) {

        pool = [
            ...basePool,
            ...wordPool
        ];

    } else {

        pool = [
            ...basePool,
            ...wordPool,
            ...numberPool
        ];
    }

    const base =
        randomItem(pool);

    let different;

    do {

        different =
            randomItem(pool);

    } while (different === base);

    const options =
        Array(size).fill(base);

    const oddIndex =
        Math.floor(
            Math.random() * size
        );

    options[oddIndex] =
        different;

    shuffle(options);

    const finalIndex =
        options.indexOf(different);

    return {
        options,
        correctIndex: finalIndex,

        instruction:
            level <= 10
                ? "Find the different symbol."
                : level <= 20
                    ? "Find the different item."
                    : "Stay focused. Find the one item that is different."
    };
}


/* =========================================================
   ATTENTION ANSWER
========================================================= */

function checkAttentionAnswer(index) {

    if (!currentChallenge) return;

    if (
        index ===
        currentChallenge.correctIndex
    ) {

        finishLevel(
            100 + currentLevel * 6
        );

    } else {

        showGameMessage(
            "Good try. Look carefully and try again.",
            "error"
        );

        showRetryButton();
    }
}


/* =========================================================
   FINISH LEVEL
========================================================= */

async function finishLevel(score) {

    clearChallengeTimer();

    currentScore = score;

    $("gameScore").textContent =
        score;

    showGameMessage(
        `Excellent! Level ${currentLevel} completed.`,
        "success"
    );

    disableGameInputs();

    $("nextLevelButton").classList.remove(
        "hidden"
    );

    await saveProgress(
        currentTest,
        currentLevel,
        score
    );
}


/* =========================================================
   SAVE PROGRESS
========================================================= */

async function saveProgress(
    test,
    level,
    score
) {

    if (!currentUser) return;

    try {

        const response =
            await fetch(
                `${API}/api/progress`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        user_id:
                            currentUser.id,

                        test,

                        level,

                        score
                    })
                }
            );

        if (!response.ok) {

            throw new Error(
                "Could not save progress"
            );
        }

        /*
           Update local progress immediately.
        */

        const target =
            test === "memory"
                ? memoryProgress
                : attentionProgress;

        const existing =
            target.find(
                item =>
                    Number(item.level) === level
            );

        if (existing) {

            existing.score =
                Math.max(
                    Number(existing.score) || 0,
                    score
                );

        } else {

            target.push({
                level,
                score
            });
        }

        updateHomeStats();

    } catch (error) {

        console.error(error);

        showToast(
            "Level completed, but progress could not be saved."
        );
    }
}


/* =========================================================
   NEXT LEVEL
========================================================= */

$("nextLevelButton").addEventListener(
    "click",
    () => {

        const next =
            currentLevel + 1;

        if (next <= 50) {

            startLevel(next);

        } else {

            showToast(
                "You completed all 50 levels!"
            );

            openLevels(currentTest);
        }
    }
);


/* =========================================================
   RETRY
========================================================= */

function showRetryButton() {

    const button =
        document.createElement("button");

    button.type = "button";

    button.className =
        "primary-btn next-button";

    button.textContent =
        "Try This Level Again";

    button.addEventListener(
        "click",
        () => {

            startLevel(currentLevel);
        }
    );

    $("answerArea").appendChild(button);
}


/* =========================================================
   DISABLE INPUTS
========================================================= */

function disableGameInputs() {

    document
        .querySelectorAll(
            ".attention-option, .submit-answer"
        )
        .forEach(button => {

            button.disabled = true;
        });

    const input =
        $("memoryAnswer");

    if (input) {
        input.disabled = true;
    }
}


/* =========================================================
   BACK BUTTONS
========================================================= */

$("gameBackButton").addEventListener(
    "click",
    () => {

        clearChallengeTimer();

        openLevels(currentTest);
    }
);


/* =========================================================
   GAME MESSAGE
========================================================= */

function showGameMessage(
    message,
    type = ""
) {

    $("gameMessage").textContent =
        message;

    $("gameMessage").className =
        `game-message ${type}`;
}


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;

function showToast(message) {

    const toast =
        $("toast");

    toast.textContent =
        message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer =
        setTimeout(() => {

            toast.classList.remove("show");

        }, 2500);
}


/* =========================================================
   RANDOM HELPERS
========================================================= */

function randomItem(array) {

    return array[
        Math.floor(
            Math.random() * array.length
        )
    ];
}


function randomChar(string) {

    return string[
        Math.floor(
            Math.random() * string.length
        )
    ];
}


function shuffle(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            array[i],
            array[j]
        ] = [
            array[j],
            array[i]
        ];
    }

    return array;
}


function normalizeAnswer(value) {

    return value
        .trim()
        .replace(/\s+/g, " ")
        .toUpperCase();
}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   TIMER
========================================================= */

function clearChallengeTimer() {

    if (challengeTimer) {

        clearTimeout(
            challengeTimer
        );

        challengeTimer = null;
    }
}


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setAuthMode("login");

        showScreen("authScreen");

        restoreSession();
    }
);