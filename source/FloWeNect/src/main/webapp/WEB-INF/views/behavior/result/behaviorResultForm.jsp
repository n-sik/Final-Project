<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core"%>
<%@ taglib prefix="fn" uri="jakarta.tags.functions"%>

<meta name="ctx" content="${pageContext.request.contextPath}">

<link rel="stylesheet" href="${pageContext.request.contextPath}/css/behavior/result.css" />

<div class="bt" id="brApp">

  <!-- Topbar -->
  <header class="bt-topbar">
    <div class="bt-topbar__left">
      <div class="bt-brand">
        <div class="bt-brand__title">결과조회</div>
        <div class="bt-brand__sub">타인평가 결과 조회</div>
      </div>
    </div>

    <div class="bt-topbar__right">
      <div class="bt-actions">
        <button type="button" class="bt-btn" id="btnHalf" title="현재 날짜 기준 반기(상/하)로 자동 설정">
          <i class="bi bi-calendar2-range"></i><span>반기 자동</span>
        </button>
        <button type="button" class="bt-btn bt-btn--primary" id="btnReload">
          <i class="bi bi-arrow-repeat"></i><span>조회</span>
        </button>
      </div>
    </div>
  </header>

  <div class="bt-body">
    <!-- Left rail: Dept/Emp -->
    <aside class="bt-rail">
      <div class="bt-panel">
        <div class="bt-panel__head bt-panel__head--rail">
          <div class="bt-panel__title">
            <i class="bi bi-diagram-3"></i>
            부서/사원
            <span class="bt-mini">표시 <b id="empMeta"><c:out value="${fn:length(empList)}"/></b></span>
          </div>
        </div>

        <div class="bt-rail__subhead">
          <select class="bt-select" id="deptSelect" aria-label="부서 선택">
            <option value="ALL">전체 부서</option>
            <c:forEach items="${deptList}" var="d">
              <option value="<c:out value='${d.deptCd}'/>"><c:out value="${d.deptNm}"/></option>
            </c:forEach>
          </select>
        </div>

        <div class="bt-panel__body bt-panel__body--scroll">
          <div class="bt-modal__list" id="empList">
            <c:forEach items="${empList}" var="e">
              <div class="bt-person"
                   data-emp-no="<c:out value='${e.empNo}'/>"
                   data-emp-nm="<c:out value='${e.empNm}'/>"
                   data-dept-cd="<c:out value='${e.deptCd}'/>"
                   data-dept-nm="<c:out value='${e.deptNm}'/>"
                   data-pos-nm="<c:out value='${e.posNm}'/>">
                <div class="bt-person__name">
                  <c:out value="${e.empNm}"/>
                  <span class="bt-chip br-chip--pos"><c:out value="${e.posNm}"/></span>
                </div>
                <div class="bt-person__meta">
                  <c:out value="${e.deptNm}"/> · <c:out value="${e.empNo}"/>
                </div>
              </div>
            </c:forEach>
          </div>

          <div id="empEmpty" class="bt-empty is-hidden">
            <div class="bt-empty__title">사원이 없습니다</div>
            <div class="bt-empty__desc">선택한 부서에 사원이 없습니다.</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main -->
    <main class="bt-main">
      <div class="bt-panel bt-panel--main">
        <div class="bt-panel__head bt-panel__head--test">
          <div class="bt-headrow br-headrow">
            <div class="bt-pill is-selected br-pill--emp">
              <i class="bi bi-person-badge"></i>
              <span class="bt-pill__label">선택된 부서원</span>
              <strong id="selectedEmpName" class="bt-pill__value">-</strong>
            </div>

            <div class="bt-filterRow br-filterRow br-filterRow--right">
              <select class="bt-select br-testSelect" id="testSelect" aria-label="검사종류 선택">
                <option value="">전체 설문</option>
                <c:forEach items="${testMst}" var="t">
                  <option value="<c:out value='${t.testNo}'/>"><c:out value="${t.testNm}"/></option>
                </c:forEach>
              </select>

              <input class="bt-input" type="date" id="startDate" aria-label="시작일" />
              <span class="bt-table__muted">~</span>
              <input class="bt-input" type="date" id="endDate" aria-label="종료일" />
            </div>
          </div>
        </div>

        <div class="bt-panel__body bt-panel__body--main">
          <div class="bt-inner">
            <div class="bt-inner__head">
              <div class="bt-inner__title">
                <i class="bi bi-clipboard-data"></i><span>타인평가 결과 목록</span>
              </div>
            </div>

            <div class="bt-inner__body br-innerBody">
              <div class="bt-scrollArea">
                <!-- ✅ AG Grid (Quartz Theme) -->
                <div id="rspnsGrid" class="ag-theme-quartz br-agGrid" aria-label="타인평가 결과 목록"></div>

                <!-- fallback empty (overlay + 이 영역 둘 다 사용 가능) -->
<!--                 <div class="bt-empty is-hidden br-rspnsEmpty" id="rspnsEmpty"> -->
<!--                   <div class="bt-empty__title">결과가 없습니다</div> -->
<!--                   <div class="bt-empty__desc">기간/설문 필터를 바꾸거나 다른 부서원을 선택해보세요.</div> -->
<!--                 </div> -->
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- 상세 모달 -->
  <div class="bt-modal" id="detailModal" aria-hidden="true">
    <div class="bt-modal__backdrop" data-close="true"></div>
    <div class="bt-modal__card bt-modal__card--wide" role="dialog" aria-modal="true" aria-labelledby="detailTitle">
      <div class="bt-modal__head">
        <div class="bt-modal__title" id="detailTitle">
          <i class="bi bi-search"></i> 상세보기
        </div>
        <button type="button" class="bt-iconbtn" data-close="true" title="닫기">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="bt-modal__body">
        <div id="detailBody"></div>
      </div>

      <div class="bt-modal__foot">
        <button type="button" class="bt-btn" data-close="true">
          <i class="bi bi-x-circle"></i><span>닫기</span>
        </button>
      </div>
    </div>
  </div>

</div>

<script defer src="${pageContext.request.contextPath}/js/behavior/behaviorResult.js"></script>
