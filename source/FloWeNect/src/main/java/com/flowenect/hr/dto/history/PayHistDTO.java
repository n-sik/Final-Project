package com.flowenect.hr.dto.history;

import lombok.Data;

@Data
public class PayHistDTO {
    private String histKey;
    private String tab;
    private String status;

    private String deptNm;
    private String posCd;
    private String posNm;
    private String empNm;
    private String empNo;

    private Long baseAmt;
    private String bankName;
    private String accntNo;
    private Integer deductFamCnt;
    private Integer salaryGrade;
    private String adjustRsn;

    private String salaryItemCode;
    private String salaryItemName;
    private String itemType;
    private String taxType;
    private Long itemAmount;

    private Long baseAmtNo;
    private Long stdAmt;

    private Long stepRateNo;
    private Integer salaryStep;
    private Double increaseRate;
    private String useYn;
    private Integer stepCount;

    private Long rateNo;
    private Double pensionRate;
    private Double healthRate;
    private Double employRate;
    private Double careRate;
    private Double incomeTaxRate;
    private Double localTaxRate;

    private Long payrollNo;
    private String payYyyymm;
    private Long totalPayAmt;
    private Long totalDeductAmt;
    private Long netPayAmt;
    private String confirmYn;
    private String createdDtm;

    private String startDtm;
    private String endDtm;
}
