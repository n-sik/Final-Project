package com.flowenect.hr.dto.aprv;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class AprvAssetHistDTO {
    private String assetTypeCd;     // SIGN / SEAL
    private Long lineNo;
    private Long assetNo;
    private String assetNmSnap;
    private String filePathSnap;    // S3 key or path
    private LocalDateTime appliedDtm;
}