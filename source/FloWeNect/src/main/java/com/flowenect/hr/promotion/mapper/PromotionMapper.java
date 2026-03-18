package com.flowenect.hr.promotion.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import com.flowenect.hr.dto.promotion.PromotionDTO;
import com.flowenect.hr.dto.promotion.PromotionApproveDTO;

@Mapper
public interface PromotionMapper {

    // ── 조회 ────────────────────────────────────────
    List<PromotionDTO> selectPromotionList(PromotionDTO param);
    PromotionDTO       selectPromotionDetail(String aprvNo);
    int                selectPromotionCount(PromotionDTO param);

    // ── 결재 처리 ────────────────────────────────────
    /** [단건] APRV_DOC.STAT_CD + FINAL_DTM 업데이트 */
    int updateAprvDocStatus(PromotionApproveDTO param);

    /** [다건] APRV_DOC.STAT_CD + FINAL_DTM 일괄 업데이트 */
    int updateAprvDocStatusBulk(PromotionApproveDTO param);

    /** 승인 시 EMP.POS_CD = TARGET_POS_CD 업데이트 */
    int updateEmpPos(PromotionDTO promotion);

    /** 다건 승인 시 targetEmpNo + targetPosCd 일괄 조회 */
    List<PromotionDTO> selectPromotionDetailsByAprvNos(List<String> aprvNos);
}