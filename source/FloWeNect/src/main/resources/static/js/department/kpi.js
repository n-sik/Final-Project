document.addEventListener('DOMContentLoaded', function() {

	// ── 로그인 부서코드 읽기 (메타태그 → URL파라미터 순)
	const loginDeptCd = document.querySelector('meta[name="loginDeptCd"]')?.content || '';
	const urlDeptCd = new URLSearchParams(window.location.search).get('deptCd') || '';
	const activeDeptCd = urlDeptCd || loginDeptCd;
	const contextPath = document.body.dataset.contextPath || '';

	let state = {
		dept: activeDeptCd,
		projectId: null,
		mainKpiId: null,
		members: []
	};

	// ── 부서원 목록 로드
	function loadDeptMembers(deptCd) {
		if (!deptCd) return;
		fetch(contextPath + '/leader/kpi/readList/getDeptMembers?deptCd=' + encodeURIComponent(deptCd))
			.then(res => {
				if (!res.ok) throw new Error('HTTP error! status: ' + res.status);
				return res.json();
			})
			.then(data => {
				state.members = data || [];
			})
			.catch(err => console.error('❌ 부서원 로드 실패:', err));
	}

	if (state.dept) {
		loadDeptMembers(state.dept);
	}

	const mainKpiList = document.getElementById('mainKpiList');
	const subKpiDetailArea = document.getElementById('subKpiDetailArea');
	const subKpiSavedList = document.getElementById('subKpiSavedList');
	const btnAddMainKpi = document.getElementById('btnAddMainKpi');
	const btnAddSubKpi = document.getElementById('btnAddSubKpi');
	const mainKpiInputArea = document.getElementById('mainKpiInputArea');
	const mainKpiFormTitle = document.getElementById('mainKpiFormTitle');
	const btnSubmitMainKpi = document.getElementById('btnSubmitMainKpi');

	// ── 날짜 포맷
	function fmtDate(dtm) {
		if (!dtm || typeof dtm !== 'string') return '미정';
		return dtm.substring(2, 10).replace(/-/g, '.');
	}

	// ── 프로젝트 active 강조
	function setActiveProject(el) {
		document.querySelectorAll('.project-item').forEach(p => p.classList.remove('active'));
		if (el) el.classList.add('active');
	}

	// ── 프로젝트 클릭 이벤트
	document.querySelectorAll('.project-item').forEach(item => {
		item.addEventListener('click', function() {
			setActiveProject(this);
			state.projectId = this.dataset.projectNo;
			const projectName = this.dataset.projectName || this.innerText.trim();

			const nameDisplay = document.getElementById('selectedProjectName');
			if (nameDisplay) {
				nameDisplay.innerText = projectName;
				nameDisplay.style.display = 'inline-block';
			}
			state.selectedProjectName = projectName;

			btnAddMainKpi.style.display = 'inline-flex';
			const deptSel = document.getElementById('deptSelect');
			const deptNm = deptSel ? deptSel.options[deptSel.selectedIndex].text : '';
			updateHeaderChip(deptNm, projectName);
			resetUI();
			loadMainKpiList();
		});
	});

	// ── 첫 번째 프로젝트 자동 선택
	const firstProject = document.querySelector('.project-item');
	if (firstProject) {
		setActiveProject(firstProject);
		state.projectId = firstProject.dataset.projectNo;
		state.selectedProjectName = firstProject.dataset.projectName || firstProject.innerText.trim();

		const nameDisplay = document.getElementById('selectedProjectName');
		if (nameDisplay) {
			nameDisplay.innerText = state.selectedProjectName;
			nameDisplay.style.display = 'inline-block';
		}
		btnAddMainKpi.style.display = 'inline-flex';

		const deptSel = document.getElementById('deptSelect');
		const deptNm = deptSel ? deptSel.options[deptSel.selectedIndex].text : '';
		updateHeaderChip(deptNm, state.selectedProjectName);
	}

	// ── KPI 목록 로드
	window.loadMainKpiList = function() {
		if (!state.projectId) return;
		mainKpiList.innerHTML = '<div class="empty-state" style="padding:40px; text-align:center; color:#94a3b8;">데이터 로딩 중...</div>';
		fetch(`${contextPath}/leader/kpi/readList/getKpis?projNo=${state.projectId}`)
			.then(res => res.json())
			.then(renderMainKpiList);
	};

	loadMainKpiList();

	function renderMainKpiList(data) {
		mainKpiList.innerHTML = '';
		if (!data || data.length === 0) {
			mainKpiList.innerHTML = '<div class="empty-state">등록된 핵심 KPI가 없습니다.</div>';
			return;
		}

		const typeNmMap = { 'TYPE_01': '정량', 'TYPE_02': '정성', 'TYPE_03': '프로젝트' };

		data.forEach(item => {
			const isActive = state.mainKpiId == item.kpiNo;
			const card = document.createElement('div');
			card.className = 'kpi-card';
			card.style = `
				padding: 10px;
				background: ${isActive ? '#e8f4ff' : '#fff'};
				border: 1px solid ${isActive ? '#007bff' : '#e2e8f0'};
				border-radius: 8px;
				margin-bottom: 15px;
				cursor: pointer;
				transition: all 0.2s;
				box-shadow: ${isActive ? '0 4px 12px rgba(0,123,255,0.12)' : '0 2px 4px rgba(0,0,0,0.02)'};
			`;
			card.innerHTML = `
				<div style="display:flex; justify-content:space-between; align-items:flex-start;">
					<div style="flex:1;">
						<div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
							<span style="background:${isActive ? '#007bff' : '#f1f5f9'}; color:${isActive ? '#fff' : '#64748b'}; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:bold;">
								${typeNmMap[item.kpiTypeCd] || '일반'}
							</span>
							<strong style="font-size:16px; color:#1e293b;">${item.kpiNm}</strong>
						</div>
						<div style="font-size:12px; color:#94a3b8;">기간: ${fmtDate(item.startDtm)} ~ ${fmtDate(item.endDtm)}</div>
					</div>
					<div style="text-align:right;">
						<button onclick="event.stopPropagation(); openMainKpiForm(${item.kpiNo})"
							style="padding:4px 10px; font-size:12px; border:1px solid #e2e8f0; background:#fff; border-radius:6px; cursor:pointer; margin-bottom:8px;">수정</button>
						<div style="font-size:20px; font-weight:800; color:#007bff;">${item.progressRate}%</div>
					</div>
				</div>
				<div style="margin-top:15px; background:#e2e8f0; height:6px; border-radius:3px; overflow:hidden;">
					<div style="width:${item.progressRate}%; background:linear-gradient(90deg,#007bff,#66b2ff); height:100%; transition:width 0.5s;"></div>
				</div>
			`;
			card.onclick = () => selectMainKpi(item);
			mainKpiList.appendChild(card);
		});
	}

	// ── 헤더 칩 업데이트
	function updateHeaderChip(deptName, projectName) {
		const chip = document.getElementById('headerChip');
		const deptEl = document.getElementById('headerDept');
		const projEl = document.getElementById('headerProject');
		if (chip && deptEl && projEl) {
			deptEl.textContent = deptName || '';
			projEl.textContent = projectName || '';
			chip.style.display = 'flex';
		}
	}

	// ── KPI 선택
	window.selectMainKpi = function(item) {
		state.mainKpiId = item.kpiNo;
		document.getElementById('detailHeaderTitle').innerText = `[${item.kpiNm}] 개인 업무 목록`;
		subKpiDetailArea.innerHTML = `
			<div style="display:flex; align-items:center; justify-content:center;
				min-height:180px; padding:20px; color:#94a3b8; font-size:13px;
				text-align:center; line-height:1.8;">
				+ 개인업무 부여 버튼을 눌러주세요.
			</div>`;
		if (btnAddSubKpi) btnAddSubKpi.style.display = 'block';
		loadMainKpiList();
		loadTaskList(item.kpiNo);
	};

	if (btnAddMainKpi) {
		btnAddMainKpi.addEventListener('click', function() {
			if (!state.projectId) {
				Swal.fire({ icon: 'warning', title: '프로젝트를 먼저 선택해주세요.', confirmButtonText: '확인', confirmButtonColor: '#007bff' });
				return;
			}
			openMainKpiForm();
		});
	}

	// ── KPI 등록/수정 폼
	window.openMainKpiForm = function(kpiNo = null) {
		mainKpiInputArea.style.display = 'block';
		btnAddMainKpi.style.display = 'none';

		const projNameInput = document.getElementById('displayProjName');
		if (projNameInput) projNameInput.value = state.selectedProjectName || '';

		const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
			.toISOString().split('T')[0];

		if (kpiNo) {
			mainKpiFormTitle.innerText = '핵심 KPI 수정';
			fetch(`${contextPath}/leader/kpi/readList/getKpiDetail?kpiNo=${kpiNo}`)
				.then(res => res.json())
				.then(data => {
					document.getElementById('newMainKpiTitle').value = data.kpiNm;
					document.getElementById('newMainKpiCn').value = data.kpiCn;
					document.getElementById('newMainKpiType').value = data.kpiTypeCd;
					if (data.startDtm) document.getElementById('newMainStartDtm').value = data.startDtm.substring(0, 10);
					if (data.endDtm) document.getElementById('newMainEndDtm').value = data.endDtm.substring(0, 10);
					quickSetProgress(data.progressRate || 0);
				});
		} else {
			mainKpiFormTitle.innerText = '새 핵심 KPI 등록';
			document.getElementById('newMainKpiTitle').value = '';
			document.getElementById('newMainKpiCn').value = '';
			document.getElementById('newMainKpiType').value = 'TYPE_01';
			document.getElementById('newMainStartDtm').value = today;
			quickSetProgress(0);
		}

		btnSubmitMainKpi.onclick = () => saveMainKpi(kpiNo);
		setTimeout(() => {
			const container = mainKpiList.parentElement;
			if (container) container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
		}, 100);
	};

	window.saveMainKpi = function(kpiNo) {
		const data = {
			kpiNo,
			projNo: state.projectId,
			kpiNm: document.getElementById('newMainKpiTitle').value,
			kpiCn: document.getElementById('newMainKpiCn').value,
			kpiTypeCd: document.getElementById('newMainKpiType').value,
			progressRate: document.getElementById('newMainKpiProgress').value,
			startDtm: document.getElementById('newMainStartDtm').value,
			endDtm: document.getElementById('newMainEndDtm').value,
			useYn: 'Y'
		};
		if (!data.kpiNm) {
			Swal.fire({ icon: 'warning', title: 'KPI 명칭을 입력하세요.', confirmButtonText: '확인', confirmButtonColor: '#007bff' });
			return;
		}

		fetch(kpiNo ? `${contextPath}/leader/kpi/readList/update` : `${contextPath}/leader/kpi/readList/register`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		})
			.then(res => { if (!res.ok) throw new Error('네트워크 오류'); return res.text(); })
			.then(() => {
				Swal.fire({ icon: 'success', title: '저장되었습니다.', confirmButtonText: '확인', confirmButtonColor: '#007bff' })
					.then(() => {
						hideMainKpiForm();
						loadMainKpiList();
					});
			})
			.catch(err => {
				console.error('KPI 저장 오류:', err);
				Swal.fire({ icon: 'error', title: '저장 중 오류가 발생했습니다.', confirmButtonText: '확인' });
			});
	};

	// ── 세부 과제 폼
	window.openSubKpiForm = function() {
		if (!state.mainKpiId) {
			Swal.fire({ icon: 'warning', title: '핵심 KPI를 먼저 선택해주세요.', confirmButtonText: '확인', confirmButtonColor: '#007bff' });
			return;
		}

		const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
			.toISOString().split('T')[0];

		const memberList = state.members || [];
		let memberOptions = memberList.length === 0
			? '<option value="">사원 정보를 불러오는 중...</option>'
			: '<option value="">담당자를 선택하세요</option>';
		memberList.forEach(m => {
			memberOptions += `<option value="${m.empNo}">${m.empNm} (${m.empNo})</option>`;
		});

		subKpiDetailArea.innerHTML = `
	<div id="subTaskFormContainer" style="padding:10px; background:#fff; border:1px solid #f1f5f9;">
		<div style="margin-bottom:8px; font-weight:bold; color:#007bff; font-size:14px;">세부 과제 등록</div>
		<input type="text" id="subTitle" placeholder="어떤 업무를 진행하나요?"
			style="width:100%; padding:10px; margin-bottom:6px; border:1px solid #e2e8f0; box-sizing:border-box;">
		<textarea id="subContent" placeholder="상세한 업무 내용을 입력하세요."
			style="width:100%; height:60px; padding:10px; margin-bottom:6px; border:1px solid #e2e8f0; resize:none; box-sizing:border-box;"></textarea>
		<div style="margin-bottom:6px;">
			<label style="font-size:11px; color:#64748b; display:block; margin-bottom:2px;">담당자</label>
			<select id="subManager" style="width:100%; padding:8px; border:1px solid #e2e8f0; box-sizing:border-box;">${memberOptions}</select>
		</div>
		<div style="display:flex; gap:8px; margin-bottom:10px;">
			<div style="flex:1;">
				<label style="font-size:11px; color:#64748b; display:block; margin-bottom:2px;">시작일</label>
				<input type="date" id="subStartDtm" value="${today}" style="width:100%; padding:8px; border:1px solid #e2e8f0; box-sizing:border-box;">
			</div>
			<div style="flex:1;">
				<label style="font-size:11px; color:#64748b; display:block; margin-bottom:2px;">종료일</label>
				<input type="date" id="subEndDtm" value="${today}" style="width:100%; padding:8px; border:1px solid #e2e8f0; box-sizing:border-box;">
			</div>
		</div>
		<input type="hidden" id="subTaskStatus" value="진행중">
		<div style="display:flex; gap:8px; margin-bottom:10px;">
			<button type="button" onclick="saveTask()"
				style="flex:1; padding:13px; background:#007bff; color:#fff; border:none;
					cursor:pointer; font-weight:700; font-size:14px; border-radius:8px;
					font-family:inherit; transition:background 0.2s;">
				과제 저장하기
			</button>
			<button type="button" onclick="document.getElementById('subKpiDetailArea').innerHTML=''"
				style="padding:13px 18px; background:#fff; color:#94a3b8;
					border:1px solid #e2e8f0; cursor:pointer; font-size:13px;
					border-radius:8px; font-family:inherit; transition:all 0.2s;">
				취소
			</button>
		</div>
	</div>`;

		setTimeout(() => {
			const panelRight = document.querySelector('.p-right');
			if (panelRight) panelRight.scrollTo({ top: panelRight.scrollHeight, behavior: 'smooth' });
		}, 100);
	};

	window.setTaskStatus = function(type) {
		const progressBtn = document.getElementById('statusBtnProgress');
		const doneBtn = document.getElementById('statusBtnDone');
		const hiddenInput = document.getElementById('subTaskStatus');

		if (type === 'progress') {
			if (progressBtn) {
				progressBtn.style.background = '#f59e0b';
				progressBtn.style.color = '#fff';
				progressBtn.style.borderColor = '#f59e0b';
			}
			if (doneBtn) {
				doneBtn.style.background = '#fff';
				doneBtn.style.color = '#94a3b8';
				doneBtn.style.borderColor = '#e2e8f0';
			}
			if (hiddenInput) hiddenInput.value = '진행중';
		} else {
			if (doneBtn) {
				doneBtn.style.background = '#00d25b';
				doneBtn.style.color = '#fff';
				doneBtn.style.borderColor = '#00d25b';
			}
			if (progressBtn) {
				progressBtn.style.background = '#fff';
				progressBtn.style.color = '#94a3b8';
				progressBtn.style.borderColor = '#e2e8f0';
			}
			if (hiddenInput) hiddenInput.value = '완료';
		}
	};

	if (btnAddSubKpi) btnAddSubKpi.onclick = window.openSubKpiForm;

	// ── 세부 과제 저장
	window.saveTask = function() {
		const statusVal = (document.getElementById('subTaskStatus') || {}).value || '진행중';
		const isDone = statusVal === '완료';

		const data = {
			projNo: state.projectId,
			kpiNo: state.mainKpiId,
			deptCd: state.dept,
			taskTitle: document.getElementById('subTitle').value,
			taskCn: document.getElementById('subContent').value,
			empNo: document.getElementById('subManager').value,
			taskStartDtm: document.getElementById('subStartDtm').value,
			taskEndDtm: document.getElementById('subEndDtm').value,
			taskStatCd: statusVal,
			progressRate: isDone ? 100 : 0
		};

		if (!data.taskTitle || !data.empNo) {
			Swal.fire({ icon: 'warning', title: '과제명과 담당자는 필수입니다.', confirmButtonText: '확인', confirmButtonColor: '#007bff' });
			return;
		}
		if (!data.taskStartDtm || !data.taskEndDtm) {
			Swal.fire({ icon: 'warning', title: '시작일과 종료일을 입력해주세요.', confirmButtonText: '확인', confirmButtonColor: '#007bff' });
			return;
		}

		fetch(`${contextPath}/leader/kpi/readList/registerTask`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		})
			.then(res => res.text())
			.then(result => {
				if (result === 'success') {
					Swal.fire({ icon: 'success', title: '성공적으로 등록되었습니다.', confirmButtonText: '확인', confirmButtonColor: '#007bff' })
						.then(() => {
							subKpiDetailArea.innerHTML = '';
							window.loadTaskList(state.mainKpiId);
						});
				} else {
					Swal.fire({ icon: 'error', title: '등록에 실패했습니다.', confirmButtonText: '확인' });
				}
			})
			.catch(err => {
				console.error('❌ 저장 오류:', err);
				Swal.fire({ icon: 'error', title: '저장 중 오류가 발생했습니다.', confirmButtonText: '확인' });
			});
	};

	// ── 개인 업무 목록 로드
	window.loadTaskList = function(kpiNo) {
		subKpiSavedList.innerHTML = '<div style="text-align:center; padding:20px;">목록 로딩 중...</div>';
		fetch(`${contextPath}/leader/kpi/readList/getTaskList?kpiNo=${kpiNo}`)
			.then(res => res.json())
			.then(data => renderTaskList(data));
	};

	function renderTaskList(data) {
		subKpiSavedList.innerHTML = '';
		if (!data || data.length === 0) {
			subKpiSavedList.innerHTML = `
				<div style="display:flex; flex-direction:column; align-items:center; justify-content:center;
					min-height:350px; color:#94a3b8; font-size:14px; text-align:center; gap:10px;">
					<div style="font-size:36px;">📋</div>
					<div>등록된 개인 업무가 없습니다.</div>
				</div>`;
			return;
		}
		data.forEach(item => {
			const managerDisplay = item.empNm ? `${item.empNm} (${item.empNo})` : item.empNo;
			const sDate = (item.taskStartDtm || item.startDtm || '').substring(0, 10) || '미정';
			const eDate = (item.taskEndDtm || item.endDtm || '').substring(0, 10) || '미정';

			subKpiSavedList.insertAdjacentHTML('beforeend', `
			<div onclick="openTaskDetail(${item.taskNo})"
				style="cursor:pointer; padding:18px; border-left:4px solid #007bff; background:#fff;
					border-radius:12px; margin-bottom:12px; box-shadow:0 2px 8px rgba(0,0,0,0.04);
					display:flex; justify-content:space-between; align-items:center;">
				<div>
					<div style="font-weight:bold; color:#1e293b; margin-bottom:4px; font-size:15px;">${item.taskTitle}</div>
					<div style="font-size:12px; color:#64748b;">
						<span style="color:#007bff; font-weight:bold;">${item.taskStatCd}</span> | 담당자: ${managerDisplay}
					</div>
					<div style="font-size:11px; color:#94a3b8; margin-top:4px;">기간: ${sDate} ~ ${eDate}</div>
				</div>
				<div style="text-align:right;">
					<div style="font-size:10px; color:#94a3b8;">등록일: ${item.regDtm}</div>
				</div>
			</div>`);
		});
		subKpiSavedList.scrollTo({ top: subKpiSavedList.scrollHeight, behavior: 'smooth' });
	}

	// ── 진행률 슬라이더
	window.quickSetProgress = function(val) {
		const slider = document.getElementById('newMainKpiProgress');
		const display = document.getElementById('displayProgress');
		if (slider) {
			slider.value = val;
			display.innerText = val + '%';
			slider.style.background = `linear-gradient(to right, #007bff 0%, #007bff ${val}%, #ddd ${val}%, #ddd 100%)`;
		}
	};

	window.hideMainKpiForm = function() {
		mainKpiInputArea.style.display = 'none';
		if (state.projectId) btnAddMainKpi.style.display = 'inline-flex';
	};

	function resetUI() {
		mainKpiList.innerHTML = '';
		subKpiDetailArea.innerHTML = '';
		subKpiSavedList.innerHTML = `
			<div style="display:flex; flex-direction:column; align-items:center; justify-content:center;
				min-height:350px; color:#94a3b8; font-size:14px; text-align:center; gap:10px;">
				<div style="font-size:36px;">📋</div>
				<div>KPI를 선택해주세요.</div>
			</div>`;
		btnAddSubKpi.style.display = 'none';
		hideMainKpiForm();
	}

	const progressSlider = document.getElementById('newMainKpiProgress');
	if (progressSlider) {
		progressSlider.addEventListener('input', function() { quickSetProgress(this.value); });
	}

	// ── 과제 상세 모달
	window.openTaskDetail = function(taskNo) {
		const modal = document.getElementById('taskDetailModal');
		const content = document.getElementById('modalContent');
		if (!modal) return;

		modal.style.display = 'flex';
		content.innerHTML = '<div style="text-align:center; padding:20px;">데이터를 불러오는 중...</div>';

		fetch(`${contextPath}/leader/kpi/readList/getTaskDetail?taskNo=${taskNo}`)
			.then(res => res.json())
			.then(data => {
				const sDate = (data.taskStartDtm || data.startDtm || '').substring(0, 10) || '미정';
				const eDate = (data.taskEndDtm || data.endDtm || '').substring(0, 10) || '미정';

				content.innerHTML = `
				<div style="margin-bottom:20px;">
					<label style="font-size:12px; color:#64748b; display:block; margin-bottom:5px;">과제명</label>
					<div style="font-size:18px; font-weight:bold; color:#1e293b;">${data.taskTitle || '제목 없음'}</div>
				</div>
				<div style="margin-bottom:20px;">
					<label style="font-size:12px; color:#64748b; display:block; margin-bottom:5px;">상세 내용</label>
					<div style="background:#f1f5f9; padding:15px; border-radius:8px; min-height:80px; white-space:pre-wrap;">${data.taskCn || '내용 없음'}</div>
				</div>
				<div style="display:flex; gap:20px; margin-bottom:20px;">
					<div style="flex:1;">
						<label style="font-size:12px; color:#64748b; display:block; margin-bottom:5px;">담당자</label>
						<div style="font-weight:bold;">${data.empNm || '없음'} (${data.empNo || '-'})</div>
					</div>
					<div style="flex:1;">
						<label style="font-size:12px; color:#64748b; display:block; margin-bottom:5px;">진행 상태</label>
						<span style="color:#007bff; font-weight:bold;">${data.taskStatCd || '진행중'} (${data.progressRate || 0}%)</span>
					</div>
				</div>
				<div style="margin-bottom:25px;">
					<label style="font-size:12px; color:#64748b; display:block; margin-bottom:5px;">기간</label>
					<div style="font-weight:bold; color:#1e293b;">${sDate} ~ ${eDate}</div>
				</div>
				<button id="detailEditBtn"
					style="width:100%; padding:14px; background:#007bff; color:#fff; border:none;
						border-radius:10px; cursor:pointer; font-weight:bold; font-size:16px;">수정하기</button>`;

				document.getElementById('detailEditBtn').onclick = () => {
					editTask({ ...data, taskNo, startDtm: sDate, endDtm: eDate });
				};
			})
			.catch(err => {
				console.error('❌ 상세 조회 오류:', err);
				content.innerHTML = '<div style="color:red; text-align:center;">정보를 불러오지 못했습니다.</div>';
			});
	};

	window.closeTaskModal = function() {
		const modal = document.getElementById('taskDetailModal');
		if (modal) modal.style.display = 'none';
	};

	// ── 과제 수정
	window.editTask = function(data) {
		closeTaskModal();

		const memberList = state.members || [];
		let memberOptions = memberList.length === 0
			? '<option value="">사원 정보를 불러오는 중...</option>'
			: '';
		memberList.forEach(m => {
			const selected = m.empNo == data.empNo ? 'selected' : '';
			memberOptions += `<option value="${m.empNo}" ${selected}>${m.empNm} (${m.empNo})</option>`;
		});

		const sDate = (data.startDtm && data.startDtm !== '미정') ? data.startDtm.substring(0, 10) : '';
		const eDate = (data.endDtm && data.endDtm !== '미정') ? data.endDtm.substring(0, 10) : '';

		const isDone = (data.taskStatCd === '완료') || (Number(data.progressRate) >= 100);

		const progressStyle = !isDone
			? 'background:#f59e0b; color:#fff; border:2px solid #f59e0b;'
			: 'background:#fff; color:#94a3b8; border:2px solid #e2e8f0;';
		const doneStyle = isDone
			? 'background:#00d25b; color:#fff; border:2px solid #00d25b;'
			: 'background:#fff; color:#94a3b8; border:2px solid #e2e8f0;';

		subKpiDetailArea.innerHTML = `
	<div id="subTaskFormContainer" style="padding:10px; background:#fff; border:1px solid #f1f5f9;">
		<div style="margin-bottom:8px; font-weight:bold; color:#007bff; font-size:14px;">세부 과제 수정</div>
		<input type="text" id="subTitle" value="${data.taskTitle || ''}" placeholder="어떤 업무를 진행하나요?"
			style="width:100%; padding:10px; margin-bottom:6px; border:1px solid #e2e8f0; box-sizing:border-box;">
		<textarea id="subContent"
			style="width:100%; height:60px; padding:10px; margin-bottom:6px; border:1px solid #e2e8f0; resize:none; box-sizing:border-box;">${data.taskCn || ''}</textarea>
		<div style="margin-bottom:6px;">
			<label style="font-size:11px; color:#64748b; display:block; margin-bottom:2px;">담당자</label>
			<select id="subManager" style="width:100%; padding:8px; border:1px solid #e2e8f0; box-sizing:border-box;">${memberOptions}</select>
		</div>
		<div style="display:flex; gap:8px; margin-bottom:10px;">
			<div style="flex:1;">
				<label style="font-size:11px; color:#64748b; display:block; margin-bottom:2px;">시작일</label>
				<input type="date" id="subStartDtm" value="${sDate}" style="width:100%; padding:8px; border:1px solid #e2e8f0; box-sizing:border-box;">
			</div>
			<div style="flex:1;">
				<label style="font-size:11px; color:#64748b; display:block; margin-bottom:2px;">종료일</label>
				<input type="date" id="subEndDtm" value="${eDate}" style="width:100%; padding:8px; border:1px solid #e2e8f0; box-sizing:border-box;">
			</div>
		</div>
		<input type="hidden" id="subTaskStatus" value="${isDone ? '완료' : '진행중'}">
		<div style="background:#f8fafc; border:1px solid #e8edf5; border-radius:12px; padding:14px; margin-bottom:10px;">
			<label style="font-size:11px; color:#64748b; font-weight:600; letter-spacing:0.3px; display:block; margin-bottom:10px;">진행 상태</label>
			<div style="display:flex; gap:8px; margin-bottom:12px;">
				<button type="button" id="statusBtnProgress"
					onclick="setTaskStatus('progress')"
					style="flex:1; padding:10px 0; border-radius:8px; font-size:13px; font-weight:700;
						cursor:pointer; font-family:inherit; transition:all 0.2s; ${progressStyle}">
					⏳ 진행중
				</button>
				<button type="button" id="statusBtnDone"
					onclick="setTaskStatus('done')"
					style="flex:1; padding:10px 0; border-radius:8px; font-size:13px; font-weight:700;
						cursor:pointer; font-family:inherit; transition:all 0.2s; ${doneStyle}">
					✅ 완료
				</button>
			</div>
			<button type="button" onclick="updateTask(${data.taskNo})"
				style="width:100%; padding:13px; background:#007bff; color:#fff; border:none;
					cursor:pointer; font-weight:700; font-size:14px; border-radius:8px;
					font-family:inherit; transition:background 0.2s;">
				수정 완료하기
			</button>
		</div>
		<button type="button" onclick="document.getElementById('subKpiDetailArea').innerHTML=''"
			style="width:100%; padding:10px; background:#fff; color:#94a3b8;
				border:1px solid #e2e8f0; cursor:pointer; font-size:13px;
				border-radius:8px; font-family:inherit; transition:all 0.2s; margin-bottom:10px;">
			취소
		</button>
	</div>`;

		subKpiDetailArea.scrollIntoView({ behavior: 'smooth', block: 'end' });
	};

	window.updateTask = function(taskNo) {
		const statusVal = (document.getElementById('subTaskStatus') || {}).value || '진행중';
		const isDone = statusVal === '완료';

		const data = {
			taskNo,
			taskTitle: document.getElementById('subTitle').value,
			taskCn: document.getElementById('subContent').value,
			empNo: document.getElementById('subManager').value,
			taskStartDtm: document.getElementById('subStartDtm').value,
			taskEndDtm: document.getElementById('subEndDtm').value,
			progressRate: isDone ? 100 : 0,
			taskStatCd: statusVal
		};

		if (!data.taskTitle || !data.empNo) {
			Swal.fire({ icon: 'warning', title: '과제명과 담당자는 필수입니다.', confirmButtonText: '확인', confirmButtonColor: '#007bff' });
			return;
		}

		fetch(`${contextPath}/leader/kpi/readList/updateTask`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		})
			.then(res => res.text())
			.then(result => {
				if (result === 'success') {
					Swal.fire({ icon: 'success', title: '수정 완료되었습니다.', confirmButtonText: '확인', confirmButtonColor: '#007bff' })
						.then(() => {
							document.getElementById('subKpiDetailArea').innerHTML = '';
							loadTaskList(state.mainKpiId);
						});
				} else {
					Swal.fire({ icon: 'error', title: '수정에 실패했습니다.', confirmButtonText: '확인' });
				}
			})
			.catch(err => console.error('❌ 수정 오류:', err));
	};
});