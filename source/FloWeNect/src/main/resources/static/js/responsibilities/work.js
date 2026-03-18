window.addEventListener('DOMContentLoaded', function() {
	const today = new Date();
	const oneMonthAgo = new Date();
	oneMonthAgo.setMonth(today.getMonth() - 1);

	function formatDate(date) {
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, '0');
		const d = String(date.getDate()).padStart(2, '0');
		return `${y}-${m}-${d}`;
	}

	const fromInput = document.getElementById('historySearchDateFrom');
	const toInput = document.getElementById('historySearchDateTo');

	if (fromInput) fromInput.value = formatDate(oneMonthAgo);
	if (toInput) toInput.value = formatDate(today);
});

/* ── 상태 ── */
var currentTaskId = null;
var currentTaskData = null;
var currentStatus = 'progress';
var currentHistoryData = [];
var historyPanelCollapsed = false;
var editingLogNo = null;

/* ── Axios 인스턴스 ── */
var api = axios.create({
	baseURL: '/work/emp',
	headers: { 'Content-Type': 'application/json' }
});


/* ══════════════════════════════
   커스텀 시간 선택기 (08:00~22:00, 30분 단위)
══════════════════════════════ */
var timeSlots = (function() {
	var slots = [];
	for (var h = 8; h <= 22; h++) {
		slots.push((h < 10 ? '0' : '') + h + ':00');
		if (h < 22) slots.push((h < 10 ? '0' : '') + h + ':30');
	}
	return slots;
})();

function openTimePicker(type) {
	var dropdownId = type === 'start' ? 'startPickerDropdown' : 'endPickerDropdown';
	var otherId = type === 'start' ? 'endPickerDropdown' : 'startPickerDropdown';
	var btnId = type === 'start' ? 'startTimeBtn' : 'endTimeBtn';
	var dropdown = document.getElementById(dropdownId);
	var other = document.getElementById(otherId);
	var hiddenId = type === 'start' ? 'workStartTime' : 'workEndTime';
	var current = document.getElementById(hiddenId).value;

	if (other) other.classList.remove('open');

	if (dropdown.classList.contains('open')) {
		dropdown.classList.remove('open');
		return;
	}

	var btn = document.getElementById(btnId);
	var rect = btn.getBoundingClientRect();
	var dropH = 260;
	var spaceBelow = window.innerHeight - rect.bottom;
	if (spaceBelow < dropH) {
		dropdown.style.top = (rect.top - dropH - 4) + 'px';
	} else {
		dropdown.style.top = (rect.bottom + 4) + 'px';
	}
	dropdown.style.left = rect.left + 'px';
	dropdown.style.width = rect.width + 'px';

	var grid = '<div class="time-picker-grid">';
	timeSlots.forEach(function(slot) {
		var isActive = slot === current ? ' active' : '';
		grid += '<button type="button" class="time-btn' + isActive + '" onclick="selectTime(&apos;' + type + '&apos;,&apos;' + slot + '&apos;)">' + slot + '</button>';
	});
	grid += '</div>';
	grid += '<div class="time-picker-clear"><button type="button" onclick="clearTime(&apos;' + type + '&apos;)"><i class="fas fa-times"></i> 초기화</button></div>';

	dropdown.innerHTML = grid;
	dropdown.classList.add('open');
}

function selectTime(type, slot) {
	var hiddenId = type === 'start' ? 'workStartTime' : 'workEndTime';
	var displayId = type === 'start' ? 'startTimeDisplay' : 'endTimeDisplay';
	var btnId = type === 'start' ? 'startTimeBtn' : 'endTimeBtn';
	var dropId = type === 'start' ? 'startPickerDropdown' : 'endPickerDropdown';

	document.getElementById(hiddenId).value = slot;
	document.getElementById(displayId).textContent = slot;
	document.getElementById(btnId).classList.add('selected');
	document.getElementById(dropId).classList.remove('open');
	calcDuration();
}

function clearTime(type) {
	var hiddenId = type === 'start' ? 'workStartTime' : 'workEndTime';
	var displayId = type === 'start' ? 'startTimeDisplay' : 'endTimeDisplay';
	var btnId = type === 'start' ? 'startTimeBtn' : 'endTimeBtn';
	var dropId = type === 'start' ? 'startPickerDropdown' : 'endPickerDropdown';

	document.getElementById(hiddenId).value = '';
	document.getElementById(displayId).textContent = type === 'start' ? '시작 시간' : '종료 시간';
	document.getElementById(btnId).classList.remove('selected');
	document.getElementById(dropId).classList.remove('open');
	calcDuration();
}

document.addEventListener('click', function(e) {
	if (!e.target.closest('.time-picker-wrap')) {
		document.querySelectorAll('.time-picker-dropdown.open').forEach(function(d) {
			d.classList.remove('open');
		});
	}
});


/* ══════════════════════════════
   초기화
══════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
	renderDateTabs();
	loadTaskList();
});


/* ══════════════════════════════
   담당업무 목록 로드
══════════════════════════════ */
function loadTaskList() {
	api.get('/tasks')
		.then(function(res) {
			renderTaskList(res.data);
		})
		.catch(function(err) {
			console.error('담당업무 로드 실패', err);
			showToast('담당업무 목록을 불러오지 못했습니다.', 'error');
		});
}

