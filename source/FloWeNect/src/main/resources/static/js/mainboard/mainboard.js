/* mainboard.js — 퇴근 확인 + HR 슬라이더 + 근태 모달 */

/* ══ 퇴근 확인 ══ */
document.addEventListener("DOMContentLoaded", () => {
  const outForm = document.querySelector(".mb-attd-out-form");
  if (outForm) {
    outForm.addEventListener("submit", (e) => {
      if (!confirm("퇴근 하시겠습니까?")) e.preventDefault();
    });
  }
});

/* ══ HR 슬라이더 ══ */
(function () {
  'use strict';
  const track = document.getElementById('hrTrack');
  const dots  = document.querySelectorAll('.mb-hr-dot');
  const btnPrev = document.getElementById('hrPrev');
  const btnNext = document.getElementById('hrNext');
  if (!track || !dots.length) return;

  const total = dots.length;
  let current = 0, timer = null;

  function goTo(idx) {
    current = (idx + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function startAuto() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 4500);
  }

  dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); startAuto(); }));
  if (btnPrev) btnPrev.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  if (btnNext) btnNext.addEventListener('click', () => { goTo(current + 1); startAuto(); });

  // 터치 스와이프
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { goTo(diff > 0 ? current + 1 : current - 1); startAuto(); }
  });

  track.closest('.mb-hr-body').addEventListener('mouseenter', () => clearInterval(timer));
  track.closest('.mb-hr-body').addEventListener('mouseleave', startAuto);

  startAuto();
})();

/* ══ 근태 모달 ══ */
let attdLoaded = false;

function mbOpenModal(tab) {
  document.getElementById('attdModal').classList.add('open');
  mbSwitchTab(tab);
  if (!attdLoaded) loadAttdData();
}

function mbCloseModal() {
  document.getElementById('attdModal').classList.remove('open');
}

// 오버레이 클릭시 닫기
document.getElementById('attdModal').addEventListener('click', function(e) {
  if (e.target === this) mbCloseModal();
});

// ESC 닫기
document.addEventListener('keydown', e => { if (e.key === 'Escape') mbCloseModal(); });

function mbSwitchTab(tab) {
  document.querySelectorAll('.mb-modal-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('.mb-tab-panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + tab));
}

/* ── 근태 데이터 AJAX 로드 ── */
function loadAttdData() {
  attdLoaded = true;

  fetch(contextPath + '/attendance/modal-data', {
    headers: { 'X-Requested-With': 'XMLHttpRequest' }
  })
  .then(r => r.json())
  .then(data => {
    renderAttdTable(data.records || []);
    renderAttdStats(data.stats  || {});
  })
  .catch(() => {
    document.getElementById('attdTableBody').innerHTML =
      '<tr><td colspan="5" style="text-align:center;padding:20px;color:#ef4444;">데이터를 불러오지 못했습니다.</td></tr>';
  });
}

const STAT_LABEL = {
  PRESENT:  ['출근',   'present'],
  OFF:      ['퇴근',   'off'],
  LATE:     ['지각',   'late'],
  VACATION: ['연차',   'vacation'],
  ABSENT:   ['결근',   'absent'],
};

function renderAttdTable(records) {
  const tbody = document.getElementById('attdTableBody');
  if (!records.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:#94a3b8;">이번 달 기록이 없습니다.</td></tr>';
    return;
  }
  tbody.innerHTML = records.map(r => {
    const [label, cls] = STAT_LABEL[r.attdStatCd] || [r.attdStatCd || '', 'off'];
    const remark = r.remark ? `<span style="color:#94a3b8">${escHtml(r.remark)}</span>` : '';
    return `<tr>
      <td>${escHtml(r.workDt)}</td>
      <td>${r.inDtm  ? escHtml(r.inDtm.substring(11,19))  : '-'}</td>
      <td>${r.outDtm ? escHtml(r.outDtm.substring(11,19)) : '-'}${r.outAutoYn === 'Y' ? ' <span style="font-size:9px;color:#94a3b8">(자동)</span>' : ''}</td>
      <td>${label ? `<span class="mb-stat-cd mb-stat-cd--${cls}">${label}</span>` : ''}${r.lateYn === 'Y' ? ' <span class="mb-stat-cd mb-stat-cd--late">지각</span>' : ''}</td>
      <td>${remark}</td>
    </tr>`;
  }).join('');
}

function renderAttdStats(s) {
  setText('statWorkDays',  s.workDays   ?? '-');
  setText('statLateDays',  s.lateDays   ?? '-');
  setText('statAbsentDays',s.absentDays ?? '-');
  setText('statAutoOut',   s.autoOutDays ?? '-');
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (!el) return;
  const unit = el.querySelector('span');
  el.childNodes[0].textContent = val + ' ';
  if (unit) el.appendChild(unit);
}

function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function updateClock() {
  const now = new Date();
  
  // 날짜 형식 (2026. 03. 06. 금요일)
  const dateOptions = { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' };
  const dateStr = now.toLocaleDateString('ko-KR', dateOptions);
  
  // 시간 형식 (15:30:05)
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}:${seconds}`;

  const dateEl = document.getElementById('currentDate');
  const timeEl = document.getElementById('currentTime');

  if (dateEl) dateEl.textContent = dateStr;
  if (timeEl) timeEl.textContent = timeStr;
}

// 페이지 로드 시 시작 및 1초마다 갱신
document.addEventListener("DOMContentLoaded", () => {
  updateClock();
  setInterval(updateClock, 1000);
});