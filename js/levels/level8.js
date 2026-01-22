class Level8 {
    constructor(container, callbacks) {
        this.container = container;
        this.onWin = callbacks.onWin;
        this.onLose = callbacks.onLose;
        this.colors = []; // current mix in glass
        this.completed = false;
    }

    async init() {
        this.container.innerHTML = `
            <div id="level8-area">
                <h2>Make the liquid GREEN!</h2>
                
                <div id="glass-container">
                    <div id="glass">
                        <div id="liquid"></div>
                    </div>
                </div>

                <div id="bottles-container">
                    <div class="bottle draggable" data-color="red" style="background: #ff5252;">
                        <span class="label">R</span>
                    </div>
                    <div class="bottle draggable" data-color="yellow" style="background: #ffd740;">
                        <span class="label">Y</span>
                    </div>
                    <div class="bottle draggable" data-color="blue" style="background: #448aff;">
                        <span class="label">B</span>
                    </div>
                </div>
            </div>
        `;

        this.addStyles();
        this.setupInteractions();
    }

    addStyles() {
        if (document.getElementById('l8-style')) return;
        const style = document.createElement('style');
        style.id = 'l8-style';
        style.innerHTML = `
            #level8-area {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 30px;
            }
            #glass-container {
                width: 120px;
                height: 160px;
                position: relative;
                margin-bottom: 20px;
            }
            #glass {
                width: 100%;
                height: 100%;
                border: 4px solid rgba(255,255,255,0.8);
                border-top: none;
                border-radius: 0 0 20px 20px;
                background: rgba(255,255,255,0.2);
                position: relative;
                overflow: hidden;
                box-shadow: 0 10px 20px rgba(0,0,0,0.1);
            }
            #liquid {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 0%;
                background: transparent;
                transition: height 0.5s, background 0.5s;
            }

            #bottles-container {
                display: flex;
                gap: 20px;
            }
            .bottle {
                width: 60px;
                height: 100px;
                border-radius: 10px 10px 5px 5px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                cursor: grab;
                position: relative;
                touch-action: none;
                border: 2px solid rgba(0,0,0,0.1);
            }
            .bottle .label {
                font-size: 1.5rem;
                font-weight: bold;
                color: rgba(0,0,0,0.3);
            }
            .bottle::before { /* Cap */
                content: '';
                position: absolute;
                top: -10px;
                width: 30px;
                height: 10px;
                background: #555;
                border-radius: 2px;
            }
            
            .pouring {
                transition: transform 0.2s;
                transform: rotate(45deg);
                z-index: 100;
            }
            
            /* Pouring stream visual (optional, maybe too complex for simple css, we trigger bubbles instead) */

            @media (max-width: 600px) {
                #glass-container { width: 100px; height: 140px; }
                .bottle { width: 50px; height: 80px; }
            }
        `;
        this.container.appendChild(style);
    }

    setupInteractions() {
        const bottles = document.querySelectorAll('.bottle');
        const glass = document.getElementById('glass');
        const liquid = document.getElementById('liquid');

        bottles.forEach(bottle => {
            Utils.makeDraggable(bottle, {
                keepPosition: false, // Return to shelf after pouring
                onDragStart: (el) => {
                    el.style.zIndex = '1000';
                },
                onDragEnd: (el) => {
                    // Check if dropped near glass
                    if (this.completed) return;

                    const glassRect = glass.getBoundingClientRect();
                    const bottleRect = el.getBoundingClientRect();

                    // Simple overlap check
                    if (Utils.isOverlapping(el, glass)) {
                        this.pour(el);
                    }

                    el.style.zIndex = '';
                }
            });
        });
    }

    pour(bottle) {
        if (this.completed) return;

        const color = bottle.dataset.color;
        const liquid = document.getElementById('liquid');

        // Animation
        bottle.classList.add('pouring');
        setTimeout(() => bottle.classList.remove('pouring'), 500);

        // Add color logic
        if (!this.colors.includes(color)) {
            this.colors.push(color);
        }

        // Logic: What happens to the liquid?
        let finalColor = 'transparent';

        // height increase
        let height = this.colors.length * 50;
        if (height > 100) height = 100;
        liquid.style.height = height + '%';

        // Mix logic
        // Mix logic
        const hasRed = this.colors.includes('red');
        const hasBlue = this.colors.includes('blue');
        const hasYellow = this.colors.includes('yellow');

        if (this.colors.length === 1) {
            if (hasRed) finalColor = '#ff5252';
            if (hasBlue) finalColor = '#448aff';
            if (hasYellow) finalColor = '#ffd740';
        } else if (this.colors.length >= 2) {
            if (hasBlue && hasYellow && !hasRed) finalColor = '#00e676'; // Green
            else if (hasRed && hasYellow && !hasBlue) finalColor = '#ff9800'; // Orange
            else if (hasRed && hasBlue && !hasYellow) finalColor = '#9c27b0'; // Purple
            else finalColor = '#5d4037'; // Muddy
        }

        liquid.style.background = finalColor;

        // Check Win/Lose
        setTimeout(() => {
            if (finalColor === '#00e676') {
                this.completed = true;
                this.onWin();
            } else {
                // If 2 colors mixed and NOT Green
                if (this.colors.length >= 2) {
                    window.game.loseLife(); // Lose life on wrong mix

                    const glass = document.getElementById('glass');
                    glass.classList.add('shake');
                    setTimeout(() => {
                        glass.classList.remove('shake');
                        this.reset();
                    }, 800);
                }
                // If only 1 wrong color (e.g. Red), do nothing, just show it.
            }
        }, 600);
    }

    reset() {
        this.colors = [];
        const liquid = document.getElementById('liquid');
        liquid.style.height = '0%';
        liquid.style.background = 'transparent';
    }
}

window.game.registerLevel(Level8);
