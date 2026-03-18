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
public class AprvPromotionDTO {

    private Long aprvNo;

    private String targetPosCd;
    private LocalDate effectiveDtm;
    private String reason;
    private String targetEmpNo;
}
