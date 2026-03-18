<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib uri="jakarta.tags.core" prefix="c"%>
<%@ taglib uri="jakarta.tags.functions" prefix="fn"%>
<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags"%>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>서명/직인 관리</title>
<c:set var="ctx" value="${pageContext.request.contextPath}" />
<link rel="stylesheet" href="${ctx}/css/aprv/aprvAssetManage.css">
</head>

<body>

	<div class="aprv-asset-page">
		<div class="aprv-container">

			<c:if test="${not empty msg}">
				<div class="aprv-alert">${fn:escapeXml(msg)}</div>
			</c:if>

			<header class="aprv-top">
				<div class="aprv-top-left">
					<h2 class="aprv-top-title">전자결재</h2>
					<p class="aprv-top-sub">서명/직인 관리</p>
				</div>

				<div class="aprv-top-right">
					<nav class="aprv-top-tabs" aria-label="전자결재 탭">
						<a class="aprv-tab" href="${ctx}/aprv/readList?box=mine">내 문서함</a>
						<sec:authorize access="hasRole('LEADER')">
							<a class="aprv-tab" href="${ctx}/aprv/pendingList?box=pending">대기함</a>
							<a class="aprv-tab" href="${ctx}/aprv/processedList?box=processed">처리함</a>
						</sec:authorize>
						<a class="aprv-tab" href="${ctx}/aprv/readList?box=ref">참조함</a>
						<sec:authorize access="hasRole('LEADER')">
							<a class="aprv-tab is-active" href="${ctx}/aprv/asset/manage">서명/직인</a>
						</sec:authorize>
					</nav>

					<a class="aprv-btn aprv-btn--primary" href="${ctx}/aprv/create">기안작성</a>
				</div>
			</header>

			<section class="aprv-guide" aria-label="페이지 안내">
				<div class="aprv-guide-left">
					<h3 class="aprv-guide-title">결재용 서명/직인을 등록합니다.</h3>
					<p class="aprv-guide-desc">
						승인 시 <b>SIGN(서명)</b> 또는 <b>SEAL(직인)</b> 중 1개를 선택해 반영할 수 있습니다. 자산은
						업로드할 때마다 <b>히스토리로 누적</b>되며, 승인에서는 <b>가장 최근 업로드</b> 자산이 사용됩니다.
					</p>
					<span class="aprv-guide-chip"> <span
						class="aprv-guide-chip__icon">✦</span> 서명 <b>300×120</b> · 직인 <b>180×180</b>
						· PNG 투명 권장
					</span> <span class="aprv-guide-chip aprv-guide-chip--muted">PNG/JPG/GIF/WebP</span>
				</div>

				<div class="aprv-guide-right">
					<span class="aprv-pill">내 자산</span>
				</div>
			</section>

			<div class="aprv-grid">

				<!-- 좌: 업로드 -->
				<section class="aprv-card aprv-card--rail" aria-label="업로드">
					<div class="aprv-card__head">
						<h3 class="aprv-card__title">업로드</h3>
						<p class="aprv-card__meta">서명/직인을 업로드하면 결재에 사용할 수 있습니다.</p>
					</div>

					<div class="aprv-card__body aprv-scroll">

						<!-- 서명 업로드 -->
						<div class="aprv-subcard">
							<div class="aprv-subcard__head">
								<h4 class="aprv-subcard__title">서명(SIGN)</h4>
								<span class="aprv-subcard__meta">가장 최근 서명이 승인에 사용됩니다.</span>
							</div>

							<form class="aprv-form" action="${ctx}/aprv/asset/upload"
								method="post" enctype="multipart/form-data" data-form="sign">
								<input type="hidden" name="assetTypeCd" value="SIGN" />

								<div class="aprv-field">
									<label class="aprv-label" for="signNm">서명 이름</label> <input
										class="aprv-input" type="text" id="signNm" name="assetNm"
										placeholder="예) 기본 서명" />
								</div>

								<div class="aprv-field">
									<label class="aprv-label" for="signFile">서명 이미지</label> <input
										class="aprv-input" type="file" id="signFile" name="file"
										accept="image/*" required />
									<div class="aprv-help">PNG(투명) 권장 · 파일 선택 시 미리보기가 표시됩니다.</div>
								</div>

								<div class="aprv-preview" data-preview="sign">
									<div class="aprv-preview__empty">미리보기</div>
								</div>

								<div class="aprv-actions">
									<button class="aprv-btn aprv-btn--primary" type="submit">서명
										업로드</button>
								</div>
							</form>
						</div>

						<!-- 직인 업로드 -->
						<div class="aprv-subcard">
							<div class="aprv-subcard__head">
								<h4 class="aprv-subcard__title">직인(SEAL)</h4>
								<span class="aprv-subcard__meta">가장 최근 직인이 승인에 사용됩니다.</span>
							</div>

							<form class="aprv-form" action="${ctx}/aprv/asset/upload"
								method="post" enctype="multipart/form-data" data-form="seal">
								<input type="hidden" name="assetTypeCd" value="SEAL" />

								<div class="aprv-field">
									<label class="aprv-label" for="sealNm">직인 이름</label> <input
										class="aprv-input" type="text" id="sealNm" name="assetNm"
										placeholder="예) 회사 직인" />
								</div>

								<div class="aprv-field">
									<label class="aprv-label" for="sealFile">직인 이미지</label> <input
										class="aprv-input" type="file" id="sealFile" name="file"
										accept="image/*" required />
									<div class="aprv-help">정사각형(투명) 권장 · 파일 선택 시 미리보기가 표시됩니다.</div>
								</div>

								<div class="aprv-preview" data-preview="seal">
									<div class="aprv-preview__empty">미리보기</div>
								</div>

								<div class="aprv-actions">
									<button class="aprv-btn aprv-btn--primary" type="submit">직인
										업로드</button>
								</div>
							</form>
						</div>

					</div>
				</section>

				<!-- 우: 목록 -->
				<section class="aprv-card aprv-card--main" aria-label="내 자산 목록">
					<div class="aprv-card__head">
						<h3 class="aprv-card__title">내 자산 목록</h3>
						<p class="aprv-card__meta">
							서명 <b>${fn:length(signList)}</b>개 · 직인 <b>${fn:length(sealList)}</b>개
						</p>
					</div>

					<div class="aprv-card__body aprv-scroll">

						<!-- 서명 목록 -->
						<div class="aprv-section">
							<div class="aprv-section__head">
								<h4 class="aprv-section__title">서명 (SIGN)</h4>
								<span class="aprv-section__hint">최신 1개가 승인에 사용됨</span>
							</div>

							<c:choose>
								<c:when test="${empty signList}">
									<div class="aprv-empty-card">등록된 서명이 없습니다.</div>
								</c:when>
								<c:otherwise>
									<div class="aprv-table-wrap">
										<table class="aprv-table">
											<thead>
												<tr>
													<th style="width: 120px;">미리보기</th>
													<th>이름</th>
													<th style="width: 180px;">등록일</th>
												</tr>
											</thead>
											<tbody>
												<c:forEach var="s" items="${signList}" varStatus="st">
													<tr>
														<td>
															<div class="aprv-thumb">
																<img src="${ctx}/aprv/asset/image?assetNo=${s.assetNo}"
																	alt="${fn:escapeXml(s.assetNm)}" />
															</div>
														</td>
														<td>
															<div class="aprv-name">
																<span class="aprv-name__txt">${fn:escapeXml(s.assetNm)}</span>
																<c:if test="${st.first}">
																	<span class="aprv-badge">최신</span>
																</c:if>
															</div>
														</td>
														<td class="aprv-muted">${s.regDtm}</td>
													</tr>
												</c:forEach>
											</tbody>
										</table>
									</div>
								</c:otherwise>
							</c:choose>
						</div>

						<hr class="aprv-hr" />

						<!-- 직인 목록 -->
						<div class="aprv-section">
							<div class="aprv-section__head">
								<h4 class="aprv-section__title">직인 (SEAL)</h4>
								<span class="aprv-section__hint">최신 1개가 승인에 사용됨</span>
							</div>

							<c:choose>
								<c:when test="${empty sealList}">
									<div class="aprv-empty-card">등록된 직인이 없습니다.</div>
								</c:when>
								<c:otherwise>
									<div class="aprv-table-wrap">
										<table class="aprv-table">
											<thead>
												<tr>
													<th style="width: 120px;">미리보기</th>
													<th>이름</th>
													<th style="width: 180px;">등록일</th>
												</tr>
											</thead>
											<tbody>
												<c:forEach var="s" items="${sealList}" varStatus="st">
													<tr>
														<td>
															<div class="aprv-thumb">
																<img src="${ctx}/aprv/asset/image?assetNo=${s.assetNo}"
																	alt="${fn:escapeXml(s.assetNm)}" />
															</div>
														</td>
														<td>
															<div class="aprv-name">
																<span class="aprv-name__txt">${fn:escapeXml(s.assetNm)}</span>
																<c:if test="${st.first}">
																	<span class="aprv-badge">최신</span>
																</c:if>
															</div>
														</td>
														<td class="aprv-muted">${s.regDtm}</td>
													</tr>
												</c:forEach>
											</tbody>
										</table>
									</div>
								</c:otherwise>
							</c:choose>
						</div>

					</div>
				</section>

			</div>

		</div>
	</div>

	<script src="${ctx}/js/aprv/aprvAssetManage.js"></script>
</body>
</html>