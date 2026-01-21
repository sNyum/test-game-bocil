class Level6 {
    constructor(container, callbacks) {
        this.container = container;
        this.onWin = callbacks.onWin;
        this.onLose = callbacks.onLose;
        this.moleHp = 3;
        this.moleInterval = null;
    }

    async init() {
        this.container.innerHTML = `
            <div id="level6-area">
                <h2>Whack the Mole! (3 Hits)</h2>
                <div id="hole-grid">
                    <div class="hole" data-index="0"><div class="mole hidden">🐹</div></div>
                    <div class="hole" data-index="1"><div class="mole hidden">🐹</div></div>
                    <div class="hole" data-index="2"><div class="mole hidden">🐹</div></div>
                    <div class="hole" data-index="3"><div class="mole hidden">🐹</div></div>
                    <div class="hole" data-index="4"><div class="mole hidden">🐹</div></div>
                    <div class="hole" data-index="5"><div class="mole hidden">🐹</div></div>
                </div>
            </div>
        `;

        this.addStyles();
        this.setupInteractions();
        this.startMoleLoop();
    }

    addStyles() {
        if (document.getElementById('l6-style')) return;
        const style = document.createElement('style');
        style.id = 'l6-style';
        style.innerHTML = `
            #level6-area { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; }
            #hole-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
                margin-top: 30px;
                background: #5d4037;
                padding: 20px;
                border-radius: 20px;
            }
            .hole {
                width: 80px;
                height: 80px;
                background: #3e2723;
                border-radius: 50%;
                position: relative;
                overflow: hidden;
                cursor: pointer;
                border-bottom: 5px solid #fff3;
                box-shadow: inset 0 10px 10px rgba(0,0,0,0.5);
            }
            .mole {
                width: 100%;
                height: 100%;
                font-size: 3.5rem;
                display: flex;
                align-items: center;
                justify-content: center;
                position: absolute;
                top: 5px; /* peek out */
                transition: transform 0.2s, filter 0.2s, opacity 0.2s;
                cursor: crosshair;
                user-select: none;
            }
            .mole.hidden {
                transform: translateY(100%);
            }
            .mole.hit {
                filter: grayscale(100%) brightness(1.5);
                transform: scale(0.9) translateY(0);
            }
        `;
        this.container.appendChild(style);
    }

    setupInteractions() {
        const holes = document.querySelectorAll('.hole');
        holes.forEach(hole => {
            hole.addEventListener('click', (e) => {
                // Check if user clicked the MOLE or the HOLE
                if (e.target.classList.contains('mole') && !e.target.classList.contains('hidden')) {
                    this.hitMole(e.target);
                    e.stopPropagation(); // Prevent hole click
                } else {
                    // Missed! Clicked hole or empty space
                    this.missed();
                    // Visual feedback for miss
                    hole.style.background = '#800';
                    setTimeout(() => hole.style.background = '#3e2723', 200);
                }
            });
        });
    }

    startMoleLoop() {
        this.moveMole();
        // Move every 1.5 seconds initially, speed up maybe? 
        // 1.5s is fair for now.
        this.moleInterval = setInterval(() => {
            this.moveMole();
        }, 1200);
    }

    moveMole() {
        // Hide all moles
        const moles = document.querySelectorAll('.mole');
        moles.forEach(m => m.classList.add('hidden'));

        // Pick random hole
        const holes = document.querySelectorAll('.hole');
        const randomStats = Math.floor(Math.random() * holes.length);
        const activeMole = holes[randomStats].querySelector('.mole');

        // Show mole
        activeMole.classList.remove('hidden');
    }

    hitMole(mole) {
        this.moleHp--;

        // Visual Hit Effect
        mole.innerText = '😵';
        mole.classList.add('hit');

        // Setup fade based on HP
        if (this.moleHp === 2) {
            mole.style.opacity = '0.7';
            setTimeout(() => mole.innerText = '🐹', 200);
        } else if (this.moleHp === 1) {
            mole.style.opacity = '0.4';
            setTimeout(() => mole.innerText = '🐹', 200);
        }

        if (this.moleHp <= 0) {
            mole.innerText = '👻'; // Ghost
            this.destroy(); // Stop loop
            setTimeout(() => this.onWin(), 500);
        } else {
            // Force move after hit to keep it dynamic
            clearInterval(this.moleInterval);
            setTimeout(() => {
                this.moveMole();
                this.moleInterval = setInterval(() => this.moveMole(), 1000); // Speed up slightly on hit
            }, 300);
        }
    }

    missed() {
        window.game.loseLife();
    }

    destroy() {
        if (this.moleInterval) {
            clearInterval(this.moleInterval);
        }
    }
}

window.game.registerLevel(Level6);
