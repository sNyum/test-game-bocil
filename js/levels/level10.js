class Level10 {
    constructor(container, callbacks) {
        this.container = container;
        this.onWin = callbacks.onWin;
        this.onLose = callbacks.onLose;
        this.completed = false;
        this.raceInterval = null;
        this.isRacing = false;
    }

    async init() {
        this.container.innerHTML = `
            <div id="level10-area">
                <h2>Help Tortoise Win!</h2>
                
                <div id="countdown-overlay" class="hidden">3</div>

                <div id="race-track">
                    <div class="lane" id="lane-tortoise">
                        <div id="you-label">You</div>
                        <div id="tortoise" class="runner">🐢</div>
                    </div>
                    <div class="lane" id="lane-hare">
                        <div id="hare" class="runner">🐇</div>
                    </div>
                    <div id="finish-line">🏁</div>
                </div>

                <div id="hiding-area">
                    <div id="rocket" class="draggable hidden-item">🚀</div>
                    <div id="bush" class="draggable">🌳</div>
                </div>
            </div>
        `;

        this.addStyles();
        this.setupInteractions();
        this.startCountdown();
    }

    addStyles() {
        if (document.getElementById('l10-style')) return;
        const style = document.createElement('style');
        style.id = 'l10-style';
        style.innerHTML = `
            #level10-area {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                position: relative;
                overflow: hidden;
            }
            #race-track {
                width: 90%;
                max-width: 600px;
                height: 200px;
                background: #f0f0f0;
                border: 2px solid #ccc;
                position: relative;
                display: flex;
                flex-direction: column;
                justify-content: space-evenly;
                border-radius: 10px;
                margin-bottom: 20px;
            }
            .lane {
                height: 50%;
                width: 100%;
                position: relative;
                border-bottom: 1px dashed #ccc;
            }
            .lane:last-child {
                border-bottom: none;
            }
            .runner {
                font-size: 3rem;
                position: absolute;
                left: 10px;
                bottom: 10px;
                transition: left 0.1s linear; /* Smooth racing */
                z-index: 10;
            }
            #you-label {
                position: absolute;
                top: -20px;
                left: 10px; /* Moves with runner script */
                font-size: 1rem;
                background: #333;
                color: #fff;
                padding: 2px 5px;
                border-radius: 4px;
                z-index: 20;
            }
            #finish-line {
                position: absolute;
                right: 20px;
                top: 0;
                bottom: 0;
                font-size: 3rem;
                display: flex;
                align-items: center;
                opacity: 0.5;
                z-index: 5;
            }

            #hiding-area {
                width: 100%;
                height: 100px;
                display: flex;
                justify-content: center;
                align-items: center;
                position: relative;
            }
            #bush {
                font-size: 5rem;
                position: absolute;
                z-index: 30;
                cursor: grab;
                touch-action: none;
            }
            #rocket {
                font-size: 3rem;
                position: absolute;
                z-index: 20; /* Behind bush */
                cursor: grab;
                touch-action: none;
            }

            #countdown-overlay {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 8rem;
                color: #ff5252;
                font-weight: bold;
                text-shadow: 2px 2px 0 #fff;
                z-index: 100;
                pointer-events: none;
            }
            .hidden {
                display: none;
            }
            
            @media (max-width: 600px) {
                #race-track { height: 150px; }
                .runner { font-size: 2.5rem; }
            }
        `;
        this.container.appendChild(style);
    }

    setupInteractions() {
        const bush = document.getElementById('bush');
        const rocket = document.getElementById('rocket');
        const tortoise = document.getElementById('tortoise');

        // Bush
        Utils.makeDraggable(bush, { keepPosition: true });

        // Rocket
        Utils.makeDraggable(rocket, {
            keepPosition: true,
            onDragEnd: (el) => {
                if (this.completed) return;

                // Check dist to Tortoise
                if (Utils.isOverlapping(el, tortoise)) {
                    this.boostTortoise();
                    el.style.display = 'none'; // Consume rocket
                }
            }
        });
    }

    startCountdown() {
        this.resetPositions();
        this.isRacing = false;

        const overlay = document.getElementById('countdown-overlay');
        overlay.classList.remove('hidden');

        let count = 3;
        overlay.innerText = count;
        overlay.style.transform = 'translate(-50%, -50%) scale(1)';

        const timer = setInterval(() => {
            count--;
            if (count > 0) {
                overlay.innerText = count;
            } else if (count === 0) {
                overlay.innerText = 'GO!';
            } else {
                clearInterval(timer);
                overlay.classList.add('hidden');
                this.startRace();
            }
        }, 800);
    }

    resetPositions() {
        if (this.raceInterval) clearInterval(this.raceInterval);

        const trackWidth = document.getElementById('race-track').offsetWidth;
        const tortoise = document.getElementById('tortoise');
        const hare = document.getElementById('hare');
        const youLabel = document.getElementById('you-label');

        this.tortoisePos = 10;
        this.harePos = 10;

        tortoise.style.left = this.tortoisePos + 'px';
        hare.style.left = this.harePos + 'px';
        youLabel.style.left = this.tortoisePos + 'px'; // Reset label

        // Reset Rocket if it was used? User might need to find it again?
        // Actually let's keep it simple, if rocket found, it stays found or consumed.
        // If race reset, maybe respawn rocket if not found yet?
        // For now, if rocket consumed, it's gone. If user failed after using rocket, they are stuck?
        // Ah, logic issue: If rocket used but user still lost (unlikely with boost), they need rocket again.
        // So let's respawn rocket on reset.
        const rocket = document.getElementById('rocket');
        rocket.style.display = 'block';
        rocket.style.top = ''; // Reset drag pos?
        rocket.style.left = '';
        rocket.style.transform = 'translate(0,0)';
    }

    startRace() {
        this.isRacing = true;
        this.boosted = false;

        const trackWidth = document.getElementById('race-track').offsetWidth;
        const finishLine = trackWidth - 60; // Approximate

        const tortoise = document.getElementById('tortoise');
        const hare = document.getElementById('hare');
        const youLabel = document.getElementById('you-label');

        this.raceInterval = setInterval(() => {
            if (!this.isRacing) return;

            // Speeds
            let tSpeed = 0.5; // Very slow
            let hSpeed = 1.5; // Fast

            if (this.boosted) tSpeed = 8; // Super fast

            this.tortoisePos += tSpeed;
            this.harePos += hSpeed;

            // Render
            tortoise.style.left = this.tortoisePos + 'px';
            hare.style.left = this.harePos + 'px';

            // Move label with tortoise
            youLabel.style.left = this.tortoisePos + 'px';

            // Check Win/Lose
            if (this.harePos >= finishLine) {
                this.loseRace();
            } else if (this.tortoisePos >= finishLine) {
                this.winRace();
            }

        }, 20); // 50fps
    }

    boostTortoise() {
        if (this.boosted) return;
        this.boosted = true;

        // Visuals
        const tortoise = document.getElementById('tortoise');
        tortoise.innerText = '🐢🚀';
    }

    loseRace() {
        this.isRacing = false;
        clearInterval(this.raceInterval);

        // Penalty
        window.game.loseLife();

        // Feedback
        const hare = document.getElementById('hare');
        hare.innerText = '🐇🏆'; // Hare wins

        setTimeout(() => {
            hare.innerText = '🐇';
            this.startCountdown(); // Restart
        }, 1500);
    }

    winRace() {
        this.isRacing = false;
        this.completed = true;
        clearInterval(this.raceInterval);
        this.onWin();
    }
}

window.game.registerLevel(Level10);
