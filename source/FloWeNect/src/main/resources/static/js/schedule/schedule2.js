document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    // 상세 모달 & 일간 목록 모달 관련
    const eventModal = document.getElementById('eventModal');
    const dayListModal = document.getElementById('dayListModal');
    const closeBtn = document.querySelector('.close-btn');
    const closeDayBtn = document.querySelector('.close-day-modal');

    // 1. 데이터 (형님이 주신 데이터 그대로 사용)
    const allEventsRaw = [
        { title: '신규 프로젝트 킥오프', start: '2026-02-02T10:00:00', extendedProps: { type: 'education', description: '차세대 ERP 시스템 구축 프로젝트 시작 회의' }, color: '#553c9a' },
        { title: '김철수 연차', start: '2026-02-02', extendedProps: { type: 'leave', description: '개인 사유' }, color: '#dd6b20' },
        { title: '디자인팀 연봉 협상', start: '2026-02-03', end: '2026-02-05', extendedProps: { type: 'recruit', description: '디자인팀 전원 개별 면담 진행' }, color: '#38a169' },
        { title: '직장 내 괴롭힘 방지 교육', start: '2026-02-04T14:00:00', extendedProps: { type: 'education', description: '전사 필수 이수 교육 (온라인)' }, color: '#553c9a' },
        { title: '박지민 병가', start: '2026-02-06', extendedProps: { type: 'leave', description: '독감으로 인한 병가' }, color: '#dd6b20' },
        { title: 'QA 엔지니어 1차 면접', start: '2026-02-09T14:00:00', extendedProps: { type: 'recruit', description: '지원자: 이테스트 (비대면)' }, color: '#38a169' },
        { title: '데이터 분석가 실무 테스트', start: '2026-02-13T10:00:00', extendedProps: { type: 'recruit', description: '공채 3기 실무 과제 제출 및 검토' }, color: '#38a169' },
        { title: '인프라 점검 및 교육', start: '2026-02-14', extendedProps: { type: 'education', description: '서버 증설에 따른 운영팀 교육' }, color: '#553c9a' },
        { title: '전사 타운홀 미팅', start: '2026-02-16T11:00:00', extendedProps: { type: 'education', description: '1분기 목표 공유 및 CEO Q&A' }, color: '#553c9a' },
        { title: '인사팀 워크샵', start: '226-02-18', end: '2026-02-20', extendedProps: { type: 'leave', descriptio0n: '조직 문화 개선을 위한 팀 빌딩' }, color: '#dd6b20' },
        { title: '경력직 최종 합격자 오리엔테이션', start: '2026-02-19T13:00:00', extendedProps: { type: 'recruit', description: '입사 서류 안내 및 회사 투어' }, color: '#38a169' },
        { title: '성희롱 예방 교육', start: '2026-02-23T15:00:00', extendedProps: { type: 'education', description: '대강당 오프라인 교육' }, color: '#553c9a' },
        { title: 'IT지원팀 정기 휴무', start: '2026-02-24', extendedProps: { type: 'leave', description: '부서 전체 권장 휴가일' }, color: '#dd6b20' },
        { title: '상반기 공채 면접 결과 발표', start: '2026-02-26', extendedProps: { type: 'recruit', description: '개별 SMS 및 이메일 발송' }, color: '#38a169' },
        { title: '월간 성과 지표 보고', start: '2026-02-27T16:00:00', extendedProps: { type: 'education', description: '부서별 성과 취합 및 발표' }, color: '#553c9a' },
        { title: 'Java Spring Boot 교육', start: '2026-02-12', end: '2026-02-15', extendedProps: { type: 'education', description: '3일 연속 교육' }, color: '#553c9a' },
        { title: '하반기 공채 서류 검토', start: '2026-02-20', end: '2026-02-26', extendedProps: { type: 'recruit', description: '서류 150건 검토' }, color: '#38a169' },
       { 
    title: '2월 전사 핵심 성과 지표 관리', 
    start: '2026-02-01', 
    end: '2026-03-01', 
    extendedProps: { type: 'education', description: '2월 한 달간 진행되는 핵심 KPI 모니터링 기간' }, 
    color: '#553c9a' 
}, // 한 달짜리 초장기 막대

{ 
    title: '신규 입사자 수습 평가 주간', 
    start: '2026-02-09', 
    end: '2026-02-14', 
    extendedProps: { type: 'recruit', description: '기획팀/개발팀 신규 입사자 3개월 차 수습 기간 종료 평가' }, 
    color: '#38a169' 
}, // 5일짜리 막대

{ 
    title: '대표님 외부 미팅', 
    start: '2026-02-05T14:00:00', 
    extendedProps: { type: 'leave', description: 'VC 미팅 및 투자 관련 외부 일정' }, 
    color: '#dd6b20' 
}, // 당일 (Dot)

{ 
    title: '사내 보안 시스템 업그레이드', 
    start: '2026-02-11', 
    end: '2026-02-13', 
    extendedProps: { type: 'education', description: '전사 PC 보안 솔루션 업데이트 및 점검' }, 
    color: '#553c9a' 
}, // 2일짜리 막대

{ 
    title: '마케팅팀 컨셉 회의', 
    start: '2026-02-12T15:30:00', 
    extendedProps: { type: 'education', description: '3월 캠페인 기획안 초안 검토' }, 
    color: '#553c9a' 
}, // 당일 (Dot)

{ 
    title: '테크니컬 라이터 상시 채용 면접', 
    start: '2026-02-16', 
    end: '2026-02-18', 
    extendedProps: { type: 'recruit', description: '문서화 전문가 채용을 위한 1차 실무진 면접' }, 
    color: '#38a169' 
}, // 2일짜리 막대

{ 
    title: '개인 휴가 (장기)', 
    start: '2026-02-23', 
    end: '2026-02-28', 
    extendedProps: { type: 'leave', description: '리프레시 휴가 및 가계사정' }, 
    color: '#dd6b20' 
}, // 5일짜리 막대

{ 
    title: '서버 정기 점검 공지', 
    start: '2026-02-28T23:00:00', 
    extendedProps: { type: 'education', description: '심야 서버 패치 작업' }, 
    color: '#553c9a' 
} // 당일 (Dot)
    ];

    // [중요 로직] 하루/장기 구분 전처리
    const processedEvents = allEventsRaw.map(ev => {
        let n = Object.assign({}, ev);
        // end가 있고 start와 날짜가 다르면 막대(allDay), 아니면 점(dot)
        if (n.end && n.start.split('T')[0] !== n.end.split('T')[0]) {
            n.allDay = true;
            n.classNames = ['type-bar'];
        } else {
            n.allDay = false;
            n.classNames = ['type-dot'];
        }
        return n;
    });

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'ko',
        height: '100%',
        expandRows: true,
        headerToolbar: { left: 'prev,next today', center: 'title', right: '' },
        eventDisplay: 'block',
        displayEventTime: false,
        dayMaxEventRows: 3,

        // 필터링 적용
        events: function(info, successCallback) {
            const checkedTypes = Array.from(document.querySelectorAll('.filter-chk:checked')).map(el => el.value);
            successCallback(processedEvents.filter(e => checkedTypes.includes(e.extendedProps.type)));
        },

        // 점/막대 개별 스타일 적용
        eventDidMount: function(info) {
            const color = info.event.backgroundColor || info.event.extendedProps.color;
            if (info.event.classNames.includes('type-dot')) {
                // 당일 일정: 배경 투명 + 앞점 추가
                info.el.style.backgroundColor = 'transparent';
                info.el.style.borderColor = 'transparent';
                const dot = `<span style="background-color:${color}; width:7px; height:7px; border-radius:50%; display:inline-block; margin-right:5px; flex-shrink:0;"></span>`;
                const titleEl = info.el.querySelector('.fc-event-title');
                if (titleEl) {
                    titleEl.insertAdjacentHTML('beforebegin', dot);
                    titleEl.style.color = '#334155';
                }
            } else {
                // 장기 일정: 막대 색상 강제 주입
                info.el.style.setProperty('background-color', color, 'important');
                info.el.style.setProperty('border-color', color, 'important');
            }
        },

        dateClick: (info) => openDayListModal(info.dateStr),
        eventClick: (info) => showEventDetail(info.event)
    });

    calendar.render();

    // --- 모달 및 기타 로직 (형님 코드 그대로 유지) ---
    function openDayListModal(dateStr) {
        document.getElementById('dayListTitle').innerText = dateStr + " 일정";
        const container = document.getElementById('dayListContainer');
        container.innerHTML = '';
        const dayEvents = calendar.getEvents().filter(e => e.startStr.split('T')[0] === dateStr);
        if (dayEvents.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:20px; color:#999;">일정이 없습니다.</div>';
        } else {
            dayEvents.forEach(e => {
                const item = document.createElement('div');
                item.className = 'day-list-item';
                item.style.cssText = `display:flex; justify-content:space-between; align-items:center; padding:10px; margin-bottom:8px; background:#fdfdfd; border-left:4px solid ${e.backgroundColor}; border-radius:4px; box-shadow:0 1px 3px rgba(0,0,0,0.1); cursor:pointer;`;
                item.innerHTML = `<div><div style="font-weight:bold; font-size:14px;">${e.title}</div><div style="font-size:12px; color:#666;">상세보기</div></div>`;
                item.onclick = () => { dayListModal.style.display = 'none'; showEventDetail(e); };
                container.appendChild(item);
            });
        }
        dayListModal.style.display = 'block';
    }

    function showEventDetail(eventObj) {
        const props = eventObj.extendedProps;
        document.getElementById('modalTitle').innerText = eventObj.title;
        document.getElementById('modalDescription').innerText = props.description || '상세 내용이 없습니다.';
        document.getElementById('modalTypeDot').style.backgroundColor = eventObj.backgroundColor;
        eventModal.style.display = 'block';
    }

    // 필터 연동
    document.querySelectorAll('.filter-chk').forEach(chk => {
        chk.addEventListener('change', () => calendar.refetchEvents());
    });

    closeBtn.onclick = () => eventModal.style.display = 'none';
    closeDayBtn.onclick = () => dayListModal.style.display = 'none';
    window.onclick = (e) => {
        if (e.target === eventModal) eventModal.style.display = 'none';
        if (e.target === dayListModal) dayListModal.style.display = 'none';
    };

    // 제목 클릭 시 month picker (형님 로직 보존)
    const titleEl = document.querySelector('.fc-toolbar-title');
    if (titleEl) {
        titleEl.style.cursor = "pointer";
        const dateInput = document.createElement('input');
        dateInput.type = 'month';
        dateInput.style.cssText = "position:absolute; opacity:0; width:1px; height:1px;";
        titleEl.after(dateInput);
        titleEl.onclick = () => dateInput.showPicker();
        dateInput.onchange = (e) => { if (e.target.value) calendar.gotoDate(e.target.value); };
    }
});