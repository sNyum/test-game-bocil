class Utils {
    /**
     * Checks if two DOM elements overlap
     */
    static isOverlapping(el1, el2) {
        if (!el1 || !el2) return false;

        const rect1 = el1.getBoundingClientRect();
        const rect2 = el2.getBoundingClientRect();

        return !(
            rect1.right < rect2.left ||
            rect1.left > rect2.right ||
            rect1.bottom < rect2.top ||
            rect1.top > rect2.bottom
        );
    }

    /**
     * Makes an element draggable
     * @param {HTMLElement} element 
     * @param {Object} options callbacks: onDragStart, onDragEnd, getDropTargets
     */
    static makeDraggable(element, options = {}) {
        let isDragging = false;
        let startX, startY;
        let initialLeft, initialTop;

        // Touch events
        element.addEventListener('touchstart', handleStart, { passive: false });
        element.addEventListener('touchmove', handleMove, { passive: false });
        element.addEventListener('touchend', handleEnd);

        // Mouse events
        element.addEventListener('mousedown', handleStart);

        function handleStart(e) {
            if (options.disabled) return;

            isDragging = true;
            element.classList.add('dragging');

            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            const rect = element.getBoundingClientRect();
            // Store offset properly relative to the element center or click point if needed
            // For now, let's keep it simple: relative to page

            startX = clientX;
            startY = clientY;

            // To allow absolute positioning movement, we need to ensure the element has some positioning
            const style = window.getComputedStyle(element);

            // If it's static, we might need to change it, but usually we assume CSS handles 'absolute' or 'fixed' 
            // BUT for this simple game, we might be dragging items out of a grid
            // So we might need to set it to fixed/absolute on drag start if it isn't already.

            // Simple approach: Use transform for visual movement, but for "dropping", check rects.
            // Reset transform at start if needed, or accumulate.
            // Let's use transform: translate() for performance.

            element.dataset.translateX = 0;
            element.dataset.translateY = 0;

            if (options.onDragStart) options.onDragStart(element);
        }

        function handleMove(e) {
            if (!isDragging) return;
            e.preventDefault(); // Prevent scrolling on touch

            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            const deltaX = clientX - startX;
            const deltaY = clientY - startY;

            element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        }

        function handleEnd(e) {
            if (!isDragging) return;
            isDragging = false;
            element.classList.remove('dragging');

            // Mouse up listener needs to be removed if added directly to window, 
            // but here we used 'mousedown' on element, so we need to catch 'mouseup' on window to be safe?
            // Actually, for mouse, we usually attach move/up to window during drag.
            // Let's fix that structure below.

            // Check for drop targets
            let droppedOn = null;
            if (options.getDropTargets) {
                const targets = options.getDropTargets();
                for (let target of targets) {
                    if (Utils.isOverlapping(element, target)) {
                        droppedOn = target;
                        break;
                    }
                }
            }

            if (options.onDrop) {
                options.onDrop(element, droppedOn);
            }

            if (options.onDragEnd) {
                options.onDragEnd(element);
            }

            // Reset transform if not consumed/removed
            if (!options.keepPosition) {
                element.style.transform = 'none';
            }
        }

        // Better Mouse Handling
        window.addEventListener('mousemove', (e) => {
            if (isDragging && !e.touches) handleMove(e);
        });
        window.addEventListener('mouseup', (e) => {
            if (isDragging && !e.touches) handleEnd(e);
        });
    }

    // Helper to create elements easily
    static createElement(tag, className, innerHTML) {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (innerHTML) el.innerHTML = innerHTML;
        return el;
    }
}
