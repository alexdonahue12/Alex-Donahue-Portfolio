/* Fullscreen viewer for case study pages.
   Click (or press Enter on) any image or looping video to open it. Esc, the
   close button, or a click outside the media closes it. Arrow keys, the arrow
   buttons, or a swipe move between the items on the page.
   Videos that have their own player controls (like the Matrix animation) are
   left alone, since a click on them already plays and pauses.
   This file carries its own styles, so it doesn't depend on styles.css. */
(function () {
  var items = Array.prototype.slice.call(
    document.querySelectorAll('.case-hero img, .media img, .media video:not([controls])')
  );
  if (!items.length || typeof HTMLDialogElement === 'undefined') return;

  var css =
    '.case-hero img,.media img,.media video:not([controls]){cursor:zoom-in}' +
    '.viewer{position:fixed;inset:0;width:100vw;height:100vh;height:100dvh;max-width:none;max-height:none;' +
      'margin:0;padding:0;border:0;overflow:hidden;background:#111010;color:#f4ede2}' +
    '.viewer[open]{display:flex;align-items:center;justify-content:center}' +
    '.viewer::backdrop{background:transparent}' +
    /* images: shown at their own size, shrunk to fit with margin around them */
    '.viewer__img{display:block;width:auto;height:auto;max-width:88vw;max-height:84vh;max-height:84dvh;' +
      'object-fit:contain;border-radius:12px;cursor:zoom-out}' +
    /* videos: scaled to fill the same box, letterboxed inside it */
    '.viewer__video{display:block;width:88vw;height:84vh;height:84dvh;object-fit:contain;' +
      'background:transparent;cursor:zoom-out}' +
    '.viewer__btn{position:fixed;display:grid;place-items:center;width:48px;height:48px;padding:0 0 4px;' +
      'border:0;border-radius:50%;background:rgba(244,237,226,.14);color:#f4ede2;font:inherit;' +
      'font-size:32px;line-height:1;cursor:pointer}' +
    '.viewer__btn:hover{background:rgba(244,237,226,.28)}' +
    '.viewer__close{top:16px;right:16px}' +
    '.viewer__nav{top:50%;transform:translateY(-50%)}' +
    '.viewer__prev{left:16px}.viewer__next{right:16px}';
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var dialog = document.createElement('dialog');
  dialog.className = 'viewer';
  dialog.setAttribute('aria-label', 'Media viewer');
  dialog.innerHTML =
    '<button class="viewer__btn viewer__close" type="button" aria-label="Close">&times;</button>' +
    '<button class="viewer__btn viewer__nav viewer__prev" type="button" aria-label="Previous">&#8249;</button>' +
    '<img class="viewer__img" alt="">' +
    '<video class="viewer__video" muted loop playsinline></video>' +
    '<button class="viewer__btn viewer__nav viewer__next" type="button" aria-label="Next">&#8250;</button>';
  document.body.appendChild(dialog);

  var bigImg = dialog.querySelector('.viewer__img');
  var bigVideo = dialog.querySelector('.viewer__video');
  var prev = dialog.querySelector('.viewer__prev');
  var next = dialog.querySelector('.viewer__next');
  var current = 0;
  var opener = null;

  // Set display directly so no other stylesheet can override it
  function setShown(el, shown) {
    el.style.display = shown ? '' : 'none';
  }

  if (items.length < 2) {
    setShown(prev, false);
    setShown(next, false);
  }

  function label(el) {
    return el.alt || el.getAttribute('aria-label') || '';
  }

  function resetVideo() {
    bigVideo.pause();
    bigVideo.removeAttribute('src');
    bigVideo.load();
  }

  function show(i) {
    current = (i + items.length) % items.length;
    var item = items[current];
    if (item.tagName === 'VIDEO') {
      setShown(bigImg, false);
      bigImg.removeAttribute('src');
      setShown(bigVideo, true);
      bigVideo.setAttribute('aria-label', label(item));
      bigVideo.src = item.currentSrc || item.src;
      var start = item.currentTime || 0;
      bigVideo.addEventListener('loadedmetadata', function seek() {
        bigVideo.removeEventListener('loadedmetadata', seek);
        try { bigVideo.currentTime = start; } catch (e) {}
      });
      var p = bigVideo.play();
      if (p && p.catch) p.catch(function () {});
    } else {
      resetVideo();
      setShown(bigVideo, false);
      setShown(bigImg, true);
      bigImg.src = item.currentSrc || item.src;
      bigImg.alt = item.alt;
    }
  }

  function open(i) {
    opener = items[i];
    show(i);
    document.documentElement.style.overflow = 'hidden';
    dialog.showModal();
  }

  dialog.addEventListener('close', function () {
    document.documentElement.style.overflow = '';
    resetVideo();
    bigImg.removeAttribute('src');
    if (opener) opener.focus({ preventScroll: true });
  });

  items.forEach(function (el, i) {
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', 'View larger: ' + label(el));
    el.addEventListener('click', function () { open(i); });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(i);
      }
    });
  });

  dialog.querySelector('.viewer__close').addEventListener('click', function () { dialog.close(); });
  prev.addEventListener('click', function () { show(current - 1); });
  next.addEventListener('click', function () { show(current + 1); });

  // Click anywhere that isn't a button closes the viewer
  dialog.addEventListener('click', function (e) {
    if (!e.target.closest('button')) dialog.close();
  });

  dialog.addEventListener('keydown', function (e) {
    if (items.length < 2) return;
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });

  // Swipe left/right on touch screens
  var startX = null;
  dialog.addEventListener('touchstart', function (e) {
    startX = e.touches[0].clientX;
  }, { passive: true });
  dialog.addEventListener('touchend', function (e) {
    if (startX === null || items.length < 2) return;
    var dx = e.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
  });
})();