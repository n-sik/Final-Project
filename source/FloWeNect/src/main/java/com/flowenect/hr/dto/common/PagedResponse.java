package com.flowenect.hr.dto.common;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PagedResponse<T> {
    private List<T> list;       
    private PagingDTO paging;   
    
    public static <T> PagedResponse<T> of(List<T> list, PagingDTO paging) {
        return new PagedResponse<>(list, paging);
    }
}
