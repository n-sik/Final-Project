package com.flowenect.hr.dto.aprv;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class AprvRetireDTO {

    private Long retrNo;
    private Long aprvNo;

    /** 퇴직 대상자(없으면 기안자 본인으로 처리) */
    private String empNo;

    private LocalDate expRetrDt;
    private String retrRsn;

    /** 처리상태코드(업무 프로세스용) */
    private String procStatCd;

    private LocalDateTime confRetrDtm;
    private String eApprDocNo;
    private LocalDateTime reqDtm;
    private LocalDateTime procEndDtm;
}
