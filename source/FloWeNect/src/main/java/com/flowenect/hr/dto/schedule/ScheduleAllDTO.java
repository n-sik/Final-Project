package com.flowenect.hr.dto.schedule;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleAllDTO {

    private Long schdNo;
    private String empNo;
    private Long refPostNo;
    private String schdDivCd;    // education / VACATION / 채용
    private String schdTitle;
    private String schdCn;
    private Date schdStDtm;
    private Date schdEdDtm;
    private String allDayYn;     // Y/N
    private String delYn;        // Y/N
    private Date regDtm;
    private String color;
    private Integer schdPrio;    // 1:교육 / 2:연차 / 3:채용
    
    
    private String empNm;
}