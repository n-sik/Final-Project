package com.flowenect.hr.transfer.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.flowenect.hr.dto.transfer.TransferDTO;
import com.flowenect.hr.dto.transfer.TransferApproveDTO;
import com.flowenect.hr.transfer.service.TransferService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/transfer")
public class BoardTransferController {

    private final TransferService transferService;

    /** 목록 조회 (기존 유지) */
    @GetMapping("/readList")
    public ResponseEntity<List<TransferDTO>> readTransferList(TransferDTO param) {
        return ResponseEntity.ok(transferService.getTransferList(param));
    }

    /** 단건 조회 */
    @GetMapping("/{aprvNo}")
    public ResponseEntity<TransferDTO> getDetail(@PathVariable String aprvNo) {
        TransferDTO dto = transferService.getTransferDetail(aprvNo);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @PostMapping("/approve/one")
    public ResponseEntity<String> approveOne(@RequestBody TransferApproveDTO param) {
        transferService.approveOne(param);
        return ResponseEntity.ok("처리 완료");
    }


    @PostMapping("/approve/bulk")
    public ResponseEntity<String> approveBulk(@RequestBody TransferApproveDTO param) {
        transferService.approveBulk(param);
        return ResponseEntity.ok("처리 완료");
    }
}