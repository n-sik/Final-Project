package com.flowenect.hr.project.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flowenect.hr.dto.project.ProjectCreateReqDTO;
import com.flowenect.hr.dto.project.ProjectDTO;
import com.flowenect.hr.dto.project.ProjectModifyReqDTO;
import com.flowenect.hr.dto.project.ProjectSearchReqDTO;
import com.flowenect.hr.project.service.ProjectService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/project")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    /**
     * 프로젝트 목록 조회
     * - 검색조건: deptCd, projectStatCd, useYn(Y/N/ALL), keyword
     */
    @GetMapping
    public ResponseEntity<List<ProjectDTO>> readList(ProjectSearchReqDTO cond) {
        List<ProjectDTO> list = projectService.readList(cond);
        return ResponseEntity.ok(list);
    }

    /**
     * 프로젝트 상세 조회
     */
    @GetMapping("/{projectNo}")
    public ResponseEntity<ProjectDTO> read(@PathVariable("projectNo") Long projectNo) {
        ProjectDTO dto = projectService.read(projectNo);
        return ResponseEntity.ok(dto);
    }

    /**
     * 프로젝트 등록
     * - REG_EMP_NO: 로그인 사용자(empNo)
     */
    @PostMapping
    public ResponseEntity<String> create(
            @RequestBody ProjectCreateReqDTO req,
            Authentication authentication
    ) {
        log.info("[프로젝트 등록] req={}", req);
        String regEmpNo = authentication != null ? authentication.getName() : null;
        projectService.create(req, regEmpNo);
        return ResponseEntity.ok("success");
    }

    /**
     * 프로젝트 수정
     */
    @PutMapping
    public ResponseEntity<String> modify(@RequestBody ProjectModifyReqDTO req) {
        log.info("[프로젝트 수정] req={}", req);
        projectService.modify(req);
        return ResponseEntity.ok("success");
    }

    /**
     * 프로젝트 삭제(소프트)
     * - USE_YN='N'
     */
    @DeleteMapping("/{projectNo}")
    public ResponseEntity<String> remove(@PathVariable("projectNo") Long projectNo) {
        log.info("[프로젝트 삭제(소프트)] projectNo={}", projectNo);
        projectService.softDelete(projectNo);
        return ResponseEntity.ok("success");
    }

    /**
     * 프로젝트 복구
     * - USE_YN='Y'
     */
    @PutMapping("/{projectNo}/restore")
    public ResponseEntity<String> restore(@PathVariable("projectNo") Long projectNo) {
        log.info("[프로젝트 복구] projectNo={}", projectNo);
        projectService.restore(projectNo);
        return ResponseEntity.ok("success");
    }
}
