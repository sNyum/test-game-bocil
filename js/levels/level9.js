class Level9 {
    constructor(container, callbacks) {
        this.container = container;
        this.onWin = callbacks.onWin;
        this.onLose = callbacks.onLose;
        this.completed = false;
    }

    async init() {
        this.container.innerHTML = `
            <div id="level9-area">
                <h2>Blow out the candle!</h2>
                
                <div id="table-area">
                    <div id="cake-container">
                        <div id="flame" class="flicker">🔥</div>
                        <div id="candle"></div>
                        <div id="cake">🎂</div>
                    </div>
                </div>
                
                <!-- Hiding Spot -->
                <div id="gift-area">
                    <div id="fan-container" class="draggable hidden-item">
                        <div id="fan-icon">💨</div>
                    </div>
                    <div id="gift-box" class="draggable">🎁</div>
                </div>
                
                <div id="decoys">
                    <div class="decoy draggable" style="font-size: 3rem;">🎈</div>
                    <div class="decoy draggable" style="font-size: 3rem;">🎉</div>
                </div>
            </div>
        `;

        this.addStyles();
        this.setupInteractions();
    }

    addStyles() {
        if (document.getElementById('l9-style')) return;
        const style = document.createElement('style');
        style.id = 'l9-style';
        style.innerHTML = `
            #level9-area {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start; /* Start from top */
                padding-top: 50px; /* Space for text */
                position: relative;
            }
            #table-area {
                margin: 50px 0; /* Clear text */
                position: relative;
                z-index: 10;
            }
            #cake-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                position: relative;
            }
            #cake {
                font-size: 6rem;
                z-index: 10;
            }
            #candle {
                width: 10px;
                height: 40px;
                background: linear-gradient(#fff, #eee);
                margin-bottom: -10px; /* Sit on cake */
                z-index: 5;
            }
            #flame {
                font-size: 2.5rem;
                position: absolute;
                top: -50px;
                cursor: pointer;
                transition: opacity 0.5s;
                transform-origin: center bottom;
                z-index: 20; /* Ensure clickable */
            }
            @keyframes flicker {
                0% { transform: scale(1) rotate(-2deg); opacity: 1; }
                50% { transform: scale(1.1) rotate(2deg); opacity: 0.9; }
                100% { transform: scale(1) rotate(-2deg); opacity: 1; }
            }
            .flicker {
                animation: flicker 0.1s infinite alternate;
            }

            #gift-area {
                position: relative;
                width: 100px;
                height: 100px;
                display: flex;
                justify-content: center;
                align-items: center;
                margin-top: 20px;
            }
            #gift-box {
                font-size: 5rem;
                z-index: 30; /* Higher than fan initially */
                cursor: grab;
                position: absolute;
                transition: transform 0.1s;
                touch-action: none;
            }
            #fan-container {
                width: 60px;
                height: 60px;
                z-index: 1; /* Behind gift */
                cursor: grab;
                position: absolute;
                display: flex;
                align-items: center;
                justify-content: center;
                touch-action: none;
            }
            #fan-icon {
                font-size: 4rem;
                pointer-events: none; /* Let clicks pass to container */
            }
            #decoys {
                display: flex;
                gap: 20px;
                margin-top: 30px;
            }
            .decoy {
                cursor: grab;
                touch-action: none;
                z-index: 40;
            }

            /* Fan Animation when blowing */
            @keyframes spinFan {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .spinning {
                animation: spinFan 0.1s linear infinite;
            }

            @media (max-width: 600px) {
                #cake { font-size: 4rem; }
                #gift-box { font-size: 4rem; }
                #flame { font-size: 2rem; top: -40px; }
            }
        `;
        this.container.appendChild(style);
    }

    setupInteractions() {
        const giftBox = document.getElementById('gift-box');
        const fanContainer = document.getElementById('fan-container');
        const fanIcon = document.getElementById('fan-icon');
        const flame = document.getElementById('flame');
        const decoys = document.querySelectorAll('.decoy');

        flame.addEventListener('click', () => {
            if (this.completed) return;
            this.burnItem(null); // Just burn effect/sound
        });

        const checkBurn = (el) => {
            if (this.completed) return;
            if (Utils.isOverlapping(el, flame) || Utils.isOverlapping(el, document.getElementById('cake'))) {
                this.burnItem(el);
            }
        };

        // Gift Box 
        Utils.makeDraggable(giftBox, {
            keepPosition: true,
            onDragEnd: (el) => checkBurn(el)
        });

        // Decoys
        decoys.forEach(d => Utils.makeDraggable(d, {
            keepPosition: true,
            onDragEnd: (el) => checkBurn(el)
        }));

        // Fan (The solution)
        Utils.makeDraggable(fanContainer, {
            keepPosition: true,
            onDragStart: (el) => {
                el.style.zIndex = '100';
                fanIcon.classList.add('spinning');
            },
            onDragEnd: (el) => {
                fanIcon.classList.remove('spinning');
                if (this.completed) return;

                if (Utils.isOverlapping(el, flame) || Utils.isOverlapping(el, document.getElementById('cake'))) {
                    this.win();
                }
            }
        });
    }

    burnItem(el) {
        // Visual feedback for burning
        const flame = document.getElementById('flame');
        flame.innerText = '💥';
        setTimeout(() => flame.innerText = '🔥', 500);

        if (el) {
            el.style.transition = 'transform 0.5s, opacity 0.5s';
            // el.style.transform += ' scale(0)'; // This might fight with drag transform
            // Just fade out
            el.style.opacity = '0';
            setTimeout(() => el.style.display = 'none', 500);
        }

        window.game.loseLife();
    }

    win() {
        this.completed = true;

        const flame = document.getElementById('flame');
        const fanIcon = document.getElementById('fan-icon');

        // Blowing effect
        fanIcon.classList.add('spinning'); // Keep spinning

        // Flame flickers violently then dies
        flame.style.animationDuration = '0.05s';

        setTimeout(() => {
            flame.style.opacity = '0';
            flame.classList.remove('flicker');

            // Smoke
            const smoke = document.createElement('div');
            smoke.innerText = '💨';
            smoke.style.position = 'absolute';
            smoke.style.top = '-50px';
            smoke.style.left = '50%';
            smoke.style.fontSize = '3rem';
            smoke.style.animation = 'floatUp 1s forwards';
            document.getElementById('cake-container').appendChild(smoke);

            setTimeout(() => {
                this.onWin();
            }, 1000);
        }, 1000);
    }
}

window.game.registerLevel(Level9);
