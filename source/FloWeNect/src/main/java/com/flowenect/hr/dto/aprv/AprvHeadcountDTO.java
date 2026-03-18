package com.flowenect.hr.dto.aprv;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class AprvHeadcountDTO {

    private Long aprvNo;

    private String reqDeptCd;
    private Integer reqCnt;
    private LocalDate hopeDt;
    private String reason;
}
