package com.flowenect.hr.project.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flowenect.hr.commons.exception.PkNotFoundException;
import com.flowenect.hr.dto.project.ProjectCreateReqDTO;
import com.flowenect.hr.dto.project.ProjectDTO;
import com.flowenect.hr.dto.project.ProjectModifyReqDTO;
import com.flowenect.hr.dto.project.ProjectSearchReqDTO;
import com.flowenect.hr.project.mapper.ProjectMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectMapper projectManageMapper;

    @Override
    public List<ProjectDTO> readList(ProjectSearchReqDTO cond) {
        if (cond == null) {
            cond = new ProjectSearchReqDTO();
        }

        if (cond.getUseYn() == null || cond.getUseYn().isBlank()) {
            cond.setUseYn("Y");
        }

        return projectManageMapper.selectProjectManageList(cond);
    }

    @Override
    public ProjectDTO read(Long projectNo) {
        ProjectDTO dto = projectManageMapper.selectProjectManage(projectNo);
        if (dto == null) {
            throw new PkNotFoundException("프로젝트가 존재하지 않습니다. projectNo=" + projectNo);
        }
        return dto;
    }

    @Transactional
    @Override
    public void create(ProjectCreateReqDTO req, String regEmpNo) {
        validateCreate(req);

        if (req.getUseYn() == null || req.getUseYn().isBlank()) {
            req.setUseYn("Y");
        }

        if (regEmpNo == null || regEmpNo.isBlank()) {
            throw new IllegalArgumentException("로그인 정보가 없습니다.");
        }

        int updated = projectManageMapper.insertProject(regEmpNo, req);
        if (updated != 1) {
            throw new IllegalStateException("프로젝트 등록에 실패했습니다.");
        }
    }

    @Transactional
    @Override
    public void modify(ProjectModifyReqDTO req) {
        validateModify(req);

        read(req.getProjectNo());

        int updated = projectManageMapper.updateProject(req);
        if (updated != 1) {
            throw new IllegalStateException("프로젝트 수정에 실패했습니다.");
        }
    }

    @Transactional
    @Override
    public void softDelete(Long projectNo) {
        read(projectNo);

        int updated = projectManageMapper.updateProjectUseYn(projectNo, "N");
        if (updated != 1) {
            throw new IllegalStateException("프로젝트 삭제(소프트) 처리에 실패했습니다.");
        }
    }

    @Transactional
    @Override
    public void restore(Long projectNo) {
        read(projectNo);

        int updated = projectManageMapper.updateProjectUseYn(projectNo, "Y");
        if (updated != 1) {
            throw new IllegalStateException("프로젝트 복구 처리에 실패했습니다.");
        }
    }

    private static void validateCreate(ProjectCreateReqDTO req) {
        if (req == null) {
            throw new IllegalArgumentException("요청값이 없습니다.");
        }
        if (req.getDeptCd() == null || req.getDeptCd().isBlank()) {
            throw new IllegalArgumentException("부서코드(deptCd)는 필수입니다.");
        }
        if (req.getProjectNm() == null || req.getProjectNm().isBlank()) {
            throw new IllegalArgumentException("프로젝트명(projectNm)은 필수입니다.");
        }
        if (req.getProjectStatCd() == null || req.getProjectStatCd().isBlank()) {
            throw new IllegalArgumentException("상태코드(projectStatCd)는 필수입니다.");
        }
        if (req.getStartDtm() == null) {
            throw new IllegalArgumentException("시작일(startDtm)은 필수입니다.");
        }
        if (req.getEndDtm() == null) {
            throw new IllegalArgumentException("종료일(endDtm)은 필수입니다.");
        }
    }

    private static void validateModify(ProjectModifyReqDTO req) {
        if (req == null) {
            throw new IllegalArgumentException("요청값이 없습니다.");
        }
        if (req.getProjectNo() == null) {
            throw new IllegalArgumentException("프로젝트번호(projectNo)는 필수입니다.");
        }
        if (req.getDeptCd() == null || req.getDeptCd().isBlank()) {
            throw new IllegalArgumentException("부서코드(deptCd)는 필수입니다.");
        }
        if (req.getProjectNm() == null || req.getProjectNm().isBlank()) {
            throw new IllegalArgumentException("프로젝트명(projectNm)은 필수입니다.");
        }
        if (req.getProjectStatCd() == null || req.getProjectStatCd().isBlank()) {
            throw new IllegalArgumentException("상태코드(projectStatCd)는 필수입니다.");
        }
        if (req.getStartDtm() == null) {
            throw new IllegalArgumentException("시작일(startDtm)은 필수입니다.");
        }
        if (req.getEndDtm() == null) {
            throw new IllegalArgumentException("종료일(endDtm)은 필수입니다.");
        }
        if (req.getUseYn() == null || req.getUseYn().isBlank()) {
            throw new IllegalArgumentException("사용여부(useYn)는 필수입니다.");
        }
    }
}
