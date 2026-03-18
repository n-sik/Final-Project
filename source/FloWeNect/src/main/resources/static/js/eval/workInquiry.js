/**
 * WorkApp - 계층형 아코디언 업무 조회 모듈
 */
const WorkApp = {
	config: {
		empListUrl: '/rest/leader/work/readList',
		projectUrl: '/rest/leader/projects',
		kpiUrl: '/rest/leader/kpis',
		taskUrl: '/rest/leader/tasks',
		logUrl: '/rest/leader/logs',
		personalWorkUrl: '/rest/leader/personal-tasks',
		workListUrl: '/rest/leader/work-list'
	},

	state: {
		empGrid: null,
		selectedMember: null,
		currentType: 'PROJECT'
	},

	init: function() {
		this.initEmpGrid();
		this.fetchEmpList();
		this.renderInitView();
	},

	// 중복 제거: 상단 버전 유지
	switchWorkType: function(type) {
		this.state.currentType = type;

		const label = document.getElementById('projectLabel');
		if (label) label.innerText = type === 'PROJECT' ? "대상 프로젝트" : "대상 업무";

		document.querySelectorAll('.work-tab').forEach(tab => {
			tab.classList.toggle('active', tab.innerText.includes(type === 'PROJECT' ? '프로젝트' : '개인'));
		});

		if (this.state.selectedMember) {
			this.updateSearchSelect();
			const projCont = document.getElementById('projectAccordionContainer');
			const persCont = document.getElementById('personalWorkContainer');

			if (projCont) projCont.classList.toggle('active', type === 'PROJECT');
			if (persCont) persCont.classList.toggle('active', type === 'PERSONAL');

			this.onSearch();
		}
	},

	initEmpGrid: function() {
		const gridDiv = document.querySelector('#deptEmpGrid');
		if (!gridDiv) return;

		this.state.empGrid = agGrid.createGrid(gridDiv, {
			theme: 'legacy',
			defaultColDef: { flex: 1, resizable: false, sortable: true, suppressMovable: true },
			suppressCellFocus: true,
			columnDefs: [
				{ headerName: "사번", field: "empNo" },
				{ headerName: "성명", field: "empNm" },
				{ headerName: "직급", field: "posNm" }
			],
			onRowDoubleClicked: (p) => this.selectMember(p.data)
		});
	},

	updateSearchSelect: function() {
		const emp = this.state.selectedMember;
		if (!emp) return;

		const type = this.state.currentType;
		const isProj = type === 'PROJECT';
		const url = isProj ? `${this.config.projectUrl}/${emp.empNo}` : `${this.config.personalWorkUrl}/${emp.empNo}`;

		axios.get(url).then(res => {
			const selectBox = document.getElementById('searchProjectNo');
			if (!selectBox) return; // 셀렉트박스 부재 시 방어 코드
			selectBox.innerHTML = '<option value="">전체</option>';

			(res.data || []).forEach(item => {
				const opt = document.createElement('option');
				opt.value = isProj ? (item.projectNo || item.PROJECT_NO) : (item.taskNo || item.TASK_NO);
				opt.text = isProj ? (item.projectNm || item.PROJECT_NM) : (item.taskTitle || item.TASK_TITLE);

				if (opt.value) selectBox.appendChild(opt);
			});
		}).catch(err => console.error(`${type} 목록 로드 실패:`, err));
	},

	fetchEmpList: function() {
		axios.get(this.config.empListUrl).then(res => {
			this.state.empGrid.setGridOption('rowData', res.data?.deptList || []);
		});
	},

	onSearch: function() {
		const emp = this.state.selectedMember;

		if (!emp) {
			Swal.fire({ icon: 'warning', title: '사원 미선택', text: '사원을 선택해주세요.' });
			return;
		}

		const kwInput = document.querySelector('#searchKeyword');
		const sDateInput = document.querySelector('#startDate');
		const eDateInput = document.querySelector('#endDate');
		const projectSelect = document.querySelector('#searchProjectNo');
		const keyword = kwInput ? kwInput.value.trim() : '';
		const sDate = sDateInput ? sDateInput.value : '';
		const eDate = eDateInput ? eDateInput.value : '';
		const selectVal = projectSelect ? projectSelect.value : '';

		const params = {
			empNo: emp.empNo,
			deptCd: emp.deptCd,
			searchType: this.state.currentType,
			startDate: sDate,
			endDate: eDate,
			searchKeyword: keyword
		};

		if (this.state.currentType === 'PROJECT') {
			params.projectNo = selectVal;
		} else {
			params.taskNo = selectVal;
		}

		axios.get(this.config.workListUrl, { params })
			.then(res => {
				console.log(res);
				const data = res.data || [];

				if (this.state.currentType === 'PROJECT') {
					this.renderProjectAccordion(data);
				} else {
					this.renderPersonalTasks(data);
				}
			})
			.catch(err => {
				console.error("조회 실패:", err);
				Swal.fire({ icon: 'error', title: '조회 실패', text: '조회 중 오류가 발생했습니다.' });
			});
	},

	renderPersonalTasks: function(data) {
		const container = document.getElementById('personalWorkContainer');
		if (!container) return;

		if (!data || data.length === 0) {
			container.innerHTML = `<div class="empty-msg-card"><h5>조회된 개인 업무가 없습니다.</h5></div>`;
			return;
		}

		// 개인 업무 전용 상단 바
		const headerHtml = `
   		 <div class="summary-info-area">
            <i class="fas fa-user-check"></i>
            <span class="summary-count-text">총 <b>${data.length}</b>건의 개인업무 </span>
         </div>
       `;

		const listHtml = data.map(p => {
			const id = p.PROJECT_NO;
			const title = p.PROJECT_NM || "제목 없음";
			const desc = p.PROJECT_DESC || p.TASK_CN || "상세 내용이 없습니다.";
			const rate = parseInt(p.PROGRESS_RATE || 0);

			return `
        <div class="personal-task-card">
            <div class="personal-card-header" onclick="WorkApp.loadLogs(this, ${id})">
                <div class="personal-title-area">
                    <span class="personal-badge">개인업무</span>
                    <strong class="personal-title-text">${title}</strong>
                    <p class="personal-desc-text">${desc}</p>
                </div>
                
                <div class="personal-right-area">
                    <div class="personal-rate-info">
                        <span class="rate-num">${rate}%</span>
                        <div class="mini-progress-bg">
                            <div class="mini-progress-fill" style="width: ${rate}%"></div>
                        </div>
                    </div>
                    <i class="fas fa-chevron-right personal-arrow"></i>
                </div>
            </div>
            <div class="accordion-content log-area-wrapper"></div>
        </div>`;
		}).join('');

		container.innerHTML = headerHtml + `<div class="personal-list-wrapper">${listHtml}</div>`;
	},

	renderInitView: function() {
		const root = document.getElementById('workContentRoot');
		if (!root) return;

		root.innerHTML = `
        <div id="initMsgWrapper" class="initial-msg-wrapper">
            <div class="initial-msg-card">
                <div class="msg-icon-container">
                    <i class="fas fa-search-plus"></i>
                    <div class="icon-pulse"></div>
                </div>
                <div class="msg-text-content">
                    <h3>업무 현황 조회</h3>
                    <p class="main-instruction">좌측 명단에서 성명을 <strong>더블클릭</strong>하세요.</p>
                </div>
            </div>
        </div>`;
	},

	selectMember: function(data) {
		this.state.selectedMember = data;
		const root = document.getElementById('workContentRoot');
		if (!root) return;

		const isProj = this.state.currentType === 'PROJECT';

		root.innerHTML = `
    <div id="mainWorkContent" class="main-work-content initial-fade-in">
        <div class="selected-info-area">
            <span id="selectedMemberInfo">${data.empNm} ${data.posNm} 업무 현황</span>
        </div>
        <div class="work-type-tabs">
            <div class="work-tab ${isProj ? 'active' : ''}" onclick="WorkApp.switchWorkType('PROJECT')">
                <i class="fas fa-project-diagram"></i> 프로젝트 업무
            </div>
            <div class="work-tab ${!isProj ? 'active' : ''}" onclick="WorkApp.switchWorkType('PERSONAL')">
                <i class="fas fa-user-tag"></i> 개인 업무
            </div>
        </div>
        <div id="projectAccordionContainer" class="work-content-pane ${isProj ? 'active' : ''}"></div>
        <div id="personalWorkContainer" class="work-content-pane ${!isProj ? 'active' : ''}"></div>
    </div>`;

		this.updateSearchSelect();
		this.onSearch();
	},

	renderProjectAccordion: function(projects) {
		const container = document.getElementById('projectAccordionContainer');
		if (!container) return;

		const allProjects = projects || [];
		if (allProjects.length === 0) {
			container.innerHTML = `<div class="empty-msg-card"><h5>조회된 프로젝트가 없습니다.</h5></div>`;
			return;
		}

		// 상단 요약 정보
		const summaryHtml = `
        <div class="summary-info-area">
            <i class="fas fa-layer-group"></i>
            <span class="summary-count-text">총 <b>${allProjects.length}</b>건의 프로젝트 현황</span>
        </div>`;

		const listHtml = allProjects.map(p => {
			const id = p.PROJECT_NO;
			const title = p.PROJECT_NM || "제목 없음";
			const desc = p.PROJECT_DESC || "상세 설명이 없습니다.";
			const start = (p.START_DTM || "").split('T')[0];
			const end = (p.END_DTM || "").split('T')[0];
			const isIng = p.PROJECT_STAT_CD === "ING";
			const statText = isIng ? "진행 중" : "종료";
			const statClass = isIng ? "stat-ing" : "stat-end";

			return `
        <div class="accordion-item project-item">
            <div class="accordion-header project-main-header" onclick="WorkApp.loadKpis(this, ${id})">
                <div class="project-info-container">
                    <div class="project-main-info">
                        <div class="title-row">
                            <span class="status-badge ${statClass}">${statText}</span>
                            <span class="proj-name"><strong>${title}</strong></span>
                            <span class="proj-date-range">
                                <i class="far fa-calendar-alt"></i> ${start} ~ ${end}
                            </span>
                        </div>
                        <div class="proj-desc-text">${desc}</div>
                    </div>
                </div>
            </div>
            <div class="accordion-content"></div>
        </div>`;
		}).join('');

		container.innerHTML = summaryHtml + listHtml;
	},

	loadKpis: function(headerEl, projNo) {
		const contentEl = headerEl.nextElementSibling;
		contentEl.classList.toggle('active');
		if (contentEl.classList.contains('active') && contentEl.innerHTML === "") {
			axios.get(`${this.config.kpiUrl}/${projNo}/${this.state.selectedMember.empNo}`).then(res => {
				console.log(res)
				contentEl.innerHTML = this.renderKpiItems(res.data);
			});
		}
	},

	renderKpiItems: function(data) {
		if (!data || data.length === 0) return `<p class="empty-msg">등록된 KPI가 없습니다.</p>`;

		return data.map(k => {
			const kno = k.kpiNo;
			const knm = k.kpiNm || "KPI 명칭 없음";
			const kcn = k.kpiCn || "상세 내용이 없습니다.";
			const krate = parseInt(k.progressRate || 0);

			return `
        <div class="accordion-item kpi-item">
            <div class="accordion-header kpi-header" onclick="WorkApp.loadTasks(this, ${kno})">
                <div class="kpi-main-info">
                    <div class="kpi-title-row">
                        <span class="kpi-badge">KPI</span>
                        <span class="kpi-name-text"><strong>${knm}</strong></span>
                    </div>
                    <p class="kpi-desc-text">${kcn}</p>
                </div>
                
                <div class="kpi-progress-box">
                    <div class="kpi-progress-label">
                        <span>달성률</span>
                        <strong>${krate}%</strong>
                    </div>
                    <div class="kpi-bar-wrapper">
                        <div class="kpi-bar-fill" style="width: ${krate}%"></div>
                    </div>
                </div>
                
                <div class="kpi-arrow">
                    <i class="fas fa-chevron-down"></i>
                </div>
            </div>
            <div class="accordion-content"></div>
        </div>`;
		}).join('');
	},
	loadTasks: function(headerEl, kpiNo) {
		const contentEl = headerEl.nextElementSibling;
		contentEl.classList.toggle('active');
		if (contentEl.classList.contains('active') && contentEl.innerHTML === "") {
			axios.get(`${this.config.taskUrl}/${kpiNo}?empNo=${this.state.selectedMember.empNo}`).then(res => {
				contentEl.innerHTML = this.renderTaskItems(res.data);
			});
		}
	},

	fetchPersonalTasks: function() {
		const emp = this.state.selectedMember;
		if (!emp) return;

		const keyword = document.getElementById('searchKeyword')?.value.trim() || '';
		const sDate = document.getElementById('startDate')?.value || '';
		const eDate = document.getElementById('endDate')?.value || '';

		const params = {
			empNo: emp.empNo,
			deptCd: emp.deptCd,
			searchType: 'PERSONAL',
			startDate: sDate,
			endDate: eDate,
			searchKeyword: keyword
		};

		axios.get(this.config.workListUrl, { params }).then(res => {
			this.renderPersonalTasks(res.data || []);
			console.log("🚩 개인 업무 응답 데이터:", res.data);
		}).catch(err => console.error("개인업무 로드 실패:", err));
	},

	renderTaskItems: function(data) {
		if (!data || data.length === 0) return `<div class="empty-task-placeholder"><p>등록된 세부 업무가 없습니다.</p></div>`;

		return data.map(t => {
			const tNo = t.TASK_NO || t.taskNo;
			const tTitle = t.TASK_TITLE || t.taskTitle || "제목 없음";
			// 업무 내용 필드 (데이터 구조에 따라 TASK_CN 등으로 수정 가능)
			const tContent = t.TASK_CN || t.taskCn || t.TASK_DESC || t.taskDesc || "상세 업무 내용이 없습니다.";
			const tRate = parseInt(t.PROGRESS_RATE || t.progressRate || 0);

			return `
        <div class="accordion-item task-item">
            <div class="accordion-header task-header-flex" onclick="WorkApp.loadLogs(this, ${tNo})">
                <div class="task-main-info">
                    <div class="task-title-area">
                        <span class="task-badge">업무</span>
                        <span class="task-name-text"><strong>${tTitle}</strong></span>
                    </div>
                    <p class="task-desc-text">${tContent}</p>
                </div>
                
                <div class="task-info-right">
                    <span class="task-rate-num">${tRate}%</span>
                    <div class="task-arrow">
                        <i class="fas fa-chevron-right"></i>
                    </div>
                </div>
            </div>
            <div class="accordion-content"></div> 
        </div>`;
		}).join('');
	},

	loadLogs: function(headerEl, taskNo) {
		const contentEl = headerEl.nextElementSibling;
		if (!contentEl) return;

		contentEl.classList.toggle('active');

		if (contentEl.classList.contains('active') && contentEl.innerHTML.trim() === "") {
			contentEl.innerHTML = '<div class="loading-log">일지를 불러오는 중...</div>';
			axios.get(`${this.config.logUrl}/${taskNo}`).then(res => {
				contentEl.innerHTML = this.renderLogItems(res.data);
			}).catch(err => {
				contentEl.innerHTML = '<div class="empty-log">일지 로드에 실패했습니다.</div>';
			});
		}
	},

	renderLogItems: function(data) {
		if (!data || data.length === 0) {
			return `<div class="empty-log-container">
                    <i class="fas fa-info-circle"></i> 등록된 업무 일지가 없습니다.
                </div>`;
		}

		return data.map(l => {
			// 필드명은 DTO와 매칭 (대소문자 확인)
			const title = l.logTitle || l.LOG_TITLE || "제목 없음";
			const content = l.logCn || l.LOG_CN || "내용이 없습니다.";
			const rawDate = l.workDtm || l.WORK_DTM || "";
			const formattedDate = rawDate ? rawDate.split('T')[0] : "";

			return `
        <div class="log-item-container">
            <div class="log-title-row">
                <div class="log-title-left">
                    <span class="log-badge">일일업무일지</span>
                    <strong class="log-title-text">${title}</strong>
                </div>
                <div class="log-info-right">
                    <span class="log-date"><i class="far fa-clock"></i> ${formattedDate}</span>
                </div>
            </div>
            <p class="log-content-text">${content}</p>
        </div>`;
		}).join('');
	}
};

document.addEventListener('DOMContentLoaded', () => WorkApp.init());