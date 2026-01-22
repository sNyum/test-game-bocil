class Level14 {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks;
        this.scoops = [];
    }

    async init() {
        this.container.innerHTML = `
            <div id="level14-area">
                <h2 class="level-title">Buat Es Krim! 🍦</h2>
                <p class="level-hint">Kombinasi yang tepat...</p>
                
                <div id="target-flavor">
                    <div class="label">Target Rasa:</div>
                    <div id="target">🍓🍌 Strawberry Banana</div>
                </div>
                
                <div id="cone-container">
                    <div id="ice-cream-cone">🍦</div>
                    <div id="scoop-display"></div>
                </div>
                
                <div id="topping-shelf">
                    <div class="topping draggable" data-flavor="strawberry" data-emoji="🍓">🍓</div>
                    <div class="topping draggable" data-flavor="chocolate" data-emoji="🍫">🍫</div>
                    <div class="topping draggable" data-flavor="banana" data-emoji="🍌">🍌</div>
                </div>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            #level14-area {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 20px;
                padding: 20px;
            }
            
            .level-title {
                color: var(--primary-hover);
                font-size: 1.8rem;
                text-align: center;
                margin: 0;
            }
            
            .level-hint {
                color: var(--text-color);
                opacity: 0.8;
                margin: 0;
            }
            
            #target-flavor {
                background: rgba(255, 255, 255, 0.5);
                padding: 15px 30px;
                border-radius: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            
            .label {
                font-size: 0.9rem;
                font-weight: 700;
                color: var(--text-color);
                opacity: 0.7;
            }
            
            #target {
                font-size: 1.5rem;
                font-weight: 600;
                color: var(--primary-color);
            }
            
            #cone-container {
                position: relative;
                width: 200px;
                height: 250px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-end;
            }
            
            #ice-cream-cone {
                font-size: 6rem;
                filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
                z-index: 1;
            }
            
            #scoop-display {
                position: absolute;
                top: 20px;
                display: flex;
                flex-direction: column-reverse;
                align-items: center;
                gap: -20px;
                z-index: 2;
            }
            
            .scoop {
                font-size: 3rem;
                animation: plop 0.3s ease-out;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
            }
            
            @keyframes plop {
                0% { transform: translateY(-50px) scale(0); }
                50% { transform: translateY(0) scale(1.1); }
                100% { transform: translateY(0) scale(1); }
            }
            
            #topping-shelf {
                display: flex;
                gap: 25px;
                padding: 20px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 20px;
                flex-wrap: wrap;
                justify-content: center;
            }
            
            .topping {
                font-size: 4rem;
                cursor: grab;
                transition: all 0.3s;
                filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));
                touch-action: none;
            }
            
            .topping:hover {
                transform: scale(1.1);
            }
            
            .topping.used {
                opacity: 0.3;
                pointer-events: none;
            }
            
            @media (max-width: 600px) {
                #target {
                    font-size: 1.2rem;
                }
                #ice-cream-cone {
                    font-size: 4.5rem;
                }
                .scoop {
                    font-size: 2.5rem;
                }
                .topping {
                    font-size: 3rem;
                }
            }
        `;
        this.container.appendChild(style);

        this.setupInteractions();
    }

    setupInteractions() {
        const cone = this.container.querySelector('#ice-cream-cone');
        const scoopDisplay = this.container.querySelector('#scoop-display');
        const toppings = this.container.querySelectorAll('.topping');

        // Make toppings draggable to cone
        toppings.forEach(topping => {
            Utils.makeDraggable(topping, {
                keepPosition: false,
                getDropTargets: () => [cone],
                onDrop: (draggedEl, target) => {
                    if (target === cone) {
                        this.addScoop(draggedEl.dataset.flavor, draggedEl.dataset.emoji, draggedEl);
                    }
                }
            });
        });
    }

    addScoop(flavor, emoji, element) {
        if (this.isWon) return;

        const scoopDisplay = this.container.querySelector('#scoop-display');

        // Mark as used
        element.classList.add('used');

        // Add scoop to array
        this.scoops.push(flavor);

        // Create scoop element
        const scoop = document.createElement('div');
        scoop.className = 'scoop';
        scoop.innerText = emoji;
        scoopDisplay.appendChild(scoop);

        // Check if we have 2 scoops
        if (this.scoops.length === 2) {
            setTimeout(() => {
                this.checkFlavor();
            }, 500);
        }
    }

    checkFlavor() {
        const flavor1 = this.scoops[0];
        const flavor2 = this.scoops[1];

        // Win condition: Strawberry + Banana (any order)
        if ((flavor1 === 'strawberry' && flavor2 === 'banana') ||
            (flavor1 === 'banana' && flavor2 === 'strawberry')) {
            this.win();
        } else {
            // Wrong combination - lose life and reset
            window.game.loseLife();
            this.resetCone();
        }
    }

    resetCone() {
        const scoopDisplay = this.container.querySelector('#scoop-display');
        const toppings = this.container.querySelectorAll('.topping');

        // Clear scoops
        this.scoops = [];
        scoopDisplay.innerHTML = '';

        // Re-enable all toppings
        toppings.forEach(topping => {
            topping.classList.remove('used');
        });
    }

    win() {
        if (this.isWon) return;
        this.isWon = true;

        const cone = this.container.querySelector('#ice-cream-cone');
        cone.style.transform = 'scale(1.2)';

        setTimeout(() => {
            this.callbacks.onWin();
        }, 1000);
    }

    destroy() {
        // Cleanup
    }
}

// Register level
window.game.registerLevel(Level14);