function renderTaskList(list) {
	var el = document.getElementById('taskList');
	el.innerHTML = '';

	var activeList = list.filter(function(t) {
		var isDone = (t.taskStatCd === '완료') && (Number(t.taskProgressRate) >= 100);
		return !isDone;
	});

	var badge = document.getElementById('taskCountBadge');
	if (badge) badge.textContent = '총 ' + activeList.length;

	if (activeList.length === 0) {
		el.innerHTML = '<div class="history-empty" style="height:120px;"><i class="fas fa-check-circle" style="color:#00d25b;"></i><p>모든 업무를 완료했습니다!</p></div>';
		return;
	}

	activeList.forEach(function(t) {
		var div = document.createElement('div');
		div.className = 'task-item';
		div.title = "더블 클릭 시 상세 내용을 확인합니다.";
		div.setAttribute('data-id', t.taskNo);
		div.setAttribute('data-task-json', JSON.stringify(t));
		div.onclick = function(event) {
			if (window.currentSelectedId === t.taskNo) {
				openTaskMenu(event, t.taskNo, this);
			} else {
				selectTask(t.taskNo, t);
				window.currentSelectedId = t.taskNo;
			}
		};
		div.innerHTML =
			'<div class="task-item-left">' +
			'<div class="task-item-name">' + (t.taskTitle || '-') + '</div>' +
			'<div class="task-item-sub">' + (t.empNm || '-') +
			'</div>';
		el.appendChild(div);
	});

	if (activeList.length > 0) {
		selectTask(activeList[0].taskNo, activeList[0]);
	}
}


/* ══════════════════════════════
   담당업무 컨텍스트 메뉴
══════════════════════════════ */
function openTaskMenu(e, taskNo, btn) {
	e.stopPropagation();
	closeTaskMenu();

	var menu = document.createElement('div');
	menu.id = 'taskContextMenu';
	menu.className = 'task-context-menu';
	menu.innerHTML =
		'<button onclick="viewTaskDetail(' + taskNo + ')"><i class="fas fa-eye"></i> 상세보기</button>' +
		'<button onclick="goToJournal(' + taskNo + ')"><i class="fas fa-pen"></i> 일지 작성</button>' +
		'<div class="task-menu-divider"></div>' +
		'<button onclick="copyTaskTitle(' + taskNo + ')"><i class="fas fa-copy"></i> 업무명 복사</button>';

	document.body.appendChild(menu);

	var rect = btn.getBoundingClientRect();
	var menuW = 160;
	var left = rect.right - menuW;
	var top = rect.bottom + 4;

	if (left < 8) left = 8;
	if (top + 130 > window.innerHeight) top = rect.top - 130;

	menu.style.left = left + 'px';
	menu.style.top = top + 'px';

	setTimeout(function() {
		document.addEventListener('click', closeTaskMenuHandler);
	}, 0);
}

function closeTaskMenuHandler(e) {
	if (!e.target.closest('#taskContextMenu')) closeTaskMenu();
}

function closeTaskMenu() {
	var el = document.getElementById('taskContextMenu');
	if (el) el.remove();
	document.removeEventListener('click', closeTaskMenuHandler);
}

function viewTaskDetail(taskNo) {
	closeTaskMenu();

	var taskCard = document.querySelector('.task-item[data-id="' + taskNo + '"]');
	var taskData = {};
	try { taskData = JSON.parse(taskCard.getAttribute('data-task-json') || '{}'); } catch (e) { }

	var taskName = taskData.taskTitle || '-';
	var taskProgress = (taskData.taskProgressRate || 0) + '%';
	var taskStat = taskData.taskStatCd || '진행중';
	var taskCn = taskData.taskCn || '';

	closeTaskDetail();

	var overlay = document.createElement('div');
	overlay.id = 'taskDetailOverlay';
	overlay.style.cssText = 'position:fixed;inset:0;background:rgba(26,31,54,0.25);z-index:300;';
	overlay.onclick = closeTaskDetail;

	var modal = document.createElement('div');
	modal.id = 'taskDetailModal';
	modal.style.cssText =
		'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);' +
		'width:400px;max-width:90vw;background:#fff;border-radius:12px;' +
		'box-shadow:0 8px 32px rgba(0,0,0,0.16);z-index:301;overflow:hidden;' +
		'animation:tdmFadeIn 0.18s ease;';

	var descSection = taskCn
		? '<div style="margin-top:16px;">' +
		'<div style="font-size:11px; font-weight:700; color:#6b7280; margin-bottom:8px; margin-left:4px; text-transform:uppercase; letter-spacing:0.5px;">업무 상세 내용</div>' +
		'<div style="background:#ffffff; border:1px solid #e5e7eb; border-radius:12px; padding:16px; ' +
		'font-size:13.5px; color:#4b5563; line-height:1.7; white-space:pre-wrap; max-height:220px; overflow-y:auto; box-shadow:inset 0 1px 2px rgba(0,0,0,0.02);">' +
		taskCn + '</div></div>'
		: '<div style="margin-top:16px; padding:24px; background:#f9fafb; border:2px dashed #e5e7eb; ' +
		'border-radius:12px; font-size:13px; color:#9ca3af; text-align:center; display:flex; flex-direction:column; gap:8px; justify-content:center; align-items:center;">' +
		'<i class="fas fa-inbox" style="font-size:20px; color:#d1d5db;"></i>등록된 상세 내용이 없습니다</div>';

	modal.innerHTML =
		'<style>' +
		'@keyframes tdmFadeIn{from{opacity:0;transform:translate(-50%,-48%) scale(0.96)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}' +
		'.task-modal-container::-webkit-scrollbar{width:6px}.task-modal-container::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:10px}' +
		'</style>' +
		'<div style="display:flex; align-items:center; justify-content:space-between; padding:20px 24px 16px; border-bottom:1px solid #f1f5f9;">' +
		'  <div style="display:flex; align-items:center; gap:10px;">' +
		'    <div style="background:#eff6ff; width:32px; height:32px; display:flex; align-items:center; justify-content:center; border-radius:8px;">' +
		'      <i class="fas fa-briefcase" style="color:#2563eb; font-size:14px;"></i>' +
		'    </div>' +
		'    <span style="font-size:16px; font-weight:800; color:#111827; letter-spacing:-0.3px;">업무 상세보기</span>' +
		'  </div>' +
		'  <button onclick="closeTaskDetail()" style="background:#f3f4f6; border:none; cursor:pointer; color:#6b7280; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; transition:0.2s;" onmouseover="this.style.background=\'#e5e7eb\'" onmouseout="this.style.background=\'#f3f4f6\'"><i class="fas fa-times" style="font-size:12px;"></i></button>' +
		'</div>' +
		'<div class="task-modal-container" style="padding:24px; max-height:70vh; overflow-y:auto;">' +
		'  <div style="display:grid; gap:12px;">' +
		'    <div style="background:#f8fafc; border:1px solid #f1f5f9; border-radius:12px; padding:16px;">' +
		'      <div style="font-size:11px; font-weight:700; color:#94a3b8; margin-bottom:6px; text-transform:uppercase;">업무명</div>' +
		'      <div style="font-size:15px; font-weight:700; color:#1e293b; line-height:1.5;">' + taskName + '</div>' +
		'    </div>' +
		'    <div style="background:#f0f9ff; border:1px solid #e0f2fe; border-radius:12px; padding:14px 16px; display:flex; align-items:center; justify-content:space-between;">' +
		'      <div style="font-size:11px; font-weight:700; color:#7dd3fc; text-transform:uppercase;">현재 진행 상태</div>' +
		'      <div style="font-size:13px; font-weight:700; color:#0369a1; background:#ffffff; padding:4px 12px; border-radius:20px; box-shadow:0 2px 4px rgba(0,0,0,0.05);">' +
		'        <i class="fas fa-circle" style="font-size:6px; margin-right:6px; vertical-align:middle;"></i>' + taskStat +
		'      </div>' +
		'    </div>' +
		'  </div>' +
		'  ' + descSection +
		'</div>';

	document.body.appendChild(overlay);
	document.body.appendChild(modal);
}

