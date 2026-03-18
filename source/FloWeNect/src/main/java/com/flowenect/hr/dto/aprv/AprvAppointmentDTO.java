package com.flowenect.hr.dto.aprv;

import java.time.LocalDate;

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
public class AprvAppointmentDTO {

    private Long aprvNo;
    private String targetEmpNo;
    private String befDeptCd;
    private String aftDeptCd;
    private String apptTypeCd;
    private LocalDate effectiveDt;
    private String befPosCd;
    private String aftPosCd;
    private String reason;
    
}
