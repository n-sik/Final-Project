<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="jakarta.tags.core" prefix="c"%>
<%@ taglib uri="jakarta.tags.functions" prefix="fn"%>

<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>기안작성</title>
  <link rel="stylesheet" href="${pageContext.request.contextPath}/css/aprv/aprvForm.css">
</head>

<body>
<div class="aprv-form-page">
  <div class="aprv-container">

    <!-- 상단 헤더 -->
    <header class="aprv-top" aria-label="전자결재 상단">
      <div class="aprv-top-left">
        <h2 class="aprv-top-title">전자결재</h2>
        <p class="aprv-top-sub">기안작성</p>
      </div>

      <div class="aprv-top-right">
        <a class="aprv-btn" href="${pageContext.request.contextPath}/aprv/readList?box=mine">내 문서함</a>
      </div>
    </header>

<form class="aprv-form"
          action="${pageContext.request.contextPath}/aprv/create"
          method="post">

      <!-- 버튼이 actionType을 세팅 -->
      <input type="hidden" name="actionType" value="TEMP_SAVE">
      <input type="hidden" name="formCd" value="${empty formCd ? 'LEAVE' : formCd}">
      <input type="hidden" name="prevFormCd" value="${empty formCd ? 'LEAVE' : formCd}">

      <!-- 기본값/디폴트 세팅용 -->
      <input type="hidden" id="loginDeptCd" value="${loginEmp.deptCd}">
      <input type="hidden" id="defaultApprover1" value="${defaultApprover1}">
      <input type="hidden" id="defaultApprover2" value="${defaultApprover2}">

      <div class="aprv-form-grid" aria-label="기안작성 본문(4컬럼)">
        <!-- 1열: 기본정보 + 액션 -->
        <div class="aprv-col aprv-col--left">

          <!-- 문서 기본정보 -->
                  <div class="aprv-card aprv-card--basic">
                    <div class="aprv-card__head">
                      <h3 class="aprv-card__title">기본 정보</h3>
                    </div>

                    <div class="aprv-card__body aprv-card__body--scroll">

                    <div class="aprv-field">
                      <label class="aprv-label" for="formCdSelect">양식</label>
                      <%--
                        NOTE:
                        - id 속성이 중복되면 브라우저가 하나를 무시하여 JS 이벤트가 붙지 않습니다.
                        - JS(aprvForm.js)는 #formCdSelect를 기준으로 양식 변경을 처리합니다.
                      --%>
                      <select class="aprv-select" id="formCdSelect" name="formCdSelect">
                        <%-- forms: [{formCd, formNm}] --%>
                        <c:forEach var="f" items="${forms}">
                          <option value="${f.formCd}"
                                  <c:if test="${(empty formCd ? 'LEAVE' : formCd) == f.formCd}">selected</c:if>>
                            ${empty f.formNm ? f.formCd : f.formNm}
                          </option>
                        </c:forEach>
                      </select>
                      <p class="aprv-help">* 양식 변경 시 우측 입력내용이 초기화됩니다.</p>
                    </div>

                    <div class="aprv-field aprv-mt-12">
                      <label class="aprv-label" for="aprvTtl">제목</label>
                      <input class="aprv-input" type="text" id="aprvTtl" name="aprvTtl"
                             value="${fn:escapeXml(dto.aprvTtl)}"
                             placeholder="예) 연차 신청 (2/15~2/16)" required>
                    </div>

                    <div class="aprv-field aprv-mt-12">
                      <label class="aprv-label" for="aprvCn">내용</label>
                      <textarea class="aprv-textarea" id="aprvCn" name="aprvCn"
                                placeholder="내용을 입력하세요.">${fn:escapeXml(dto.aprvCn)}</textarea>
                    </div>

                    <!-- 기안 작성자 정보 -->
                    <div class="aprv-drafter aprv-mt-12">
                      <div class="aprv-subtitle">기안 작성자 정보</div>

                      <div class="aprv-grid2 aprv-drafter-grid">
                        <div class="aprv-field">
                          <label class="aprv-label">부서</label>
                          <input class="aprv-input aprv-input--readonly" type="text"
                                 value="${fn:escapeXml(loginEmp.deptNm)}" readonly>
                        </div>

                        <div class="aprv-field">
                          <label class="aprv-label">직위</label>
                          <input class="aprv-input aprv-input--readonly" type="text"
                                 value="${fn:escapeXml(loginEmp.posNm)}" readonly>
                        </div>

                        <div class="aprv-field aprv-field--wide">
                          <label class="aprv-label">작성자</label>
                          <input class="aprv-input aprv-input--readonly" type="text"
                                 value="${fn:escapeXml(loginEmp.empNm)} (${fn:escapeXml(loginEmp.empNo)})" readonly>
                        </div>
                      </div>
                    </div>
                    </div>
                  </div>

          <!-- 액션 버튼 -->
                  <div class="aprv-card aprv-card--actions">
                    <div class="aprv-card__body">
                      <div class="aprv-actions">
                        <button class="aprv-btn" type="button" id="btnTempSave">임시저장</button>
                        <button class="aprv-btn aprv-btn--primary" type="button" id="btnSubmit">상신</button>
                        <a class="aprv-btn aprv-btn--ghost" href="${pageContext.request.contextPath}/aprv/readList?box=mine">목록</a>
                      </div>

                      <p class="aprv-help aprv-mt-10">
                        * 상신 이후 결재라인 변경 불가(잠금) 정책이 적용됩니다.
                      </p>
                    </div>
                  </div>
        </div>

        <!-- 2열: 양식 입력 -->
        <div class="aprv-card aprv-card--fill">
                  <div class="aprv-card__head">
                    <h3 class="aprv-card__title">양식 입력</h3>
                    <div class="aprv-card__meta">
                      <span id="formTitleText">${empty formNm ? '연차/휴가 신청' : formNm}</span>
                    </div>
                  </div>

                  <div class="aprv-card__body aprv-card__body--scroll">

                  <!-- 실제 표시되는 폼 컨테이너 -->
                  <div class="aprv-formhost" id="formHost">
                    <%-- 기본은 LEAVE --%>
                    <div class="aprv-formpane" data-form="LEAVE">
