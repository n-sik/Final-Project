package com.flowenect.hr.dto.dailytasklog;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "taskLogNo")
@ToString
public class DailyTaskLogDTO {

    private Long taskLogNo;
    private Long taskNo;
    private String empNo;
    private String logDivCd;
    private String logTitle;
    private String logCn;
    private LocalDateTime workDtm;
    private LocalDateTime regDtm;
    private LocalDateTime modDtm;
    private String delYn;
    private LocalDateTime delDtm;
    private String taskCn;
    
 // ── 화면 입력용 (DB 컬럼 아님) ──
    private String taskStatCd;       // 업무상태 → ASSIGN_TASK 업데이트용
    private double progressRate;     // 진행률   → ASSIGN_TASK 업데이트용
    private String workStartTime;    // 작업시작 (HH:mm)
    private String workEndTime;      // 작업종료 (HH:mm)
    private String dateFrom;         // 이전일지 기간 검색 시작
    private String dateTo;           // 이전일지 기간 검색 종료

    // ── JOIN 조회용 (읽기 전용) ──
    private String empNm;            // 사원명        (EMP)
    private String taskTitle;        // 업무제목      (ASSIGN_TASK)
    private String taskPeriod;       // 업무기간      (ASSIGN_TASK)
    private String deptCd;           // 부서코드      (ASSIGN_TASK)
    private double taskProgressRate; // 담당업무 진행률 (ASSIGN_TASK)
}
