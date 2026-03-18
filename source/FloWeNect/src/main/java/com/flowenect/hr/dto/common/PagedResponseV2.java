package com.flowenect.hr.dto.common;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PagedResponseV2<T> {
    private List<T> list;
    private HistoryPageDTO paging;

    public static <T> PagedResponseV2<T> of(List<T> list, HistoryPageDTO paging) {
        return new PagedResponseV2<>(list, paging);
    }
}
