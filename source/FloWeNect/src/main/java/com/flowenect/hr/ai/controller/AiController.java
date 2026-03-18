package com.flowenect.hr.ai.controller;

import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.flowenect.hr.ai.service.Aiservice;
import com.flowenect.hr.dto.eval.QualTargetDTO;
import com.flowenect.hr.dto.eval.QuantEvalResultDTO;
import com.flowenect.hr.security.auth.EmpDTOWrapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
public class AiController {

    private final Aiservice aiService;

    // 1. 개인 성과 결과 조회
    @GetMapping("rest/ai/quant/result/{empNo}")
    public ResponseEntity<QuantEvalResultDTO> getSavedResult(@PathVariable String empNo) {
        log.info("🌐 [개인조회] /rest/ai/quant/result/{}", empNo);
        QuantEvalResultDTO result = aiService.readSavedAnalysis(empNo);
        return (result != null) ? ResponseEntity.ok(result) : ResponseEntity.noContent().build();
    }

    // 2. 개인 성과 분석 실행
    @PostMapping("rest/ai/quant/analysis")
    public ResponseEntity<?> runAnalysis(@RequestBody QualTargetDTO dto) {
    	
        QuantEvalResultDTO result = aiService.analyzeQuantitativePerformance(dto.getEmpNo());
        
        Map<String, Object> response = new HashMap<>();
        
        response.put("status", "SUCCESS");
        response.put("aiSummary", result);
        response.put("empNo", dto.getEmpNo());
        
        return ResponseEntity.ok(response);
    }

    // 3. 리더 코멘트 저장
    @PostMapping("rest/ai/quant/saveComment")
    public ResponseEntity<?> saveLeaderComment(
    		@RequestBody QuantEvalResultDTO dto,
    		@AuthenticationPrincipal EmpDTOWrapper empDTOWrapper) {
        try {
        	String regEmpNo = empDTOWrapper.getRealUser().getEmpNo();
            boolean isSuccess = aiService.updateLeaderComment(dto, regEmpNo);
            return isSuccess ? ResponseEntity.ok("Success") : ResponseEntity.internalServerError().body("저장 실패");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    // 4. 부서 성과 분석 실행
    @PostMapping("api/ai/dept/analysis")
    public ResponseEntity<?> analyzeDeptPerformance(@RequestBody Map<String, Object> requestData) {
        String deptCd = (String) requestData.get("deptCd");
        log.info("🚀 [부서분석] /api/ai/dept/analysis - 부서: {}", deptCd);
        try {
            Map<String, Object> analysisResult = aiService.analyzeDepartmentPerformance(requestData);
            return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "deptAnalysis", analysisResult,
                "deptCd", deptCd
            ));
        } catch (Exception e) {
            log.error("❌ 부서분석 오류", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("status", "ERROR"));
        }
    }

    // 5. 부서 결과 조회 
    @GetMapping("api/dept/result/{deptCd}")
    public ResponseEntity<?> getSavedDeptResult(@PathVariable String deptCd) {
        log.info("📡 [부서조회] /api/dept/result/{}", deptCd);
        Map<String, Object> savedResult = aiService.readSavedDeptAnalysis(deptCd);
        if (savedResult != null && !savedResult.isEmpty()) {
            return ResponseEntity.ok(Map.of("status", "SUCCESS", "deptAnalysis", savedResult));
        }
        return ResponseEntity.ok(Map.of("status", "EMPTY", "message", "내역 없음"));
    }

    /**
     * 6. 동료 인식 기반 행동 메커니즘 심층 분석 실행
     * POST /api/ai/peer/vector-analysis
     * React의 [AI 심층 분석 실행] 버튼 클릭 시 호출
     */
    @PostMapping("api/ai/peer/vector-analysis")
    public ResponseEntity<?> runPeerVectorAnalysis(@RequestBody Map<String, String> request) {
        String empNo = request.get("empNo");
        log.info("🚀 [벡터분석 실행요청] /api/ai/peer/vector-analysis - 사번: {}", empNo);
        
        try {
            // 서비스 로직: DB 체크 -> 없으면 AI 분석 -> 오라클 저장 -> 결과 반환
            Map<String, Object> result = aiService.analyzePeerBehaviorVector(empNo);
            
            return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "analysisResult", result,
                "empNo", empNo
            ));
        } catch (Exception e) {
            log.error("❌ 벡터 분석 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "ERROR", "message", e.getMessage()));
        }
    }
    
    /**
     * 7. [추가] 기존에 저장된 동료 분석 리포트 단건 조회
     * GET /api/ai/peer/result/{empNo}
     * 사원 선택 시 기존 데이터가 있는지 확인하기 위해 사용
     */
    @GetMapping("api/ai/peer/result/{empNo}")
    public ResponseEntity<?> getSavedPeerReport(@PathVariable String empNo) {
        log.info("📡 [동료리포트 조회] /api/ai/peer/result/{}", empNo);
        
        // 서비스 내부에 이미 '조회 우선' 로직이 있으므로 동일한 메서드 활용 가능
        // 하지만 '분석'을 실행하지는 않고 저장된 것만 가져오고 싶다면 별도의 read 서비스 메서드를 호출해도 좋습니다.
        Map<String, Object> result = aiService.analyzePeerBehaviorVector(empNo); 
        
        if (result != null && "SUCCESS".equals(result.get("status"))) {
            return ResponseEntity.ok(Map.of("status", "SUCCESS", "analysisResult", result));
        }
        return ResponseEntity.ok(Map.of("status", "EMPTY", "message", "저장된 리분석 내역이 없습니다."));
    }
    
    
    /**
     * 8. [신규] 개인 종합 성과 감사 분석
     */
    @PostMapping("/api/ai/individual/total-analysis") // 👈 앞에 / 추가
    public ResponseEntity<?> runTotalPerformanceAnalysis(@RequestBody Map<String, String> request) {
        String empNo = request.get("empNo");
        log.info("🎯 [종합 융합분석 실행] 사번: {}", empNo);

        try {
            Map<String, Object> result = aiService.analyzeTotalPerformance(empNo);
            return ResponseEntity.ok(result); // 서비스에서 이미 SUCCESS 등을 담아서 주므로 그대로 반환
        } catch (Exception e) {
            log.error("❌ 종합 융합 분석 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "ERROR", "message", e.getMessage()));
        }
    }

    /**
     * 9. [추가] 초기 상태 로드 (리액트 useEffect에서 호출하는 부분)
     */
    @GetMapping("/api/ai/individual/read-status/{empNo}") // 👈 GetMapping 확인
    public ResponseEntity<?> getReadStatus(@PathVariable String empNo) {
        log.info("🔍 [초기 상태 조회] 사번: {}", empNo);
        Map<String, Object> result = aiService.readInitialAnalysisStatus(empNo);
        return ResponseEntity.ok(result);
    }
}