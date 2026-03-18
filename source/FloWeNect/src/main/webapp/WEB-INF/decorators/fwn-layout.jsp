<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core"%>
<%-- <%@ taglib prefix="sitemesh" uri="http://www.opensymphony.com/sitemesh/decorator" %> --%>

<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="loginEmpNo" content="${loginUser.empNo}">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

<link rel="preload" as="font" type="font/otf"
	href="/fonts/S-Core_Dream/SCDream4.otf" crossorigin="anonymous">
<link rel="preload" as="font" type="font/otf"
	href="/fonts/S-Core_Dream/SCDream5.otf" crossorigin="anonymous">

<title><sitemesh:write property="title" /></title>

<%@ include file="/WEB-INF/fragfwn/fwn/preStyle.jsp"%>

<sitemesh:write property="head" />

<!-- 로그인 사용자(realUser) JSON: 전역(window.LOGIN_USER)로 노출 -->
<script type="application/json" id="loginUserJson">${loginUserJson}</script>

<style>
/* 폰트 로드 전 invisible 처리 - 깜빡임 방지 */
@font-face {
	font-display: optional; /* 폰트 없으면 그냥 시스템 폰트 사용, 교체 안함 */
}
</style>

<!--============= css라이브러리 ============-->
<!-- Aggrid css -->
<link rel="stylesheet"
	href="https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-grid.css" />
<link rel="stylesheet"
	href="https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-theme-quartz.css" />
<!-- 아이콘 -->
<link rel="stylesheet"
	href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
<!-- 위젯  -->
<link rel="stylesheet"
	href="https://cdn.jsdelivr.net/gh/lykmapipo/themify-icons@0.1.2/css/themify-icons.css">
<!-- 캘린더 -->
<link href="https://unpkg.com/gridjs/dist/theme/mermaid.min.css"
	rel="stylesheet" />
<!-- 게시판  -->
<link
	href="https://unpkg.com/tabulator-tables@5.5.0/dist/css/tabulator_bootstrap5.min.css"
	rel="stylesheet">
<!-- 부트 스트랩 -->
<!--   <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"> -->

