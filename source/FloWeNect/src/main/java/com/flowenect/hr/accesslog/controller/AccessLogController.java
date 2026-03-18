package com.flowenect.hr.accesslog.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flowenect.hr.accesslog.service.AccessLogService;
import com.flowenect.hr.dto.accesslog.AccessLogDTO;
import com.flowenect.hr.dto.common.PagedResponse;
import com.flowenect.hr.dto.common.PagingDTO;
import com.flowenect.hr.dto.common.SearchRequest;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/accesslog")
public class AccessLogController {

    private static final DateTimeFormatter FILE_DTM_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    private final AccessLogService accessLogService;

    /**
     * 접속 이력 목록 (검색/페이징)
     *
     * - SearchRequest의 nested map(params.*) 바인딩이 환경에 따라 누락될 수 있어
     *   요청 파라미터를 한번 더 정규화한다.
     * - 조회 기간이 비어 있으면 서버 기준 당일로 보정한다.
     */
    @GetMapping("/list")
    public ResponseEntity<PagedResponse<AccessLogDTO>> getAccessLogList(SearchRequest searchRequest,
                                                                        HttpServletRequest request) {
        SearchRequest normalized = normalizeSearchRequest(searchRequest, request);
        return ResponseEntity.ok(accessLogService.readAccessLogList(normalized));
    }

    /**
     * 접속 이력 상세
     * GET /api/accesslog/{accessLogNo}
     */
    @GetMapping("/{accessLogNo}")
    public ResponseEntity<AccessLogDTO> getAccessLogDetail(@PathVariable Long accessLogNo) {
        AccessLogDTO dto = accessLogService.readAccessLogDetail(accessLogNo);
        if (dto == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(dto);
    }

    @GetMapping(value = "/excel", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> getAccessLogExcel(SearchRequest searchRequest, HttpServletRequest request) {
        SearchRequest normalized = normalizeSearchRequest(searchRequest, request);
        byte[] xlsx = accessLogService.downloadAccessLogExcel(normalized);
        String filename = "accesslog_" + LocalDateTime.now().format(FILE_DTM_FORMATTER) + ".xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename*=UTF-8''" + java.net.URLEncoder.encode(filename, java.nio.charset.StandardCharsets.UTF_8))
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(xlsx);
    }

    private SearchRequest normalizeSearchRequest(SearchRequest searchRequest, HttpServletRequest request) {
        SearchRequest normalized = (searchRequest != null) ? searchRequest : new SearchRequest();

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

        copyParam(request, params, "startDate");
        copyParam(request, params, "endDate");
        copyParam(request, params, "deptNm");
        copyParam(request, params, "posCd");
        copyParam(request, params, "empNm");
        copyParam(request, params, "empNo");
        copyParam(request, params, "statusCd");
        copyParam(request, params, "logoutReason");
        copyParam(request, params, "loginIp");
        copyParam(request, params, "authChannel");
        copyParam(request, params, "keyword");
        copyParam(request, params, "onlyActive");

        String today = LocalDate.now().toString();
        if (!hasText(params.get("startDate"))) {
            params.put("startDate", today);
        }
        if (!hasText(params.get("endDate"))) {
            params.put("endDate", today);
        }

        String startDate = String.valueOf(params.get("startDate"));
        String endDate = String.valueOf(params.get("endDate"));
        if (StringUtils.hasText(startDate) && StringUtils.hasText(endDate) && startDate.compareTo(endDate) > 0) {
            params.put("startDate", endDate);
            params.put("endDate", startDate);
        }

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

    private boolean hasText(Object value) {
        return value != null && StringUtils.hasText(String.valueOf(value));
    }
}
