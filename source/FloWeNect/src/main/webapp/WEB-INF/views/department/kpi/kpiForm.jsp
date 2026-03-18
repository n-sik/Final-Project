<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="loginDeptCd" content="${loginDeptCd}">
<title>KPI 관리 시스템</title>
<link rel="stylesheet"
	href="${pageContext.request.contextPath}/css/department/kpi.css">
<style>
.project-item {
	transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out,
		background-color 0.2s;
}

.project-item:hover {
	transform: scale(1.02);
	border-color: #cbd5e1;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
	background-color: #f8fafc;
}
</style>
</head>
<body>
	<div class="kpi-wrapper">

		<div class="kpi-page-header">
			<div class="kpi-page-header-left">
				<div class="kpi-page-title">KPI 관리</div>
				<div class="kpi-page-sub">프로젝트 · 핵심 KPI · 개인 업무 목록</div>
			</div>
			<div class="kpi-page-header-right">
				<div class="kpi-header-chip" id="headerChip" style="display: none;">
					<i class="fas fa-check-circle"></i> <span class="chip-dept"
						id="headerDept"></span> <span class="chip-sep"></span> <span
						class="chip-project" id="headerProject">-</span>
				</div>
				<%-- 헤더 KPI 추가 버튼 제거 (핵심 KPI 패널 헤더로 이동) --%>
			</div>
		</div>

		<div class="kpi-main">

			<%-- 1열: 프로젝트 선택 --%>
			<div class="panel p-left">
				<div class="panel-header">
					<h4>프로젝트 선택</h4>
				</div>
				<div class="scroll-area">
					<form method="get"
						action="${pageContext.request.contextPath}/leader/kpi/readList">
						<c:set var="loginDeptCd" value="${loginDeptCd}" />
						<c:set var="loginDeptNm" value="" />
						<c:choose>
							<c:when test="${loginDeptCd == '2026HR01'}">
								<c:set var="loginDeptNm" value="인사부서" />
							</c:when>
							<c:when test="${loginDeptCd == '2026PD01'}">
								<c:set var="loginDeptNm" value="생산제조부서" />
							</c:when>
							<c:when test="${loginDeptCd == '2026DV01'}">
								<c:set var="loginDeptNm" value="개발1부서" />
							</c:when>
							<c:when test="${loginDeptCd == '2026DV02'}">
								<c:set var="loginDeptNm" value="개발2부서" />
							</c:when>
							<c:when test="${loginDeptCd == '2026PM01'}">
								<c:set var="loginDeptNm" value="서비스기획부서" />
							</c:when>
							<c:when test="${loginDeptCd == '2026CS01'}">
								<c:set var="loginDeptNm" value="고객지원부서" />
							</c:when>
							<c:when test="${loginDeptCd == '2026MK01'}">
								<c:set var="loginDeptNm" value="마케팅부서" />
							</c:when>
							<c:when test="${loginDeptCd == '2026SL01'}">
								<c:set var="loginDeptNm" value="영업부서" />
							</c:when>
							<c:otherwise>
								<c:set var="loginDeptNm" value="${loginDeptCd}" />
							</c:otherwise>
						</c:choose>

						<form method="get"
							action="${pageContext.request.contextPath}/leader/kpi/readList">
							<%-- 부서코드를 hidden으로 고정, 드롭다운 대신 텍스트 표시 --%>
							<input type="hidden" name="deptCd" value="${loginDeptCd}" />
							<div
								style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #e2e8f0; border-radius: 6px; background: #f8fafc; color: #1e293b; font-weight: 600; font-size: 14px; box-sizing: border-box;">
								🏢 ${loginDeptNm}</div>
						</form>
					</form>
					<div id="projectListArea">
						<c:if test="${empty projectList}">
							<p class="empty-state">프로젝트를 선택하세요.</p>
						</c:if>
						<c:forEach var="project" items="${projectList}">
							<div class="project-item" data-project-no="${project.projectNo}"
								data-project-name="${project.projectNm}">
								<strong>${project.projectNm}</strong>
								<div>
									<div style="font-size: 11px; color: #64748b;">
										상태: <span class="proj-status" style="color: #64748b;">${project.projectStatCd}</span>
									</div>
									<div style="font-size: 11px; color: #94a3b8; margin-top: 3px;">
										📅
										<c:choose>
											<c:when test="${not empty project.startDtm}">
												<fmt:formatDate value="${project.startDtm}"
													pattern="yy.MM.dd" />
											</c:when>
											<c:otherwise>미정</c:otherwise>
										</c:choose>
										~
										<c:choose>
											<c:when test="${not empty project.endDtm}">
												<fmt:formatDate value="${project.endDtm}" pattern="yy.MM.dd" />
											</c:when>
											<c:otherwise>미정</c:otherwise>
										</c:choose>
									</div>
								</div>
							</div>
						</c:forEach>
					</div>
				</div>
			</div>

			<%-- 2열: 핵심 KPI --%>
			<div class="panel p-mid">
				<div class="panel-header">
					<div style="display: flex; align-items: center; gap: 8px;">
						<h4 style="margin: 0;">핵심 KPI</h4>
						<span id="selectedProjectName"
							style="display: none; font-size: 14px; color: #4b49ac; font-weight: bold;"></span>
					</div>
					<%-- KPI 추가 버튼: 핵심 KPI 패널 헤더 우측으로 이동 --%>
					<button class="kpi-header-btn-add" id="btnAddMainKpi"
						style="display: none; width: 100px; height: 32px; padding: 0; font-size: 12px;">
						+ KPI 추가
					</button>
				</div>
				<div class="scroll-area"
					style="display: flex; flex-direction: column;">
					<div id="mainKpiList" style="flex: 1;">
						<div class="empty-state">프로젝트를 선택하세요.</div>
					</div>
					<div id="mainKpiInputArea" class="main-kpi-input-area">
						<div id="mainKpiFormTitle" class="kpi-form-header">핵심 KPI 설정</div>
						<input type="text" id="newMainKpiTitle" class="kpi-control"
							style="margin-bottom: 10px;" placeholder="KPI 명칭 입력">
						<textarea id="newMainKpiCn" class="kpi-control kpi-textarea"
							placeholder="상세 내용 입력"></textarea>
						<div class="kpi-flex-row">
							<select id="newMainKpiType" class="kpi-control">
								<option value="TYPE_01">정량 지표</option>
								<option value="TYPE_02">정성 지표</option>
								<option value="TYPE_03">프로젝트형</option>
							</select> <input type="text" id="displayProjName" class="kpi-control"
								style="background-color: #f3f4f6; border: 1px solid #e2e8f0; text-align: center; cursor: default;"
								readonly>
						</div>
						<div class="kpi-flex-row" style="margin-bottom: 15px;">
							<div class="kpi-flex-item">
								<span class="kpi-sub-label">시작일</span> <input type="date"
									id="newMainStartDtm" class="kpi-control"
									style="font-size: 12px;">
							</div>
							<div class="kpi-flex-item">
								<span class="kpi-sub-label">종료일</span> <input type="date"
									id="newMainEndDtm" class="kpi-control" style="font-size: 12px;">
							</div>
						</div>
						<div
							style="background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
							<div
								style="display: flex; justify-content: space-between; margin-bottom: 10px;">
								<span style="font-size: 12px; color: #64748b;">현재 달성률</span> <span
									id="displayProgress"
									style="font-size: 18px; font-weight: bold; color: #4b49ac;">0%</span>
							</div>
							<input type="range" id="newMainKpiProgress" min="0" max="100"
								step="5" value="0" oninput="updateProgressDisplay(this.value)"
								style="width: 100%;">
							<div
								style="display: flex; gap: 6px; margin-top: 15px; flex-wrap: wrap;">
								<button type="button" class="progress-chip"
									onclick="quickSetProgress(0)">0%</button>
								<button type="button" class="progress-chip"
									onclick="quickSetProgress(25)">25%</button>
								<button type="button" class="progress-chip"
									onclick="quickSetProgress(50)">50%</button>
								<button type="button" class="progress-chip"
									onclick="quickSetProgress(75)">75%</button>
								<button type="button" class="progress-chip"
									onclick="quickSetProgress(100)">100%</button>
							</div>
						</div>
						<div class="kpi-btn-group">
							<button id="btnSubmitMainKpi" class="btn-kpi-save">확인 저장</button>
							<button type="button" class="btn-kpi-cancel"
								onclick="hideMainKpiForm()">취소</button>
						</div>
					</div>
				</div>
			</div>

			<%-- 3열: 개인 업무 목록 --%>
			<div class="panel p-right"
				style="display: flex; flex-direction: column; height: 100%;">
				<div class="panel-header">
					<h4 id="detailHeaderTitle" style="margin: 0;">개인 업무 목록</h4>
					<button class="btn-add" id="btnAddSubKpi"
						onclick="openSubKpiForm()"
						style="display: none; width: 100px; height: 32px; padding: 0; background: #007bff; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; font-family: inherit;">
						+ 개인업무 부여</button>
				</div>
				<div id="subKpiSavedList"
					style="padding: 15px; background: #fff; flex: 1; overflow-y: auto;">
					<div class="empty-state">KPI를 선택해주세요.</div>
				</div>
				<div id="subKpiDetailArea"
					style="border-top: 1px solid #eee; background: #f8fafc;"></div>
			</div>

		</div>
	</div>

	<%-- 과제 상세 모달 --%>
	<div id="taskDetailModal"
		style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 9999; align-items: center; justify-content: center;">
		<div
			style="background: #fff; width: 400px; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);">
			<div
				style="padding: 20px; display: flex; justify-content: space-between; align-items: center;">
				<h4 style="margin: 0;">과제 상세 정보</h4>
				<span onclick="closeTaskModal()"
					style="cursor: pointer; font-size: 20px;">&times;</span>
			</div>
			<div id="modalContent" style="padding: 25px;"></div>
			<div
				style="padding: 15px; background: #f8fafc; text-align: right; border-top: 1px solid #eee;">
				<button onclick="closeTaskModal()"
					style="padding: 10px 20px; background: #64748b; color: #fff; border: none; border-radius: 8px; cursor: pointer;">닫기</button>
			</div>
		</div>
	</div>

	<script src="${pageContext.request.contextPath}/js/department/kpi.js"></script>

	<script>
		// JS에서 btnAddMainKpi 버튼을 show/hide할 때 중간 패널 헤더 버튼을 직접 제어하므로
		// 기존 kpi.js 로직이 btnAddMainKpi id를 참조하면 그대로 동작합니다.
		// 만약 kpi.js에서 btnAddMainKpiHeader를 별도로 show/hide하는 코드가 있다면 제거하거나 무시하세요.
	</script>
</body>
</html>
