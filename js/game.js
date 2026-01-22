class Game {
    constructor() {
        this.currentLevelIndex = 0;
        this.levels = []; // To be populated
        this.lives = 3;

        this.container = document.getElementById('level-container');
        this.startScreen = document.getElementById('start-screen');
        this.currentLevelDisplay = document.getElementById('current-level-display');
        this.livesContainer = document.getElementById('lives-container');
        this.feedbackOverlay = document.getElementById('feedback-overlay');
        this.feedbackMessage = document.getElementById('feedback-message');
        this.nextLevelBtn = document.getElementById('next-level-btn');
        this.retryBtn = document.getElementById('retry-btn');

        this.init();
    }

    resetLives() {
        this.lives = 3;
        this.updateLivesUI();
    }

    updateLivesUI() {
        const hearts = this.livesContainer.querySelectorAll('.heart');
        hearts.forEach((heart, index) => {
            if (index < this.lives) {
                heart.classList.remove('lost');
            } else {
                heart.classList.add('lost');
            }
        });
    }

    loseLife() {
        if (this.lives <= 0) return;
        this.lives--;
        this.updateLivesUI();

        if (this.lives <= 0) {
            this.handleLose();
        }
    }

    init() {
        // Initial UI State
        this.updateHeaderUI(null);

        // Expose helper to clear menu
        this.openLevel = (index) => {
            this.startLevel(index);
        };

        this.nextLevelBtn.addEventListener('click', () => {
            this.nextLevel();
        });

        this.retryBtn.addEventListener('click', () => {
            this.startLevel(this.currentLevelIndex);
        });

        const menuBtn = document.getElementById('menu-btn');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                this.returnToMenu();
            });
        }

        this.initBackground();
    }

    initBackground() {
        setInterval(() => {
            const bubble = document.createElement('div');
            bubble.classList.add('polka-bubble');

            // Random Properties
            const size = Math.random() * 50 + 20; // 20-70px
            const left = Math.random() * 100; // 0-100vw
            const duration = Math.random() * 5 + 5; // 5-10s

            // Random Pastel Colors
            const hue = Math.random() * 360;
            const color = `hsla(${hue}, 80%, 80%, 0.4)`;

            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            bubble.style.left = `${left}vw`;
            bubble.style.bottom = `-100px`; // Start below screen
            bubble.style.backgroundColor = color;
            bubble.style.animationDuration = `${duration}s`;

            document.body.appendChild(bubble); // Append to body, behind game container

            // Cleanup
            setTimeout(() => {
                bubble.remove();
            }, duration * 1000);

        }, 800); // New bubble every 800ms
    }

    registerLevel(levelClass) {
        this.levels.push(levelClass);
    }

    // ... rest of the file

    async startLevel(index) {
        // If index is out of bounds (completed game)
        if (index >= this.levels.length) {
            this.showFeedback("Game Tamat! 🏆", false, false, true); // Special Game Completed state
            return;
        }

        if (index < 0) return;

        this.currentLevelIndex = index;
        this.startScreen.classList.remove('active');
        this.container.classList.add('active');

        // Logic to determine if level has lives
        const hasLives = ![0, 4].includes(index);
        this.updateHeaderUI(index + 1, hasLives);

        // Cleanup old level
        if (this.currentLevelInstance && this.currentLevelInstance.destroy) {
            this.currentLevelInstance.destroy();
        }
        this.container.innerHTML = '';
        this.hideFeedback();

        const LevelClass = this.levels[index];
        this.resetLives(); // Reset lives for new level
        this.currentLevelInstance = new LevelClass(this.container, {
            onWin: () => this.handleWin(),
            onLose: () => this.handleLose()
        });

        await this.currentLevelInstance.init();
    }

    updateHeaderUI(levelNumber, showLives = false) {
        // Update Level Text
        const levelIndicator = document.getElementById('level-indicator');
        if (levelNumber === null) {
            levelIndicator.innerText = "Select Level";
        } else {
            levelIndicator.innerHTML = `Level: <span id="current-level-display">${levelNumber}</span>`;
            // Re-bind display element just in case
            this.currentLevelDisplay = document.getElementById('current-level-display');
        }

        // Update Lives Visibility
        if (showLives) {
            this.livesContainer.style.visibility = 'visible';
        } else {
            this.livesContainer.style.visibility = 'hidden';
        }
    }

    handleWin() {
        // Check if this was the last level
        if (this.currentLevelIndex >= this.levels.length - 1) {
            this.showFeedback("Game Tamat! 🏆", false, false, true);
        } else {
            this.showFeedback("Hebat! 🎉", true);
        }
    }

    handleLose() {
        this.showFeedback("Yah Kalah! 💀", false, true);
    }

    nextLevel() {
        this.startLevel(this.currentLevelIndex + 1);
    }

    returnToMenu() {
        this.hideFeedback();
        this.container.innerHTML = '';
        this.container.classList.remove('active');
        this.startScreen.classList.add('active');
        this.updateHeaderUI(null);
    }

    showFeedback(message, isWin, isRetry = false, isGameCompleted = false) {
        this.feedbackMessage.innerText = message;
        this.feedbackMessage.style.color = (isWin || isGameCompleted) ? '#00f2ff' : '#ff0055';

        this.feedbackOverlay.classList.remove('visible');
        void this.feedbackOverlay.offsetWidth; // trigger reflow
        this.feedbackOverlay.classList.add('visible');

        // Reset Buttons
        this.nextLevelBtn.classList.add('hidden');
        this.retryBtn.classList.add('hidden');
        const menuBtn = document.getElementById('menu-btn');
        if (menuBtn) menuBtn.classList.remove('hidden'); // Always show Menu button

        if (isGameCompleted) {
            // Just Menu button (handled above)
        } else if (isWin) {
            this.nextLevelBtn.classList.remove('hidden');
        } else if (isRetry) {
            this.retryBtn.classList.remove('hidden');
        }
    }

    hideFeedback() {
        this.feedbackOverlay.classList.remove('visible');
    }
}

// Global Game Instance
window.game = new Game();
