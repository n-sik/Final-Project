package com.flowenect.hr.data.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flowenect.hr.data.service.WorkforceDistService;
import com.flowenect.hr.dto.common.PagedResponse;
import com.flowenect.hr.dto.common.SearchRequest;
import com.flowenect.hr.dto.data.ResponseWorkforceDistDTO;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dist")
@RequiredArgsConstructor
public class WorkforceDistController {
	
	private final WorkforceDistService workDistService;

	/**
     * 프로젝트 리스트와 동일하게 @GetMapping 및 @ModelAttribute 사용
     */
    @GetMapping("/paged-list")
    public ResponseEntity<PagedResponse<ResponseWorkforceDistDTO>> readWorkforceDistList(SearchRequest request) {
        return ResponseEntity.ok(workDistService.readWorkforceDistList(request));
    }
}
