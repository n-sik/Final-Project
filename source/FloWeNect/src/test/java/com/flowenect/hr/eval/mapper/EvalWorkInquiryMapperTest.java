package com.flowenect.hr.eval.mapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.flowenect.hr.dto.assigntask.AssignTaskDTO;
import com.flowenect.hr.dto.dailytasklog.DailyTaskLogDTO;
import com.flowenect.hr.dto.eval.WorkSearchDTO;
import com.flowenect.hr.dto.kpi.KpiDTO;
import com.flowenect.hr.dto.project.ProjectDTO;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@SpringBootTest
@Transactional // 테스트 후 DB를 깨끗하게 롤백합니다.
class EvalWorkInquiryMapperTest {

    @Autowired
    private EvalMapper evalMapper;

    @Test
    @DisplayName("1단계: 사원번호 기준 프로젝트 목록 조회 테스트")
    void testSelectProjectListByEmp() {
        String regEmpNo = "2025044"; 

        // When
        List<ProjectDTO> list = evalMapper.selectProjectListByEmp(regEmpNo);

        // Then
        assertNotNull(list);
        log.info("조회된 프로젝트 수: {}", list.size());
        list.forEach(p -> log.info("프로젝트명: {}", p.getProjectNm()));
    }

    @Test
    @DisplayName("2단계: 프로젝트 번호 기준 KPI 목록 조회 및 개수 검증")
    void testSelectKpiListByProj() {
        // Given: 실제 DB에 존재하는 프로젝트 번호
        Long projNo = 3L; 
        int expectedCount = 2; // 사전에 확인된 KPI 개수

        // When
        List<KpiDTO> kpiList = evalMapper.selectKpiListByProj(projNo);

        // Then
        // 1. 리스트가 null이 아니고 비어있지 않은지 검증
        assertThat(kpiList)
            .as("프로젝트 번호 %d에 해당하는 KPI 목록이 없습니다.", projNo)
            .isNotNull()
            .isNotEmpty();

        // 2. 조회된 KPI 개수가 정확한지 검증
        assertThat(kpiList)
            .hasSize(expectedCount)
            .as("조회된 KPI 개수가 예상(%d)과 다릅니다.", expectedCount);

        log.info("검증 완료 - 조회된 KPI 개수: {}", kpiList.size());
    }

    @Test
    @DisplayName("3단계: 특정 KPI와 특정 사원에 해당하는 업무 리스트 조회 테스트")
    void testSelectTaskListByKpi() {
        // Given: 실제 DB에 존재하는 KPI 번호와 사원 번호 세팅
        Long kpiNo = 62L; 
        String empNo = "2025044"; // 실제 DB에 해당 KPI 업무를 가진 사번 입력

        // 파라미터로 넘길 DTO 객체 생성 및 값 세팅
        AssignTaskDTO searchDto = new AssignTaskDTO();
        searchDto.setKpiNo(kpiNo);
        searchDto.setEmpNo(empNo);

        // When: DTO 객체를 파라미터로 넘겨 업무 리스트 조회
        List<AssignTaskDTO> taskList = evalMapper.selectTaskListByKpi(searchDto);

        // Then: 검증
        assertThat(taskList).isNotNull();

        if (!taskList.isEmpty()) {
            AssignTaskDTO firstTask = taskList.get(0);
            
            log.info("✅ 조회된 업무 개수: {}", taskList.size());
            log.info("✅ 첫 번째 업무 제목: {}", firstTask.getTaskTitle());
            log.info("✅ 담당 사원 번호: {}", firstTask.getEmpNo());

            // 핵심 검증 1: 검색한 KPI 번호가 일치하는가
            assertThat(firstTask.getKpiNo()).isEqualTo(kpiNo);
            
            // 핵심 검증 2: 검색한 사원 번호가 일치하는가 (다른 사람 데이터가 섞이지 않았나)
            assertThat(firstTask.getEmpNo()).isEqualTo(empNo);
            
            assertThat(firstTask.getTaskTitle()).isNotBlank();
        } else {
            log.warn("⚠️ 해당 KPI(번호: {})와 사원(번호: {})에 배정된 업무가 없습니다. DB 데이터를 확인하세요.", kpiNo, empNo);
        }
    }
   
