package com.flowenect.hr.dto.security;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RoleHierarchyEdgeDTO {
    private String parentRoleCd;
    private String childRoleCd;
}