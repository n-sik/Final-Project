document.addEventListener('DOMContentLoaded', function () {

    // --- 이미지 로드 에러 처리 ---
    document.querySelectorAll('.file-thumbnail').forEach(img => {
        img.addEventListener('error', function () {
            const iconWrapper = this.closest('.file-icon-wrapper');
            if (iconWrapper) {
                iconWrapper.innerHTML = `
                    <div class="file-icon image-icon">
                        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#9E9E9E" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                    </div>`;
            }
        });
        img.addEventListener('load', function () { this.style.opacity = '1'; });
    });

    // --- 1. 보기 형식 전환 ---
    const viewBtns      = document.querySelectorAll('.view-btn');
    const fileGridView  = document.querySelector('.file-grid-view');
    const fileTableView = document.querySelector('.file-table');

    viewBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            viewBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            if (this.dataset.view === 'grid') {
                fileGridView.style.display  = 'grid';
                fileTableView.style.display = 'none';
            } else {
                fileGridView.style.display  = 'none';
                fileTableView.style.display = 'table';
            }
        });
    });

    // --- 2. 전체 선택/해제 ---
    const checkAll = document.getElementById('checkAll');
    if (checkAll) {
        checkAll.addEventListener('change', function () {
            document.querySelectorAll('input[name="fileIds"]')
                .forEach(cb => cb.checked = this.checked);
            updateSelectionCount();
        });
    }

    // --- 3. 카드 체크박스 선택 표시 ---
    document.querySelectorAll('.file-card .file-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const card = this.closest('.file-card');
            card.style.borderColor = this.checked ? '#007bff' : '#e5e7eb';
            card.style.background  = this.checked ? '#f0f7ff' : 'white';
            updateSelectionCount();
        });
    });

    // --- 4. 드롭존 클릭 ---
    const dropZone  = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    if (dropZone) dropZone.addEventListener('click', () => fileInput.click());

    // --- 5. 파일 선택 시 자동 업로드 ---
    if (fileInput) {
        fileInput.addEventListener('change', function () {
            if (this.files.length > 0) {
                handleFiles(this.files);
                closeUploadModal();
            }
        });
    }

    // --- 6. 드래그 앤 드롭 ---
    if (dropZone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(ev =>
            dropZone.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); })
        );
        ['dragenter', 'dragover'].forEach(ev =>
            dropZone.addEventListener(ev, () => dropZone.classList.add('drag-over'))
        );
        ['dragleave', 'drop'].forEach(ev =>
            dropZone.addEventListener(ev, () => dropZone.classList.remove('drag-over'))
        );
        dropZone.addEventListener('drop', e => {
            handleFiles(e.dataTransfer.files);
            closeUploadModal();
        });
    }

    // --- 7. 파일 메뉴 외부 클릭 시 닫기 ---
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.btn-more') && !e.target.closest('.file-menu')) {
            document.querySelectorAll('.file-menu').forEach(m => m.classList.remove('show'));
        }
    });

    // ✅ 카드 클릭 이벤트
    document.querySelectorAll('.file-card').forEach(card => {
        card.addEventListener('click', function (e) {
            if (e.target.closest('.file-checkbox') || e.target.closest('.btn-more') || e.target.closest('.file-menu')) return;
            showAuthorBadge(this.dataset.empNm || '(이름 없음)', this);
        });
    });

    // --- 8. 선택 UI 생성 및 초기화 ---
    createSelectionUI();
    updateSelectionCount();

    // --- 9. 체크박스 변경 감지 (목록형) ---
    document.addEventListener('change', function(e) {
        if (e.target.matches('input[name="fileIds"]') || e.target.id === 'checkAll') {
            updateSelectionCount();
        }
    });
});

