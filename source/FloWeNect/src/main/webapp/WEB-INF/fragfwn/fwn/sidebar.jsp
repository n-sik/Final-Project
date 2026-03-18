<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core"%>
<%@ taglib prefix="fn" uri="jakarta.tags.functions"%>
<%@ taglib prefix="sec"
	uri="http://www.springframework.org/security/tags"%>

<link rel="stylesheet"
	href="${pageContext.request.contextPath}/dist/assets/css/sidebar.css">

<script>
(function() {
    // ✅ 1. 데이터 가져오기
    const cachedProfileUrl = sessionStorage.getItem('profileImgUrl');
    const openIds = JSON.parse(sessionStorage.getItem('sidebarOpenMenus') || '[]');

    // ✅ 2. 스타일 즉시 주입 (애니메이션 차단 + 이미지 깜빡임 방지)
    const style = document.createElement('style');
    style.id = '__flowenect_fast_load';
    let css = '';
    
    if (openIds.length > 0) {
        css += '.collapse, .collapsing { transition: none !important; animation: none !important; height: auto !important; }\n';
    }
    if (cachedProfileUrl) {
        // 캐시된 이미지가 있을 때만 실제 이미지 요소를 잠깐 숨김
        css += '#sidebarProfileImg { visibility: hidden; }\n';
    }
    
    if (css) {
        style.textContent = css;
        document.head.appendChild(style);
    }

    // ✅ 3. DOM 감시 및 즉시 처리
    const observer = new MutationObserver(function(mutations, obs) {
        const menu = document.getElementById('sidebarMenu');
        const img = document.getElementById('sidebarProfileImg');

        // 사이드바 메뉴 처리
        if (menu && openIds.length > 0) {
            openIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.classList.remove('collapsing');
                    el.classList.add('show');
                    el.style.height = '';
                }
            });
        }

        // 프로필 이미지 처리
        if (img && cachedProfileUrl) {
            // 서버에서 온 src가 캐시와 다를 경우 가로챔
            if (img.src !== cachedProfileUrl) {
                img.src = cachedProfileUrl;
            }
            img.style.visibility = 'visible'; // 즉시 노출
        }

        // 필요한 요소가 모두 처리되었거나 body가 완전히 로드되면 종료
        if (menu && img) {
            obs.disconnect();
            cleanup();
        }
    });

    // 지연 방지를 위해 documentElement 감시
    observer.observe(document.documentElement, { childList: true, subtree: true });

    // 스타일 복구 함수
    function cleanup() {
        requestAnimationFrame(() => {
            const s = document.getElementById('__flowenect_fast_load');
            if (s) s.remove();
        });
    }

    // 대비책: 3초 이상 로드 안될 시 강제 노출
    setTimeout(() => {
        const img = document.getElementById('sidebarProfileImg');
        if (img) img.style.visibility = 'visible';
        cleanup();
    }, 3000);
})();

function onProfileUpdateSuccess(newImageUrl) {
    // 1. 세션 스토리지 갱신 (가장 중요)
    sessionStorage.setItem('profileImgUrl', newImageUrl);
    
    // 2. 현재 화면의 모든 프로필 이미지 즉시 변경
    const profileImgs = document.querySelectorAll('#sidebarProfileImg, .navbar-profile-img');
    profileImgs.forEach(img => img.src = newImageUrl);
    
    console.log("세션 이미지 캐시 갱신 완료:", newImageUrl);
}
</script>

