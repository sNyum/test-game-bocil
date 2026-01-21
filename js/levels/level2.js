class Level2 {
    constructor(container, callbacks) {
        this.container = container;
        this.onWin = callbacks.onWin;
        this.onLose = callbacks.onLose;
        this.correctCount = 7; // Actual answer
    }

    async init() {
        this.container.innerHTML = `
            <div id="level2-area">
                <h2>How many suns are there?</h2>
                <div id="sky-container">
                    <!-- Visible Suns -->
                    <div class="sun" style="top: 20%; left: 20%;">☀️</div>
                    <div class="sun" style="top: 20%; left: 50%;">☀️</div>
                    <div class="sun" style="top: 50%; left: 30%;">☀️</div>
                    <div class="sun" style="top: 50%; left: 70%;">☀️</div>
                    
                    <!-- Hidden Suns behind clouds - Adjusted positions for better hiding -->
                    <div class="sun hidden-sun" style="top: 32%; left: 42%;">☀️</div>
                    <div class="sun hidden-sun" style="top: 62%; left: 62%;">☀️</div>
                    <div class="sun hidden-sun" style="top: 42%; left: 82%;">☀️</div>

                    <!-- Draggable Clouds - Positioned to center cover -->
                    <div class="cloud draggable" style="top: 25%; left: 35%;">☁️</div>
                    <div class="cloud draggable" style="top: 55%; left: 55%;">☁️</div>
                    <div class="cloud draggable" style="top: 35%; left: 75%;">☁️</div>
                    
                    <!-- Decoys -->
                    <div class="cloud draggable" style="top: 10%; left: 10%;">☁️</div>
                </div>

                <div id="input-area">
                    <input type="number" id="sun-count" placeholder="0" min="0">
                    <button id="submit-answer">Submit</button>
                    <div id="hint-msg"></div>
                </div>
            </div>
        `;

        this.addStyles();
        this.setupInteractions();
    }

    addStyles() {
        if (document.getElementById('l2-style')) return;
        const style = document.createElement('style');
        style.id = 'l2-style';
        style.innerHTML = `
            #level2-area {
                width: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            #sky-container {
                width: 100%;
                height: 300px;
                background: linear-gradient(to bottom, #87CEEB, #E0F7FA);
                border-radius: 15px;
                position: relative;
                overflow: hidden;
                margin: 20px 0;
                border: 2px solid #fff;
            }
            .sun {
                position: absolute;
                font-size: 3rem;
                z-index: 1; /* Lowest */
                /* Animation to make them rotate slightly */
                animation: spin 10s linear infinite;
            }
            .cloud {
                position: absolute;
                font-size: 6rem; /* Bigger clouds */
                z-index: 10; /* Much higher so it covers sun */
                cursor: grab;
                opacity: 1 !important; /* Force opaque */
                filter: drop-shadow(0 5px 15px rgba(0,0,0,0.1));
                /* Better hit area */
                width: 100px;
                height: 80px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            @keyframes spin { 100% { transform: rotate(360deg); } }
            
            #input-area {
                display: flex;
                gap: 10px;
                align-items: center;
            }
            #sun-count {
                padding: 10px;
                border-radius: 5px;
                border: none;
                font-size: 1.2rem;
                width: 80px;
                text-align: center;
            }
            #hint-msg {
                margin-top: 10px;
                font-weight: bold;
                color: #ff0055;
                height: 20px;
            }
        `;
        this.container.appendChild(style);
    }

    setupInteractions() {
        // Clouds
        const clouds = document.querySelectorAll('.cloud');
        clouds.forEach(cloud => {
            Utils.makeDraggable(cloud); // Free drag
        });

        // Submit Logic
        document.getElementById('submit-answer').addEventListener('click', () => {
            const input = document.getElementById('sun-count');
            const val = parseInt(input.value);
            const hint = document.getElementById('hint-msg');

            if (val === this.correctCount) {
                this.onWin();
            } else {
                // Wrong answer logic
                hint.innerText = "Wrong! Look closer...";
                input.classList.add('shake');
                setTimeout(() => input.classList.remove('shake'), 500);
            }
        });
    }
}

// Register level
window.game.registerLevel(Level2);
