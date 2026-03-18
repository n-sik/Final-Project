package com.flowenect.hr.authority.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.flowenect.hr.dto.authority.AuthorityEmpRowDTO;
import com.flowenect.hr.dto.authority.RoleDTO;
import com.flowenect.hr.dto.common.SearchRequest;
import com.flowenect.hr.dto.security.RoleHierarchyEdgeDTO;

@Mapper
public interface AuthorityMapper {

    // 1) 사원 권한 목록
    int selectAuthorityEmpCount(SearchRequest searchRequest);
    List<AuthorityEmpRowDTO> selectAuthorityEmpList(SearchRequest searchRequest);

    // 2) 권한(ROLE_MST)
    List<RoleDTO> selectRoleList();
    RoleDTO selectRoleByRoleCd(@Param("roleCd") String roleCd);
    int selectRoleCountByRoleCd(@Param("roleCd") String roleCd);
    int insertRole(RoleDTO role);
    int updateRole(RoleDTO role);
    int selectEmpRoleCountByRoleCd(@Param("roleCd") String roleCd);
    int selectMenuRoleCountByRoleCd(@Param("roleCd") String roleCd);
    int selectRoleHierarchyRefCount(@Param("roleCd") String roleCd);
    int deleteRoleByRoleCd(@Param("roleCd") String roleCd);

    // 3) Role Hierarchy(ROLE_HIERARCHY)
    List<RoleHierarchyEdgeDTO> selectRoleHierarchyEdges();

    int deleteAllRoleHierarchy();
    int insertRoleHierarchyEdges(List<RoleHierarchyEdgeDTO> edges);
}