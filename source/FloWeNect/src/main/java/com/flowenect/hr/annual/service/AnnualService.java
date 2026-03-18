package com.flowenect.hr.annual.service;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import com.flowenect.hr.dto.AnnualDTO;

public interface AnnualService {
	
	/**
	 * 연차 목록 조회 (검색어, 직위 필터 포함)
	 * @param baseYr
	 * @param posNm
	 * @param search
	 */
	List<AnnualDTO> readAnnualList(String baseYr, String posNm, String search);
	
	/**
	 * 연차 정보 저장 (Upsert 로직)
	 * - annualNo가 0이면 insertAnnual, 있으면 updateAnnual 호출
	 * @param annualDTO
	 */
	int upsertAnnual(AnnualDTO annualDTO);
	
	/**
	 * 직위별 연차 일괄 등록 (Upsert 로직)
	 * (기존 데이터는 Update, 신규 데이터는 Insert 처리)
	 * @param baseYr
	 * @param posNm
	 * @param totAnnualLv
	 */
	int upsertBulkAnnual(String baseYr, String posNm, Integer totAnnualLv);
	
	/**
	 * 단일 삭제
	 * @param annualNo
	 */
	int removeAnnual(Long annualNo);
	
	/**
	 * 다중 삭제
	 * @param idList
	 */
	int removeSelectedAnnual(List<Long> idList);
}
