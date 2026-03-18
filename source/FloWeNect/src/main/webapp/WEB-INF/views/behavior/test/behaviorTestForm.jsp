<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core"%>
<%@ taglib prefix="fn" uri="jakarta.tags.functions"%>

<meta name="ctx" content="${pageContext.request.contextPath}">
<!-- 로그인 미구현: 임시 고정값 -->
<meta name="loginEmpNo" content="${loginUser.empNo}">

<link rel="stylesheet" href="${pageContext.request.contextPath}/css/behavior/test.css" />
<!-- NOTE: 셀프테스트 결과는 test 전용 모달(st-modal)로 표시 (result.css 재사용 제거) -->

<div class="bt" id="btApp">
  <!-- Topbar -->
  <header class="bt-topbar">
    <div class="bt-topbar__left">
      <div class="bt-brand">
        <div class="bt-brand__title">Behavior Survey</div>
        <div class="bt-brand__sub">셀프 · 타인 테스트 응시</div>
      </div>
    </div>

    <div class="bt-topbar__right">
      <div class="bt-tabs">
        <button type="button" class="tab-btn bt-tab active" data-tab="other" id="tabOther">
          <i class="bi bi-people"></i><span>타인 테스트</span>
        </button>
        <button type="button" class="tab-btn bt-tab" data-tab="self" id="tabSelf">
          <i class="bi bi-person-check"></i><span>셀프 테스트</span>
        </button>
      </div>

      <div class="bt-actions">
        <button type="button" class="bt-btn" id="btnReset">
          <i class="bi bi-arrow-counterclockwise"></i><span>초기화</span>
        </button>
        <button type="button" class="bt-btn bt-btn--primary" id="btnSubmit" disabled>
          <i class="bi bi-send-check"></i><span>제출</span>
        </button>
      </div>
    </div>
  </header>

  <div class="bt-body">
    <!-- Left rail -->
    <aside class="bt-rail">
      <div class="bt-panel">
        <div class="bt-panel__head bt-panel__head--rail">
          <div class="bt-panel__title">
            <i class="bi bi-collection"></i>
            설문 종류
            <span class="bt-mini">총 <b id="surveyMeta"><c:out value="${fn:length(testMst)}"/></b></span>
          </div>
        </div>

        <div class="bt-panel__body bt-panel__body--scroll">
          <!-- ✅ 서버 렌더링: testMst -->
          <div id="surveyList" class="bt-list">
            <c:forEach items="${testMst}" var="t">
              <div class="bt-item"
                   data-test-no="<c:out value='${t.testNo}'/>"
                   data-test-nm="<c:out value='${t.testNm}'/>"
                   data-test-desc="<c:out value='${t.testDesc}'/>">
                <div class="bt-item__left">
                  <div class="bt-item__title"><c:out value="${t.testNm}"/></div>
                  <div class="bt-item__sub"><c:out value="${t.testDesc}"/></div>
                </div>
                <div class="bt-item__right">
                  <button type="button" class="bt-btn bt-btn--ghost bt-btn--sm">
                    <i class="bi bi-check2"></i><span>선택</span>
                  </button>
                </div>
              </div>
            </c:forEach>
          </div>

          <!-- empty -->
          <c:choose>
            <c:when test="${empty testMst}">
              <div id="surveyEmpty" class="bt-empty">
                <div class="bt-empty__title">설문 종류가 없습니다</div>
                <div class="bt-empty__desc">관리 화면에서 설문을 먼저 등록해주세요.</div>
              </div>
            </c:when>
            <c:otherwise>
              <div id="surveyEmpty" class="bt-empty is-hidden">
                <div class="bt-empty__title">설문 종류가 없습니다</div>
                <div class="bt-empty__desc">관리 화면에서 설문을 먼저 등록해주세요.</div>
              </div>
            </c:otherwise>
          </c:choose>
        </div>
      </div>
    </aside>

    <!-- Main -->
    <main class="bt-main">
      <div class="bt-panel bt-panel--main">
        <div class="bt-panel__head bt-panel__head--test">
          <div class="bt-headrow">
            <div class="bt-pill" id="selectedPill">
              <i class="bi bi-check2-circle"></i>
              <span class="bt-pill__label">선택된 설문</span>
              <strong id="selectedSurveyTitle" class="bt-pill__value">-</strong>
            </div>

            <div class="bt-target" id="targetPanel">
              <div class="bt-target__label">
                <i class="bi bi-person-badge"></i> 대상자
              </div>

              <div class="bt-target__field">
                <div class="bt-target__pick">
                  <button type="button" class="bt-btn bt-btn--ghost bt-btn--sm" id="btnPickTarget">
                    <i class="bi bi-person-plus"></i><span>대상자 선택</span>
                  </button>

                  <div class="bt-target__chip is-hidden" id="targetChip">
                    <i class="bi bi-person"></i>
                    <span id="targetName">-</span>
                    <button type="button" class="bt-iconbtn bt-iconbtn--sm" id="btnClearTarget" title="대상자 해제">
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bt-panel__body bt-panel__body--main">
          <div class="bt-inner">
            <div class="bt-inner__head">
              <div class="bt-inner__title">
                <i class="bi bi-ui-checks"></i><span>설문 응시</span>
              </div>

              <div class="bt-inner__actions">
                <button type="button" class="bt-btn bt-btn--sm" id="btnCollapseAll" disabled>
                  <i class="bi bi-arrows-collapse"></i><span>모두 접기</span>
                </button>
                <button type="button" class="bt-btn bt-btn--sm" id="btnExpandAll" disabled>
                  <i class="bi bi-arrows-expand"></i><span>모두 펼치기</span>
                </button>
              </div>
            </div>

            <div class="bt-inner__body" id="innerBody">
              <!-- Center gate -->
              <div class="bt-center" id="centerGate">
                <div class="bt-gate">
                  <div class="bt-gate__head">
                    <i class="bi bi-clipboard-check"></i>
                    <div>
                      <div class="bt-gate__title">진행을 위해 선택이 필요합니다</div>
                      <div class="bt-gate__sub" id="gateSub">타인 테스트는 설문 + 대상자 선택이 필요합니다.</div>
                    </div>
                  </div>

                  <div class="bt-gate__grid">
                    <div class="bt-gateCard">
                      <div class="bt-gateCard__label">선택한 설문</div>
                      <div class="bt-gateCard__value" id="gateSurvey">-</div>
                      <div class="bt-gateCard__hint">좌측 설문 종류에서 선택하세요.</div>
                    </div>

                    <div class="bt-gateCard" id="gateTargetCard">
                      <div class="bt-gateCard__label">선택한 대상자</div>
                      <div class="bt-gateCard__value" id="gateTarget">-</div>
                      <div class="bt-gateCard__hint">대상자를 선택하세요.</div>
                    </div>
                  </div>

                  <div class="bt-gate__foot">
                    <button type="button" class="bt-btn bt-btn--primary" id="btnStartCenter" disabled>
                      <i class="bi bi-play-circle"></i><span>설문 시작</span>
                    </button>
                    <div class="bt-gate__note" id="gateNote"></div>
                  </div>
                </div>
              </div>

              <!-- Viewer -->
              <div class="bt-viewer is-hidden" id="viewer">
                <div class="bt-guide" id="viewerGuide">
                  <i class="bi bi-info-circle"></i>
                  <span>설문 진행 방식 : 대상자는 회사에서 보통 어떻게 행동하는가</span>
                </div>

                <!-- JS 참조용 숨김 -->
                <div class="is-hidden">
                  <div class="bt-viewer__meta">
                    <div class="bt-badge">
                      <i class="bi bi-clipboard-data"></i>
                      <span>설문:</span>
                      <b id="viewerTestName">-</b>
                    </div>
                    <div class="bt-badge" id="viewerTargetBadge">
                      <i class="bi bi-person"></i>
                      <span>대상자:</span>
                      <b id="viewerTargetName">-</b>
                    </div>
                  </div>

                  <div class="bt-resultBox">
                    <div class="bt-resultBox__title">
                      <i class="bi bi-calculator"></i> 결과 계산(임시)
                    </div>
                    <div class="bt-resultBox__body" id="resultArea">
                      설문 진행 중 선택 점수를 바탕으로 결과를 계산할 영역입니다.
                    </div>
                  </div>
                </div>

                <div class="bt-paper" id="paper"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- 대상자 선택 모달 -->
  <div class="bt-modal" id="targetModal" aria-hidden="true">
    <div class="bt-modal__backdrop" data-close="true"></div>
    <div class="bt-modal__card" role="dialog" aria-modal="true" aria-labelledby="targetModalTitle">
      <div class="bt-modal__head">
        <div class="bt-modal__title" id="targetModalTitle">
          <i class="bi bi-person-lines-fill"></i> 대상자 선택
        </div>
        <button type="button" class="bt-iconbtn" data-close="true" title="닫기">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="bt-modal__body">
        <!-- ✅ 대상자 목록은 "대상자 선택" 클릭 시 비동기로 로드하여 렌더링 -->
        <div class="bt-modal__list" id="targetList"></div>

        <!-- empty (JS가 표시/숨김 처리) -->
        <div class="bt-empty is-hidden" id="targetEmpty">
          <div class="bt-empty__title">대상자가 없습니다</div>
          <div class="bt-empty__desc">검색 조건을 바꿔보세요.</div>
        </div>
      </div>

      <div class="bt-modal__foot">
        <button type="button" class="bt-btn" data-close="true">
          <i class="bi bi-x-circle"></i><span>닫기</span>
        </button>
      </div>
    </div>
  </div>

  <!-- ✅ 셀프테스트 결과 모달(test 전용) -->
  <div id="selfResultModal" class="st-modal" aria-hidden="true">
    <div class="st-modal__backdrop" data-st-close="true"></div>

    <div class="st-modal__card" role="dialog" aria-modal="true" aria-labelledby="selfResultTitle">
      <div class="st-modal__head">
        <h3 id="selfResultTitle" class="st-modal__title">셀프 테스트 결과</h3>
        <button type="button" class="st-iconbtn" data-st-close="true" aria-label="닫기" title="닫기">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <!-- ✅ 여기만 스크롤 -->
      <div class="st-modal__body" id="selfResultBody"></div>

      <div class="st-modal__foot">
        <button type="button" class="bt-btn" data-st-close="true">
          <i class="bi bi-x-circle"></i><span>닫기</span>
        </button>
      </div>
    </div>
  </div>

  
</div>

<script defer src="${pageContext.request.contextPath}/js/behavior/behaviorTest.js"></script>
