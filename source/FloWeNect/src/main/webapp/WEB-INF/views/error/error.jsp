<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Flowenect · ${statusCode} ${statusLabel}</title>
<link href="https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${pageContext.request.contextPath}/css/error/error.css">
</head>
<body>
  <div class="visual-panel" aria-hidden="true">
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>

    <div class="brand-block">
      <img class="brand-logo-image"
           src="${pageContext.request.contextPath}/dist/assets/images/logo_C.png"
           alt="Flowenect">

      <div class="visual-copy">
        <div class="visual-kicker">HR MANAGEMENT SYSTEM</div>
        <h1 class="visual-title">사람과 조직을<br>하나의 운영 구조로<br>완성하다.</h1>
        <p class="visual-desc">업무·성과·변화·관계를 하나의 구조로 엮어,<br>조직이 더 빠르고 정확하게 움직이도록 설계합니다.</p>

        <div class="visual-chips">
          <span class="visual-chip">조직 데이터 통합</span>
          <span class="visual-chip">업무-성과 연결</span>
          <span class="visual-chip">변화 이력 추적</span>
          <span class="visual-chip">관계 기반 운영</span>
        </div>
      </div>
    </div>
  </div>

  <div class="error-panel">
    <div class="error-box">
      <div class="status-chip">${statusCode} · ${statusLabel}</div>
      <h2 class="error-title">${title}</h2>

      <c:choose>
        <c:when test="${statusCode == 401}">
          <p class="error-message"><c:out value="${message}" escapeXml="false"/></p>
        </c:when>
        <c:otherwise>
          <p class="error-message">${message}</p>
        </c:otherwise>
      </c:choose>

      <div class="guide-box">
        <div class="guide-title">이렇게 진행해 주세요</div>
        <ul class="guide-list">
          <c:forEach var="guide" items="${guides}">
            <li>${guide}</li>
          </c:forEach>
        </ul>
      </div>

      <div class="action-group">
        <a class="btn btn-primary" href="${pageContext.request.contextPath}${primaryActionUrl}">${primaryActionLabel}</a>
        <button type="button" class="btn btn-secondary" onclick="goBackWithFallback()">이전 화면으로</button>
      </div>

      <div class="help-box">
        문제가 계속되면 <strong>발생 시각</strong>, <strong>메뉴명</strong>, <strong>수행 작업</strong>을 정리해 관리자에게 전달해 주세요.<br>
        문의: <a href="mailto:support@flowenect.com">support@flowenect.com</a>
      </div>
    </div>
  </div>

<script>
  function goBackWithFallback() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.href = '${pageContext.request.contextPath}/login';
  }
</script>
</body>
</html>
