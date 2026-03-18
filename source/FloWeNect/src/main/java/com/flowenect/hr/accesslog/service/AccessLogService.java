package com.flowenect.hr.accesslog.service;

import com.flowenect.hr.dto.accesslog.AccessLogDTO;
import com.flowenect.hr.dto.common.PagedResponse;
import com.flowenect.hr.dto.common.SearchRequest;

public interface AccessLogService {

    PagedResponse<AccessLogDTO> readAccessLogList(SearchRequest searchRequest);

    AccessLogDTO readAccessLogDetail(Long accessLogNo);

    byte[] downloadAccessLogExcel(SearchRequest searchRequest);
}
