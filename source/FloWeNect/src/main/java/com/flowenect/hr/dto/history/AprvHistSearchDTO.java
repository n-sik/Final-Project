package com.flowenect.hr.dto.history;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class AprvHistSearchDTO {

    private String startDate;
    private String endDate;

    private String formCd;
    private String empNm;
    private String aprvTtl;
    private String statCd;

    @Min(1)
    private int page = 1;

    @Min(1)
    @Max(100)
    private int size = 10;

    public int getOffset() {
        int safePage = page <= 0 ? 1 : page;
        int safeSize = size <= 0 ? 10 : size;
        return (safePage - 1) * safeSize;
    }
}
