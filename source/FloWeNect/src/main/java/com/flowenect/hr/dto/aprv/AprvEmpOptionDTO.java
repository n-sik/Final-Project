package com.flowenect.hr.dto.aprv;

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
public class AprvEmpOptionDTO {

    private String empNo;
    private String empNm;
    private String deptCd;
    private String posCd;

    private String deptNm;
    private String posNm;
}
