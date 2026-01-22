class Level4 {
    constructor(container, callbacks) {
        this.container = container;
        this.onWin = callbacks.onWin;
        this.onLose = callbacks.onLose;
        this.fireCount = 4;
    }

    async init() {
        this.container.innerHTML = `
            <div id="level4-area">
                <h2>Which fire is the biggest?</h2>
                <div id="fire-container">
                    <!-- 4 fires of different initial sizes but none is the answer -->
                    <div class="fire draggable" data-size="1" style="left: 20%; top: 30%;">🔥</div>
                    <div class="fire draggable" data-size="1" style="left: 50%; top: 60%;">🔥</div>
                    <div class="fire draggable" data-size="1" style="left: 70%; top: 20%;">🔥</div>
                    <div class="fire draggable" data-size="1" style="left: 30%; top: 70%;">🔥</div>
                </div>
            </div>
        `;

        this.addStyles();
        this.setupInteractions();
    }

    addStyles() {
        if (document.getElementById('l4-style')) return;
        const style = document.createElement('style');
        style.id = 'l4-style';
        style.innerHTML = `
            #level4-area { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; }
            #fire-container {
                width: 100%;
                height: 50vh;
                min-height: 300px;
                position: relative;
            }
            .fire {
                position: absolute;
                font-size: 4rem;
                cursor: grab;
                transition: transform 0.2s, font-size 0.3s;
                user-select: none;
                touch-action: none;
            }
            .fire:active { cursor: grabbing; }

            @media (max-width: 600px) {
                .fire { font-size: 3rem; }
            }
        `;
        this.container.appendChild(style);
    }

    setupInteractions() {
        const fires = document.querySelectorAll('.fire');

        fires.forEach(fire => {
            // Setup Click to check answer
            fire.addEventListener('click', (e) => {
                if (this.fireCount === 1) {
                    this.onWin();
                } else {
                    // Wrong answer feedback
                    e.target.classList.add('shake');
                    setTimeout(() => e.target.classList.remove('shake'), 500);
                    window.game.loseLife(); // Lose heart on wrong click
                }
            });

            // Setup Drag to Merge
            Utils.makeDraggable(fire, {
                keepPosition: true,
                onDragEnd: (draggedEl) => {
                    this.checkCollision(draggedEl);
                }
            });
        });
    }

    checkCollision(draggedEl) {
        const fires = Array.from(document.querySelectorAll('.fire'));
        const rect1 = draggedEl.getBoundingClientRect();

        for (let other of fires) {
            if (other === draggedEl) continue; // Skip self

            const rect2 = other.getBoundingClientRect();

            // Simple overlap check
            const overlap = !(rect1.right < rect2.left ||
                rect1.left > rect2.right ||
                rect1.bottom < rect2.top ||
                rect1.top > rect2.bottom);

            if (overlap) {
                // MERGE!
                this.mergeFires(other, draggedEl);
                break; // One merge at a time
            }
        }
    }

    mergeFires(target, source) {
        // Source absorbed by Target
        const newSize = parseFloat(target.dataset.size) + parseFloat(source.dataset.size);
        target.dataset.size = newSize;

        // Visual growth
        const currentScale = 1 + (newSize * 0.5);
        target.style.transform = `scale(${currentScale})`;

        // Remove source
        source.remove();
        this.fireCount--;

        // Animation popup
        target.classList.add('shake');
        setTimeout(() => target.classList.remove('shake'), 300);
    }
}

window.game.registerLevel(Level4);
