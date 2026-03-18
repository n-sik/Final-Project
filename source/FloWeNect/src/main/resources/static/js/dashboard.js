/**
 * ⭐ UPGRADED Skydash Dashboard JavaScript
 * 고급 애니메이션과 부드러운 인터랙션 적용
 */

/* ===============================
   Global Variables
   =============================== */
let sidebarSortable = null;
let originalOrder = [];

/* ===============================
   DOM Ready
   =============================== */
document.addEventListener('DOMContentLoaded', function() {

	/* ===== 기본 UI 초기화 ===== */
	initSidebar();
	initDropdowns();
	initCharts();
	initCollapsible();
	initThemeMode();
	setActiveMenuItem();


	/* ===== 사이드바 편집 기능 ===== */
	initSidebarEditor();
	setupProfileDropdown();

	/* ===== 🎨 새로운 고급 기능 ===== */
	initRippleEffect();
	initSmoothHover();
	initSidebarScrollPersistence();

	/* ===== 위젯 ===== */
	const widgetToggle = document.getElementById('widgetToggle');
	const widgetContent = document.getElementById('widgetContent');

	if (widgetToggle && widgetContent) {
		widgetToggle.addEventListener('click', function(e) {
			e.stopPropagation();
			widgetContent.classList.toggle('active');
		});

		document.addEventListener('click', function(e) {
			if (!widgetContent.contains(e.target) && !widgetToggle.contains(e.target)) {
				widgetContent.classList.remove('active');
			}
		});
	}
});

/* ===============================
   ✨ Subtle Click Feedback (은은한 클릭 피드백)
   =============================== */
//function initRippleEffect() {
//	const navLinks = document.querySelectorAll('.sidebar .nav-link');
//
//	navLinks.forEach(link => {
//		link.addEventListener('click', function(e) {
//			this.style.transition = 'all 0.2s ease';
//			this.style.transform = 'scale(0.98)';
//
//			setTimeout(() => {
//				this.style.transform = '';
//			}, 150);
//		});
//	});
//}

/* ===============================
   ✨ Smooth Hover Effect (부드러운 호버)
   =============================== */
//function initSmoothHover() {
//	const menuItems = document.querySelectorAll('.sidebar .nav-item');
//
//	menuItems.forEach(item => {
//		const link = item.querySelector('.nav-link');
//		if (!link) return;
//
//		link.addEventListener('mouseenter', function() {
//			this.style.transition = 'all 0.3s ease';
//		});
//
//		link.addEventListener('mousemove', function(e) {
//			return;
//		});
//
//		link.addEventListener('mouseleave', function() {
//			this.style.transform = '';
//		});
//	});
//}

/* ===============================
   Sidebar Editor (순서 편집)
   =============================== */
function initSidebarEditor() {

	const editBtn = document.getElementById('editSidebarBtn');
	const saveBtn = document.getElementById('saveSidebarOrder');
	const cancelBtn = document.getElementById('cancelSidebarOrder');
	const sidebar = document.getElementById('sidebar');
	const menu = document.getElementById('sidebarMenu');
	const actions = document.querySelector('.sidebar-edit-actions');
	const editNotice = document.getElementById('editNotice');

	if (!editBtn || !menu) return;

	/* ===== 편집 모드 ON ===== */
	editBtn.addEventListener('click', function(e) {
		e.preventDefault();

		originalOrder = Array.from(menu.children).map(li => li.cloneNode(true));

		sidebar.classList.add('edit-mode');
		actions.style.display = 'flex';

		if (editNotice) editNotice.classList.remove('hidden');

		menu.querySelectorAll('[data-toggle="collapse"]').forEach(el => {
			el.dataset.toggleBackup = 'collapse';
			el.removeAttribute('data-toggle');
		});

		sidebarSortable = Sortable.create(menu, {
			animation: 200,
			ghostClass: 'sortable-ghost',
			easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
		});
	});

	/* ===== 저장 ===== */
	saveBtn.addEventListener('click', function() {
		const empNo = document.body.dataset.empNo;
		console.log(empNo);
		const menuOrderList = Array.from(menu.children).map(li =>
			Number(li.dataset.menuNo)
		);

		axios.post(`/sidebar/order?empNo=${empNo}`, menuOrderList)
			.then(() => {
				showToast('사이드바 순서가 저장되었습니다.', 'success');
				exitEditMode();
			})
			.catch(error => {
				console.error(error);
				showToast('저장 중 오류가 발생했습니다.', 'error');
			});
	});

	/* ===== 취소 ===== */
	cancelBtn.addEventListener('click', function() {
		menu.innerHTML = '';
		originalOrder.forEach(li => menu.appendChild(li));
		exitEditMode();
	});

	/* ===== 편집 모드 OFF ===== */
	function exitEditMode() {
		sidebar.classList.remove('edit-mode');
		actions.style.display = 'none';
		if (editNotice) editNotice.classList.add('hidden');

		menu.querySelectorAll('[data-toggle-backup]').forEach(el => {
			el.setAttribute('data-toggle', 'collapse');
			el.removeAttribute('data-toggle-backup');
		});

		initCollapsible();

		if (sidebarSortable) {
			sidebarSortable.destroy();
			sidebarSortable = null;
		}
	}

} // initSidebarEditor 끝

