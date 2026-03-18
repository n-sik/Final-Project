<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>부서 공유 문서함</title>
<link rel="stylesheet"
	href="${pageContext.request.contextPath}/css/department/board.css">
</head>
<body>

	<c:set var="vMode"
		value="${param.viewMode != null ? param.viewMode : 'grid'}" />
	<%-- ✅ 헤더: cloud-wrapper 밖에 위치 --%>
	<div class="board-page-header">
		<div class="board-page-header-left">
			<div class="board-page-title">부서 공유 문서함</div>
			<c:choose>
				<c:when test="${deptCd eq '2026HR01'}">
					<c:set var="deptName" value="인사부서" />
				</c:when>
				<c:when test="${deptCd eq '2026PD01'}">
					<c:set var="deptName" value="생산제조부서" />
				</c:when>
				<c:when test="${deptCd eq '2026DV01'}">
					<c:set var="deptName" value="개발1부서" />
				</c:when>
				<c:when test="${deptCd eq '2026DV02'}">
					<c:set var="deptName" value="개발2부서" />
				</c:when>
				<c:when test="${deptCd eq '2026PM01'}">
					<c:set var="deptName" value="서비스기획부서" />
				</c:when>
				<c:when test="${deptCd eq '2026CS01'}">
					<c:set var="deptName" value="고객지원부서" />
				</c:when>
				<c:when test="${deptCd eq '2026MK01'}">
					<c:set var="deptName" value="마케팅부서" />
				</c:when>
				<c:when test="${deptCd eq '2026SL01'}">
					<c:set var="deptName" value="영업부서" />
				</c:when>
				<c:otherwise>
					<c:set var="deptName" value="${deptCd}" />
				</c:otherwise>
			</c:choose>
			<div class="board-page-sub">${deptName} · 파일업로드 · 다운로드 · 관리</div>
		</div>
		<div class="board-page-header-right">
			<button class="board-header-btn-upload" onclick="openUploadModal()">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none"
					stroke="currentColor" stroke-width="2.5">
					<line x1="12" y1="5" x2="12" y2="19"></line>
					<line x1="5" y1="12" x2="19" y2="12"></line>
				</svg>
				파일 업로드
			</button>

			<input type="hidden" id="currentPathHolder" value="${currentPath}">
			<button class="board-header-btn-upload" onclick="addNewFolder()">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none"
					stroke="currentColor" stroke-width="2.5">
					<line x1="12" y1="5" x2="12" y2="19"></line>
					<line x1="5" y1="12" x2="19" y2="12"></line>
				</svg>
				폴더 생성
			</button>
		</div>
	</div>

	<div class="cloud-wrapper">
		<input type="hidden" id="rootPath" value="${rootPath}">
		<main class="cloud-content">
			<div class="action-bar">
				<div class="view-toggle">
					<button type="button"
						class="view-btn ${vMode eq 'grid' ? 'active' : ''}"
						data-view="grid">
						<span class="icon-grid">⊞</span> 카드형
					</button>

					<button type="button"
						class="view-btn ${vMode eq 'list' ? 'active' : ''}"
						data-view="list">
						<span class="icon-list">☰</span> 목록형
					</button>
				</div>
				<div class="action-buttons">
					<button type="button" class="btn-secondary"
						onclick="downloadSelected()">선택 다운로드</button>
					<button type="button" class="btn-danger-outline"
						onclick="deleteSelected()">선택 삭제</button>
				</div>
			</div>

			<!-- 카드형 보기 -->
			<div class="file-grid-view"
				style="${vMode eq 'grid' ? '' : 'display:none;'}">
				<c:if test="${currentPath ne rootPath}">
					<div class="file-card parent-move" onclick="goBack()"
						style="cursor: pointer; border: 1px dashed #ddd;">
						<div class="file-card-body">
							<div class="file-icon-wrapper">
								<div class="file-icon">
									<svg width="50" height="50" viewBox="0 0 24 24" fill="none"
										stroke="#999" stroke-width="2">
										<path d="M12 19V5M5 12l7-7 7 7" />
									</svg>
								</div>
							</div>
							<div class="file-name">
								<strong>[ 상위 폴더로 ]</strong>
							</div>
						</div>
					</div>
				</c:if>
				<c:choose>
					<c:when test="${empty fileList}">
						<div class="empty-state">
							<div class="empty-icon">📁</div>
							<p class="empty-msg">등록된 파일이 없습니다.</p>
						</div>
					</c:when>
					<c:otherwise>
						<c:forEach var="file" items="${fileList}">
							<%-- ✅ 폴더면 is-folder 클래스 추가 --%>
							<div class="file-card ${file.fileMeta.fileExt eq '폴더' ? 'is-folder' : ''}"
								data-file-id="${file.fileMeta.fileNo}"
								data-emp-nm="${file.fileMeta.empNm}"
								data-file-path="${file.fileMeta.filePath}"
								data-file-nm="${file.fileMeta.fileNm}"
								onclick="showAuthorBadge(this.dataset.empNm || '(이름 없음)', this)"
								<c:choose>
									<c:when test="${file.fileMeta.fileExt eq '폴더'}">
										ondragover="handleDragOver(event)"
										ondragleave="handleDragLeave(event)"
										ondrop="handleDrop(event)"
										ondblclick="location.href='?deptCd=${deptCd}&currentPath=${file.fileMeta.filePath}${file.fileMeta.fileNm}/'"
									</c:when>
									<c:otherwise>
										draggable="true"
										ondragstart="handleDragStart(event)"
									</c:otherwise>
								</c:choose>>

								<div class="file-card-header">
									<input type="checkbox" name="fileIds"
										value="${file.fileMeta.fileNo}" class="file-checkbox"
										onclick="event.stopPropagation()">
								</div>

								<div class="file-card-body">
									<div class="file-icon-wrapper">
										<c:choose>
											<c:when test="${file.fileMeta.fileExt eq 'jpg' || file.fileMeta.fileExt eq 'jpeg' || file.fileMeta.fileExt eq 'png' || file.fileMeta.fileExt eq 'gif' || file.fileMeta.fileExt eq 'JPG' || file.fileMeta.fileExt eq 'JPEG' || file.fileMeta.fileExt eq 'PNG' || file.fileMeta.fileExt eq 'GIF' || file.fileMeta.fileExt eq 'webp' || file.fileMeta.fileExt eq 'WEBP'}">
												<img src="/work-drive/view/${file.fileMeta.fileNo}"
													alt="${file.fileMeta.fileNm}" class="file-thumbnail"
													loading="lazy">
											</c:when>
											<c:when test="${file.fileMeta.fileExt eq 'pdf' || file.fileMeta.fileExt eq 'PDF'}">
												<div class="file-icon pdf-icon">
													<svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#F44336" stroke-width="2">
														<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
														<polyline points="14 2 14 8 20 8"></polyline>
														<line x1="16" y1="13" x2="8" y2="13"></line>
														<line x1="16" y1="17" x2="8" y2="17"></line>
													</svg>
												</div>
											</c:when>
											<c:when test="${file.fileMeta.fileExt eq 'docx' || file.fileMeta.fileExt eq 'doc' || file.fileMeta.fileExt eq 'DOCX' || file.fileMeta.fileExt eq 'DOC'}">
												<div class="file-icon doc-icon">
													<svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#2196F3" stroke-width="2">
														<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
														<polyline points="14 2 14 8 20 8"></polyline>
														<line x1="16" y1="13" x2="8" y2="13"></line>
														<line x1="16" y1="17" x2="8" y2="17"></line>
													</svg>
												</div>
											</c:when>
											<c:when test="${file.fileMeta.fileExt eq 'xlsx' || file.fileMeta.fileExt eq 'xls' || file.fileMeta.fileExt eq 'XLSX' || file.fileMeta.fileExt eq 'XLS'}">
												<div class="file-icon excel-icon">
													<svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2">
														<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
														<polyline points="14 2 14 8 20 8"></polyline>
														<line x1="8" y1="13" x2="16" y2="13"></line>
														<line x1="8" y1="17" x2="16" y2="17"></line>
													</svg>
												</div>
											</c:when>
											<c:when test="${file.fileMeta.fileExt eq 'pptx' || file.fileMeta.fileExt eq 'ppt' || file.fileMeta.fileExt eq 'PPTX' || file.fileMeta.fileExt eq 'PPT'}">
												<div class="file-icon ppt-icon">
													<svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#FF9800" stroke-width="2">
														<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
														<polyline points="14 2 14 8 20 8"></polyline>
														<rect x="8" y="12" width="8" height="7"></rect>
													</svg>
												</div>
											</c:when>
											<c:when test="${file.fileMeta.fileExt eq '폴더'}">
												<div class="file-icon folder-icon">
													<svg width="50" height="50" viewBox="0 0 24 24"
														fill="#FFB74D" stroke="#F57C00" stroke-width="2"
														stroke-linecap="round" stroke-linejoin="round">
														<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
													</svg>
												</div>
											</c:when>
											<c:otherwise>
												<div class="file-icon default-icon">
													<svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#9E9E9E" stroke-width="2">
														<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
														<polyline points="13 2 13 9 20 9"></polyline>
													</svg>
												</div>
											</c:otherwise>
										</c:choose>
									</div>
									<div class="file-name" title="${file.fileMeta.fileNm}">${file.fileMeta.fileNm}</div>
								</div>

								<div class="file-card-footer">
									<div class="file-info">
										<%-- ✅ 폴더면 용량 숨김 --%>
										<c:if test="${file.fileMeta.fileExt ne '폴더'}">
											<span class="file-size"><fmt:formatNumber
													value="${file.fileMeta.fileSize / 1024}" pattern="#,###" /> KB</span>
										</c:if>
										<span class="file-date">${file.fileMeta.regDtm}</span>
									</div>
									<button class="btn-more"
										onclick="toggleFileMenu(event, '${file.fileMeta.fileNo}')">⋮</button>
									<div class="file-menu" id="menu-${file.fileMeta.fileNo}">
										<%-- ✅ 폴더면 다운로드 버튼 숨김 --%>
										<c:if test="${file.fileMeta.fileExt ne '폴더'}">
											<button onclick="event.stopPropagation(); downloadFile('/work-drive/download/${file.fileMeta.fileNo}')">다운로드</button>
										</c:if>
										<button onclick="event.stopPropagation(); deleteFile('${file.fileMeta.fileNo}')">삭제</button>
									</div>
								</div>
							</div>
						</c:forEach>
					</c:otherwise>
				</c:choose>
			</div>

			<!-- 목록형 보기 -->
			<table class="file-table"
				style="${vMode eq 'list' ? '' : 'display:none;'}">
				<thead>
					<tr>
						<th class="col-check"><input type="checkbox" id="checkAll"></th>
						<th class="col-name">파일명</th>
						<th class="col-type">종류</th>
						<th class="col-size">크기</th>
						<th class="col-date">등록일</th>
						<th class="col-author">작성자</th>
						<th class="col-action">관리</th>
					</tr>
				</thead>
				<tbody>
					<c:if test="${currentPath ne rootPath}">
						<tr onclick="goBack()"
							style="cursor: pointer; background-color: #f9f9f9;">
							<td></td>
							<td class="file-name-cell"><span
								style="margin-right: 10px; font-weight: bold;">⤴</span> <strong>[
									상위 폴더로 이동 ]</strong></td>
							<td class="text-center">상위</td>
							<td colspan="4"></td>
						</tr>
					</c:if>
					<c:choose>
						<c:when test="${empty fileList}">
							<tr>
								<td colspan="7" class="empty-msg">등록된 파일이 없습니다.</td>
							</tr>
						</c:when>
						<c:otherwise>
							<c:forEach var="file" items="${fileList}">
								<%-- ✅ 폴더면 is-folder-row 클래스 추가 --%>
								<tr class="file-row ${file.fileMeta.fileExt eq '폴더' ? 'is-folder-row' : ''}"
									data-file-id="${file.fileMeta.fileNo}"
									data-emp-nm="${file.fileMeta.empNm}"
									data-file-path="${file.fileMeta.filePath}"
									data-file-nm="${file.fileMeta.fileNm}"
									onclick="showAuthorBadge(this.dataset.empNm || '(이름 없음)', this)"
									<c:choose>
										<c:when test="${file.fileMeta.fileExt eq '폴더'}">
											ondragover="handleDragOver(event)"
											ondragleave="handleDragLeave(event)"
											ondrop="handleDrop(event)"
											ondblclick="location.href='?deptCd=${deptCd}&currentPath=${file.fileMeta.filePath}${file.fileMeta.fileNm}/&viewMode=list'"
											style="cursor:pointer;"
										</c:when>
										<c:otherwise>
											draggable="true"
											ondragstart="handleDragStart(event)"
										</c:otherwise>
									</c:choose>>
									<td class="text-center"><input type="checkbox"
										name="fileIds" value="${file.fileMeta.fileNo}"></td>
									<td class="file-name-cell"><span class="file-icon-inline">
											<c:choose>
												<c:when test="${file.fileMeta.fileExt eq '폴더'}">
													<svg width="18" height="18" viewBox="0 0 24 24"
														fill="#FFB74D" stroke="#F57C00" stroke-width="2"
														stroke-linecap="round" stroke-linejoin="round">
														<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
													</svg>
												</c:when>
												<c:when test="${file.fileMeta.fileExt eq 'jpg' || file.fileMeta.fileExt eq 'png' || file.fileMeta.fileExt eq 'jpeg' || file.fileMeta.fileExt eq 'gif'}">
													<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2">
														<rect x="3" y="3" width="18" height="18" rx="2"></rect>
														<circle cx="8.5" cy="8.5" r="1.5"></circle>
														<polyline points="21 15 16 10 5 21"></polyline>
													</svg>
												</c:when>
												<c:when test="${file.fileMeta.fileExt eq 'pdf'}">
													<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F44336" stroke-width="2">
														<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
														<polyline points="14 2 14 8 20 8"></polyline>
													</svg>
												</c:when>
												<c:when test="${file.fileMeta.fileExt eq 'xlsx' || file.fileMeta.fileExt eq 'xls'}">
													<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2">
														<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
														<polyline points="14 2 14 8 20 8"></polyline>
													</svg>
												</c:when>
												<c:when test="${file.fileMeta.fileExt eq 'docx' || file.fileMeta.fileExt eq 'doc'}">
													<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2196F3" stroke-width="2">
														<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
														<polyline points="14 2 14 8 20 8"></polyline>
													</svg>
												</c:when>
												<c:otherwise>
													<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9E9E9E" stroke-width="2">
														<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
														<polyline points="13 2 13 9 20 9"></polyline>
													</svg>
												</c:otherwise>
											</c:choose>
									</span> <span class="file-name-text">${file.fileMeta.fileNm}</span></td>
									<td class="text-center">${file.fileMeta.fileExt}</td>
									<%-- ✅ 폴더면 용량 숨김 --%>
									<td class="text-center">
										<c:if test="${file.fileMeta.fileExt ne '폴더'}">
											<fmt:formatNumber value="${file.fileMeta.fileSize / 1024}" pattern="#,###" /> KB
										</c:if>
									</td>
									<td class="text-center">${file.fileMeta.regDtm}</td>
									<td class="text-center">${file.fileMeta.empNm}</td>
									<%-- ✅ 폴더면 다운로드 버튼 숨김 --%>
									<td class="text-center">
										<c:if test="${file.fileMeta.fileExt ne '폴더'}">
											<button class="btn-sm-download"
												onclick="downloadFile('/work-drive/download/${file.fileMeta.fileNo}')">다운로드</button>
										</c:if>
										<button class="btn-sm-delete"
											onclick="deleteFile('${file.fileMeta.fileNo}')">삭제</button>
									</td>
								</tr>
							</c:forEach>
						</c:otherwise>
					</c:choose>
				</tbody>
			</table>
		</main>
	</div>

	<%-- ✅ 우측 하단 플로팅 업로드 버튼 --%>
	<button class="fab-upload" id="fabBtn" onclick="openUploadModal()"
		title="파일 업로드">
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none"
			stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
			stroke-linejoin="round">
			<line x1="12" y1="5" x2="12" y2="19"></line>
			<line x1="5" y1="12" x2="19" y2="12"></line>
		</svg>
	</button>

	<%-- ✅ 업로드 모달 --%>
	<div class="upload-modal-overlay" id="uploadOverlay"
		onclick="closeUploadModal()"></div>
	<div class="upload-modal" id="uploadModal">
		<div class="upload-modal-header">
			<span class="upload-modal-title">📤 파일 업로드</span>
			<button class="upload-modal-close" onclick="closeUploadModal()">✕</button>
			<input type="hidden" name="currentPath" value="${currentPath}">
		</div>
		<form id="uploadForm" action="/work-drive/upload" method="post"
			enctype="multipart/form-data">
			<input type="hidden" name="deptCd" value="${deptCd}">
			<div id="dropZone" class="upload-drop-area">
				<div class="drop-content">
					<span class="upload-icon">📂</span>
					<p>파일을 여기에 끌어다 놓으세요</p>
					<span class="upload-sub-text">또는 클릭하여 파일 선택</span>
					<input type="file" name="files" id="fileInput" multiple style="display: none;">
				</div>
			</div>
		</form>
	</div>

	<script src="${pageContext.request.contextPath}/js/department/board.js?v=5"></script>
</body>
</html>
