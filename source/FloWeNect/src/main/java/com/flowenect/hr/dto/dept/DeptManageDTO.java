package com.flowenect.hr.dto.dept;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class DeptManageDTO {

    private String deptCd;
    private String upDeptCd;
    private String upDeptNm;        // JOIN
    private String deptTypeCd;
    private String deptTypeNm;      // JOIN
    private String deptHeadEmpNo;
    private String deptHeadEmpNm;   // JOIN
    private String deptNm;
    private String deptLoc;
    private String deptTel;
    private String delYn;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime regDtm;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime modDtm;
}