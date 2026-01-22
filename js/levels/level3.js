class Level3 {
    constructor(container, callbacks) {
        this.container = container;
        this.onWin = callbacks.onWin;
        this.onLose = callbacks.onLose;
    }

    async init() {
        this.container.innerHTML = `
            <div id="level3-area">
                <h2>Wake up the Owl!</h2>
                <div id="sky" class="day">
                    <div id="sun" class="draggable">☀️</div>
                    <div id="owl-container">
                        <div id="owl">😴</div>
                        <div id="branch">🌿</div>
                    </div>
                </div>
                <div id="alarm" class="draggable">⏰</div>
            </div>
        `;

        this.addStyles();
        this.setupInteractions();
    }

    addStyles() {
        if (document.getElementById('l3-style')) return;
        const style = document.createElement('style');
        style.id = 'l3-style';
        style.innerHTML = `
            #level3-area { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; position: relative; }
            #sky {
                width: 90%;
                height: 40vh;
                min-height: 250px;
                max-height: 400px;
                background: #87CEEB; /* Day blue */
                border-radius: 15px;
                position: relative;
                margin-top: 20px;
                overflow: visible; /* Important: Allow sun to go out */
                transition: background 1s;
                border: 2px solid #fff;
            }
            #sky.night {
                background: #1a1a2e;
            }
            #sun {
                font-size: 5rem;
                position: absolute;
                top: 20px;
                right: 20px;
                cursor: grab;
                transition: transform 0.1s;
                z-index: 10;
                touch-action: none;
            }
            #owl-container {
                position: absolute;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                text-align: center;
                pointer-events: none; /* Let clicks pass to children */
            }
            #owl {
                font-size: 6rem;
                transition: all 0.5s;
                cursor: pointer;
                pointer-events: auto;
            }
            #branch {
                font-size: 4rem;
                margin-top: -30px;
                cursor: pointer;
                pointer-events: auto;
            }
            #alarm {
                font-size: 3rem;
                position: absolute;
                bottom: 20px;
                right: 20px;
                cursor: pointer;
                transition: transform 0.1s;
                touch-action: none;
            }

            /* Mobile Responsiveness */
            @media (max-width: 600px) {
                #sun { font-size: 3.5rem; top: 10px; right: 10px; }
                #owl { font-size: 4.5rem; }
                #branch { font-size: 3rem; margin-top: -20px; }
                #alarm { font-size: 2.5rem; bottom: 10px; right: 10px; }
                #sky { height: 35vh; }
            }        `;
        this.container.appendChild(style);
    }

    setupInteractions() {
        const sun = document.getElementById('sun');
        const sky = document.getElementById('sky');
        const owl = document.getElementById('owl');
        const branch = document.getElementById('branch');
        const alarm = document.getElementById('alarm');

        // Shake Owl and Branch on click
        const shakeElement = (el) => {
            el.classList.add('shake');
            setTimeout(() => el.classList.remove('shake'), 500);
            window.game.loseLife(); // Lose heart on wrong click
        };

        owl.addEventListener('click', () => shakeElement(owl));
        branch.addEventListener('click', () => shakeElement(branch));

        // Decoy Interaction
        alarm.addEventListener('click', () => {
            alarm.classList.add('shake');
            setTimeout(() => alarm.classList.remove('shake'), 500);
            window.game.loseLife(); // Lose heart on alarm click
            // Optional: Add a "Ringing" effect or text
            const ring = document.createElement('div');
            ring.innerText = 'Rringg!!';
            ring.className = 'floating-text';
            ring.style.left = (alarm.offsetLeft) + 'px';
            ring.style.top = (alarm.offsetTop - 30) + 'px';
            ring.style.color = 'red';
            this.container.appendChild(ring);
            setTimeout(() => ring.remove(), 1000);
        });

        Utils.makeDraggable(alarm); // Make it draggable just for fun interaction

        Utils.makeDraggable(sun, {
            keepPosition: true, // Let it stay where user drags it
            onDragEnd: (el) => {
                const rect = el.getBoundingClientRect();
                const skyRect = sky.getBoundingClientRect();

                // If sun is dragged mostly out of the sky box
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                // Check if OUTSIDE sky bounds (with some margin)
                const isOut = (
                    centerX < skyRect.left ||
                    centerX > skyRect.right ||
                    centerY > skyRect.bottom || // Dragged down (most intuitive for sunset)
                    centerY < skyRect.top - 50 // Dragged way up
                );

                if (isOut) {
                    // Start Night Mode
                    sky.classList.add('night');
                    el.style.display = 'none'; // Hide sun

                    // Wake Owl
                    owl.innerText = '🦉';
                    owl.classList.add('shake');

                    setTimeout(() => {
                        this.onWin();
                    }, 1000);
                }
            }
        });
    }
}

window.game.registerLevel(Level3);
