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
public class AprvEmpSnapDTO {
    /**
     * 사원번호(스냅샷). 화면에서 "사원명(사원번호)" 형태로 표시하기 위해 포함.
     */
    private String empNo;

    private String deptCd;
    private String posCd;
    private String empNm;

    private String deptNm;
    private String posNm;
}
