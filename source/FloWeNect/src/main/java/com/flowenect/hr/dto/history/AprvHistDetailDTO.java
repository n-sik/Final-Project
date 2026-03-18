package com.flowenect.hr.dto.history;

import lombok.Data;

@Data
public class AprvHistDetailDTO {
    private Long aprvNo;

    private String submitDtm;
    private String finalDtm;

    private String formCd;
    private String formNm;

    private String empNo;
    private String empNm;

    private String docWrtrDeptCd;
    private String docWrtrDeptNm;

    private String docWrtrPosCd;
    private String docWrtrPosNm;

    private String statCd;
    private String statNm;

    private String hrApplyYn;
    private String hrApplyNm;

    private String aprvTtl;
    private String aprvCn;
    private String docStatCmt;
}