function closeTaskDetail() {
	var o = document.getElementById('taskDetailOverlay');
	var m = document.getElementById('taskDetailModal');
	if (o) o.remove();
	if (m) m.remove();
}

function goToJournal(taskNo) {
	closeTaskMenu();
	var card = document.querySelector('.task-item[data-id="' + taskNo + '"]');
	if (card) card.click();
	setTimeout(function() {
		var ta = document.getElementById('journalTitle');
		if (ta) ta.focus();
	}, 200);
}

function copyTaskTitle(taskNo) {
	closeTaskMenu();
	var card = document.querySelector('.task-item[data-id="' + taskNo + '"]');
	var nameEl = card ? card.querySelector('.task-item-name') : null;
	var text = nameEl ? nameEl.textContent : '';
	if (navigator.clipboard && text) {
		navigator.clipboard.writeText(text).then(function() {
			showToast('업무명이 복사되었습니다.', 'success');
		});
	}
}


/* ══════════════════════════════
   업무 선택
══════════════════════════════ */
function selectTask(id, taskData) {
	if (editingLogNo) {
		editingLogNo = null;
		updateFormMode(false);
	}

	currentTaskId = id;
	currentTaskData = taskData;

	document.querySelectorAll('.task-item').forEach(function(el) { el.classList.remove('active'); });
	var card = document.querySelector('.task-item[data-id="' + id + '"]');
	if (card) card.classList.add('active');

	setText('chipProject', taskData.taskTitle || '-');
	setText('chipPeriod', taskData.taskPeriod || '-');

	var empty = document.getElementById('journalEmpty');
	var inner = document.getElementById('rightPanelInner');
	if (empty) empty.style.display = 'none';
	if (inner) inner.style.display = 'flex';

	var progress = taskData.taskProgressRate || 0;
	var range = document.getElementById('progressRange');
	if (range) { range.value = progress; setText('progressPct', progress + '%'); }

	loadLogList(id);
	resetForm();
}


/* ══════════════════════════════
   이전 일지 목록 로드
══════════════════════════════ */
function loadLogList(taskNo) {
	const fromInput = document.getElementById('historySearchDateFrom');
	const toInput = document.getElementById('historySearchDateTo');

	const dateFrom = fromInput ? fromInput.value : '';
	const dateTo = toInput ? toInput.value : '';

	const params = { taskNo };
	if (dateFrom) params.dateFrom = dateFrom;
	if (dateTo) params.dateTo = dateTo;

	api.get('/logs', { params })
		.then(function(res) {
			renderHistory(res.data);
			const kw = (document.getElementById('historySearchKeyword') || {}).value || '';
			if (kw.trim()) filterByKeyword(kw.trim().toLowerCase());
		})
		.catch(function(err) {
			console.error('일지 목록 로드 실패', err);
		});
}

function renderHistory(list) {
	currentHistoryData = list || [];
	_renderHistoryItems(currentHistoryData);
}

function _renderHistoryItems(list) {
	var el = document.getElementById('historyList');
	if (!el) return;
	el.innerHTML = '';

	var badge = document.getElementById('historyCountBadge');
	if (badge) badge.textContent = list.length > 0 ? list.length + '건' : '';

	if (!list || list.length === 0) {
		el.innerHTML = '<div class="history-empty"><i class="fas fa-inbox"></i><p>작성된 일지가 없습니다</p></div>';
		return;
	}

	list.forEach(function(item) {
		var workDate = item.workDtm ? new Date(item.workDtm) : null;
		var day = workDate ? String(workDate.getDate()) : '-';
		var mon = workDate ? (workDate.getMonth() + 1) + '월' : '-';

		var div = document.createElement('div');
		div.className = 'history-item';
		div.style.cursor = 'pointer';
		div.innerHTML =
			'<div class="history-date">' +
			'<div class="day">' + day + '</div>' +
			'<div class="mon">' + mon + '</div>' +
			'</div>' +
			'<div class="history-content">' +
			'<div class="history-title">' + (item.logTitle || '(제목없음)') + '</div>' +
			'</div>' +
			'<div class="history-item-actions">' +
			'<button class="history-detail-btn" title="수정하기">' +
			'<i class="fas fa-edit"></i> 수정하기' +
			'</button>' +
			'</div>';

		/* ✅ 나머지 영역 클릭 → 읽기 전용 보기 */
		div.addEventListener('click', function(e) {
			/* 수정하기 버튼 영역은 무시 (버튼 자체 핸들러가 처리) */
			if (e.target.closest('.history-detail-btn')) return;
			openHistoryView(item, day, mon);
		});

		/* ✅ 수정하기 버튼 클릭 → 기존 수정 로직 */
		div.querySelector('.history-detail-btn').addEventListener('click', function(e) {
			e.stopPropagation();
			openHistoryDetail(item, day, mon);
		});

		el.appendChild(div);
	});
}


