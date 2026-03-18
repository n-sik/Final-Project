package com.flowenect.hr.annual.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.flowenect.hr.dto.AnnualDTO;

@Mapper
public interface AnnualMapper {
	
	/**
     * 연차 목록 조회 (검색어, 직위 필터 포함)
     * @param baseYr 기준년도 (필수)
     * @param search 검색어 (사번, 이름, 직위)
     * @param posNm 직위 필터
     */
    List<AnnualDTO> selectAnnualList(
        @Param("baseYr") String baseYr,  
        @Param("posNm") String posNm,
        @Param("search") String search
    );

    /**
     * 최초 수정 시 신규 생성
     * @param annualDTO
     */
    int insertAnnual(AnnualDTO annualDTO);
    
    /**
     * 단일 연차 정보 수정 (병가, 공가, 포상휴가 등)
     */
    int updateAnnual(AnnualDTO annualDTO);

    /**
     * 특정 직위의 총 연차 일괄 등록
     * @param baseYr 기준년도
     * @param posNm 직위필터
     * @param totAnnualLv 총 연차
     */
    int insertBulkAnnual(
    		@Param("baseYr") String baseYr, 
            @Param("posNm") String posNm, 
            @Param("totAnnualLv") Integer totAnnualLv
    );
    
    /**
     * 특정 직위의 총 연차 일괄 수정
     * @param baseYr 기준년도
     * @param posNm 대상 직위 ("전체"일 경우 처리 필요)
     * @param totAnnualLv 부여할 일수
     */
    int updateBulkAnnual(
        @Param("baseYr") String baseYr, 
        @Param("posNm") String posNm, 
        @Param("totAnnualLv") Integer totAnnualLv
    );

    /**
     * 단일 삭제
     */
    int deleteAnnual(@Param("annualNo") Long annualNo);

    /**
     * 다중 삭제
     */
    int deleteSelectedAnnual(@Param("idList") List<Long> idList);
}
