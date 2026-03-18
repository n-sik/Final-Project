package com.flowenect.hr.promotion.service;

import java.util.List;
import com.flowenect.hr.dto.promotion.PromotionDTO;
import com.flowenect.hr.dto.promotion.PromotionApproveDTO;

public interface PromotionService {

    List<PromotionDTO> getPromotionList(PromotionDTO param);
    PromotionDTO       getPromotionDetail(String aprvNo);
    int                getPromotionCount(PromotionDTO param);

    /** 단건 승인/반려 → APPROVED 시 EMP.POS_CD 변경 */
    void approveOne(PromotionApproveDTO param);

    /** 다건 승인/반려 → APPROVED 시 각 사원 EMP.POS_CD 변경 */
    void approveBulk(PromotionApproveDTO param);
}