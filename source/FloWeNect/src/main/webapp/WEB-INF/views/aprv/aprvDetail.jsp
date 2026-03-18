<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="jakarta.tags.core" prefix="c"%>
<%@ taglib uri="jakarta.tags.functions" prefix="fn"%>
<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags"%>
<c:set var="ctx" value="${pageContext.request.contextPath}"/>

<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>전자결재 상세</title>
  <link rel="stylesheet" href="${ctx}/css/aprv/aprvDetail.css">
</head>
<body>

<div class="aprv-detail-page" data-ctx="${ctx}">
  <div class="aprv-container">

    <header class="aprv-top" aria-label="전자결재 상세 상단">
      <div class="aprv-top-left">
        <h2 class="aprv-top-title">전자결재 상세</h2>
        <p class="aprv-top-sub">문서번호 ${doc.aprvNo} · ${fn:escapeXml(doc.statNm)}</p>
      </div>

      <div class="aprv-top-right">
        <a class="aprv-btn aprv-btn--ghost" href="${ctx}/aprv/readList?box=mine">내 문서</a>
        <sec:authorize access="hasRole('LEADER')">
          <a class="aprv-btn aprv-btn--ghost" href="${ctx}/aprv/pendingList?box=pending">대기</a>
          <a class="aprv-btn aprv-btn--ghost" href="${ctx}/aprv/processedList?box=processed">처리</a>
        </sec:authorize>
        <a class="aprv-btn aprv-btn--ghost" href="${ctx}/aprv/docView?aprvNo=${doc.aprvNo}" target="_blank" rel="noopener">문서보기</a>
        <button type="button" class="aprv-btn" id="aprvBackBtn">목록으로</button>
      </div>
    </header>

    <section class="aprv-guide" aria-label="페이지 안내">
      <div class="aprv-guide-left">
        <h3 class="aprv-guide-title">상세 안내</h3>
        <p class="aprv-guide-desc">문서 정보, 양식 상세, 결재선, 수신/참조 내역을 확인하고 내 차례인 경우 승인 또는 반려를 처리할 수 있습니다.</p>
      </div>
      <div class="aprv-guide-right">
        <span class="aprv-guide-pill">양식: ${fn:escapeXml(doc.formCd)}</span>
        <span class="aprv-guide-pill is-tip">상태: ${fn:escapeXml(doc.statNm)}</span>
      </div>
    </section>

    <div class="aprv-detail-body">

      <div class="aprv-col">

        <section class="aprv-card">
          <div class="aprv-card__head">
            <h3 class="aprv-card__title">문서 기본 정보</h3>
            <c:choose>
              <c:when test="${doc.statCd == 'APPROVED'}">
                <span class="aprv-badge aprv-badge--approved">승인완료</span>
              </c:when>
              <c:when test="${doc.statCd == 'REJECTED'}">
                <span class="aprv-badge aprv-badge--rejected">반려</span>
              </c:when>
              <c:otherwise>
                <span class="aprv-badge aprv-badge--wait">${fn:escapeXml(doc.statNm)}</span>
              </c:otherwise>
            </c:choose>
          </div>
          <div class="aprv-card__body">
            <div class="aprv-kv">
              <div class="aprv-kv__k">문서번호</div>
              <div class="aprv-kv__v">${doc.aprvNo}</div>

              <div class="aprv-kv__k">제목</div>
              <div class="aprv-kv__v">${fn:escapeXml(doc.aprvTtl)}</div>

              <div class="aprv-kv__k">기안자</div>
              <div class="aprv-kv__v">${fn:escapeXml(doc.empNm)} (${doc.empNo})</div>

              <div class="aprv-kv__k">기안부서</div>
              <div class="aprv-kv__v">${fn:escapeXml(doc.deptNm)}</div>

              <div class="aprv-kv__k">기안직위</div>
              <div class="aprv-kv__v">${fn:escapeXml(doc.posNm)}</div>

              <div class="aprv-kv__k">기안일시</div>
              <div class="aprv-kv__v">
                <c:choose>
                  <c:when test="${doc.submitDtm != null}">${fn:replace(doc.submitDtm, 'T', ' ')}</c:when>
                  <c:otherwise><span class="aprv-muted">-</span></c:otherwise>
                </c:choose>
              </div>

              <div class="aprv-kv__k">최종처리일시</div>
              <div class="aprv-kv__v">
                <c:choose>
                  <c:when test="${doc.finalDtm != null}">${fn:replace(doc.finalDtm, 'T', ' ')}</c:when>
                  <c:otherwise><span class="aprv-muted">-</span></c:otherwise>
                </c:choose>
              </div>

            </div>
          </div>
        </section>

        <section class="aprv-card aprv-card--grow">
          <div class="aprv-tabs" aria-label="상세 탭">
            <button type="button" class="aprv-dtab is-active" data-tab="tab-doc">본문</button>
            <button type="button" class="aprv-dtab" data-tab="tab-form">양식 상세</button>
            <button type="button" class="aprv-dtab" data-tab="tab-line">결재선</button>
            <button type="button" class="aprv-dtab" data-tab="tab-file">수신/참조</button>
          </div>

          <div class="aprv-col-scroll">
            <div class="aprv-card__body aprv-tabpanel is-active" id="tab-doc">
              <div class="aprv-section">
                <h4 class="aprv-section__ttl">내용</h4>
                <div class="aprv-textblock">
                  <c:choose>
                    <c:when test="${not empty doc.aprvCn}">${fn:escapeXml(doc.aprvCn)}</c:when>
                    <c:otherwise><span class="aprv-muted">내용이 없습니다.</span></c:otherwise>
                  </c:choose>
                </div>
              </div>
            </div>

            <div class="aprv-card__body aprv-tabpanel" id="tab-form">
              <c:choose>
                <c:when test="${leave != null}">
                  <div class="aprv-kv">
                    <div class="aprv-kv__k">휴가종류</div>
                    <div class="aprv-kv__v">
                      <c:choose>
                        <c:when test="${leaveTypeMap[leave.leaveTypeCd] != null}">${fn:escapeXml(leaveTypeMap[leave.leaveTypeCd])}</c:when>
                        <c:otherwise>${fn:escapeXml(leave.leaveTypeCd)}</c:otherwise>
                      </c:choose>
                    </div>
                    <div class="aprv-kv__k">시작일</div>
                    <div class="aprv-kv__v">${leave.startDtm}</div>
                    <div class="aprv-kv__k">종료일</div>
                    <div class="aprv-kv__v">${leave.endDtm}</div>
                    <div class="aprv-kv__k">사유</div>
                    <div class="aprv-kv__v aprv-textblock">${fn:escapeXml(leave.reason)}</div>
                  </div>
                </c:when>

                <c:when test="${loa != null}">
                  <div class="aprv-kv">
                    <div class="aprv-kv__k">휴직종류</div>
                    <div class="aprv-kv__v">
                      <c:choose>
                        <c:when test="${loaTypeMap[loa.loaTypeCd] != null}">${fn:escapeXml(loaTypeMap[loa.loaTypeCd])}</c:when>
                        <c:otherwise>${fn:escapeXml(loa.loaTypeCd)}</c:otherwise>
                      </c:choose>
                    </div>
                    <div class="aprv-kv__k">시작일</div>
                    <div class="aprv-kv__v">${loa.startDtm}</div>
                    <div class="aprv-kv__k">종료일</div>
                    <div class="aprv-kv__v">${loa.endDtm}</div>
                    <div class="aprv-kv__k">사유</div>
                    <div class="aprv-kv__v aprv-textblock">${fn:escapeXml(loa.reason)}</div>
                  </div>
                </c:when>

                <c:when test="${promotion != null}">
                  <div class="aprv-kv">
                    <div class="aprv-kv__k">대상사원</div>
                    <div class="aprv-kv__v">
                      <c:choose>
                        <c:when test="${promotionTargetEmp != null}">
                          ${fn:escapeXml(promotionTargetEmp.empNm)} (${promotion.targetEmpNo}) / ${fn:escapeXml(promotionTargetEmp.deptNm)} / ${fn:escapeXml(promotionTargetEmp.posNm)}
                        </c:when>
                        <c:otherwise>${promotion.targetEmpNo}</c:otherwise>
                      </c:choose>
                    </div>
                    <div class="aprv-kv__k">승진직위</div>
                    <div class="aprv-kv__v">
                      <c:choose>
                        <c:when test="${posMap[promotion.targetPosCd] != null}">${fn:escapeXml(posMap[promotion.targetPosCd])}</c:when>
                        <c:otherwise>${fn:escapeXml(promotion.targetPosCd)}</c:otherwise>
                      </c:choose>
                    </div>
                    <div class="aprv-kv__k">적용일</div>
                    <div class="aprv-kv__v">${promotion.effectiveDtm}</div>
                    <div class="aprv-kv__k">사유</div>
                    <div class="aprv-kv__v aprv-textblock">${fn:escapeXml(promotion.reason)}</div>
                  </div>
                </c:when>

                <c:when test="${appointment != null}">
                  <div class="aprv-kv">
                    <div class="aprv-kv__k">대상사원</div>
                    <div class="aprv-kv__v">
                      <c:choose>
                        <c:when test="${appointmentTargetEmp != null}">
                          ${fn:escapeXml(appointmentTargetEmp.empNm)} (${appointment.targetEmpNo}) / ${fn:escapeXml(appointmentTargetEmp.deptNm)} / ${fn:escapeXml(appointmentTargetEmp.posNm)}
                        </c:when>
                        <c:otherwise>${appointment.targetEmpNo}</c:otherwise>
                      </c:choose>
                    </div>
                    <div class="aprv-kv__k">발령구분</div>
                    <div class="aprv-kv__v">${fn:escapeXml(appointment.apptTypeCd)}</div>
                    <div class="aprv-kv__k">적용일</div>
                    <div class="aprv-kv__v">${appointment.effectiveDt}</div>
                    <div class="aprv-kv__k">변경 전 부서</div>
                    <div class="aprv-kv__v">
                      <c:choose>
                        <c:when test="${deptMap[appointment.befDeptCd] != null}">${fn:escapeXml(deptMap[appointment.befDeptCd])}</c:when>
                        <c:otherwise>${fn:escapeXml(appointment.befDeptCd)}</c:otherwise>
                      </c:choose>
                    </div>
                    <div class="aprv-kv__k">변경 후 부서</div>
                    <div class="aprv-kv__v">
                      <c:choose>
                        <c:when test="${deptMap[appointment.aftDeptCd] != null}">${fn:escapeXml(deptMap[appointment.aftDeptCd])}</c:when>
                        <c:otherwise>${fn:escapeXml(appointment.aftDeptCd)}</c:otherwise>
                      </c:choose>
                    </div>
                    <div class="aprv-kv__k">변경 전 직위</div>
                    <div class="aprv-kv__v">
                      <c:choose>
                        <c:when test="${posMap[appointment.befPosCd] != null}">${fn:escapeXml(posMap[appointment.befPosCd])}</c:when>
                        <c:otherwise>${fn:escapeXml(appointment.befPosCd)}</c:otherwise>
                      </c:choose>
                    </div>
                    <div class="aprv-kv__k">변경 후 직위</div>
                    <div class="aprv-kv__v">
                      <c:choose>
                        <c:when test="${posMap[appointment.aftPosCd] != null}">${fn:escapeXml(posMap[appointment.aftPosCd])}</c:when>
                        <c:otherwise>${fn:escapeXml(appointment.aftPosCd)}</c:otherwise>
                      </c:choose>
                    </div>
                    <div class="aprv-kv__k">사유</div>
                    <div class="aprv-kv__v aprv-textblock">${fn:escapeXml(appointment.reason)}</div>
                  </div>
                </c:when>

                <c:when test="${headcount != null}">
                  <div class="aprv-kv">
                    <div class="aprv-kv__k">요청부서</div>
                    <div class="aprv-kv__v">
                      <c:choose>
                        <c:when test="${deptMap[headcount.reqDeptCd] != null}">${fn:escapeXml(deptMap[headcount.reqDeptCd])}</c:when>
                        <c:otherwise>${fn:escapeXml(headcount.reqDeptCd)}</c:otherwise>
                      </c:choose>
                    </div>
                    <div class="aprv-kv__k">요청인원</div>
                    <div class="aprv-kv__v">${headcount.reqCnt}</div>
                    <div class="aprv-kv__k">희망일</div>
                    <div class="aprv-kv__v">${headcount.hopeDt}</div>
                    <div class="aprv-kv__k">사유</div>
                    <div class="aprv-kv__v aprv-textblock">${fn:escapeXml(headcount.reason)}</div>
                  </div>
                </c:when>

                <c:when test="${retire != null}">
                  <div class="aprv-kv">
                    <div class="aprv-kv__k">대상사원</div>
                    <div class="aprv-kv__v">
                      <c:choose>
                        <c:when test="${retireTargetEmp != null}">
                          ${fn:escapeXml(retireTargetEmp.empNm)} (${retire.empNo}) / ${fn:escapeXml(retireTargetEmp.deptNm)} / ${fn:escapeXml(retireTargetEmp.posNm)}
                        </c:when>
                        <c:otherwise>${retire.empNo}</c:otherwise>
                      </c:choose>
                    </div>
                    <div class="aprv-kv__k">희망퇴직일</div>
                    <div class="aprv-kv__v">${retire.expRetrDt}</div>
                    <div class="aprv-kv__k">사유</div>
                    <div class="aprv-kv__v aprv-textblock">${fn:escapeXml(retire.retrRsn)}</div>
                  </div>
                </c:when>

                <c:otherwise>
                  <div class="aprv-muted">표시할 양식 상세 정보가 없습니다.</div>
                </c:otherwise>
              </c:choose>
            </div>

            <div class="aprv-card__body aprv-tabpanel" id="tab-line">
              <div class="aprv-table-wrap aprv-table-wrap--compact">
                <table class="aprv-table aprv-table--compact">
                  <thead>
                    <tr>
                      <th style="width:72px;">순서</th>
                      <th>결재자</th>
                      <th>부서</th>
                      <th>직위</th>
                      <th style="width:100px;">상태</th>
                      <th style="width:170px;">처리일시</th>
                      <th style="width:80px;">자산</th>
                    </tr>
                  </thead>
                  <tbody>
                    <c:choose>
                      <c:when test="${not empty lines}">
                        <c:forEach var="line" items="${lines}">
                          <c:set var="hist" value="${assetHistMap[line.lineNo]}"/>
                          <tr>
                            <td>${line.aprvSeq}</td>
                            <td>${fn:escapeXml(line.aprverEmpNm)} (${line.empNo})</td>
                            <td>${fn:escapeXml(line.aprverDeptNm)}</td>
                            <td>${fn:escapeXml(line.aprverPosNm)}</td>
                            <td>
                              <c:choose>
                                <c:when test="${line.statCd == 'APPROVED'}"><span class="aprv-badge aprv-badge--approved">승인</span></c:when>
                                <c:when test="${line.statCd == 'REJECTED'}"><span class="aprv-badge aprv-badge--rejected">반려</span></c:when>
                                <c:otherwise><span class="aprv-badge aprv-badge--wait">대기</span></c:otherwise>
                              </c:choose>
                            </td>
                            <td>
                              <c:choose>
                                <c:when test="${line.aprvDtm != null}">${fn:replace(line.aprvDtm, 'T', ' ')}</c:when>
                                <c:otherwise><span class="aprv-muted">-</span></c:otherwise>
                              </c:choose>
                            </td>
                            <td>
                              <c:choose>
                                <c:when test="${hist != null && not empty hist.assetTypeCd}">
                                  <img class="aprv-asset-thumb"
                                       src="${ctx}/aprv/asset/hist/image?lineNo=${line.lineNo}&assetType=${hist.assetTypeCd}"
                                       alt="결재자산"/>
                                </c:when>
                                <c:otherwise><span class="aprv-muted">-</span></c:otherwise>
                              </c:choose>
                            </td>
                          </tr>
                          <c:if test="${line.statCd == 'REJECTED' && not empty line.rjctRsn}">
                            <tr>
                              <td></td>
                              <td colspan="6" class="aprv-textblock">반려사유: ${fn:escapeXml(line.rjctRsn)}</td>
                            </tr>
                          </c:if>
                        </c:forEach>
                      </c:when>
                      <c:otherwise>
                        <tr>
                          <td colspan="7" class="aprv-empty">결재선이 없습니다.</td>
                        </tr>
                      </c:otherwise>
                    </c:choose>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="aprv-card__body aprv-tabpanel" id="tab-file">
              <div class="aprv-section">
                <h4 class="aprv-section__ttl">수신/참조 상세</h4>
                <div class="aprv-table-wrap aprv-table-wrap--compact">
                  <table class="aprv-table aprv-table--compact">
                    <thead>
                      <tr>
                        <th style="width:100px;">구분</th>
                        <th>사원</th>
                        <th>부서</th>
                        <th>직위</th>
                      </tr>
                    </thead>
                    <tbody>
                      <c:choose>
                        <c:when test="${not empty refs}">
                          <c:forEach var="r" items="${refs}">
                            <tr>
                              <td>
                                <c:choose>
                                  <c:when test="${r.refTypeCd == 'RCV' || r.refTypeCd == 'RECV' || r.refTypeCd == 'TO'}">수신</c:when>
                                  <c:otherwise>참고</c:otherwise>
                                </c:choose>
                              </td>
                              <td>${fn:escapeXml(r.empNm)} (${r.empNo})</td>
                              <td>${fn:escapeXml(r.deptNm)}</td>
                              <td>${fn:escapeXml(r.posNm)}</td>
                            </tr>
                          </c:forEach>
                        </c:when>
                        <c:otherwise>
                          <tr>
                            <td colspan="4" class="aprv-empty">수신/참조 대상자가 없습니다.</td>
                          </tr>
                        </c:otherwise>
                      </c:choose>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div class="aprv-col">
        <section class="aprv-card">
          <div class="aprv-card__head">
            <h3 class="aprv-card__title">결재 처리</h3>
            <span class="aprv-pill">
              <c:choose>
                <c:when test="${isMyTurn}">내 차례</c:when>
                <c:otherwise>조회 전용</c:otherwise>
              </c:choose>
            </span>
          </div>

          <div class="aprv-card__body">
            <div class="aprv-section">
              <h4 class="aprv-section__ttl">결재선 요약</h4>
              <div class="aprv-table-wrap">
                <table class="aprv-table">
                  <thead>
                    <tr>
                      <th style="width:64px;">순서</th>
                      <th>결재자</th>
                      <th style="width:90px;">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    <c:choose>
                      <c:when test="${not empty lines}">
                        <c:forEach var="line" items="${lines}">
                          <tr>
                            <td>${line.aprvSeq}</td>
                            <td>${fn:escapeXml(line.aprverEmpNm)}</td>
                            <td>
                              <c:choose>
                                <c:when test="${line.statCd == 'APPROVED'}">승인</c:when>
                                <c:when test="${line.statCd == 'REJECTED'}">반려</c:when>
                                <c:otherwise>대기</c:otherwise>
                              </c:choose>
                            </td>
                          </tr>
                        </c:forEach>
                      </c:when>
                      <c:otherwise>
                        <tr>
                          <td colspan="3" class="aprv-empty">결재선이 없습니다.</td>
                        </tr>
                      </c:otherwise>
                    </c:choose>
                  </tbody>
                </table>
              </div>
            </div>

            <c:if test="${isMyTurn}">
              <div class="aprv-section">
                <h4 class="aprv-section__ttl">승인 자산 선택</h4>
                <form method="post" action="${ctx}/aprv/modify">
                  <input type="hidden" name="aprvNo" value="${doc.aprvNo}" />
                  <input type="hidden" name="action" value="APPROVE" />

                  <div class="aprv-asset-opt">
                    <label class="aprv-asset-card" for="assetTypeSign">
                      <div class="aprv-asset-card__left">
                        <c:choose>
                          <c:when test="${hasSignAsset && signLatest != null}">
                            <img class="aprv-asset-thumb" src="${ctx}/aprv/asset/image?assetNo=${signLatest.assetNo}" alt="서명" />
                          </c:when>
                          <c:otherwise>
                            <span class="aprv-asset-thumb"></span>
                          </c:otherwise>
                        </c:choose>
                        <div class="aprv-asset-card__meta">
                          <p class="aprv-asset-card__name">서명 (SIGN)</p>
                          <p class="aprv-asset-card__sub">
                            <c:choose>
                              <c:when test="${hasSignAsset && signLatest != null}">${fn:escapeXml(signLatest.assetNm)}</c:when>
                              <c:otherwise>등록된 서명이 없습니다.</c:otherwise>
                            </c:choose>
                          </p>
                        </div>
                      </div>
                      <div class="aprv-asset-card__right">
                        <input type="radio" id="assetTypeSign" name="assetType" value="SIGN" <c:if test="${hasSignAsset}">checked</c:if> <c:if test="${!hasSignAsset}">disabled</c:if> />
                      </div>
                    </label>

                    <label class="aprv-asset-card" for="assetTypeSeal">
                      <div class="aprv-asset-card__left">
                        <c:choose>
                          <c:when test="${hasSealAsset && sealLatest != null}">
                            <img class="aprv-asset-thumb" src="${ctx}/aprv/asset/image?assetNo=${sealLatest.assetNo}" alt="직인" />
                          </c:when>
                          <c:otherwise>
                            <span class="aprv-asset-thumb"></span>
                          </c:otherwise>
                        </c:choose>
                        <div class="aprv-asset-card__meta">
                          <p class="aprv-asset-card__name">직인 (SEAL)</p>
                          <p class="aprv-asset-card__sub">
                            <c:choose>
                              <c:when test="${hasSealAsset && sealLatest != null}">${fn:escapeXml(sealLatest.assetNm)}</c:when>
                              <c:otherwise>등록된 직인이 없습니다.</c:otherwise>
                            </c:choose>
                          </p>
                        </div>
                      </div>
                      <div class="aprv-asset-card__right">
                        <input type="radio" id="assetTypeSeal" name="assetType" value="SEAL" <c:if test="${!hasSignAsset && hasSealAsset}">checked</c:if> <c:if test="${!hasSealAsset}">disabled</c:if> />
                      </div>
                    </label>
                  </div>

                  <p class="aprv-help">승인 시 선택한 최신 서명 또는 직인 자산이 결재선 히스토리에 저장됩니다.</p>
                  <button type="submit" class="aprv-btn aprv-btn--primary">승인</button>
                </form>
              </div>

              <hr class="aprv-hr"/>

              <div class="aprv-section">
                <h4 class="aprv-section__ttl">반려 처리</h4>
                <form method="post" action="${ctx}/aprv/modify">
                  <input type="hidden" name="aprvNo" value="${doc.aprvNo}" />
                  <input type="hidden" name="action" value="REJECT" />
                  <textarea class="aprv-textarea" id="rejectReason" name="rjctRsn" maxlength="500" placeholder="반려 사유를 입력하세요."></textarea>
                  <div class="aprv-counter"><span id="rejectCounter">0</span> / 500</div>
                  <button type="submit" class="aprv-btn aprv-btn--danger">반려</button>
                </form>
              </div>
            </c:if>

            <c:if test="${!isMyTurn}">
              <div class="aprv-section">
                <h4 class="aprv-section__ttl">안내</h4>
                <p class="aprv-help">현재 로그인 사용자는 이 문서를 결재 처리할 차례가 아닙니다. 문서 내용과 결재 진행 상태만 확인할 수 있습니다.</p>
              </div>
            </c:if>

            <c:if test="${canCancel}">
              <hr class="aprv-hr"/>
              <div class="aprv-section">
                <h4 class="aprv-section__ttl">문서 취소</h4>
                <form method="post" action="${ctx}/aprv/remove">
                  <input type="hidden" name="aprvNo" value="${doc.aprvNo}" />
                  <button type="submit" class="aprv-btn aprv-btn--ghost">문서 취소</button>
                </form>
              </div>
            </c:if>
          </div>
        </section>
      </div>

    </div>
  </div>
</div>

<script src="${ctx}/js/aprv/aprvDetail.js"></script>
</body>
</html>