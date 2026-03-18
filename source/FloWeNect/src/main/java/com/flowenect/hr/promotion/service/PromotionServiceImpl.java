package com.flowenect.hr.promotion.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.flowenect.hr.dto.promotion.PromotionDTO;
import com.flowenect.hr.dto.promotion.PromotionApproveDTO;
import com.flowenect.hr.promotion.mapper.PromotionMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PromotionServiceImpl implements PromotionService {

    private final PromotionMapper promotionMapper;

    @Override
    public List<PromotionDTO> getPromotionList(PromotionDTO param) {
        return promotionMapper.selectPromotionList(param);
    }

    @Override
    public PromotionDTO getPromotionDetail(String aprvNo) {
        return promotionMapper.selectPromotionDetail(aprvNo);
    }

    @Override
    public int getPromotionCount(PromotionDTO param) {
        return promotionMapper.selectPromotionCount(param);
    }

    // ── 단건 승인/반려 ─────────────────────────────────
    @Override
    @Transactional
    public void approveOne(PromotionApproveDTO param) {

        // 1. APRV_DOC 상태 변경
        int updated = promotionMapper.updateAprvDocStatus(param);
        if (updated == 0) {
            throw new IllegalStateException("결재 문서를 찾을 수 없습니다: " + param.getAprvNo());
        }

        // 2. 승인인 경우만 EMP.POS_CD 변경 (TARGET_EMP_NO 기준)
        if ("APPROVED".equals(param.getStatCd())) {
            PromotionDTO detail = promotionMapper.selectPromotionDetail(param.getAprvNo());
            if (detail == null) {
                throw new IllegalStateException("승진 상세를 찾을 수 없습니다: " + param.getAprvNo());
            }
            promotionMapper.updateEmpPos(detail);
        }
    }

    // ── 다건 승인/반려 ─────────────────────────────────
    @Override
    @Transactional
    public void approveBulk(PromotionApproveDTO param) {

        // 1. APRV_DOC 상태 일괄 변경
        promotionMapper.updateAprvDocStatusBulk(param);

        // 2. 승인인 경우 각 사원 직위 변경
        if ("APPROVED".equals(param.getStatCd())) {
            List<PromotionDTO> details =
                promotionMapper.selectPromotionDetailsByAprvNos(param.getAprvNos());

            for (PromotionDTO detail : details) {
                // detail.getTargetEmpNo() 기준으로 POS_CD 업데이트
                promotionMapper.updateEmpPos(detail);
            }
        }
    }
}