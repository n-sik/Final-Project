/* ================================================
   login.js - Flowenect 로그인 페이지 (리뉴얼)
================================================ */

document.addEventListener('DOMContentLoaded', function () {

  const loginForm = document.getElementById('loginForm');
  const loginBtn  = document.getElementById('loginBtn');
  const pwToggle  = document.getElementById('pwToggle');
  const pwInput   = document.getElementById('password');
  const errorMsg  = document.getElementById('errorMsg');
  const logoutMsg = document.getElementById('logoutMsg');

  // ── URL 파라미터 감지 ──
  const params = new URLSearchParams(window.location.search);
  if (params.get('error') !== null)  errorMsg.classList.add('show');
  if (params.get('logout') !== null) logoutMsg.classList.add('show');

  // ── 비밀번호 표시/숨김 ──
  if (pwToggle && pwInput) {
    pwToggle.addEventListener('click', function () {
      const isHidden = pwInput.type === 'password';
      pwInput.type = isHidden ? 'text' : 'password';
      pwToggle.classList.toggle('active', isHidden);
    });
  }

  // ── 폼 제출 ──
  if (loginForm && loginBtn) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const username = document.getElementById('username').value.trim();
      const password = pwInput.value.trim();

      if (!username || !password) {
        showError('사원번호와 비밀번호를 모두 입력해주세요.');
        return;
      }

      errorMsg.classList.remove('show');
      logoutMsg.classList.remove('show');

      loginBtn.classList.add('loading');
      loginBtn.disabled = true;

      setTimeout(function () { loginForm.submit(); }, 500);
    });
  }

  // ── 인풋 포커스 아이콘 연동 ──
  document.querySelectorAll('.input-wrap input').forEach(function (input) {
    const wrap = input.closest('.input-wrap');
    const icon = wrap ? wrap.querySelector('.input-icon') : null;
    input.addEventListener('focus', function () {
      if (icon) icon.style.color = '#4b49ac';
      errorMsg.classList.remove('show');
    });
    input.addEventListener('blur', function () {
      if (icon) icon.style.color = '#c8cbe0';
    });
  });

  // ── ESC로 모달 닫기 ──
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeModal('empModal');
      closeModal('pwModal');
    }
  });

  // ── 에러 표시 함수 ──
  function showError(msg) {
    const textEl = document.getElementById('errorText');
    if (textEl) textEl.textContent = msg;
    errorMsg.classList.remove('show');
    void errorMsg.offsetWidth;
    errorMsg.classList.add('show');
  }

});


/* ══════════════════════════════════════
   모달 공통
══════════════════════════════════════ */

function openModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  // 첫 번째 입력 필드 포커스
  setTimeout(function () {
    const firstInput = overlay.querySelector('.modal-input');
    if (firstInput) firstInput.focus();
  }, 350);
}

function closeModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

function handleOverlayClick(event, id) {
  if (event.target === document.getElementById(id)) {
    closeModal(id);
  }
}


/* ══════════════════════════════════════
   사번 찾기
══════════════════════════════════════ */

function findEmpNo() {
  const name  = document.getElementById('empName').value.trim();
  const email = document.getElementById('empEmail').value.trim();

  if (!name)  { shakeInput('empName');  return; }
  if (!email) { shakeInput('empEmail'); return; }

  const btn = document.querySelector('#empModal .modal-btn');
  setLoadingBtn(btn, true, '조회 중...');

  fetch('/api/member/find-empno', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email })
  })
  .then(function (res) { return res.json(); })
  .then(function (data) {
    setLoadingBtn(btn, false, '사번 조회하기');
    if (data.success) {
      showEmpStep2('success',
        '조회된 사원번호는 <strong>' + data.empNo + '</strong> 입니다.<br>' +
        '로그인 화면에서 해당 사번으로 로그인해 주세요.');
    } else {
      showEmpStep2('error', data.message || '일치하는 사원을 찾을 수 없습니다.');
    }
  })
  .catch(function () {
    setLoadingBtn(btn, false, '사번 조회하기');
    showEmpStep2('error', '조회 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
  });
}

