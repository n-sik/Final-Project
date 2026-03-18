<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Flowenect · 로그인</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Pretendard:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${pageContext.request.contextPath}/css/login/login.css">
</head>
<body>

  <!-- ══════════ 왼쪽 비주얼 패널 ══════════ -->
<div class="visual-panel">
    <video autoplay loop muted playsinline class="bg-video">
        <source src="${pageContext.request.contextPath}/dist/assets/images/login.mp4" type="video/mp4">
    </video>
    
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>
    <div class="orb orb-4"></div>

    <!-- 브랜드 로고 (SVG) -->
    <div class="brand-logo">
      <div class="logo-mark">
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <span class="logo-name">Flo<span>We</span>Nect</span>
    </div>

    <!-- 메인 카피 -->
    <div class="visual-content">
      <div class="visual-tag">HR Management Platform</div>
      <h2 class="visual-headline">
        사람과 조직이<br><em>연결되는</em> 공간
      </h2>
      <p class="visual-desc">
        Flowenect는 조직의 성과와 구성원의 성장을<br>
        하나의 흐름으로 연결합니다.
      </p>
    </div>



    <!-- 하단 스탯 -->
    <div class="visual-stats">
      <div class="stat-item">
        <span class="stat-num">KPI</span>
        <span class="stat-label">성과 관리</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-num">평가</span>
        <span class="stat-label">다면 평가</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-num">기안</span>
        <span class="stat-label">전자 결재</span>
      </div>
    </div>
  </div>

  <!-- ══════════ 오른쪽 로그인 패널 ══════════ -->
  <div class="login-panel">
    <div class="login-box">

      <div class="login-greeting">
        <span class="hello">Welcome back</span>
        <h1>다시 만나서<br>반갑습니다</h1>
        <p>업무 시스템에 로그인하여 오늘의 업무를 시작하세요.</p>
      </div>

      <!-- 에러 메시지 -->
      <div class="error-msg" id="errorMsg">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span id="errorText">사원번호 또는 비밀번호가 올바르지 않습니다.</span>
      </div>

      <!-- 로그아웃 메시지 -->
      <div class="success-msg" id="logoutMsg">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <span>정상적으로 로그아웃되었습니다.</span>
      </div>

      <!-- 로그인 폼 -->
      <form method="post" action="/login-process" id="loginForm">

        <div class="form-group">
          <label for="username">사원번호</label>
          <div class="input-wrap">
            <input type="text" id="username" name="username"
                   placeholder="사원번호를 입력하세요"
                   autocomplete="off" required>
            <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        </div>

        <div class="form-group">
          <label for="password">비밀번호</label>
          <div class="input-wrap">
            <input type="password" id="password" name="password"
                   placeholder="비밀번호를 입력하세요"
                   autocomplete="current-password" required>
            <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <button type="button" class="pw-toggle" id="pwToggle" tabindex="-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- 사번찾기 / 비밀번호찾기 -->
        <div class="form-options">
          <button type="button" class="find-link" onclick="openModal('empModal')">사번 찾기</button>
          <span class="find-sep">|</span>
          <button type="button" class="find-link" onclick="openModal('pwModal')">비밀번호 찾기</button>
        </div>

        <button type="submit" class="btn-login" id="loginBtn">
          <span class="btn-text">로그인</span>
          <div class="spinner"></div>
        </button>

      </form>

      <div class="login-footer">
        © 2026 Flowenect HR System. All rights reserved.<br>
        문의: <a href="mailto:support@flowenect.com">support@flowenect.com</a>
      </div>

    </div>
  </div>


  <!-- ══════════ 사번 찾기 모달 ══════════ -->
  <div class="modal-overlay" id="empModal" onclick="handleOverlayClick(event, 'empModal')">
    <div class="modal-box">
      <button class="modal-close" onclick="closeModal('empModal')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <div class="modal-icon emp">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>

      <h2 class="modal-title">사번 찾기</h2>
      <p class="modal-desc">등록된 성명과 이메일을 입력하시면<br>사원번호를 안내해 드립니다.</p>

      <div class="step-indicator">
        <div class="step-dot active" id="empStep1"></div>
        <div class="step-dot" id="empStep2"></div>
      </div>

      <!-- Step 1 -->
      <div id="empFormStep1">
        <div class="modal-form-group">
          <label>성명</label>
          <input type="text" class="modal-input" id="empName" placeholder="홍길동" autocomplete="off">
        </div>
        <div class="modal-form-group">
          <label>이메일</label>
          <input type="email" class="modal-input" id="empEmail" placeholder="example@company.com" autocomplete="off">
        </div>
        <button type="button" class="modal-btn emp-btn" onclick="findEmpNo()">사번 조회하기</button>
      </div>

      <!-- Step 2 (결과) -->
      <div id="empFormStep2" style="display:none;">
        <div class="modal-result" id="empResult"></div>
        <button type="button" class="modal-btn emp-btn" style="margin-top:18px;" onclick="resetEmpModal()">다시 조회하기</button>
      </div>

    </div>
  </div>


  <!-- ══════════ 비밀번호 찾기 모달 ══════════ -->
  <div class="modal-overlay" id="pwModal" onclick="handleOverlayClick(event, 'pwModal')">
    <div class="modal-box">
      <button class="modal-close" onclick="closeModal('pwModal')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <div class="modal-icon pw">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>

      <h2 class="modal-title">비밀번호 찾기</h2>
      <p class="modal-desc">사원번호와 등록된 이메일을 입력하시면<br>임시 비밀번호를 발송해 드립니다.</p>

      <div class="step-indicator">
        <div class="step-dot active" id="pwStep1"></div>
        <div class="step-dot" id="pwStep2"></div>
      </div>

      <!-- Step 1 -->
      <div id="pwFormStep1">
        <div class="modal-form-group">
          <label>사원번호</label>
          <input type="text" class="modal-input" id="pwEmpNo" placeholder="2026000000" autocomplete="off">
        </div>
        <div class="modal-form-group">
          <label>이름</label>
          <input type="text" class="modal-input" id="pwName" placeholder="홍길동" autocomplete="off">
        </div>
        <div class="modal-form-group">
          <label>이메일</label>
          <input type="email" class="modal-input" id="pwEmail" placeholder="example@company.com" autocomplete="off">
        </div>
        <button type="button" class="modal-btn pw-btn" onclick="findPassword()">임시 비밀번호 발송</button>
      </div>

      <!-- Step 2 (결과) -->
      <div id="pwFormStep2" style="display:none;">
        <div class="modal-result" id="pwResult"></div>
        <button type="button" class="modal-btn pw-btn" style="margin-top:18px;" onclick="resetPwModal()">다시 시도하기</button>
      </div>

    </div>
  </div>


<script src="${pageContext.request.contextPath}/js/login/login.js"></script>
</body>
</html>
