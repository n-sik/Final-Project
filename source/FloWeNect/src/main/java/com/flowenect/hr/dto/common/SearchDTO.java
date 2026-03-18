package com.flowenect.hr.dto.common;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

/**
 * 공통 검색 DTO (이력 조회 공통)
 * - startDate, endDate: 'YYYY-MM-DD'
 * - searchType: empNm, deptNm 등
 * - keyword: 검색어
 * - page, size: 페이징
 *
 * Oracle 12c OFFSET/FETCH 사용을 위해 getOffset() 제공
 */
@Data
public class SearchDTO {

    // 날짜 검색 (YYYY-MM-DD)
    private String startDate;
    private String endDate;

    // 키워드 검색
    private String searchType; // empNm, deptNm, formCd 등
    private String keyword;

    // 페이징
    @Min(1)
    private int page = 1;

    @Min(1)
    @Max(100)
    private int size = 10;

    // 전자결재 전용 (공통 DTO에 포함)
    private String formCd;

    public int getOffset() {
        int p = (page <= 0) ? 1 : page;
        int s = (size <= 0) ? 10 : size;
        return (p - 1) * s;
    }
}