<nav class="sidebar" id="sidebar">
	<div class="sidebar-brand">
		<a href="${pageContext.request.contextPath}/"> <img
			src="/dist/assets/images/logo_C.png" alt="logo" class="logo-light">
		</a>

	</div>

	<div class="sidebar-profile-area">
		<div class="profile-img" id="profileImageToggle"
			style="cursor: pointer;">
			<div class="profile-img" id="profileImageToggle"
				style="cursor: pointer;">
				<c:choose>
					<c:when test="${not empty user.profileImgDto.fileMeta}">
						<img id="sidebarProfileImg"
							src="${pageContext.request.contextPath}/rest/mypage/display?fileName=${user.profileImgDto.fileMeta.filePath}${user.profileImgDto.fileMeta.saveFileNm}"

							alt="프로필"
							style="width: 100%; height: 100%; object-fit: cover; visibility: hidden;"
							onerror="this.src='${pageContext.request.contextPath}/dist/assets/images/man1.png'">
					</c:when>

					<c:otherwise>
						<img id="sidebarProfileImg"
							src="${pageContext.request.contextPath}/dist/assets/images/man1.png"
							alt="기본프로필" style="width: 100%; height: 100%; object-fit: cover;">
					</c:otherwise>
				</c:choose>
			</div>
			<div class="profile-slide-menu" id="profileSlideMenu">
				<sec:authorize access="hasRole('HR')">
					<a href="javascript:void(0);" onclick="moveToReactService()"
						class="profile-slide-item"> <i class="fas fa-exchange-alt"></i>
						인사시스템
					</a>
				</sec:authorize>
				<a href="javascript:void(0);" class="profile-slide-item"
					id="openMyPage"> <i class="fas fa-user-circle"></i> 마이페이지
				</a> <a href="#" class="profile-slide-item"
					onclick="sessionStorage.clear(); localStorage.clear(); document.getElementById('logoutForm').submit(); return false;">
					<i class="fas fa-sign-out-alt"></i> 로그아웃
				</a>
				<form id="logoutForm" method="post"
					action="${pageContext.request.contextPath}/logout"></form>
			</div>
		</div>

		<div class="profile-info custom-profile-layout">
			<span class="name">${not empty loginUser ? loginUser.empNm : ''} <span class="posname"> ${not empty sessionScope.LOGIN_POS_NM ? sessionScope.LOGIN_POS_NM : ''}</span> </span>
			
			<%-- 추가 --%>
			<button id="sidebarToggle">
				<i class="fas fa-chevron-left"></i>
			</button>
			<span class="dept">${not empty loginDeptNm ? loginDeptNm : ''}</span>
		</div>
	</div>

	<!-- 메뉴 -->
	<ul class="nav" id="sidebarMenu">

		<c:choose>
			<c:when test="${not empty menuList}">
				<%-- DB에서 가져온 동적 메뉴 렌더링 --%>
				<c:forEach var="menu" items="${menuList}">
					<c:if test="${menu.menuLvl == 1 and menu.menuNo != 9}">

						<c:set var="menuId" value="menu_${menu.menuNo}" />

						<%-- 아이콘 매핑 --%>
						<c:choose>
							<c:when test="${menu.menuNo == 1}">
								<c:set var="menuIcon" value="fas fa-home" />
							</c:when>
							<c:when test="${menu.menuNo == 2}">
								<c:set var="menuIcon" value="fas fa-bullhorn" />
							</c:when>
							<c:when test="${menu.menuNo == 3}">
								<c:set var="menuIcon" value="fas fa-calendar-alt" />
							</c:when>
							<c:when test="${menu.menuNo == 4}">
								<c:set var="menuIcon" value="fas fa-file-signature" />
							</c:when>
							<c:when test="${menu.menuNo == 5}">
								<c:set var="menuIcon" value="fas fa-user-check" />
							</c:when>
							<c:when test="${menu.menuNo == 6}">
								<c:set var="menuIcon" value="fas fa-brain" />
							</c:when>
							<c:when test="${menu.menuNo == 7}">
								<c:set var="menuIcon" value="fas fa-building" />
							</c:when>
							<c:when test="${menu.menuNo == 8}">
								<c:set var="menuIcon" value="fas fa-calendar-week" />
							</c:when>
