package com.flowenect.hr.dto.common;

import java.util.HashMap;
import java.util.Map;

import lombok.Data;

@Data
public class SearchRequest {
	// 1. 공통 페이징
	private PagingDTO paging = new PagingDTO();
	
	// 2. 검색 조건
	private Map<String, Object> params = new HashMap<>();
}
