package com.flowenect.hr.dto.history;

import lombok.Data;

@Data
public class PromotionHistDTO {
    private String promoDt; // YYYY-MM-DD
    private String empNm;
    private String bfPosNm;
    private String afPosNm;
    private String promoRsn;
    private String procEmpNm;
}
