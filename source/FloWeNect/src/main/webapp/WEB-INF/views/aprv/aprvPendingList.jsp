<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="jakarta.tags.core" prefix="c"%>
<%@ taglib uri="jakarta.tags.functions" prefix="fn"%>
<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags"%>

<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>결재 대기함</title>
  <link rel="stylesheet" href="${pageContext.request.contextPath}/css/aprv/aprvList.css">
</head>

<body>

<div class="aprv-list-page">
  <div class="aprv-container">

    <c:if test="${not empty msg}">
      <div class="aprv-alert">${msg}</div>
    </c:if>

    <!-- 상단 헤더 -->
    <header class="aprv-top" aria-label="전자결재 상단">
      <div class="aprv-top-left">
        <h2 class="aprv-top-title">전자결재</h2>
        <p class="aprv-top-sub">결재 대기함: 내가 결재해야 할 문서를 조회 합니다.</p>
      </div>

      <div class="aprv-top-right">
        <nav class="aprv-top-tabs" aria-label="전자결재 문서함 탭">
          <a class="aprv-tab" href="${pageContext.request.contextPath}/aprv/readList?box=mine">내 문서함</a>
          <sec:authorize access="hasRole('LEADER')">
            <a class="aprv-tab is-active" href="${pageContext.request.contextPath}/aprv/pendingList?box=pending">대기함</a>
            <a class="aprv-tab" href="${pageContext.request.contextPath}/aprv/processedList?box=processed">처리함</a>
          </sec:authorize>
          <a class="aprv-tab" href="${pageContext.request.contextPath}/aprv/readList?box=ref">참조함</a>
          <sec:authorize access="hasRole('LEADER')">
            <a class="aprv-tab" href="${pageContext.request.contextPath}/aprv/asset/manage">서명/직인</a>
          </sec:authorize>
        </nav>

        <a class="aprv-btn aprv-btn--primary" href="${pageContext.request.contextPath}/aprv/create">기안작성</a>
      </div>
    </header>

    <!-- 본문: 좌/우 섹션 고정 높이 + 내부만 스크롤 -->
    <div class="aprv-list-grid" aria-label="전자결재 본문">

      <section class="aprv-card aprv-card--rail" aria-label="검색 조건">
        <div class="aprv-card__head aprv-card__head--rail">
          <h3 class="aprv-card__title">검색 조건</h3>
          <span class="aprv-card__meta">필요한 조건만 설정</span>
        </div>

        <div class="aprv-card__body aprv-card__body--scroll">
        <form class="aprv-filter" action="${pageContext.request.contextPath}/aprv/pendingList" method="get">
          <input type="hidden" name="box" value="pending"/>

          <div class="aprv-filter__grid aprv-filter__grid--rail">
            <div class="aprv-field">
              <label class="aprv-label" for="fromDt">기간(시작)</label>
              <input class="aprv-input" type="date" id="fromDt" name="fromDt" value="${fromDt}">
            </div>
            <div class="aprv-field">
              <label class="aprv-label" for="toDt">기간(종료)</label>
              <input class="aprv-input" type="date" id="toDt" name="toDt" value="${toDt}">
            </div>

            <div class="aprv-field">
              <label class="aprv-label" for="docStatCd">상태</label>
              <select class="aprv-select" id="docStatCd" name="docStatCd">
                <option value="">전체</option>
                <option value="DRAFT"       <c:if test="${docStatCd=='DRAFT'}">selected</c:if>>임시</option>
                <option value="SUBMITTED"   <c:if test="${docStatCd=='SUBMITTED'}">selected</c:if>>상신</option>
                <option value="IN_PROGRESS" <c:if test="${docStatCd=='IN_PROGRESS'}">selected</c:if>>결재중</option>
                <option value="APPROVED"    <c:if test="${docStatCd=='APPROVED'}">selected</c:if>>승인완료</option>
                <option value="REJECTED"    <c:if test="${docStatCd=='REJECTED'}">selected</c:if>>반려</option>
                <option value="CANCELED"    <c:if test="${docStatCd=='CANCELED'}">selected</c:if>>취소</option>
              </select>
            </div>

            <div class="aprv-field">
              <label class="aprv-label" for="formCd">양식</label>
              <select class="aprv-select" id="formCd" name="formCd">
                <option value="">전체</option>
                <c:forEach var="f" items="${forms}">
                  <option value="${f.formCd}" <c:if test="${formCd==f.formCd}">selected</c:if>>${f.formNm}</option>
                </c:forEach>
              </select>
            </div>

            <div class="aprv-field">
              <label class="aprv-label" for="aprvNo">문서번호</label>
              <input class="aprv-input" type="text" id="aprvNo" name="aprvNo" value="${aprvNo}" placeholder="예) 12345">
            </div>

            <div class="aprv-field aprv-field--wide">
              <label class="aprv-label" for="aprvTtlPrefix">제목(시작)</label>
              <input class="aprv-input" type="text" id="aprvTtlPrefix" name="aprvTtlPrefix" value="${aprvTtlPrefix}" placeholder="예) 휴가">
              <p class="aprv-help">* 제목은 “앞부분 일치” 기준으로 검색됩니다.</p>
            </div>
          </div>

          <div class="aprv-filter__actions aprv-filter__actions--rail">
            <button class="aprv-btn aprv-btn--primary" type="submit">검색</button>
            <a class="aprv-btn" href="${pageContext.request.contextPath}/aprv/pendingList?box=pending">초기화</a>
          </div>
        </form>
        </div>
      </section>

      <section class="aprv-card aprv-card--main" aria-label="문서 목록">
        <div class="aprv-card__head">
          <h3 class="aprv-card__title">문서 목록</h3>
          <div class="aprv-card__meta">
            <c:if test="${page != null}"><span>총 ${page.totalCount}건</span></c:if>
          </div>
        </div>

        <!-- 목록 스크롤 영역 -->
        <div class="aprv-card__body aprv-card__body--scroll">
          <div class="aprv-list">
            <c:choose>
              <c:when test="${empty docs}">
                <div class="aprv-empty-card">조회 결과가 없습니다.</div>
              </c:when>
              <c:otherwise>
                <div class="aprv-table-wrap" role="region" aria-label="문서 목록 표">
                  <table class="aprv-table">
                    <thead>
                      <tr>
                        <th class="col-no">번호</th>
                        <th class="col-form">기안종류</th>
                        <th class="col-ttl">제목</th>
                        <th class="col-step">결재단계</th>
                        <th class="col-reg">작성일</th>
                        <th class="col-last">최종처리일</th>
                        <th class="col-stat">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      <c:forEach var="d" items="${docs}" varStatus="st">
                        <tr class="aprv-item aprv-item--clickable"
                            role="button" tabindex="0"
                            data-href="${pageContext.request.contextPath}/aprv/read?aprvNo=${d.aprvNo}">
                          <td class="col-no">${page.startRow + st.index}</td>
                          <td class="col-form">${d.formNm}</td>
                          <td class="col-ttl">
                            <div class="aprv-ttl" title="${fn:escapeXml(d.aprvTtl)}">${d.aprvTtl}</div>
                          </td>
                          <td class="col-step">${d.stepText}</td>
                          <td class="col-reg">${d.regDt}</td>
                          <td class="col-last">${d.lastProcDt}</td>
                          <td class="col-stat">
                            <span class="aprv-badge aprv-badge--${fn:toLowerCase(d.docStatCd)}">${d.docStatNm}</span>
                          </td>
                        </tr>
                      </c:forEach>
                    </tbody>
                  </table>
                </div>
              </c:otherwise>
            </c:choose>
          </div>
        </div>

        <c:if test="${page != null && page.totalPages > 1}">
          <div class="aprv-card__footer">
            <div class="aprv-pagination" aria-label="페이지네이션">
              <c:if test="${page.hasPrev}">
                <a class="aprv-page"
                   href="${pageContext.request.contextPath}/aprv/pendingList?box=pending&page=${page.prevPage}&fromDt=${fromDt}&toDt=${toDt}&docStatCd=${docStatCd}&formCd=${formCd}&aprvNo=${aprvNo}&aprvTtlPrefix=${aprvTtlPrefix}">이전</a>
              </c:if>

              <c:forEach var="p" begin="${page.startPage}" end="${page.endPage}">
                <a class="aprv-page <c:if test='${p==page.page}'>is-active</c:if>"
                   href="${pageContext.request.contextPath}/aprv/pendingList?box=pending&page=${p}&fromDt=${fromDt}&toDt=${toDt}&docStatCd=${docStatCd}&formCd=${formCd}&aprvNo=${aprvNo}&aprvTtlPrefix=${aprvTtlPrefix}">
                  ${p}
                </a>
              </c:forEach>

              <c:if test="${page.hasNext}">
                <a class="aprv-page"
                   href="${pageContext.request.contextPath}/aprv/pendingList?box=pending&page=${page.nextPage}&fromDt=${fromDt}&toDt=${toDt}&docStatCd=${docStatCd}&formCd=${formCd}&aprvNo=${aprvNo}&aprvTtlPrefix=${aprvTtlPrefix}">다음</a>
              </c:if>
            </div>
          </div>
        </c:if>
      </section>

    </div>

  </div>
</div>

<script defer src="${pageContext.request.contextPath}/js/aprv/aprvList.js"></script>

</body>
</html>