<div class="aprv-grid2">
    <div class="aprv-field">
                          <label class="aprv-label" for="leaveTypeCd">휴가종류</label>
                          <select class="aprv-select" id="leaveTypeCd" name="leave.leaveTypeCd" required>
                            <option value="">선택</option>
                            <c:forEach var="c" items="${leaveTypes}">
                              <option value="${c.code}">${c.name}</option>
                            </c:forEach>
                          </select>
                        </div>
  </div>
  <div class="aprv-grid2">
    <div class="aprv-field">
                          <label class="aprv-label" for="leaveStartDt">시작일</label>
                          <input class="aprv-input" type="date" id="leaveStartDt" name="leave.startDtm" required>
                        </div>
    <div class="aprv-field">
                          <label class="aprv-label" for="leaveEndDt">종료일</label>
                          <input class="aprv-input" type="date" id="leaveEndDt" name="leave.endDtm" required>
                        </div>
    <div class="aprv-field aprv-field--wide">
                          <label class="aprv-label" for="leaveReason">사유</label>
                          <textarea class="aprv-textarea" id="leaveReason" name="leave.reason" required
                                    placeholder="사유를 입력하세요."></textarea>
                        </div>
  </div>
</div>

                    <%-- 나머지 양식들은 숨김 템플릿 --%>
                    <div class="aprv-formpane is-hidden" data-form="LOA">
