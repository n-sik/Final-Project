document.addEventListener('DOMContentLoaded', function () {
  let root = document;

  // 1) 리스트 클릭(테이블/카드 공용)
  let clickables = root.querySelectorAll('.aprv-row--clickable[data-href], .aprv-item--clickable[data-href]');
  clickables.forEach(function (el) {
    let go = function () {
      let href = el.getAttribute('data-href');
      if (href) location.href = href;
    };

    el.addEventListener('click', go);
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        go();
      }
    });
  });

  // 2) 문서번호 입력: 숫자만 허용 (서버에서도 파싱 실패 시 무시)
  let aprvNoInput = root.getElementById('aprvNo');
  if (aprvNoInput) {
    let normalize = function () {
      let v = aprvNoInput.value;
      if (!v) return;
      let only = v.replace(/\D/g, '');
      if (only !== v) {
        aprvNoInput.value = only;
      }
    };

    aprvNoInput.addEventListener('input', normalize);
    normalize();
  }


  // 3) 기안 메뉴 사이드바 활성 상태 보정(공통 dashboard.js 수정 없이 화면 전용 처리)
  let syncAprvSidebar = function () {
    let sidebar = root.getElementById('sidebarMenu');
    if (!sidebar) return;

    let currentUrl = new URL(window.location.href);
    let currentPath = currentUrl.pathname;
    let currentBox = currentUrl.searchParams.get('box') || '';

    let selectors = [];
    if (currentPath.endsWith('/aprv/pendingList')) {
      selectors = [
        'a.nav-link[href$="/aprv/pendingList?box=pending"]',
        'a.nav-link[href$="/aprv/readList?box=pending"]',
        'a.nav-link[href*="/aprv/pendingList"]',
        'a.nav-link[href*="/aprv/readList?box=pending"]'
      ];
    } else if (currentPath.endsWith('/aprv/processedList')) {
      selectors = [
        'a.nav-link[href$="/aprv/readList?box=mine"]',
        'a.nav-link[href*="/aprv/readList?box=mine"]'
      ];
    } else if (currentPath.endsWith('/aprv/readList') && currentBox === 'ref') {
      selectors = [
        'a.nav-link[href$="/aprv/readList?box=mine"]',
        'a.nav-link[href*="/aprv/readList?box=mine"]'
      ];
    } else if (currentPath.endsWith('/aprv/readList')) {
      selectors = [
        'a.nav-link[href$="/aprv/readList?box=mine"]',
        'a.nav-link[href*="/aprv/readList?box=mine"]'
      ];
    }

    let target = null;
    selectors.some(function (selector) {
      target = sidebar.querySelector(selector);
      return !!target;
    });

    if (!target) return;

    sidebar.querySelectorAll('.nav-item').forEach(function (item) {
      item.classList.remove('active');
    });
    sidebar.querySelectorAll('a.nav-link').forEach(function (link) {
      link.classList.remove('active');
    });

    target.classList.add('active');
    let subItem = target.closest('.nav-item');
    if (subItem) subItem.classList.add('active');

    let parentCollapse = target.closest('.collapse');
    if (parentCollapse) {
      parentCollapse.classList.add('show');
      let parentLink = document.querySelector('[href="#' + parentCollapse.id + '"]');
      if (parentLink) {
        parentLink.classList.add('active');
        parentLink.setAttribute('aria-expanded', 'true');
        let parentItem = parentLink.closest('.nav-item');
        if (parentItem) parentItem.classList.add('active');
      }
    }
  };

  setTimeout(syncAprvSidebar, 0);

});