/* ===============================
   🎯 Toast Notification (토스트 알림)
   =============================== */
function showToast(message, type = 'info') {
	const toast = document.createElement('div');
	toast.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: ${type === 'success' ? '#00d25b' : '#0090e7'};
      color: white;
      padding: 15px 25px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      font-size: 14px;
      font-weight: 500;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
   `;
	toast.textContent = message;
	document.body.appendChild(toast);

	setTimeout(() => {
		toast.style.opacity = '1';
		toast.style.transform = 'translateY(0)';
	}, 10);

	setTimeout(() => {
		toast.style.opacity = '0';
		toast.style.transform = 'translateY(20px)';
		setTimeout(() => toast.remove(), 400);
	}, 3000);
}

/* ===============================
   사이드바 효과 & 브레드크럼 업데이트
   =============================== */
document.querySelectorAll('#sidebarMenu .nav-link').forEach(link => {
	link.addEventListener('click', function(e) {
		// 1. 기존 Active 제거 및 설정
		document.querySelectorAll('#sidebarMenu .nav-item.active').forEach(li => {
			li.classList.remove('active');
		});
		this.closest('.nav-item').classList.add('active');

		// 2. 브레드크럼 업데이트
		const subText = this.innerText.trim();
		const parentCollapse = this.closest('.collapse');
		let mainText = "";

		if (parentCollapse) {
			const parentNavAction = parentCollapse.previousElementSibling;
			mainText = parentNavAction.querySelector('.menu-title').innerText.trim();

			localStorage.setItem('activeMainCategory', mainText);
			localStorage.setItem('activeSubCategory', subText);
		} else {
			mainText = this.querySelector('.menu-title')?.innerText.trim() || subText;
			localStorage.setItem('activeMainCategory', mainText);
			localStorage.removeItem('activeSubCategory');
		}

		if (typeof updateHeaderBreadcrumb === 'function') {
			updateHeaderBreadcrumb();
		}
	});
});

/* ===============================
   Theme Mode
   =============================== */
function initThemeMode() {
	const toggle = document.getElementById('theme-toggle');
	const icon = document.getElementById('theme-icon');

	if (icon) {
		if (document.documentElement.classList.contains('light-mode')) {
			icon.className = 'bi bi-sun-fill';
		} else {
			icon.className = 'bi bi-moon-stars-fill';
		}
	}

	if (toggle) {
		toggle.addEventListener('click', function() {
			const isLight = document.documentElement.classList.toggle('light-mode');
			localStorage.setItem('theme', isLight ? 'light' : 'dark');

			if (icon) {
				icon.className = isLight ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
			}
		});
	}
}

/* ===============================
   Sidebar
   =============================== */
/* ===============================
   Sidebar
   =============================== */
function initSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function(e) {
            e.preventDefault();
            this.blur();
            sidebar.classList.toggle('collapsed');

            if (sidebar.classList.contains('collapsed')) {
                document.querySelectorAll('.collapse.show').forEach(openMenu => {
                    openMenu.classList.remove('show');
                    const parentLink = document.querySelector(`[href="#${openMenu.id}"]`);
                    if (parentLink) parentLink.setAttribute('aria-expanded', 'false');
                });
            }
        });
    }

    const navLinks = document.querySelectorAll('.sidebar .nav-item > .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (sidebar.classList.contains('collapsed')) {
                sidebar.classList.remove('collapsed');
            }

            // ✅ 추가: 실제 URL 링크 클릭 시 열린 collapse 전부 닫기
            const href = this.getAttribute('href');
            const isRealLink = href && href !== '#' && !href.startsWith('#');

            if (isRealLink) {
                document.querySelectorAll('.sidebar .collapse.show').forEach(c => {
                    c.classList.remove('show');
                });
                // sessionStorage도 초기화
                sessionStorage.removeItem('sidebarOpenMenus');
            }
        });
    });
}

/* ===============================
   Dropdowns
   =============================== */
function initDropdowns() {
	const container = document.getElementById('widgetContent');
	const notiBtn = document.querySelector('.widget-sub-item[title="알림"]');
	if (!notiBtn || !container) return;

	notiBtn.onclick = (e) => {
		e.preventDefault();
		const isOpen = container.classList.toggle('is-expanded');
		const items = container.querySelectorAll('.widget-sub-item');
		let detail = document.getElementById('noti-temp-detail');

		items.forEach(el => el.style.display = (isOpen && el !== notiBtn) ? 'none' : 'flex');

		if (!isOpen) return detail?.remove();

		detail = document.createElement('div');
		detail.id = 'noti-temp-detail';
		detail.innerHTML = `
            <div class="noti-card" onclick="alert('알림1')">
                <b style="font-size:11.5px;">Weekly Orders 완료</b><br>
                <small style="color:#666;">데이터 업데이트 완료</small>
            </div>
            <div class="noti-card" onclick="alert('알림2')">
                <b style="font-size:11.5px;">시스템 점검 공지</b><br>
                <small style="color:#666;">오후 10시 점검 예정</small>
            </div>`;
		notiBtn.after(detail);

		setTimeout(() => {
			detail.querySelectorAll('.noti-card').forEach(card => card.classList.add('show'));
		}, 50);
	};
}

/* ===============================
   Profile Dropdown
   =============================== */
function setupProfileDropdown() {
	const profileBtn = document.getElementById('profileImageToggle');
	const profileMenu = document.getElementById('profileSlideMenu');

	if (!profileBtn || !profileMenu) return;

	profileBtn.addEventListener('click', function(e) {
		e.preventDefault();
		e.stopPropagation();

		profileMenu.classList.toggle('active');

		const widgetContent = document.getElementById('widgetContent');
		if (widgetContent) widgetContent.classList.remove('active');
	});

	document.addEventListener('click', function(e) {
		if (!profileBtn.contains(e.target)) {
			profileMenu.classList.remove('active');
		}
	});
}

function setupDropdown(triggerId, menuId) {
	const trigger = document.getElementById(triggerId);
	const menu = document.getElementById(menuId);

	if (!trigger || !menu) return;

	trigger.addEventListener('click', function(e) {
		e.preventDefault();
		e.stopPropagation();

		document.querySelectorAll('.dropdown-menu').forEach(d => {
			if (d !== menu) d.classList.remove('show');
		});

		menu.classList.toggle('show');
	});
}

/* ===============================
   Collapsible Menu
   =============================== */
function initCollapsible() {
	document.querySelectorAll('[data-toggle="collapse"]').forEach(link => {
		link.onclick = function(e) {
			e.preventDefault();

			const target = document.getElementById(this.getAttribute('href').substring(1));
			if (!target) return;

			document.querySelectorAll('.collapse.show').forEach(c => {
				if (c !== target) {
					c.classList.remove('show');
				}
			});

			target.classList.toggle('show');
			
			saveSidebarCollapseState();
		};
	});
}

/* ===============================
   Charts
   =============================== */
function initCharts() {
	initVisitSaleChart();
	initTrafficChart();
}

function initVisitSaleChart() {
	const ctx = document.getElementById('visitSaleChart');
	if (!ctx) return;
	// (기존 Chart.js 코드 유지)
}

function initTrafficChart() {
	const ctx = document.getElementById('trafficChart');
	if (!ctx) return;
	// (기존 Chart.js 코드 유지)
}

/* ===============================
   Active Menu (상태 유지, 자동 펼침 및 브레드크럼 업데이트)
   =============================== */
function setActiveMenuItem() {
	let currentUrl = new URL(window.location.href);
	let currentPath = normalizePath(currentUrl.pathname);
	let currentParams = currentUrl.searchParams;

	// 1) 기존 active 제거
	document.querySelectorAll('.sidebar .nav-item').forEach(item => {
		item.classList.remove('active');
	});

	// 2) 후보 중 "가장 구체적인" 메뉴 1개만 선택(쿼리 있는 링크 우선)
	let bestItem = null;
	let bestLink = null;
	let bestScore = -1;

	document.querySelectorAll('.sidebar .nav-item').forEach(item => {
		let link = item.querySelector('.nav-link');
		let href = link ? link.getAttribute('href') : null;

		// '#' 또는 collapse 토글(#menuId) 등은 제외
		if (!href || href === '#' || href.startsWith('#')) return;

		let menuUrl = null;
		try {
			menuUrl = new URL(href, window.location.origin);
		} catch (e) {
			return;
		}

		let menuPath = normalizePath(menuUrl.pathname);

		// home 처리(기존 로직 유지)
		let isHome = (menuPath === '/' || menuPath.endsWith('/index.do'));
		let pathOk = isHome ? isHomeMatch(currentPath, menuPath) : pathMatch(currentPath, menuPath);

		if (!pathOk) return;

		// 쿼리스트링이 있는 메뉴면, 그 쿼리는 "모두" 현재 URL에 포함되어야 match
		for (let [k, v] of menuUrl.searchParams.entries()) {
			if (currentParams.get(k) !== v) return;
		}

		// 가장 구체적인 메뉴 1개 선택(쿼리 있는 링크가 더 우선되도록 가중치)
		let paramCount = Array.from(menuUrl.searchParams.keys()).length;
		let score = (paramCount * 10000) + menuPath.length;

		if (score > bestScore) {
			bestScore = score;
			bestItem = item;
			bestLink = link;
		}
	});

	// 3) bestItem만 active + 부모 collapse 자동 펼침 + breadcrumb 저장
	if (!bestItem || !bestLink) return;

	bestItem.classList.add('active');

	let subText = bestLink.innerText.trim();
	let parentCollapse = bestItem.closest('.collapse');
	let mainText = "";

	if (parentCollapse) {
		let parentNavAction = parentCollapse.previousElementSibling;
		mainText = parentNavAction.querySelector('.menu-title').innerText.trim();

		localStorage.setItem('activeMainCategory', mainText);
		localStorage.setItem('activeSubCategory', subText);

		parentCollapse.classList.add('show');
		let parentLink = document.querySelector(`[href="#${parentCollapse.id}"]`);
		if (parentLink) parentLink.setAttribute('aria-expanded', 'true');
	} else {
		mainText = bestItem.querySelector('.menu-title')?.innerText.trim() || subText;
		localStorage.setItem('activeMainCategory', mainText);
		localStorage.removeItem('activeSubCategory');
	}

	if (typeof updateHeaderBreadcrumb === 'function') {
		updateHeaderBreadcrumb();
	}

	// ===== helpers =====
	function normalizePath(p) {
		if (!p) return '/';
		if (p.length > 1 && p.endsWith('/')) return p.slice(0, -1);
		return p;
	}

	function isHomeMatch(curPath, menuPath) {
		if (menuPath === '/') {
			return curPath === '/' || curPath.endsWith('/index.do');
		}
		// menuPath가 /index.do 인 경우
		return curPath === menuPath || curPath === '/' || curPath.endsWith(menuPath);
	}

	// contextPath(예: /FloWeNect)가 붙어도 매칭되게 endsWith/경계 포함 매칭
	function pathMatch(curPath, menuPath) {
		if (!menuPath || menuPath === '/') return false;

		if (curPath === menuPath) return true;
		if (curPath.endsWith(menuPath)) return true;

		let idx = curPath.indexOf(menuPath + '/');
		if (idx > -1) {
			// 경계 체크(앞이 '/'이면 OK)
			if (idx === 0 || curPath.charAt(idx - 1) === '/') return true;
		}
		return false;
	}
}

/* ===============================
   Sidebar Scroll Continuity (스크롤 유지)
   =============================== */
/* ===============================
   Sidebar Scroll Continuity (스크롤 유지)
   =============================== */
function initSidebarScrollPersistence() {
    const sidebar = document.getElementById('sidebarMenu');
    if (!sidebar) return;

    const savedPos = sessionStorage.getItem('sidebarScrollPos');
    if (savedPos) sidebar.scrollTop = savedPos;

    sidebar.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            sessionStorage.setItem('sidebarScrollPos', sidebar.scrollTop);

            // ✅ 추가: 페이지 이동 전에 다음 페이지용 collapse 상태 미리 저장
            const href = this.getAttribute('href');
            const isRealLink = href && href !== '#' && !href.startsWith('#');
            if (!isRealLink) return;

            // 이 링크가 속한 부모 collapse가 있으면 → 그것만 열린 상태로 저장
            // 없으면(대메뉴 직접 링크) → 빈 배열 저장
            const parentCollapse = this.closest('.collapse');
            if (parentCollapse && parentCollapse.id) {
                sessionStorage.setItem('sidebarOpenMenus', JSON.stringify([parentCollapse.id]));
            } else {
                sessionStorage.setItem('sidebarOpenMenus', JSON.stringify([]));
            }
        });
    });
}

/* ===============================
   Utilities
   =============================== */
function formatNumber(num) {
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatCurrency(amount) {
	return '$' + formatNumber(amount);
}

window.Dashboard = {
	formatNumber,
	formatCurrency
};

/* ===============================
   사이드바 collapse 상태 저장/복원
   =============================== */
function saveSidebarCollapseState() {
    const openIds = Array.from(document.querySelectorAll('.sidebar .collapse.show'))
        .map(el => el.id)
        .filter(Boolean);
    sessionStorage.setItem('sidebarOpenMenus', JSON.stringify(openIds));
}

function restoreSidebarCollapseState() {
    const openIds = JSON.parse(sessionStorage.getItem('sidebarOpenMenus') || '[]');
    openIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('show');
    });
}