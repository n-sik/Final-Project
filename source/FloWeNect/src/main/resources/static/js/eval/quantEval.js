/**
 * QuantApp - AI 정량 분석 통합 모듈 (최종본)
 */
const QuantApp = {
	config: {
		apiUrl: '/rest/leader/quant/eval/readList',
		analysisUrl: '/rest/ai/quant/analysis'
	},

	state: {
		targetList: [],
		selectedMember: null,
		gridApi: null,
		currentTerm: '2026_1'
	},

	init: function() {
		this.renderDashboard('INIT');
		this.fetchTargetList();
	},

	fetchTargetList: function() {
		const [year, half] = this.state.currentTerm.split('_');

		axios.get(this.config.apiUrl, {
			params: {
				evalYear: year,
				evalHalf: half
			}
		})
			.then(res => {
				const list = res.data.targetList || [];
				this.state.targetList = list;

				if (this.state.gridApi) {
					this.state.gridApi.setGridOption('rowData', list);
				} else {
					this.initGrid(list);
				}
			})
			.catch(err => console.error("🎷🎹 부서원 로드 오류:", err));
	},

	initChart: function(data) {
		const ctx = document.getElementById('scoreChart');
		if (!ctx) return;

		if (this.state.myChart) {
			this.state.myChart.destroy();
		}

		this.state.myChart = new Chart(ctx, {
			type: 'radar',
			data: {
				labels: ['목표합치도', '수행속도', '업무성실도', '목표달성률', '업무난이도'],
				datasets: [{
					label: `${data.empNm}님 역량 분석`,
					data: [
						data.scoreAlign,
						data.scoreSpeed,
						data.scoreFaith,
						data.scoreReach,
						data.scoreDiff
					],
					backgroundColor: 'rgba(54, 162, 235, 0.2)',
					borderColor: 'rgb(54, 162, 235)',
					pointBackgroundColor: 'rgb(54, 162, 235)',
					pointBorderColor: '#fff'
				}]
			},
			options: {
				scales: {
					r: {
						angleLines: { display: true },
						suggestedMin: 0,
						suggestedMax: 100,
						ticks: { stepSize: 20, display: false }
					}
				},
				maintainAspectRatio: false
			}
		});
	},

	initGrid: function(rowData) {
		const gridDiv = document.querySelector('#quantTargetGrid');
		if (!gridDiv) return;

		const gridOptions = {
			theme: "legacy",
			defaultColDef: { flex: 1, resizable: false, sortable: true, suppressMovable: true },
			suppressCellFocus: true,
			columnDefs: [
				{ headerName: "사번", field: "empNo" },
				{ headerName: "성명", field: "empNm" },
				{ headerName: "직급", field: "posNm", cellStyle: { textAlign: 'center' } },
				{
					headerName: "상태",
					field: "evalStatCd",
					cellRenderer: params => {
						const isDone = params.value === '완료';
						const icon = isDone ? 'fa-check-circle' : 'fa-clock';
						const stateClass = isDone ? 'done' : 'wait';
						return `
                            <div class="badge-wrapper">
                                <span class="status-badge ${stateClass}">
                                    <i class="fas ${icon}"></i> ${params.value || '대기'}
                                </span>
                            </div>`;
					}
				}
			],
			rowData: rowData,
			onRowDoubleClicked: (params) => {
				this.selectMember(params.data);
			}
		};

		this.state.gridApi = agGrid.createGrid(gridDiv, gridOptions);
	},

	selectMember: function(member) {
		this.state.selectedMember = member;

		if (member.evalStatCd === '완료') {
			const [year, half] = this.state.currentTerm.split('_');

			Promise.all([
				axios.get(`/rest/ai/quant/result/${member.empNo}`, { params: { evalYear: year, evalHalf: half } }),
				axios.get(`/rest/leader/personal-tasks/${member.empNo}`),
				axios.get(`/rest/leader/projects/${member.empNo}`)

			]).then(([aiRes, taskRes, projRes]) => {
				const aiData = aiRes.data;
				const personalTasks = taskRes.data || [];
				const projects = projRes.data || [];

				const kpiRequests = projects.map(p => axios.get(`/rest/leader/kpis/${p.projectNo}/${member.empNo}`));

				return Promise.all(kpiRequests).then(kpiResponses => {
					const rawKpis = kpiResponses.flatMap(r => r.data || []);
					const taskByKpiRequests = rawKpis.map(k =>
						axios.get(`/rest/leader/tasks/${k.kpiNo}`, { params: { empNo: member.empNo } })
					);

					return Promise.all(taskByKpiRequests).then(taskResponses => {
						const kpisWithTasks = rawKpis.map((k, idx) => ({
							...k,
							assignedTasks: taskResponses[idx].data || []
						}));

						this.renderDashboard('RESULT', {
							...member,
							...aiData,
							kpiList: kpisWithTasks,
							personalTasks: personalTasks
						});
					});
				});
			}).catch(err => {
				console.error("완료 데이터 로드 실패:", err);
				Swal.fire('오류', '데이터를 불러오는 중 문제가 발생했습니다.', 'error');
			});

		} else {
			Promise.all([
				axios.get(`/rest/leader/personal-tasks/${member.empNo}`),
				axios.get(`/rest/leader/projects/${member.empNo}`)
			]).then(([taskRes, projRes]) => {
				const personalTasks = taskRes.data || []; // kpiNo가 없는 순수 개인업무
				const projects = projRes.data || [];

				if (projects.length > 0) {
					// 프로젝트별 KPI 리스트를 먼저 가져옴
					const kpiRequests = projects.map(p => axios.get(`/rest/leader/kpis/${p.projectNo}/${member.empNo}`));

					return Promise.all(kpiRequests).then(kpiResponses => {
						const rawKpis = kpiResponses.flatMap(r => r.data || []);

						// 🚩 핵심: 각 KPI에 할당된 담당업무를 가져옴 (로그의 그 쿼리 호출)
						const taskByKpiRequests = rawKpis.map(k =>
							axios.get(`/rest/leader/tasks/${k.kpiNo}`, { params: { empNo: member.empNo } })
						);

						return Promise.all(taskByKpiRequests).then(taskResponses => {
							const kpisWithTasks = rawKpis.map((k, idx) => ({
								...k,
								assignedTasks: taskResponses[idx].data || [] // KPI별 담당업무 딲! 저장
							}));

							this.renderDashboard('RESULT', {
								...member,
								kpiList: kpisWithTasks,
								personalTasks: personalTasks
							});
						});
					});
				} else {
					this.renderDashboard('RESULT', { ...member, kpiList: [], personalTasks: personalTasks });
				}
			}).catch(err => console.error("데이터 로드 실패:", err));
		}
	},

	mapStatus: function(statCd) {
		const statusMap = {
			'progress': '진행중',
			'complete': '완료',
			'finish': '완료',
			'wait': '대기'
		};
		return statusMap[statCd] || '대기';
	},

	renderDashboard: function(status, data) {
		const $dashboard = document.getElementById('quantDashboard');
		if (!$dashboard) return;

		let html = '';

		if (status === 'INIT') {
			html = `
            <div class="init-state-wrapper animate__animated animate__fadeIn">
                <div class="init-header">
                    <i class="fas fa-chart-pie init-icon"></i>
                    <h2>부서 정량평가 현황</h2>
                    <p>현재 우리 부서의 평가 진행 상태를 확인하세요.</p>
                </div>
                <div class="init-stats-container">
                    <div class="stat-card">
                        <span class="label">대상 인원</span>
                        <span class="value">${this.state.targetList.length}명</span>
                    </div>
                    <div class="stat-card">
                        <span class="label">완료 인원</span>
                        <span class="value done">${this.state.targetList.filter(m => m.evalStatCd === '완료').length}명</span>
                    </div>
                    <div class="stat-card">
                        <span class="label">진행률</span>
                        <span class="value percent">${this.calculateProgress()}%</span>
                    </div>
                </div>
                <div class="init-guide">
                    <i class="fas fa-mouse-pointer"></i> 
                    <span>목록에서 <strong>사원을 더블클릭</strong>하여 상세 분석을 시작하세요.</span>
                </div>
            </div>`;
		} else if (status === 'RESULT') {
			const isAnalyzed = (data.evalStatCd === '완료' || data.aiSummary);

			if (isAnalyzed) {
				html = `
           <div class="final-report-wrapper animate__animated animate__fadeIn">
                
                <div class="report-section-group">
                    <div class="report-section-header">
                        <i class="fas fa-chart-bar"></i> 핵심 성과 지표 (AI Score)
                    </div>
                    <div class="score-card-wrapper">
                        <table class="score-summary-table">
                            <thead>
                                <tr>
                                    <th>[ 목표부합도 ]<br></br>Alignment</th><th>[ 업무속도 ]<br></br>Speed</th><th>[ 성실성 ]<br></br>Diligence</th><th>[ 목표달성도 ]<br></br>Achievement</th><th>[ 업무난이도 ]<br></br>Complexity</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="score-val">
                                    <td><strong>${data.scoreAlign || 0}</strong></td>
                                    <td><strong>${data.scoreSpeed || 0}</strong></td>
                                    <td><strong>${data.scoreFaith || 0}</strong></td>
                                    <td><strong>${data.scoreReach || 0}</strong></td>
                                    <td><strong>${data.scoreDiff || 0}</strong></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="report-detail-card">
                    <div class="report-main-title">AI 분석 리포트</div>
                    
                    <div class="report-chart-section">
                        <div class="chart-canvas-wrapper">
                            <canvas id="scoreChart"></canvas>
                        </div>
                    </div>

                    <div class="report-insight-section">
                        <div class="insight-header">
                            <i class="fas fa-comment-dots"></i> AI 종합 성과 진단
                        </div>
                        <div class="ai-summary-content">
                           ${(typeof data.aiSummary === 'string')
						? data.aiSummary.replace(/\n/g, '<br>')
						: (data.aiSummary ? JSON.stringify(data.aiSummary) : '상세 분석 내용을 로드 중입니다.')}
                        </div>
                    </div>
                </div>
                
                <div class="leader-comment-section" style="margin-top:30px; padding:20px; background:#fff; border:1px solid #e2e8f0; border-radius:12px;">
            <div class="insight-header" style="margin-bottom:15px; color:#1e293b; font-weight:700;">
                <i class="fas fa-user-tie" style="margin-right:8px;"></i> 부서장 최종 평가 의견
            </div>
            <textarea id="leaderComment" 
                      style="width:100%; min-height:120px; padding:15px; border:1px solid #cbd5e1; border-radius:8px; font-size:1rem; line-height:1.6; resize:vertical;" 
                      placeholder="사원의 성과에 대한 최종 의견을 입력하세요...">${data.regComent || ''}</textarea>
            
            <div style="text-align:right; margin-top:15px;">
                <button onclick="QuantApp.saveComment()" 
                        class="btn-save-comment" 
                        style="padding:10px 25px; background:#4f46e5; color:#fff; border:none; border-radius:6px; cursor:pointer; font-weight:600;">
                    의견 확정 및 저장
                </button>
            </div>
        </div>

                <div class="report-footer-tag">Generated by AI Quantitative Analysis Engine</div>
            </div>`;
			} else {
				html = `
            <div class="analysis-pre-briefing animate__animated animate__fadeIn">
                <div class="briefing-header">
                   <span>${data.empNm} ${data.posNm} - 성과지표(KPI) 및 업무 내역</span>
                </div>
                
                <div class="briefing-flex-container">
                    <div class="brief-flex-item task-section">
                        <div class="card-title">
                            <span>KPI 담당업무 성과</span>
                            <span class="count-badge">${data.kpiList ? data.kpiList.length : 0}건</span>
                        </div>
                        <div class="task-accordion-container">
                            ${data.kpiList && data.kpiList.length > 0 ? data.kpiList.map(k => {
					const assignedTasks = k.assignedTasks || [];
					return `
                                <details class="kpi-detail-item">
                                    <summary class="kpi-summary">
                                        <div class="kpi-summary-left">
                                            <span class="tag status-kpi-name">${k.kpiNm || '미지정 KPI'}</span>
                                            <strong class="kpi-sub-title">관련 업무 (${assignedTasks.length})</strong>
                                        </div>
                                        <div class="kpi-summary-right">
                                            <span class="kpi-percent-bold">${k.progressRate || 0}%</span>
                                        </div>
                                    </summary>
                                    <div class="assigned-tasks-wrapper">
                                        ${assignedTasks.map(at => `
                                            <div class="mini-work-item ${(at.taskStatCd || at.task_stat_cd) === 'complete' ? 'done' : 'ing'}">
                                                <div class="mini-work-left"><span class="mini-work-title">${at.taskTitle}</span></div>
                                                <div class="mini-work-right">
                                                    <span class="mini-work-status">${(at.taskStatCd || at.task_stat_cd) === 'complete' ? '완료' : '진행'}</span>
                                                    <span class="mini-work-rate">${at.progressRate}%</span>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </details>`;
				}).join('') : '<p class="empty-msg">연결된 KPI가 없습니다.</p>'}
                        </div>
                    </div>

                    <div class="brief-flex-item personal-section">
                        <div class="card-title">
                            <span>기타 개인업무 히스토리</span>
                            <span class="count-badge">${data.personalTasks ? data.personalTasks.length : 0}건</span>
                        </div>
                        <div class="task-accordion-container">
                            ${data.personalTasks && data.personalTasks.length > 0 ? data.personalTasks.map(pt => `
                                <details class="task-detail-item">
                                    <summary class="task-summary">
                                        <div class="task-summary-left">
                                            <span class="tag status-personal">개인</span>
                                            <strong class="task-title-text">${pt.taskTitle}</strong>
                                        </div>
                                        <div class="task-summary-right">
                                            <span class="task-percent-bold">${pt.progressRate}%</span>
                                        </div>
                                    </summary>
                                    <div class="task-content-expanded"><p>${pt.taskCn || '-'}</p></div>
                                </details>
                            `).join('') : '<p class="empty-msg">조회된 개인업무가 없습니다.</p>'}
                        </div>
                    </div>
                </div>

                <div class="analysis-guide-box" style="margin-top:20px; padding:15px; background:#f1f5f9; border-radius:8px; text-align:center;">
                    <p style="color:#64748b; font-size:0.9rem;">위 데이터를 기반으로 상단의 <strong>[AI 평가하기]</strong> 버튼을 눌러 분석을 수행하세요.</p>
                </div>
            </div>`;
			}
		}

		$dashboard.innerHTML = html;

		if (status === 'RESULT' && (data.evalStatCd === '완료' || data.aiSummary)) {
			setTimeout(() => this.initChart(data), 200);
		}
	},
	calculateProgress: function() {
		const total = this.state.targetList.length;
		if (total === 0) return 0;
		const done = this.state.targetList.filter(m => m.evalStatCd === '완료').length;
		return Math.round((done / total) * 100);
	},

	fetchTargetList: function() {
		axios.get(this.config.apiUrl, { params: { deptCd: 'HR01' } })
			.then(res => {
				const list = res.data.targetList || [];
				this.state.targetList = list;
				this.initGrid(list);
				this.renderDashboard('INIT');
			});
	},

runAiAnalysis: function() {
    const member = this.state.selectedMember;
    if (!member || member.evalStatCd === '완료') return;

    const btn = document.getElementById('btnAiAction');
    const spinner = document.getElementById('aiLoadingSpinner');
    if (btn) { btn.disabled = true; btn.style.opacity = '0.5'; }
    if (spinner) spinner.style.display = 'flex';

    axios.post(this.config.analysisUrl, { empNo: member.empNo })
        .then(__res__ => {
            const [year, half] = this.state.currentTerm.split('_');
            return axios.get(`/rest/ai/quant/result/${member.empNo}`, {
                params: { evalYear: year, evalHalf: half }
            });
        })
        .then(res => {
            const dbData = res.data;

            Object.assign(member, dbData);
            member.evalStatCd = '완료';

            if (this.state.gridApi) {
                this.state.gridApi.applyTransaction({ update: [member] });
            }

            Swal.fire({
                icon: 'success',
                title: '분석 및 저장 완료',
                timer: 800,
                showConfirmButton: false
            }).then(() => {
                const btn = document.getElementById('btnAiAction');
                const spinner = document.getElementById('aiLoadingSpinner');
                if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
                if (spinner) spinner.style.display = 'none';

                this.renderDashboard('RESULT', {
                    ...member,
                    ...dbData,
                    kpiList: member.kpiList || [],
                    personalTasks: member.personalTasks || []
                });

                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        })
        .catch(err => {
            const btn = document.getElementById('btnAiAction');
            const spinner = document.getElementById('aiLoadingSpinner');
            if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
            if (spinner) spinner.style.display = 'none';

            console.error("분석 로드 실패:", err);
            Swal.fire('오류', '데이터를 불러오는 중 문제가 발생했습니다.', 'error');
        });
},

	saveComment: function() {
		const member = this.state.selectedMember;
		const commentText = document.getElementById('leaderComment').value;

		if (!member) return;

		Swal.fire({
			title: '코멘트 확정',
			text: `${member.empNm}님의 평가 의견을 저장하시겠습니까?`,
			icon: 'question',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#aaa',
			confirmButtonText: '저장',
			cancelButtonText: '취소'
		}).then((result) => {
			if (result.isConfirmed) {
				const [year, half] = this.state.currentTerm.split('_');
				const saveData = {
					empNo: member.empNo,
					evalYear: year,
					evalHalf: half,
					regComent: commentText
				};

				axios.post('/rest/ai/quant/saveComment', saveData)
					.then(res => {
						Swal.fire('저장 성공!', '부서장 의견이 기록되었습니다.', 'success');
						member.regComent = commentText;
					})
					.catch(err => {
						console.error("코멘트 저장 실패:", err);
						Swal.fire('오류', '저장 중 문제가 발생했습니다.', 'error');
					});

				axios.post('/rest/ai/quant/saveComment', saveData)
					.then(res => {
						Swal.fire('저장 완료!', '리더 의견이 반영되었습니다.', 'success');
						this.state.selectedMember.regComent = commentText;
					})
					.catch(err => {
						Swal.fire('오류 발생', '저장 중 문제가 생겼습니다.', 'error');
					});
			}
		});
	},
}

document.addEventListener('DOMContentLoaded', () => QuantApp.init());