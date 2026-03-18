package com.flowenect.hr.dto.aprv;

import lombok.Getter;

@Getter
public class PageDTO {

    private final int page;
    private final int size;
    private final int totalCount;

    private final int totalPages;

    private final int startRow;
    private final int endRow;

    // 화면용 페이지 범위(1 2 3 4 5)
    private final int startPage;
    private final int endPage;

    private final boolean hasPrev;
    private final boolean hasNext;

    private final int prevPage;
    private final int nextPage;

    public PageDTO(int page, int size, int totalCount) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.max(size, 1);
        int safeTotal = Math.max(totalCount, 0);

        this.page = safePage;
        this.size = safeSize;
        this.totalCount = safeTotal;

        this.totalPages = (int) Math.ceil((double) safeTotal / safeSize);

        this.startRow = (safePage - 1) * safeSize + 1;
        this.endRow = safePage * safeSize;

        int blockSize = 5;
        int blockIndex = (safePage - 1) / blockSize;

        this.startPage = blockIndex * blockSize + 1;
        this.endPage = Math.min(this.startPage + blockSize - 1, Math.max(this.totalPages, 1));

        this.hasPrev = this.startPage > 1;
        this.hasNext = this.endPage < this.totalPages;

        this.prevPage = Math.max(this.startPage - 1, 1);
        this.nextPage = Math.min(this.endPage + 1, Math.max(this.totalPages, 1));
    }
}