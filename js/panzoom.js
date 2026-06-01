/* panzoom.js — fullscreen image lightbox with pinch/drag/double-tap zoom */
window.App = window.App || {};
(function (A) {
  'use strict';
  let box, img, scale = 1, tx = 0, ty = 0;
  let startDist = 0, startScale = 1, lastX = 0, lastY = 0, panning = false, lastTap = 0;

  function apply() { img.style.transform = `translate(${tx}px,${ty}px) scale(${scale})`; }
  function reset() { scale = 1; tx = 0; ty = 0; apply(); }
  function dist(t) { const dx = t[0].clientX - t[1].clientX, dy = t[0].clientY - t[1].clientY; return Math.hypot(dx, dy); }

  A.lightbox = function (src, alt) {
    if (!src) { A.toast('사진이 없어요'); return; }
    if (!box) {
      box = document.createElement('div'); box.id = 'lightbox';
      box.innerHTML = '<button class="lb-x" aria-label="닫기">✕</button><img alt="">';
      document.body.appendChild(box);
      img = box.querySelector('img');
      box.querySelector('.lb-x').addEventListener('click', A.closeLightbox);
      box.addEventListener('click', (e) => { if (e.target === box) A.closeLightbox(); });
      // touch
      box.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) { startDist = dist(e.touches); startScale = scale; }
        else if (e.touches.length === 1) {
          const now = Date.now();
          if (now - lastTap < 300) { scale = scale > 1 ? 1 : 2.5; if (scale === 1) { tx = ty = 0; } apply(); }
          lastTap = now;
          panning = scale > 1; lastX = e.touches[0].clientX; lastY = e.touches[0].clientY;
        }
      }, { passive: true });
      box.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
          e.preventDefault();
          scale = Math.min(5, Math.max(1, startScale * dist(e.touches) / startDist)); apply();
        } else if (panning && e.touches.length === 1) {
          e.preventDefault();
          tx += e.touches[0].clientX - lastX; ty += e.touches[0].clientY - lastY;
          lastX = e.touches[0].clientX; lastY = e.touches[0].clientY; apply();
        }
      }, { passive: false });
      // desktop wheel + dblclick
      box.addEventListener('wheel', (e) => { e.preventDefault(); scale = Math.min(5, Math.max(1, scale - e.deltaY * 0.002)); if (scale === 1) { tx = ty = 0; } apply(); }, { passive: false });
      img.addEventListener('dblclick', () => { scale = scale > 1 ? 1 : 2.5; if (scale === 1) { tx = ty = 0; } apply(); });
    }
    img.src = src; img.alt = alt || '';
    reset();
    box.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  A.closeLightbox = function () {
    if (box) box.classList.remove('open');
    document.body.style.overflow = '';
  };
})(window.App);
