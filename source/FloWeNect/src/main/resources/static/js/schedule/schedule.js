document.addEventListener('DOMContentLoaded', function() {
	const calendarEl = document.getElementById('calendar');

	// 상세 모달 관련
	const eventModal = document.getElementById('eventModal');
	const closeBtn = document.querySelector('.close-btn');

	// 일간 목록 모달 관련
	const dayListModal = document.getElementById('dayListModal');
	const dayListContainer = document.getElementById('dayListContainer');
	const dayListTitle = document.getElementById('dayListTitle');
	const closeDayBtn = document.querySelector('.close-day-modal');

	// FullCalendar 초기화
	const calendar = new FullCalendar.Calendar(calendarEl, {
		initialView: 'dayGridMonth',
		locale: 'ko',
		height: '100%',
		expandRows: true,
		headerToolbar: { left: 'today', center: 'prev title next', right: '' },
		eventDisplay: 'list-item',
		displayEventTime: false,
		dayMaxEvents: true,
		dayMaxEventRows: 3,

		dateClick: function(info) {
			openDayListModal(info.dateStr);
		},

		eventClick: function(info) {
			showEventDetail(info.event);
		},

		events: function(info, successCallback, failureCallback) {
			const checkedTypes = Array.from(
				document.querySelectorAll('.filter-chk:checked')
			).map(el => el.value);

			axios.get('/schedule/list')
				.then(res => {
					const typeMap = {
						'EDU': 'education',
						'VACATION': 'leave',
						'LEAVE': 'leave',      // ← 추가
						'ANNUAL': 'leave',
						'RECRUIT': 'recruit'
					};
					const colorMap = {
						'EDU': '#553c9a',
						'VACATION': '#dd6b20',
						'RECRUIT': '#38a169'
					};

					const events = [];

					res.data
						.filter(item => {
							const mapped = typeMap[item.schdDivCd] || item.schdDivCd;
							return checkedTypes.includes(mapped);
						})
						.forEach(item => {
							const isAllDay = item.allDayYn === 'Y';
							const color = item.color || colorMap[item.schdDivCd] || '#0090e7';

							// ✅ displayTitle 변수 선언 추가
							const leaveTypeNameMap = {
								'ANNUAL': '연차',
								'HALF_AM': '오전 반차',
								'HALF_PM': '오후 반차',
								'SICK': '병가'
							};
							const mapped = typeMap[item.schdDivCd] || item.schdDivCd;
							const displayTitle = (mapped === 'leave' && leaveTypeNameMap[item.schdTitle])
								? leaveTypeNameMap[item.schdTitle]
								: item.schdTitle;

							const extendedProps = {
								type: typeMap[item.schdDivCd] || item.schdDivCd,
								description: item.schdCn,
								allDayYn: item.allDayYn,
								rawStart: item.schdStDtm,
								rawEnd: item.schdEdDtm
							};

							const startStr = item.schdStDtm.split('T')[0];
							const endStr = item.schdEdDtm ? item.schdEdDtm.split('T')[0] : startStr;

							if (isAllDay && startStr !== endStr) {
								const start = new Date(startStr);
								const end = new Date(endStr);
								for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
									const dateStr = d.toISOString().split('T')[0];
									events.push({
										title: `[${item.empNm || ''}] ${displayTitle}`,  // ✅ 하나만!
										start: dateStr,
										allDay: true,
										color: color,
										extendedProps: extendedProps
									});
								}
							} else {
								events.push({
									title: `[${item.empNm || ''}] ${displayTitle}`,  // ✅ 하나만!
									start: isAllDay ? startStr : item.schdStDtm,
									end: isAllDay ? endStr : item.schdEdDtm,
									allDay: isAllDay,
									color: color,
									extendedProps: extendedProps
								});
							}
						});

					successCallback(events);
				})
				.catch(err => {
					console.error('일정 조회 실패', err);
					failureCallback(err);
				});
		}
	});

	calendar.render();

	// --- 일간 목록 모달 ---
	function openDayListModal(dateStr) {
		dayListTitle.innerText = dateStr + " 일정";
		dayListContainer.innerHTML = '';

		const dayEvents = calendar.getEvents().filter(event => {
			const start = event.startStr.split('T')[0];
			return start === dateStr;
		});

		if (dayEvents.length === 0) {
			dayListContainer.innerHTML = '<div style="text-align:center; padding:20px; color:#999;">일정이 없습니다.</div>';
		} else {
			// 중복 제거 (쪼갠 이벤트는 같은 제목이 여러개일 수 있음)
			const seen = new Set();
			dayEvents.forEach(event => {
				const key = event.title + JSON.stringify(event.extendedProps.rawStart);
				if (seen.has(key)) return;
				seen.add(key);

				const item = document.createElement('div');
				item.style.cssText = `
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 10px; margin-bottom: 8px; background: #fdfdfd;
                    border-left: 4px solid ${event.backgroundColor}; border-radius: 4px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1); cursor: pointer;
                `;
				item.innerHTML = `
                    <div>
                        <div style="font-weight:bold; font-size:14px;">${event.title}</div>
                        <div style="font-size:12px; color:#666;">
                            ${event.allDay ? '하루 종일' : event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                    <span style="font-size:12px; color:#4a5568; background:#edf2f7; padding:2px 6px; border-radius:4px;">상세보기</span>
                `;
				item.onclick = () => {
					dayListModal.style.display = 'none';
					showEventDetail(event);
				};
				dayListContainer.appendChild(item);
			});
		}
		dayListModal.style.display = 'block';
	}

	// --- 상세 모달 ---
	function showEventDetail(eventObj) {
		const props = eventObj.extendedProps;
		document.getElementById('modalTitle').innerText = eventObj.title;

		let dateStr = '';
		if (eventObj.allDay) {
			const startStr = props.rawStart ? props.rawStart.split('T')[0] : eventObj.startStr;
			const endStr = props.rawEnd ? props.rawEnd.split('T')[0] : null;
			dateStr = (endStr && endStr !== startStr) ? `${startStr} ~ ${endStr}` : startStr;
		} else {
			dateStr = formatDateRange(eventObj.start, eventObj.end);
		}

		document.getElementById('modalDate').innerText = dateStr;

		const dotEl = document.getElementById('modalTypeDot');
		const textEl = document.getElementById('modalTypeText');
		dotEl.style.backgroundColor = eventObj.backgroundColor;

		const typeNameMap = { 'education': '교육', 'leave': '연차', 'recruit': '채용' };
		textEl.innerText = typeNameMap[props.type] || props.type;

		document.getElementById('modalDescription').innerText = props.description || '상세 내용이 없습니다.';
		eventModal.style.display = 'block';
	}

	// 날짜 포맷 (시간 포함)
	function formatDateRange(start, end) {
		const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false };
		let startStr = start.toLocaleString('ko-KR', options).replace(/\. /g, '-').replace(/\./g, '');
		if (end && end.getTime() !== start.getTime()) {
			let endStr = end.toLocaleString('ko-KR', options).replace(/\. /g, '-').replace(/\./g, '');
			return `${startStr} ~ ${endStr}`;
		}
		return startStr;
	}

	// 필터 체크박스
	document.querySelectorAll('.filter-chk').forEach(chk => {
		chk.addEventListener('change', () => calendar.refetchEvents());
	});

	// 모달 닫기
	closeBtn.onclick = () => eventModal.style.display = 'none';
	closeDayBtn.onclick = () => dayListModal.style.display = 'none';
	window.onclick = (e) => {
		if (e.target === eventModal) eventModal.style.display = 'none';
		if (e.target === dayListModal) dayListModal.style.display = 'none';
	};

	// 제목 클릭 시 월 이동
	const titleEl = document.querySelector('.fc-toolbar-title');
	const toolbarCenter = document.querySelector('.fc-toolbar-chunk:nth-child(2)');
	const dateInput = document.createElement('input');
	dateInput.type = 'month';
	dateInput.style.cssText = "position:absolute; opacity:0; width:1px; height:1px;";
	toolbarCenter.appendChild(dateInput);

	titleEl.style.cursor = "pointer";
	titleEl.onclick = () => dateInput.showPicker();
	dateInput.onchange = (e) => { if (e.target.value) calendar.gotoDate(e.target.value); };
});