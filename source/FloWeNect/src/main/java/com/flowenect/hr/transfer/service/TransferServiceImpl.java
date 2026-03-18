package com.flowenect.hr.transfer.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.flowenect.hr.dto.transfer.TransferDTO;
import com.flowenect.hr.dto.transfer.TransferApproveDTO;
import com.flowenect.hr.transfer.mapper.TransferMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TransferServiceImpl implements TransferService {

    private final TransferMapper transferMapper;

    // ── 기존 ──────────────────────────────────────────────
    @Override
    public List<TransferDTO> getTransferList(TransferDTO param) {
        return transferMapper.selectTransferList(param);
    }

    @Override
    public TransferDTO getTransferDetail(String aprvNo) {
        return transferMapper.selectTransferDetail(aprvNo);
    }

    @Override
    public int getTransferCount(TransferDTO param) {
        return transferMapper.selectTransferCount(param);
    }

    // ── 단건 승인/반려 ─────────────────────────────────────
    @Override
    @Transactional
    public void approveOne(TransferApproveDTO param) {

        // 1. APRV_DOC 상태 변경
        int updated = transferMapper.updateAprvDocStatus(param);
        if (updated == 0) {
            throw new IllegalStateException("결재 문서를 찾을 수 없습니다: " + param.getAprvNo());
        }

        // 2. 승인인 경우에만 TARGET_EMP_NO 기준으로 부서 변경
        if ("APPROVED".equals(param.getStatCd())) {
            TransferDTO detail = transferMapper.selectTransferDetail(param.getAprvNo());
            if (detail == null) {
                throw new IllegalStateException("발령 상세를 찾을 수 없습니다: " + param.getAprvNo());
            }
            // ★ detail.getTargetEmpNo() → 기안자(empNo)가 아닌 발령 대상자
            transferMapper.updateEmpDept(detail);
        }
    }

    // ── 다건 승인/반려 ─────────────────────────────────────
    @Override
    @Transactional
    public void approveBulk(TransferApproveDTO param) {

        // 1. APRV_DOC 상태 일괄 변경
        transferMapper.updateAprvDocStatusBulk(param);

        // 2. 승인인 경우 각 발령 대상자 부서 변경
        if ("APPROVED".equals(param.getStatCd())) {
            // ★ targetEmpNo + aftDeptCd 조회
            List<TransferDTO> details =
                transferMapper.selectTransferDetailsByAprvNos(param.getAprvNos());

            for (TransferDTO detail : details) {
               
                transferMapper.updateEmpDept(detail);
            }
        }
    }
}