<div class="aprv-grid2">
    <div class="aprv-field">
                          <label class="aprv-label" for="loaTypeCd">휴직종류</label>
                          <select class="aprv-select" id="loaTypeCd" name="loa.loaTypeCd" required>
                            <option value="">선택</option>
                            <c:forEach var="c" items="${loaTypes}">
                              <option value="${c.code}">${c.name}</option>
                            </c:forEach>
                          </select>
                        </div>
  </div>
  <div class="aprv-grid2">
    <div class="aprv-field">
                          <label class="aprv-label" for="loaStartDt">시작일</label>
                          <input class="aprv-input" type="date" id="loaStartDt" name="loa.startDtm" required>
                        </div>
    <div class="aprv-field">
                          <label class="aprv-label" for="loaEndDt">종료일</label>
                          <input class="aprv-input" type="date" id="loaEndDt" name="loa.endDtm" required>
                        </div>
    <div class="aprv-field aprv-field--wide">
                          <label class="aprv-label" for="loaReason">사유</label>
                          <textarea class="aprv-textarea" id="loaReason" name="loa.reason" required
                                    placeholder="사유를 입력하세요."></textarea>
                        </div>
  </div>
</div>

                    <%-- 승진 폼 --%>
                    <div class="aprv-formpane is-hidden" data-form="PROMOTION">
                      <div class="aprv-grid2">
                        <div class="aprv-field">
                          <label class="aprv-label" for="promoDeptSelect">대상자 부서</label>
                          <select class="aprv-select" id="promoDeptSelect">
                            <option value="">- 선택 -</option>
                            <c:forEach var="d" items="${deptCodes}">
                              <option value="${d.code}">${d.name}</option>
                            </c:forEach>
                          </select>
                        </div>

                        <div class="aprv-field">
        					<label class="aprv-label" for="promoPosSelect">대상자 현 직위</label>
        					<select class="aprv-select" id="promoPosSelect" disabled>
                            <option value="">- 선택 -</option>
                            <c:forEach var="p" items="${posCodes}">
                              <option value="${p.code}">${p.name}</option>
                            </c:forEach>
                          </select>
                        </div>

                        <div class="aprv-field aprv-field--wide">
                          <label class="aprv-label" for="promoEmpSelect">대상자 이름</label>
                          <select class="aprv-select" id="promoEmpSelect" name="promotion.targetEmpNo" required>
                            <option value="">- 선택 -</option>
                            <c:forEach var="r" items="${refCandidates}">
                              <option value="${r.empNo}" data-dept-cd="${r.deptCd}" data-pos-cd="${r.posCd}">
                                ${r.deptNm} ${r.posNm} ${r.empNm} (${r.empNo})
                              </option>
                            </c:forEach>
                          </select>
                        </div>

                        <div class="aprv-field">
                          <label class="aprv-label">승진 대상 직위</label>
                          <select class="aprv-select" name="promotion.targetPosCd" required>
                            <option value="">- 선택 -</option>
                            <c:forEach var="p" items="${posCodes}">
                              <option value="${p.code}">${p.name}</option>
                            </c:forEach>
                          </select>
                        </div>

                        <div class="aprv-field">
                          <label class="aprv-label">발효일</label>
                          <input class="aprv-input" type="date" name="promotion.effectiveDtm" required>
                        </div>

                        <div class="aprv-field aprv-field--wide">
                          <label class="aprv-label">사유</label>
                          <textarea class="aprv-textarea" name="promotion.reason" placeholder="승진 사유를 입력하세요." required></textarea>
                        </div>
                      </div>
                    </div>

                    <%-- 발령 폼 --%>
        			<div class="aprv-formpane is-hidden" data-form="APPOINTMENT">
