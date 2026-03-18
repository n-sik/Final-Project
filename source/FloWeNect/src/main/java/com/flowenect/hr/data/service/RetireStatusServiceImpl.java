package com.flowenect.hr.data.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.flowenect.hr.data.mapper.RetireStatusMapper;
import com.flowenect.hr.dto.common.PagedResponse;
import com.flowenect.hr.dto.common.PagingDTO;
import com.flowenect.hr.dto.common.SearchRequest;
import com.flowenect.hr.dto.data.ResponseRetireDeptSummaryDTO;
import com.flowenect.hr.dto.data.ResponseRetireStatusDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RetireStatusServiceImpl implements RetireStatusService {

	private final RetireStatusMapper retireStatusMapper;

	@Override
	public PagedResponse<ResponseRetireStatusDTO> readRetireStatusList(SearchRequest request) {
		
		if (request.getPaging() == null) {
	        request.setPaging(new PagingDTO()); // 기본 page=1, recordSize=10 설정된 생성자 필요
	    }
		
		int totalCount = retireStatusMapper.selectRetireStatusCount(request);
		
		request.getPaging().setTotalCount(totalCount);
		
		List<ResponseRetireStatusDTO> list = retireStatusMapper.selectAprvRetireList(request);
		
		return PagedResponse.of(list, request.getPaging());
	}

	@Override
	public List<ResponseRetireDeptSummaryDTO> readRetireDeptSummary() {
	    return retireStatusMapper.selectRetireDeptSummary();
	}
}