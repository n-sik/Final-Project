package com.flowenect.hr.dto.history;

import lombok.Data;

@Data
public class AprvHistDTO {
    private Long aprvNo;
    private String submitDtm; // YYYY-MM-DD
    private String formNm;
    private String empNm;
    private String aprvTtl;
    private String statCd;
    private String statNm;
    private String finalDtm; // YYYY-MM-DD
}