<div class="aprv-grid2">
      <div class="aprv-field">
        			      <label class="aprv-label" for="apptDeptSelect">대상자 부서</label>
        			      <select class="aprv-select" id="apptDeptSelect" name="appointment.befDeptCd" required>
        			        <option value="">- 선택 -</option>
        			        <c:forEach var="d" items="${deptCodes}">
        			          <option value="${d.code}">${d.name}</option>
        			        </c:forEach>
        			      </select>
        			    </div>
      <div class="aprv-field">
        			      <label class="aprv-label" for="apptCurPosSelect">대상자 직위</label>
        			      <select class="aprv-select" id="apptCurPosSelect" disabled>
        			        <option value="">- 자동 반영 -</option>
        			        <c:forEach var="p" items="${posCodes}">
        			          <option value="${p.code}">${p.name}</option>
        			        </c:forEach>
        			      </select>
        			      <input type="hidden" name="appointment.befPosCd" id="apptCurPosHidden">
        			    </div>
      <div class="aprv-field aprv-field--wide">
        			      <label class="aprv-label" for="apptEmpSelect">대상자 이름</label>
        			      <select class="aprv-select" id="apptEmpSelect" name="appointment.targetEmpNo" required>
        			        <option value="">- 선택 -</option>
        			        <c:forEach var="r" items="${refCandidates}">
        			          <option value="${r.empNo}"
        			                  data-dept-cd="${r.deptCd}"
        			                  data-pos-cd="${r.posCd}">
        			            ${r.deptNm} ${r.posNm} ${r.empNm} (${r.empNo})
        			          </option>
        			        </c:forEach>
        			      </select>
        			    </div>
      <div class="aprv-field">
        			      <label class="aprv-label">변경 후 부서</label>
        			      <select class="aprv-select" name="appointment.aftDeptCd" required>
        			        <option value="">- 선택 -</option>
        			        <c:forEach var="d" items="${deptCodes}">
        			          <option value="${d.code}">${d.name}</option>
        			        </c:forEach>
        			      </select>
        			    </div>
      <div class="aprv-field">
        			      <label class="aprv-label">발효일</label>
        			      <input class="aprv-input" type="date" name="appointment.effectiveDt" required>
        			    </div>
      <div class="aprv-field aprv-field--wide">
        			      <label class="aprv-label">사유</label>
        			      <textarea class="aprv-textarea" name="appointment.reason" placeholder="발령 사유를 입력하세요." required></textarea>
        			    </div>
    </div>
</div>
			
			
        			<%-- 인력요청 폼 --%>
                    <div class="aprv-formpane is-hidden" data-form="HEADCOUNT">
                      <div class="aprv-field">
                        <label class="aprv-label">요청 부서</label>
                        <select class="aprv-select" name="headcount.reqDeptCd">
                          <c:forEach var="d" items="${deptCodes}">
                            <option value="${d.code}">${d.name}</option>
                          </c:forEach>
                        </select>
                      </div>

                      <div class="aprv-field aprv-mt-12">
                        <label class="aprv-label">요청 인원</label>
                        <input class="aprv-input" type="number" min="1" name="headcount.reqCnt">
                      </div>

                      <div class="aprv-field aprv-mt-12">
                        <label class="aprv-label">희망일</label>
                        <input class="aprv-input" type="date" name="headcount.hopeDt">
                      </div>

                      <div class="aprv-field aprv-mt-12">
                        <label class="aprv-label">사유</label>
                        <textarea class="aprv-textarea" name="headcount.reason" placeholder="요청 사유를 입력하세요."></textarea>
                      </div>
                    </div>

                    <%-- 퇴직 폼(본인 신청) --%>
                    <div class="aprv-formpane is-hidden" data-form="RETIRE">
                      <div class="aprv-grid2">
                        <div class="aprv-field">
                          <label class="aprv-label">퇴직 예정일</label>
                          <input class="aprv-input" type="date" name="retire.expRetrDt" required>
                        </div>

                        <div class="aprv-field aprv-field--wide">
                          <label class="aprv-label">사유</label>
                          <textarea class="aprv-textarea" name="retire.retrRsn" placeholder="퇴직 사유를 입력하세요." required></textarea>
                        </div>
                      </div>
                    </div>

                  </div>
                  </div>
                </div>
        <!-- 3열: 수신/참조 -->
        <!-- 수신/참조 -->
                <div class="aprv-card aprv-card--fill">
                  <div class="aprv-card__head">
                    <h3 class="aprv-card__title">수신/참조</h3>
                  </div>

                  <div class="aprv-card__body aprv-card__body--scroll">

                  <div class="aprv-field">
                    <div class="aprv-grid2">
                        <div class="aprv-field">
                            <label class="aprv-label" for="refDeptSelect">부서 선택</label>
                    <select class="aprv-select" id="refDeptSelect">
                      <option value="">- 부서 선택 -</option>
                    </select>
                        </div>
                        <div class="aprv-field">
                            <label class="aprv-label" for="refSearch">검색 (부서/직위/이름/사번)</label>
                    <input class="aprv-input" type="text" id="refSearch" placeholder="예) 홍길동 / 20250001">
                        </div>
                    </div>
