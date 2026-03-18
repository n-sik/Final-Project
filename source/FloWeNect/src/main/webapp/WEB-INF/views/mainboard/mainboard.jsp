<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib uri="jakarta.tags.core" prefix="c"%>
<%@ taglib uri="jakarta.tags.functions" prefix="fn"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>메인보드</title>
<link rel="stylesheet"
	href="${pageContext.request.contextPath}/css/mainboard/mainboard.css">
</head>
<body>
	<div class="mb-page">
		<div class="mb-container">

			<c:set var="mainDeptCd"
				value="${not empty loginUser ? loginUser.deptCd : ''}" />

			<c:set var="attd" value="${board.todayAttendance}" />

			<!-- 헤더 -->
			<header class="mb-top">
				<div class="mb-top-left">
					<h2 class="mb-title">메인</h2>
					<p class="mb-sub">오늘 상태와 최근 업무를 한눈에 확인하세요.</p>
				</div>
			</header>

			<!-- 3컬럼 그리드 -->
			<div class="mb-grid">

				<!-- ════ 좌측 ════ -->
				<section class="mb-col mb-col-left">

					<!-- Today -->
					<div class="mb-card mb-card--today">
						<div class="mb-card-head">
							<div class="mb-today-head-left">
								<h3 class="mb-card-title">Today</h3>
								<c:if test="${attd != null && attd.lateYn == 'Y'}">
									<span class="mb-chip mb-chip-warn">지각</span>
								</c:if>
								<c:if test="${attd != null && attd.outAutoYn == 'Y'}">
									<span class="mb-chip mb-chip-auto">자동퇴근</span>
								</c:if>
							</div>
							<c:choose>
								<c:when test="${attd == null || attd.inDtm == null}">
									<span class="mb-badge">출근 전</span>
								</c:when>
								<c:when test="${attd.outDtm == null}">
									<span class="mb-badge mb-badge-work">근무 중</span>
								</c:when>
								<c:otherwise>
									<span class="mb-badge mb-badge-done">퇴근 완료</span>
								</c:otherwise>
							</c:choose>
						</div>
						<div class="mb-card-body">
							<div class="mb-actions">
								<c:choose>
									<c:when test="${attd == null || attd.inDtm == null}">
										<form class="mb-form"
											action="${pageContext.request.contextPath}/attendance/create-in"
											method="post">
											<button class="mb-btn mb-btn-primary mb-btn-wide">출근하기</button>
										</form>
									</c:when>
									<c:when test="${attd.outDtm == null}">
										<form class="mb-form mb-attd-out-form"
											action="${pageContext.request.contextPath}/attendance/modify-out"
											method="post">
											<button class="mb-btn mb-btn-danger mb-btn-wide">퇴근하기</button>
										</form>
									</c:when>
									<c:otherwise>
										<button class="mb-btn mb-btn-disabled mb-btn-wide" disabled>퇴근
											완료</button>
									</c:otherwise>
								</c:choose>
							</div>

							<div class="mb-commute-row">
								<div class="mb-commute-item">
									<span class="mb-commute-label">출근</span> <span
										class="mb-commute-time"> <c:choose>
											<c:when test="${attd != null && attd.inDtm != null}">
												<c:out
													value="${fn:substring(fn:replace(attd.inDtm,'T',' '), 11, 16)}" />
											</c:when>
											<c:otherwise>--:--</c:otherwise>
										</c:choose>
									</span>
								</div>
								<div class="mb-commute-item">
									<span class="mb-commute-label">퇴근</span> <span
										class="mb-commute-time"> <c:choose>
											<c:when test="${attd != null && attd.outDtm != null}">
												<c:out
													value="${fn:substring(fn:replace(attd.outDtm,'T',' '), 11, 16)}" />
											</c:when>
											<c:otherwise>--:--</c:otherwise>
										</c:choose>
									</span>
								</div>
							</div>

							<div class="mb-realtime-clock">
								<div class="mb-clock-date" id="currentDate"></div>
								<div class="mb-clock-time" id="currentTime">00:00:00</div>
							</div>
						</div>
					</div>

					<!-- 바로가기 -->
					<div class="mb-card">
						<div class="mb-card-head">
							<h3 class="mb-card-title">바로가기</h3>
						</div>
						<div class="mb-card-body mb-shortcut-body">
							<a
								href="${pageContext.request.contextPath}/schedule/integrationList"
								class="mb-shortcut-item"><span class="mb-sc-icon">📅</span><span
								class="mb-sc-label">일정</span></a> <a
								href="${pageContext.request.contextPath}/work/emp/readList"
								class="mb-shortcut-item"><span class="mb-sc-icon">📋</span><span
								class="mb-sc-label">업무</span></a> <a
								href="${pageContext.request.contextPath}/aprv/create"
								class="mb-shortcut-item"><span class="mb-sc-icon">📝</span><span
								class="mb-sc-label">결재</span></a> <a
								href="${pageContext.request.contextPath}/leader/kpi/readList?deptCd=${mainDeptCd}"
								class="mb-shortcut-item"><span class="mb-sc-icon">🎯</span><span
								class="mb-sc-label">KPI</span></a>
						</div>
					</div>

					<!-- 이번 주 일정 -->
					<div class="mb-card">
						<div class="mb-card-head">
							<h3 class="mb-card-title">이번 주 일정</h3>
							<a class="mb-link-dash"
								href="${pageContext.request.contextPath}/schedule/integrationList">전체보기</a>
						</div>
						<div class="mb-card-body">
							<c:choose>
								<c:when test="${empty board.weekSchedules}">
									<div class="mb-empty">
										<p>이번 주 일정이 없습니다.</p>
									</div>
								</c:when>
								<c:otherwise>
									<ul class="mb-week-list">
										<c:forEach var="s" items="${board.weekSchedules}">
											<li class="mb-week-item"><span class="mb-week-dot"
												style="${not empty s.color ? 'background:'.concat(s.color) : ''}"></span>
												<div class="mb-week-info">
													<p class="mb-week-title">
														<!-- VACATION이면 [사원명] 앞에 붙이기 -->
														<c:if test="${s.schdDivCd == 'VACATION'}">
          [<c:out value="${s.empNm}" />]
        </c:if>
														<c:out value="${s.schdTitle}" />
													</p>
													<span class="mb-week-date"><c:out
															value="${fn:substring(s.schdStDtm,0,10)}" /></span>
												</div></li>
										</c:forEach>
									</ul>
								</c:otherwise>
							</c:choose>
						</div>
					</div>

				</section>

				<!-- ════ 가운데 ════ -->
				<section class="mb-col mb-col-mid">

					<!-- 신규업무 -->
					<div class="mb-card">
						<div class="mb-card-head">
							<h3 class="mb-card-title">
								신규업무 <span class="mb-note">(최근 7일)</span>
							</h3>
							<div class="mb-head-right">
								<span class="mb-pill mb-pill--primary">${fn:length(board.newTasks)}건</span>
								<a class="mb-link-dash"
									href="${pageContext.request.contextPath}/work/emp/readList">전체보기</a>
							</div>
						</div>
						<div class="mb-card-body">
							<c:choose>
								<c:when test="${empty board.newTasks}">
									<div class="mb-empty">
										<p>신규업무가 없습니다.</p>
									</div>
								</c:when>
								<c:otherwise>
									<ul class="mb-list">
										<c:forEach var="t" items="${board.newTasks}">
											<li class="mb-item"
												onclick="location.href='${pageContext.request.contextPath}/work/emp/readList'">
												<p class="mb-item-title">
													<c:out value="${t.taskTitle}" />
												</p> <span class="mb-item-date"><c:out
														value="${fn:replace(t.regDtm,'T',' ')}" /></span>
											</li>
										</c:forEach>
									</ul>
								</c:otherwise>
							</c:choose>
						</div>
					</div>

					<!-- 공지사항 -->
					<div class="mb-card">
						<div class="mb-card-head">
							<h3 class="mb-card-title">
								공지사항 <span class="mb-note">/ 소식</span>
							</h3>
							<div class="mb-head-right">
								<span class="mb-pill mb-pill--primary">${fn:length(board.notices)}건</span>
								<a class="mb-link-dash"
									href="${pageContext.request.contextPath}/board">전체보기</a>
							</div>
						</div>
						<div class="mb-card-body">
							<c:choose>
								<c:when test="${empty board.notices}">
									<div class="mb-empty">
										<p>등록된 공지사항이 없습니다.</p>
									</div>
								</c:when>
								<c:otherwise>
									<ul class="mb-list">
										<c:forEach var="n" items="${board.notices}">
											<li class="mb-notice-item"
												onclick="location.href='${pageContext.request.contextPath}/board'">
												<c:choose>
													<c:when test="${n.noticeType == '긴급'}">
														<span class="mb-tag mb-tag--urgent">긴급</span>
													</c:when>
													<c:when test="${n.noticeType == '인사'}">
														<span class="mb-tag mb-tag--hr">인사</span>
													</c:when>
													<c:otherwise>
														<span class="mb-tag mb-tag--general">공지</span>
													</c:otherwise>
												</c:choose>
												<p class="mb-notice-title">
													<c:out value="${n.noticeTitle}" />
												</p> <span class="mb-item-date"><c:out
														value="${n.regDtm}" /></span>
											</li>
										</c:forEach>
									</ul>
								</c:otherwise>
							</c:choose>
						</div>
					</div>

				</section>

				<!-- ════ 우측 ════ -->
				<section class="mb-col mb-col-right">

					<!-- 업무요약 -->
					<div class="mb-card">
						<div class="mb-card-head">
							<h3 class="mb-card-title">업무요약</h3>
							<div class="mb-head-right">
								<c:choose>
									<c:when test="${board.yesterdayDaily == null}">
										<span class="mb-pill mb-pill--neutral">어제일지 없음</span>
									</c:when>
									<c:otherwise>
										<span class="mb-pill mb-pill--primary">어제일지 있음</span>
									</c:otherwise>
								</c:choose>
								<a class="mb-link-dash"
									href="${pageContext.request.contextPath}/work/emp/readList">전체보기</a>
							</div>
						</div>
						<div class="mb-card-body">
							<c:choose>
								<c:when test="${board.yesterdayDaily == null}">
									<div class="mb-empty">
										<p>전날 작성된 업무일지가 없습니다.</p>
									</div>
								</c:when>
								<c:otherwise>
									<p class="mb-summary-title">
										<c:out value="${board.yesterdayDaily.logTitle}" />
									</p>
									<p class="mb-summary-cn">
										<c:out value="${board.yesterdayDaily.logCn}" />
									</p>
								</c:otherwise>
							</c:choose>
						</div>
					</div>

					<!-- 근태 관리 -->
					<div class="mb-card">
						<div class="mb-card-head">
							<h3 class="mb-card-title">근태 관리</h3>
						</div>
						<div class="mb-card-body">
							<div class="mb-attd-btn-wrap">
								<button class="mb-attd-btn" onclick="mbOpenModal('record')">
									<div class="mb-attd-icon-wrap mb-attd-icon-wrap--blue">🕐</div>
									<div>
										<p class="mb-attd-btn-label">출퇴근 기록</p>
										<p class="mb-attd-btn-desc">이번 달 출퇴근 내역 확인</p>
									</div>
								</button>
								<button class="mb-attd-btn" onclick="mbOpenModal('stats')">
									<div class="mb-attd-icon-wrap mb-attd-icon-wrap--green">📊</div>
									<div>
										<p class="mb-attd-btn-label">근태 통계</p>
										<p class="mb-attd-btn-desc">지각 · 결근 이력 분석</p>
									</div>
								</button>
							</div>
						</div>
					</div>

					<!-- HR 소식 슬라이더 -->
					<div class="mb-card mb-card--hr">
						<div class="mb-card-head">
							<h3 class="mb-card-title">HR 소식</h3>
							<span class="mb-pill mb-pill--green">사내 뉴스</span>
						</div>
						<div class="mb-card-body mb-hr-body">
							<div class="mb-hr-track" id="hrTrack">

								<div class="mb-hr-slide">
									<div class="mb-hr-img mb-hr-img--1">
										<span class="mb-hr-img-label">🏆 수상</span>
									</div>
									<div class="mb-hr-info">
										<p class="mb-hr-title">2025년 우수사원 시상식 성료</p>
										<p class="mb-hr-desc">올해 총 12명이 수상의 영예를 안았습니다. 수고하신 모든 분께
											축하를 드립니다.</p>
									</div>
								</div>

								<div class="mb-hr-slide">
									<div class="mb-hr-img mb-hr-img--2">
										<span class="mb-hr-img-label">🎓 교육</span>
									</div>
									<div class="mb-hr-info">
										<p class="mb-hr-title">상반기 리더십 아카데미 모집</p>
										<p class="mb-hr-desc">3월 17일까지 인사팀으로 신청해 주세요. 선발 결과는 개별
											통보됩니다.</p>
									</div>
								</div>

								<div class="mb-hr-slide">
									<div class="mb-hr-img mb-hr-img--3">
										<span class="mb-hr-img-label">🎉 복지</span>
									</div>
									<div class="mb-hr-info">
										<p class="mb-hr-title">임직원 가족 문화 행사 안내</p>
										<p class="mb-hr-desc">4월 가족 초청 행사 참가 신청을 받습니다. 선착순 50가족
											한정입니다.</p>
									</div>
								</div>

								<div class="mb-hr-slide">
									<div class="mb-hr-img mb-hr-img--4">
										<span class="mb-hr-img-label">📢 채용</span>
									</div>
									<div class="mb-hr-info">
										<p class="mb-hr-title">2026 상반기 신입공채 시작</p>
										<p class="mb-hr-desc">인재 추천 제도를 통해 보너스를 받으세요. 지원서 접수 3월
											31일 마감.</p>
									</div>
								</div>

							</div>
							<div class="mb-hr-footer">
								<div class="mb-hr-dots" id="hrDots">
									<span class="mb-hr-dot active"></span> <span class="mb-hr-dot"></span>
									<span class="mb-hr-dot"></span> <span class="mb-hr-dot"></span>
								</div>
								<div class="mb-hr-nav">
									<button class="mb-hr-nav-btn" id="hrPrev">&#8249;</button>
									<button class="mb-hr-nav-btn" id="hrNext">&#8250;</button>
								</div>
							</div>
						</div>
					</div>

				</section>
			</div>
		</div>
	</div>

	<!-- ════ 근태 모달 ════ -->
	<div class="mb-modal-overlay" id="attdModal">
		<div class="mb-modal">
			<div class="mb-modal-head">
				<span class="mb-modal-title">근태 관리</span>
				<button class="mb-modal-close" onclick="mbCloseModal()">✕</button>
			</div>
			<div class="mb-modal-tabs">
				<div class="mb-modal-tab active" data-tab="record"
					onclick="mbSwitchTab('record')">📋 출퇴근 기록</div>
				<div class="mb-modal-tab" data-tab="stats"
					onclick="mbSwitchTab('stats')">📊 근태 통계</div>
			</div>
			<div class="mb-modal-body">

				<div class="mb-tab-panel active" id="panel-record">
					<table class="mb-attd-table">
						<thead>
							<tr>
								<th>날짜</th>
								<th>출근</th>
								<th>퇴근</th>
								<th>상태</th>
								<th>비고</th>
							</tr>
						</thead>
						<tbody id="attdTableBody">
							<tr>
								<td colspan="5"
									style="text-align: center; padding: 20px; color: #94a3b8;">로딩
									중...</td>
							</tr>
						</tbody>
					</table>
				</div>

				<div class="mb-tab-panel" id="panel-stats">
					<div class="mb-stats-grid" id="statsGrid">
						<div class="mb-stat-box mb-stat-box--blue">
							<p class="mb-stat-box-label">이번 달 출근일</p>
							<p class="mb-stat-box-value" id="statWorkDays">
								- <span>일</span>
							</p>
						</div>
						<div class="mb-stat-box mb-stat-box--warn">
							<p class="mb-stat-box-label">지각 횟수</p>
							<p class="mb-stat-box-value" id="statLateDays">
								- <span>회</span>
							</p>
						</div>
						<div class="mb-stat-box mb-stat-box--red">
							<p class="mb-stat-box-label">결근 횟수</p>
							<p class="mb-stat-box-value" id="statAbsentDays">
								- <span>회</span>
							</p>
						</div>
						<div class="mb-stat-box mb-stat-box--green">
							<p class="mb-stat-box-label">자동퇴근 횟수</p>
							<p class="mb-stat-box-value" id="statAutoOut">
								- <span>회</span>
							</p>
						</div>
					</div>
					<p style="font-size: 11px; color: #94a3b8; margin-top: 8px;">※
						이번 달(1일~오늘) 기준 집계입니다.</p>
				</div>

			</div>
		</div>
	</div>

	<script>
		const contextPath = "${pageContext.request.contextPath}";
	</script>
	<script defer
		src="${pageContext.request.contextPath}/js/mainboard/mainboard.js"></script>
</body>
</html>
