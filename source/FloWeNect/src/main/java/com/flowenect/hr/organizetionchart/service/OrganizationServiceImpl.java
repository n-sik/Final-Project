package com.flowenect.hr.organizetionchart.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.flowenect.hr.organizetionchart.mapper.OrganizationChartMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrganizationServiceImpl implements OrganizationService {
	
	private final OrganizationChartMapper organizationChartMapper;
	
	@Override
    public List<Map<String, Object>> getDeptChartList() {
        return organizationChartMapper.selectDeptChartList();
    }
}
