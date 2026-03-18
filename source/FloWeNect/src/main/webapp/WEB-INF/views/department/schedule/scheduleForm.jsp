<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib uri="jakarta.tags.core" prefix="c"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>업무 캘린더</title>
<link rel="stylesheet"
	href="${pageContext.request.contextPath}/css/department/schedule.css">
</head>
<body>

	<%-- 헤더 --%>
	<div class="schedule-page-header">
		<div class="schedule-page-header-left">
			<div class="schedule-page-title">업무 캘린더</div>
			<div class="schedule-page-sub">일정 확인 · 업무 관리 · 팀 일정</div>
		</div>
		<div class="schedule-page-header-right">
			<a href="${pageContext.request.contextPath}/leader/kpi/readList">
				<button class="schedule-header-btn-add">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none"
						stroke="currentColor" stroke-width="2.5">
						<line x1="12" y1="5" x2="12" y2="19"></line>
						<line x1="5" y1="12" x2="19" y2="12"></line>
					</svg>
					일정 등록
				</button>
			</a>
		</div>
	</div>

	<%-- 메인 --%>
	<div class="main">

		<%-- 간트차트 영역 --%>
		<div class="gantt-wrapper">

			<%-- 간트 상단 툴바 --%>
			<div class="gantt-toolbar">
				<button class="gantt-nav-btn" id="btnPrev">&#8249;</button>
				<span class="gantt-period-label" id="periodLabel"></span>
				<button class="gantt-nav-btn" id="btnNext">&#8250;</button>
				<div class="gantt-view-btns">
<!-- 					<button class="gantt-view-btn active" data-view="month">월</button> -->
<!-- 					<button class="gantt-view-btn" data-view="week">주</button> -->
				</div>
			</div>

			<%-- 간트 본체 --%>
			<div class="gantt-body">
				<%-- 좌측 task 이름 열 --%>
				<div class="gantt-left" id="ganttLeft">
					<div class="gantt-left-header">업무명</div>
					<div class="gantt-left-rows" id="ganttLeftRows"></div>
				</div>
				<%-- 우측 타임라인 --%>
				<div class="gantt-right" id="ganttRight">
					<div class="gantt-timeline-header" id="ganttTimelineHeader"></div>
					<div class="gantt-timeline-rows" id="ganttTimelineRows"></div>
				</div>
			</div>
		</div>

		<%-- 우측 상세 패널 --%>
		<div class="right-panel" id="rightPanel">
			<div class="right-panel-empty" id="rightPanelEmpty">
				<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5">
					<rect x="3" y="4" width="18" height="18" rx="2"></rect>
					<line x1="16" y1="2" x2="16" y2="6"></line>
					<line x1="8" y1="2" x2="8" y2="6"></line>
					<line x1="3" y1="10" x2="21" y2="10"></line>
				</svg>
				<p>업무를 클릭하면<br>상세 정보가 표시됩니다</p>
			</div>
			<div class="right-panel-detail" id="rightPanelDetail" style="display:none;">
				<div class="detail-stat-badge" id="detailStat"></div>
				<div class="detail-title" id="detailTitle"></div>
				<div class="detail-rows" id="detailRows"></div>
				<div class="detail-desc-box" id="detailDesc"></div>
			</div>
		</div>
	</div>

	<%-- 상세 모달 --%>
	<div id="taskDetailModal" style="display:none; position:fixed; z-index:9999; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.45); backdrop-filter:blur(3px);">
		<div style="background:#fff; width:500px; margin:100px auto; padding:30px; border-radius:16px; box-shadow:0 10px 40px rgba(0,0,0,0.2);">
			<div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #4b49ac; padding-bottom:12px; margin-bottom:20px;">
				<h3 style="margin:0; color:#4b49ac; font-size:18px;">업무 상세 정보</h3>
				<span onclick="closeTaskModal()" style="cursor:pointer; font-size:26px; color:#9ca3af; line-height:1;">&times;</span>
			</div>
			<div id="modalBody" style="line-height:1.9; color:#374151;"></div>
			<div style="text-align:right; margin-top:20px;">
				<button onclick="closeTaskModal()" style="padding:8px 20px; background:#6c757d; color:#fff; border:none; border-radius:6px; cursor:pointer;">닫기</button>
			</div>
		</div>
	</div>

	<script src="${pageContext.request.contextPath}/js/department/schedule.js"></script>
</body>
</html>