function openHistoryView(item, day, mon) {
	var titleEl   = document.getElementById('journalTitle');
	var contentEl = document.getElementById('journalContent');

	/* 1. 값 채우기 */
	if (titleEl)   titleEl.value   = item.logTitle || '';
	if (contentEl) contentEl.value = item.logCn    || '';

	/* 2. 읽기 전용 잠금 */
	if (titleEl)   { titleEl.setAttribute('readonly', true);   titleEl.classList.add('view-mode'); }
	if (contentEl) { contentEl.setAttribute('readonly', true); contentEl.classList.add('view-mode'); }

	/* 3. 헤더 "읽기" - 초록색 */
	var colTitle  = document.querySelector('.rp-journal .col-header .col-title');
	var colHeader = document.querySelector('.rp-journal .col-header');
	var dateTabs  = document.getElementById('dateTabs');

	if (colHeader) colHeader.style.cssText =
		'background:#f0fdf4; border-bottom:2px solid #00d25b; transition:all 0.2s;';
	if (dateTabs) dateTabs.style.display = 'none';

	if (colTitle) {
		colTitle.innerHTML =
			'&nbsp;&nbsp;&nbsp;<i class="fas fa-eye" style="color:#00d25b;"></i>' +
			'<span style="color:#00d25b; font-weight:700; margin-left:4px;">읽기</span>' +
			'<span style="font-size:11px; color:#00d25b; margin-left:6px; font-weight:400; opacity:0.85;">' +
				mon + ' ' + day + '일</span>' +
			'<button onclick="closeViewMode()" ' +
				'style="margin-left:auto; font-size:10px; color:#9ca3af; ' +
				'background:none; border:1px solid #e8ecf4; border-radius:5px; padding:3px 10px; cursor:pointer; ' +
				'font-family:inherit; transition:all 0.12s;" ' +
				'onmouseover="this.style.borderColor=\'#fc424a\';this.style.color=\'#fc424a\';" ' +
				'onmouseout="this.style.borderColor=\'#e8ecf4\';this.style.color=\'#9ca3af\';">' +
				'✕ 닫기</button>';
	}

	/* 4. 제출 버튼 숨기기 */
	var footer = document.querySelector('.journal-form-footer');
	if (footer) footer.style.display = 'none';

	/* 5. 패널 접혀있으면 펼치기 */
	var rpJournal = document.querySelector('.rp-journal');
	if (rpJournal && rpJournal.classList.contains('collapsed')) toggleHistoryPanel();

	/* 6. 스크롤 상단 */
	if (rpJournal) rpJournal.scrollTop = 0;
}

function filterByKeyword(kw) {
	var filtered = currentHistoryData.filter(function(item) {
		return (item.logTitle || '').toLowerCase().includes(kw) ||
			(item.logCn || '').toLowerCase().includes(kw);
	});
	_renderHistoryItems(filtered);
}

function filterHistory() {
	if (!currentTaskId) return;
	loadLogList(currentTaskId);
}

function clearHistorySearch() {
	['historySearchKeyword', 'historySearchDateFrom', 'historySearchDateTo'].forEach(function(id) {
		var el = document.getElementById(id);
		if (el) el.value = '';
	});
	if (currentTaskId) loadLogList(currentTaskId);
}

function clearKeywordSearch() {
	var el = document.getElementById('historySearchKeyword');
	if (el) el.value = '';
	if (currentTaskId) loadLogList(currentTaskId);
}

function clearDateSearch() {
	var df = document.getElementById('historySearchDateFrom');
	var dt = document.getElementById('historySearchDateTo');
	if (df) df.value = '';
	if (dt) dt.value = '';
	if (currentTaskId) loadLogList(currentTaskId);
}


/* ══════════════════════════════
   일지 클릭 → 폼에 내용 불러오기 (수정 모드)
   ✅ 함수 구조 완전 수정
══════════════════════════════ */

function openHistoryDetail(item, day, mon) {

	/* 1. 혹시 보기 모드였다면 먼저 해제 */
	var titleEl = document.getElementById('journalTitle');
	var contentEl = document.getElementById('journalContent');
	if (titleEl) { titleEl.removeAttribute('readonly'); titleEl.classList.remove('view-mode'); }
	if (contentEl) { contentEl.removeAttribute('readonly'); contentEl.classList.remove('view-mode'); }

	/* 2. 수정 대상 PK 저장 */
	editingLogNo = item.taskLogNo || item.logNo || item.workLogNo || null;

	/* 3. 제목 / 내용 채우기 */
	if (titleEl) titleEl.value = item.logTitle || '';
	if (contentEl) contentEl.value = item.logCn || '';

	/* 4. 시간 초기화 */
	var startDisp = document.getElementById('startTimeDisplay');
	var endDisp = document.getElementById('endTimeDisplay');
	var startHid = document.getElementById('workStartTime');
	var endHid = document.getElementById('workEndTime');
	var startBtn = document.getElementById('startTimeBtn');
	var endBtn = document.getElementById('endTimeBtn');
	if (startDisp) startDisp.textContent = '시작 시간';
	if (endDisp) endDisp.textContent = '종료 시간';
	if (startHid) startHid.value = '';
	if (endHid) endHid.value = '';
	if (startBtn) startBtn.classList.remove('selected');
	if (endBtn) endBtn.classList.remove('selected');
	setText('durationText', '-');

	/* 5. 상태 버튼 */
	var stat = item.taskStatCd || 'progress';
	document.querySelectorAll('.status-btn').forEach(function(b) {
		b.classList.remove('sel-progress', 'sel-done');
	});
	if (stat === '완료' || stat === 'done') {
		currentStatus = 'done';
		var doneBtn = document.querySelector('.status-btn:nth-child(2)');
		if (doneBtn) doneBtn.classList.add('sel-done');
	} else {
		currentStatus = 'progress';
		var progressBtn = document.querySelector('.status-btn:nth-child(1)');
		if (progressBtn) progressBtn.classList.add('sel-progress');
	}

	/* 6. 진행도 */
	var rate = item.progressRate || item.taskProgressRate || 0;
	var range = document.getElementById('progressRange');
	if (range) { range.value = rate; setText('progressPct', rate + '%'); }

	/* 7. 제출 버튼 다시 표시 (보기모드에서 숨겼을 수 있으므로) */
	var footer = document.querySelector('.journal-form-footer');
	if (footer) footer.style.display = '';

	/* 8. 일지작성 패널이 접혀있으면 자동 펼치기 */
	var rpJournal = document.querySelector('.rp-journal');
	if (rpJournal && rpJournal.classList.contains('collapsed')) {
		toggleHistoryPanel();
	}

	/* 9. 수정 모드 UI 적용 (헤더 노란색 강조) */
	updateFormMode(true, mon + ' ' + day + '일 일지 수정 중');

	/* 10. 스크롤 상단 + 포커스 */
	if (rpJournal) rpJournal.scrollTop = 0;
	if (titleEl) setTimeout(function() { titleEl.focus(); }, 50);
}


