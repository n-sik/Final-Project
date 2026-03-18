(function () {
  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  onReady(function () {
    var root = document.querySelector('.aprv-detail-page');
    var ctx = (root && root.dataset && root.dataset.ctx) ? root.dataset.ctx : '';

    var backBtn = document.querySelector('#aprvBackBtn');
    if (backBtn) {
      try {
        backBtn.removeAttribute('disabled');
        backBtn.removeAttribute('aria-disabled');
        backBtn.style.pointerEvents = 'auto';
      } catch (e) {}

      backBtn.addEventListener('click', function () {
        try {
          if (window.history && window.history.length > 1) {
            window.history.back();
            return;
          }
        } catch (e) {}
        window.location.href = (ctx || '') + '/aprv/readList?box=mine';
      });
    }

    var tabs = Array.prototype.slice.call(document.querySelectorAll('.aprv-dtab'));
    var panels = Array.prototype.slice.call(document.querySelectorAll('.aprv-tabpanel'));

    function activateTab(tabEl) {
      var target = tabEl.getAttribute('data-tab');
      if (!target) return;

      tabs.forEach(function (t) {
        t.classList.toggle('is-active', t === tabEl);
      });

      panels.forEach(function (p) {
        p.classList.toggle('is-active', p.id === target);
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        activateTab(tab);
      });
    });

    try {
      document.querySelectorAll('.aprv-top-right a.aprv-btn, .aprv-top-right button.aprv-btn').forEach(function (el) {
        el.removeAttribute('disabled');
        el.removeAttribute('aria-disabled');
        el.style.pointerEvents = 'auto';
      });
    } catch (e) {}

    var reject = document.querySelector('#rejectReason');
    var counter = document.querySelector('#rejectCounter');
    if (reject && counter) {
      var update = function () {
        counter.textContent = String(reject.value.length);
      };
      reject.addEventListener('input', update);
      update();
    }

    var cancelForm = document.querySelector('form[action*="/aprv/remove"]');
    if (cancelForm && typeof Swal !== 'undefined') {
      cancelForm.removeAttribute('onsubmit');
      cancelForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const result = await Swal.fire({
          icon: 'warning',
          title: '문서 취소',
          text: '문서를 취소하시겠습니까?',
          showCancelButton: true,
          confirmButtonText: '취소하기',
          cancelButtonText: '닫기'
        });
        if (result.isConfirmed) {
          cancelForm.submit();
        }
      });
    }
  });
})();
