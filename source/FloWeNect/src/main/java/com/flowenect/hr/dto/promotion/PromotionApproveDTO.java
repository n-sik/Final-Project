package com.flowenect.hr.dto.promotion;

import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 승진 승인/반려 요청 DTO
 * statCd: "APPROVED" | "REJECTED"
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromotionApproveDTO {
    private String       aprvNo;   // 단건
    private List<String> aprvNos;  // 다건
    private String       statCd;
}