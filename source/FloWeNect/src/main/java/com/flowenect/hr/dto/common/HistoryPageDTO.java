package com.flowenect.hr.dto.common;

import lombok.Data;

/**
 * OFFSET/FETCH 기반 페이징 메타
 * (기존 PagingDTO와 별개 - page/size 필드 사용)
 */
@Data
public class HistoryPageDTO {

    private int page;
    private int size;

    private int totalCount;
    private int totalPageCount;

    // 페이지 버튼 영역
    private int pageSize = 5;
    private int startPage;
    private int endPage;
    private boolean prev;
    private boolean next;

    public static HistoryPageDTO of(int page, int size, int totalCount) {
        HistoryPageDTO dto = new HistoryPageDTO();
        dto.page = (page <= 0) ? 1 : page;
        dto.size = (size <= 0) ? 10 : size;
        dto.totalCount = Math.max(totalCount, 0);

        dto.totalPageCount = (dto.totalCount == 0) ? 1 : ((dto.totalCount - 1) / dto.size) + 1;

        // 페이지 그룹 계산
        int end = (int) (Math.ceil(dto.page / (double) dto.pageSize) * dto.pageSize);
        int start = (end - dto.pageSize) + 1;
        if (start < 1) start = 1;
        if (dto.totalPageCount < end) end = dto.totalPageCount;

        dto.startPage = start;
        dto.endPage = end;
        dto.prev = dto.startPage > 1;
        dto.next = dto.endPage < dto.totalPageCount;

        return dto;
    }
}