function closeViewMode() {
	var titleEl   = document.getElementById('journalTitle');
	var contentEl = document.getElementById('journalContent');

	if (titleEl)   { titleEl.removeAttribute('readonly');   titleEl.classList.remove('view-mode');   titleEl.value   = ''; }
	if (contentEl) { contentEl.removeAttribute('readonly'); contentEl.classList.remove('view-mode'); contentEl.value = ''; }

	/* 제출 버튼 복구 */
	var footer = document.querySelector('.journal-form-footer');
	if (footer) footer.style.display = '';

	/* 작성 모드로 복구 */
	updateFormMode(false);
}


/* ══════════════════════════════
   폼 모드 전환 (신규 / 수정) + 시각적 강조
══════════════════════════════ */
function updateFormMode(isEdit, label) {
	var colTitle  = document.querySelector('.rp-journal .col-header .col-title');
	var colHeader = document.querySelector('.rp-journal .col-header');
	var dateTabs  = document.getElementById('dateTabs');

	if (!colTitle) return;

	if (isEdit) {
		/* ✏️ 수정 - 노란색 */
		if (colHeader) colHeader.style.cssText =
			'background:#fffbee; border-bottom:2px solid #ffab00; transition:all 0.2s;';
		if (dateTabs) dateTabs.style.display = 'none';

		colTitle.innerHTML =
			'&nbsp;&nbsp;&nbsp;<i class="fas fa-edit" style="color:#ffab00;"></i>' +
			'<span style="color:#ffab00; font-weight:700; margin-left:4px;">수정</span>' +
			'<span style="font-size:11px; color:#ffab00; margin-left:6px; font-weight:400; opacity:0.85;">' + (label || '') + '</span>' +
			'<button onclick="cancelEdit()" ' +
				'style="margin-left:auto; font-size:10px; color:#9ca3af; ' +
				'background:none; border:1px solid #e8ecf4; border-radius:5px; padding:3px 10px; cursor:pointer; ' +
				'font-family:inherit; transition:all 0.12s;" ' +
				'onmouseover="this.style.borderColor=\'#fc424a\';this.style.color=\'#fc424a\';" ' +
				'onmouseout="this.style.borderColor=\'#e8ecf4\';this.style.color=\'#9ca3af\';">✕ 취소</button>';

	} else {
		/* ✍️ 작성 - 기본(흰색) */
		if (colHeader) colHeader.style.cssText =
			'background:#fff; border-bottom:2px solid #e8ecf4; transition:all 0.2s;';
		if (dateTabs) dateTabs.style.display = '';

		colTitle.innerHTML =
			'&nbsp;&nbsp;&nbsp;<i class="fas fa-pen" style="color:#0090e7;"></i>' +
			'<span style="color:#1a1f36; font-weight:700; margin-left:4px;">작성</span>' +
			'<span class="col-count" id="todayLabel"></span>';

		if (dateTabs) dateTabs.innerHTML = '';
		renderDateTabs();
	}
}


/* ══════════════════════════════
   수정 취소
══════════════════════════════ */
function cancelEdit() {
	editingLogNo = null;
	updateFormMode(false);
	resetForm();
}


