package com.flowenect.hr.dto.common;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class PagingDTO {
    @Min(value = 1, message = "페이지 번호는 1 이상이어야 합니다.")
    private int page = 1;

    @Min(value = 1)
    @Max(value = 100, message = "한 번에 최대 100개까지만 조회 가능합니다.")
    private int recordSize = 5;

    private int startRow;
    private int endRow;
    private int totalCount;
    private int totalPageCount;

    private int pageSize = 5;    
    private int startPage;
    private int endPage;
    private boolean prev;
    private boolean next;

    public PagingDTO() {
        calculateRows();
    }

    public PagingDTO(int page, int recordSize) {
        this.page = (page <= 0) ? 1 : page;
        this.recordSize = (recordSize <= 0) ? 5 : recordSize;
        calculateRows();
    }

    public void calculateRows() {
        this.endRow = this.page * this.recordSize;
        this.startRow = this.endRow - this.recordSize + 1;
    }

    public void setTotalCount(int totalCount) {
        this.totalCount = totalCount;
        if (totalCount > 0) {
            calculatePaging();
        }
    }

    private void calculatePaging() {
        this.totalPageCount = ((totalCount - 1) / recordSize) + 1;

        this.endPage = (int) (Math.ceil(this.page / (double) pageSize) * pageSize);

        this.startPage = (this.endPage - pageSize) + 1;

        if (this.totalPageCount < this.endPage) {
            this.endPage = this.totalPageCount;
        }

        // 이전/다음 버튼 여부
        this.prev = this.startPage > 1;
        this.next = this.endPage < this.totalPageCount;
    }

    public int getOffset() {
        return (this.page - 1) * this.recordSize;
    }

    public void setPage(int page) {
        this.page = (page <= 0) ? 1 : page;
        calculateRows();
    }

    public void setRecordSize(int recordSize) {
        this.recordSize = (recordSize <= 0) ? 5 : recordSize;
        calculateRows();
    }
}