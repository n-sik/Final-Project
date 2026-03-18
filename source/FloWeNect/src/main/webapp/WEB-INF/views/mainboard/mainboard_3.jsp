<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib uri="jakarta.tags.core" prefix="c"%>    
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>메인보드</title>

<style>
  /* (1) 전체 레이아웃: 폭 제한 + 가운데 정렬 */
  .wrap {
    max-width: 1100px;
    margin: 0 auto;
    padding: 20px;
  }

  /* (2) 2열 배치: 그리드 */
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  /* (3) 카드: 구획 나누기(최소) */
  .card {
    border: 1px solid #ddd;
    padding: 16px;
    background: #fff;
  }

  /* (4) 한 줄 정렬: 버튼/텍스트 같은 요소를 가로로 */
  .row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  /* (5) 전체 폭 카드 */
  .full {
    grid-column: 1 / -1;
  }

  /* (6) 제목 간격 최소 정리 */
  .page-title {
    margin: 0 0 16px;
  }
  .card-title {
    margin: 0 0 12px;
  }
</style>
</head>

<body>

  <div class="wrap" id="mainboard">
    <h2 class="page-title">통합 업무 화면</h2>

    <div class="grid">

      <section class="card card-attendance" id="cardAttendance">
        <h3 class="card-title">출근/퇴근</h3>

        <div class="row attendance-actions">
          출근/퇴근 버튼 영역
        </div>

        <div class="attendance-times">
          출근/퇴근 시간 표시 영역
        </div>
      </section>

      <section class="card card-daily" id="cardDaily">
        <h3 class="card-title">업무요약 (전날 일일업무)</h3>

        <div class="daily-content">
          요약 내용 또는 작성 유도 영역
        </div>
      </section>

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