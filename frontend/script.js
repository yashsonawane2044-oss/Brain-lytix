/* =========================================
   BRAINLYTIX
   MAIN JAVASCRIPT
========================================= */

const API_URL = "http://127.0.0.1:5000";

const TOTAL_LEVELS = 50;


/* =========================================
   STATE
========================================= */

let currentUser = null;

let currentTest = null;

let currentLevel = 1;

let currentScore = 0;

let memoryAnswer = "";

let memoryTimer = null;


/* =========================================
   ELEMENTS
========================================= */

const authScreen =
    document.getElementById("authScreen");

const mainScreen =
    document.getElementById("mainScreen");

const loginForm =
    document.getElementById("loginForm");

const registerForm =
    document.getElementById("registerForm");

const switchAuth =
    document.getElementById("switchAuth");

const switchText =
    document.getElementById("switchText");

const authTitle =
    document.getElementById("authTitle");

const authSubtitle =
    document.getElementById("authSubtitle");

const authMessage =
    document.getElementById("authMessage");

const logoutButton =
    document.getElementById("logoutButton");

const usernameDisplay =
    document.getElementById("usernameDisplay");

const avatarLetter =
    document.getElementById("avatarLetter");

const memoryButton =
    document.getElementById("memoryButton");

const attentionButton =
    document.getElementById("attentionButton");

const levelScreen =
    document.getElementById("levelScreen");

const gameScreen =
    document.getElementById("gameScreen");

const levelsGrid =
    document.getElementById("levelsGrid");

const levelTitle =
    document.getElementById("levelTitle");

const levelTypeLabel =
    document.getElementById("levelTypeLabel");

const backToDashboard =
    document.getElementById("backToDashboard");

const backToLevels =
    document.getElementById("backToLevels");

const currentLevelDisplay =
    document.getElementById("currentLevel");

const currentScoreDisplay =
    document.getElementById("currentScore");

const gameType =
    document.getElementById("gameType");

const memoryGame =
    document.getElementById("memoryGame");

const attentionGame =
    document.getElementById("attentionGame");

const memorySequence =
    document.getElementById("memorySequence");

const memoryInputArea =
    document.getElementById("memoryInputArea");

const memoryAnswerInput =
    document.getElementById("memoryAnswer");

const memorySubmit =
    document.getElementById("memorySubmit");

const attentionGrid =
    document.getElementById("attentionGrid");

const gameResult =
    document.getElementById("gameResult");

const resultScore =
    document.getElementById("resultScore");

const resultMessage =
    document.getElementById("resultMessage");

const nextLevelButton =
    document.getElementById("nextLevelButton");

const memoryStat =
    document.getElementById("memoryStat");

const attentionStat =
    document.getElementById("attentionStat");

const completedStat =
    document.getElementById("completedStat");


/* =========================================
   AUTH MESSAGE
========================================= */

function showAuthMessage(message, type = "error") {

    authMessage.textContent = message;

    if (type === "success") {

        authMessage.style.color = "#16a34a";

    } else {

        authMessage.style.color = "#dc2626";
    }
}


/* =========================================
   SWITCH LOGIN / REGISTER
========================================= */

switchAuth.addEventListener(
    "click",
    () => {

        const registerVisible =
            !registerForm.classList.contains("hidden");

        if (registerVisible) {

            registerForm.classList.add("hidden");

            loginForm.classList.remove("hidden");

            authTitle.textContent =
                "Welcome back";

            authSubtitle.textContent =
                "Login to continue your brain training journey.";

            switchText.textContent =
                "Don't have an account?";

            switchAuth.textContent =
                "Register";

        } else {

            loginForm.classList.add("hidden");

            registerForm.classList.remove("hidden");

            authTitle.textContent =
                "Create your account";

            authSubtitle.textContent =
                "Start your personalized brain training journey.";

            switchText.textContent =
                "Already have an account?";

            switchAuth.textContent =
                "Login";
        }

        authMessage.textContent = "";
    }
);


/* =========================================
   LOGIN
========================================= */

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const username =
            document.getElementById(
                "loginUsername"
            ).value.trim();

        const password =
            document.getElementById(
                "loginPassword"
            ).value;

        if (!username || !password) {

            showAuthMessage(
                "Please enter username and password."
            );

            return;
        }

        try {

            const response =
                await fetch(
                    `${API_URL}/api/login`,
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

            const data =
                await response.json();

            if (!response.ok || !data.success) {

                showAuthMessage(
                    data.message ||
                    "Invalid username or password."
                );

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

            loginForm.reset();

            showMainScreen();

        } catch (error) {

            console.error(error);

            showAuthMessage(
                "Backend is not connected. Start Flask on port 5000."
            );
        }
    }
);


