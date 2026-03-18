package com.flowenect.hr.security.policy.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.flowenect.hr.dto.security.RoleHierarchyEdgeDTO;

@Mapper
public interface SecurityPolicyMapper {

    /**
     * ROLE_HIERARCHY 테이블에서 (PARENT_ROLE_CD, CHILD_ROLE_CD) 목록을 조회합니다.
     */
    List<RoleHierarchyEdgeDTO> selectRoleHierarchyEdges();

    /**
     * SEC_POLICY_VER에서 정책 버전을 조회합니다. (없으면 null)
     */
    Integer selectPolicyVer(@Param("policyKey") String policyKey);
}