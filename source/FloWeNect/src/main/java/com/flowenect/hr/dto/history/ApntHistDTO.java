package com.flowenect.hr.dto.history;

import lombok.Data;

@Data
public class ApntHistDTO {
    private String apntDt; // YYYY-MM-DD
    private String empNm;
    private String bfDeptNm;
    private String afDeptNm;
    private String apntRsn;
    private String procEmpNm;
}
