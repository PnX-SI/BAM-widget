let originalViewportContent = '';

function disableZoom() {
    const meta = document.querySelector('meta[name="viewport"]');
    if (!meta) return;

    // Sauvegarde l'état original
    originalViewportContent = meta.getAttribute('content') || '';

    meta.setAttribute(
        'content',
        'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
    );
}

function restoreZoom() {
    const meta = document.querySelector('meta[name="viewport"]');

    if (meta && originalViewportContent) {
        meta.setAttribute('content', originalViewportContent);
    }
}

function preventMultiTouchZoom(e) {
    // Empêche le pinch-to-zoom
    if (e.touches?.length > 1) {
        e.preventDefault();
    }
}

export default {
    mounted(el) {
        // Désactive le zoom pendant le focus
        el.addEventListener('focus', disableZoom);
        el.addEventListener('blur', restoreZoom);

        // Empêche le pinch-to-zoom
        el.addEventListener('touchstart', preventMultiTouchZoom, {
            passive: false,
        });
    },

    unmounted(el) {
        el.removeEventListener('focus', disableZoom);
        el.removeEventListener('blur', restoreZoom);
        el.removeEventListener('touchstart', preventMultiTouchZoom);
    },
};