// =========================================================
// ✅ 플로팅 버튼 — 모달 열기/닫기
// =========================================================
function openUploadModal() {
    const modal   = document.getElementById('uploadModal');
    const overlay = document.getElementById('uploadOverlay');
    const fab     = document.getElementById('fabBtn');

    overlay.classList.add('show');
    fab.classList.add('open');

    modal.style.display = 'block';
    requestAnimationFrame(() => {
        requestAnimationFrame(() => modal.classList.add('show'));
    });
}

function closeUploadModal() {
    const modal   = document.getElementById('uploadModal');
    const overlay = document.getElementById('uploadOverlay');
    const fab     = document.getElementById('fabBtn');

    modal.classList.remove('show');
    overlay.classList.remove('show');
    fab.classList.remove('open');

    setTimeout(() => { modal.style.display = 'none'; }, 260);
}

// =========================================================
// ✅ 작성자 뱃지
// =========================================================
let _authorTimer     = null;
let _authorFadeTimer = null;

function showAuthorBadge(empNm, activeCard) {
    empNm = empNm || '(이름 없음)';

    const headerRight = document.querySelector('.board-page-header-right');
    if (!headerRight) return;

    let badge = document.getElementById('authorBadge');
    if (!badge) {
        badge = document.createElement('div');
        badge.id = 'authorBadge';
        badge.innerHTML = `
            <div id="authorAvatar" style="
                width: 28px; height: 28px; border-radius: 50%;
                background: #e8f0fe; color: #4a7cf7;
                display: flex; align-items: center; justify-content: center;
                font-size: 12px; font-weight: 700; flex-shrink: 0;
            "></div>
            <div style="display: flex; flex-direction: column; line-height: 1.3;">
                <span style="font-size: 10px; color: #94a3b8;">작성자</span>
                <span id="authorName" style="font-size: 13px; font-weight: 600; color: #1e293b;"></span>
            </div>`;

        badge.style.cssText = [
            'display: none',
            'align-items: center',
            'gap: 8px',
            'padding: 6px 12px',
            'background: #f8fafc',
            'border: 1px solid #e2e8f0',
            'border-radius: 8px',
            'opacity: 0',
            'transition: opacity 0.2s ease',
            'pointer-events: none',
        ].join('; ');

        const uploadBtn = headerRight.querySelector('.board-header-btn-upload');
        headerRight.insertBefore(badge, uploadBtn);
    }

    document.getElementById('authorName').textContent   = empNm;
    document.getElementById('authorAvatar').textContent = empNm.charAt(0);

    document.querySelectorAll('.file-card.selected').forEach(c => c.classList.remove('selected'));
    if (activeCard) activeCard.classList.add('selected');

    clearTimeout(_authorTimer);
    clearTimeout(_authorFadeTimer);

    badge.style.display = 'flex';
    requestAnimationFrame(() => {
        requestAnimationFrame(() => { badge.style.opacity = '1'; });
    });

    _authorTimer = setTimeout(() => hideBadge(), 2500);
}

function hideBadge() {
    const badge = document.getElementById('authorBadge');
    if (!badge) return;
    badge.style.opacity = '0';
    clearTimeout(_authorFadeTimer);
    _authorFadeTimer = setTimeout(() => {
        badge.style.display = 'none';
        document.querySelectorAll('.file-card.selected').forEach(c => c.classList.remove('selected'));
    }, 220);
}

document.addEventListener('click', function (e) {
    if (!e.target.closest('.file-card')) {
        const badge = document.getElementById('authorBadge');
        if (badge && badge.style.display !== 'none') {
            clearTimeout(_authorTimer);
            hideBadge();
        }
    }
});

// =========================================================
// 업로드
// =========================================================
function handleFiles(files) {
    const formData = new FormData();
    const deptCd = document.querySelector('input[name="deptCd"]').value;
    const currentPath = document.querySelector('input[name="currentPath"]').value;
    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }
    formData.append('deptCd', deptCd);
    formData.append('currentPath', currentPath);
    uploadFiles(formData);
}

