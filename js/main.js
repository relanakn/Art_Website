(() => {
    const gallery      = document.getElementById('gallery');
    const lightbox     = document.getElementById('lightbox');
    const lbImg        = document.getElementById('lightbox-img');
    const lbTitle      = document.getElementById('lightbox-title');
    const lbCat        = document.getElementById('lightbox-cat');
    const btnClose     = document.getElementById('lightbox-close');
    const btnPrev      = document.getElementById('lightbox-prev');
    const btnNext      = document.getElementById('lightbox-next');
    const noResults    = document.getElementById('no-results');
    const filterPills  = document.querySelectorAll('.filter-pill');
    const techCards    = document.querySelectorAll('.technique-card');

    let currentLbIndex = 0;   // index within visible items

    // ─── Helpers ──────────────────────────────────────────────────────
    function allItems() {
        return Array.from(gallery.querySelectorAll('.gallery-item'));
    }

    function visibleItems() {
        return allItems().filter(el => !el.classList.contains('is-hidden'));
    }

    // ─── Filtering ────────────────────────────────────────────────────
    function applyFilter(filter) {
        // Sync active state on pills and technique cards
        filterPills.forEach(p  => p.classList.toggle('active',  p.dataset.filter === filter));
        techCards.forEach(  tc => tc.classList.toggle('active', tc.dataset.filter === filter));

        // Show / hide items
        allItems().forEach(item => {
            const matches = filter === 'all' || item.dataset.category === filter;
            if (matches) {
                item.classList.remove('is-hidden');
                // Fade-in spring pop for appearing items
                item.animate(
                    [{ opacity: 0, transform: 'scale(0.93)' },
                     { opacity: 1, transform: 'scale(1)' }],
                    { duration: 380, easing: 'cubic-bezier(0.22,1,0.36,1)', fill: 'forwards' }
                );
            } else {
                item.classList.add('is-hidden');
            }
        });

        noResults.hidden = visibleItems().length > 0;
    }

    // Filter pill clicks
    filterPills.forEach(pill => {
        pill.addEventListener('click', () => applyFilter(pill.dataset.filter));
    });

    // Technique card clicks → filter + scroll to gallery
    techCards.forEach(card => {
        card.addEventListener('click', () => {
            applyFilter(card.dataset.filter);
            document.getElementById('gallery-section')
                .scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // ─── Lightbox ─────────────────────────────────────────────────────
    function openLightbox(itemEl) {
        const visible = visibleItems();
        currentLbIndex = visible.indexOf(itemEl);
        showImage(currentLbIndex);
        lightbox.setAttribute('aria-hidden', 'false');
        lightbox.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('is-open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        lightbox.addEventListener('transitionend', () => { lbImg.src = ''; }, { once: true });
    }

    function showImage(index) {
        const visible = visibleItems();
        const item    = visible[index];
        if (!item) return;

        const img = item.querySelector('img');
        lbImg.style.transition = 'none';
        lbImg.style.transform  = 'scale(0.93)';
        lbImg.src              = img.src;
        lbImg.alt              = img.alt;
        lbTitle.textContent    = item.dataset.title || '';
        lbCat.textContent      = item.querySelector('.ov-cat')?.textContent || '';

        requestAnimationFrame(() => requestAnimationFrame(() => {
            lbImg.style.transition = 'transform 380ms cubic-bezier(0.34,1.56,0.64,1)';
            lbImg.style.transform  = 'scale(1)';
        }));

        btnPrev.style.visibility = index === 0               ? 'hidden' : 'visible';
        btnNext.style.visibility = index === visible.length - 1 ? 'hidden' : 'visible';
    }

    function goNext() {
        const max = visibleItems().length - 1;
        if (currentLbIndex < max) showImage(++currentLbIndex);
    }

    function goPrev() {
        if (currentLbIndex > 0) showImage(--currentLbIndex);
    }

    // Gallery click → open lightbox
    gallery.addEventListener('click', e => {
        const item = e.target.closest('.gallery-item');
        if (item) openLightbox(item);
    });

    btnClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    btnNext.addEventListener('click', goNext);
    btnPrev.addEventListener('click', goPrev);

    // Keyboard navigation
    document.addEventListener('keydown', e => {
        if (!lightbox.classList.contains('is-open')) return;
        if (e.key === 'Escape')     closeLightbox();
        if (e.key === 'ArrowRight') goNext();
        if (e.key === 'ArrowLeft')  goPrev();
    });

    // Touch swipe
    let touchStartX = 0;
    lightbox.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) < 40) return;
        if (dx < 0) goNext(); else goPrev();
    }, { passive: true });
})();