/* ══════════════════════════════
   일지 제출 (신규 POST / 수정 PUT)
══════════════════════════════ */
function submitJournal() {
	var titleEl   = document.getElementById('journalTitle');
	var contentEl = document.getElementById('journalContent');
	if (titleEl)   { titleEl.removeAttribute('readonly');   titleEl.classList.remove('view-mode'); }
	if (contentEl) { contentEl.removeAttribute('readonly'); contentEl.classList.remove('view-mode'); }

	if (!currentTaskId) { showToast('업무를 선택해주세요.', 'warn'); return; }

	var content = getVal('journalContent');
	var title   = getVal('journalTitle');

	if (!content) { showToast('업무 내용을 입력해주세요.', 'warn'); return; }
	if (!title)   { showToast('일지 제목을 입력해주세요.', 'warn'); return; }

	var payload = {
		taskNo:       currentTaskId,
		logTitle:     title,
		logCn:        content,
		logDivCd:     currentTaskData && currentTaskData.deptCd ? 'PRJ' : 'DEPT',
		taskStatCd:   currentStatus,
		progressRate: parseFloat(document.getElementById('progressRange') ? document.getElementById('progressRange').value : 0) || 0
	};

	/* ── 수정 모드: PUT ── */
	if (editingLogNo) {
		payload.taskLogNo = editingLogNo;
		api.put('/logs/' + editingLogNo, payload)
			.then(function() {
				showToast('✅ 일지가 수정되었습니다.', 'success');
				editingLogNo = null;
				updateFormMode(false);
				loadLogList(currentTaskId);
				resetForm();
			})
			.catch(function(err) {
				console.error('일지 수정 실패', err);
				showToast('수정 중 오류가 발생했습니다.', 'error');
			});
		return;
	}

	/* ── 신규 제출: 오늘 중복 확인 ── */
	var today    = new Date();
	var todayStr = today.getFullYear() + '-' +
		String(today.getMonth() + 1).padStart(2, '0') + '-' +
		String(today.getDate()).padStart(2, '0');

	var alreadyToday = currentHistoryData.some(function(item) {
		if (!item.workDtm) return false;
		var d    = new Date(item.workDtm);
		var dStr = d.getFullYear() + '-' +
			String(d.getMonth() + 1).padStart(2, '0') + '-' +
			String(d.getDate()).padStart(2, '0');
		return dStr === todayStr;
	});

	if (alreadyToday) {
		showTodayWarning();
		return;
	}

	api.post('/logs/submit', payload)
		.then(function() {
			showToast('✅ 일지가 제출되었습니다.', 'success');
			loadLogList(currentTaskId);
			resetForm();
		})
		.catch(function(err) {
			console.error('일지 제출 실패', err);
			showToast('제출 중 오류가 발생했습니다.', 'error');
		});
}


/* ══════════════════════════════
   오늘 중복 경고 모달
══════════════════════════════ */
function showTodayWarning() {
	var existing = document.getElementById('todayWarnModal');
	var existingOv = document.getElementById('todayWarnOverlay');
	if (existing) existing.remove();
	if (existingOv) existingOv.remove();

	var today = new Date();
	var mm = String(today.getMonth() + 1).padStart(2, '0');
	var dd = String(today.getDate()).padStart(2, '0');
	Swal.fire({
        icon: 'warning',
        title: '오늘 이미 일지를 제출했어요!',
        html: mm + '월 ' + dd + '일 일지가 이미 등록되어 있습니다.<br><br>' +
              '기존 일지를 <strong style="color:#0090e7;">수정</strong>하려면<br>' +
              '우측 패널에서 해당 일지를 클릭해주세요.',
        confirmButtonText: '확인'
    });

	var overlay = document.createElement('div');
	overlay.id = 'todayWarnOverlay';
	overlay.style.cssText = 'position:fixed;inset:0;background:rgba(26,31,54,0.25);z-index:9998;';
	overlay.onclick = closeTodayWarning;

	var modal = document.createElement('div');
	modal.id = 'todayWarnModal';
	modal.style.cssText =
		'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);' +
		'width:360px;max-width:90vw;background:#fff;border-radius:14px;' +
		'box-shadow:0 8px 32px rgba(0,0,0,0.18);z-index:9999;overflow:hidden;' +
		'animation:warnFadeIn 0.18s ease;';

	modal.innerHTML =
		'<style>@keyframes warnFadeIn{from{opacity:0;transform:translate(-50%,-50%) scale(0.96)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}</style>' +
		'<div style="background:#fff7ed;padding:24px 20px 16px;text-align:center;border-bottom:1px solid #fed7aa;">' +
		'<i class="fas fa-exclamation-triangle" style="font-size:30px;color:#f97316;margin-bottom:10px;display:block;"></i>' +
		'<div style="font-size:15px;font-weight:700;color:#c2410c;">오늘 이미 일지를 제출했어요!</div>' +
		'<div style="font-size:12px;color:#9ca3af;margin-top:5px;">' + mm + '월 ' + dd + '일 일지가 이미 등록되어 있습니다</div>' +
		'</div>' +
		'<div style="padding:18px 20px 8px;font-size:13px;color:#374151;text-align:center;line-height:1.7;">' +
		'기존 일지를 <strong style="color:#0090e7;">수정</strong>하려면<br>' +
		'우측 패널에서 해당 일지를 클릭해주세요.' +
		'</div>' +
		'<div style="padding:12px 16px 16px;">' +
		'<button onclick="closeTodayWarning()" style="width:100%;padding:10px;border-radius:8px;border:none;' +
		'background:#0090e7;color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">확인</button>' +
		'</div>';

	document.body.appendChild(overlay);
	document.body.appendChild(modal);
}




/* ══════════════════════════════
   임시저장
══════════════════════════════ */
function saveDraft() {
	if (!currentTaskId) { showToast('업무를 선택해주세요.', 'warn'); return; }
	if (!getVal('journalContent')) { showToast('업무 내용을 입력해주세요.', 'warn'); return; }

	var content = getVal('journalContent');
	var title = getVal('journalTitle') || content.substring(0, 50);
	var payload = {
		taskNo: currentTaskId,
		logTitle: title,
		logCn: content,
		logDivCd: 'DEPT'
	};

	api.post('/logs/draft', payload)
		.then(function() {
			showToast('임시저장 되었습니다.', 'success');
		})
		.catch(function(err) {
			console.error('임시저장 실패', err);
			showToast('임시저장 중 오류가 발생했습니다.', 'error');
		});
}


/* ══════════════════════════════
   날짜 탭 (오늘만)
══════════════════════════════ */
function renderDateTabs() {
	var el = document.getElementById('dateTabs');
	if (!el) return;
	el.innerHTML = '';
	var days = ['일', '월', '화', '수', '목', '금', '토'];
	var today = new Date();
	var mm = String(today.getMonth() + 1).padStart(2, '0');
	var dd = String(today.getDate()).padStart(2, '0');

	var btn = document.createElement('button');
	btn.className = 'date-tab active today';
	btn.textContent = mm + '.' + dd + ' (' + days[today.getDay()] + ') 오늘';
	el.appendChild(btn);

	var lbl = document.getElementById('todayLabel');
	if (lbl) lbl.textContent = today.getFullYear() + '.' + mm + '.' + dd + ' (' + days[today.getDay()] + ')';
}


