package com.flowenect.hr.authority.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flowenect.hr.authority.service.AuthorityService;
import com.flowenect.hr.dto.authority.AuthorityEmpRowDTO;
import com.flowenect.hr.dto.authority.EmpRoleUpdateRequestDTO;
import com.flowenect.hr.dto.authority.RoleDTO;
import com.flowenect.hr.dto.authority.RoleSaveRequestDTO;
import com.flowenect.hr.dto.common.PagedResponse;
import com.flowenect.hr.dto.common.PagingDTO;
import com.flowenect.hr.dto.common.SearchRequest;
import com.flowenect.hr.dto.security.RoleHierarchyEdgeDTO;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

/**
 * 권한관리 API (ROLE_HR 전용)
 * - 사원 권한(EMP_ROLE) 변경
 * - 권한 마스터(ROLE_MST) 등록/수정
 * - 권한 상속 구조(ROLE_HIERARCHY) 조회/편집/즉시반영
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/authority")
public class AuthorityController {

    private static final DateTimeFormatter FILE_DTM_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    private final AuthorityService authorityService;

    @GetMapping("/emp/list")
    public ResponseEntity<PagedResponse<AuthorityEmpRowDTO>> getEmpList(SearchRequest searchRequest,
                                                                        HttpServletRequest request) {
        return ResponseEntity.ok(authorityService.readAuthorityEmpList(normalizeSearchRequest(searchRequest, request)));
    }

    @GetMapping(value = "/emp/excel", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> downloadEmpExcel(SearchRequest searchRequest, HttpServletRequest request) {
        byte[] xlsx = authorityService.downloadAuthorityEmpExcel(normalizeSearchRequest(searchRequest, request));
        String filename = "authority_emp_" + LocalDateTime.now().format(FILE_DTM_FORMATTER) + ".xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename*=UTF-8''" + java.net.URLEncoder.encode(filename, java.nio.charset.StandardCharsets.UTF_8))
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(xlsx);
    }

    @GetMapping("/roles")
    public ResponseEntity<List<RoleDTO>> getRoles() {
        return ResponseEntity.ok(authorityService.readRoleList());
    }

    @PostMapping("/roles")
    public ResponseEntity<Void> createRole(@RequestBody RoleSaveRequestDTO req) {
        authorityService.createRole(req);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/roles/{roleCd}")
    public ResponseEntity<Void> updateRole(@PathVariable String roleCd, @RequestBody RoleSaveRequestDTO req) {
        authorityService.updateRole(roleCd, req);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/roles/{roleCd}")
    public ResponseEntity<Void> deleteRole(@PathVariable String roleCd) {
        authorityService.deleteRole(roleCd);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/emp/{empNo}/roles")
    public ResponseEntity<Void> updateEmpRoles(@PathVariable String empNo, @RequestBody EmpRoleUpdateRequestDTO req) {
        if (req != null) req.setEmpNo(empNo);
        authorityService.updateEmpRoles(req);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/hierarchy")
    public ResponseEntity<List<RoleHierarchyEdgeDTO>> getHierarchy() {
        return ResponseEntity.ok(authorityService.readRoleHierarchyEdges());
    }

    @PutMapping("/hierarchy")
    public ResponseEntity<Void> replaceHierarchy(@RequestBody List<RoleHierarchyEdgeDTO> edges) {
        authorityService.replaceRoleHierarchyEdges(edges);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/hierarchy/refresh")
    public ResponseEntity<Void> refreshHierarchy() {
        authorityService.refreshRoleHierarchy();
        return ResponseEntity.ok().build();
    }

    private SearchRequest normalizeSearchRequest(SearchRequest searchRequest, HttpServletRequest request) {
        SearchRequest normalized = searchRequest != null ? searchRequest : new SearchRequest();

        PagingDTO paging = normalized.getPaging();
        if (paging == null) {
            paging = new PagingDTO();
            normalized.setPaging(paging);
        }
        applyPagingValue(request, paging, "paging.page", true);
        applyPagingValue(request, paging, "paging.recordSize", false);

        Map<String, Object> params = normalized.getParams();
        if (params == null) {
            params = new HashMap<>();
            normalized.setParams(params);
        }

        copyParam(request, params, "deptCd");
        copyParam(request, params, "posCd");
        copyParam(request, params, "empNm");
        copyParam(request, params, "empNo");
        copyParam(request, params, "deptRoleCd");
        copyParam(request, params, "posRoleCd");
        copyParam(request, params, "acntActYn");
        copyParam(request, params, "roleCd");

        return normalized;
    }

    private void applyPagingValue(HttpServletRequest request, PagingDTO paging, String key, boolean pageField) {
        String raw = request.getParameter(key);
        if (!StringUtils.hasText(raw)) return;

        try {
            int value = Integer.parseInt(raw.trim());
            if (pageField) {
                paging.setPage(value);
            } else {
                paging.setRecordSize(value);
            }
        } catch (NumberFormatException ignore) {
        }
    }

    private void copyParam(HttpServletRequest request, Map<String, Object> params, String paramName) {
        String value = firstText(
                request.getParameter("params[" + paramName + "]"),
                request.getParameter("params." + paramName),
                request.getParameter(paramName)
        );
        if (value != null) {
            params.put(paramName, value);
        }
    }

    private String firstText(String... values) {
        if (values == null) return null;
        for (String value : values) {
            if (StringUtils.hasText(value)) {
                return value.trim();
            }
        }
        return null;
    }
}