/* =========================================
   REGISTER
========================================= */

registerForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const username =
            document.getElementById(
                "registerUsername"
            ).value.trim();

        const password =
            document.getElementById(
                "registerPassword"
            ).value;

        if (username.length < 3) {

            showAuthMessage(
                "Username must contain at least 3 characters."
            );

            return;
        }

        if (password.length < 6) {

            showAuthMessage(
                "Password must contain at least 6 characters."
            );

            return;
        }

        try {

            const response =
                await fetch(
                    `${API_URL}/api/register`,
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

            const data =
                await response.json();

            if (!response.ok || !data.success) {

                showAuthMessage(
                    data.message ||
                    "Registration failed."
                );

                return;
            }

            showAuthMessage(
                "Account created successfully. You can now login.",
                "success"
            );

            registerForm.reset();

            setTimeout(() => {

                switchAuth.click();

            }, 1000);

        } catch (error) {

            console.error(error);

            showAuthMessage(
                "Backend is not connected. Start Flask on port 5000."
            );
        }
    }
);


/* =========================================
   SHOW MAIN SCREEN
========================================= */

async function showMainScreen() {

    authScreen.classList.add("hidden");

    mainScreen.classList.remove("hidden");

    usernameDisplay.textContent =
        currentUser.username;

    avatarLetter.textContent =
        currentUser.username
            .charAt(0)
            .toUpperCase();

    await loadDashboardProgress();
}


/* =========================================
   LOGOUT
========================================= */

logoutButton.addEventListener(
    "click",
    () => {

        currentUser = null;

        localStorage.removeItem(
            "brainlytixUser"
        );

        mainScreen.classList.add("hidden");

        authScreen.classList.remove("hidden");

        levelScreen.classList.add("hidden");

        gameScreen.classList.add("hidden");

        loginForm.classList.remove("hidden");

        registerForm.classList.add("hidden");

        authTitle.textContent =
            "Welcome back";

        authSubtitle.textContent =
            "Login to continue your brain training journey.";

        switchText.textContent =
            "Don't have an account?";

        switchAuth.textContent =
            "Register";

        authMessage.textContent = "";
    }
);


/* =========================================
   MEMORY BUTTON
========================================= */

memoryButton.addEventListener(
    "click",
    () => {

        openLevels("memory");
    }
);


/* =========================================
   ATTENTION BUTTON
========================================= */

attentionButton.addEventListener(
    "click",
    () => {

        openLevels("attention");
    }
);


/* =========================================
   OPEN LEVELS
========================================= */

async function openLevels(test) {

    currentTest = test;

    levelScreen.classList.remove("hidden");

    gameScreen.classList.add("hidden");

    document.querySelector(".tests-section")
        .classList.add("hidden");

    document.querySelector(".stats-grid")
        .classList.add("hidden");

    document.querySelector(".hero")
        .classList.add("hidden");

    if (test === "memory") {

        levelTypeLabel.textContent =
            "🧠 MEMORY";

        levelTitle.textContent =
            "Memory Levels";

    } else {

        levelTypeLabel.textContent =
            "🎯 ATTENTION";

        levelTitle.textContent =
            "Attention Levels";
    }

    await renderLevels();
}


/* =========================================
   BACK TO DASHBOARD
========================================= */

backToDashboard.addEventListener(
    "click",
    () => {

        levelScreen.classList.add("hidden");

        document.querySelector(".tests-section")
            .classList.remove("hidden");

        document.querySelector(".stats-grid")
            .classList.remove("hidden");

        document.querySelector(".hero")
            .classList.remove("hidden");
    }
);


/* =========================================
   BACK TO LEVELS
========================================= */

backToLevels.addEventListener(
    "click",
    () => {

        stopMemoryTimer();

        gameScreen.classList.add("hidden");

        levelScreen.classList.remove("hidden");

        renderLevels();
    }
);


/* =========================================
   LOAD PROGRESS
========================================= */

async function getProgress(test) {

    if (!currentUser) {
        return [];
    }

    try {

        const response =
            await fetch(
                `${API_URL}/api/progress/${currentUser.id}/${test}`
            );

        if (!response.ok) {
            return [];
        }

        return await response.json();

    } catch (error) {

        console.error(
            "Progress error:",
            error
        );

        return [];
    }
}


/* =========================================
   DASHBOARD PROGRESS
========================================= */