/* ══════════════════════════════
   패널 접기/펼치기
══════════════════════════════ */
function toggleHistoryPanel() {
	var panel = document.querySelector('.rp-journal');
	var icon = document.getElementById('historyCollapseIcon');

	historyPanelCollapsed = !historyPanelCollapsed;
	panel.classList.toggle('collapsed', historyPanelCollapsed);

	if (historyPanelCollapsed) {
		icon.className = 'fas fa-chevron-left';
	} else {
		icon.className = 'fas fa-chevron-right';
	}
}


/* ══════════════════════════════
   상태 / 진행률
══════════════════════════════ */
function setStatus(el, type) {
	currentStatus = type;
	document.querySelectorAll('.status-btn').forEach(function(b) {
		b.classList.remove('sel-progress', 'sel-done');
	});
	el.classList.add('sel-' + type);

	if (type === 'done') {
		var r = document.getElementById('progressRange');
		if (r) { r.value = 100; setText('progressPct', '100%'); }
	}
	if (type === 'progress') {
		var r = document.getElementById('progressRange');
		if (r && parseInt(r.value) >= 100) {
			r.value = 99;
			setText('progressPct', '99%');
		}
	}
}

function onProgressChange(val) {
	val = parseInt(val);
	setText('progressPct', val + '%');

	if (val >= 100) {
		currentStatus = 'done';
		document.querySelectorAll('.status-btn').forEach(function(b) { b.classList.remove('sel-progress', 'sel-done'); });
		var doneBtn = document.querySelector('.status-btn:nth-child(2)');
		if (doneBtn) doneBtn.classList.add('sel-done');
	} else {
		currentStatus = 'progress';
		document.querySelectorAll('.status-btn').forEach(function(b) { b.classList.remove('sel-progress', 'sel-done'); });
		var progressBtn = document.querySelector('.status-btn:nth-child(1)');
		if (progressBtn) progressBtn.classList.add('sel-progress');
	}
}

function setPct(v) {
	var r = document.getElementById('progressRange');
	if (r) {
		r.value = v;
		setText('progressPct', v + '%');
		if (v >= 100) {
			currentStatus = 'done';
			document.querySelectorAll('.status-btn').forEach(function(b) { b.classList.remove('sel-progress', 'sel-done'); });
			var doneBtn = document.querySelector('.status-btn:nth-child(2)');
			if (doneBtn) doneBtn.classList.add('sel-done');
		} else {
			currentStatus = 'progress';
			document.querySelectorAll('.status-btn').forEach(function(b) { b.classList.remove('sel-progress', 'sel-done'); });
			var progressBtn = document.querySelector('.status-btn:nth-child(1)');
			if (progressBtn) progressBtn.classList.add('sel-progress');
		}
	}
}


/* ══════════════════════════════
   작업 시간 계산
══════════════════════════════ */
function calcDuration() {
	var s = (document.getElementById('workStartTime') || {}).value || '';
	var e = (document.getElementById('workEndTime') || {}).value || '';
	var durEl = document.getElementById('durationText');
	if (!durEl) return;
	if (!s || !e) { durEl.textContent = '-'; return; }

	var sm = parseInt(s.split(':')[0]) * 60 + parseInt(s.split(':')[1]);
	var em = parseInt(e.split(':')[0]) * 60 + parseInt(e.split(':')[1]);
	var diff = em - sm;
	if (diff <= 0) { durEl.textContent = '-'; return; }

	var h = Math.floor(diff / 60);
	var m = diff % 60;
	durEl.textContent = (h > 0 ? h + '시간 ' : '') + (m > 0 ? m + '분' : '');
}


/* ══════════════════════════════
   폼 초기화
══════════════════════════════ */
function resetForm() {
	var c = document.getElementById('journalContent');
	if (c) c.value = '';
	var t = document.getElementById('journalTitle');
	if (t) t.value = '';

	var startHidden = document.getElementById('workStartTime');
	var endHidden = document.getElementById('workEndTime');
	var startDisp = document.getElementById('startTimeDisplay');
	var endDisp = document.getElementById('endTimeDisplay');
	var startBtn = document.getElementById('startTimeBtn');
	var endBtn = document.getElementById('endTimeBtn');

	if (startHidden) startHidden.value = '';
	if (endHidden) endHidden.value = '';
	if (startDisp) startDisp.textContent = '시작 시간';
	if (endDisp) endDisp.textContent = '종료 시간';
	if (startBtn) startBtn.classList.remove('selected');
	if (endBtn) endBtn.classList.remove('selected');
	setText('durationText', '-');

	document.querySelectorAll('.status-btn').forEach(function(b) {
		b.classList.remove('sel-progress', 'sel-done');
	});
	var first = document.querySelector('.status-btn');
	if (first) first.classList.add('sel-progress');
	currentStatus = 'progress';
}


/* ══════════════════════════════
   토스트
══════════════════════════════ */
function showToast(msg, type) {
	var existing = document.getElementById('workToast');
	if (existing) existing.remove();

	var colors = { success: '#00d25b', warn: '#ffab00', error: '#fc424a' };
	var toast = document.createElement('div');
	toast.id = 'workToast';
	toast.style.cssText =
		'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);' +
		'background:' + (colors[type] || '#1a1f36') + ';color:#fff;' +
		'padding:10px 24px;border-radius:20px;font-size:13px;font-weight:600;' +
		'z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,0.18);';
	toast.textContent = msg;
	document.body.appendChild(toast);
	setTimeout(function() { if (toast.parentNode) toast.remove(); }, 2500);
}


/* ══════════════════════════════
   이전 일지 탭 전환
══════════════════════════════ */
var currentHistoryTab = 'current';
var allTasksData = [];

