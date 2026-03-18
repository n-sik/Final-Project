package com.flowenect.hr.authority.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.flowenect.hr.authority.mapper.AuthorityMapper;
import com.flowenect.hr.dto.authority.AuthorityEmpRowDTO;
import com.flowenect.hr.dto.authority.EmpRoleUpdateRequestDTO;
import com.flowenect.hr.dto.authority.RoleDTO;
import com.flowenect.hr.dto.authority.RoleSaveRequestDTO;
import com.flowenect.hr.dto.common.PagedResponse;
import com.flowenect.hr.dto.common.PagingDTO;
import com.flowenect.hr.dto.common.SearchRequest;
import com.flowenect.hr.dto.security.RoleHierarchyEdgeDTO;
import com.flowenect.hr.emp.mapper.EmpMapper;
import com.flowenect.hr.security.policy.DynamicRoleHierarchy;
import com.flowenect.hr.security.policy.service.SecurityPolicyService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthorityServiceImpl implements AuthorityService {

    private static final Pattern ROLE_CD_PATTERN = Pattern.compile("^ROLE_[A-Z0-9_]+$");
    private static final Set<String> PROTECTED_ROLE_CDS = Set.of("ROLE_HR", "ROLE_USER", "ROLE_LEADER", "ROLE_EMP");

    private final AuthorityMapper authorityMapper;
    private final EmpMapper empMapper;
    private final SecurityPolicyService securityPolicyService;
    private final DynamicRoleHierarchy dynamicRoleHierarchy;

    @Override
    public PagedResponse<AuthorityEmpRowDTO> readAuthorityEmpList(SearchRequest searchRequest) {
        SearchRequest normalized = ensureSearchRequest(searchRequest);

        int totalCount = authorityMapper.selectAuthorityEmpCount(normalized);
        normalized.getPaging().setTotalCount(totalCount);

        List<AuthorityEmpRowDTO> list = new ArrayList<>();
        if (totalCount > 0) {
            list = authorityMapper.selectAuthorityEmpList(normalized);
        }

        return PagedResponse.of(list, normalized.getPaging());
    }

    @Override
    @Transactional
    public void updateEmpRoles(EmpRoleUpdateRequestDTO req) {
        if (req == null || !StringUtils.hasText(req.getEmpNo())) {
            throw new IllegalArgumentException("empNo는 필수입니다.");
        }

        List<String> roleCds = req.getRoleCds();
        if (roleCds == null || roleCds.isEmpty()) {
            throw new IllegalArgumentException("roleCds는 최소 1개 이상 필요합니다.");
        }

        Set<String> normalized = new HashSet<>();
        for (String r : roleCds) {
            if (!StringUtils.hasText(r)) continue;
            normalized.add(r.trim());
        }
        if (normalized.isEmpty()) {
            throw new IllegalArgumentException("roleCds가 비어있습니다.");
        }

        boolean hasDeptRole = normalized.contains("ROLE_USER") || normalized.contains("ROLE_HR");
        boolean hasPosRole = normalized.contains("ROLE_EMP") || normalized.contains("ROLE_LEADER");
        if (!hasDeptRole || !hasPosRole) {
            throw new IllegalArgumentException("권한은 최소 2개(부서권한 + 직급권한)로 구성되어야 합니다. 예) ROLE_HR + ROLE_LEADER");
        }

        empMapper.deleteEmpRoles(req.getEmpNo());
        for (String roleCd : normalized) {
            empMapper.insertEmpRole(req.getEmpNo(), roleCd);
        }
    }

    @Override
    public byte[] downloadAuthorityEmpExcel(SearchRequest searchRequest) {
        SearchRequest normalized = ensureSearchRequest(searchRequest);
        int totalCount = authorityMapper.selectAuthorityEmpCount(normalized);

        PagingDTO paging = normalized.getPaging();
        paging.setPage(1);
        paging.setRecordSize(Math.max(totalCount, 1));
        paging.calculateRows();

        List<AuthorityEmpRowDTO> list = totalCount > 0 ? authorityMapper.selectAuthorityEmpList(normalized) : List.of();
        return AuthorityExcelWriter.write(list);
    }

    @Override
    public List<RoleDTO> readRoleList() {
        return authorityMapper.selectRoleList();
    }

    @Override
    @Transactional
    public void createRole(RoleSaveRequestDTO req) {
        RoleDTO role = toValidatedRole(req, true, null);
        if (authorityMapper.selectRoleCountByRoleCd(role.getRoleCd()) > 0) {
            throw new IllegalArgumentException("이미 존재하는 권한코드입니다. roleCd=" + role.getRoleCd());
        }
        authorityMapper.insertRole(role);
    }

    @Override
    @Transactional
    public void updateRole(String roleCd, RoleSaveRequestDTO req) {
        String normalizedRoleCd = normalizeRoleCd(roleCd);
        RoleDTO current = authorityMapper.selectRoleByRoleCd(normalizedRoleCd);
        if (current == null) {
            throw new IllegalArgumentException("존재하지 않는 권한코드입니다. roleCd=" + normalizedRoleCd);
        }

        RoleDTO role = toValidatedRole(req, false, normalizedRoleCd);
        authorityMapper.updateRole(role);
    }

    @Override
    @Transactional
    public void deleteRole(String roleCd) {
        String normalizedRoleCd = normalizeRoleCd(roleCd);
        RoleDTO current = authorityMapper.selectRoleByRoleCd(normalizedRoleCd);
        if (current == null) {
            throw new IllegalArgumentException("존재하지 않는 권한코드입니다. roleCd=" + normalizedRoleCd);
        }

        if (PROTECTED_ROLE_CDS.contains(normalizedRoleCd)) {
            throw new IllegalArgumentException("기본 권한은 삭제할 수 없습니다. roleCd=" + normalizedRoleCd);
        }

        int empRoleCount = authorityMapper.selectEmpRoleCountByRoleCd(normalizedRoleCd);
        if (empRoleCount > 0) {
            throw new IllegalArgumentException("사원에게 부여된 권한은 삭제할 수 없습니다. 먼저 사원 권한에서 해제해 주세요. 사용 건수=" + empRoleCount);
        }

        int menuRoleCount = authorityMapper.selectMenuRoleCountByRoleCd(normalizedRoleCd);
        if (menuRoleCount > 0) {
            throw new IllegalArgumentException("메뉴 접근 권한에 연결된 권한은 삭제할 수 없습니다. 먼저 메뉴 권한 매핑을 해제해 주세요. 사용 건수=" + menuRoleCount);
        }

        int hierarchyRefCount = authorityMapper.selectRoleHierarchyRefCount(normalizedRoleCd);
        if (hierarchyRefCount > 0) {
            throw new IllegalArgumentException("권한 상속 구조에 포함된 권한은 삭제할 수 없습니다. 먼저 권한 상속 설정에서 제거해 주세요. 사용 건수=" + hierarchyRefCount);
        }

        authorityMapper.deleteRoleByRoleCd(normalizedRoleCd);
        refreshRoleHierarchy();
    }

    @Override
    public List<RoleHierarchyEdgeDTO> readRoleHierarchyEdges() {
        return authorityMapper.selectRoleHierarchyEdges();
    }

    @Override
    @Transactional
    public void replaceRoleHierarchyEdges(List<RoleHierarchyEdgeDTO> edges) {
        if (edges == null) edges = new ArrayList<>();

        Set<String> validRoleCds = new HashSet<>();
        for (RoleDTO role : authorityMapper.selectRoleList()) {
            if (role != null && StringUtils.hasText(role.getRoleCd())) {
                validRoleCds.add(role.getRoleCd().trim());
            }
        }

        Set<String> seen = new HashSet<>();
        for (RoleHierarchyEdgeDTO e : edges) {
            if (e == null || !StringUtils.hasText(e.getParentRoleCd()) || !StringUtils.hasText(e.getChildRoleCd())) {
                throw new IllegalArgumentException("parentRoleCd/childRoleCd는 필수입니다.");
            }

            String parent = e.getParentRoleCd().trim();
            String child = e.getChildRoleCd().trim();

            if (parent.equals(child)) {
                throw new IllegalArgumentException("부모/자식 권한이 동일할 수 없습니다: " + parent);
            }
            if (!validRoleCds.contains(parent) || !validRoleCds.contains(child)) {
                throw new IllegalArgumentException("등록되지 않은 권한코드는 상속 관계에 저장할 수 없습니다.");
            }

            String key = parent + "->" + child;
            if (seen.contains(key)) {
                throw new IllegalArgumentException("중복된 권한구조가 존재합니다: " + key);
            }
            seen.add(key);

            e.setParentRoleCd(parent);
            e.setChildRoleCd(child);
        }

        authorityMapper.deleteAllRoleHierarchy();
        if (!edges.isEmpty()) {
            authorityMapper.insertRoleHierarchyEdges(edges);
        }
    }

    @Override
    public void refreshRoleHierarchy() {
        String expr = securityPolicyService.buildRoleHierarchyExpression();
        dynamicRoleHierarchy.refresh(expr);
    }

    private SearchRequest ensureSearchRequest(SearchRequest searchRequest) {
        SearchRequest normalized = searchRequest != null ? searchRequest : new SearchRequest();
        if (normalized.getPaging() == null) {
            normalized.setPaging(new PagingDTO());
        }
        normalized.getPaging().calculateRows();
        if (normalized.getParams() == null) {
            normalized.setParams(new java.util.HashMap<>());
        }
        return normalized;
    }

    private RoleDTO toValidatedRole(RoleSaveRequestDTO req, boolean create, String fixedRoleCd) {
        if (req == null) {
            throw new IllegalArgumentException("요청값이 없습니다.");
        }

        RoleDTO role = new RoleDTO();
        String roleCd = create ? normalizeRoleCd(req.getRoleCd()) : fixedRoleCd;
        String roleNm = normalizeRoleNm(req.getRoleNm());
        String roleDesc = normalizeRoleDesc(req.getRoleDesc());

        if (!StringUtils.hasText(roleCd)) {
            throw new IllegalArgumentException("권한코드(roleCd)는 필수입니다.");
        }
        if (!StringUtils.hasText(roleNm)) {
            throw new IllegalArgumentException("권한명(roleNm)은 필수입니다.");
        }

        role.setRoleCd(roleCd);
        role.setRoleNm(roleNm);
        role.setRoleDesc(roleDesc);
        role.setUseYn("Y");
        return role;
    }

    private String normalizeRoleCd(String roleCd) {
        if (!StringUtils.hasText(roleCd)) {
            return "";
        }
        String normalized = roleCd.trim().toUpperCase();
        if (!ROLE_CD_PATTERN.matcher(normalized).matches()) {
            throw new IllegalArgumentException("권한코드는 ROLE_로 시작하고 영문 대문자/숫자/_만 사용할 수 있습니다.");
        }
        if (normalized.length() > 30) {
            throw new IllegalArgumentException("권한코드는 30자 이하여야 합니다.");
        }
        return normalized;
    }

    private String normalizeRoleNm(String roleNm) {
        if (!StringUtils.hasText(roleNm)) {
            return "";
        }
        String normalized = roleNm.trim();
        if (normalized.length() > 50) {
            throw new IllegalArgumentException("권한명은 50자 이하여야 합니다.");
        }
        return normalized;
    }

    private String normalizeRoleDesc(String roleDesc) {
        if (!StringUtils.hasText(roleDesc)) {
            return null;
        }
        String normalized = roleDesc.trim();
        if (normalized.length() > 200) {
            throw new IllegalArgumentException("권한 설명은 200자 이하여야 합니다.");
        }
        return normalized;
    }
}