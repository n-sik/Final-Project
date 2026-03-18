package com.flowenect.hr.data.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.flowenect.hr.dto.common.SearchRequest;
import com.flowenect.hr.dto.project.ProjectDTO;

@Mapper
public interface ProjectDataMapper {
	/**
     * 1. [목록] 검색 조건에 따른 데이터 총 개수 (페이징 계산용)
     */
    int selectCountProjectPerformance(SearchRequest params);

    /**
     * 2. [목록] 검색 조건 및 페이징이 적용된 프로젝트 리스트 조회
     */
    List<ProjectDTO> selectProjectPerformanceList(SearchRequest params);
}
