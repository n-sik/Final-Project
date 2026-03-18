package com.flowenect.hr.dto.aprv;

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
public class AprvRefDTO {

    private long aprvNo;
    private String empNo;

    private String empNm;
    private String deptNm;
    private String posNm;

    private String refTypeCd;   // 수신/참조 구분 코드
    private String refStatCd;   // 확인/미확인 등 상태 코드
    private LocalDateTime refDtm;
}
