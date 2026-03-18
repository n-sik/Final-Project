<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core"%>

<meta name="ctx" content="${pageContext.request.contextPath}">
<meta name="loginEmpNo" content="${loginUser.empNo}">
<meta name="isHr" content="${pageContext.request.isUserInRole('HR')}">

<link rel="stylesheet"
	href="${pageContext.request.contextPath}/css/board/board.css" />

<div class="bt" id="bdApp">

	<!-- Topbar -->
	<header class="bt-topbar bd-topbar">
		<div class="bt-topbar__left bd-topbarLeft">
			<div class="bt-brand">
				<div class="bt-brand__title">소식</div>
				<div class="bt-brand__sub">공지 · 건의 · 복지/지원 · 인사이동 · 채용 · 교육</div>
			</div>
		</div>

		<div class="bt-topbar__right bd-topbarRight">
			<nav class="bd-tabs bd-tabs--top" role="tablist" aria-label="게시판 종류">
				<button type="button" class="bd-tab is-active" data-type="1">
					<span>공지</span>
				</button>
				<button type="button" class="bd-tab" data-type="2">
					<span>지원/복지</span>
				</button>
				<button type="button" class="bd-tab" data-type="3">
					<span>인사이동</span>
				</button>
				<button type="button" class="bd-tab" data-type="4">
					<span>교육</span>
				</button>
				<button type="button" class="bd-tab" data-type="5">
					<span>채용</span>
				</button>
				<button type="button" class="bd-tab" data-type="6">
					<span>건의</span>
				</button>
			</nav>

			<!-- ✅ 저장 버튼은 항상 노출(숨김 X), read에서는 disabled 처리 -->
			<div class="bt-actions">
				<button type="button" class="bt-btn bt-btn--primary bd-topSave"
					id="bdBtnSave" disabled>
					<i class="bi bi-check2-circle"></i><span>저장</span>
				</button>
			</div>
		</div>
	</header>

	<div class="bt-body bd-body">
		<section class="bt-panel bd-panel">

			<!-- Split (2/3 : 1/3) -->
			<div class="bd-split is-collapsed" id="bdSplit">

				<!-- List -->
				<div class="bd-list">
					<div class="bd-cardHead">
						<div class="bd-cardTitle">
							<i class="bi bi-card-list"></i> <span id="bdListTitle">공지
								게시판</span> <span class="bt-mini">총 <b id="bdTotalCnt">0</b></span>
						</div>

						<div class="bd-cardActions">
							<div class="bd-headTools">
								<div class="bd-controlPill" aria-label="페이지 크기">
									<span class="bd-controlLabel">표시</span> <select
										class="bt-select bd-sizeSel bd-sizeSel--head bd-selectPill"
										id="bdPageSize">
										<option value="10">10</option>
										<option value="20" selected>20</option>
										<option value="50">50</option>
									</select> <span class="bd-controlLabel">개</span>
								</div>
							</div>

							<button type="button" class="bt-btn bd-iconOnly" id="bdBtnReload"
								title="새로고침" aria-label="새로고침">
								<i class="bi bi-arrow-repeat"></i>
							</button>

							<button type="button" class="bt-btn bd-iconOnly" id="bdBtnNew"
								title="작성" aria-label="작성">
								<i class="bi bi-clipboard-plus"></i>
							</button>

							<!-- ✅ 슬라이드(접기/펼치기) 버튼 -->
							<button type="button" class="bt-btn bd-toggleBtn"
								id="bdBtnCollapse" title="상세 영역 접기/펼치기"
								aria-label="상세 영역 접기/펼치기">
								<i class="bi bi-layout-sidebar-inset"></i>
							</button>
						</div>
					</div>

					<div class="bd-gridWrap">
						<div id="bdGrid" class="bd-agGrid ag-theme-quartz"></div>
					</div>

					<div class="bd-listFoot">
						<div class="bd-searchRow">
							<div class="bd-searchGroup bd-searchbar" role="search"
								aria-label="게시글 검색">
								<div class="bd-controlPill bd-controlPill--search">
									<select class="bt-select bd-searchSel bd-selectPill"
										id="bdSearchType" aria-label="검색 분류">
										<option value="title" selected>제목</option>
										<option value="writer">작성자</option>
									</select>

									<div class="bd-inputWrap">
										<i class="bi bi-search bd-inputIcon" aria-hidden="true"></i> <input
											type="text" class="bt-input bd-searchInput bd-inputPill"
											id="bdKeyword" placeholder="검색어 입력"  />
									</div>

									<button type="button" class="bt-btn bt-btn--primary bd-btnPill"
										id="bdBtnSearch">
										<i class="bi bi-search"></i> <span>검색</span>
									</button>
								</div>
							</div>

							<div class="bd-pageGroup">
								<button type="button" class="bt-btn" id="bdBtnFirst" title="처음">
									<i class="bi bi-chevron-double-left"></i>
								</button>
								<button type="button" class="bt-btn" id="bdBtnPrev" title="이전">
									<i class="bi bi-chevron-left"></i>
								</button>
								<span class="bd-pageMeta"><b id="bdPageNow">1</b> / <span
									id="bdPageTotal">1</span></span>
								<button type="button" class="bt-btn" id="bdBtnNext" title="다음">
									<i class="bi bi-chevron-right"></i>
								</button>
								<button type="button" class="bt-btn" id="bdBtnLast" title="마지막">
									<i class="bi bi-chevron-double-right"></i>
								</button>
							</div>
						</div>
					</div>
				</div>

				<!-- Editor/Detail -->
				<aside class="bd-editor" id="bdEditor" aria-label="게시글 작성/상세">

					<div class="bd-metaTop">
						<span class="bd-pill" id="bdTypePill">공지</span> <span
							class="bd-muted" id="bdMetaText">작성 모드</span>
					</div>

					<div class="bd-cardHead bd-cardHead--editor">
						<div class="bd-cardTitle">
							<i class="bi bi-file-earmark-text"></i> <span
								id="bdEditorModeTitle">글쓰기</span>
						</div>

						<div class="bd-cardActions">
							<button type="button" class="bt-btn is-hidden" id="bdBtnEdit"
								title="수정" aria-label="수정">
								<i class="bi bi-pencil-square"></i>
							</button>

							<button type="button" class="bt-btn bt-btn--danger is-hidden"
								id="bdBtnDelete" title="삭제" aria-label="삭제">
								<i class="bi bi-trash"></i>
							</button>
						</div>
					</div>

					<div class="bd-editorBody bt-scrollArea">
						<form id="bdForm" class="bd-form" autocomplete="off">
							<input type="hidden" id="bdPostNo" value="">

							<div class="bd-field">
								<label class="bd-label" for="bdTitle">제목</label> <input
									type="text" class="bt-input bd-ctl" id="bdTitle"
									maxlength="200" placeholder="제목을 입력하세요" />
							</div>

							<!-- ✅ 교육/채용: 기간 필수 -->
							<div class="bd-field bd-period is-hidden" id="bdPeriodWrap">
								<div class="bd-periodHead">
									<label class="bd-label">기간 설정 <span class="bd-required">*</span></label>

									<!-- (유지) 체크박스는 JS에서 교육/채용일 때 강제 Y + disabled + 숨김처리 -->
									<label class="bd-chk"> <input type="checkbox"
										id="bdPeriodYn"> <span>기간 사용</span>
									</label>
								</div>

								<div class="bd-periodRow">
									<input type="date" class="bt-input bd-ctl" id="bdStartDate"
										disabled> <span class="bd-muted">~</span> <input
										type="date" class="bt-input bd-ctl" id="bdEndDate" disabled>
								</div>

								<div class="bd-help">
									<i class="bi bi-info-circle"></i> 해당 게시글은 기간(일정) 등록이 <b>필수</b>입니다.
								</div>
							</div>

							<div class="bd-field">
								<label class="bd-label" for="bdCn">내용</label>
								<textarea class="bt-input bd-ctl bd-textarea" id="bdCn"
									rows="10" placeholder="내용을 입력하세요"></textarea>
							</div>

							<div class="bd-attach">
								<div class="bd-attachHead">
									<i class="bi bi-paperclip"></i><span>첨부파일</span> <span
										class="bd-muted">(파일 서버: board)</span>
								</div>
								<div class="bd-attachBox">
									<!-- ✅ 작성/수정 모드에서만 선택 가능하도록 JS에서 제어 -->
									<input type="file" id="bdFiles" class="bd-fileInput" multiple>
									<div class="bd-muted bd-fileHelp">최대 용량/확장자 제한은 서버 정책을
										따릅니다.</div>
									<div id="bdFileList" class="bd-fileList"></div>
								</div>
							</div>

							<div class="bd-formActions is-hidden"></div>
						</form>

						<div class="bd-cmnt is-hidden" id="bdCmntWrap">
							<div class="bd-cmntHead">
								<div class="bd-cmntTitle">
									<i class="bi bi-chat-left-dots"></i><span>댓글</span> <span
										class="bt-mini">총 <b id="bdCmntCnt">0</b></span>
								</div>
							</div>

							<div class="bd-cmntList" id="bdCmntList"></div>

							<div class="bd-cmntWrite">
								<div class="bd-replyTo is-hidden" id="bdReplyTo">
									<i class="bi bi-arrow-return-right"></i> <span>대댓글 작성 중</span>
									<button type="button" class="bt-btn bt-btn--ghost"
										id="bdBtnReplyCancel">
										<i class="bi bi-x"></i><span>취소</span>
									</button>
								</div>

								<textarea class="bt-input bd-ctl bd-cmntTa" id="bdCmntText"
									rows="3" placeholder="댓글을 입력하세요"></textarea>
								<div class="bd-cmntActions">
									<button type="button" class="bt-btn bt-btn--primary"
										id="bdBtnCmntSave">
										<i class="bi bi-send"></i><span>등록</span>
									</button>
								</div>
							</div>
						</div>

					</div>
				</aside>

			</div>
		</section>
	</div>
</div>

<script src="${pageContext.request.contextPath}/js/board/board.js"></script>
