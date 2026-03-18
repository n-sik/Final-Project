package com.flowenect.hr.organizetionchart.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.type.MappedJdbcTypes;

@Mapper
public interface OrganizationChartMapper {
	/**
     * OrgChart.js 전용 부서 계층 데이터 조회
     * @return id, pid, name, title 등을 포함한 리스트
     */
    List<Map<String, Object>> selectDeptChartList();
}
