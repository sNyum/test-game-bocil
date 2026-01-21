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
                    <!-- Slots -->
                    <div class="slot">1</div>
                    <div class="slot">2</div>
                    <div class="slot">3</div>
                    <div class="slot reveal-slot">4</div> <!-- Hidden Answer -->
                    <div class="slot">5</div>

                    <!-- Cars covering slots -->
                    <div class="car draggable" style="left: 10px; top: 10px;">🚗</div>
                    <div class="car draggable" style="left: 110px; top: 10px;">🚙</div>
                    <div class="car draggable" style="left: 210px; top: 10px;">🏎️</div>
                    <div class="car draggable" style="left: 310px; top: 10px;">🚕</div> <!-- Covers 4 -->
                    <div class="car draggable" style="left: 410px; top: 10px;">🚓</div>
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
                width: 90%;
                display: flex;
                position: relative;
                justify-content: center;
                gap: 10px;
                margin-top: 50px;
                height: 200px;
            }
            .slot {
                width: 80px;
                height: 120px;
                border: 2px dashed rgba(255,255,255,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2rem;
                color: rgba(255,255,255,0.5);
                position: absolute; /* Stacked under cars */
                top: 20px;
            }
            /* Position slots manually to match cars */
            .slot:nth-child(1) { left: 10px; }
            .slot:nth-child(2) { left: 110px; }
            .slot:nth-child(3) { left: 210px; }
            .slot:nth-child(4) { left: 310px; }
            .slot:nth-child(5) { left: 410px; }

            .car {
                width: 80px;
                height: 120px;
                font-size: 4rem;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: grab;
                position: absolute; /* Free move */
                z-index: 10;
                transition: transform 0.1s;
            }
            .car:active { cursor: grabbing; }
            
            .reveal-slot {
                cursor: pointer;
                border-color: #00f2ff;
                color: #00f2ff;
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
