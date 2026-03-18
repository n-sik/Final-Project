package com.flowenect.hr.data.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.flowenect.hr.data.mapper.ProjectDataMapper;
import com.flowenect.hr.dto.common.PagedResponse;
import com.flowenect.hr.dto.common.SearchRequest;
import com.flowenect.hr.dto.project.ProjectDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProjectDataServiceImpl implements ProjectDataService {

	private final ProjectDataMapper projectDataMapper;

	public PagedResponse<ProjectDTO> readProjectPerformanceList(SearchRequest request) {
	    int totalCount = projectDataMapper.selectCountProjectPerformance(request);
	    request.getPaging().setTotalCount(totalCount); 
	    
	    List<ProjectDTO> list = projectDataMapper.selectProjectPerformanceList(request);
	    
	    return PagedResponse.of(list, request.getPaging());
	}
}
