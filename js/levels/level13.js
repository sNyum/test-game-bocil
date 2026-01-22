class Level13 {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks;
        this.mixedEmojis = [];
    }

    async init() {
        this.container.innerHTML = `
            <div id="level13-area">
                <h2 class="level-title">Campur Emoji! 😊</h2>
                <p class="level-hint">Buat emoji yang tepat...</p>
                
                <div id="target-emoji">
                    <div class="label">Target:</div>
                    <div id="target">😐</div>
                </div>
                
                <div id="mixing-bowl">
                    <div id="result-emoji">❓</div>
                </div>
                
                <div id="emoji-shelf">
                    <div class="emoji-item draggable" data-emoji="😊">😊</div>
                    <div class="emoji-item draggable" data-emoji="😢">😢</div>
                    <div class="emoji-item draggable" data-emoji="😡">😡</div>
                </div>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            #level13-area {
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
            
            #target-emoji {
                background: rgba(255, 255, 255, 0.5);
                padding: 20px 40px;
                border-radius: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            
            .label {
                font-size: 1rem;
                font-weight: 700;
                color: var(--text-color);
                opacity: 0.7;
            }
            
            #target {
                font-size: 4rem;
                filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
            }
            
            #mixing-bowl {
                width: 200px;
                height: 200px;
                background: linear-gradient(135deg, #fff 0%, #f0f0f0 100%);
                border: 4px dashed var(--primary-color);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                box-shadow: inset 0 4px 10px rgba(0,0,0,0.1);
                transition: all 0.3s;
            }
            
            #mixing-bowl.mixing {
                animation: shake 0.5s;
                background: linear-gradient(135deg, #ffe5ec 0%, #fff0f6 100%);
            }
            
            #result-emoji {
                font-size: 5rem;
                transition: all 0.3s;
            }
            
            #emoji-shelf {
                display: flex;
                gap: 20px;
                padding: 20px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 20px;
                flex-wrap: wrap;
                justify-content: center;
            }
            
            .emoji-item {
                font-size: 3.5rem;
                cursor: grab;
                transition: all 0.3s;
                filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));
                touch-action: none;
            }
            
            .emoji-item:hover {
                transform: scale(1.1);
            }
            
            .emoji-item.dragging {
                opacity: 0.5;
                transform: scale(1.2);
            }
            
            .emoji-item.used {
                opacity: 0.3;
                pointer-events: none;
            }
            
            @keyframes shake {
                0%, 100% { transform: rotate(0deg); }
                25% { transform: rotate(-5deg); }
                75% { transform: rotate(5deg); }
            }
            
            @media (max-width: 600px) {
                #target {
                    font-size: 3rem;
                }
                #mixing-bowl {
                    width: 150px;
                    height: 150px;
                }
                #result-emoji {
                    font-size: 3.5rem;
                }
                .emoji-item {
                    font-size: 2.5rem;
                }
            }
        `;
        this.container.appendChild(style);

        this.setupInteractions();
    }

    setupInteractions() {
        const bowl = this.container.querySelector('#mixing-bowl');
        const result = this.container.querySelector('#result-emoji');
        const emojiItems = this.container.querySelectorAll('.emoji-item');

        // Make emojis draggable to bowl
        emojiItems.forEach(item => {
            Utils.makeDraggable(item, {
                keepPosition: false,
                getDropTargets: () => [bowl],
                onDrop: (draggedEl, target) => {
                    if (target === bowl) {
                        this.addEmojiToBowl(draggedEl.dataset.emoji, draggedEl);
                    }
                }
            });
        });
    }

    addEmojiToBowl(emoji, element) {
        if (this.isWon) return;

        const bowl = this.container.querySelector('#mixing-bowl');
        const result = this.container.querySelector('#result-emoji');

        // Mark as used
        element.classList.add('used');

        // Add to mixed array
        this.mixedEmojis.push(emoji);

        // Shake animation
        bowl.classList.add('mixing');
        setTimeout(() => bowl.classList.remove('mixing'), 500);

        // Check if we have 2 emojis
        if (this.mixedEmojis.length === 2) {
            setTimeout(() => {
                const mixedResult = this.mixEmojis(this.mixedEmojis[0], this.mixedEmojis[1]);
                result.innerText = mixedResult;

                // Check win condition
                setTimeout(() => {
                    if (mixedResult === '😐') {
                        this.win();
                    } else {
                        // Wrong combination - lose life and reset
                        window.game.loseLife();
                        this.resetBowl();
                    }
                }, 800);
            }, 300);
        } else {
            // Show first emoji
            result.innerText = emoji;
        }
    }

    mixEmojis(emoji1, emoji2) {
        // Define mixing rules
        const combinations = {
            '😊😢': '😐', // Happy + Sad = Neutral (WIN)
            '😢😊': '😐', // Sad + Happy = Neutral (WIN)
            '😊😡': '😤', // Happy + Angry = Frustrated
            '😡😊': '😤',
            '😢😡': '😱', // Sad + Angry = Scared
            '😡😢': '😱',
            '😊😊': '😁', // Happy + Happy = Very Happy
            '😢😢': '😭', // Sad + Sad = Crying
            '😡😡': '🤬', // Angry + Angry = Very Angry
        };

        const key = emoji1 + emoji2;
        return combinations[key] || '❓';
    }

    resetBowl() {
        const result = this.container.querySelector('#result-emoji');
        const emojiItems = this.container.querySelectorAll('.emoji-item');

        // Reset
        this.mixedEmojis = [];
        result.innerText = '❓';

        // Re-enable all emojis
        emojiItems.forEach(item => {
            item.classList.remove('used');
        });
    }

    win() {
        if (this.isWon) return;
        this.isWon = true;

        const result = this.container.querySelector('#result-emoji');
        result.style.transform = 'scale(1.3)';

        setTimeout(() => {
            this.callbacks.onWin();
        }, 1000);
    }

    destroy() {
        // Cleanup
    }
}

// Register level
window.game.registerLevel(Level13);
