package com.flowenect.hr.resign.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.flowenect.hr.dto.resign.ResignDTO;
import com.flowenect.hr.dto.resign.ResignApproveDTO;
import com.flowenect.hr.resign.service.ResignService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/resign")
public class ResignController {

    private final ResignService resignService;

    /**
     * 퇴직 목록 조회
     * GET /api/resign/readList
     * → FORM_CD='RETIRE' 전체 반환 (APPROVED/COMPLETED/REJECTED)
     */
    @GetMapping("/readList")
    public ResponseEntity<List<ResignDTO>> readResignList(ResignDTO param) {
        return ResponseEntity.ok(resignService.getResignList(param));
    }

    /**
     * 단건 조회
     * GET /api/resign/{aprvNo}
     */
    @GetMapping("/{aprvNo}")
    public ResponseEntity<ResignDTO> getDetail(@PathVariable String aprvNo) {
        ResignDTO dto = resignService.getResignDetail(aprvNo);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    /**
     * 단건 처리
     * POST /api/resign/approve/one
     * Body: { "aprvNo": "123", "statCd": "COMPLETED" }
     * Body: { "aprvNo": "123", "statCd": "REJECTED" }
     */
    @PostMapping("/approve/one")
    public ResponseEntity<String> approveOne(@RequestBody ResignApproveDTO param) {
        resignService.approveOne(param);
        return ResponseEntity.ok("처리 완료");
    }

    /**
     * 다건 처리
     * POST /api/resign/approve/bulk
     * Body: { "aprvNos": ["123","124"], "statCd": "COMPLETED" }
     */
    @PostMapping("/approve/bulk")
    public ResponseEntity<String> approveBulk(@RequestBody ResignApproveDTO param) {
        resignService.approveBulk(param);
        return ResponseEntity.ok("처리 완료");
    }
}