/**
 * QualApp - 부서원 리스트 조회 및 서버 페이징 기반 단계별 평가 모듈
 */
const QualApp = {
	config: {
		apiUrl: '/rest/leader/qual/eval/readList',
		submitUrl: '/rest/leader/qual/eval/create'
	},

	state: {
		evalData: [],
		targetList: [],
		selectedAnswers: {},
		selectedComments: {},
		currentPage: 1,
		totalPageCount: 0,
		selectedMember: null,
		gridApi: null,
		recordSize: 2
	},

	init: function() {
		this.fetchData(1);
	},

	fetchData: function(page) {
		axios.get(this.config.apiUrl, {
			params: {
				page: page,
				recordSize: this.state.recordSize
			}
		})
			.then(res => {
				const { questions, targetList, pagingDTO } = res.data;
				this.state.evalData = questions || [];
				this.state.totalPageCount = pagingDTO.totalPageCount;
				this.state.currentPage = pagingDTO.page;
				this.state.recordSize = pagingDTO.recordSize;

				if (targetList) {
					this.state.targetList = targetList;
					if (this.state.gridApi) {
						this.state.gridApi.setGridOption('rowData', targetList);
					} else {
						this.initGrid(this.state.targetList);
					}
				}

				if (this.state.selectedMember) {
					this.renderSurvey();
					if (this.state.selectedMember.evalStatCd === '완료') {
						this.renderCompletedMessage(this.state.selectedMember);
					} else {
						this.renderSurvey();
					}
				} else {
					this.renderInitialMessage();
				}
			})
			.catch(err => console.error("Data Load Error:", err));
	},

	initGrid: function(rowData) {
		const gridDiv = document.querySelector('#deptWorkGrid');
		if (!gridDiv || this.state.gridApi) return;

		const gridOptions = {
			theme: "legacy",
			defaultColDef: { resizable: false, sortable: true, suppressMovable: true },
			suppressCellFocus: true,
			columnDefs: [
				{ headerName: "사번", field: "empNo", flex: 1 },
				{ headerName: "성명", field: "empNm", flex: 1 },
				{ headerName: "직급", field: "posNm", flex: 1, cellStyle: { textAlign: 'center' } },
				{
					headerName: "상태",
					field: "evalStatCd",
					flex: 1,
					cellRenderer: params => {
						const isDone = params.value === '완료';
						const icon = isDone ? 'fa-check-circle' : 'fa-clock';
						const stateClass = isDone ? 'done' : 'wait';
						const statusText = isDone ? '완료' : '대기';
						return `
                            <div class="badge-wrapper">
                                <span class="status-badge ${stateClass}">
                                    <i class="fas ${icon}"></i>
                                    ${statusText}
                                </span>
                            </div>`;
					}
				}
			],
			rowData: rowData,
			onRowDoubleClicked: (params) => this.selectMember(params.data)
		};
		this.state.gridApi = agGrid.createGrid(gridDiv, gridOptions);
	},

	selectMember: function(data) {
		if (Object.keys(this.state.selectedAnswers).length > 0) {
			Swal.fire({
				title: '대상 변경',
				html: `<b>${data.empNm}</b>님으로 변경하시겠습니까?<br>작성 중인 내용은 초기화됩니다.`,
				icon: 'warning',
				showCancelButton: true,
				confirmButtonText: '변경하기',
				cancelButtonText: '취소',
				reverseButtons: true
			}).then((result) => {
				if (result.isConfirmed) this.processMemberSelection(data);
			});
		} else {
			this.processMemberSelection(data);
		}
	},

	processMemberSelection: function(data) {
		if (data.evalStatCd === '완료') {
			this.state.selectedMember = data;
			this.renderCompletedMessage(data);
			return;
		}

		this.state.selectedMember = data;
		this.state.selectedAnswers = {};
		this.state.selectedComments = {};

		const targetDisplayEl = document.getElementById('targetDisplay');
		if (targetDisplayEl) {
			const deptInfo = data.deptNm ? `<span class="display-dept">${data.deptNm}</span>` : "";
			targetDisplayEl.innerHTML = `${data.empNm}${deptInfo}`;
		}

		this.fetchData(1);
	},

	renderSurvey: function() {
		const containerEl = document.getElementById("qualEvalContainer");
		const navEl = document.getElementById("navActionArea");
		if (!containerEl || !navEl) return;

		const startNum = (this.state.currentPage - 1) * this.state.recordSize;
		let html = '';

		this.state.evalData.forEach((item, index) => {
			const savedScore = this.state.selectedAnswers[item.evalCd] || "";
			const questionNum = startNum + index + 1;

			html += `
                <div class="eval-card animated fadeIn">
                    <div class="eval-card-header">
                        <h4 class="q-text"><span class="q-num">Q${questionNum}.</span> ${item.evalItemNm}</h4>
                    </div>
                    <div class="eval-options">
                        ${item.rubrics.map(r => `
                            <label class="eval-radio-label ${savedScore == r.evalScore ? 'selected' : ''}">
                                <input type="radio" name="${item.evalCd}" value="${r.evalScore}" 
                                    class="hidden-radio"
                                    onchange="QualApp.saveAnswer('${item.evalCd}', '${r.evalScore}', '${r.scoreDesc}')"
                                    ${savedScore == r.evalScore ? 'checked' : ''}>
                               <div class="eval-option-box">
								    <span class="desc">${r.scoreDesc}</span>
								    <div class="check-box">
								        <svg class="swal-check-icon" viewBox="0 0 24 24">
								            <polyline points="20 6 9 17 4 12"></polyline>
								        </svg>
								    </div>
								</div>
                            </label>`).join('')}
                    </div>
                </div>`;
		});
		containerEl.innerHTML = html;

		const isLastPage = (this.state.currentPage === this.state.totalPageCount);
		navEl.innerHTML = `
            <div class="nav-wrapper">
                <div class="nav-left">${this.state.currentPage > 1 ? `<button type="button" class="btn-nav btn-prev" onclick="QualApp.changePage(-1)">이전</button>` : ''}</div>
                <div class="nav-center"><span class="page-info"><b>${this.state.currentPage}</b> / ${this.state.totalPageCount}</span></div>
                <div class="nav-right">${!isLastPage ? `<button type="button" class="btn-nav btn-next" onclick="QualApp.changePage(1)">다음 항목</button>` : `<button type="button" class="btn-final-submit" onclick="QualApp.submit()">최종 제출</button>`}</div>
            </div>`;
	},

	saveAnswer: function(evalCd, score, desc) {
		this.state.selectedAnswers[evalCd] = score;
		this.state.selectedComments[evalCd] = desc;
		this.renderSurvey();
	},

	changePage: function(offset) {
		if (offset > 0) {
			const allAnswered = this.state.evalData.every(item => this.state.selectedAnswers[item.evalCd]);
			if (!allAnswered) {
				Swal.fire({ icon: 'error', title: '항목 미선택', text: '모든 항목을 선택해야 다음으로 넘어갈 수 있습니다.' });
				return;
			}
		}
		this.fetchData(this.state.currentPage + offset);
		const scrollArea = document.querySelector('.qual-eval-body');
		if (scrollArea) scrollArea.scrollTo({ top: 0, behavior: 'smooth' });
	},

	renderInitialMessage: function() {
		const containerEl = document.getElementById("qualEvalContainer");
		if (containerEl) {
			containerEl.innerHTML = `
                <div class="initial-msg-wrapper animated fadeIn">
                    <div class="initial-msg-content">
                        <div class="msg-icon-box"><i class="fas fa-user"></i> </div>
                        <h3>평가 대상자를 선택해 주세요</h3>
                        <p>왼쪽 부서원 명단에서 대상자를 <b>더블클릭</b>하면<br>해당 인원에 대한 정성평가 문항이 로드됩니다.</p>
                        <div class="msg-badge">2026년 1분기 정기평가</div>
                    </div>
                </div>`;
		}
	},

	renderCompletedMessage: function(data) {
		const containerEl = document.getElementById("qualEvalContainer");
		const navEl = document.getElementById("navActionArea");
		if (!containerEl || !navEl) return;

		const targetDisplayEl = document.getElementById('targetDisplay');
		if (targetDisplayEl) {
			targetDisplayEl.innerHTML = `${data.empNm} <span class="display-dept">${data.deptNm}</span>`;
		}

		containerEl.innerHTML = `
            <div class="completed-container animated fadeIn">
                <div class="completed-content">
                    <div class="completed-icon-circle"><i class="fas fa-user-check"></i></div>
                    <h3 class="completed-title">평가 완료 안내</h3>
                    <p class="completed-text"><strong>${data.empNm} ${data.posNm}</strong>님은<br>이미 정성평가 제출이 완료되었습니다.</p>
                    <div class="completed-divider"></div>
                    <p class="completed-subtext">제출된 평가는 해당 분기 평가 기간 종료 후<br>최종 집계되어 인사 시스템에 반영됩니다.</p>
                </div>
            </div>`;
		navEl.innerHTML = '';
	},

	renderError: function(message, details) {
		const containerEl = document.getElementById("qualEvalContainer");
		const navEl = document.getElementById("navActionArea");

		const { empNm, empNo, deptNm, posNm } = details || {};

		if (containerEl) {
			let detailsHtml = '';

			if (empNm) {
				detailsHtml = `
                <div class="error-info-card">
                    <p class="error-info-name">${deptNm} · ${empNm} ${posNm}</p>
                    <p class="error-info-no">사원번호 ${empNo}</p>
                </div>
            `;
			}

			containerEl.innerHTML = `
            <div class="initial-msg-wrapper animated fadeIn">
                <div class="initial-msg-content error-content-wrapper">
                    <div class="msg-icon-box error-style"><i class="fas fa-ban"></i></div>
                    <h3 class="error-title-text">평가 중복 확인</h3>
                    <p class="error-main-desc">${message}</p>
                    ${detailsHtml}
                    <p class="error-sub-guide">
                        해당 사원은 이미 평가가 완료되어 더 이상 수정할 수 없습니다.<br>
                        문의사항은 인사팀으로 연락 주시기 바랍니다.
                    </p>
                    <button onclick="location.reload()" class="btn-error-reload">
                        목록으로 돌아가기
                    </button>
                </div>
            </div>`;
		}

		if (navEl) navEl.innerHTML = '';
	},

	submit: function() {
		const { selectedMember, selectedAnswers, selectedComments } = this.state;

		Swal.fire({
			title: '최종 제출',
			text: `${selectedMember.empNm}님의 평가 결과를 제출하시겠습니까?`,
			icon: 'question',
			showCancelButton: true,
			confirmButtonText: '제출하기',
			cancelButtonText: '취소',
			reverseButtons: true
		}).then((result) => {
			if (result.isConfirmed) {
				const resultList = Object.keys(selectedAnswers).map(code => ({
					evalCd: code,
					evalScore: parseInt(selectedAnswers[code]),
					evalComment: selectedComments[code] || "평가 완료",
					targetEmpNo: selectedMember.empNo,
					evaluatorId: (window.LOGIN_USER && window.LOGIN_USER.empNo) || "",
					evalYear: 2026,
					evalQuarter: "1"
				}));

				const payload = {
					targetEmpNo: selectedMember.empNo,
					evaluatorId: (window.LOGIN_USER && window.LOGIN_USER.empNo) || "", evalYear: 2026, evalQuarter: "1",
					evalCd: resultList[0].evalCd, evalScore: resultList[0].evalScore, evalComment: resultList[0].evalComment,
					resultList: resultList
				};

				axios.post(this.config.submitUrl, payload)
					.then(() => {
						Swal.fire({ icon: 'success', title: '제출 완료', text: '평가가 정상적으로 제출되었습니다.' })
							.then(() => location.reload());
					})
					.catch((err) => {
						const errorData = err.response?.data;
						const serverMsg = errorData?.message || "제출 중 알 수 없는 오류가 발생했습니다.";
						const serverDetails = errorData?.details || null;

						console.log("백엔드 전달 데이터:", serverDetails);

						QualApp.renderError(serverMsg, serverDetails);

						Swal.fire({
							icon: 'error',
							title: '제출 제한 안내',
							text: serverMsg,
							confirmButtonText: '확인'
						});
					});
			}
		});
	}
};

document.addEventListener('DOMContentLoaded', () => QualApp.init());