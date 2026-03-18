package com.flowenect.hr.IndividualEval.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.flowenect.hr.IndividualEval.mapper.IndividualEvalMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class IndividualEvalServiceImpl implements IndividualEvalService {
	
    private final IndividualEvalMapper individualEvalMapper;

    /**
     * 개인평가 리포트 데이터 조회
     * 동료들이 평가한 모든 CBTI 유형과 상세 내용(typeCn)을 취합합니다.
     */
    @Override
    public Map<String, Object> getIndividualEvalReport(String empNo) {
        log.info("개인평가 데이터 조회 시작 - 사번: {}", empNo);
        
        Map<String, Object> resultMap = new HashMap<>();
        
        try {
            List<Map<String, Object>> peerEvaluations = individualEvalMapper.selectIndividualEvalCbti(empNo);
            
            resultMap.put("peerEvaluations", peerEvaluations);
            resultMap.put("totalCount", peerEvaluations != null ? peerEvaluations.size() : 0);
            resultMap.put("targetEmpNo", empNo);
            log.info("리턴 전 데이터 확인: {}", peerEvaluations);
            log.info("조회 완료 - 피드백 건수: {}건", resultMap.get("totalCount"));
            
            
        } catch (Exception e) {
            log.error("개인평가 조회 중 오류 발생: ", e);
            resultMap.put("error", "데이터 조회 중 오류가 발생했습니다.");
            resultMap.put("peerEvaluations", List.of());
            resultMap.put("totalCount", 0);
        }
        return resultMap;
    }
}
