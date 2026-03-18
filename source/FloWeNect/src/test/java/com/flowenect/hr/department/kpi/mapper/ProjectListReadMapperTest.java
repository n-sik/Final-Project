//package com.flowenect.hr.department.kpi.mapper;
//
//import static org.junit.jupiter.api.Assertions.*;
//
//import java.util.List;
//
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.transaction.annotation.Transactional;
//
//import com.flowenect.hr.dto.ProjectDTO;
//
//import lombok.extern.slf4j.Slf4j;
//
//@SpringBootTest
//@Transactional
//@Slf4j
//class ProjectListReadMapperTest {
//
//    @Autowired
//    private ProjectListReadMapper mapper;
//
//    @Test
//    void selectProjectForView_test() {
//
//        // when
//        List<ProjectDTO> projectList = mapper.selectProjectForView(String deptCd);
//
//        // then
//        assertAll(
//            () -> assertNotNull(projectList, "projectList는 null이면 안 됩니다."),
//            () -> log.info("▶ projectList size = {}", projectList.size()),
//            () -> {
//                if (!projectList.isEmpty()) {
//                    ProjectDTO dto = projectList.get(0);
//                    assertNotNull(dto.getProjectNo(), "projectNo는 null이면 안 됩니다.");
//                    assertNotNull(dto.getProjectNm(), "projectNm은 null이면 안 됩니다.");
//                }
//            }
//        );
//    }
//}
