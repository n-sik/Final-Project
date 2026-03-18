<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core"%>
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>Dashboard</title>
<script>
	localStorage.setItem('theme', 'light');
	document.documentElement.classList.add('light-mode');
</script>

<style>

.navbar-menu-wrapper {
	height: 100%;
}

/* 브레드크럼 컨테이너 */
.breadcrumb-container {
	display: flex !important;
	flex-direction: row !important; /* 가로 방향 강제 */
	align-items: center;
	margin-left: 20px;
	font-family: 'Pretendard', sans-serif;
	white-space: nowrap; /* 텍스트 줄바꿈 방지 */
}

/* 각 항목 스타일 */
.breadcrumb-item {
	font-size: 15px;
	color: #888;
	display: inline-block; /* 세로 나열 방지 */
}

.breadcrumb-item.active {
	color: #333;
	font-weight: 700;
}

/* 구분선(>) 스타일 */
.breadcrumb-separator {
	display: flex;
	align-items: center;
	margin: 0 10px;
	color: #ccc;
	font-size: 12px;
}
</style>
<script>
	// 테마 초기화
	if (localStorage.getItem('theme') === 'light') {
		document.documentElement.classList.add('light-mode');
	}

	/**
	 * 공용 JS에서 호출하는 브레드크럼 업데이트 함수
	 * localStorage에 저장된 카테고리명을 읽어와서 HTML을 생성합니다.
	 */
	function updateHeaderBreadcrumb() {
		const breadcrumbArea = document.getElementById('breadcrumb-area');
		if (!breadcrumbArea) return;

		const mainCategory = localStorage.getItem('activeMainCategory');
		const subCategory = localStorage.getItem('activeSubCategory');

		if (mainCategory && subCategory) {
			breadcrumbArea.innerHTML = `
				<div class="breadcrumb-item">\${mainCategory}</div>
				<div class="breadcrumb-separator"><i class="fas fa-chevron-right"></i></div>
				<div class="breadcrumb-item active">\${subCategory}</div>
			`;
		} else if (mainCategory) {
			breadcrumbArea.innerHTML = `<div class="breadcrumb-item active">\${mainCategory}</div>`;
		}
	}

	// 페이지 로드 시 즉시 실행
	document.addEventListener("DOMContentLoaded", function() {
		updateHeaderBreadcrumb();
	});
</script>
</head>

<body>
	<nav class="navbar">
		<div class="navbar-menu-wrapper">
			<div id="breadcrumb-area" class="breadcrumb-container"></div>

			<div class="navbar-nav-right-container">
				<!-- ✅ 헤더에 알림 아이콘만 노출 (기존 네모 위젯 아이콘 제거) -->
				<ul class="navbar-nav widget-area">
					<li class="nav-item nav-widget"><a
						class="nav-link widget-sub-item" href="javascript:void(0);"
						id="notiBellBtn" title="알림"> <i class="fas fa-bell"></i> <span
							class="count-symbol bg-danger" id="notiUnreadDot"
							style="display: none;"></span>
					</a></li>
				</ul>
			</div>
		</div>
	</nav>

	<!-- ✅ 알림 요약 드롭다운(최근 7일) -->
	<div class="noti-popover" id="notiPopover" aria-hidden="true">
		<div class="noti-popover__head">
			<div class="noti-popover__title">알림</div>
			<div class="noti-popover__actions">
				<button type="button" class="noti-btn" id="notiReadAllBtn">모두
					읽음</button>
				<button type="button" class="noti-btn" id="notiCloseBtn">닫기</button>
			</div>
		</div>
		<div class="noti-list" id="notiSummaryList">
			<div class="noti-item">
				<div class="noti-item__cn">알림을 불러오는 중...</div>
			</div>
		</div>
		<div class="noti-popover__foot">
			<div class="noti-muted">최근 7일 요약</div>
			<button type="button" class="noti-btn" id="notiMoreBtn">더
				자세히 보기</button>
		</div>
	</div>

	<!-- ✅ 알림 상세 모달(최근 3개월) -->
	<div class="bt-modal" id="notiModal" aria-hidden="true">
		<div class="bt-modal__backdrop" data-close="true"></div>
		<div class="bt-modal__card bt-modal__card--wide" role="dialog"
			aria-modal="true" aria-labelledby="notiModalTitle">
			<div class="bt-modal__head">
				<div class="bt-modal__title" id="notiModalTitle">
					<i class="fas fa-bell"></i> 알림 내역 (최근 3개월)
				</div>
				<button type="button" class="bt-modal__close" data-close="true"
					aria-label="닫기">
					<i class="fas fa-times"></i>
				</button>
			</div>
			<div class="bt-modal__body">
				<div class="noti-modal-list" id="notiModalList"></div>
			</div>
			<div class="bt-modal__foot">
				<button type="button" class="noti-btn" data-close="true">닫기</button>
			</div>
		</div>
	</div>


	<!-- ✅ 우상단 토스트(스택: 최대 3개 노출, 나머지 큐 대기) -->
	<div class="noti-toast-stack" id="notiToastStack" aria-live="polite"
		aria-atomic="true"></div>


</body>
</html>