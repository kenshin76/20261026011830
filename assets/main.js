/* 제안 요약 — 등장 효과 · 사전 분석 안내 버튼 노출 · 선정 전 소스 분석 안내 팝업 */
(function () {
  'use strict';
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* 등장 효과 */
  if (hasIO && !reduce) {
    doc.classList.add('js');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    document.querySelectorAll('.rv').forEach(function (el, i) {
      el.style.transitionDelay = Math.min((i % 4) * 60, 180) + 'ms';
      io.observe(el);
    });
    /* 인쇄 · 캡처 대비 안전장치 */
    window.addEventListener('beforeprint', function () { document.querySelectorAll('.rv').forEach(function (el) { el.classList.add('in'); }); });
  }

  /* 중앙 사전 분석 안내 버튼이 화면 밖으로 나가면 상단·떠 있는 버튼을 보여 줌 */
  var main = document.getElementById('protoBtn');
  var top = document.getElementById('topCta');
  var fl = document.getElementById('floatCta');
  var bar = document.querySelector('.top');
  var close = document.querySelector('.close .pbtn');
  var passedMain = false;
  var closeVisible = false;
  function setButtonState(button, on) {
    if (!button) return;
    button.classList.toggle('on', on);
    button.setAttribute('aria-hidden', on ? 'false' : 'true');
    button.tabIndex = on ? 0 : -1;
  }
  function updateButtons() {
    setButtonState(top, passedMain);
    setButtonState(fl, passedMain && !closeVisible);
  }
  updateButtons();
  if (main && hasIO) {
    var ctaObserver = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.target === main) passedMain = !e.isIntersecting && e.boundingClientRect.top < 0;
        if (e.target === close) closeVisible = e.isIntersecting;
      });
      updateButtons();
    });
    ctaObserver.observe(main);
    if (close) ctaObserver.observe(close);
  }

  /* 펼쳐 보기 — 인쇄 시 모두 펼침, 주소의 #으로 들어오면 해당 항목 펼침 */
  var accs = document.querySelectorAll('details.acc');
  window.addEventListener('beforeprint', function () { accs.forEach(function (d) { d.open = true; }); });
  function openHash() { var id = location.hash.slice(1); if (!id) return; var el = document.getElementById(id); var d = el && el.closest('details.acc'); if (d) d.open = true; }
  openHash(); window.addEventListener('hashchange', openHash);
  accs.forEach(function (d) { d.addEventListener('toggle', function () { if (d.open) d.querySelectorAll('.rv').forEach(function (el) { el.classList.add('in'); }); }); });
  window.addEventListener('scroll', function () { if (bar) bar.classList.toggle('scrolled', window.scrollY > 8); }, { passive: true });

  /* 사전 분석 안내 버튼 — 요약본의 비밀유지·소스 전달·분석 절차를 팝업으로 안내 */
  var dlg = document.getElementById('demoDlg');
  var ok = document.getElementById('demoOk');
  var opener = null;
  var native = dlg && typeof dlg.showModal === 'function';
  function openDemo(e) {
    opener = e.currentTarget;
    if (!dlg) return;
    if (native) { if (!dlg.open) dlg.showModal(); }
    else { dlg.setAttribute('open', ''); dlg.classList.add('fallback'); }
    if (ok) ok.focus();
  }
  function closeDemo() {
    if (!dlg) return;
    if (native) { if (dlg.open) dlg.close(); }
    else { dlg.removeAttribute('open'); dlg.classList.remove('fallback'); restore(); }
  }
  function restore() {
    if (opener && opener.getAttribute('aria-hidden') !== 'true') opener.focus();
    else if (main) main.focus();
    opener = null;
  }
  document.querySelectorAll('[data-demo]').forEach(function (b) { b.addEventListener('click', openDemo); });
  if (ok) ok.addEventListener('click', closeDemo);
  if (dlg) {
    dlg.addEventListener('close', restore);
    dlg.addEventListener('click', function (e) { if (e.target === dlg) closeDemo(); });
    dlg.addEventListener('keydown', function (e) { if (!native && e.key === 'Escape') closeDemo(); });
  }
})();