    @Test
    @DisplayName("4단계: 특정 업무(Task)에 달린 일일 업무일지 목록 조회 테스트")
    void testSelectDailyTaskLogListByTask() {
        // Given: 3단계에서 조회된 실제 업무 번호 중 하나 (DB에 데이터가 있는 번호 사용)
        Long taskNo = 1L; 

        // When: 업무 번호로 일지 목록만 단독 조회 (resultType 방식)
        List<DailyTaskLogDTO> logList = evalMapper.selectDailyTaskLogListByTask(taskNo);

        // Then: AssertJ를 이용한 데이터 검증
        assertThat(logList)
            .as("업무 번호 %d에 작성된 일지가 없습니다. DB 데이터를 확인하세요.", taskNo)
            .isNotNull();

        if (!logList.isEmpty()) {
        	DailyTaskLogDTO firstLog = logList.get(0);
            
            log.info("4단계 성공 - 조회된 일지 개수: {}", logList.size());
            log.info("첫 번째 일지 제목: {}", firstLog.getLogTitle());

            assertThat(firstLog.getTaskNo()).isNotNull();
            assertThat(firstLog.getLogTitle()).isNotBlank();
            
            if (logList.size() > 1) {
                assertThat(logList.get(0).getRegDtm())
                    .isAfterOrEqualTo(logList.get(1).getRegDtm());
            }
        }
    }
    
    @Test
    @DisplayName("특정 사원의 개인 업무(KPI 미지정) 조회")
    void testSelectPersonalTaskList() {
        // Given: 실제 DB에 KPI 없이 업무만 등록된 사번
        String empNo = "2025044"; 

        // When: 사번으로 개인 업무 리스트 조회
        List<AssignTaskDTO> personalTasks = evalMapper.selectPersonalTaskList(empNo);

        // Then: 검증
        assertThat(personalTasks).isNotNull();

        if (!personalTasks.isEmpty()) {
            AssignTaskDTO firstTask = personalTasks.get(0);
            
            log.info("조회된 개인 업무 개수: {}", personalTasks.size());
            log.info("첫 번째 개인 업무 제목: {}", firstTask.getTaskTitle());
            log.info("KPI 번호 확인 (NULL이어야 함): {}", firstTask.getKpiNo());

            assertThat(firstTask.getEmpNo()).isEqualTo(empNo);
            assertThat(firstTask.getKpiNo()).isNull();
            assertThat(firstTask.getTaskTitle()).isNotBlank();
            
        } else {
            log.warn("⚠️ 사번 {}에 해당하는 KPI 미지정(개인) 업무가 DB에 없습니다.", empNo);
        }
    }
    
    @Test
    @DisplayName("리더용 업무 통합 조회 - ResultMap 매핑 및 로그 확인")
    void readSearchWorkListTest() {
        // 1. Given
        WorkSearchDTO search = new WorkSearchDTO();
        search.setDeptCd("2026HR01"); 
        search.setSearchType("all");
        search.setSearchKeyword("");

        // 2. When
        List<Map<String, Object>> result = evalMapper.selectSearchWorkList(search);

        // 3. Then
        assertThat(result).isNotNull();
        
        if (!result.isEmpty()) {
            log.info(">>> 조회된 총 건수: {}", result.size());
            
            // 리스트의 첫 번째 데이터 상세 로깅
            Map<String, Object> firstRow = result.get(0);
            
            log.info("========== ResultMap 매핑 결과 ==========");
            log.info("업무번호: {}", firstRow.get("workNo"));
            log.info("업무명: {}", firstRow.get("workNm"));
            log.info("담당자: {}", firstRow.get("empNm"));
            log.info("직급: {}", firstRow.get("rankNm"));
            log.info("시작일: {}", firstRow.get("startDate")); // DB의 start_dtm이 매핑됨
            log.info("종료일: {}", firstRow.get("endDate"));   // DB의 end_dtm이 매핑됨
            log.info("=======================================");

            // 검증
            assertThat(firstRow).containsKey("startDate");
            assertThat(firstRow).doesNotContainKey("START_DTM");
        } else {
            log.warn("!!! 검색 조건에 해당하는 데이터가 DB에 없습니다.");
        }
    }
}