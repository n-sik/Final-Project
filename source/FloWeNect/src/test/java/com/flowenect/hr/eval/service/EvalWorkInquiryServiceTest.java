package com.flowenect.hr.eval.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.log;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.flowenect.hr.dto.assigntask.AssignTaskDTO;
import com.flowenect.hr.dto.dailytasklog.DailyTaskLogDTO;
import com.flowenect.hr.dto.kpi.KpiDTO;
import com.flowenect.hr.dto.project.ProjectDTO;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@SpringBootTest
@Transactional
class EvalWorkInquiryServiceTest {

    @Autowired
    private EvalService evalService;

    @Test
    @DisplayName("업무 조회 시나리오: 1단계부터 4단계까지 순차적 데이터 로드 검증")
    void testWorkInquiryFullCycle() {
        String empNo = "2025044"; 
        List<ProjectDTO> projects = evalService.readProjectList(empNo);
        
        assertThat(projects).isNotNull();
        log.info("1단계 성공: 사원 {}의 프로젝트 수 = {}", empNo, projects.size());

        if (!projects.isEmpty()) {
            Long projNo = projects.get(0).getProjectNo();
            List<KpiDTO> kpis = evalService.readKpiList(projNo);
            
            assertThat(kpis).isNotNull();
            log.info("2단계 성공: 프로젝트 {}의 KPI 수 = {}", projNo, kpis.size());
            
            if (!kpis.isEmpty()) {
                Long kpiNo = kpis.get(0).getKpiNo();
                
                AssignTaskDTO taskSearch = new AssignTaskDTO();
                taskSearch.setKpiNo(kpiNo);
                taskSearch.setEmpNo(empNo);

                List<AssignTaskDTO> tasks = evalService.readTaskList(taskSearch);
                
                assertThat(tasks).isNotNull();
                log.info("3단계 성공: KPI {} & 사원 {}의 업무 수 = {}", kpiNo, empNo, tasks.size());

                if (!tasks.isEmpty()) {
                    // [4단계] 첫 번째 업무의 일지(Log) 조회
                    // 업무 번호(taskNo)는 고유값이므로 기존 로직대로 조회 가능합니다.
                    Long taskNo = tasks.get(0).getTaskNo();
                    List<DailyTaskLogDTO> logs = evalService.readLogList(taskNo);
                    
                    assertThat(logs).isNotNull();
                    log.info("4단계 성공: 업무 {}의 일지 수 = {}", taskNo, logs.size());
                    
                    if(!logs.isEmpty()) {
                        // DTO 필드명에 맞춰 확인 (getLogContent 또는 getLogTitle)
                        log.info("최종 확인 - 최신 일지 내용: {}", logs.get(0).getLogCn());
                    }
                } else {
                    log.warn("3단계 경고: KPI {}에 해당하는 업무 데이터가 DB에 없습니다.", kpiNo);
                }
            }
        }
    }
    
    @Test
    @DisplayName("[서비스 테스트] 사원별 개인 업무(KPI 미지정) 조회 로직 검증")
    void testReadPersonalTaskList() {
        String empNo = "2025044";

        // When: 서비스 메서드 호출
        List<AssignTaskDTO> personalTasks = evalService.readPersonalTaskList(empNo);

        // Then: 검증 로직
        // 1. 결과 리스트가 null이 아니어야 함
        assertThat(personalTasks).isNotNull();

        if (!personalTasks.isEmpty()) {
            AssignTaskDTO firstTask = personalTasks.get(0);

            log.info("서비스 조회 결과 개수: {}", personalTasks.size());
            log.info("첫 번째 개인 업무 제목: {}", firstTask.getTaskTitle());
            
            // 2. 핵심 비즈니스 규칙: 개인 업무는 KPI 번호가 없어야 함
            assertThat(firstTask.getKpiNo()).isNull();
            
            // 3. 해당 사원의 데이터가 맞는지 확인
            assertThat(firstTask.getEmpNo()).isEqualTo(empNo);
            
            // 4. 필수 필드 값이 누락되지 않았는지 확인 (진척률 등)
            assertThat(firstTask.getProgressRate()).isNotNull();
        } else {
            log.warn("⚠️ 테스트 주의: 사번 {}에 대한 개인 업무 데이터가 DB에 없어 검증을 건너뜁니다.", empNo);
        }
    }
}