<%-- 							<c:when test="${menu.menuNo == 9}"> --%>
<%-- 								<c:set var="menuIcon" value="fas fa-sitemap" /> --%>
<%-- 							</c:when> --%>
							<c:otherwise>
								<c:set var="menuIcon" value="fas fa-bars" />
							</c:otherwise>
						</c:choose>

						<%-- 서브메뉴 존재 여부 확인 --%>
						<c:set var="hasChild" value="false" />
						<c:forEach var="sub" items="${menuList}">
							<c:if test="${sub.parentMenuNo == menu.menuNo}">
								<c:set var="hasChild" value="true" />
							</c:if>
						</c:forEach>

						<c:choose>
							<%-- 평가/조회 : LEADER 전용 --%>
							<c:when test="${menu.menuNm eq '평가/조회'}">
								<sec:authorize access="hasRole('LEADER')">
									<c:choose>
										<%-- 서브메뉴 있는 대메뉴 (폴더형) --%>
										<c:when test="${hasChild == 'true'}">
											<li class="nav-item" data-menu-no="${menu.menuNo}"><a
												class="nav-link" data-toggle="collapse" href="#${menuId}">
													<i class="${menuIcon}"></i> <span class="menu-title">${menu.menuNm}</span>
											</a>
												<div class="collapse" id="${menuId}">
													<ul class="nav flex-column sub-menu">
														<c:forEach var="sub" items="${menuList}">
															<c:if test="${sub.parentMenuNo == menu.menuNo}">
																<li class="nav-item"><a class="nav-link"
																	href="${pageContext.request.contextPath}${sub.menuUrl}">
																		${sub.menuNm} </a></li>
															</c:if>
														</c:forEach>
													</ul>
												</div></li>
										</c:when>

										<%-- 서브메뉴 없는 단독 메뉴 (링크형) --%>
										<c:otherwise>
											<li class="nav-item" data-menu-no="${menu.menuNo}"><a
												class="nav-link"
												href="${pageContext.request.contextPath}${menu.menuUrl}">
													<i class="${menuIcon}"></i> <span class="menu-title">${menu.menuNm}</span>
											</a></li>
										</c:otherwise>
									</c:choose>
								</sec:authorize>
							</c:when>

							<%-- 그 외 메뉴 --%>
							<c:when test="${hasChild == 'true'}">
								<li class="nav-item" data-menu-no="${menu.menuNo}"><a
									class="nav-link" data-toggle="collapse" href="#${menuId}">
										<i class="${menuIcon}"></i> <span class="menu-title">${menu.menuNm}</span>
								</a>
									<div class="collapse" id="${menuId}">
										<ul class="nav flex-column sub-menu">
											<c:forEach var="sub" items="${menuList}">
												<c:if test="${sub.parentMenuNo == menu.menuNo}">
													<%--
                                                        ROLE 기반 서브메뉴 노출
                                                        - 기안 > 결재 : LEADER, HR
                                                        - 설문/CBTI > 결과조회, 설정 : HR
                                                        - 부서 > KPI관리(KPI 포함) : LEADER
                                                    --%>
													<c:choose>
														<c:when
															test="${menu.menuNm eq '기안' and sub.menuNm eq '결재'}">
															<sec:authorize access="hasAnyRole('LEADER')">
																<li class="nav-item"><a class="nav-link"
																	href="${pageContext.request.contextPath}${sub.menuUrl}">${sub.menuNm}</a>
																</li>
															</sec:authorize>
														</c:when>

														<c:when
															test="${(menu.menuNm eq '설문' or menu.menuNm eq 'CBTI') and (sub.menuNm eq '결과조회' or sub.menuNm eq '설정')}">
															<sec:authorize access="hasRole('HR')">
																<li class="nav-item"><a class="nav-link"
																	href="${pageContext.request.contextPath}${sub.menuUrl}">${sub.menuNm}</a>
																</li>
															</sec:authorize>
														</c:when>

														<c:when
															test="${menu.menuNm eq '부서' and fn:contains(sub.menuNm, 'KPI')}">
															<sec:authorize access="hasRole('LEADER')">
																<li class="nav-item"><a class="nav-link"
																	href="${pageContext.request.contextPath}${sub.menuUrl}">${sub.menuNm}</a>
																</li>
															</sec:authorize>
														</c:when>

														<c:otherwise>
															<li class="nav-item"><a class="nav-link"
																href="${pageContext.request.contextPath}${sub.menuUrl}">${sub.menuNm}</a>
															</li>
														</c:otherwise>
													</c:choose>
												</c:if>
											</c:forEach>
										</ul>
									</div></li>
							</c:when>

							<%-- 서브메뉴 없는 단독 메뉴 (링크형) --%>
							<c:otherwise>
								<li class="nav-item" data-menu-no="${menu.menuNo}"><a
									class="nav-link"
									href="${pageContext.request.contextPath}${menu.menuUrl}"> <i
										class="${menuIcon}"></i> <span class="menu-title">${menu.menuNm}</span>
								</a></li>
							</c:otherwise>
						</c:choose>

					</c:if>
				</c:forEach>
			</c:when>

			<c:otherwise>
				<%-- menuList가 없을 때 폴백: 하드코딩 메뉴(ROLE 적용) --%>
				<%-- HOME (ALL) --%>
				<li class="nav-item active" data-menu-no="1"><a
					class="nav-link" href="${pageContext.request.contextPath}/"> <i
						class="fas fa-home"></i> <span class="menu-title">HOME</span>
				</a></li>

				<%-- 일일업무 (ALL) --%>
				<li class="nav-item" data-menu-no="3"><a class="nav-link"
					href="${pageContext.request.contextPath}/work/emp/readList"> <i
						class="fas fa-calendar-alt"></i> <span class="menu-title">일일업무</span>
				</a></li>

				<%-- 평가/조회 (LEADER) --%>
				<sec:authorize access="hasRole('LEADER')">
					<li class="nav-item" data-menu-no="5"><a class="nav-link"
						data-toggle="collapse" href="#evaluation"> <i
							class="fas fa-user-check"></i> <span class="menu-title">평가/조회</span>
					</a>
						<div class="collapse" id="evaluation">
							<ul class="nav flex-column sub-menu">
								<li class="nav-item"><a class="nav-link"
									href="${pageContext.request.contextPath}/leader/quant/eval/readList">정량평가</a></li>
								<li class="nav-item"><a class="nav-link"
									href="${pageContext.request.contextPath}/leader/qual/eval/readList">정성평가</a></li>
								<li class="nav-item"><a class="nav-link"
									href="${pageContext.request.contextPath}/leader/work/readList">업무조회</a></li>
							</ul>
						</div></li>
				</sec:authorize>

				<%-- 기안 (ALL / 결재는 LEADER, HR) --%>
				<li class="nav-item" data-menu-no="4"><a class="nav-link"
					data-toggle="collapse" href="#draft"> <i
						class="fas fa-file-signature"></i> <span class="menu-title">기안</span>
				</a>
					<div class="collapse" id="draft">
						<ul class="nav flex-column sub-menu">
							<li class="nav-item"><a class="nav-link"
								href="${pageContext.request.contextPath}/aprv/create">작성</a></li>
							<li class="nav-item"><a class="nav-link"
								href="${pageContext.request.contextPath}/aprv/readList?box=mine">조회</a></li>
							<sec:authorize access="hasAnyRole('LEADER')">
								<li class="nav-item"><a class="nav-link"
									href="${pageContext.request.contextPath}/aprv/pendingList?box=pending">결재</a></li>
							</sec:authorize>
						</ul>
					</div></li>

				<%-- 설문 (ALL / 결과조회, 설정은 HR) --%>
				<li class="nav-item" data-menu-no="6"><a class="nav-link"
					data-toggle="collapse" href="#survey"> <i class="fas fa-brain"></i>
						<span class="menu-title">설문</span>
				</a>
					<div class="collapse" id="survey">
						<ul class="nav flex-column sub-menu">
							<li class="nav-item"><a class="nav-link"
								href="${pageContext.request.contextPath}/behavior/test">진단</a></li>
							<sec:authorize access="hasRole('HR')">
								<li class="nav-item"><a class="nav-link"
									href="${pageContext.request.contextPath}/behavior/result">결과조회</a></li>
								<li class="nav-item"><a class="nav-link"
									href="${pageContext.request.contextPath}/behavior/set">설정</a></li>
							</sec:authorize>
						</ul>
					</div></li>

				<%-- 부서 (KPI관리=LEADER / 공유폴더, 일정=ALL) --%>
				<li class="nav-item" data-menu-no="7"><a class="nav-link"
					data-toggle="collapse" href="#department"> <i
						class="fas fa-building"></i> <span class="menu-title">부서</span>
				</a>
					<div class="collapse" id="department">
						<ul class="nav flex-column sub-menu">
							<sec:authorize access="hasRole('LEADER')">
								<li class="nav-item"><a class="nav-link"
									href="${pageContext.request.contextPath}/leader/kpi/readList">KPI관리</a></li>
							</sec:authorize>
							<li class="nav-item"><a class="nav-link"
								href="${pageContext.request.contextPath}/work-drive/readList">공유폴더</a></li>
							<li class="nav-item"><a class="nav-link"
								href="${pageContext.request.contextPath}/work/schedule/readList">일정</a></li>
						</ul>
					</div></li>

				<%-- 일정 (ALL) --%>
				<li class="nav-item" data-menu-no="8"><a class="nav-link"
					href="${pageContext.request.contextPath}/schedule/integrationList">
						<i class="fas fa-calendar-week"></i> <span class="menu-title">일정</span>
				</a></li>

