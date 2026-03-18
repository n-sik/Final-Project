package com.flowenect.hr.security.policy;

import java.util.Collection;

import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.util.StringUtils;

/**
 * DB(ROLE_HIERARCHY) 기반 RoleHierarchy를 런타임에 교체 가능하도록 래핑
 * - 기본적으로는 서버 구동 시점에 로딩
 * - 권한구조(ROLE_HIERARCHY)를 관리자 화면에서 편집한 뒤 "새로고침" API 호출로 즉시 반영 가능
 */
public class DynamicRoleHierarchy implements RoleHierarchy {

    private volatile RoleHierarchy delegate;

    public DynamicRoleHierarchy(String hierarchyExpression) {
        refresh(hierarchyExpression);
    }

    public synchronized void refresh(String hierarchyExpression) {
        if (!StringUtils.hasText(hierarchyExpression)) {
            this.delegate = authorities -> authorities;
            return;
        }
        this.delegate = RoleHierarchyImpl.fromHierarchy(hierarchyExpression);
    }

    @Override
    public Collection<? extends GrantedAuthority> getReachableGrantedAuthorities(
            Collection<? extends GrantedAuthority> authorities
    ) {
        return delegate.getReachableGrantedAuthorities(authorities);
    }
}
