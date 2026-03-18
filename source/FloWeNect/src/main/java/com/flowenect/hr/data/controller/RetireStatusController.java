package com.flowenect.hr.data.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flowenect.hr.data.service.RetireStatusService;
import com.flowenect.hr.dto.common.PagedResponse;
import com.flowenect.hr.dto.common.SearchRequest;
import com.flowenect.hr.dto.data.ResponseRetireDeptSummaryDTO;
import com.flowenect.hr.dto.data.ResponseRetireStatusDTO;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/retire")
public class RetireStatusController {

    private final RetireStatusService retireStatusService;

    /**
     * [좌측 테이블] 퇴직 신청서가 존재하는 부서별 현황 요약 조회
     * GET /api/retire/summary
     */
    @GetMapping("/summary")
    public List<ResponseRetireDeptSummaryDTO> readRetireDeptSummary() {
        return retireStatusService.readRetireDeptSummary();
    }
    
    /**
     * 퇴직 승인/현황 목록 조회 API
     * GET http:/api/retire/list
     */
    @GetMapping("/list")
    public PagedResponse<ResponseRetireStatusDTO> readRetireStatusList(SearchRequest request) {
        return retireStatusService.readRetireStatusList(request);
    }
}