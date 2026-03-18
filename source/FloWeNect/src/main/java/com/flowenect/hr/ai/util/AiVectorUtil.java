package com.flowenect.hr.ai.util;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.Filter;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class AiVectorUtil {
    private final VectorStore vectorStore;

    /**
     * [검색] 공통 벡터 컨텍스트 검색 로직
     * id(사번/부서코드)와 type(데이터 종류)을 필터링하여 정확한 데이터를 가져옵니다.
     */
    public String searchContext(String id, String type, String query) {
        FilterExpressionBuilder feb = new FilterExpressionBuilder();
        
        List<Document> docs = vectorStore.similaritySearch(
            org.springframework.ai.vectorstore.SearchRequest.builder()
                .query(query)
                .topK(10)
                .filterExpression(
                    feb.and(
                        feb.eq("id", id),
                        feb.eq("type", type)
                    ).build()
                )
                .build()
        );

        if (docs == null || docs.isEmpty()) {
            return "관련 분석 데이터를 찾을 수 없습니다.";
        }

        return docs.stream()
                   .map(Document::getText)
                   .collect(Collectors.joining("\n"));
    }
    
    /**
     * 정량 성과 실적 로그를 벡터 DB에 동기화
     */
    public void syncQuantFact(String empNo, List<Map<String, Object>> latestLogs) {
        if (latestLogs == null || latestLogs.isEmpty()) return;

        List<Document> documents = latestLogs.stream().map(log -> {
            String content = String.format(
                "업무: %s | 프로젝트: %s | 진행률: %s%% | 일지: %s",
                log.get("TASK_TITLE"), log.get("PROJECT_NM"), 
                log.get("TASK_PROGRESS"), log.get("LOG_CONTENT")
            );
            
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("empNo", empNo);
            metadata.put("type", "QUANT_FACT");
            metadata.put("taskNo", log.get("TASK_NO"));         // 특정 업무 추적용
            metadata.put("projectNm", log.get("PROJECT_NM"));   // 프로젝트별 필터링용
            metadata.put("regDate", log.get("REG_DATE"));       // 기간별 분석용
            metadata.put("progress", log.get("TASK_PROGRESS")); // 저성과자 추출용
            
            return new Document(content, metadata);
        }).collect(Collectors.toList());

        vectorStore.add(documents);
        log.info("🚀 [Vector DB] 상세 메타데이터 포함 {}건 동기화 완료", documents.size());
    }
    
    public void syncQualFactMap(String empNo, List<Map<String, Object>> qualDetails) {
        if (qualDetails == null || qualDetails.isEmpty()) {
            log.warn("⚠️ [Vector DB] 해당 부서원에 대한 부서장 평가 데이터가 없습니다. (사번: {})", empNo);
            return;
        }

        List<Document> documents = qualDetails.stream()
            .map(q -> {
                // 1. MyBatis Map에서 컬럼값 추출 (대소문자 방어)
                String comment = findValue(q, "EVAL_COMMENT", "evalComment", "평가 의견 미작성");
                String score = findValue(q, "EVAL_SCORE", "evalScore", "0");
                
                // 2. AI가 검색할 핵심 문장 구성 (이 'content'가 AI가 읽는 데이터입니다)
                // 부서장(평가자)의 관점임을 명시하여 신뢰도를 높입니다.
                String content = String.format("[부서장 정성평가] 항목 점수: %s/5 | 부서장 상세 의견: %s", score, comment);
                
                // 3. 메타데이터 (필터링용)
                Map<String, Object> metadata = new HashMap<>();
                metadata.put("empNo", empNo);
                metadata.put("type", "QUAL_FACT");

                log.info("📝 [부서장 평가 임베딩 생성] 사번: {}, 내용 요약: {}", empNo, comment);
                return new Document(content, metadata);
            })
            .collect(Collectors.toList());

        // 4. 저장
        vectorStore.add(documents);
    }

    // 맵에서 값을 찾는 안전한 헬퍼 메서드
    private String findValue(Map<String, Object> map, String upper, String lower, String defaultVal) {
        if (map.get(upper) != null) return String.valueOf(map.get(upper));
        if (map.get(lower) != null) return String.valueOf(map.get(lower));
        return defaultVal;
    }
    
    /**
     * 부서별 프로젝트 성과 데이터를 벡터 DB에 동기화합니다.
     */
    public void syncDeptPerformance(String deptCd, List<Map<String, Object>> projects) {
        if (projects == null || projects.isEmpty()) return;

        List<Document> documents = projects.stream().map(proj -> {
            // AI가 읽을 분석용 텍스트
            String content = String.format(
                "부서코드: %s | 프로젝트: %s | 상태: %s | 달성률: %s%% | 성과요약: %s",
                deptCd, 
                proj.get("PROJECT_NM"), 
                proj.get("STATUS"), 
                proj.get("PROGRESS"), 
                proj.get("OUTCOME")
            );

            // 검색 및 삭제용 메타데이터 (사번 대신 부서코드를 키로 사용)
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("deptCd", deptCd); // 🔴 핵심: 부서 필터링용
            metadata.put("type", "DEPT_PERF");
            
            return new Document(content, metadata);
        }).collect(Collectors.toList());

        vectorStore.add(documents);
        log.info("🏢 [Vector DB] {} 부서 프로젝트 {}건 동기화 완료", deptCd, documents.size());
    }

    /**
     * [저장] 정량 평가용 성과 팩트 동기화
     */
    public void syncQuantFact(String empNo, Map<String, Object> factData) {
        String content = formatFactToString(factData); 
        
        // 메타데이터 구성 (id, type)
        Document doc = new Document(content, Map.of("id", empNo, "type", "QUANT_FACT"));
        
        vectorStore.add(List.of(doc));
        log.info("📥 [VectorDB] 사번 {}의 정량 성과 팩트 동기화 완료", empNo);
    }

    /**
     * [저장] 동료 피드백/부서 KPI 리스트 동기화
     */
    public void syncPeerFeedback(String id, List<Map<String, Object>> dataList) {
        List<Document> docs = dataList.stream().map(row -> {
            // DB 컬럼명에 따라 typeCn 또는 적절한 텍스트 컬럼 추출
            String content = String.valueOf(row.getOrDefault("typeCn", row.getOrDefault("TASK_TITLE", "데이터 없음")));
            
            Map<String, Object> metadata = Map.of(
                "id", id,
                "type", "PEER_LOG", // 혹은 동적으로 전달받은 type
                "evaluator", row.getOrDefault("EMP_NM", "Anonymous")
            );
            
            return new Document(content, metadata);
        }).collect(Collectors.toList());

        vectorStore.add(docs);
        log.info("📥 [VectorDB] ID {}의 피드백/로그 {}건 동기화 완료", id, docs.size());
    }
    
    /**
     * [저장] DB 속성을 메타데이터로 완벽하게 반영한 정성평가 동기화
     */
    public void syncQualitativeEval(String empNo, List<Map<String, Object>> evalList, String evalType) {
        if (evalList == null || evalList.isEmpty()) return;

        List<Document> documents = evalList.stream()
            .map(row -> {
                String comment = String.valueOf(row.getOrDefault("EVAL_COMMENT", row.getOrDefault("evalComment", "")));
                String score = String.valueOf(row.getOrDefault("EVAL_SCORE", row.getOrDefault("evalScore", "0")));

                if (comment.trim().isEmpty() || "null".equalsIgnoreCase(comment)) return null;

                String content = String.format("[%s] 점수: %s | 의견: %s", evalType, score, comment);
                
                Map<String, Object> metadata = new HashMap<>();
                metadata.put("id", empNo);      
                metadata.put("type", evalType);

                return new Document(content, metadata);
            })
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

        if (!documents.isEmpty()) {
            vectorStore.add(documents);
            log.info("🚀 [VectorDB] 사번 {}의 {} 데이터 {}건 동기화 완료 (점수/내용 중심)", empNo, evalType, documents.size());
        }
    }
    
    /**
     * Map 데이터를 AI가 읽기 좋은 문장 리스트로 변환
     */
    private String formatFactToString(Map<String, Object> factData) {
        if (factData == null || factData.isEmpty()) return "성과 데이터 없음";

        StringBuilder sb = new StringBuilder();
        sb.append(" [인사 성과 분석 실적 팩트 데이터] \n");

        factData.forEach((key, value) -> {
            if (value != null) {
                sb.append("- ").append(key).append(": ").append(value).append("\n");
            }
        });

        return sb.toString();
    }
    
    /**
     * AI가 추천한 CBTI 모델 정보를 추출합니다.
     * @return [모델코드, 모델명] 형태의 배열
     */
    public String[] parseRecommendedModelInfo(String text) {
        String[] result = new String[]{"UNKNOWN", "미정의 모델"};
        try {
            // Recommended Model: ([코드]) ([명칭]) 패턴 매칭
            Pattern pattern = Pattern.compile("Recommended\\s*Model\\s*:\\s*([A-Z]+)?\\s*([^\\n\\r*#]+)", Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(text);
            
            if (matcher.find()) {
                result[0] = matcher.group(1) != null ? matcher.group(1).trim() : "CUSTOM";
                result[1] = matcher.group(2).trim();
            }
        } catch (Exception e) {
            log.error("모델 정보 파싱 실패", e);
        }
        return result;
    }
    
    /**
     * 특정 사원의 특정 타입 벡터 데이터 삭제 (중복 방지 및 최신화용)
     */
    public void deleteVectorData(String empNo, String category) {
        try {
            // 1. 유사도 검색이 아니라, 메타데이터 필터를 사용하여 해당 사원의 데이터만 특정
            // 예: empNo가 '2026030266'이고 category가 'QUANT_FACT'인 것들
        	FilterExpressionBuilder b = new FilterExpressionBuilder();
        	Filter.Expression filter = b.and(
        	        b.eq("empNo", empNo), 
        	        b.eq("category", category)
        	).build();

            // 2. 필터 조건에 맞는 모든 문서를 조회 (유사도 텍스트는 무시 가능)
            SearchRequest request = SearchRequest.builder()
                    .filterExpression(filter)
                    .build();

            List<Document> documents = vectorStore.similaritySearch(request);

            if (!documents.isEmpty()) {
                List<String> ids = documents.stream().map(Document::getId).toList();
                vectorStore.delete(ids);
                log.info("✅ 사원 {}의 {} 벡터 데이터 {}건 삭제 완료", empNo, category, ids.size());
            }
        } catch (Exception e) {
            log.error("❌ 벡터 삭제 중 오류: {}", e.getMessage());
        }
    }
}