class Level12 {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks;
        this.mosquitoSpeed = 2000; // ms per move
        this.isLightOn = true;
        this.mosquitoInterval = null;
    }

    async init() {
        this.container.innerHTML = `
            <div id="level12-area">
                <h2 class="level-title">Tangkap Nyamuk! 🦟</h2>
                
                <div id="room">
                    <div id="light-switch" class="clickable">💡</div>
                    
                    <div id="mosquito" class="clickable">🦟</div>
                    
                    <div id="hand">👋</div>
                </div>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            #level12-area {
                width: 100%;
                height: 100%;
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                background: linear-gradient(to bottom, #87ceeb, #f0e68c);
                transition: background 0.5s;
            }
            
            #level12-area.dark {
                background: linear-gradient(to bottom, #1a1a2e, #16213e);
            }
            
            .level-title {
                margin-top: 20px;
                color: var(--primary-hover);
                font-size: 1.8rem;
                text-align: center;
                z-index: 100;
            }
            
            #room {
                position: relative;
                width: 90%;
                max-width: 600px;
                height: 450px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 20px;
                margin-top: 20px;
                overflow: hidden;
            }
            
            #light-switch {
                position: absolute;
                top: 20px;
                right: 20px;
                font-size: 3rem;
                cursor: pointer;
                transition: all 0.3s;
                z-index: 50;
                filter: drop-shadow(0 0 20px rgba(255, 255, 0, 0.6));
            }
            
            #light-switch:hover {
                transform: scale(1.1);
            }
            
            #light-switch.off {
                filter: grayscale(100%) opacity(0.3);
            }
            
            #mosquito {
                position: absolute;
                font-size: 2rem;
                cursor: pointer;
                transition: all 0.3s ease-in-out;
                z-index: 10;
                animation: buzz 0.1s infinite;
            }
            
            @keyframes buzz {
                0%, 100% { transform: translate(0, 0) rotate(0deg); }
                25% { transform: translate(-2px, 1px) rotate(-5deg); }
                50% { transform: translate(1px, -1px) rotate(5deg); }
                75% { transform: translate(-1px, -2px) rotate(-3deg); }
            }
            
            #mosquito.flying {
                animation: buzz 0.1s infinite, fly 2s ease-in-out infinite;
            }
            
            @keyframes fly {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            
            #mosquito.landed {
                animation: none;
                cursor: pointer;
                filter: grayscale(50%);
            }
            
            #mosquito.caught {
                animation: squish 0.3s forwards;
            }
            
            @keyframes squish {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.5) rotate(180deg); }
                100% { transform: scale(0); opacity: 0; }
            }
            
            #hand {
                position: absolute;
                font-size: 3rem;
                pointer-events: none;
                opacity: 0;
                z-index: 20;
                transition: opacity 0.2s;
            }
            
            #hand.slapping {
                opacity: 1;
                animation: slap 0.3s;
            }
            
            @keyframes slap {
                0% { transform: scale(0.5) rotate(-20deg); }
                50% { transform: scale(1.2) rotate(0deg); }
                100% { transform: scale(1) rotate(0deg); }
            }
            
            @media (max-width: 600px) {
                #room {
                    height: 350px;
                }
                #mosquito {
                    font-size: 1.5rem;
                }
                #light-switch {
                    font-size: 2rem;
                }
            }
        `;
        this.container.appendChild(style);

        this.setupInteractions();
    }

    setupInteractions() {
        const mosquito = this.container.querySelector('#mosquito');
        const lightSwitch = this.container.querySelector('#light-switch');
        const room = this.container.querySelector('#room');
        const area = this.container.querySelector('#level12-area');
        const hand = this.container.querySelector('#hand');

        // Start mosquito flying
        this.startMosquitoFlying();

        // Light switch
        lightSwitch.addEventListener('click', () => {
            if (this.isWon) return;

            this.isLightOn = !this.isLightOn;

            if (this.isLightOn) {
                // Turn light ON
                lightSwitch.classList.remove('off');
                area.classList.remove('dark');
                this.startMosquitoFlying();
            } else {
                // Turn light OFF
                lightSwitch.classList.add('off');
                area.classList.add('dark');
                this.stopMosquitoFlying();

                // Mosquito lands
                setTimeout(() => {
                    mosquito.classList.remove('flying');
                    mosquito.classList.add('landed');
                }, 500);
            }
        });

        // Try to catch mosquito
        mosquito.addEventListener('click', (e) => {
            if (this.isWon) return;

            // Show hand slap animation
            const rect = mosquito.getBoundingClientRect();
            const roomRect = room.getBoundingClientRect();
            hand.style.left = (rect.left - roomRect.left) + 'px';
            hand.style.top = (rect.top - roomRect.top) + 'px';
            hand.classList.add('slapping');
            setTimeout(() => hand.classList.remove('slapping'), 300);

            if (!this.isLightOn) {
                // Mosquito is landed, can catch it!
                mosquito.classList.add('caught');
                this.win();
            } else {
                // Mosquito is flying, it escapes!
                this.moveMosquitoRandomly();
            }
        });
    }

    startMosquitoFlying() {
        const mosquito = this.container.querySelector('#mosquito');
        mosquito.classList.add('flying');
        mosquito.classList.remove('landed');

        // Move mosquito randomly
        this.mosquitoInterval = setInterval(() => {
            this.moveMosquitoRandomly();
        }, this.mosquitoSpeed);

        // Initial position
        this.moveMosquitoRandomly();
    }

    stopMosquitoFlying() {
        if (this.mosquitoInterval) {
            clearInterval(this.mosquitoInterval);
            this.mosquitoInterval = null;
        }
    }

    moveMosquitoRandomly() {
        const mosquito = this.container.querySelector('#mosquito');
        const room = this.container.querySelector('#room');

        if (!mosquito || !room) return;

        const roomWidth = room.offsetWidth;
        const roomHeight = room.offsetHeight;
        const mosquitoSize = 40; // approximate size

        const maxX = roomWidth - mosquitoSize - 20;
        const maxY = roomHeight - mosquitoSize - 20;

        const randomX = Math.random() * maxX + 10;
        const randomY = Math.random() * maxY + 10;

        mosquito.style.left = randomX + 'px';
        mosquito.style.top = randomY + 'px';
    }

    win() {
        if (this.isWon) return;
        this.isWon = true;

        this.stopMosquitoFlying();

        setTimeout(() => {
            this.callbacks.onWin();
        }, 800);
    }

    destroy() {
        this.stopMosquitoFlying();
    }
}

// Register level
window.game.registerLevel(Level12);
