class Game {
    constructor() {
        this.currentLevelIndex = 0;
        this.levels = []; // To be populated
        this.container = document.getElementById('level-container');
        this.startScreen = document.getElementById('start-screen');
        this.currentLevelDisplay = document.getElementById('current-level-display');
        this.feedbackOverlay = document.getElementById('feedback-overlay');
        this.feedbackMessage = document.getElementById('feedback-message');
        this.nextLevelBtn = document.getElementById('next-level-btn');
        this.retryBtn = document.getElementById('retry-btn');

        this.init();
    }

    init() {
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startScreen.classList.remove('active');
            this.container.classList.add('active');
            this.startLevel(0);
        });

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
        this.currentLevelIndex = index;
        this.currentLevelDisplay.innerText = index + 1;

        // Cleanup old level
        this.container.innerHTML = '';
        this.hideFeedback();

        if (index >= this.levels.length) {
            this.showFeedback("You Beat the Game!", false);
            return;
        }

        const LevelClass = this.levels[index];
        this.currentLevelInstance = new LevelClass(this.container, {
            onWin: () => this.handleWin(),
            onLose: () => this.handleLose()
        });

        await this.currentLevelInstance.init();
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
