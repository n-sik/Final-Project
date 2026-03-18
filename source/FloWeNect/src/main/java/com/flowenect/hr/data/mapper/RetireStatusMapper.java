package com.flowenect.hr.data.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.flowenect.hr.dto.common.SearchRequest;
import com.flowenect.hr.dto.data.ResponseRetireDeptSummaryDTO;
import com.flowenect.hr.dto.data.ResponseRetireStatusDTO;

@Mapper
public interface RetireStatusMapper {

    /**
     * 퇴직 신청서가 존재하는 부서별 현황 요약 조회
     * (부서명, 부서코드, 해당 부서의 상태별 신청 건수)
     * * @return 부서별 요약 정보가 담긴 AprvDocDTO 리스트
     */
    List<ResponseRetireDeptSummaryDTO> selectRetireDeptSummary();
    
    /**
     * [우측 테이블] 퇴직 현황 총 개수 조회 (페이징 계산용)
     * @param request 검색 조건 (dept, keyword 등)
     */
    int selectRetireStatusCount(SearchRequest request);

    /**
     * [우측 테이블] 퇴직 승인/현황 상세 목록 조회
     * @param request 검색 조건 및 페이징 범위 정보
     */
    List<ResponseRetireStatusDTO> selectAprvRetireList(SearchRequest request);

}