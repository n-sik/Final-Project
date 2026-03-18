/* =========================================================
   업무 캘린더 — 간트차트 (순수 JS, FullCalendar 미사용)
   기존 API: GET /work/schedule/api/list
========================================================= */

let allTasks   = [];   // 전체 태스크 원본
let viewMode   = 'month'; // 'month' | 'week'
let currentDate = new Date();

/* ── 상태 색상 ── */
function getBarColor(stat) {
    if (stat === '완료') return '#059669';
    if (stat === '보류') return '#858796';
    if (stat === '긴급') return '#e74a3b';
    return '#3B82F6';
}

function getBadgeStyle(stat) {
    if (stat === '완료') return 'background:#d1fae5;color:#065f46;';
    if (stat === '보류') return 'background:#f3f4f6;color:#374151;';
    if (stat === '긴급') return 'background:#fee2e2;color:#991b1b;';
    return 'background:#e0e7ff;color:#4338ca;';
}

/* ── 날짜 유틸 ── */
function toDate(str) {
    if (!str) return null;
    // new Date("YYYY-MM-DD") 는 UTC 기준으로 파싱 → KST(+9) 환경에서 하루 밀림
    // 로컬 시간 기준으로 직접 파싱해 타임존 버그 방지
    const parts = str.split('T')[0].split('-');
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

function fmt(date) {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function addDays(date, n) {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
}

/* ── 현재 뷰의 시작/종료 날짜 계산 ── */
function getViewRange() {
    if (viewMode === 'month') {
        const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const end   = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        return { start, end };
    } else {
        // 이번 주 월~일
        const day  = currentDate.getDay(); // 0=일
        const diff = day === 0 ? -6 : 1 - day;
        const start = addDays(currentDate, diff);
        const end   = addDays(start, 6);
        return { start, end };
    }
}

/* ── period 라벨 ── */
function getPeriodLabel() {
    const { start, end } = getViewRange();
    if (viewMode === 'month') {
        return `${start.getFullYear()}년 ${start.getMonth() + 1}월`;
    } else {
        return `${fmt(start)} ~ ${fmt(end)}`;
    }
}

/* ── 날짜 헤더 컬럼 배열 생성 ── */
function buildDateColumns() {
    const { start, end } = getViewRange();
    const cols = [];
    let cur = new Date(start);
    while (cur <= end) {
        cols.push(new Date(cur));
        cur = addDays(cur, 1);
    }
    return cols;
}

/* ─────────────────────────────────────────────
   렌더링
───────────────────────────────────────────── */
function render() {
    document.getElementById('periodLabel').textContent = getPeriodLabel();

    const cols  = buildDateColumns();
    const today = fmt(new Date());
    const { start: viewStart, end: viewEnd } = getViewRange();

    // 현재 뷰 범위에 걸친 태스크 필터
    const tasks = allTasks.filter(t => {
        const s = toDate(t.taskStartDtm);
        const e = toDate(t.taskEndDtm) || s;
        return s <= viewEnd && e >= viewStart;
    });

    /* ── 타임라인 헤더 ── */
    const headerEl = document.getElementById('ganttTimelineHeader');
    headerEl.innerHTML = '';

    // 월뷰: 요일 약칭 표시 / 주뷰: 날짜+요일
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    cols.forEach(d => {
        const cell = document.createElement('div');
        cell.className = 'gantt-th';
        if (fmt(d) === today) cell.classList.add('today');
        if (d.getDay() === 0) cell.classList.add('sun');
        if (d.getDay() === 6) cell.classList.add('sat');

        if (viewMode === 'month') {
            cell.innerHTML = `<span class="th-day">${d.getDate()}</span><span class="th-dow">${dayNames[d.getDay()]}</span>`;
        } else {
            cell.innerHTML = `<span class="th-day">${d.getDate()}</span><span class="th-dow">${dayNames[d.getDay()]}</span>`;
        }
        headerEl.appendChild(cell);
    });

    /* ── 좌측 행 이름 & 타임라인 행 ── */
    const leftRows     = document.getElementById('ganttLeftRows');
    const timelineRows = document.getElementById('ganttTimelineRows');
    leftRows.innerHTML     = '';
    timelineRows.innerHTML = '';

    if (tasks.length === 0) {
        leftRows.innerHTML = '<div class="gantt-empty">이 기간에 등록된 업무가 없습니다.</div>';
        return;
    }

    tasks.forEach((task, idx) => {
        const taskStart = toDate(task.taskStartDtm);
        const taskEnd   = toDate(task.taskEndDtm) || taskStart;
        const color     = getBarColor(task.taskStatCd);

        /* 좌측 이름 셀 */
        const nameCell = document.createElement('div');
        nameCell.className = 'gantt-row-name';
        nameCell.innerHTML = `
            <span class="row-stat-dot" style="background:${color};"></span>
            <span class="row-name-text" title="${task.taskTitle}">${task.taskTitle}</span>
        `;
        nameCell.onclick = () => showDetail(task);
        leftRows.appendChild(nameCell);

        /* 타임라인 행 */
        const row = document.createElement('div');
        row.className = 'gantt-timeline-row';
        if (idx % 2 === 1) row.classList.add('alt');

        cols.forEach(d => {
            const cell = document.createElement('div');
            cell.className = 'gantt-cell';
            if (fmt(d) === today) cell.classList.add('today');
            if (d.getDay() === 0) cell.classList.add('sun');
            if (d.getDay() === 6) cell.classList.add('sat');
            row.appendChild(cell);
        });

        /* 간트 바 (절대 위치) */
        const colW = 100 / cols.length; // %

        // 뷰 범위 내에서 바 시작/끝 인덱스
        const barStartDate = taskStart < viewStart ? viewStart : taskStart;
        const barEndDate   = taskEnd   > viewEnd   ? viewEnd   : taskEnd;

        const startIdx = cols.findIndex(d => fmt(d) === fmt(barStartDate));
        const endIdx   = cols.findIndex(d => fmt(d) === fmt(barEndDate));

        if (startIdx >= 0 && endIdx >= 0) {
            const bar = document.createElement('div');
            bar.className = 'gantt-bar';

            const isOverflowRight = taskEnd > viewEnd;   // 다음달로 넘어감
            const isOverflowLeft  = taskStart < viewStart; // 이전달에서 넘어옴

            // 다음달 넘침 바는 최소 3칸 너비 보장 (››› 가 잘 보이도록)
            const spanCols = endIdx - startIdx + 1;
            const minCols  = isOverflowRight ? Math.max(spanCols, 3) : spanCols;
            // 단, 뷰 범위를 넘지 않도록 clamp
            const safeCols = Math.min(minCols, cols.length - startIdx);

            bar.style.cssText = `
                left: calc(${startIdx} * ${colW}%);
                width: calc(${safeCols} * ${colW}% - 4px);
                background: ${color};
            `;

            if (!isOverflowLeft)  bar.classList.add('bar-start');
            if (!isOverflowRight) bar.classList.add('bar-end');

            bar.innerHTML = `<span class="bar-label">${task.taskTitle}</span>`;
            bar.onclick = (e) => { e.stopPropagation(); showDetail(task); };
            row.style.position = 'relative';
            row.appendChild(bar);
        }

        timelineRows.appendChild(row);
    });

    /* ── 좌우 스크롤 동기화 ── */
    syncScroll();
}

function syncScroll() {
    const ganttRight = document.getElementById('ganttRight');
    if (!ganttRight._scrollBound) {
        ganttRight.addEventListener('scroll', () => {
            const leftRows = document.getElementById('ganttLeftRows');
            leftRows.scrollTop = ganttRight.scrollTop;
        });
        ganttRight._scrollBound = true;
    }
}

/* ─────────────────────────────────────────────
   우측 상세 패널
───────────────────────────────────────────── */
function showDetail(task) {
    const empty  = document.getElementById('rightPanelEmpty');
    const detail = document.getElementById('rightPanelDetail');
    empty.style.display  = 'none';
    detail.style.display = 'block';

    const stat  = task.taskStatCd || '진행중';
    const color = getBarColor(stat);
    const badge = getBadgeStyle(stat);

    const s = (task.taskStartDtm || '').split('T')[0];
    const e = (task.taskEndDtm   || '').split('T')[0] || s;

    document.getElementById('detailStat').style.cssText  = badge;
    document.getElementById('detailStat').textContent    = stat;
    document.getElementById('detailTitle').textContent   = task.taskTitle || '';
    document.getElementById('detailRows').innerHTML = `
        <div class="detail-row"><span class="dr-label">담당자</span><span class="dr-val">${task.empNm || '-'}</span></div>
        <div class="detail-row"><span class="dr-label">기간</span><span class="dr-val">${s} ~ ${e}</span></div>
        <div class="detail-row"><span class="dr-label">부서</span><span class="dr-val">${task.deptCd || '-'}</span></div>
    `;
    document.getElementById('detailDesc').innerHTML = (task.taskCn || '상세 내용 없음').replace(/\n/g, '<br>');
}

/* ─────────────────────────────────────────────
   모달 (이벤트 바 클릭 시 기존 로직 유지)
───────────────────────────────────────────── */
function showTaskDetail(task) {
    const modal    = document.getElementById('taskDetailModal');
    const body     = document.getElementById('modalBody');
    const stat     = task.taskStatCd || '진행중';
    const s = (task.taskStartDtm || '').split('T')[0];
    const e = (task.taskEndDtm   || '').split('T')[0] || s;

    body.innerHTML = `
        <div style="margin-bottom:12px;"><strong>업무명:</strong> ${task.taskTitle}</div>
        <div style="margin-bottom:12px;"><strong>기간:</strong> ${s} ~ ${e}</div>
        <div style="margin-bottom:12px;"><strong>담당자:</strong> ${task.empNm || '-'}</div>
        <div style="margin-bottom:12px;"><strong>상태:</strong> ${stat}</div>
        <div style="margin-bottom:8px;"><strong>상세 내용:</strong></div>
        <div style="background:#f8f9fa;padding:14px;border-radius:8px;min-height:80px;border:1px solid #ddd;">
            ${(task.taskCn || '상세 내용 없음').replace(/\n/g, '<br>')}
        </div>
    `;
    modal.style.display = 'block';
}

function closeTaskModal() {
    document.getElementById('taskDetailModal').style.display = 'none';
}

window.onclick = function(e) {
    const modal = document.getElementById('taskDetailModal');
    if (e.target === modal) modal.style.display = 'none';
};

/* ─────────────────────────────────────────────
   데이터 로드 (기존 API 유지)
───────────────────────────────────────────── */
function loadTasks() {
    fetch('/work/schedule/api/list')
        .then(res => res.json())
        .then(data => {
            
            allTasks = (data || []).filter(t => t.taskTitle !== '신규 사원 기본 업무 할당');
            render();
        })
        .catch(err => {
            console.error('데이터 로드 실패:', err);
            allTasks = [];
            render();
        });
}

/* ─────────────────────────────────────────────
   이벤트 바인딩
───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
    // 이전/다음 버튼
    document.getElementById('btnPrev').onclick = () => {
        if (viewMode === 'month') {
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        } else {
            currentDate = addDays(currentDate, -7);
        }
        render();
    };

    document.getElementById('btnNext').onclick = () => {
        if (viewMode === 'month') {
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        } else {
            currentDate = addDays(currentDate, 7);
        }
        render();
    };

    // 월/주 뷰 전환
    document.querySelectorAll('.gantt-view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.gantt-view-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            viewMode = this.dataset.view;
            render();
        });
    });

    loadTasks();
});