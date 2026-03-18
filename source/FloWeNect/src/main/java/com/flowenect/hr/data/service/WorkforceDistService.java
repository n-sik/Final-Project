package com.flowenect.hr.data.service;

import com.flowenect.hr.dto.common.PagedResponse;
import com.flowenect.hr.dto.common.SearchRequest;
import com.flowenect.hr.dto.data.ResponseWorkforceDistDTO;

/**
 * 인력 분석 현황 서비스 인터페이스
 */
public interface WorkforceDistService {
	
	/**
     * 필터링 및 페이징이 적용된 인력 분석 리스트 조회
     * * @param request 검색 조건(params) 및 페이징 정보(paging)를 담은 객체
     * @return 페이징 정보와 데이터 리스트를 포함한 공통 응답 객체
     */
    PagedResponse<ResponseWorkforceDistDTO> readWorkforceDistList(SearchRequest request);
}
