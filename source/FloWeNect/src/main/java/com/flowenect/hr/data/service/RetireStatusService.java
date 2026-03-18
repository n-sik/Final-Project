package com.flowenect.hr.data.service;

import java.util.List;

import com.flowenect.hr.dto.common.PagedResponse;
import com.flowenect.hr.dto.common.SearchRequest;
import com.flowenect.hr.dto.data.ResponseRetireDeptSummaryDTO;
import com.flowenect.hr.dto.data.ResponseRetireStatusDTO;

public interface RetireStatusService {

	/**
     * [대시보드 왼쪽] 퇴직 신청서가 존재하는 부서별 요약 현황 조회
     * @return 부서명, 부서코드, 신청 건수가 포함된 AprvDocDTO 리스트
     */
    List<ResponseRetireDeptSummaryDTO> readRetireDeptSummary();
    
    /**
     * [대시보드 오른쪽] 퇴직 승인/현황 상세 목록 조회 (페이징 및 검색 적용)
     * @param request 검색 조건 및 페이징 정보
     * @return 페이징 처리된 퇴직 현황 결과
     */
    PagedResponse<ResponseRetireStatusDTO> readRetireStatusList(SearchRequest request);
}