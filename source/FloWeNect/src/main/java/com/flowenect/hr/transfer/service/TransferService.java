package com.flowenect.hr.transfer.service;

import java.util.List;

import com.flowenect.hr.dto.transfer.TransferApproveDTO;
import com.flowenect.hr.dto.transfer.TransferDTO;

public interface TransferService {

    // 목록 조회
    List<TransferDTO> getTransferList(TransferDTO param);

    // 단건 조회
    TransferDTO getTransferDetail(String aprvNo);

    // 전체 건수 (페이징용)
    int getTransferCount(TransferDTO param);
    
    // 단건 승인/반려
    void approveOne(TransferApproveDTO param);

    // 다건 승인/반려
    void approveBulk(TransferApproveDTO param);

}