async function loadDashboardProgress() {

    const memoryProgress =
        await getProgress("memory");

    const attentionProgress =
        await getProgress("attention");

    const memoryMax =
        getHighestLevel(memoryProgress);

    const attentionMax =
        getHighestLevel(attentionProgress);

    const completed =
        memoryProgress.length +
        attentionProgress.length;

    memoryStat.textContent =
        `${memoryMax} / ${TOTAL_LEVELS}`;

    attentionStat.textContent =
        `${attentionMax} / ${TOTAL_LEVELS}`;

    completedStat.textContent =
        completed;
}


/* =========================================
   HIGHEST LEVEL
========================================= */

function getHighestLevel(progress) {

    if (!Array.isArray(progress) ||
        progress.length === 0) {

        return 0;
    }

    return Math.max(
        ...progress.map(
            item => Number(item.level) || 0
        )
    );
}


/* =========================================
   RENDER LEVELS
========================================= */

async function renderLevels() {

    levelsGrid.innerHTML = "";

    const progress =
        await getProgress(currentTest);

    const completedLevels =
        new Map();

    progress.forEach(item => {

        completedLevels.set(
            Number(item.level),
            Number(item.score)
        );
    });


    /*
       LEVEL 1 IS ALWAYS UNLOCKED.
       NEXT LEVEL UNLOCKS AFTER
       PREVIOUS LEVEL IS COMPLETED.
    */

    const highestCompleted =
        getHighestLevel(progress);


    for (
        let level = 1;
        level <= TOTAL_LEVELS;
        level++
    ) {

        const isCompleted =
            completedLevels.has(level);

        const isUnlocked =
            level === 1 ||
            level <= highestCompleted + 1;

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "level-button";

        if (!isUnlocked) {

            button.classList.add("locked");

        } else {

            button.classList.add("unlocked");
        }

        if (isCompleted) {

            button.classList.add("completed");
        }


        const number =
            document.createElement("div");

        number.className =
            "level-number";

        number.textContent =
            isUnlocked
                ? level
                : "🔒";


        const status =
            document.createElement("div");

        status.className =
            "level-status";


        if (isCompleted) {

            status.textContent =
                `✓ ${completedLevels.get(level)} pts`;

        } else if (isUnlocked) {

            status.textContent =
                "Start Level";

        } else {

            status.textContent =
                "Locked";
        }


        button.appendChild(number);

        button.appendChild(status);


        if (isUnlocked) {

            button.addEventListener(
                "click",
                () => {

                    startGame(level);
                }
            );
        }


        levelsGrid.appendChild(button);
    }
}


/* =========================================
   START GAME
========================================= */

function startGame(level) {

    currentLevel = level;

    currentScore = 0;

    currentLevelDisplay.textContent =
        level;

    currentScoreDisplay.textContent =
        "0";

    gameType.textContent =
        currentTest;


    levelScreen.classList.add("hidden");

    gameScreen.classList.remove("hidden");

    gameResult.classList.add("hidden");


    if (currentTest === "memory") {

        memoryGame.classList.remove("hidden");

        attentionGame.classList.add("hidden");

        startMemoryGame();

    } else {

        memoryGame.classList.add("hidden");

        attentionGame.classList.remove("hidden");

        startAttentionGame();
    }
}


/* =========================================
   MEMORY GAME
========================================= */

function startMemoryGame() {

    stopMemoryTimer();

    memoryInputArea.classList.add("hidden");

    memoryAnswerInput.value = "";

    memorySequence.textContent =
        "Get Ready...";


    const sequenceLength =
        Math.min(
            3 + Math.floor(
                (currentLevel - 1) / 5
            ),
            10
        );


    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


    memoryAnswer =
        "";

    for (
        let i = 0;
        i < sequenceLength;
        i++
    ) {

        memoryAnswer +=
            characters[
                Math.floor(
                    Math.random() *
                    characters.length
                )
            ];
    }


    const displayTime =
        Math.max(
            1400,
            3000 -
            currentLevel * 25
        );


    memorySequence.textContent =
        memoryAnswer;


    memoryTimer =
        setTimeout(
            () => {

                memorySequence.textContent =
                    "???";

                memoryInputArea.classList.remove(
                    "hidden"
                );

                memoryAnswerInput.focus();

            },
            displayTime
        );
}


/* =========================================
   MEMORY SUBMIT
========================================= */

memorySubmit.addEventListener(
    "click",
    checkMemoryAnswer
);


memoryAnswerInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            checkMemoryAnswer();
        }
    }
);


function checkMemoryAnswer() {

    const answer =
        memoryAnswerInput
            .value
            .trim()
            .toUpperCase();


    if (!answer) {

        return;
    }


    if (answer === memoryAnswer) {

        const baseScore = 100;

        currentScore =
            baseScore +
            currentLevel * 5;

        finishGame(
            true,
            currentScore
        );

    } else {

        currentScore =
            Math.max(
                20,
                100 -
                currentLevel * 2
            );

        finishGame(
            false,
            currentScore
        );
    }
}


