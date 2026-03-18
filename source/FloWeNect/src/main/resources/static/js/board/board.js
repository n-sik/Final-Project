/* global Swal, axios, agGrid */

// HR 권한 확인
const isHr = document.querySelector('meta[name="isHr"]')?.content === "true";

document.addEventListener("DOMContentLoaded", function() {
	BoardApp.init();
});

var BoardApp = (function() {
	// ===== 전역에서 쓸 DOM / 상태 =====
	var dom = {};
	var state = {
		ctx: "",
		loginEmpNo: "",

		boardTypeNo: 1,

		page: 1,
		size: 20,
		totalCount: 0,
		totalPages: 1,

		searchType: "title",
		keyword: "",

		gridApi: null,
		selectedPostNo: null,

		// ✅ 기본 상세 OFF (탭 간 공유)
		editorCollapsed: true,

		mode: "create", // create | read | edit
		dirty: false,

		replyTo: null,
		comments: [],

		files: [],
	};

	var BOARD_TYPE = {
		1: "공지",
		2: "지원/복지",
		3: "인사이동",
		4: "교육",
		5: "채용",
		6: "건의",
	};

	function isPeriodRequiredType(typeNo) {
		return typeNo === 4 || typeNo === 5;
	}

	// ✅ 작성 가능 여부
	function canWrite(typeNo) {
		// 건의(6) = 전원 작성 가능, 그 외 = HR만
		return Number(typeNo) === 6 || !!isHr;
	}

	// ✅ 작성 버튼/작성모드 제어
	function updateWriteControls(typeNo) {
		var allowed = canWrite(typeNo);

		// 작성 버튼(새 글) 표시/숨김
		if (dom.btnNew) {
			dom.btnNew.style.display = allowed ? "" : "none";
		}

		// 현재가 작성 모드인데 권한이 없으면 입력/저장 막기
		if (state.mode === "create") {
			setFormEnabled(allowed);
			if (dom.btnSave) dom.btnSave.disabled = !allowed || !isFormValidForSave();
			if (dom.modeTitle) dom.modeTitle.textContent = allowed ? "글쓰기" : "읽기 전용";
			if (dom.metaText) dom.metaText.textContent = allowed ? "작성 모드" : "HR 권한만 작성 가능합니다. (건의 탭 제외)";
			setFileInputEnabled(allowed);
			if (!allowed) clearSelectedFiles();
		}
	}

	// ✅ AG Grid 가로 스크롤 방지: 컨테이너에 컬럼 폭 맞추기
	function fitColumnsSoon() {
		if (!state.gridApi || !state.gridApi.sizeColumnsToFit) return;

		// 레이아웃 확정 후(2프레임) 맞추기
		requestAnimationFrame(function() {
			requestAnimationFrame(function() {
				try {
					state.gridApi.sizeColumnsToFit();
				} catch (e) { }
			});
		});
	}

	function init() {
		cacheDom();
		bindEvents();
		initGrid();
		boot();
	}

	function cacheDom() {
		state.ctx = (document.querySelector("meta[name='ctx']") || {}).content || "";
		state.loginEmpNo =
			(window.LOGIN_USER && window.LOGIN_USER.empNo) || (document.querySelector("meta[name='loginEmpNo']") || {}).content || "";

		dom.split = document.getElementById("bdSplit");
		dom.editor = document.getElementById("bdEditor");

		dom.btnCollapse = document.getElementById("bdBtnCollapse");
		dom.btnNew = document.getElementById("bdBtnNew");
		dom.btnReload = document.getElementById("bdBtnReload");

		dom.tabs = document.querySelectorAll(".bd-tab");
		dom.listTitle = document.getElementById("bdListTitle");
		dom.totalCnt = document.getElementById("bdTotalCnt");
		dom.typePill = document.getElementById("bdTypePill");

		dom.searchType = document.getElementById("bdSearchType");
		dom.keyword = document.getElementById("bdKeyword");
		dom.btnSearch = document.getElementById("bdBtnSearch");

		dom.pageNow = document.getElementById("bdPageNow");
		dom.pageTotal = document.getElementById("bdPageTotal");
		dom.pageSize = document.getElementById("bdPageSize");
		dom.btnFirst = document.getElementById("bdBtnFirst");
		dom.btnPrev = document.getElementById("bdBtnPrev");
		dom.btnNext = document.getElementById("bdBtnNext");
		dom.btnLast = document.getElementById("bdBtnLast");

		dom.modeTitle = document.getElementById("bdEditorModeTitle");
		dom.metaText = document.getElementById("bdMetaText");

		dom.postNo = document.getElementById("bdPostNo");
		dom.title = document.getElementById("bdTitle");
		dom.cn = document.getElementById("bdCn");

		dom.periodWrap = document.getElementById("bdPeriodWrap");
		dom.periodYn = document.getElementById("bdPeriodYn");
		dom.startDate = document.getElementById("bdStartDate");
		dom.endDate = document.getElementById("bdEndDate");

		dom.btnEdit = document.getElementById("bdBtnEdit");
		dom.btnDelete = document.getElementById("bdBtnDelete");

		dom.btnSave = document.getElementById("bdBtnSave");
		dom.btnCancel = document.getElementById("bdBtnCancel");

		dom.cmntWrap = document.getElementById("bdCmntWrap");
		dom.cmntCnt = document.getElementById("bdCmntCnt");
		dom.cmntList = document.getElementById("bdCmntList");
		dom.cmntText = document.getElementById("bdCmntText");
		dom.btnCmntSave = document.getElementById("bdBtnCmntSave");
		dom.replyTo = document.getElementById("bdReplyTo");
		dom.btnReplyCancel = document.getElementById("bdBtnReplyCancel");

		// 첨부파일
		dom.files = document.getElementById("bdFiles");
		dom.fileList = document.getElementById("bdFileList");
	}

	function bindEvents() {
		if (dom.btnCollapse) {
			dom.btnCollapse.addEventListener("click", function() {
				toggleEditor(true);
			});
		}

		// ✅ 작성 버튼: 권한 있으면 글쓰기 전환만
		if (dom.btnNew) {
			dom.btnNew.addEventListener("click", function() {
				// 권한 체크
				if (!canWrite(state.boardTypeNo)) {
					Swal.fire("안내", "HR 권한만 작성할 수 있습니다. (건의 탭 제외)", "info");
					return;
				}
				goCreateNoConfirm();
			});
		}

		if (dom.btnReload) {
			dom.btnReload.addEventListener("click", function() {
				loadPage(true);
			});
		}

		if (dom.tabs && dom.tabs.length) {
			Array.prototype.forEach.call(dom.tabs, function(btn) {
				btn.addEventListener("click", function() {
					changeTab(Number(btn.dataset.type || 1));
				});
			});
		}

		if (dom.searchType) {
			dom.searchType.addEventListener("change", function() {
				state.searchType = dom.searchType.value;
			});
		}

		if (dom.keyword) {
			dom.keyword.addEventListener("keydown", function(e) {
				if (e.key === "Enter") {
					e.preventDefault();
					doSearch();
				}
			});
		}

		if (dom.btnSearch) {
			dom.btnSearch.addEventListener("click", function() {
				doSearch();
			});
		}

		if (dom.pageSize) {
			dom.pageSize.addEventListener("change", function() {
				state.size = Number(dom.pageSize.value || 20);
				state.page = 1;
				loadPage(true);
			});
		}

		if (dom.btnFirst) dom.btnFirst.addEventListener("click", function() { movePage(1); });
		if (dom.btnPrev) dom.btnPrev.addEventListener("click", function() { movePage(state.page - 1); });
		if (dom.btnNext) dom.btnNext.addEventListener("click", function() { movePage(state.page + 1); });
		if (dom.btnLast) dom.btnLast.addEventListener("click", function() { movePage(state.totalPages); });

		// 입력 변경시 dirty 처리
		[dom.title, dom.cn, dom.periodYn, dom.startDate, dom.endDate].forEach(function(el) {
			if (!el) return;

			el.addEventListener("input", function() {
				markDirty(true);
				refreshSaveAvailability();
			});

			el.addEventListener("change", function() {
				markDirty(true);
				refreshSaveAvailability();
			});
		});

		if (dom.btnEdit) {
			dom.btnEdit.addEventListener("click", function() {
				onEditClick();
			});
		}

		if (dom.btnDelete) dom.btnDelete.addEventListener("click", function() { onDelete(); });
		if (dom.btnSave) dom.btnSave.addEventListener("click", function() { onSave(); });
		if (dom.btnCancel) dom.btnCancel.addEventListener("click", function() { onCancel(); });

		if (dom.btnCmntSave) dom.btnCmntSave.addEventListener("click", function() { onCommentSave(); });
		if (dom.btnReplyCancel) dom.btnReplyCancel.addEventListener("click", function() { clearReplyTo(); });

		if (dom.periodYn) {
			dom.periodYn.addEventListener("change", function() {
				var required = isPeriodRequiredType(state.boardTypeNo);
				if (required) {
					dom.periodYn.checked = true;
					return;
				}

				var enabled = !!dom.periodYn.checked;
				dom.startDate.disabled = !enabled;
				dom.endDate.disabled = !enabled;

				if (!enabled) {
					dom.startDate.value = "";
					dom.endDate.value = "";
				}

				markDirty(true);
				refreshSaveAvailability();
			});
		}

		// ✅ 창 리사이즈 시 컬럼 폭 재맞춤 (가로 스크롤 방지)
		window.addEventListener("resize", function() {
			fitColumnsSoon();
		});
	}

	function boot() {
		applyBoardTypeUI(1);
		setMode("create");
		setEditorCollapsed(state.editorCollapsed, false);

		// ✅ 초기 작성 버튼/작성모드 제어
		updateWriteControls(state.boardTypeNo);

		loadPage(true);
	}

	function initGrid() {
		var gridDiv = document.getElementById("bdGrid");
		if (!gridDiv) return;

		gridDiv.classList.add("ag-theme-quartz", "bd-agGrid");

		// ✅ 가로 스크롤 방지: 최소폭 합을 줄여 shrink 가능하게
		var columnDefs = [
			{ headerName: "번호", field: "postNo", width: 80, minWidth: 70 },
			{
				headerName: "제목",
				field: "title",
				flex: 1,
				minWidth: 160, // 220 -> 160
				cellRenderer: function(p) {
					return '<span class="bd-cellTitle">' + escapeHtml(p.value || "") + "</span>";
				},
			},
			{ headerName: "작성자", field: "regEmpNm", width: 110, minWidth: 90 },
			{ headerName: "작성일", field: "regDtm", width: 150, minWidth: 130 },
			{ headerName: "조회", field: "viewCnt", width: 80, minWidth: 70 },
		];

		var gridOptions = {
			theme: "legacy",
			columnDefs: columnDefs,
			rowData: [],

			// ✅ v32.2.1+ 권장 방식 (기존 "single" 대체)
			rowSelection: {
				mode: "singleRow",
				enableClickSelection: true,
				checkboxes: false
			},

			suppressCellFocus: true,

			animateRows: true,
			defaultColDef: { sortable: true, resizable: true },
			overlayNoRowsTemplate: '<span class="bt-table__muted">결과가 없습니다</span>',
			loading: false,

			// ✅ 그리드 준비/리사이즈에 맞춰 항상 fit
			onGridReady: function() {
				fitColumnsSoon();
			},
			onGridSizeChanged: function() {
				fitColumnsSoon();
			},

			onRowClicked: function(e) {
				var postNo = e && e.data && e.data.postNo;
				if (!postNo) return;

				if (state.selectedPostNo && Number(state.selectedPostNo) === Number(postNo)) {
					ensureEditorOpen(true);
					return;
				}

				onSelectPost(postNo);
			},
		};

		state.gridApi = agGrid.createGrid(gridDiv, gridOptions);

		// ✅ 최초에도 한번 맞춤
		fitColumnsSoon();
	}

	// =========================
	// ✅ 상세영역 토글/표시 컨트롤
	// =========================
	function toggleEditor(withFx) {
		setEditorCollapsed(!state.editorCollapsed, !!withFx);
	}

	function ensureEditorOpen(withFx) {
		if (state.editorCollapsed) {
			setEditorCollapsed(false, !!withFx);
		} else if (withFx) {
			fireToggleFx();
		}
	}

	function setEditorCollapsed(collapsed, withFx) {
		state.editorCollapsed = !!collapsed;

		if (dom.split) dom.split.classList.toggle("is-collapsed", state.editorCollapsed);

		var icon = dom.btnCollapse ? dom.btnCollapse.querySelector("i") : null;
		if (icon) {
			icon.className = state.editorCollapsed
				? "bi bi-layout-sidebar-inset-reverse"
				: "bi bi-layout-sidebar-inset";
		}

		if (dom.btnCollapse) {
			dom.btnCollapse.classList.toggle("is-on", !state.editorCollapsed);
			dom.btnCollapse.classList.toggle("is-off", state.editorCollapsed);
		}

		if (withFx) fireToggleFx();

		// ✅ 접기/펼치기 후 레이아웃 확정 뒤 컬럼 맞춤
		fitColumnsSoon();
	}

	function fireToggleFx() {
		if (!dom.btnCollapse) return;
		dom.btnCollapse.classList.remove("is-pop");
		void dom.btnCollapse.offsetWidth;
		dom.btnCollapse.classList.add("is-pop");
		window.setTimeout(function() {
			if (dom.btnCollapse) dom.btnCollapse.classList.remove("is-pop");
		}, 260);
	}

	function onEditClick() {
		if (!state.selectedPostNo) return;

		// 읽기 -> 수정
		if (state.mode === "read") {
			setMode("edit");
			ensureEditorOpen(true);
			refreshSaveAvailability();
			return;
		}

		// 수정 -> 취소
		if (state.mode === "edit") {
			onCancel();
		}
	}

	function changeTab(typeNo) {
		if (typeNo === state.boardTypeNo) return;

		confirmDirtyIfNeeded("탭을 이동하면 작성/수정 중인 내용이 초기화됩니다. 이동할까요?")
			.then(function(ok) {
				if (!ok) return;

				state.boardTypeNo = typeNo;
				state.page = 1;
				state.keyword = "";
				if (dom.keyword) dom.keyword.value = "";

				clearSelection();
				applyBoardTypeUI(typeNo);
				setMode("create");

				// ✅ 탭 이동 후 작성 권한 반영
				updateWriteControls(typeNo);

				setEditorCollapsed(state.editorCollapsed, false);
				loadPage(true);
			});
	}

	function applyBoardTypeUI(typeNo) {
		if (dom.tabs && dom.tabs.length) {
			Array.prototype.forEach.call(dom.tabs, function(t) {
				t.classList.toggle("is-active", Number(t.dataset.type) === typeNo);
			});
		}

		var nm = BOARD_TYPE[typeNo] || "게시판";
		if (dom.listTitle) dom.listTitle.textContent = nm + " 게시판";
		if (dom.typePill) dom.typePill.textContent = nm;

		var required = isPeriodRequiredType(typeNo);

		if (dom.periodWrap) {
			dom.periodWrap.classList.toggle("is-hidden", !required);
			dom.periodWrap.classList.toggle("is-required", required);
		}

		if (!required) {
			if (dom.periodYn) {
				dom.periodYn.disabled = false;
				dom.periodYn.checked = false;
			}
			if (dom.startDate) {
				dom.startDate.value = "";
				dom.startDate.disabled = true;
			}
			if (dom.endDate) {
				dom.endDate.value = "";
				dom.endDate.disabled = true;
			}
		} else {
			if (dom.periodYn) {
				dom.periodYn.checked = true;
				dom.periodYn.disabled = true;
			}

			if (state.mode === "read") {
				dom.startDate.disabled = true;
				dom.endDate.disabled = true;
			} else {
				dom.startDate.disabled = false;
				dom.endDate.disabled = false;
			}
		}

		// ✅ 탭 UI 적용 후 작성 권한 반영
		updateWriteControls(typeNo);

		refreshSaveAvailability();
	}

	function doSearch() {
		state.searchType = dom.searchType.value;
		state.keyword = (dom.keyword.value || "").trim();
		state.page = 1;
		loadPage(true);
	}

	function movePage(p) {
		var next = Math.min(Math.max(1, p), state.totalPages);
		if (next === state.page) return;
		state.page = next;
		loadPage(true);
	}

	function loadPage(showLoading) {
		if (!state.gridApi) return;

		if (showLoading) {
			try {
				state.gridApi.setGridOption("loading", true);
			} catch (e) { }
		}

		var url = state.ctx + "/rest/board/readPage";
		var params = {
			boardTypeNo: state.boardTypeNo,
			page: state.page,
			size: state.size,
			searchType: state.keyword ? state.searchType : "",
			keyword: state.keyword || "",
		};

		axios
			.get(url, { params: params })
			.then(function(res) {
				var list = (res && res.data && res.data.list) || [];
				var totalCount = Number((res && res.data && res.data.totalCount) || 0);

				state.totalCount = totalCount;
				state.totalPages = Math.max(1, Math.ceil(totalCount / state.size));

				if (dom.totalCnt) dom.totalCnt.textContent = String(totalCount);
				if (dom.pageNow) dom.pageNow.textContent = String(state.page);
				if (dom.pageTotal) dom.pageTotal.textContent = String(state.totalPages);

				state.gridApi.setGridOption("rowData", list);

				// ✅ rowData 반영 후 컬럼 폭 재맞춤 (가로 스크롤 방지)
				fitColumnsSoon();
			})
			.catch(function(err) {
				console.error("[board] readPage error:", err);
				try {
					state.gridApi.setGridOption("rowData", []);
				} catch (e) { }
				Swal.fire("오류", "게시글 목록을 불러오지 못했습니다.", "error");
			})
			.finally(function() {
				try {
					state.gridApi.setGridOption("loading", false);
				} catch (e) { }
			});
	}

	/**
	 * ✅ 핵심 수정
	 * - 저장 직후 새 글/수정 글을 다시 열 때 confirm을 띄우지 않도록 옵션 추가
	 */
	function onSelectPost(postNo, opts) {
		opts = opts || {};
		var skipConfirm = !!opts.skipConfirm;

		if (
			Number(postNo) === Number(state.selectedPostNo) &&
			state.mode === "read" &&
			!state.dirty
		) {
			ensureEditorOpen(true);
			return Promise.resolve();
		}

		var promise = Promise.resolve(true);

		if (!skipConfirm) {
			promise = confirmDirtyIfNeeded("작성/수정 중인 내용이 초기화됩니다. 게시글을 열까요?");
		} else {
			// 저장 직후 강제로 깨끗한 상태로 처리
			state.dirty = false;
		}

		return promise.then(function(ok) {
			if (!ok) return;

			return axios
				.get(state.ctx + "/rest/board/read/" + postNo)
				.then(function(res) {
					var board = res && res.data;
					if (!board) return;

					state.selectedPostNo = postNo;

					// ✅ 조회수 UI 즉시 반영 (상세 조회 API 성공 시점 = DB도 +1 된 시점)
					try {
						if (state.gridApi && state.gridApi.forEachNode) {
							state.gridApi.forEachNode(function(n) {
								if (!n || !n.data) return;
								if (Number(n.data.postNo) !== Number(postNo)) return;

								var next = Number(n.data.viewCnt || 0) + 1;

								// 화면 셀 값 갱신
								if (n.setDataValue) n.setDataValue("viewCnt", next);

								// data도 갱신
								n.data.viewCnt = next;
							});
						}
					} catch (e) { }

					fillFormFromBoard(board);
					setMode("read");
					markDirty(false);

					state.files = board.files || [];
					renderFiles(state.files);

					return loadComments(postNo).then(function() {
						ensureEditorOpen(true);
					});
				})
				.catch(function(err) {
					console.error("[board] read detail error:", err);
					Swal.fire("오류", "게시글을 불러오지 못했습니다.", "error");
				})
				.finally(function() {
					refreshSaveAvailability();
				});
		});
	}

	function fillFormFromBoard(b) {
		dom.postNo.value = b.postNo != null ? b.postNo : "";
		dom.title.value = b.title != null ? b.title : "";
		dom.cn.value = b.cn != null ? b.cn : "";

		var required = isPeriodRequiredType(state.boardTypeNo);
		if (required) {
			dom.periodYn.checked = true;
			dom.periodYn.disabled = true;

			dom.startDate.value = toDateInput(b.startDtm);
			dom.endDate.value = toDateInput(b.endDtm);
		}

		dom.metaText.textContent =
			"#" +
			(b.postNo != null ? b.postNo : "") +
			" · 작성자 " +
			(b.regEmpNm || b.regEmpNo || "-");
	}

	function setMode(mode) {
		state.mode = mode;

		if (mode === "create") {
			state.selectedPostNo = null;

			try {
				if (state.gridApi && state.gridApi.deselectAll) state.gridApi.deselectAll();
			} catch (e) { }

			// ✅ 작성 권한 반영
			var allowed = canWrite(state.boardTypeNo);

			dom.modeTitle.textContent = allowed ? "글쓰기" : "읽기 전용";
			dom.metaText.textContent = allowed ? "작성 모드" : "HR 권한만 작성 가능합니다. (건의 탭 제외)";

			dom.btnEdit.classList.add("is-hidden");
			dom.btnDelete.classList.add("is-hidden");
			dom.cmntWrap.classList.add("is-hidden");

			setFormEnabled(allowed);
			clearForm();
			markDirty(false);
			clearReplyTo();

			state.files = [];

			setFileInputEnabled(allowed);
			renderFiles([]);
			clearSelectedFiles();

			setEditBtnAsEdit();
			applyBoardTypeUI(state.boardTypeNo);
			refreshSaveAvailability();

			// ✅ create 모드로 돌아갈 때도 폭 맞춤
			fitColumnsSoon();
			return;
		}

		if (mode === "read") {
			dom.modeTitle.textContent = "상세";

			dom.btnEdit.classList.remove("is-hidden");
			dom.btnDelete.classList.remove("is-hidden");
			dom.cmntWrap.classList.remove("is-hidden");

			setFormEnabled(false);
			setEditBtnAsEdit();

			setFileInputEnabled(false);
			clearSelectedFiles();

			markDirty(false);
			applyBoardTypeUI(state.boardTypeNo);
			refreshSaveAvailability();

			fitColumnsSoon();
			return;
		}

		if (mode === "edit") {
			dom.modeTitle.textContent = "수정";

			dom.btnEdit.classList.remove("is-hidden");
			dom.btnDelete.classList.remove("is-hidden");
			dom.cmntWrap.classList.remove("is-hidden");

			setFormEnabled(true);
			markDirty(false);

			setFileInputEnabled(true);
			clearSelectedFiles();

			renderFiles(state.files || []);

			setEditBtnAsCancel();
			applyBoardTypeUI(state.boardTypeNo);
			refreshSaveAvailability();

			fitColumnsSoon();
		}
	}

	function setEditBtnAsEdit() {
		if (!dom.btnEdit) return;
		var icon = dom.btnEdit.querySelector("i");
		if (icon) icon.className = "bi bi-pencil-square";
		dom.btnEdit.title = "수정";
		dom.btnEdit.setAttribute("aria-label", "수정");
	}

	function setEditBtnAsCancel() {
		if (!dom.btnEdit) return;
		var icon = dom.btnEdit.querySelector("i");
		if (icon) icon.className = "bi bi-x-circle";
		dom.btnEdit.title = "취소";
		dom.btnEdit.setAttribute("aria-label", "취소");
	}

	function setFormEnabled(enabled) {
		dom.title.disabled = !enabled;
		dom.cn.disabled = !enabled;

		var required = isPeriodRequiredType(state.boardTypeNo);
		if (required) {
			if (dom.periodYn) {
				dom.periodYn.checked = true;
				dom.periodYn.disabled = true;
			}
			dom.startDate.disabled = !enabled;
			dom.endDate.disabled = !enabled;
			return;
		}

		if (dom.periodYn) dom.periodYn.disabled = !enabled;
		var pEnabled = enabled && dom.periodYn.checked;
		dom.startDate.disabled = !pEnabled;
		dom.endDate.disabled = !pEnabled;
	}

	function clearForm() {
		dom.postNo.value = "";
		dom.title.value = "";
		dom.cn.value = "";

		var required = isPeriodRequiredType(state.boardTypeNo);
		if (required) {
			dom.periodYn.checked = true;
			dom.periodYn.disabled = true;
			dom.startDate.value = "";
			dom.endDate.value = "";
			return;
		}

		if (dom.periodYn) dom.periodYn.checked = false;
		dom.startDate.value = "";
		dom.endDate.value = "";
		dom.startDate.disabled = true;
		dom.endDate.disabled = true;
	}

	// ✅ 작성 버튼은 confirm 없이 글쓰기 전환
	function goCreateNoConfirm() {
		// ✅ 안전장치: 권한 없으면 create로 못 들어감
		if (!canWrite(state.boardTypeNo)) {
			Swal.fire("안내", "HR 권한만 작성할 수 있습니다. (건의 탭 제외)", "info");
			return;
		}

		if (state.mode === "create" && !state.selectedPostNo) {
			ensureEditorOpen(true);
			refreshSaveAvailability();
			return;
		}

		state.dirty = false;
		clearSelection();
		setMode("create");

		ensureEditorOpen(true);
		refreshSaveAvailability();
	}

	function clearSelection() {
		state.selectedPostNo = null;
		try {
			if (state.gridApi && state.gridApi.deselectAll) state.gridApi.deselectAll();
		} catch (e) { }

		dom.cmntList.innerHTML = "";
		dom.cmntCnt.textContent = "0";
		dom.cmntText.value = "";
		clearReplyTo();

		state.files = [];
		renderFiles([]);
		clearSelectedFiles();
	}

	function clearSelectedFiles() {
		if (!dom.files) return;
		try {
			dom.files.value = "";
		} catch (e) { }
	}

	function setFileInputEnabled(enabled) {
		if (!dom.files) return;
		dom.files.disabled = !enabled;
		dom.files.classList.toggle("is-hidden", !enabled);
	}

	function renderFiles(files) {
		if (!dom.fileList) return;

		var list = Array.isArray(files) ? files : [];
		dom.fileList.innerHTML = "";

		if (!list.length) {
			dom.fileList.innerHTML = '<div class="bd-muted">첨부파일이 없습니다.</div>';
			return;
		}

		list.forEach(function(f) {
			var fileNo = f.boardFileNo != null ? f.boardFileNo : f.board_file_no != null ? f.board_file_no : f.fileNo;
			var name = f.fileNm != null ? f.fileNm : f.file_nm != null ? f.file_nm : "파일";
			var size = formatBytes(Number(f.fileSize || 0));
			var regDtm = f.regDtm ? String(f.regDtm) : "";

			var el = document.createElement("div");
			el.className = "bd-fileItem";

			el.innerHTML =
				' <div class="bd-fileName">' +
				'   <i class="bi bi-file-earmark"></i>' +
				'   <a href="' +
				state.ctx +
				"/rest/board/file/download/" +
				fileNo +
				'" target="_blank" rel="noopener">' +
				escapeHtml(name) +
				"</a>" +
				" </div>" +
				' <div class="bd-fileBtns"></div>';

			var btns = el.querySelector(".bd-fileBtns");
			if (btns && state.mode === "edit") {
				var delBtn = document.createElement("button");
				delBtn.type = "button";
				delBtn.className = "bt-btn bt-btn--ghost";
				delBtn.innerHTML = '<i class="bi bi-trash"></i><span>삭제</span>';

				delBtn.addEventListener("click", function() {
					Swal.fire({
						icon: "warning",
						title: "첨부파일 삭제",
						text: "첨부파일을 삭제할까요?",
						showCancelButton: true,
						confirmButtonText: "삭제",
						cancelButtonText: "취소",
					}).then(function(r) {
						if (!r.isConfirmed) return;

						axios
							.delete(state.ctx + "/rest/board/file/remove/" + fileNo)
							.then(function() {
								return axios.get(state.ctx + "/rest/board/file/readList/" + state.selectedPostNo);
							})
							.then(function(next) {
								renderFiles((next && next.data) || []);
							})
							.catch(function(err) {
								console.error(err);
								Swal.fire("오류", "첨부파일 삭제에 실패했습니다.", "error");
							});
					});
				});

				btns.appendChild(delBtn);
			}

			dom.fileList.appendChild(el);
		});
	}

	function markDirty(on) {
		state.dirty = !!on;
	}

	function confirmDirtyIfNeeded(message) {
		if (!state.dirty) return Promise.resolve(true);

		return Swal.fire({
			icon: "warning",
			title: "확인",
			text: message,
			showCancelButton: true,
			confirmButtonText: "초기화",
			cancelButtonText: "취소",
		}).then(function(r) {
			if (r.isConfirmed) {
				state.dirty = false;
				return true;
			}
			return false;
		});
	}

	function refreshSaveAvailability() {
		if (!dom.btnSave) return;

		// ✅ create 모드에서 작성 권한 없으면 저장 비활성화
		if (state.mode === "create" && !canWrite(state.boardTypeNo)) {
			dom.btnSave.disabled = true;
			return;
		}

		if (state.mode === "read") {
			dom.btnSave.disabled = true;
			return;
		}

		var valid = isFormValidForSave();

		if (state.mode === "create") {
			dom.btnSave.disabled = !valid;
			return;
		}

		if (state.mode === "edit") {
			dom.btnSave.disabled = !(state.dirty && valid);
		}
	}

	function isFormValidForSave() {
		var title = (dom.title && dom.title.value ? dom.title.value : "").trim();
		var cn = (dom.cn && dom.cn.value ? dom.cn.value : "").trim();

		if (!title) return false;
		if (!cn) return false;

		var required = isPeriodRequiredType(state.boardTypeNo);
		if (required) {
			var s = (dom.startDate && dom.startDate.value ? dom.startDate.value : "").trim();
			var e = (dom.endDate && dom.endDate.value ? dom.endDate.value : "").trim();
			if (!s || !e) return false;
		}

		return true;
	}

	function onSave() {
		if (dom.btnSave && dom.btnSave.disabled) return;

		// ✅ create 저장 시 권한 체크(최종 방어)
		if (state.mode === "create" && !canWrite(state.boardTypeNo)) {
			Swal.fire("안내", "HR 권한만 작성할 수 있습니다. (건의 탭 제외)", "info");
			return;
		}

		var payload = buildBoardPayload();

		if (!payload.title) return Swal.fire("안내", "제목을 입력하세요.", "info");
		if (!payload.cn) return Swal.fire("안내", "내용을 입력하세요.", "info");

		var required = isPeriodRequiredType(state.boardTypeNo);
		if (required) {
			if (!payload.startDtm || !payload.endDtm) {
				return Swal.fire("안내", "교육/채용 게시판은 시작일/종료일이 필수입니다.", "info");
			}
		}

		if (state.mode === "create") {
			axios
				.post(state.ctx + "/rest/board/create", payload)
				.then(function(res) {
					var newPostNo = Number(res && res.data ? res.data : 0);

					if (newPostNo && dom.files && dom.files.files && dom.files.files.length) {
						return uploadSelectedFiles(newPostNo).then(function() {
							return newPostNo;
						});
					}
					return newPostNo;
				})
				.then(function(newPostNo) {
					markDirty(false);

					Swal.fire("완료", "게시글이 등록되었습니다.", "success");

					loadPage(true);

					if (newPostNo) {
						return onSelectPost(newPostNo, { skipConfirm: true });
					} else {
						setMode("create");
					}
				})
				.catch(function(err) {
					console.error(err);

					if (err && err.response && err.response.status === 403) {
						Swal.fire("권한 없음", "HR 권한만 작성할 수 있습니다. (건의 탭 제외)", "warning");
						return;
					}

					Swal.fire("오류", "등록에 실패했습니다.", "error");
				})
				.finally(function() {
					refreshSaveAvailability();
				});

			return;
		}

		if (state.mode === "edit" && state.selectedPostNo) {
			Swal.fire({
				icon: "question",
				title: "수정",
				text: "정말 수정하시겠습니까?",
				showCancelButton: true,
				confirmButtonText: "수정",
				cancelButtonText: "취소",
			}).then(function(ok) {
				if (!ok.isConfirmed) return;

				axios
					.put(state.ctx + "/rest/board/update/" + state.selectedPostNo, payload)
					.then(function() {
						if (dom.files && dom.files.files && dom.files.files.length) {
							return uploadSelectedFiles(state.selectedPostNo);
						}
					})
					.then(function() {
						markDirty(false);

						Swal.fire("완료", "수정되었습니다.", "success");
						return onSelectPost(state.selectedPostNo, { skipConfirm: true });
					})
					.then(function() {
						loadPage(false);
					})
					.catch(function(err) {
						console.error(err);
						Swal.fire("오류", "수정에 실패했습니다.", "error");
					})
					.finally(function() {
						refreshSaveAvailability();
					});
			});
		}
	}

	function buildBoardPayload() {
		var required = isPeriodRequiredType(state.boardTypeNo);
		var periodYn = required ? "Y" : dom.periodYn && dom.periodYn.checked ? "Y" : "N";

		var startDtm = null;
		var endDtm = null;

		if (required) {
			var s1 = dom.startDate.value;
			var e1 = dom.endDate.value;
			if (s1) startDtm = s1 + " 00:00:00";
			if (e1) endDtm = e1 + " 23:59:59";
		} else if (periodYn === "Y") {
			var s2 = dom.startDate.value;
			var e2 = dom.endDate.value;
			if (s2) startDtm = s2 + " 00:00:00";
			if (e2) endDtm = e2 + " 23:59:59";
		}

		return {
			boardTypeNo: state.boardTypeNo,
			regEmpNo: state.loginEmpNo,
			title: dom.title.value.trim(),
			cn: dom.cn.value,
			periodYn: periodYn,
			startDtm: startDtm,
			endDtm: endDtm,
			viewCnt: 0,
		};
	}

	function uploadSelectedFiles(postNo) {
		if (!dom.files || !dom.files.files || !dom.files.files.length) return Promise.resolve();

		var fd = new FormData();
		Array.prototype.forEach.call(dom.files.files, function(f) {
			fd.append("files", f);
		});

		return axios
			.post(
				state.ctx +
				"/rest/board/file/upload/" +
				postNo +
				"?regEmpNo=" +
				encodeURIComponent(state.loginEmpNo),
				fd,
				{ headers: { "Content-Type": "multipart/form-data" } }
			)
			.then(function(res) {
				state.files = (res && res.data) || [];
				renderFiles(state.files);
				clearSelectedFiles();
			})
			.catch(function(err) {
				console.error(err);
				Swal.fire("오류", "첨부파일 업로드에 실패했습니다.", "error");
			});
	}

	function onDelete() {
		if (!state.selectedPostNo) return;

		Swal.fire({
			icon: "warning",
			title: "삭제",
			text: "정말 삭제하시겠습니까?",
			showCancelButton: true,
			confirmButtonText: "삭제",
			cancelButtonText: "취소",
		}).then(function(r) {
			if (!r.isConfirmed) return;

			axios
				.delete(state.ctx + "/rest/board/delete/" + state.selectedPostNo)
				.then(function() {
					Swal.fire("완료", "삭제되었습니다.", "success");
					clearSelection();
					setMode("create");

					setEditorCollapsed(state.editorCollapsed, true);

					loadPage(true);
				})
				.catch(function(err) {
					console.error(err);
					Swal.fire("오류", "삭제에 실패했습니다.", "error");
				})
				.finally(function() {
					refreshSaveAvailability();
				});
		});
	}

	function onCancel() {
		if (state.mode === "edit") {
			confirmDirtyIfNeeded("수정 중인 내용이 초기화됩니다. 취소할까요?").then(function(ok) {
				if (!ok) return;

				if (state.selectedPostNo) {
					onSelectPost(state.selectedPostNo);
				} else {
					setMode("create");
				}
				refreshSaveAvailability();
			});
			return;
		}

		if (state.mode === "create") {
			confirmDirtyIfNeeded("작성 중인 내용이 초기화됩니다. 취소할까요?").then(function(ok) {
				if (!ok) return;
				clearForm();
				markDirty(false);
				refreshSaveAvailability();
			});
		}
	}

	// ===== Comments =====
	function loadComments(postNo) {
		return axios
			.get(state.ctx + "/rest/board/comment/readList/" + postNo)
			.then(function(res) {
				state.comments = (res && res.data) || [];
				renderComments();
			})
			.catch(function(err) {
				console.error("[board] comments error:", err);
				state.comments = [];
				renderComments();
			});
	}

	function renderComments() {
		var list = Array.isArray(state.comments) ? state.comments : [];
		dom.cmntCnt.textContent = String(list.length);
		dom.cmntList.innerHTML = "";

		var parents = list.filter(function(c) {
			return (c.commentLvl || 1) === 1;
		});
		var children = list.filter(function(c) {
			return (c.commentLvl || 1) === 2;
		});

		parents.forEach(function(p) {
			dom.cmntList.appendChild(renderCmntItem(p, false));
			children
				.filter(function(k) {
					return k.parentCmntNo === p.cmntNo;
				})
				.forEach(function(k) {
					dom.cmntList.appendChild(renderCmntItem(k, true));
				});
		});
	}

	function renderCmntItem(c, isChild) {
		var el = document.createElement("div");
		el.className = "bd-cmntItem" + (isChild ? " is-child" : "");

		var dt = c.regDtm ? String(c.regDtm) : "";
		var cn = escapeHtml(c.commentCn || "");
		var writer = escapeHtml(c.writerEmpNo || "-");

		var kindText = isChild ? "ㄴ 대댓글" : "댓글";
		var canReply = !isChild;

		el.innerHTML =
			'      <div class="bd-cmntTop">' +
			'        <div class="bd-cmntMeta">' +
			'          <span class="bd-cmntKind">' +
			escapeHtml(kindText) +
			"</span>" +
			"          <b>" +
			writer +
			"</b>" +
			"          <span>" +
			escapeHtml(dt) +
			"</span>" +
			"        </div>" +
			'        <div class="bd-cmntBtns">' +
			(canReply
				? '<button type="button" class="bt-btn bt-btn--ghost bd-btnReply"><i class="bi bi-reply"></i><span>답글</span></button>'
				: "") +
			'          <button type="button" class="bt-btn bt-btn--ghost bd-btnCmntDel"><i class="bi bi-trash"></i><span>삭제</span></button>' +
			"        </div>" +
			"      </div>" +
			'      <div class="bd-cmntBody">' +
			cn +
			"</div>";

		if (canReply) {
			var replyBtn = el.querySelector(".bd-btnReply");
			if (replyBtn) {
				replyBtn.addEventListener("click", function() {
					setReplyTo(c.cmntNo);
				});
			}
		}

		var delBtn = el.querySelector(".bd-btnCmntDel");
		if (delBtn) {
			delBtn.addEventListener("click", function() {
				Swal.fire({
					icon: "warning",
					title: "댓글 삭제",
					text: "댓글을 삭제할까요?",
					showCancelButton: true,
					confirmButtonText: "삭제",
					cancelButtonText: "취소",
				}).then(function(r) {
					if (!r.isConfirmed) return;

					axios
						.delete(state.ctx + "/rest/board/comment/remove/" + c.cmntNo)
						.then(function() {
							return loadComments(state.selectedPostNo);
						})
						.catch(function(err) {
							console.error(err);
							Swal.fire("오류", "댓글 삭제에 실패했습니다.", "error");
						});
				});
			});
		}

		return el;
	}

	function setReplyTo(parentCmntNo) {
		state.replyTo = { parentCmntNo: parentCmntNo, commentLvl: 2 };
		if (dom.replyTo) dom.replyTo.classList.remove("is-hidden");
		if (dom.cmntText) dom.cmntText.focus();
	}

	function clearReplyTo() {
		state.replyTo = null;
		if (dom.replyTo) dom.replyTo.classList.add("is-hidden");
	}

	function onCommentSave() {
		if (!state.selectedPostNo) {
			Swal.fire("안내", "게시글을 선택한 후 댓글을 작성할 수 있습니다.", "info");
			return;
		}

		var text = (dom.cmntText.value || "").trim();
		if (!text) {
			Swal.fire("안내", "댓글 내용을 입력하세요.", "info");
			return;
		}

		var payload = {
			postNo: state.selectedPostNo,
			parentCmntNo: state.replyTo ? state.replyTo.parentCmntNo : null,
			commentLvl: state.replyTo ? 2 : 1,
			commentCn: text,
			writerEmpNo: state.loginEmpNo,
			delYn: "N",
		};

		axios
			.post(state.ctx + "/rest/board/comment/create", payload)
			.then(function() {
				dom.cmntText.value = "";
				clearReplyTo();
				return loadComments(state.selectedPostNo);
			})
			.catch(function(err) {
				console.error(err);
				Swal.fire("오류", "댓글 등록에 실패했습니다.", "error");
			});
	}

	// ===== Utils =====
	function toDateInput(dt) {
		if (!dt) return "";
		return String(dt).slice(0, 10);
	}

	function escapeHtml(str) {
		return String(str)
			.replaceAll("&", "&amp;")
			.replaceAll("<", "&lt;")
			.replaceAll(">", "&gt;")
			.replaceAll('"', "&quot;")
			.replaceAll("'", "&#039;");
	}

	function formatBytes(bytes) {
		if (!bytes || bytes < 0) return "0 B";
		var units = ["B", "KB", "MB", "GB", "TB"];
		var b = bytes;
		var u = 0;

		while (b >= 1024 && u < units.length - 1) {
			b = b / 1024;
			u += 1;
		}

		var v = u === 0 ? String(Math.round(b)) : b.toFixed(1);
		return v + " " + units[u];
	}

	return { init: init };
})();