function showEmpStep2(type, html) {
  document.getElementById('empFormStep1').style.display = 'none';
  document.getElementById('empFormStep2').style.display = 'block';

  const result = document.getElementById('empResult');
  result.className = 'modal-result ' + type + ' show';
  result.innerHTML = html;

  // 스텝 인디케이터 업데이트
  document.getElementById('empStep1').className = 'step-dot done';
  document.getElementById('empStep2').className = 'step-dot active';
}

function resetEmpModal() {
  document.getElementById('empName').value  = '';
  document.getElementById('empEmail').value = '';

  document.getElementById('empFormStep1').style.display = 'block';
  document.getElementById('empFormStep2').style.display = 'none';

  document.getElementById('empStep1').className = 'step-dot active';
  document.getElementById('empStep2').className = 'step-dot';

  setTimeout(function () {
    document.getElementById('empName').focus();
  }, 50);
}


/* ══════════════════════════════════════
   비밀번호 찾기
══════════════════════════════════════ */

function findPassword() {
  const empNo = document.getElementById('pwEmpNo').value.trim();
  const name  = document.getElementById('pwName').value.trim();
  const email = document.getElementById('pwEmail').value.trim();

  if (!empNo) { shakeInput('pwEmpNo'); return; }
  if (!name)  { shakeInput('pwName');  return; }
  if (!email) { shakeInput('pwEmail'); return; }

  const btn = document.querySelector('#pwModal .modal-btn');
  setLoadingBtn(btn, true, '발송 중...');

  fetch('/api/member/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ empNo, name, email })
  })
  .then(function (res) { return res.json(); })
  .then(function (data) {
    setLoadingBtn(btn, false, '임시 비밀번호 발송');
    if (data.success) {
      showPwStep2('success',
        '임시 비밀번호가 <strong>' + maskEmail(email) + '</strong> 으로 발송되었습니다.<br>' +
        '로그인 후 반드시 비밀번호를 변경해 주세요.');
    } else {
      showPwStep2('error', data.message || '입력하신 정보와 일치하는 사원을 찾을 수 없습니다.');
    }
  })
  .catch(function () {
    setLoadingBtn(btn, false, '임시 비밀번호 발송');
    showPwStep2('error', '발송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
  });
}

function showPwStep2(type, html) {
  document.getElementById('pwFormStep1').style.display = 'none';
  document.getElementById('pwFormStep2').style.display = 'block';

  const result = document.getElementById('pwResult');
  result.className = 'modal-result ' + type + ' show';
  result.innerHTML = html;

  document.getElementById('pwStep1').className = 'step-dot done';
  document.getElementById('pwStep2').className = 'step-dot active';
}

function resetPwModal() {
  document.getElementById('pwEmpNo').value = '';
  document.getElementById('pwName').value  = '';
  document.getElementById('pwEmail').value = '';

  document.getElementById('pwFormStep1').style.display = 'block';
  document.getElementById('pwFormStep2').style.display = 'none';

  document.getElementById('pwStep1').className = 'step-dot active';
  document.getElementById('pwStep2').className = 'step-dot';

  setTimeout(function () {
    document.getElementById('pwEmpNo').focus();
  }, 50);
}


/* ══════════════════════════════════════
   유틸
══════════════════════════════════════ */

/** 버튼 로딩 상태 토글 */
function setLoadingBtn(btn, loading, defaultText) {
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? defaultText : (btn.dataset.defaultText || defaultText);
  if (!loading) btn.dataset.defaultText = defaultText;
}

/** 인풋 흔들기 애니메이션 */
function shakeInput(inputId) {
  const el = document.getElementById(inputId);
  if (!el) return;
  el.style.animation = 'none';
  el.offsetHeight; // reflow
  el.style.animation = 'shake 0.4s ease';
  el.focus();
  el.addEventListener('animationend', function () {
    el.style.animation = '';
  }, { once: true });
}

/** 이메일 마스킹: abc***@domain.com */
function maskEmail(email) {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const visible = local.substring(0, Math.min(3, local.length));
  return visible + '***@' + domain;
}