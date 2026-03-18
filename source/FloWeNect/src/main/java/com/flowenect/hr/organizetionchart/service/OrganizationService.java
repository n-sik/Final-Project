package com.flowenect.hr.organizetionchart.service;

import java.util.List;
import java.util.Map;

public interface OrganizationService {
	/**
     * 조직도 구성을 위한 부서 계층 데이터 조회
     * @return id(부서코드), pid(상위부서코드), name(부서명) 등을 포함한 맵 리스트
     */
    List<Map<String, Object>> getDeptChartList();
}
