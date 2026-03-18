package com.flowenect.hr.IndividualEval.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface IndividualEvalMapper {
	/**
     * 동료 평가 데이터와 유형 상세 정보를 조인하여 조회
     * @param empNo 대상자 사번
     * @return 동료 평가 리스트 (rspnsDtm, actnTypeRslt, typeNm, typeCn 포함)
     */
    List<Map<String, Object>> selectIndividualEvalCbti(String empNo);
}