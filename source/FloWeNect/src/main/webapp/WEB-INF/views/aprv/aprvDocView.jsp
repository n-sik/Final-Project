<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="jakarta.tags.core" prefix="c"%>
<%@ taglib uri="jakarta.tags.functions" prefix="fn"%>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>결재문서</title>
<style>
  /* =========================================================
     A4 문서형 docView (미리보기/인쇄/PDF 공용)
     - screen: 가운데 A4 종이처럼 보이게
     - print/openhtmltopdf: A4 인쇄 규격 유지
  ========================================================= */

  @page { size: A4; margin: 14mm 14mm 14mm 12mm; }

  html, body { height: 100%; }
  *, *::before, *::after { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 0;
    background: #fff;
    color: #111;
    font-family: "Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", Arial, sans-serif;
    font-size: 12px;
    line-height: 1.45;
  }

  /* 화면 미리보기: A4 종이 느낌 */
  @media screen {
    body { background: #f3f5f8; }
    .wrap { padding: 18px 18px 28px; }
    .doc {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: #fff;
      box-shadow: 0 12px 34px rgba(0,0,0,.12);
      border-radius: 10px;
      overflow: hidden;
    }
    .doc-inner { padding: 16mm 13mm 16mm 12mm; }
  }

  /* 인쇄/PDF: 종이 꽉 채우고 그림자 제거 */
  @media print {
    body { background: #fff !important; }
    .wrap { padding: 0 !important; }
    .doc { width: 100% !important; min-height: auto !important; margin: 0 !important; box-shadow: none !important; border-radius: 0 !important; }
    .doc-inner { padding: 0 1.5mm 0 0 !important; }
    .topbar { display: none !important; }
    .meta-box, .aprv-box, .doc-table { page-break-inside: avoid; }
  }

  .wrap { width: 100%; }

  /* 상단 버튼 바(화면에서만 노출) */
  .topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 12px 0 14px;
  }
  .topbar .left { display: flex; gap: 8px; align-items: center; }
  .topbar .right { font-size: 12px; color: #666; }
  .btn {
    border: 1px solid #bbb;
    background: #fff;
    padding: 6px 10px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    color: #111;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .btn:hover { background: #f6f6f6; }

  /* 문서 타이틀 */
  .title {
    text-align: center;
    margin: 0;
  }
  .title h1 {
    margin: 0;
    font-size: 22px;
    letter-spacing: 2px;
    font-weight: 800;
  }
  .title .sub {
    margin-top: 6px;
    font-size: 11px;
    color: #666;
  }

  /* 상단(좌: 문서 기본정보 / 우: 결재) */
  .header-grid {
    display: grid;
    grid-template-columns: minmax(0, 4fr) minmax(0, 5fr);
    gap: 14px;
    align-items: start;
    margin-top: 30px;
  }
  .meta-box {
    border: 2px solid #222;
  }
  .meta-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }
  .meta-table th, .meta-table td {
    border: 1px solid #333;
    padding: 6px 8px;
    vertical-align: middle;
    word-break: break-word;
  }
  .meta-table th {
    width: 28%;
    background: #f1f1f1;
    font-weight: 700;
    text-align: center;
  }

  .aprv-box {
    width: calc(100% - 10px);
    max-width: 70%;
    margin-left: auto;
    border: 2px solid #222;
  }
  .aprv-hd {
    padding: 6px 8px;
    border-bottom: 1px solid #333;
    background: #f1f1f1;
    font-weight: 800;
    text-align: center;
  }
  .aprv-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }
  .aprv-table th, .aprv-table td {
    border-left: 1px solid #333;
    border-top: 1px solid #333;
    padding: 6px 6px;
    text-align: center;
    vertical-align: middle;
  }
  .aprv-table th:first-child, .aprv-table td:first-child { border-left: none; }
  .aprv-table th { background: #fafafa; font-weight: 800; }
  .aprv-name { font-weight: 700; }
  .aprv-pos { font-size: 11px; color: #444; }
  .stamp-wrap { margin-top: 6px; height: 44px; display:flex; align-items:center; justify-content:center; }
  .stamp-wrap img { max-height: 44px; max-width: 60px; display:block; }
  .chip {
    display: inline-block;
    border: 1px solid #999;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 11px;
    background: #fff;
  }

  /* 본문 공통 테이블 */
  .doc-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 0;
    border: 2px solid #222;
  }
  .doc-table th, .doc-table td {
    border: 1px solid #333;
    padding: 7px 8px;
    vertical-align: top;
    word-break: break-word;
  }
  .doc-table th {
    width: 14%;
    background: #f1f1f1;
    font-weight: 800;
    text-align: center;
  }
  .content-box {
    min-height: 120px;
    white-space: pre-wrap;
  }
  .muted { color: #777; }

  /* 하단(양식 상세) */
  .section-title {
    margin: 0 0 6px;
    font-size: 12px;
    font-weight: 900;
  }

/*   .gap-title-to-header { height: 55px; } */
  .gap-header-to-main { height: 200px; }
  .gap-main-to-form { height: 40px; }

  /* 결재라인 상세(옵션) */
  .small-note { margin-top: 10px; font-size: 11px; color: #666; }
  .line-table th { width: auto; }

  @media screen and (max-width: 900px) {
    .header-grid {
      grid-template-columns: 1fr;
    }
    .aprv-box {
      width: 100%;
    }
  }
</style>
</head>

<body>

<div class="wrap">

  <div class="topbar">
    <div class="left">
      <button class="btn" type="button" onclick="window.print()">인쇄</button>
      <a class="btn" href="${pageContext.request.contextPath}/aprv/read?aprvNo=${doc.aprvNo}">상세로</a>
    </div>
  </div>

  <div class="doc">
    <div class="doc-inner">

      <c:set var="formNm" value="" />
      <c:if test="${formTypeMap != null && formTypeMap[doc.formCd] != null}">
        <c:set var="formNm" value="${formTypeMap[doc.formCd]}" />
      </c:if>

      <div class="title">
        <h1>
          <c:choose>
            <c:when test="${formNm != null && fn:length(formNm) > 0}">${fn:escapeXml(formNm)}</c:when>
            <c:otherwise>기안용지</c:otherwise>
          </c:choose>
        </h1>
        <div class="sub">문서번호: ${doc.aprvNo} · 상태: ${fn:escapeXml(doc.statNm)}</div>
      </div>

      <div class="gap-title-to-header"></div>

      <!-- =========================================================
           상단: 문서 기본정보(좌) + 결재(우)
      ========================================================== -->
      <div class="header-grid">

        <div class="meta-box">
          <table class="meta-table">
            <tbody>
              <tr>
                <th>문서번호</th>
                <td>${doc.aprvNo}</td>
              </tr>
              <tr>
                <th>부서</th>
                <td>${fn:escapeXml(doc.deptNm)}</td>
              </tr>
              <tr>
                <th>기안일</th>
                <td>
                  <c:choose>
                    <c:when test="${doc.submitDtm != null}">${fn:replace(doc.submitDtm, 'T', ' ')}</c:when>
                    <c:otherwise><span class="muted">-</span></c:otherwise>
                  </c:choose>
                </td>
              </tr>
              <tr>
                <th>기안자</th>
                <td>${fn:escapeXml(doc.empNm)} (${doc.empNo}) / ${fn:escapeXml(doc.posNm)}</td>
              </tr>
              <tr>
                <th>최종결재</th>
                <td>
                  <c:choose>
                    <c:when test="${doc.finalDtm != null}">${fn:replace(doc.finalDtm, 'T', ' ')}</c:when>
                    <c:otherwise><span class="muted">-</span></c:otherwise>
                  </c:choose>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="aprv-box">
          <div class="aprv-hd">결재</div>

          <c:choose>
            <c:when test="${lines != null && fn:length(lines) > 0}">
              <table class="aprv-table">
                <thead>
                  <tr>
                    <c:forEach var="l" items="${lines}">
                      <th>
                        <div class="aprv-pos">${fn:escapeXml(l.aprverPosNm)}</div>
                        <div class="aprv-name">${fn:escapeXml(l.aprverEmpNm)}</div>
                      </th>
                    </c:forEach>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <c:forEach var="l" items="${lines}">
                      <td>
                        <c:choose>
                          <c:when test="${l.statCd == 'APPROVED'}">
                            <div class="stamp-wrap">
                              <c:set var="imgShown" value="false"/>
                              <c:forEach var="h" items="${assetHist}">
                                <c:if test="${h.lineNo == l.lineNo && (h.assetTypeCd == 'SIGN' || h.assetTypeCd == 'SEAL')}">
                                  <img alt="결재" src="${pageContext.request.contextPath}/aprv/asset/hist/image?lineNo=${h.lineNo}&assetType=${h.assetTypeCd}"/>
                                  <c:set var="imgShown" value="true"/>
                                </c:if>
                              </c:forEach>
                              <c:if test="${imgShown == 'false'}">
                                <span class="muted">(서명/직인 없음)</span>
                              </c:if>
                            </div>
                            <div class="muted" style="font-size:11px;">${fn:replace(l.aprvDtm, 'T', ' ')}</div>
                            <div><span class="chip">승인</span></div>
                          </c:when>

                          <c:when test="${l.statCd == 'REJECTED'}">
                            <div class="stamp-wrap"><span class="chip">반려</span></div>
                            <div class="muted" style="font-size:11px;">${fn:replace(l.aprvDtm, 'T', ' ')}</div>
                          </c:when>

                          <c:otherwise>
                            <div class="stamp-wrap"><span class="muted">결재 예정</span></div>
                            <div><span class="chip">대기</span></div>
                          </c:otherwise>
                        </c:choose>
                      </td>
                    </c:forEach>
                  </tr>
                </tbody>
              </table>
            </c:when>

            <c:otherwise>
              <div style="padding: 18px 12px; text-align:center;" class="muted">결재선이 없습니다.</div>
            </c:otherwise>
          </c:choose>

        </div>
      </div>

      <div class="gap-header-to-main"></div>

      <!-- =========================================================
           본문: 수신/참조/제목/내용
      ========================================================== -->
      <table class="doc-table">
        <tbody>

          <!-- 수신 -->
          <tr>
            <th>수신</th>
            <td>
              <c:set var="hasRcv" value="false"/>
              <c:forEach var="r" items="${refs}">
                <c:if test="${r.refTypeCd == 'RCV' || r.refTypeCd == 'RECV' || r.refTypeCd == 'TO'}">
                  <c:if test="${hasRcv == 'true'}">, </c:if>
                  <c:out value="${r.empNm}" escapeXml="true"/>
                  <span class="muted">(${fn:escapeXml(r.deptNm)}/${fn:escapeXml(r.posNm)})</span>
                  <c:set var="hasRcv" value="true"/>
                </c:if>
              </c:forEach>
              <c:if test="${hasRcv == 'false'}"><span class="muted">-</span></c:if>
            </td>
          </tr>

          <!-- 참조 -->
          <tr>
            <th>참조</th>
            <td>
              <c:set var="hasRef" value="false"/>
              <c:forEach var="r" items="${refs}">
                <c:if test="${!(r.refTypeCd == 'RCV' || r.refTypeCd == 'RECV' || r.refTypeCd == 'TO')}">
                  <c:if test="${hasRef == 'true'}">, </c:if>
                  <c:out value="${r.empNm}" escapeXml="true"/>
                  <span class="muted">(${fn:escapeXml(r.deptNm)}/${fn:escapeXml(r.posNm)})</span>
                  <c:set var="hasRef" value="true"/>
                </c:if>
              </c:forEach>
              <c:if test="${hasRef == 'false'}"><span class="muted">-</span></c:if>
            </td>
          </tr>

          <tr>
            <th>제목</th>
            <td><c:out value="${doc.aprvTtl}" escapeXml="true"/></td>
          </tr>

          <tr>
            <th>내용</th>
            <td class="content-box"><c:out value="${doc.aprvCn}" escapeXml="true"/></td>
          </tr>

        </tbody>
      </table>

      <div class="gap-main-to-form"></div>

      <!-- =========================================================
           양식 상세(기존 항목 유지, 단 code->name 매핑 보강)
      ========================================================== -->
      <c:choose>

        <%-- 휴가 --%>
        <c:when test="${leave != null}">
          <div class="section-title">휴가 신청 상세</div>
          <table class="doc-table">
            <tbody>
              <tr>
                <th>휴가종류</th>
                <td>
                  <c:choose>
                    <c:when test="${leaveTypeMap != null && leaveTypeMap[leave.leaveTypeCd] != null}">${fn:escapeXml(leaveTypeMap[leave.leaveTypeCd])}</c:when>
                    <c:otherwise>${fn:escapeXml(leave.leaveTypeCd)}</c:otherwise>
                  </c:choose>
                </td>
              </tr>
              <tr>
                <th>시작일</th>
                <td>${leave.startDtm}</td>
              </tr>
              <tr>
                <th>종료일</th>
                <td>${leave.endDtm}</td>
              </tr>
              <tr>
                <th>사유</th>
                <td><c:out value="${leave.reason}" escapeXml="true"/></td>
              </tr>
            </tbody>
          </table>
        </c:when>

        <%-- 휴직 --%>
        <c:when test="${loa != null}">
          <div class="section-title">휴직 신청 상세</div>
          <table class="doc-table">
            <tbody>
              <tr>
                <th>휴직종류</th>
                <td>
                  <c:choose>
                    <c:when test="${loaTypeMap != null && loaTypeMap[loa.loaTypeCd] != null}">${fn:escapeXml(loaTypeMap[loa.loaTypeCd])}</c:when>
                    <c:otherwise>${fn:escapeXml(loa.loaTypeCd)}</c:otherwise>
                  </c:choose>
                </td>
              </tr>
              <tr>
                <th>시작일</th>
                <td>${loa.startDtm}</td>
              </tr>
              <tr>
                <th>종료일</th>
                <td>${loa.endDtm}</td>
              </tr>
              <tr>
                <th>사유</th>
                <td><c:out value="${loa.reason}" escapeXml="true"/></td>
              </tr>
            </tbody>
          </table>
        </c:when>

        <%-- 승진 --%>
        <c:when test="${promotion != null}">
          <div class="section-title">승진 신청 상세</div>
          <table class="doc-table">
            <tbody>
              <tr>
                <th>대상사원</th>
                <td>${promotion.targetEmpNo}</td>
              </tr>
              <tr>
                <th>승진직위</th>
                <td>
                  <c:choose>
                    <c:when test="${posMap != null && posMap[promotion.targetPosCd] != null}">${fn:escapeXml(posMap[promotion.targetPosCd])}</c:when>
                    <c:otherwise>${fn:escapeXml(promotion.targetPosCd)}</c:otherwise>
                  </c:choose>
                </td>
              </tr>
              <tr>
                <th>적용일</th>
                <td>${promotion.effectiveDtm}</td>
              </tr>
              <tr>
                <th>사유</th>
                <td><c:out value="${promotion.reason}" escapeXml="true"/></td>
              </tr>
            </tbody>
          </table>
        </c:when>

        <%-- 발령 --%>
        <c:when test="${appointment != null}">
          <div class="section-title">발령 신청 상세</div>
          <table class="doc-table">
            <tbody>
              <tr>
                <th>대상사원</th>
                <td>${appointment.targetEmpNo}</td>
              </tr>
              <tr>
                <th>적용일</th>
                <td>${appointment.effectiveDt}</td>
              </tr>
              <tr>
                <th>부서</th>
                <td>
                  변경 전: 
                  <c:choose>
                    <c:when test="${deptMap != null && deptMap[appointment.befDeptCd] != null}">${fn:escapeXml(deptMap[appointment.befDeptCd])}</c:when>
                    <c:otherwise>${fn:escapeXml(appointment.befDeptCd)}</c:otherwise>
                  </c:choose>
                  <span class="muted">(${fn:escapeXml(appointment.befDeptCd)})</span>
                  <br/>
                  변경 후: 
                  <c:choose>
                    <c:when test="${deptMap != null && deptMap[appointment.aftDeptCd] != null}">${fn:escapeXml(deptMap[appointment.aftDeptCd])}</c:when>
                    <c:otherwise>${fn:escapeXml(appointment.aftDeptCd)}</c:otherwise>
                  </c:choose>
                  <span class="muted">(${fn:escapeXml(appointment.aftDeptCd)})</span>
                </td>
              </tr>
              <tr>
                <th>직위</th>
                <td>
                  <c:choose>
                    <c:when test="${posMap != null && posMap[appointment.befPosCd] != null}">${fn:escapeXml(posMap[appointment.befPosCd])}</c:when>
                    <c:otherwise>${fn:escapeXml(appointment.befPosCd)}</c:otherwise>
                  </c:choose>
                  <br/>
                  <c:choose>
                    <c:when test="${posMap != null && posMap[appointment.aftPosCd] != null}">${fn:escapeXml(posMap[appointment.aftPosCd])}</c:when>
                    <c:otherwise>${fn:escapeXml(appointment.aftPosCd)}</c:otherwise>
                  </c:choose>
                </td>
              </tr>
              <tr>
                <th>사유</th>
                <td><c:out value="${appointment.reason}" escapeXml="true"/></td>
              </tr>
            </tbody>
          </table>
        </c:when>

        <%-- 증원 --%>
        <c:when test="${headcount != null}">
          <div class="section-title">증원 신청 상세</div>
          <table class="doc-table">
            <tbody>
              <tr>
                <th>요청부서</th>
                <td>
                  <c:choose>
                    <c:when test="${deptMap != null && deptMap[headcount.reqDeptCd] != null}">${fn:escapeXml(deptMap[headcount.reqDeptCd])}</c:when>
                    <c:otherwise>${fn:escapeXml(headcount.reqDeptCd)}</c:otherwise>
                  </c:choose>
                  <span class="muted">(${fn:escapeXml(headcount.reqDeptCd)})</span>
                </td>
              </tr>
              <tr>
                <th>증원인원</th>
                <td>${headcount.reqCnt}</td>
              </tr>
              <tr>
                <th>희망일</th>
                <td>${headcount.hopeDt}</td>
              </tr>
              <tr>
                <th>사유</th>
                <td><c:out value="${headcount.reason}" escapeXml="true"/></td>
              </tr>
            </tbody>
          </table>
        </c:when>

        <%-- 퇴직 --%>
        <c:when test="${retire != null}">
          <div class="section-title">퇴직 신청 상세</div>
          <table class="doc-table">
            <tbody>
              <tr>
                <th>대상사원</th>
                <td>${retire.empNo}</td>
              </tr>
              <tr>
                <th>희망퇴직일</th>
                <td>${retire.expRetrDt}</td>
              </tr>
              <tr>
                <th>사유</th>
                <td><c:out value="${retire.retrRsn}" escapeXml="true"/></td>
              </tr>
            </tbody>
          </table>
        </c:when>

      </c:choose>

      <!-- =========================================================
           결재라인 상세(옵션)
           - 문서 느낌 우선: 기본 숨김
           - 필요시 URL에 &showLine=Y 로 노출
      ========================================================== -->
      <c:if test="${param.showLine == 'Y'}">
        <div class="section-title">결재라인 상세</div>
        <table class="doc-table line-table">
          <thead>
            <tr>
              <th>순서</th>
              <th>결재자</th>
              <th>직위</th>
              <th>부서</th>
              <th>상태</th>
              <th>처리일시</th>
            </tr>
          </thead>
          <tbody>
            <c:choose>
              <c:when test="${lines != null && fn:length(lines) > 0}">
                <c:forEach var="l" items="${lines}">
                  <tr>
                    <td style="text-align:center;">${l.aprvSeq}</td>
                    <td>${fn:escapeXml(l.aprverEmpNm)}</td>
                    <td>${fn:escapeXml(l.aprverPosNm)}</td>
                    <td>${fn:escapeXml(l.aprverDeptNm)}</td>
                    <td style="text-align:center;">
                      <c:choose>
                        <c:when test="${l.statCd == 'APPROVED'}">승인</c:when>
                        <c:when test="${l.statCd == 'REJECTED'}">반려</c:when>
                        <c:otherwise>대기</c:otherwise>
                      </c:choose>
                    </td>
                    <td style="text-align:center;">
                      <c:choose>
                        <c:when test="${l.aprvDtm != null}">${fn:replace(l.aprvDtm, 'T', ' ')}</c:when>
                        <c:otherwise><span class="muted">-</span></c:otherwise>
                      </c:choose>
                    </td>
                  </tr>
                </c:forEach>
              </c:when>
              <c:otherwise>
                <tr><td colspan="6" style="text-align:center;"><span class="muted">결재선이 없습니다.</span></td></tr>
              </c:otherwise>
            </c:choose>
          </tbody>
        </table>
      </c:if>

    </div>
  </div>

</div>

</body>
</html>