function uploadFiles(formData) {
    fetch(document.getElementById('uploadForm').action, {
        method: 'POST',
        body: formData
    })
    .then(res => {
        if (res.ok) {
            Swal.fire({ icon: 'success', title: '업로드 완료!', confirmButtonText: '확인' })
                .then(() => location.reload());
        } else {
            Swal.fire({ icon: 'error', title: '업로드 실패', confirmButtonText: '확인' });
        }
    })
    .catch(() => Swal.fire({ icon: 'error', title: '서버 통신 오류', confirmButtonText: '확인' }));
}

// =========================================================
// 폴더 생성 → prompt → Swal input
// =========================================================
async function addNewFolder() {
    const { value: folderName } = await Swal.fire({
        title: '📁 폴더 생성',
        html: `
            <div style="text-align:left; margin-bottom: 6px;">
                <label style="font-size:13px; font-weight:600; color:#475569;">폴더 이름</label>
            </div>
            <div style="position:relative;">
                <span style="
                    position:absolute; left:12px; top:50%; transform:translateY(-50%);
                    font-size:16px; pointer-events:none;
                ">📂</span>
                <input id="swal-folder-input" class="swal2-input" placeholder="폴더명을 입력하세요"
                    style="
                        width:100%; box-sizing:border-box;
                        padding-left:38px !important;
                        height:44px; border-radius:10px;
                        border:1.5px solid #e2e8f0;
                        font-size:14px; margin:0;
                    ">
            </div>
            <p style="font-size:11px; color:#94a3b8; margin-top:8px; text-align:left;">
                <i class="bi bi-info-circle"></i> 특수문자는 사용하지 마세요
            </p>
        `,
        showCancelButton: true,
        confirmButtonText: '만들기',
        cancelButtonText: '취소',
        confirmButtonColor: '#3b6cff',
        cancelButtonColor: '#94a3b8',
        borderRadius: '16px',
        width: '400px',
        customClass: {
            popup:   'swal-folder-popup',
            title:   'swal-folder-title',
            actions: 'swal-folder-actions',
        },
        didOpen: () => {
            document.getElementById('swal-folder-input').focus();
        },
        preConfirm: () => {
            const value = document.getElementById('swal-folder-input').value.trim();
            if (!value) {
                Swal.showValidationMessage('폴더 이름을 입력해주세요.');
                return false;
            }
            return value;
        }
    });

    if (!folderName) return;

    const currentPath = document.getElementById('currentPathHolder')?.value || '';
    const deptCd = document.querySelector('input[name="deptCd"]')?.value || '';

    const params = new URLSearchParams();
    params.append('folderName', folderName);
    params.append('deptCd', deptCd);
    params.append('currentPath', currentPath);

    fetch('/work-drive/createfolder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
    })
    .then(res => { if (!res.ok) throw new Error(); return res.text(); })
    .then(data => {
        if (data === 'SUCCESS') {
            Swal.fire({ icon: 'success', title: '폴더가 생성되었습니다.', confirmButtonText: '확인', confirmButtonColor: '#3b6cff' })
                .then(() => location.reload());
        } else {
            Swal.fire({ icon: 'error', title: '폴더 생성 실패', text: data, confirmButtonText: '확인' });
        }
    })
    .catch(() => Swal.fire({ icon: 'error', title: '서버 통신 오류', confirmButtonText: '확인' }));
}

// =========================================================
// 메뉴 토글
// =========================================================
function toggleFileMenu(event, fileNo) {
    event.stopPropagation();
    document.querySelectorAll('.file-menu').forEach(m => {
        if (m.id !== 'menu-' + fileNo) m.classList.remove('show');
    });
    document.getElementById('menu-' + fileNo).classList.toggle('show');
}

// =========================================================
// 다운로드
// =========================================================
function downloadFile(fileUrl) {
    const link = document.createElement('a');
    link.href = fileUrl; link.download = '';
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
}

