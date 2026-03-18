package com.flowenect.hr.promotion.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flowenect.hr.dto.promotion.PromotionApproveDTO;
import com.flowenect.hr.dto.promotion.PromotionDTO;
import com.flowenect.hr.promotion.service.PromotionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/promotion")
public class PromotionController {

    private final PromotionService promotionService;

    @GetMapping("/readList")
    public ResponseEntity<List<PromotionDTO>> readPromotionList(PromotionDTO param) {
        return ResponseEntity.ok(promotionService.getPromotionList(param));
    }

    @GetMapping("/{aprvNo}")
    public ResponseEntity<PromotionDTO> getDetail(@PathVariable String aprvNo) {
        PromotionDTO dto = promotionService.getPromotionDetail(aprvNo);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @PostMapping("/approve/one")
    public ResponseEntity<String> approveOne(@RequestBody PromotionApproveDTO param) {
        promotionService.approveOne(param);
        return ResponseEntity.ok("처리 완료");
    }

    @PostMapping("/approve/bulk")
    public ResponseEntity<String> approveBulk(@RequestBody PromotionApproveDTO param) {
        promotionService.approveBulk(param);
        return ResponseEntity.ok("처리 완료");
    }
}