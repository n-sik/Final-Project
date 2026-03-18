package com.flowenect.hr.ai.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.flowenect.hr.dto.eval.QuantEvalResultDTO;

@SpringBootTest
class AiServiceImplTest {

	@Autowired
    private Aiservice aiService;

    @Test
    @DisplayName("AI 정량평가 분석 테스트")
    void testAnalyzeQuantitativePerformance() {
        // 1. Given: 벡터 DB에 데이터가 들어있는 사번 준비
    	QuantEvalResultDTO quantEvalResultDTO = new QuantEvalResultDTO();
    	
    	quantEvalResultDTO.setEmpNo("2025044");

        // 2. When: 분석 실행
        QuantEvalResultDTO result = aiService.analyzeQuantitativePerformance(quantEvalResultDTO.getEmpNo());

        System.out.println("================ AI 분석 결과 ================");
        System.out.println(result);
        System.out.println("============================================");
        
        assertThat(result).isNotNull();
        assertThat(result.getScoreAlign()).isGreaterThan(0); 
        assertThat(result.getAiSummary()).isNotEmpty();
    }
}
