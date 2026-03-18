package com.flowenect.hr.ai.util;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class AiTextParser {

	// 점수 추출 (Alignment: 90 -> 90 반환)
    public int parseScore(String text, String key) {
        Pattern pattern = Pattern.compile(key + ".*?(\\d+)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(text);
        return matcher.find() ? Integer.parseInt(matcher.group(1)) : 0;
    }

    // 마크다운 제거
    public String cleanMarkdown(String text) {
        if (text == null || text.isEmpty()) return "";

        // 1. 시스템용 구분선(---)이나 키워드가 시작되는 위치에서 싹둑 자르기
        String cleaned = text;
        
        // "---" 구분선이 있으면 그 앞까지만 본문으로 인정
        if (cleaned.contains("---")) {
            cleaned = cleaned.split("---")[0];
        }
        
        // 혹시 구분선 없이 키워드만 있을 경우를 대비한 2차 방어
        if (cleaned.contains("추천모델코드:")) {
            cleaned = cleaned.split("추천모델코드:")[0];
        }

        // 2. 남은 본문에서 불필요한 마크다운 기호 및 공백 정리
        return cleaned.replaceAll("(?m)^#+\\s?", "") // # 제목 기호 제거
                      .replaceAll("\\*\\*", "")      // ** 강조 기호 제거
                      .trim();                        // 앞뒤 불필요한 공백 제거
    }
    
    // 등급 추출 (Grade: 우수 또는 Grade: S -> 우수/S 반환)
    public String parseGrade(String text) {
        if (text == null) return "보통";
        
        // Grade: 뒤에 오는 한글 또는 영문 대문자 추출
        Pattern pattern = Pattern.compile("Grade\\s*:\\s*([가-힣A-Z]+)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(text);
        
        return matcher.find() ? matcher.group(1) : "보통";
    }
    
    /**
     * AI 답변 본문에서 '추천 모델: ' 뒤에 오는 모델명을 추출합니다.
     * 예: "추천 모델: MCEF 가치 수호자" -> "가치 수호자" 반환
     */
    public String parseRecommendedModel(String text) {
        try {
            if (text == null) return "미정의 모델";

            // 1. "추천 모델: 코드 명칭" 패턴 매칭
            Pattern pattern = Pattern.compile("추천\\s*모델\\s*:\\s*(?:[A-Z]+\\s+)?([^\\n\\r*#]+)");
            Matcher matcher = pattern.matcher(text);
            
            if (matcher.find()) {
                return matcher.group(1).trim();
            }
            
            // 2. 패턴 매칭 실패 시 첫 줄의 핵심 키워드 추출
            String firstLine = text.split("\n")[0].replaceAll("[#*]", "").trim();
            return firstLine.length() > 20 ? "맞춤형 행동 모델" : firstLine;
            
        } catch (Exception e) {
            return "분석 모델";
        }
    }
    
 // AiTextParser.java 에 추가/수정
    public Map<String, String> parseModelInfo(String text) {
        Map<String, String> res = new HashMap<>();
        
        // 🔴 NULL 방지 기본값 세팅
        res.put("code", "UNKNOWN");
        res.put("name", "행동 모델 분석 중"); 

        // 1. 모델 코드 추출
        Pattern codeP = Pattern.compile("추천모델코드:\\s*([A-Z]{4})");
        Matcher codeM = codeP.matcher(text);
        if (codeM.find()) res.put("code", codeM.group(1));

        // 2. 모델 명칭 추출
        Pattern nameP = Pattern.compile("추천모델명:\\s*([^\n\r]+)");
        Matcher nameM = nameP.matcher(text);
        if (nameM.find()) {
            res.put("name", nameM.group(1).trim());
        } else if (!res.get("code").equals("UNKNOWN")) {
            // 🔴 코드는 찾았는데 이름이 없을 경우 코드를 이름으로 대체 (임시 방편)
            res.put("name", res.get("code") + " 행동 모델");
        }

        return res;
    }

}
