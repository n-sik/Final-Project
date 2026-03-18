package com.flowenect.hr.IndividualEval.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flowenect.hr.IndividualEval.service.IndividualEvalService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/individual-eval")
@RequiredArgsConstructor
public class IndividualEvalController {

    private final IndividualEvalService individualEvalService;

    /**
     * 사원별 개인평가 리포트 데이터 조회
     * @param empNo 대상 사번
     * @return 동료 평가 리스트 및 통계 데이터
     */
    @GetMapping("/report/{empNo}")
    public ResponseEntity<Map<String, Object>> getIndividualEvalReport(@PathVariable String empNo) {
        log.info("개인평가 리포트 요청 수신 - 사번: {}", empNo);
        
        Map<String, Object> reportData = individualEvalService.getIndividualEvalReport(empNo);
        
        if (reportData == null || reportData.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(reportData);
    }
}