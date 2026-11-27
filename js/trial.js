/* trial index: first the logo page, then the images as one strip down the page; the list stays put on top
   (it is in the page twice, one copy for the purple and one for over the images: see css/trial.css).
   The image nearest the middle of the window lights the row of its project and sets the count (2/6).
   Left half of the page = one image back, right half = one on; the move is a smooth scroll, like a wheel step. */
(function () {
  var rows = [].slice.call(document.querySelectorAll('.t3 .tr')), np = document.querySelectorAll('.t3 .ov.a .tr').length, pics = [].slice.call(document.querySelectorAll('.t3 .tm > img'));
  var main = document.querySelector('.t3 .tm'), cv = document.querySelector('.t3 .cv'), list = document.querySelector('.t3 .ov.a .tl'), n = pics.length, cur = -1, top = 0;
  if (!main || !n) return;
  document.documentElement.classList.add('t3h');
  var proj = pics.map(function (s) { return +s.dataset.p; }), first = {}, total = {};
  proj.forEach(function (p, k) { if (!(p in first)) first[p] = k; total[p] = (total[p] || 0) + 1; });
  function mid() { return top + (window.innerHeight - top) / 2; }            // middle of the part of the window the images use
  function where() {
    var m = mid(), b = 0, bd = 1e9;
    if (cv) { var c = cv.getBoundingClientRect(); b = -1; bd = Math.abs((c.top + c.bottom) / 2 - window.innerHeight / 2); }   // -1 = the logo page
    for (var k = 0; k < n; k++) { var r = pics[k].getBoundingClientRect(), d = Math.abs((r.top + r.bottom) / 2 - m); if (d < bd) { bd = d; b = k; } }
    return b;
  }
  function show(k) {
    if (k === cur) return; cur = k; var p = k < 0 ? -1 : proj[k];
    rows.forEach(function (r, i) {
      var on = i % np === p; r.classList.toggle('on', on);
      if (on) { var c = r.querySelector('.k'); if (c) c.textContent = (k - first[p] + 1) + '/' + total[p]; }
    });
  }
  function half(e) { return e.clientX < window.innerWidth / 2 ? -1 : 1; }
  main.addEventListener('click', function (e) {
    var k = where() + half(e); if (k < -1 || k > n - 1) return;
    if (k < 0) { if (cv) window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    var r = pics[k].getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + (r.top + r.bottom) / 2 - mid(), behavior: 'smooth' });
  });
  main.addEventListener('mousemove', function (e) { main.style.cursor = half(e) < 0 ? 'w-resize' : 'e-resize'; });
  function fit() {
    var phone = window.matchMedia('(max-width: 700px)').matches;
    top = phone ? Math.round(list.getBoundingClientRect().bottom + 12) : 0;
    var st = document.documentElement.style, r = pics[0].getBoundingClientRect();
    st.setProperty('--lt', top + 'px');
    st.setProperty('--cl', Math.round(r.left) + 'px'); st.setProperty('--cr', Math.round(r.right) + 'px');   // edges of the image column, for the two copies of the text
  }
  rows.forEach(function (r, i) {             // pointing at a row lights it in both copies
    function hv(on) { rows.forEach(function (q, k) { if (k % np === i % np) q.classList.toggle('hv', on); }); }
    r.addEventListener('mouseenter', function () { hv(true); }); r.addEventListener('mouseleave', function () { hv(false); });
  });
  function edge() { document.documentElement.style.setProperty('--ct', Math.max(0, Math.round(pics[0].getBoundingClientRect().top)) + 'px'); }   // where the images start, for the two copies of the text
  window.addEventListener('scroll', function () { edge(); show(where()); }, { passive: true });
  window.addEventListener('resize', function () { fit(); edge(); show(where()); }); fit(); edge(); show(where());
})();
