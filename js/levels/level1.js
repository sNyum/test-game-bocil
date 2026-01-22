class Level1 {
    constructor(container, callbacks) {
        this.container = container;
        this.onWin = callbacks.onWin;
        this.onLose = callbacks.onLose;

        // Stats
        this.powerLevel = 1000;
        this.bossPower = 100000;
        this.targetPower = 100100; // Exact target with curr items

        // Item Definitions
        this.items = [
            { id: 'milk', emoji: '🥛', val: 33000, type: 'good' },
            { id: 'egg', emoji: '🥚', val: 33000, type: 'good' },
            { id: 'honey', emoji: '🍯', val: 33100, type: 'good' },
            { id: 'burger', emoji: '🍔', val: -10000, type: 'bad' },
            { id: 'candy', emoji: '🍬', val: -5000, type: 'bad' },
            { id: 'lolly', emoji: '🍭', val: -5000, type: 'bad' }
        ];
    }

    async init() {
        this.container.innerHTML = `
            <div id="level1-area">
                <div id="battle-arena">
                    <div id="boss-container">
                        <div id="boss-stats" class="stats-box red">
                            <span>BOSS POWER</span>
                            <h2 class="big-num shake-constant">${this.formatNum(this.bossPower)}</h2>
                        </div>
                        <div id="boss" class="character">👿</div>
                    </div>
                    
                    <div id="separator">VS</div>

                    <div id="player-container">
                        <div id="hero" class="character draggable">😐</div>
                        <div id="hero-stats" class="stats-box">
                            <span>YOUR POWER</span>
                            <h2 id="hero-power-num" class="big-num">${this.formatNum(this.powerLevel)}</h2>
                        </div>
                    </div>
                </div>

                <div id="items-shelf">
                    <!-- Injected via JS -->
                </div>
            </div>
        `;

        this.renderItems();
        this.addStyles();
        this.setupInteractions();
    }

    formatNum(num) {
        return num.toLocaleString();
    }

    renderItems() {
        const shelf = document.getElementById('items-shelf');
        // Shuffle items so it's not obvious
        const shuffled = [...this.items].sort(() => Math.random() - 0.5);

        shuffled.forEach(item => {
            const el = document.createElement('div');
            el.className = 'item draggable';
            el.innerText = item.emoji;
            el.dataset.val = item.val;
            el.dataset.id = item.id;
            shelf.appendChild(el);
        });
    }

    addStyles() {
        if (document.getElementById('l1-style')) return;
        const style = document.createElement('style');
        style.id = 'l1-style';
        style.innerHTML = `
            #level1-area {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
                width: 100%;
                max-width: 100%;
                overflow-x: hidden;
                overflow-y: auto;
                height: 100%;
                padding-bottom: 20px;
            }
            #battle-arena {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 20px;
                width: 100%;
            }
            .character {
                font-size: 5rem;
                transition: all 0.3s;
                position: relative;
                cursor: grab;
                z-index: 10;
                touch-action: none;
            }
            #boss { transform: scale(1.5); margin-top: 10px; }
            #separator { display: none; font-weight: bold; font-size: 2rem; color: #ff0055; }
            
            .stats-box {
                text-align: center;
                background: rgba(0,0,0,0.5);
                padding: 10px 20px;
                border-radius: 10px;
                border: 2px solid #555;
            }
            .stats-box.red {
                border-color: #ff0055;
                color: #ff0055;
            }
            .big-num {
                font-family: 'Courier New', monospace;
                font-size: 2rem;
                margin-top: 5px;
            }

            #items-shelf {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 20px;
                background: rgba(255,255,255,0.1);
                padding: 20px;
                border-radius: 15px;
                margin-top: 20px;
                width: 95%;
                min-height: 100px;
            }
            .item {
                font-size: 4rem;
                width: 80px;
                height: 80px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: grab;
                transition: transform 0.2s;
                touch-action: none;
            }
            .item:hover { transform: scale(1.1); }

            /* Hero Modes */
            .hero-aura {
                animation: pulseGold 1.5s infinite alternate;
                filter: drop-shadow(0 0 20px #ffd700);
            }

            @media (max-width: 600px) {
                #battle-arena {
                    flex-direction: row; /* Side-by-side on mobile */
                    justify-content: space-around;
                    align-items: center;
                }
                #boss-container, #player-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 45%;
                }
                /* Swap order: Character on top, stats on bottom for hero too */
                #player-container { flex-direction: column-reverse; } 
                #boss-container { flex-direction: column; }

                .character { font-size: 3rem; }
                #boss { transform: scale(1); margin-top: 0; }
                
                #separator { display: block; font-size: 1.5rem; }

                .stats-box { padding: 5px 10px; border-width: 1px; }
                .stats-box span { font-size: 0.7rem; }
                .big-num { font-size: 1.1rem; }

                .item { font-size: 2.5rem; width: 50px; height: 50px; }
                #items-shelf { gap: 10px; padding: 10px; margin-top: 10px; }
            }
        `;
        this.container.appendChild(style);
    }

    setupInteractions() {
        const hero = document.getElementById('hero');
        const boss = document.getElementById('boss');
        const items = document.querySelectorAll('.item');

        // Make items draggable to Hero
        items.forEach(item => {
            Utils.makeDraggable(item, {
                keepPosition: false,
                getDropTargets: () => [hero],
                onDrop: (draggedEl, target) => {
                    if (target === hero) {
                        this.handleItemDrop(draggedEl, hero);
                    }
                }
            });
        });

        // Make Hero draggable to Boss
        Utils.makeDraggable(hero, {
            getDropTargets: () => [boss],
            onDrop: (draggedEl, target) => {
                if (target === boss) {
                    this.fightBoss();
                }
            }
        });
    }

    handleItemDrop(item, hero) {
        const val = parseInt(item.dataset.val);

        // Show change
        this.showFloatingText(hero, val > 0 ? `+${val}` : `${val}`, val > 0 ? '#4caf50' : '#f44336');

        this.powerLevel += val;

        // Update UI
        const numDisplay = document.getElementById('hero-power-num');
        numDisplay.innerText = this.formatNum(this.powerLevel);

        // Trigger generic shake on change
        numDisplay.classList.remove('shake');
        void numDisplay.offsetWidth;
        numDisplay.classList.add('shake');

        this.updateHeroVisuals();

        // Remove item logic (visual consume)
        item.style.transform = 'scale(0)';
        setTimeout(() => item.remove(), 200);
    }

    showFloatingText(target, text, color) {
        const el = document.createElement('div');
        el.className = 'floating-text';
        el.innerText = text;
        el.style.color = color;

        const rect = target.getBoundingClientRect();
        // Position roughly above target center
        // We need to account for container being relative or not?
        // Let's append to body to be safe and use fixed pos or absolute to parent
        // Actually, appending to game-area which is relative is best.

        // However, 'target' is likely in 'player-container'.
        // Let's just append to target's parent for simplicity if it has relative pos (it doesn't explicitly).
        // Safest: Append to game-area and use rect relative to it.
        // Actually simplest: Append to Hero itself if it allows overflow (it might not).

        // Let's append to body and use fixed
        document.body.appendChild(el);
        el.style.left = (rect.left + rect.width / 2 - 30) + 'px';
        el.style.top = (rect.top - 20) + 'px';

        setTimeout(() => el.remove(), 1000);
    }

    updateHeroVisuals() {
        const hero = document.getElementById('hero');
        const numDisplay = document.getElementById('hero-power-num');

        if (this.powerLevel > this.bossPower) {
            hero.innerText = '😎';
            hero.classList.add('gold-aura');
            numDisplay.style.color = '#ffd700'; // Gold text
            hero.style.transform = 'none';
        } else if (this.powerLevel < 1000) {
            hero.innerText = '🤢';
            hero.classList.remove('gold-aura');
            numDisplay.style.color = '#fff';
            hero.style.transform = 'none';
        } else {
            hero.innerText = '😐';
            hero.classList.remove('gold-aura');
            numDisplay.style.color = '#fff';
            hero.style.transform = 'none';
        }
    }

    fightBoss() {
        const hero = document.getElementById('hero');
        const boss = document.getElementById('boss');

        // Animation
        hero.classList.add('shake');
        boss.classList.add('shake');

        setTimeout(() => {
            hero.classList.remove('shake');
            boss.classList.remove('shake');

            if (this.powerLevel > this.bossPower) {
                // WIN
                boss.innerText = '😵';
                boss.style.transform = 'rotate(180deg) scale(0.5)';
                boss.style.opacity = '0.5';

                // Final funny message
                setTimeout(() => this.onWin(), 800);
            } else {
                // LOSE
                hero.innerText = '🤕';
                hero.style.transform = 'scale(0.5) rotate(90deg)';
                this.updateHeroVisuals(); // Might process logic, but visualization override here
                setTimeout(() => this.onLose(), 800);
            }
        }, 600);
    }
}

// Register level
window.game.registerLevel(Level1);
