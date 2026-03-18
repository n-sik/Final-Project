package com.flowenect.hr.authority.service;

import java.util.List;

import com.flowenect.hr.dto.authority.AuthorityEmpRowDTO;
import com.flowenect.hr.dto.authority.EmpRoleUpdateRequestDTO;
import com.flowenect.hr.dto.authority.RoleDTO;
import com.flowenect.hr.dto.authority.RoleSaveRequestDTO;
import com.flowenect.hr.dto.common.PagedResponse;
import com.flowenect.hr.dto.common.SearchRequest;
import com.flowenect.hr.dto.security.RoleHierarchyEdgeDTO;

public interface AuthorityService {

    // 사원 권한
    PagedResponse<AuthorityEmpRowDTO> readAuthorityEmpList(SearchRequest searchRequest);
    void updateEmpRoles(EmpRoleUpdateRequestDTO req);
    byte[] downloadAuthorityEmpExcel(SearchRequest searchRequest);

    // 권한/구조
    List<RoleDTO> readRoleList();
    void createRole(RoleSaveRequestDTO req);
    void updateRole(String roleCd, RoleSaveRequestDTO req);
    void deleteRole(String roleCd);
    List<RoleHierarchyEdgeDTO> readRoleHierarchyEdges();
    void replaceRoleHierarchyEdges(List<RoleHierarchyEdgeDTO> edges);
    void refreshRoleHierarchy();
}