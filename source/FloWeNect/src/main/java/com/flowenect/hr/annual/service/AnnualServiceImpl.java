package com.flowenect.hr.annual.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flowenect.hr.annual.mapper.AnnualMapper;
import com.flowenect.hr.dto.AnnualDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class AnnualServiceImpl implements AnnualService {

	private final AnnualMapper annualMapper;
	
	/**
     * 연차 목록 조회
     * - 기본적으로 현재 연도를 기준으로 조회하도록 구현할 수 있습니다.
     */
	@Override
	@Transactional
	public List<AnnualDTO> readAnnualList(String baseYr, String posNm, String search) {
		
        return annualMapper.selectAnnualList(baseYr, posNm, search);

	}

	/**
     * 연차 정보 저장 (Upsert 로직)
     * - 처리된 결과 행 수를 반환합니다.
     */
	@Override
	@Transactional
	public int upsertAnnual(AnnualDTO annualDTO) {
		
		// annualNo가 0이거나 null이면 아직 DB에 연차 데이터가 없는 상태 (최초 수정)
        if (annualDTO.getAnnualNo() == null || annualDTO.getAnnualNo() == 0) {
            log.info("신규 연차 데이터 생성을 시작합니다.");
            return annualMapper.insertAnnual(annualDTO);
        } else {
            log.info("기존 연차 데이터 수정을 시작합니다.");
            return annualMapper.updateAnnual(annualDTO);
        }
		
	}

	/**
	 * 직위별 연차 일괄 등록
	 */
	@Override
	@Transactional
	public int upsertBulkAnnual(String baseYr, String posNm, Integer totAnnualLv) {
		
		// 1. 기존 데이터들 먼저 업데이트 (updateBulk)
	    int updated = annualMapper.updateBulkAnnual(baseYr, posNm, totAnnualLv);
	    // 2. 아직 데이터가 없는 사람들 생성 (insertBulk)
	    int inserted = annualMapper.insertBulkAnnual(baseYr, posNm, totAnnualLv);
	    
	    return updated + inserted;
		
	}

	/**
	 * 단일 항목 삭제
	 */
	@Override
	@Transactional
	public int removeAnnual(Long annualNo) {
		
		return annualMapper.deleteAnnual(annualNo);
		
	}

	/**
	 * 다중 항목 삭제
	 */
	@Override
	@Transactional
	public int removeSelectedAnnual(List<Long> idList) {
		
		if (idList == null || idList.isEmpty()) {
            return 0;
        }
		
		return annualMapper.deleteSelectedAnnual(idList);
		
	}

}
