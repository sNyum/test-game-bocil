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
    }

    registerLevel(levelClass) {
        this.levels.push(levelClass);
    }

    async startLevel(index) {
        if (index < 0 || index >= this.levels.length) return;
        this.currentLevelIndex = index;

        this.startScreen.classList.remove('active');
        this.container.classList.add('active');

        // Logic to determine if level has lives
        // Level 1 (idx 0) & 5 (idx 4) -> NO lives
        // Others -> YES lives
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
        this.showFeedback("Success!", true);
    }

    handleLose() {
        this.showFeedback("Failed!", false, true);
    }

    nextLevel() {
        this.startLevel(this.currentLevelIndex + 1);
    }

    showFeedback(message, isWin, isRetry = false) {
        this.feedbackMessage.innerText = message;
        this.feedbackMessage.style.color = isWin ? '#00f2ff' : '#ff0055';

        this.feedbackOverlay.classList.remove('visible');
        void this.feedbackOverlay.offsetWidth; // trigger reflow
        this.feedbackOverlay.classList.add('visible');

        if (isWin) {
            this.nextLevelBtn.classList.remove('hidden');
            this.retryBtn.classList.add('hidden');
        } else if (isRetry) {
            this.nextLevelBtn.classList.add('hidden');
            this.retryBtn.classList.remove('hidden');
        } else {
            // End game
            this.nextLevelBtn.classList.add('hidden');
            this.retryBtn.classList.add('hidden');
        }
    }

    hideFeedback() {
        this.feedbackOverlay.classList.remove('visible');
    }
}

// Global Game Instance
window.game = new Game();
