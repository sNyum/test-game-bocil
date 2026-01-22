class Level7 {
    constructor(container, callbacks) {
        this.container = container;
        this.onWin = callbacks.onWin;
        this.onLose = callbacks.onLose;
        this.validWords = ['ALMA', 'BUKU', 'LARI', 'SUKA', 'TIGA', 'SATE', 'KOPI', 'BOLA', 'GURU', 'MAMA'];
        // Collect all necessary chars + some decoys
        this.uniqueChars = [...new Set(this.validWords.join('') + 'XYZ')];
    }

    async init() {
        this.container.innerHTML = `
            <div id="level7-area">
                <h2>Cari Kata (4 Huruf)</h2>
                <div id="word-slots">
                    <div class="word-slot" data-index="0"></div>
                    <div class="word-slot" data-index="1"></div>
                    <div class="word-slot" data-index="2"></div>
                    <div class="word-slot" data-index="3"></div>
                </div>
                <div id="bubbles-container">
                    <!-- Bubbles injected here -->
                </div>
                <div id="reset-btn-container">
                    <button id="reset-word">Reset Word</button>
                </div>
            </div>
        `;

        this.addStyles();
        this.spawnBubbles();
        this.setupInteractions();
    }

    spawnBubbles() {
        const container = document.getElementById('bubbles-container');
        // Duplicate letters to ensure we have enough for words like MAMA (2 Ms, 2 As)
        // Let's create a pool: 2 sets of unique chars
        const pool = [...this.uniqueChars, ...this.uniqueChars, 'A', 'M', 'L', 'S', 'K', 'O', 'I', 'U'];

        pool.sort(() => Math.random() - 0.5);

        pool.forEach((char, i) => {
            const bubble = document.createElement('div');
            bubble.className = 'bubble draggable';
            bubble.innerText = char;
            bubble.dataset.char = char;

            // Random start position
            const left = Math.random() * 80 + 5; // 5% to 85%
            const top = Math.random() * 60 + 20; // 20% to 80%

            bubble.style.left = left + '%';
            bubble.style.top = top + '%';

            // Random float animation delay
            bubble.style.animationDelay = (Math.random() * 5) + 's';

            container.appendChild(bubble);
        });
    }

    addStyles() {
        if (document.getElementById('l7-style')) return;
        const style = document.createElement('style');
        style.id = 'l7-style';
        style.innerHTML = `
            #level7-area {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                overflow: hidden;
                position: relative;
            }
            #word-slots {
                display: flex;
                gap: 10px;
                margin-top: 30px;
                z-index: 20;
            }
            .word-slot {
                width: 60px;
                height: 60px;
                border: 3px dashed var(--primary-color);
                border-radius: 10px;
                background: rgba(255,255,255,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2.5rem;
                font-weight: bold;
                color: var(--primary-hover);
            }
            .word-slot.filled {
                border-style: solid;
                background: white;
                animation: popIn 0.3s;
            }
            #bubbles-container {
                flex: 1;
                width: 100%;
                position: relative;
                margin-top: 20px;
            }
            .bubble {
                width: 50px;
                height: 50px;
                background: white;
                border-radius: 50%;
                position: absolute;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                font-weight: bold;
                color: var(--text-color);
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                border: 2px solid var(--secondary-color);
                cursor: grab;
                touch-action: none;
                animation: floatAround 10s infinite alternate ease-in-out;
            }
            .bubble:active { cursor: grabbing; transform: scale(1.1); }
            
            @keyframes floatAround {
                0% { transform: translate(0, 0) rotate(0deg); }
                33% { transform: translate(30px, -50px) rotate(10deg); }
                66% { transform: translate(-20px, 40px) rotate(-10deg); }
                100% { transform: translate(10px, -20px) rotate(5deg); }
            }
            
            @keyframes popIn {
                0% { transform: scale(0); }
                80% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }

            #reset-btn-container {
                margin-bottom: 20px;
                z-index: 20;
            }
            #reset-word {
                padding: 10px 20px;
                font-size: 1rem;
            }

            @media (max-width: 600px) {
                .word-slot { width: 50px; height: 50px; font-size: 2rem; }
                .bubble { width: 45px; height: 45px; font-size: 1.3rem; }
            }
        `;
        this.container.appendChild(style);
    }

    setupInteractions() {
        const bubbles = document.querySelectorAll('.bubble');
        const slots = document.querySelectorAll('.word-slot');

        bubbles.forEach(bubble => {
            Utils.makeDraggable(bubble, {
                keepPosition: false,
                getDropTargets: () => Array.from(document.querySelectorAll('.word-slot')), // Dynamic
                onDragStart: (el) => {
                    el.style.animation = 'none'; // Stop floating
                    el.style.zIndex = '1000';
                },
                onDrop: (draggedEl, target) => {
                    if (target && !target.dataset.filled) {
                        this.fillSlot(target, draggedEl);
                    } else {
                        // Restore animation
                        draggedEl.style.animation = 'floatAround 10s infinite alternate ease-in-out';
                        draggedEl.style.zIndex = '';
                        draggedEl.style.animationDelay = (Math.random() * 5) + 's';
                    }
                },
                onDragEnd: (el) => {
                    if (el.style.display !== 'none') el.style.zIndex = '';
                }
            });
        });

        document.getElementById('reset-word').addEventListener('click', () => {
            this.resetSlots();
        });
    }

    fillSlot(slot, bubble) {
        // "Snap" content to slot
        slot.innerText = bubble.innerText;
        slot.classList.add('filled');
        slot.dataset.filled = "true";

        // Hide bubble temporarily (or permanently until reset)
        bubble.style.display = 'none';

        this.checkWin();
    }

    resetSlots() {
        const slots = document.querySelectorAll('.word-slot');
        slots.forEach(s => {
            s.innerText = '';
            s.classList.remove('filled');
            delete s.dataset.filled;
        });

        // Show all bubbles again
        const bubbles = document.querySelectorAll('.bubble');
        bubbles.forEach(b => b.style.display = 'flex');
    }

    checkWin() {
        const slots = Array.from(document.querySelectorAll('.word-slot'));
        const word = slots.map(s => s.innerText).join('');

        if (word.length === 4) {
            if (this.validWords.includes(word)) {
                // WIN
                slots.forEach(s => {
                    s.style.borderColor = '#00e676';
                    s.style.color = '#00e676';
                    s.classList.add('shake');
                });

                setTimeout(() => {
                    this.onWin();
                }, 1000);
            } else {
                // WRONG - Shake, Lose Life, and Reset
                window.game.loseLife();

                slots.forEach(s => {
                    s.style.borderColor = '#ff1744';
                    s.classList.add('shake');
                });

                setTimeout(() => {
                    slots.forEach(s => {
                        s.classList.remove('shake');
                        s.style.borderColor = ''; // Reset border
                    });

                    // Reset Logic or just let user click reset? 
                    // Let's Auto-Reset for convenience after a short delay
                    this.resetSlots();
                }, 800);
            }
        }
    }
}

window.game.registerLevel(Level7);
