package com.flowenect.hr.data.service;

import com.flowenect.hr.dto.common.PagedResponse;
import com.flowenect.hr.dto.common.SearchRequest;
import com.flowenect.hr.dto.project.ProjectDTO;

public interface ProjectDataService {
    /**
     * 프로젝트 현황 리스트 조회 (페이징 처리 포함)
     */
	PagedResponse<ProjectDTO> readProjectPerformanceList(SearchRequest params);
}
