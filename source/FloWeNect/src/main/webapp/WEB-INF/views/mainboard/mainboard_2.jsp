<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib uri="jakarta.tags.core" prefix="c"%>    
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Insert title here</title>
</head>
<body>

  <div class="wrap" id="mainboard">
    <h2 class="page-title">통합 업무 화면</h2>

    <div class="grid">

      <!-- 1) 출근/퇴근 -->
      <section class="card card-attendance" id="cardAttendance">
        <h3 class="card-title">출근/퇴근</h3>

        <div class="row attendance-actions">
          출근/퇴근 버튼 영역
        </div>

        <div class="attendance-times">
          출근/퇴근 시간 표시 영역
        </div>
      </section>

      <!-- 2) 업무요약 -->
      <section class="card card-daily" id="cardDaily">
        <h3 class="card-title">업무요약 (전날 일일업무)</h3>

        <div class="daily-content">
          요약 내용 또는 작성 유도 영역
        </div>
      </section>

      <!-- 3) 신규업무 -->
      <section class="card card-task full" id="cardTask">
        <h3 class="card-title">신규업무</h3>

        <div class="task-list">
          신규업무 목록 또는 없음 표시
        </div>
      </section>

    </div>
  </div>

</body>
</html>