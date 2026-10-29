(() => {
    const gallery   = document.getElementById('gallery');
    const lightbox  = document.getElementById('lightbox');
    const lbImg     = document.getElementById('lightbox-img');
    const lbTitle   = document.getElementById('lightbox-title');
    const btnClose  = document.getElementById('lightbox-close');
    const btnPrev   = document.getElementById('lightbox-prev');
    const btnNext   = document.getElementById('lightbox-next');

    let items  = [];   // all .gallery-item elements
    let current = 0;   // index of the currently shown image

    // Collect all gallery items once the DOM is ready
    function collectItems() {
        items = Array.from(gallery.querySelectorAll('.gallery-item'));
    }

    // ─── Open lightbox ────────────────────────────────────────────────
    function openLightbox(index) {
        current = index;
        showImage(current);

        lightbox.setAttribute('aria-hidden', 'false');
        lightbox.classList.add('is-open');
        document.body.style.overflow = 'hidden';   // prevent background scroll
    }

    // ─── Close lightbox ───────────────────────────────────────────────
    function closeLightbox() {
        lightbox.classList.remove('is-open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';

        // Clear src after the fade-out transition so the old image doesn't flash
        lightbox.addEventListener('transitionend', () => {
            lbImg.src = '';
        }, { once: true });
    }

    // ─── Swap image (instant swap inside open lightbox) ───────────────
    function showImage(index) {
        const item  = items[index];
        const img   = item.querySelector('img');
        const title = item.dataset.title || '';

        // Micro spring-like pop: scale down → snap to natural size
        lbImg.style.transition = 'none';
        lbImg.style.transform  = 'scale(0.93)';

        lbImg.src   = img.src;
        lbImg.alt   = img.alt;
        lbTitle.textContent = title;

        // One frame later, re-enable the spring transition
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                lbImg.style.transition = 'transform 380ms cubic-bezier(0.34,1.56,0.64,1)';
                lbImg.style.transform  = 'scale(1)';
            });
        });

        // Show/hide arrow buttons at the ends of the gallery
        btnPrev.style.visibility = index === 0              ? 'hidden' : 'visible';
        btnNext.style.visibility = index === items.length - 1 ? 'hidden' : 'visible';
    }

    function goNext() {
        if (current < items.length - 1) showImage(++current);
    }

    function goPrev() {
        if (current > 0) showImage(--current);
    }

    // ─── Event wiring ─────────────────────────────────────────────────

    // Click on any gallery item
    gallery.addEventListener('click', e => {
        const item = e.target.closest('.gallery-item');
        if (!item) return;
        const index = items.indexOf(item);
        if (index !== -1) openLightbox(index);
    });

    // Close button
    btnClose.addEventListener('click', closeLightbox);

    // Click on the dark backdrop (but not on the content)
    lightbox.addEventListener('click', e => {
        if (e.target === lightbox) closeLightbox();
    });

    // Arrow buttons
    btnNext.addEventListener('click', goNext);
    btnPrev.addEventListener('click', goPrev);

    // Keyboard: Escape, ArrowLeft, ArrowRight
    document.addEventListener('keydown', e => {
        if (!lightbox.classList.contains('is-open')) return;
        if (e.key === 'Escape')      closeLightbox();
        if (e.key === 'ArrowRight')  goNext();
        if (e.key === 'ArrowLeft')   goPrev();
    });

    // Touch swipe support (left/right)
    let touchStartX = 0;
    lightbox.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    lightbox.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) < 40) return;   // ignore tiny taps
        if (dx < 0) goNext();
        else        goPrev();
    }, { passive: true });

    // ─── Init ─────────────────────────────────────────────────────────
    collectItems();
})();
