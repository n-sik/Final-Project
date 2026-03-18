package com.flowenect.hr.resign.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.flowenect.hr.dto.resign.ResignDTO;
import com.flowenect.hr.dto.resign.ResignApproveDTO;
import com.flowenect.hr.resign.mapper.ResignMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ResignServiceImpl implements ResignService {

    private final ResignMapper resignMapper;

    @Override
    public List<ResignDTO> getResignList(ResignDTO param) {
        return resignMapper.selectResignList(param);
    }

    @Override
    public ResignDTO getResignDetail(String aprvNo) {
        return resignMapper.selectResignDetail(aprvNo);
    }

    @Override
    public int getResignCount(ResignDTO param) {
        return resignMapper.selectResignCount(param);
    }

    // ── 단건 처리 ──────────────────────────────────
    @Override
    @Transactional
    public void approveOne(ResignApproveDTO param) {

        // 1. APRV_DOC.STAT_CD 변경
        int updated = resignMapper.updateAprvDocStat(param);
        if (updated == 0) {
            throw new IllegalStateException("결재 문서를 찾을 수 없습니다: " + param.getAprvNo());
        }

        // 2. COMPLETED 시 EMP.ACNT_ACT_YN = 'N'
        if ("COMPLETED".equals(param.getStatCd())) {
            ResignDTO detail = resignMapper.selectResignDetail(param.getAprvNo());
            if (detail == null) {
                throw new IllegalStateException("퇴직 상세를 찾을 수 없습니다: " + param.getAprvNo());
            }
            resignMapper.updateEmpInactive(detail.getEmpNo());
        }
    }

    // ── 다건 처리 ──────────────────────────────────
    @Override
    @Transactional
    public void approveBulk(ResignApproveDTO param) {

        // 1. APRV_DOC.STAT_CD 일괄 변경
        resignMapper.updateAprvDocStatBulk(param);

        // 2. COMPLETED 시 각 사원 ACNT_ACT_YN = 'N'
        if ("COMPLETED".equals(param.getStatCd())) {
            List<ResignDTO> details =
                resignMapper.selectResignDetailsByAprvNos(param.getAprvNos());
            for (ResignDTO detail : details) {
                resignMapper.updateEmpInactive(detail.getEmpNo());
            }
        }
    }
}