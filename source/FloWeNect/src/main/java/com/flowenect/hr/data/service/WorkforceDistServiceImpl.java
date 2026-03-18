package com.flowenect.hr.data.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flowenect.hr.data.mapper.WorkforceDistMapper;
import com.flowenect.hr.dto.common.PagedResponse;
import com.flowenect.hr.dto.common.SearchRequest;
import com.flowenect.hr.dto.data.ResponseWorkforceDistDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WorkforceDistServiceImpl implements WorkforceDistService {
	
	private final WorkforceDistMapper workforceDistMapper;
	
	@Override
	public PagedResponse<ResponseWorkforceDistDTO> readWorkforceDistList(SearchRequest request) {
	    int totalCount = workforceDistMapper.selectWorkforceDistCount(request);
	    request.getPaging().setTotalCount(totalCount);

	    List<ResponseWorkforceDistDTO> list = workforceDistMapper.selectWorkforceDistList(request);

	    return PagedResponse.of(list, request.getPaging());
	}
}
