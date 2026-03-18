(function () {

    // ========== 1. 프로필 이미지 캐싱 ==========
    document.addEventListener("DOMContentLoaded", function () {
        loadSidebarAndBridgeProfile();

        document.querySelectorAll('#sidebarMenu .collapse').forEach(function (collapseEl) {
            collapseEl.addEventListener('show.bs.collapse', function () {
                saveOpenMenu(collapseEl.id);
            });
            collapseEl.addEventListener('hide.bs.collapse', function () {
                removeOpenMenu(collapseEl.id);
            });
        });

        autoSaveCurrentMenu();
    });

    async function loadSidebarAndBridgeProfile() {
        let el = document.getElementById("reactBridgeConfig");
        let contextPath = el ? (el.getAttribute("data-context-path") || "") : "";

        const cachedUrl = sessionStorage.getItem('profileImgUrl');
        if (cachedUrl) {
            applyProfileImg(cachedUrl);
            return;
        }

        try {
            const { data } = await axios.get(contextPath + "/rest/mypage/me");
            if (data.profileImgDto && data.profileImgDto.fileMeta) {
                const meta = data.profileImgDto.fileMeta;
                const s3FullUrl = "https://finalfileserver.s3.ap-northeast-2.amazonaws.com/"
                                  + meta.filePath + meta.saveFileNm;
                sessionStorage.setItem('profileImgUrl', s3FullUrl);
                applyProfileImg(s3FullUrl);
            }
        } catch (e) {
            console.error("프로필 로드 실패:", e);
        }
    }

    function applyProfileImg(url) {
        const sidebarImg = document.getElementById("sidebarProfileImg");
        if (sidebarImg) sidebarImg.src = url;
        const bridgeImg = document.getElementById("bridgeProfileImg");
        if (bridgeImg) bridgeImg.src = url;
    }

    // ========== 2. 서브메뉴 상태 저장/복원 ==========
    function saveOpenMenu(id) {
        let ids = JSON.parse(sessionStorage.getItem('sidebarOpenMenus') || '[]');
        if (!ids.includes(id)) {
            ids.push(id);
            sessionStorage.setItem('sidebarOpenMenus', JSON.stringify(ids));
        }
    }

    function removeOpenMenu(id) {
        let ids = JSON.parse(sessionStorage.getItem('sidebarOpenMenus') || '[]');
        ids = ids.filter(function (v) { return v !== id; });
        sessionStorage.setItem('sidebarOpenMenus', JSON.stringify(ids));
    }

    function autoSaveCurrentMenu() {
    const currentPath = location.pathname;
    const currentBox = new URLSearchParams(location.search).get('box') || '';

    // ✅ detail 페이지 등 특수 URL → 매핑된 메뉴 href로 활성화
	const pathMenuMap = {
	    '/aprv/read':           '/aprv/readList?box=mine',
	    '/aprv/pendingList':    '/aprv/pendingList?box=pending',
	    '/aprv/processedList':  '/aprv/processedList?box=processed',
	    '/aprv/asset/manage':   '/aprv/readList?box=mine',
	};

    // 현재 경로가 매핑 테이블에 있으면 해당 href를 기준으로 활성화
    const mappedHref = pathMenuMap[currentPath];

    document.querySelectorAll('#sidebarMenu .collapse').forEach(function (collapseEl) {
        const links = collapseEl.querySelectorAll('a.nav-link');
        links.forEach(function (a) {
            const href = a.getAttribute('href');
            if (!href) return;

            const [hrefPath, hrefQuery] = href.split('?');
            const hrefBox = new URLSearchParams(hrefQuery || '').get('box') || '';

            let isMatch;
            if (mappedHref) {
                // ✅ 매핑된 경우: 매핑 href와 정확히 일치하는 링크만 활성화
                isMatch = href === mappedHref;
            } else if (hrefBox) {
                isMatch = currentPath === hrefPath && currentBox === hrefBox;
            } else {
                isMatch = currentPath === hrefPath
                       || currentPath.startsWith(hrefPath + '/')
                       || currentPath.startsWith(hrefPath.replace('List', ''));
            }

            if (isMatch) {
                saveOpenMenu(collapseEl.id);
                a.classList.add('active');
                const navItem = a.closest('.nav-item');
                if (navItem) navItem.classList.add('active');
            } else {
                a.classList.remove('active');
            }
        });
    });

    document.querySelectorAll('#sidebarMenu > li.nav-item').forEach(function (li) {
        const hasActiveChild = li.querySelector('a.nav-link.active');
        if (hasActiveChild) {
            li.classList.add('active');
            const topLink = li.querySelector(':scope > a.nav-link');
            if (topLink) topLink.classList.add('active');
        }
    });
}

    // ========== 3. 기존 함수 유지 ==========
    function getReactUrl() {
        let el = document.getElementById("reactBridgeConfig");
        if (!el) return location.protocol + "//" + location.hostname + ":3000";
        return el.getAttribute("data-react-url") || (location.protocol + "//" + location.hostname + ":3000");
    }

    window.moveToReactService = function () {
        location.href = getReactUrl();
    };

})();