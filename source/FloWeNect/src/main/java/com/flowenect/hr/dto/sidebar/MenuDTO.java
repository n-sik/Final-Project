package com.flowenect.hr.dto.sidebar;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuDTO {
	private Long menuNo;
    private Long parentMenuNo;
    private String menuNm;
    private Integer menuLvl;
    private String menuUrl;
    private Integer sortOrd;   // NVL 적용 후 최종 정렬값
    private String useYn;
    private String menuType;
}
