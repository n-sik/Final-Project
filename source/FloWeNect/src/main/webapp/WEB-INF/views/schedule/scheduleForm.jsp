<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>

<link rel="stylesheet"
	href="${pageContext.request.contextPath}/css/schedule/schedule.css">

<div class="schedule-page-container">
	<div class="schedule-header-bar card-style">
		<div class="header-left">
			<h3 class="font-paperozi text-xl font-bold">통합 일정 관리</h3>
			<div style="font-size: 11px; color: #a9a9a9;">연차 · 채용 · 일정</div>
		</div>
		<div class="header-right filter-options">
			<label class="filter-item"><input type="checkbox" checked
				class="filter-chk" value="education"><span class="dot edu"></span>
				교육</label> <label class="filter-item"><input type="checkbox" checked
				class="filter-chk" value="leave"><span class="dot leave"></span>
				연차</label> <label class="filter-item"><input type="checkbox" checked
				class="filter-chk" value="recruit"><span class="dot recruit"></span>
				채용</label>
		</div>
	</div>

	<div class="calendar-main-area card-style">
		<div id="calendar"></div>
	</div>
</div>

<div id="eventModal" class="modal-overlay">
	<div class="modal-content card-style">
		<div class="modal-header">
			<h3 id="modalTitle" class="font-paperozi text-xl font-bold">일정
				상세</h3>
			<span class="close-btn">&times;</span>
		</div>
		<div class="modal-body">
			<div class="modal-row">
				<span class="modal-label">일시</span> <span id="modalDate"
					class="modal-data"></span>
			</div>
			<div class="modal-row">
				<span class="modal-label">구분</span>
				<div class="modal-data category-wrapper">
					<span id="modalTypeDot" class="dot"></span> <span
						id="modalTypeText"></span>
				</div>
			</div>
			<div class="modal-row full-width">
				<span class="modal-label"
					style="display: block; margin-bottom: 8px; width: 100px;">상세
					내용</span>
				<div id="modalDescription" class="modal-description-box"></div>
			</div>
		</div>
	</div>
</div>

<div id="dayListModal" class="modal-overlay">
    <div class="modal-content card-style" style="max-width: 400px;">
        <div class="modal-header">
            <h3 id="dayListTitle" class="font-paperozi text-xl font-bold">2026-02-10 일정</h3>
            <span class="close-day-modal" style="cursor:pointer; font-size:24px;">&times;</span>
        </div>
        <div id="dayListContainer" class="modal-body" style="max-height: 400px; overflow-y: auto;">
            </div>
    </div>
</div>

<script src="${pageContext.request.contextPath}/js/schedule/schedule.js"></script>
