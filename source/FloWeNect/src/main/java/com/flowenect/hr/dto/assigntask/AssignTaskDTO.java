package com.flowenect.hr.dto.assigntask;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.flowenect.hr.dto.dailytasklog.DailyTaskLogDTO;

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
@EqualsAndHashCode(of = "taskNo")
@ToString
public class AssignTaskDTO {
    private Long taskNo;
    private String empNo;
    private Long kpiNo;
    private String deptCd;
    private String taskTitle;
    private String taskCn;
    private String taskStatCd;
    private LocalDateTime regDtm;
    private LocalDateTime modDtm;
    private String delYn;
    private LocalDateTime delDtm;
    private BigDecimal progressRate;	
    private LocalDateTime taskStartDtm;
    private LocalDateTime taskEndDtm;
}
