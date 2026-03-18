package com.flowenect.hr.security.policy.service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.flowenect.hr.dto.security.RoleHierarchyEdgeDTO;
import com.flowenect.hr.security.policy.mapper.SecurityPolicyMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SecurityPolicyService {

    private final SecurityPolicyMapper securityPolicyMapper;

    /**
     * DB(ROLE_HIERARCHY)를 읽어 Spring Security RoleHierarchy 문자열로 조립
     * 예)
     *   ROLE_HR > ROLE_USER
     *   ROLE_LEADER > ROLE_EMP
     */
    public String buildRoleHierarchyExpression() {
        List<RoleHierarchyEdgeDTO> edges = securityPolicyMapper.selectRoleHierarchyEdges();
        if (edges == null || edges.isEmpty()) {
            return "";
        }

        Set<String> lines = new LinkedHashSet<>();
        for (RoleHierarchyEdgeDTO e : edges) {
            if (e == null) continue;

            String p = e.getParentRoleCd();
            String c = e.getChildRoleCd();

            if (!StringUtils.hasText(p) || !StringUtils.hasText(c)) continue;
            lines.add(p.trim() + " > " + c.trim());
        }

        return lines.stream().collect(Collectors.joining("\n"));
    }

    public int getPolicyVer(String policyKey) {
        Integer v = securityPolicyMapper.selectPolicyVer(policyKey);
        return v == null ? 0 : v.intValue();
    }
}