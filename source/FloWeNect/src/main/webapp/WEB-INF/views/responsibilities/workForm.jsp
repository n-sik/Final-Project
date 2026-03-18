<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>

<link rel="stylesheet"
	href="${pageContext.request.contextPath}/css/responsibilities/work.css">

<%-- ══════════════════════════════════════
     담당업무 페이지 (v3) - 위치 변경 버전
     - 1열: 담당업무 목록
     - 2열: 이전 일지 패널 (위치 변경)
     - 3열: 일지 작성 폼 (위치 변경)
════════════════════════════════════════ --%>
<div class="work-page">

	<%-- ── 상단 헤더 바 ── --%>
	<div class="work-header">
		<div class="work-header-left">
			<h2>담당업무</h2>
			<div class="sub">부서장이 부여한 업무 · 일지 관리</div>
		</div>
		<div class="work-header-right">
			<%-- 선택된 업무 표시 칩 --%>
			<div class="selected-chip">
				<i class="fas fa-check-circle"
					style="color: #0090e7; font-size: 11px;"></i> <span
					class="chip-label" id="chipProject">-</span> <span class="chip-dot"></span>
				<span id="chipPeriod" style="font-size: 11px;">업무를 선택하세요</span>
			</div>
		</div>
	</div>
	<%-- /work-header --%>


	<%-- ══════════ 바디: 좌측 목록 + 우측 확장 패널 ══════════ --%>
	<div class="work-body">

		<%-- ════ 1열: 담당업무 목록 ════ --%>
		<div class="col-panel col-tasks">
			<div class="col-header">
				<div class="col-title">
					<i class="fas fa-briefcase"></i> 담당업무 <span class="col-count"
						id="taskCountBadge">총 0</span>
				</div>
			</div>
			<%-- JS → renderTaskList() --%>
			<div class="col-body" id="taskList"></div>
		</div>
		<%-- /col-tasks --%>


		<%-- ════ 우측 확장 패널: 이전일지 + 일지작성 (순서 변경됨) ════ --%>
		<div class="col-panel col-right-panel">

			<%-- 빈 상태 (업무 미선택) --%>
			<div class="journal-empty" id="journalEmpty">
				<i class="fas fa-robot"></i>
				<p>좌측에서 업무를 선택하세요</p>
				<small>선택한 업무의 일일업무 일지를 작성합니다</small>
			</div>

			<%-- 업무 선택 시 표시되는 2단 레이아웃 --%>
			<div class="right-panel-inner" id="rightPanelInner"
				style="display: none;">

				<%-- ── [위치 변경] 기존 3열: 이전 일지 패널 ── --%>
				<div class="rp-history" id="rpHistory">



					<%-- 헤더 --%>
					<div class="history-header">
						<div class="col-title">
							<i class="fas fa-history"></i> <span id="historyPanelTitle">현재
								일지</span> <span class="col-count" id="historyCountBadge"></span>
						</div>
					</div>

					<%-- 탭 전환 버튼 --%>
					<div class="history-tab-bar">
						<button class="history-tab active" id="tabCurrent"
							onclick="switchHistoryTab('current')">현재 업무 일지</button>
						<button class="history-tab" id="tabAll"
							onclick="switchHistoryTab('all')">이전 업무 일지</button>
					</div>

					<%-- 현재 업무 일지 (기존 로직) --%>
					<div id="panelCurrent">
						<div class="history-search-bar">
							<div class="search-row">
								<span class="search-row-label">업무명</span>
								<div class="search-input-wrap">
									<i class="fas fa-search"></i> <input type="text"
										id="historySearchKeyword" placeholder="업무명으로 검색..."
										oninput="filterHistory()" />
								</div>
								<button class="search-clear-btn" onclick="clearKeywordSearch()"
									title="초기화">
									<i class="fas fa-times"></i>
								</button>
							</div>
							<div class="search-row">
								<span class="search-row-label">기간</span>
								<div class="search-date-wrap">
									<input type="date" id="historySearchDateFrom"
										onchange="filterHistory()" title="시작일" /> <span
										class="date-range-sep">~</span> <input type="date"
										id="historySearchDateTo" onchange="filterHistory()"
										title="종료일" />
								</div>
								<button class="search-clear-btn" onclick="clearDateSearch()"
									title="초기화">
									<i class="fas fa-times"></i>
								</button>
							</div>
						</div>
						<div id="historyListWrap">
							<div class="col-body" id="historyList">
								<div class="history-empty">
									<i class="fas fa-inbox"></i>
									<p>업무를 선택하면 일지가 표시됩니다</p>
								</div>
							</div>
						</div>
					</div>

					<%-- 이전 업무 일지 (아코디언) --%>
					<div id="panelAll"
						style="display: none; flex: 1; overflow: hidden; flex-direction: column;">
						<div class="history-search-bar">
							<div class="search-row">
								<span class="search-row-label">업무명</span>
								<div class="search-input-wrap">
									<i class="fas fa-search"></i> <input type="text"
										id="allSearchKeyword" placeholder="업무명으로 검색..."
										oninput="filterAccordion()" />
								</div>
								<button class="search-clear-btn" onclick="clearAllKeyword()"
									title="초기화">
									<i class="fas fa-times"></i>
								</button>
							</div>
							<div class="search-row">
								<span class="search-row-label">기간</span>
								<div class="search-date-wrap">
									<input type="date" id="allSearchDateFrom"
										onchange="filterAccordion()" title="시작일" /> <span
										class="date-range-sep">~</span> <input type="date"
										id="allSearchDateTo" onchange="filterAccordion()" title="종료일" />
								</div>
								<button class="search-clear-btn" onclick="clearAllDate()"
									title="초기화">
									<i class="fas fa-times"></i>
								</button>
							</div>
						</div>
						<div class="col-body" id="accordionList">
							<div class="history-empty">
								<i class="fas fa-inbox"></i>
								<p>로딩 중...</p>
							</div>
						</div>
					</div>

				</div>
				<%-- /rp-history --%>


				<%-- ── [위치 변경] 기존 2열: 일지 작성 ── --%>
				<div class="rp-journal">
					<%-- 접기 버튼 (아이콘 방향 변경: chevron-left) --%>
					<button class="history-collapse-btn" id="historyCollapseBtn"
						onclick="toggleHistoryPanel()" title="접기/펼치기">
						<i class="fas fa-chevron-right" id="historyCollapseIcon"></i>
					</button>
					<div class="col-header">
						<div class="col-title">
							&nbsp;&nbsp;&nbsp;<i class="fas fa-pen"></i>오늘 업무일지 <span
								class="col-count" id="todayLabel"></span>
						</div>
					</div>

					<%-- 날짜 탭 --%>
					<div class="date-tab-bar" id="dateTabs"></div>

					<%-- 폼 --%>
					<div class="col-body"
						style="flex-direction: column; display: flex; flex: 1; overflow: hidden;">
						<div class="journal-form"
							style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">

							<%-- ② 업무 내용 --%>
							<div class="form-section section-grow">
								<div class="form-section-title">
									<i class="fas fa-align-left"></i> 업무 내용 <span
										style="color: #fc424a; margin-left: 2px;">*</span>
								</div>
								<div class="form-section-body">
									<input type="text" id="journalTitle"
										class="journal-title-input" placeholder="일지 제목을 입력하세요 *" />
									<textarea id="journalContent"
										placeholder="오늘 수행한 업무 내용을 작성해주세요."></textarea>
								</div>
							</div>

						</div>
						<%-- 폼 하단 버튼 --%>
						<div class="journal-form-footer">
							<button class="btn btn-primary" onclick="submitJournal()">
								<i class="fas fa-check"></i> 일지 제출
							</button>
						</div>
					</div>
				</div>
				<%-- /rp-journal --%>

				<%-- 이전 일지 상세보기 모달 --%>
				<div class="history-detail-overlay" id="historyDetailOverlay"
					onclick="closeHistoryDetail()"></div>
				<div class="history-detail-modal" id="historyDetailModal">
					<div class="hdm-header">
						<div class="hdm-title" id="hdmTitle"></div>
						<button class="hdm-close" onclick="closeHistoryDetail()">
							<i class="fas fa-times"></i>
						</button>
					</div>
					<div class="hdm-body">
						<div class="hdm-meta">
							<span class="hdm-date" id="hdmDate"></span> <span
								class="history-badge" id="hdmBadge"></span>
						</div>
						<div class="hdm-section-title">업무 내용</div>
						<div class="hdm-content" id="hdmContent"></div>
					</div>
				</div>

			</div>
			<%-- /right-panel-inner --%>

		</div>
		<%-- /col-right-panel --%>

	</div>
	<%-- /work-body --%>

</div>
<%-- /work-page --%>

<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
<script
	src="${pageContext.request.contextPath}/js/responsibilities/work.js"></script>