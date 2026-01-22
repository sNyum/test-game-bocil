class Level5 {
    constructor(container, callbacks) {
        this.container = container;
        this.onWin = callbacks.onWin;
        this.onLose = callbacks.onLose;
    }

    async init() {
        this.container.innerHTML = `
            <div id="level5-area">
                <h2>Park in the open spot!</h2>
                <div id="parking-lot">
                    <div class="slot-container">
                        <div class="slot">1</div>
                        <div class="car draggable">🚗</div>
                    </div>
                    <div class="slot-container">
                        <div class="slot">2</div>
                        <div class="car draggable">🚙</div>
                    </div>
                    <div class="slot-container">
                        <div class="slot">3</div>
                        <div class="car draggable">🏎️</div>
                    </div>
                    <div class="slot-container">
                        <div class="slot reveal-slot">4</div>
                        <div class="car draggable">🚕</div>
                    </div>
                    <div class="slot-container">
                        <div class="slot">5</div>
                        <div class="car draggable">🚓</div>
                    </div>
                </div>
            </div>
        `;

        this.addStyles();
        this.setupInteractions();
    }

    addStyles() {
        if (document.getElementById('l5-style')) return;
        const style = document.createElement('style');
        style.id = 'l5-style';
        style.innerHTML = `
            #level5-area { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; }
            #parking-lot {
                width: 95%;
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 10px;
                margin-top: 50px;
                min-height: 200px;
                position: relative;
            }
            .slot-container {
                position: relative;
                width: 80px;
                height: 120px;
            }
            .slot {
                width: 100%;
                height: 100%;
                border: 2px dashed rgba(255,255,255,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2rem;
                color: rgba(255,255,255,0.5);
                position: absolute;
                top: 0;
                left: 0;
            }

            .car {
                width: 80px;
                height: 120px;
                font-size: 4rem;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: grab;
                position: absolute; /* Draggable needs absolute usually, but initially lets put them on slots */
                z-index: 10;
                transition: transform 0.1s;
                touch-action: none;
            }
            .car:active { cursor: grabbing; }
            
            .reveal-slot {
                cursor: pointer;
                border-color: #00f2ff;
                color: #00f2ff;
            }

            @media (max-width: 600px) {
                 .slot-container, .slot, .car {
                     width: 60px;
                     height: 90px;
                     font-size: 3rem;
                 }
                 .slot { font-size: 1.5rem; }
            }
        `;
        this.container.appendChild(style);
    }

    setupInteractions() {
        const cars = document.querySelectorAll('.car');
        const correctSlot = document.querySelector('.reveal-slot');

        // Draggable Cars
        cars.forEach(car => {
            Utils.makeDraggable(car, { keepPosition: true });
        });

        // Click Logic
        correctSlot.addEventListener('click', () => {
            // Check if car is overlapping
            // Actually, if user clicks it, it implies it's visible (no car on top blocking click events)
            // But verify no car is covering it visually?
            // "click" events usually don't pass through DOM elements on top unless pointer-events:none
            // Since cars have pointer-events auto (draggable), clicking the slot means the car IS moved.
            this.onWin();
        });
    }
}

window.game.registerLevel(Level5);
