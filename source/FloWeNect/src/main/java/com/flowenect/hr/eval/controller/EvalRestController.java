package com.flowenect.hr.eval.controller;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flowenect.hr.dto.assigntask.AssignTaskDTO;
import com.flowenect.hr.dto.common.PagingDTO;
import com.flowenect.hr.dto.dailytasklog.DailyTaskLogDTO;
import com.flowenect.hr.dto.eval.QualEvalResultDTO;
import com.flowenect.hr.dto.eval.QualTargetDTO;
import com.flowenect.hr.dto.eval.WorkSearchDTO;
import com.flowenect.hr.dto.kpi.KpiDTO;
import com.flowenect.hr.dto.project.ProjectDTO;
import com.flowenect.hr.eval.service.EvalService;
import com.flowenect.hr.security.auth.EmpDTOWrapper;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/rest/leader")
public class EvalRestController {

    @Autowired
    private EvalService evalService;

    /**
     * [정성평가 목록] 부서별 정량 평가 문항 및 대상 사원 현황 조회
     * @param pagingDTO 페이징 처리를 위한 객체
     * @return 평가 항목(Questions), 대상자 리스트(Members), 페이징 정보를 포함한 맵
     * ※ 비즈니스 로직: 리더가 소속 부서원들의 평가 현황을 한눈에 파악하기 위한 기초 데이터를 제공합니다.
     */
    @GetMapping("/qual/eval/readList")
    public Map<String, Object> getQualEvalList(
    		@Valid PagingDTO pagingDTO,
    		@AuthenticationPrincipal EmpDTOWrapper userDetails
    		) {
    	return evalService.readListQualEval(userDetails, pagingDTO);
    }
    
    /**
     * [정량평가 대상 조회] AI 분석을 위한 부서원 명단 및 평가 상태 조회
     * @param reqDTO deptCd, evalYear, evalHalf를 포함
     */
    @GetMapping("/quant/eval/readList")
    public Map<String, Object> getQuantTargetList(
    		QualTargetDTO qualTargetDTO,
    		@AuthenticationPrincipal EmpDTOWrapper userDetails
    		) {
    	String loginDeptCd = userDetails.getRealUser().getDeptCd();
    	qualTargetDTO.setDeptCd(loginDeptCd);
        return Map.of("targetList", evalService.readQuantDeptEmpList(qualTargetDTO));
    }

    /**
     * [정량평가 제출] AI가 작성한 사원별 정량 평가 결과 저장
     * @param dto 평가 점수 및 의견이 담긴 결과 객체
     * @return 성공 메시지
     * ※ 비즈니스 로직: 입력된 평가 데이터를 검증 후 DB에 최종 반영하며, 제출 후에는 수정 권한이 제한될 수 있습니다.
     */
    @PostMapping("/qual/eval/create")
    public Map<String, String> createQualEval(
    		@Valid @RequestBody QualEvalResultDTO dto,
    		@AuthenticationPrincipal EmpDTOWrapper emp
    		) {
    	String currentLoginEmpNo = emp.getRealUser().getEmpNo();
    	dto.setEvaluatorId(currentLoginEmpNo);
        evalService.createQualEval(dto);
        return Map.of("message", "평가 제출이 성공적으로 완료되었습니다.");
    }

    /**
     * [정량평가 데이터] 업무 조회를 위한 부서 소속 사원 명단 조회
     * @return 부서원 기본 정보 및 현재 평가 진행 상태 리스트
     * ※ 비즈니스 로직: 업무 조회 화면 진입 시, 좌측 사원 리스트(ag-Grid)를 렌더링하기 위한 데이터를 호출합니다.
     */
    @GetMapping("/work/readList")
    public Map<String, Object> getQualWorkList(
    		@AuthenticationPrincipal EmpDTOWrapper userDetails
    		) {
        return Map.of("deptList", evalService.readDeptEmpList(userDetails.getRealUser().getDeptCd()));
    }
    
    /**
     * [1단계] 특정 사원이 현재 참여 중인 프로젝트 목록 조회
     * URL: GET /rest/leader/projects/{empNo}
     * @return 사원별 참여 프로젝트 DTO 리스트
     */
    @GetMapping("/projects/{empNo}")
    public ResponseEntity<List<ProjectDTO>> getProjectList(@PathVariable String empNo) {
        log.info("조회 요청 [1단계]: 사원번호 {} 프로젝트 목록", empNo);
        List<ProjectDTO> list = evalService.readProjectList(empNo);
        return ResponseEntity.ok(list != null ? list : Collections.emptyList());
    }