async function downloadSelected() {
    const checked = document.querySelectorAll('input[name="fileIds"]:checked');
    if (checked.length === 0) {
        await Swal.fire({ icon: 'warning', title: '다운로드할 파일을 선택하세요.', confirmButtonText: '확인' });
        return;
    }
    checked.forEach((cb, index) => {
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = '/work-drive/download/' + cb.value;
            link.download = '';
            document.body.appendChild(link); link.click(); document.body.removeChild(link);
        }, index * 600);
    });
}

// =========================================================
// 삭제
// =========================================================
function deleteFile(fileNo) {
    Swal.fire({
        icon: 'warning',
        title: '삭제하시겠습니까?',
        showCancelButton: true,
        confirmButtonText: '삭제',
        cancelButtonText: '취소'
    }).then(result => {
        if (!result.isConfirmed) return;
        const params = new URLSearchParams();
        params.append('fileNos', fileNo);
        fetch('/work-drive/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params
        })
        .then(res => res.text())
        .then(data => {
            if (data === 'SUCCESS') {
                Swal.fire({ icon: 'success', title: '삭제되었습니다.', confirmButtonText: '확인' })
                    .then(() => location.reload());
            } else {
                Swal.fire({ icon: 'error', title: '삭제에 실패했습니다.', confirmButtonText: '확인' });
            }
        })
        .catch(() => Swal.fire({ icon: 'error', title: '삭제 중 오류가 발생했습니다.', confirmButtonText: '확인' }));
    });
}

async function deleteSelected() {
    const checked = document.querySelectorAll('input[name="fileIds"]:checked');
    if (checked.length === 0) {
        await Swal.fire({ icon: 'warning', title: '삭제할 파일을 선택하세요.', confirmButtonText: '확인' });
        return;
    }

    const result = await Swal.fire({
        icon: 'warning',
        title: `${checked.length}개의 파일을 삭제하시겠습니까?`,
        showCancelButton: true,
        confirmButtonText: '삭제',
        cancelButtonText: '취소'
    });
    if (!result.isConfirmed) return;

    const params = new URLSearchParams();
    checked.forEach(cb => params.append('fileNos', cb.value));

    fetch('/work-drive/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
    })
    .then(res => res.text())
    .then(data => {
        if (data === 'SUCCESS') {
            Swal.fire({ icon: 'success', title: '삭제되었습니다.', confirmButtonText: '확인' })
                .then(() => location.reload());
        } else {
            Swal.fire({ icon: 'error', title: '삭제 처리 중 오류가 발생했습니다.', confirmButtonText: '확인' });
        }
    })
    .catch(() => Swal.fire({ icon: 'error', title: '삭제 중 오류가 발생했습니다.', confirmButtonText: '확인' }));
}

// =========================================================
// ✅ 선택 UI 생성
// =========================================================
function createSelectionUI() {
    const actionBar = document.querySelector('.action-bar');
    if (!actionBar) return;

    const selectionInfo = document.createElement('div');
    selectionInfo.id = 'selectionInfo';
    selectionInfo.className = 'selection-info';
    selectionInfo.style.cssText = `
        display: none;
        align-items: center;
        gap: 12px;
        padding: 10px 16px;
        background: #e3f2fd;
        border: 1px solid #90caf9;
        border-radius: 8px;
        font-size: 14px;
        color: #1565c0;
        font-weight: 500;
        margin-bottom: 12px;
    `;

    selectionInfo.innerHTML = `
        <span id="selectedCount">0개 선택됨</span>
        <button type="button" id="clearSelection" style="
            background: transparent;
            border: none;
            color: #1565c0;
            cursor: pointer;
            text-decoration: underline;
            font-size: 13px;
            padding: 0;
            font-weight: 500;
        ">선택 해제</button>
    `;

    actionBar.parentNode.insertBefore(selectionInfo, actionBar);
    document.getElementById('clearSelection').addEventListener('click', clearAllSelections);
}

