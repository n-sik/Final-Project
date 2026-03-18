package com.flowenect.hr.data.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flowenect.hr.data.service.ProjectDataService;
import com.flowenect.hr.dto.common.PagedResponse;
import com.flowenect.hr.dto.common.SearchRequest;
import com.flowenect.hr.dto.project.ProjectDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/projectdata")
@RequiredArgsConstructor
public class ProjectDataController {
	
	private final ProjectDataService projectDataService;
	
	@GetMapping("/paged-list")
	public ResponseEntity<PagedResponse<ProjectDTO>> readPagedList(
			SearchRequest request
			) {
		request.setPaging(request.getPaging());
		return ResponseEntity.ok(projectDataService.readProjectPerformanceList(request));
	}
}
