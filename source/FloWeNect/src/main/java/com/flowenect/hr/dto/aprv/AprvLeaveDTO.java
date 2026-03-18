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
public class AprvLeaveDTO {

    private Long aprvNo;

    private String leaveTypeCd;
    private LocalDate startDtm;
    private LocalDate endDtm;
    private String reason;
}