<label class="aprv-label" for="refCandidateEmpNos">대상자 목록</label>
                    <%-- refs: [{empNo, empNm, deptNm}] --%>
                    <select class="aprv-select" id="refCandidateEmpNos" multiple size="7">
                      <c:forEach var="r" items="${refCandidates}">
                        <option value="${r.empNo}" data-dept-cd="${r.deptCd}" data-dept-nm="${r.deptNm}">
                          ${r.deptNm} ${r.posNm} ${r.empNm} (${r.empNo})
                        </option>
                      </c:forEach>
                    </select>

                    <div class="aprv-actions aprv-mt-10" style="justify-content:flex-start; gap:8px;">
                      <button class="aprv-btn" type="button" id="btnAddRcv">수신 추가</button>
                      <button class="aprv-btn" type="button" id="btnAddRef">참조 추가</button>
                    </div>

                    <div class="aprv-field aprv-mt-10">
                            <label class="aprv-label" for="rcvEmpNos">수신자</label>
                      <select class="aprv-select" id="rcvEmpNos" name="rcvEmpNoList" multiple size="4"></select>
                      <div class="aprv-actions aprv-mt-10" style="justify-content:flex-start;">
                        <button class="aprv-btn aprv-btn--ghost" type="button" id="btnRemoveRcv">수신자 제거</button>
                      </div>
                    </div>

                    <div class="aprv-field aprv-mt-10">
                            <label class="aprv-label" for="refEmpNos">참조자</label>
                      <select class="aprv-select" id="refEmpNos" name="refEmpNoList" multiple size="4"></select>
                      <div class="aprv-actions aprv-mt-10" style="justify-content:flex-start;">
                        <button class="aprv-btn aprv-btn--ghost" type="button" id="btnRemoveRef">참조자 제거</button>
                      </div>
</div>
                  </div>
                  </div>
                </div>
        <!-- 4열: 결재 라인 -->
        <!-- 결재라인 -->
                <div class="aprv-card aprv-card--fill">
                  <div class="aprv-card__head">
                    <h3 class="aprv-card__title">결재 라인</h3>
                  </div>

                  <div class="aprv-card__body aprv-card__body--scroll">

                  <div class="aprv-field">
                    <label class="aprv-label" for="approverPicker">결재자 추가(순서대로)</label>

                    <div class="aprv-approver-picker">
                      <select class="aprv-select" id="approverPicker">
                        <option value="">- 선택 -</option>
                        <c:forEach var="e" items="${approverCandidates}">
                          <option value="${e.empNo}">${e.deptNm} ${e.posNm} ${e.empNm} (${e.empNo})</option>
                        </c:forEach>
                      </select>

                      <div class="aprv-approver-picker__actions">
                        <button class="aprv-btn" type="button" id="btnAddApprover">추가</button>
                        <button class="aprv-btn aprv-btn--ghost" type="button" id="btnClearApprovers">초기화</button>
                      </div>
                    </div>

                    <p class="aprv-help">* 상신 시 결재라인이 확정됩니다.</p>
                  </div>

                  <div class="aprv-linebox aprv-mt-10" id="approverList"></div>
                  <div id="approverHidden"></div>
                  </div>
                </div>
      </div>
    </form>

  </div>
</div>

<script defer src="${pageContext.request.contextPath}/js/aprv/aprvForm.js"></script>

</body>
</html>
