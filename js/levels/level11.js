class Level11 {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks;
        this.clickCount = 0;
        this.maxClicks = 10;
    }

    async init() {
        this.container.innerHTML = `
            <div id="level11-area">
                <h2 class="level-title">Matikan Lampu! 💡</h2>
                
                <div id="room">
                    <div id="light-bulb" class="clickable">💡</div>
                    <div id="light-glow"></div>
                    
                    <div id="switch" class="clickable">
                        <div class="switch-plate"></div>
                    </div>
                    
                    <div id="sunglasses" class="draggable">🕶️</div>
                    <div id="eye-target">👁️</div>
                </div>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            #level11-area {
                width: 100%;
                height: 100%;
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                background: linear-gradient(to bottom, #87ceeb, #f0e68c);
                transition: background 0.5s;
            }
            
            #level11-area.dark {
                background: #1a1a1a;
            }
            
            .level-title {
                margin-top: 20px;
                color: var(--primary-hover);
                font-size: 1.8rem;
                text-align: center;
            }
            
            .level-hint {
                color: var(--text-color);
                opacity: 0.8;
                margin-bottom: 20px;
            }
            
            #room {
                position: relative;
                width: 90%;
                max-width: 500px;
                height: 400px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: visible;
            }
            
            #light-bulb {
                font-size: 6rem;
                cursor: pointer;
                position: relative;
                z-index: 10;
                transition: all 0.3s;
                filter: drop-shadow(0 0 30px rgba(255, 255, 0, 0.8));
                animation: flicker 2s infinite;
            }
            
            @keyframes flicker {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.95; }
            }
            
            #light-bulb:hover {
                transform: scale(1.1);
            }
            
            #light-bulb.shaking {
                animation: shake 0.3s;
            }
            
            #light-bulb.broken {
                filter: grayscale(100%) opacity(0.5);
                animation: none;
            }
            
            #light-glow {
                position: absolute;
                width: 300px;
                height: 300px;
                background: radial-gradient(circle, rgba(255, 255, 150, 0.4) 0%, transparent 70%);
                pointer-events: none;
                z-index: 5;
                transition: opacity 0.5s;
            }
            
            #light-glow.off {
                opacity: 0;
            }
            
            #switch {
                position: absolute;
                bottom: 30px;
                right: 30px;
                width: 60px;
                height: 100px;
                background: #ddd;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            }
            
            .switch-plate {
                width: 30px;
                height: 50px;
                background: #888;
                border-radius: 5px;
                position: relative;
            }
            

            
            #sunglasses {
                position: absolute;
                bottom: 30px;
                left: 30px;
                font-size: 3rem;
                cursor: grab;
                transition: transform 0.2s;
            }
            
            #sunglasses:hover {
                transform: scale(1.1);
            }
            
            #eye-target {
                position: absolute;
                top: 30px;
                right: 30px;
                font-size: 3rem;
                opacity: 0.5;
            }
            
            @media (max-width: 600px) {
                #light-bulb {
                    font-size: 4rem;
                }
                #room {
                    height: 300px;
                }
                #sunglasses, #eye-target {
                    font-size: 2rem;
                }
            }
        `;
        this.container.appendChild(style);

        this.setupInteractions();
    }

    setupInteractions() {
        const bulb = this.container.querySelector('#light-bulb');
        const glow = this.container.querySelector('#light-glow');
        const switchEl = this.container.querySelector('#switch');
        const sunglasses = this.container.querySelector('#sunglasses');
        const eyeTarget = this.container.querySelector('#eye-target');
        const area = this.container.querySelector('#level11-area');

        // Solution 1: Click bulb multiple times to break it
        bulb.addEventListener('click', () => {
            if (this.isWon) return;

            this.clickCount++;
            bulb.classList.add('shaking');
            setTimeout(() => bulb.classList.remove('shaking'), 300);

            if (this.clickCount >= this.maxClicks) {
                // Bulb breaks!
                bulb.innerText = '💥';
                bulb.classList.add('broken');
                glow.classList.add('off');

                setTimeout(() => {
                    bulb.innerText = '🔌'; // Broken bulb
                    this.win();
                }, 500);
            }
        });

        // Fake solution: Switch doesn't work
        switchEl.addEventListener('click', () => {
            if (this.isWon) return;
            switchEl.classList.add('shake');
            setTimeout(() => switchEl.classList.remove('shake'), 500);
        });

        // Solution 2: Drag sunglasses to eye
        Utils.makeDraggable(sunglasses, {
            keepPosition: false,
            getDropTargets: () => [eyeTarget],
            onDrop: (draggedEl, target) => {
                if (target === eyeTarget) {
                    // Put on sunglasses = everything goes dark
                    area.classList.add('dark');
                    glow.classList.add('off');
                    sunglasses.style.position = 'absolute';
                    sunglasses.style.top = '30px';
                    sunglasses.style.right = '30px';
                    sunglasses.style.left = 'auto';
                    sunglasses.style.bottom = 'auto';

                    setTimeout(() => {
                        this.win();
                    }, 800);
                }
            }
        });
    }

    win() {
        if (this.isWon) return;
        this.isWon = true;

        setTimeout(() => {
            this.callbacks.onWin();
        }, 500);
    }

    destroy() {
        // Cleanup
    }
}

// Register level
window.game.registerLevel(Level11);
