package com.flowenect.hr.accesslog.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.flowenect.hr.dto.accesslog.AccessLogDTO;
import com.flowenect.hr.dto.common.PagedResponse;
import com.flowenect.hr.dto.common.PagingDTO;
import com.flowenect.hr.dto.common.SearchRequest;
import com.flowenect.hr.emp.mapper.EmpMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AccessLogServiceImpl implements AccessLogService {

    private final EmpMapper empMapper;

    @Override
    public PagedResponse<AccessLogDTO> readAccessLogList(SearchRequest searchRequest) {
        if (searchRequest == null) {
            searchRequest = new SearchRequest();
        }

        PagingDTO paging = searchRequest.getPaging();
        if (paging == null) {
            paging = new PagingDTO();
            searchRequest.setPaging(paging);
        }
        paging.calculateRows();

        int totalCount = empMapper.selectAccessLogCount(searchRequest);
        paging.setTotalCount(totalCount);

        List<AccessLogDTO> list = empMapper.selectAccessLogList(searchRequest);
        return PagedResponse.of(list, paging);
    }

    @Override
    public AccessLogDTO readAccessLogDetail(Long accessLogNo) {
        if (accessLogNo == null) return null;
        return empMapper.selectAccessLogDetail(accessLogNo);
    }

    @Override
    public byte[] downloadAccessLogExcel(SearchRequest searchRequest) {
        if (searchRequest == null) {
            searchRequest = new SearchRequest();
        }

        PagingDTO paging = searchRequest.getPaging();
        if (paging == null) {
            paging = new PagingDTO();
            searchRequest.setPaging(paging);
        }

        int totalCount = empMapper.selectAccessLogCount(searchRequest);
        paging.setPage(1);
        paging.setRecordSize(Math.max(totalCount, 1));
        paging.calculateRows();

        List<AccessLogDTO> list = totalCount > 0 ? empMapper.selectAccessLogList(searchRequest) : List.of();
        return AccessLogExcelWriter.write(list);
    }
}
