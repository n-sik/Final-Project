package com.flowenect.hr.dto.history;

import com.flowenect.hr.dto.common.SearchDTO;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class PayHistorySearchDTO extends SearchDTO {

    private String tab;

    private String deptNm;
    private String posCd;
    private String empNm;
    private String empNo;

    private String status;
    private String bankName;
    private String salaryItemCode;
    private String taxType;
    private String confirmYn;

    private String payMonthFrom;
    private String payMonthTo;
}