    /**
     * [2단계] 선택된 프로젝트에 포함된 상세 KPI 목록 조회
     * URL: GET /rest/leader/kpis/{projNo}
     * @return 프로젝트별 KPI 상세 정보 리스트
     */
    @GetMapping("/kpis/{projNo}/{empNo}")
    public ResponseEntity<List<KpiDTO>> getKpiList(@PathVariable Long projNo, @PathVariable String empNo) {
        log.info("조회 요청 [2단계]: 프로젝트번호 {} KPI 목록", projNo);
        List<KpiDTO> list = evalService.readKpiList(projNo, empNo);
        return ResponseEntity.ok(list != null ? list : Collections.emptyList());
    }

    /**
     * [3단계] 특정 KPI 내의 담당 업무(Task) 목록 조회
     * @param kpiNo         경로 변수(PathVariable)로 전달된 KPI 번호
     * @param assignTaskDTO 커맨드 객체: 쿼리 스트링(?empNo=xxx)으로 넘어온 사번이 자동으로 바인딩됨
     * @return 특정 사원이 해당 KPI 달성을 위해 수행 중인 세부 업무 리스트
     * 같은 KPI라도 사원마다 맡은 업무가 다르므로, 
     * 전체 업무가 아닌 '선택된 사원'의 업무만 필터링하기 위해 assignTaskDTO 내의 empNo가 반드시 필요함.
     */
    @GetMapping("/tasks/{kpiNo}")
    public ResponseEntity<List<AssignTaskDTO>> getTaskList(
        @PathVariable Long kpiNo, 
        AssignTaskDTO assignTaskDTO
    ) {
    	assignTaskDTO.setKpiNo(kpiNo);
        List<AssignTaskDTO> list = evalService.readTaskList(assignTaskDTO);
        return ResponseEntity.ok(list);
    }

    /**
     * [4단계] 특정 담당 업무(Task)에 작성된 일일 업무일지(Log) 목록 조회
     * @param taskNo 경로 변수로 전달된 담당 업무 번호
     * @return 해당 업무에 대해 그동안 작성된 모든 업무일지 리스트
     * 업무 번호(taskNo)는 이미 특정 사원의 업무로 고유하게(Unique) 생성된 번호이므로,
     * 별도의 사번(empNo) 없이 taskNo만으로도 정확한 데이터 조회가 가능함.
     */
    @GetMapping("/logs/{taskNo}")
    public ResponseEntity<List<DailyTaskLogDTO>> getLogList(@PathVariable Long taskNo) {
        log.info("조회 요청 [4단계]: 업무번호 {} 일지 목록", taskNo);
        List<DailyTaskLogDTO> list = evalService.readLogList(taskNo);
        return ResponseEntity.ok(list != null ? list : Collections.emptyList());
    }
    
    /**
     * [개인업무] 특정 사원의 KPI 미배정 개인 업무 목록 조회
     * URL: GET /rest/leader/personal-tasks/{empNo}
     * @param empNo 조회 대상 사원의 사번
     * @return KPI 번호가 NULL인 개인 전용 AssignTaskDTO 리스트
     * ※ 비즈니스 로직: 성과지표(KPI)와 연결되지 않은 사원 개인의 업무 리스트를 반환합니다.
     */
    @GetMapping("/personal-tasks/{empNo}")
    public ResponseEntity<List<AssignTaskDTO>> getPersonalTaskList(@PathVariable String empNo) {
        log.info("📡 조회 요청 [개인업무]: 사번 {} 목록 조회", empNo);
        
        List<AssignTaskDTO> list = evalService.readPersonalTaskList(empNo);
        
        return ResponseEntity.ok(list != null ? list : Collections.emptyList());
    }
    
    /**
     * [리더용 업무 통합 조회 API]
     * GET /rest/eval/work-list
     * @param searchDTO (deptCd, startDate, endDate, searchType, searchKeyword)
     * @return 검색된 업무 리스트 JSON
     */
    @GetMapping("/work-list")
    public ResponseEntity<List<Map<String, Object>>> getSearchWorkList(WorkSearchDTO searchDTO) {
        
        log.info("업무 조회 요청 수신 - 부서: {}", searchDTO.getDeptCd());
        log.info("📡 넘어온 데이터 확인: {}", searchDTO.toString());
        // 서비스 호출
        List<Map<String, Object>> resultList = evalService.readSearchWorkList(searchDTO);
        
        // 결과가 비어있어도 200 OK와 빈 배열([])을 반환하는 것이 REST 표준입니다.
        return ResponseEntity.ok(resultList);
    }
}