function switchHistoryTab(tab) {
	currentHistoryTab = tab;

	document.getElementById('tabCurrent').classList.toggle('active', tab === 'current');
	document.getElementById('tabAll').classList.toggle('active', tab === 'all');

	var titleEl = document.getElementById('historyPanelTitle');
	if (titleEl) titleEl.textContent = tab === 'current' ? '현재 일지' : '이전 일지';

	var badge = document.getElementById('historyCountBadge');
	if (badge && tab === 'current') {
		badge.textContent = currentHistoryData.length > 0 ? currentHistoryData.length + '건' : '';
	}

	var panelCurrent = document.getElementById('panelCurrent');
	var panelAll = document.getElementById('panelAll');

	if (tab === 'current') {
		panelCurrent.style.display = 'flex';
		panelAll.style.display = 'none';
	} else {
		panelCurrent.style.display = 'none';
		panelAll.style.display = 'flex';
		if (allTasksData.length === 0) loadAllTasksAccordion();
	}
}

function loadAllTasksAccordion() {
	api.get('/tasks')
		.then(function(res) {
			var all = res.data || [];
			allTasksData = all.filter(function(t) {
				return t.taskStatCd === '완료' || Number(t.taskProgressRate) === 100;
			});
			var badge = document.getElementById('historyCountBadge');
			if (badge) badge.textContent = allTasksData.length > 0 ? allTasksData.length + '건' : '';
			renderAccordion(allTasksData);
		})
		.catch(function(err) {
			console.error('전체 업무 로드 실패', err);
			Swal.fire({ icon: 'error', title: '로드 실패', text: '이전 업무 목록을 불러오지 못했습니다.' });
		});
}

function renderAccordion(list) {
	var el = document.getElementById('accordionList');
	if (!el) return;
	el.innerHTML = '';

	if (!list || list.length === 0) {
		el.innerHTML = '<div class="history-empty"><i class="fas fa-inbox"></i><p>담당업무가 없습니다</p></div>';
		return;
	}

	list.forEach(function(task) {
		var wrapper = document.createElement('div');
		wrapper.className = 'accordion-task';
		wrapper.setAttribute('data-task-no', task.taskNo);

		var header = document.createElement('div');
		header.className = 'accordion-task-header';
		header.innerHTML =
			'<div class="accordion-task-name">' + (task.taskTitle || '-') + '</div>' +
			'<div class="accordion-task-meta">' + (task.taskProgressRate || 0) + '%</div>' +
			'<i class="fas fa-chevron-right accordion-task-arrow"></i>';

		var logList = document.createElement('div');
		logList.className = 'accordion-log-list';
		logList.setAttribute('data-loaded', 'false');

		header.addEventListener('click', function() {
			var isOpen = header.classList.contains('open');

			document.querySelectorAll('.accordion-task-header.open').forEach(function(h) {
				h.classList.remove('open');
				h.nextElementSibling.classList.remove('open');
			});

			if (!isOpen) {
				header.classList.add('open');
				logList.classList.add('open');

				if (logList.getAttribute('data-loaded') === 'false') {
					logList.innerHTML = '<div class="accordion-empty">로딩 중...</div>';
					logList.setAttribute('data-loaded', 'true');

					api.get('/logs', { params: { taskNo: task.taskNo } })
						.then(function(res) { renderAccordionLogs(logList, res.data, task); })
						.catch(function() { logList.innerHTML = '<div class="accordion-empty">불러오기 실패</div>'; });
				}
			}
		});

		wrapper.appendChild(header);
		wrapper.appendChild(logList);
		el.appendChild(wrapper);
	});
}

function renderAccordionLogs(container, logs, task) {
	container.innerHTML = '';

	if (!logs || logs.length === 0) {
		container.innerHTML = '<div class="accordion-empty">작성된 일지가 없습니다</div>';
		return;
	}

	logs.forEach(function(log) {
		var workDate = log.workDtm ? new Date(log.workDtm) : null;
		var day = workDate ? String(workDate.getDate()) : '-';
		var mon = workDate ? (workDate.getMonth() + 1) + '월' : '-';

		var item = document.createElement('div');
		item.className = 'accordion-log-item';
		item.innerHTML =
			'<div class="accordion-log-date">' +
				'<div class="day">' + day + '</div>' +
				'<div class="mon">' + mon + '</div>' +
			'</div>' +
			'<div class="accordion-log-content">' +
				'<div class="accordion-log-title">' + (log.logTitle || '(제목없음)') + '</div>' +
				'<div class="accordion-log-desc">' + (log.logCn || '') + '</div>' +
			'</div>';

		/* ✅ 이전 업무 일지는 항상 읽기 전용 보기 */
		item.addEventListener('click', function() {
			openHistoryView(log, day, mon);
		});

		container.appendChild(item);
	});
}

function filterAccordion() {
	var kw = ((document.getElementById('allSearchKeyword') || {}).value || '').toLowerCase().trim();
	var dateFrom = (document.getElementById('allSearchDateFrom') || {}).value || '';
	var dateTo = (document.getElementById('allSearchDateTo') || {}).value || '';

	var filtered = allTasksData.filter(function(t) {
		if (kw && !(t.taskTitle || '').toLowerCase().includes(kw)) return false;
		if (dateFrom && t.taskEndDtm && t.taskEndDtm.substring(0, 10) < dateFrom) return false;
		if (dateTo && t.taskEndDtm && t.taskEndDtm.substring(0, 10) > dateTo) return false;
		return true;
	});
	renderAccordion(filtered);
}

function clearAllKeyword() {
	var el = document.getElementById('allSearchKeyword');
	if (el) el.value = '';
	filterAccordion();
}

function clearAllDate() {
	var df = document.getElementById('allSearchDateFrom');
	var dt = document.getElementById('allSearchDateTo');
	if (df) df.value = '';
	if (dt) dt.value = '';
	filterAccordion();
}


/* ══════════════════════════════
   유틸
══════════════════════════════ */
function setText(id, v) { var e = document.getElementById(id); if (e) e.textContent = v; }
function getVal(id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; }