// =========================================================
// ✅ 선택 개수 업데이트
// =========================================================
function updateSelectionCount() {
    const checkboxes    = document.querySelectorAll('input[name="fileIds"]');
    const checked       = document.querySelectorAll('input[name="fileIds"]:checked');
    const selectionInfo = document.getElementById('selectionInfo');
    const selectedCount = document.getElementById('selectedCount');
    const checkAll      = document.getElementById('checkAll');

    if (!selectionInfo || !selectedCount) return;

    const count = checked.length;
    if (count > 0) {
        selectionInfo.style.display = 'flex';
        selectedCount.textContent = `${count}개 선택됨`;
    } else {
        selectionInfo.style.display = 'none';
    }

    if (checkAll) {
        if (count === 0) {
            checkAll.checked = false;
            checkAll.indeterminate = false;
        } else if (count === checkboxes.length) {
            checkAll.checked = true;
            checkAll.indeterminate = false;
        } else {
            checkAll.checked = false;
            checkAll.indeterminate = true;
        }
    }
}

// =========================================================
// ✅ 전체 선택 해제
// =========================================================
function clearAllSelections() {
    document.querySelectorAll('input[name="fileIds"]').forEach(cb => { cb.checked = false; });

    const checkAll = document.getElementById('checkAll');
    if (checkAll) {
        checkAll.checked = false;
        checkAll.indeterminate = false;
    }

    document.querySelectorAll('.file-card').forEach(card => {
        card.style.borderColor = '#e5e7eb';
        card.style.background  = 'white';
    });

    updateSelectionCount();
}

// =========================================================
// 드래그 앤 드롭 이동
// =========================================================
function handleDragStart(e) {
    const card = e.currentTarget;
    e.dataTransfer.setData("fileNo", card.dataset.fileId);
    e.dataTransfer.setData("fileNm", card.dataset.fileNm || card.querySelector('.file-name').innerText);
    card.style.opacity = '0.4';
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

async function handleDrop(e) {
    e.preventDefault();
    const folderCard = e.currentTarget;
    folderCard.classList.remove('drag-over');

    const fileNo = e.dataTransfer.getData("fileNo");
    const fileNm = e.dataTransfer.getData("fileNm");
    const targetPath = folderCard.dataset.filePath + folderCard.dataset.fileNm + "/";

    const result = await Swal.fire({
        icon: 'question',
        title: '파일 이동',
        text: `[${fileNm}] 파일을 [${folderCard.dataset.fileNm}] 폴더로 이동할까요?`,
        showCancelButton: true,
        confirmButtonText: '이동',
        cancelButtonText: '취소'
    });
    if (!result.isConfirmed) return;

    const params = new URLSearchParams();
    params.append('fileNo', fileNo);
    params.append('targetPath', targetPath);

    const moveUrl = window.location.origin + "/work-drive/move";
    fetch(moveUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
    })
    .then(res => res.text())
    .then(data => {
        if (data === 'SUCCESS') {
            Swal.fire({ icon: 'success', title: '이동되었습니다.', confirmButtonText: '확인' })
                .then(() => location.reload());
        } else {
            Swal.fire({ icon: 'error', title: '이동 실패', text: '상태: ' + data, confirmButtonText: '확인' });
        }
    });
}

// =========================================================
// 상위 폴더로
// =========================================================
function goBack() {
    const currentPath = document.getElementById('currentPathHolder').value;
    const rootPath = document.getElementById('rootPath').value;

    if (currentPath === rootPath) return;

    let parts = currentPath.split('/').filter(p => p !== "");
    parts.pop();
    let parentPath = parts.join('/') + (parts.length > 0 ? '/' : '');

    const isListView = document.querySelector('.file-table').style.display !== 'none';
    const viewMode = isListView ? 'list' : 'grid';
    const deptCd = document.querySelector('input[name="deptCd"]').value;

    location.href = "?deptCd=" + deptCd
                  + "&currentPath=" + encodeURIComponent(parentPath)
                  + "&viewMode=" + viewMode;
}

document.querySelectorAll('.file-date').forEach(el => {
    el.textContent = el.textContent.replace('T', ' ');
});