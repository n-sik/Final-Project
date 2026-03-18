package com.flowenect.hr.dto.eval;

import lombok.Data;

@Data
public class QuantEvalResultDTO {

	private Long evalResNo;      // 결과 고유 번호 (PK)
    private String empNo;        // 사번
    private String evalYear;     // 평가 연도
    private String evalHalf;     // 평가 반기
    
    // 정량 지표 5인방
    private int scoreAlign;      // 목표합치도
    private int scoreSpeed;      // 수행속도
    private int scoreFaith;      // 업무성실도
    private int scoreReach;      // 목표달성률
    private int scoreDiff;       // 업무난이도
    
    private String aiSummary;    // AI 상세 분석 의견
    private String regEmpNo;     // 등록자(팀장님) 사번
    private String regDtm;       // 등록 일시
    private String regComent;    // 팀장 의견
}