<%-- <%-- 				조직도 (ALL)
<!-- 				<li class="nav-item" data-menu-no="9"><a class="nav-link" -->
					href="${pageContext.request.contextPath}/organization/chart"> <i
<!-- 						class="fas fa-sitemap"></i> <span class="menu-title">조직도</span> -->
<!-- 				</a></li> --> --%> --%>

				<%-- 소식 (ALL) --%>
				<li class="nav-item" data-menu-no="2"><a class="nav-link"
					href="${pageContext.request.contextPath}/board"> <i
						class="fas fa-bullhorn"></i> <span class="menu-title">소식</span>
				</a></li>
			</c:otherwise>
		</c:choose>

	</ul>

	<div class="sidebar-settings">
		<a href="#" class="settings-title" id="editSidebarBtn"> <i
			class="fas fa-cog"></i> <span>사이드바 설정</span>
		</a>
		<p id="editNotice" class="hidden"
			style="margin: 10px 0; color: #f39c12; font-size: 11px;">드래그를 하여
			순서를 조절해주세요</p>
		<div class="sidebar-edit-actions" style="display: none;">
			<button class="btn btn-sm btn-primary" id="saveSidebarOrder">저장</button>
			<button class="btn btn-sm btn-secondary" id="cancelSidebarOrder">취소</button>
		</div>
	</div>

</nav>

<div id="reactBridgeConfig"
	data-context-path="${pageContext.request.contextPath}"
	data-react-url="${pageContext.request.scheme}://${pageContext.request.serverName}:3000"></div>

<script defer src="${pageContext.request.contextPath}/js/sidebar.js"></script>