<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>

<link rel="stylesheet" href="${pageContext.request.contextPath}/css/behavior/set.css">
<meta name="ctx" content="${pageContext.request.contextPath}">

<div class="bs">
  <!-- Topbar -->
  <header class="bs-topbar">
    <div class="bs-topbar__left">
      <div class="bs-brand">
        <div class="bs-brand__title">BehaviorSet</div>
        <div class="bs-brand__sub">검사종류 · 문항 · 결과 관리</div>
      </div>
    </div>

    <div class="bs-topbar__right">
      <div class="bs-pill" id="selectedPill">
        <i class="bi bi-check2-circle"></i>
        <span class="bs-pill__label">선택된 검사</span>
        <strong id="selectedSurveyTitle" class="bs-pill__value">-</strong>

        <span id="selectedMeta" class="bs-pill__meta">
          <span id="badgeSections" class="bs-chip bs-chip--primary">문항 0</span>
        </span>
      </div>

      <div class="bs-actions">
        <button type="button" class="bs-btn bs-btn--primary" id="btnSave" disabled>
          <i class="bi bi-cloud-arrow-up"></i><span>저장</span>
        </button>
      </div>
    </div>
  </header>

  <div class="bs-body">
    <!-- Left rail -->
    <aside class="bs-rail">
      <div class="bs-panel">
        <div class="bs-panel__head bs-panel__head--rail">
          <div class="bs-panel__title">
            <!-- ✅ 2번 영역: 아이콘 추가 -->
            <i class="bi bi-collection"></i>
            검사 종류
            <span class="bs-mini">총 <b id="surveyMeta">0</b></span>
          </div>

          <div class="bs-panel__head-actions">
            <button type="button" class="bs-btn bs-btn--ghost" id="btnAddSurvey">
              <i class="bi bi-plus-lg"></i><span>검사 추가</span>
            </button>
          </div>

          <div class="bs-search bs-search--hidden">
            <i class="bi bi-search bs-search__icon"></i>
            <input id="surveySearch" class="bs-search__input" type="text" placeholder="검사 검색" />
            <button id="btnClearSurveySearch" class="bs-search__clear" type="button" title="검색 지우기">
              <i class="bi bi-x-circle"></i>
            </button>
          </div>
        </div>

        <div class="bs-panel__body">
          <div id="surveyList" class="bs-list"></div>

          <div id="surveyEmpty" class="bs-empty">
            <div class="bs-empty__title">검사 종류가 없습니다</div>
            <div class="bs-empty__desc">우측 상단 “검사 추가”로 새 검사를 만들 수 있어요.</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main -->
    <main class="bs-main">
      <div class="bs-panel bs-panel--main">
        <div class="bs-panel__head bs-panel__head--tabs">
          <div class="bs-tabs">
            <button type="button" class="tab-btn bs-tab active" data-tab="qna">
              <i class="bi bi-ui-checks"></i><span>문항/항목</span>
            </button>
            <button type="button" class="tab-btn bs-tab" data-tab="result">
              <i class="bi bi-clipboard-data"></i><span>결과</span>
            </button>
          </div>
        </div>

        <div class="bs-panel__body bs-panel__body--main">
          <!-- QNA -->
          <section id="tabQna" class="tab-panel active">
            <div class="bs-grid2wide">
              <section class="bs-card">
                <div class="bs-card__head">
                  <div class="bs-card__title">
                    <i class="bi bi-list-ul"></i> 문항
                  </div>
                  <button type="button" class="bs-btn bs-btn--ghost" id="btnAddSection" disabled>
                    <i class="bi bi-plus-circle"></i> 문항 추가
                  </button>
                </div>

                <div class="bs-card__body">
                  <div id="sectionList" class="bs-list"></div>

                  <div id="sectionEmpty" class="bs-empty">
                    <div class="bs-empty__title">검사를 선택해주세요</div>
                    <div class="bs-empty__desc">좌측에서 검사 종류를 선택하면 문항 목록이 표시됩니다.</div>
                  </div>
                </div>
              </section>

              <section class="bs-card">
                <div class="bs-card__head">
                  <!-- ✅ 5번 영역: JS가 innerHTML로 아이콘+칩 렌더할 것 -->
                  <div class="bs-card__title bs-title-meta" id="questionTitle">
                    <i class="bi bi-question-circle"></i><span>문항 항목</span>
                  </div>
                  <button type="button" class="bs-btn bs-btn--ghost" id="btnAddQuestion" disabled>
                    <i class="bi bi-plus-circle"></i> 항목 추가
                  </button>
                </div>

                <div class="bs-card__body">
                  <div id="questionList" class="bs-list"></div>

                  <div id="questionEmpty" class="bs-empty">
                    <div class="bs-empty__title">문항을 선택해주세요</div>
                    <div class="bs-empty__desc">좌측 문항을 선택하면 항목(질문) 목록이 표시됩니다.</div>
                  </div>
                </div>
              </section>
            </div>
          </section>

          <!-- RESULT -->
          <section id="tabResult" class="tab-panel">
            <div class="bs-grid2">
              <section class="bs-card">
                <div class="bs-card__head">
                  <div class="bs-card__title">
                    <i class="bi bi-diagram-3"></i> 결과 항목
                  </div>
                  <button type="button" class="bs-btn bs-btn--ghost" id="btnAddResult" disabled>
                    <i class="bi bi-plus-circle"></i> 결과 추가
                  </button>
                </div>

                <div class="bs-card__body">
                  <div id="resultList" class="bs-list"></div>

                  <div id="resultEmpty" class="bs-empty">
                    <div class="bs-empty__title">검사를 선택해주세요</div>
                    <div class="bs-empty__desc">좌측에서 검사 종류를 선택하면 결과 항목이 표시됩니다.</div>
                  </div>
                </div>
              </section>

              <section class="bs-card">
                <div class="bs-card__head">
                  <!-- ✅ 결과탭도 동일하게: 아이콘+칩을 JS에서 렌더 -->
                  <div class="bs-card__title bs-title-meta" id="resultTitle">
                    <i class="bi bi-card-text"></i><span>결과 내용</span>
                  </div>

                  <div class="bs-card__actions">
                    <button type="button" class="bs-btn bs-btn--ghost" id="btnEditResult" disabled>
                      <i class="bi bi-gear"></i> 내용 편집
                    </button>
                    <button type="button" class="bs-btn" id="btnResultCancelHead">
                      <i class="bi bi-x-lg"></i> 취소
                    </button>
                    <button type="button" class="bs-btn bs-btn--primary" id="btnResultOkHead">
                      <i class="bi bi-check-lg"></i> 적용
                    </button>
                  </div>
                </div>

                <div class="bs-card__body bs-card__body--detail">
                  <div id="resultDetail" class="bs-detail">
                    <div class="bs-empty">
                      <div class="bs-empty__title">결과를 선택해주세요.</div>
                      <div class="bs-empty__desc">좌측 목록에서 결과 항목을 클릭하세요.</div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</div>

<script defer src="${pageContext.request.contextPath}/js/behavior/behaviorSet.js"></script>
