package com.flowenect.hr.data.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.flowenect.hr.dto.common.SearchRequest;
import com.flowenect.hr.dto.data.ResponseWorkforceDistDTO;

@Mapper
public interface WorkforceDistMapper {
	/**
     * 인력 분석 리스트 조회 (필터 및 정렬 적용)
     * XML id: selectWorkforceDistList
     */
    List<ResponseWorkforceDistDTO> selectWorkforceDistList(SearchRequest request);
    
    /**
     * 필터 조건에 따른 전체 데이터 개수 조회 (페이징용)
     * XML id: selectWorkforceDistCount
     */
    int selectWorkforceDistCount(SearchRequest request);
}