<!-- ====================================== -->
</head>
<body data-emp-no="${not empty loginUser ? loginUser.empNo : ''}">


	<div class="container-scroller">
		<%@ include file="/WEB-INF/fragfwn/fwn/sidebar.jsp"%>
		<div class="main-panel">
			<%@ include file="/WEB-INF/fragfwn/fwn/header.jsp"%>
			<div class="content-wrapper" id="mainContent">
				<sitemesh:write property="body" />
			</div>
			<%@ include file="/WEB-INF/fragfwn/fwn/footer.jsp"%>
		</div>
	</div>



	<!-- ===========================
         MyPage Modal (Global)
         - moved here so it is centered in viewport, not inside sidebar
         =========================== -->
	<!-- ===========================
         MyPage Modal (신규)
         - 프로필 > 마이페이지 클릭 시 노출
         =========================== -->
	<div class="bt-modal" id="myPageModal" aria-hidden="true">
		<div class="bt-modal__backdrop" data-close="true"></div>
		<div class="bt-modal__card" role="dialog" aria-modal="true"
			aria-labelledby="myPageTitle">
			<div class="bt-modal__head">
				<div class="bt-modal__title" id="myPageTitle">
					<i class="fas fa-user-circle"></i> 마이페이지
				</div>
				<button type="button" class="bt-modal__close" data-close="true"
					aria-label="닫기">
					<i class="fas fa-times"></i>
				</button>
			</div>

			<div class="bt-modal__body">
				<!-- 1) 보안: 현재 비밀번호 확인 (진입 시 1회) -->
				<div class="mp-verify" id="mp_verifyWrap">
					<div class="mp-verify__title">현재 비밀번호 확인</div>
					<div class="mp-verify__desc">개인정보를 수정하려면 현재 비밀번호를 먼저 확인해주세요.</div>
					<div class="mp-verify__row">
						<input type="password" id="mp_currentPwd" placeholder="현재 비밀번호"
							autocomplete="current-password">
						<button type="button" class="mp-btn mp-btn--primary"
							id="mp_verifyBtn">확인</button>
					</div>
					<div class="mp-verify__msg" id="mp_verifyMsg" aria-live="polite"></div>
				</div>

				<!-- 2) 프로필 폼 (비밀번호 확인 후 노출) -->
				<div id="mp_formWrap" class="hidden">
					<div class="mp-grid">
						<div class="mp-field mp-profile-section" style="grid-row: span 2;">
							<label>프로필 사진</label>
							<div class="mp-profile-box">
								<div class="mp-profile-img">
									<c:choose>
										<c:when test="${not empty user.profileImgDto.fileMeta}">
											<img id="mp_profilePreview"
												src="https://finalfileserver.s3.ap-northeast-2.amazonaws.com/${user.profileImgDto.fileMeta.filePath}${user.profileImgDto.fileMeta.saveFileNm}"
												alt="프로필"
												style="width: 100%; height: 100%; object-fit: cover;"
												onerror="this.src='${pageContext.request.contextPath}/dist/assets/images/man1.png'">
										</c:when>

										<c:otherwise>
											<img id="mp_profilePreview"
												src="${pageContext.request.contextPath}/dist/assets/images/man1.png"
												alt="기본프로필"
												style="width: 100%; height: 100%; object-fit: cover;">
										</c:otherwise>
									</c:choose>
								</div>
								<div class="mp-profile-controls">
									<button type="button" class="mp-btn-sm"
										id="mp_profileChangeBtn">변경</button>
									<input type="file" id="mp_profileInput" accept="image/*"
										style="display: none;">
									<button type="button" class="mp-btn-sm btn-del"
										id="mp_profileDeleteBtn">삭제</button>
								</div>
							</div>
						</div>
						<div class="mp-field">
							<label>사원명</label> <input type="text" id="mp_empNm" readonly>
						</div>
						<div class="mp-field">
							<label>직위</label> <input type="text" id="mp_posNm" readonly>
						</div>
						<div class="mp-field mp-row--full">
							<label>부서</label> <input type="text" id="mp_deptNm" readonly>
						</div>

						<div class="mp-field">
							<label>비밀번호 입력</label> <input type="password" id="mp_newPwd"
								placeholder="변경할 비밀번호">
						</div>
						<div class="mp-field">
							<label>비밀번호 재확인</label> <input type="password" id="mp_newPwd2"
								placeholder="비밀번호 확인">
						</div>

						<div class="mp-field mp-row--full">
							<label>이메일 주소</label> <input type="email" id="mp_email"
								placeholder="example@company.com">
						</div>
						<div class="mp-field mp-row--full">
							<label>휴대전화번호</label> <input type="text" id="mp_hp"
								placeholder="010-0000-0000">
						</div>

						<div class="mp-field mp-zip">
							<label>우편번호</label>
							<div class="mp-zip__row">
								<input type="text" id="mp_zip" placeholder="00000" readonly>
								<button type="button" class="mp-btn" id="mp_zipSearchBtn">주소검색</button>
							</div>
						</div>
						<div class="mp-field">
							<label>상세주소</label> <input type="text" id="mp_addr2"
								placeholder="(선택)">
						</div>
						<div class="mp-field mp-row--full">
							<label>기본주소</label> <input type="text" id="mp_addr1"
								placeholder="도로명/지번 주소" readonly>
						</div>
					</div>

					<div class="mp-hint">• 사원명/직위/부서는 수정할 수 없습니다. 변경이 필요하면 인사부서에
						요청해주세요.</div>
				</div>
			</div>

			<div class="bt-modal__foot">
				<button type="button" class="mp-btn" data-close="true">닫기</button>
				<div id="mp_saveWrap" class="hidden">
					<button type="button" class="mp-btn mp-btn--primary"
						id="mp_saveBtn" disabled>저장</button>
				</div>
			</div>
		</div>
	</div>

	<!-- script 라이브러리 이 밑으로 넣으쇼  -->

	<!--     <script src="/dist/assets/vendors/popper.js/popper.min.js"></script> -->
	<script
		src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>
	<script
		src="https://cdn.jsdelivr.net/npm/@stomp/stompjs@7.0.0/bundles/stomp.umd.min.js"></script>
	<script
		src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
	<script
		src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
	<!-- Aggrid -->
	<script
		src="https://cdn.jsdelivr.net/npm/ag-grid-community/dist/ag-grid-community.min.js"></script>
	<!-- Bootstrap -->
	<script
		src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
	<!-- SortableJS(사이드바 편집) -->
	<script
		src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>
	<!-- 게시판 1 -->
	<script src="https://unpkg.com/gridjs/dist/gridjs.umd.js"></script>
	<!-- 게시판2 -->
	<script type="text/javascript"
		src="https://unpkg.com/tabulator-tables@5.5.0/dist/js/tabulator.min.js"></script>
	<!-- 게시판3 -->
	<script
		src="https://cdnjs.cloudflare.com/ajax/libs/list.js/2.3.1/list.min.js"></script>
	<!-- SweetAlert2 (알림창) -->
	<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
	<!-- 캘린더 -->
	<script
		src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js'></script>
	<!-- Axios -->
	<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
	<!-- Daum 우편번호 API (주소검색) -->
	<script
		src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
	<!-- SortableJS -->
	<script
		src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>
	<script
		src="https://cdn.jsdelivr.net/npm/@stomp/stompjs@7.0.0/bundles/stomp.umd.min.js"></script>
	<!-- 기존 postScript.jsp (initSidebarEditor 포함) -->
	<%@ include file="/WEB-INF/fragfwn/fwn/postScript.jsp"%>

	<script>
		document.addEventListener('DOMContentLoaded', function() {
			document.querySelectorAll('.bd-searchInput').forEach(
					function(input) {
						input.value = ''; // 값 초기화
						input.setAttribute('autocomplete', 'new-password');
					});
		});
	</script>

	<script src="${pageContext.request.contextPath}/js/dashboard.js"></script>
	<script src="${pageContext.request.contextPath}/js/myPage/mypage.js"></script>
	<script src="${pageContext.request.contextPath}/js/notification.js"></script>

</body>