/* =========================================
   ATTENTION GAME
========================================= */

function startAttentionGame() {

    attentionGrid.innerHTML = "";

    const totalItems =
        Math.min(
            9 +
            Math.floor(
                currentLevel / 5
            ),
            20
        );


    const symbols = [
        "●",
        "■",
        "◆",
        "★",
        "▲"
    ];


    const normalSymbol =
        symbols[
            Math.floor(
                Math.random() *
                symbols.length
            )
        ];


    let differentSymbol =
        normalSymbol;


    while (
        differentSymbol === normalSymbol
    ) {

        differentSymbol =
            symbols[
                Math.floor(
                    Math.random() *
                    symbols.length
                )
            ];
    }


    const differentIndex =
        Math.floor(
            Math.random() *
            totalItems
        );


    for (
        let i = 0;
        i < totalItems;
        i++
    ) {

        const item =
            document.createElement("button");

        item.type = "button";

        item.className =
            "attention-item";

        item.textContent =
            i === differentIndex
                ? differentSymbol
                : normalSymbol;


        item.addEventListener(
            "click",
            () => {

                if (
                    i === differentIndex
                ) {

                    currentScore =
                        100 +
                        currentLevel * 5;

                    finishGame(
                        true,
                        currentScore
                    );

                } else {

                    currentScore =
                        25;

                    finishGame(
                        false,
                        currentScore
                    );
                }
            }
        );


        attentionGrid.appendChild(item);
    }
}


/* =========================================
   FINISH GAME
========================================= */

async function finishGame(
    success,
    score
) {

    stopMemoryTimer();

    currentScore = score;

    currentScoreDisplay.textContent =
        score;

    memoryGame.classList.add("hidden");

    attentionGame.classList.add("hidden");

    gameResult.classList.remove("hidden");

    resultScore.textContent =
        score;


    if (success) {

        document.getElementById(
            "resultTitle"
        ).textContent =
            "Level Complete! 🎉";

        resultMessage.textContent =
            "Excellent work. The next level is now unlocked.";

    } else {

        document.getElementById(
            "resultTitle"
        ).textContent =
            "Good Attempt! 💪";

        resultMessage.textContent =
            "Your score has been recorded. Keep training!";
    }


    await saveProgress(
        currentTest,
        currentLevel,
        score
    );


    await loadDashboardProgress();


    nextLevelButton.textContent =
        currentLevel < TOTAL_LEVELS
            ? "Continue →"
            : "Back to Levels";
}


/* =========================================
   SAVE PROGRESS
========================================= */

async function saveProgress(
    test,
    level,
    score
) {

    if (!currentUser) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/api/progress`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        user_id:
                            currentUser.id,

                        test:
                            test,

                        level:
                            level,

                        score:
                            score
                    })
                }
            );


        if (!response.ok) {

            console.error(
                "Progress could not be saved."
            );
        }

    } catch (error) {

        console.error(
            "Save progress error:",
            error
        );
    }
}


/* =========================================
   NEXT LEVEL
========================================= */

nextLevelButton.addEventListener(
    "click",
    () => {

        gameResult.classList.add("hidden");

        if (
            currentLevel < TOTAL_LEVELS
        ) {

            startGame(
                currentLevel + 1
            );

        } else {

            gameScreen.classList.add("hidden");

            levelScreen.classList.remove("hidden");

            renderLevels();
        }
    }
);


/* =========================================
   STOP TIMER
========================================= */

function stopMemoryTimer() {

    if (memoryTimer) {

        clearTimeout(memoryTimer);

        memoryTimer = null;
    }
}


/* =========================================
   RESTORE SESSION
========================================= */

function restoreSession() {

    const savedUser =
        localStorage.getItem(
            "brainlytixUser"
        );


    if (!savedUser) {

        authScreen.classList.remove(
            "hidden"
        );

        mainScreen.classList.add(
            "hidden"
        );

        return;
    }


    try {

        currentUser =
            JSON.parse(savedUser);


        if (
            !currentUser.id ||
            !currentUser.username
        ) {

            throw new Error(
                "Invalid session"
            );
        }


        showMainScreen();

    } catch (error) {

        console.error(error);

        localStorage.removeItem(
            "brainlytixUser"
        );

        authScreen.classList.remove(
            "hidden"
        );

        mainScreen.classList.add(
            "hidden"
        );
    }
}


/* =========================================
   START APPLICATION
========================================= */

restoreSession();