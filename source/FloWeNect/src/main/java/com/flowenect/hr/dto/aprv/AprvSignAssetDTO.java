package com.flowenect.hr.dto.aprv;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class AprvSignAssetDTO {
    private Long assetNo;
    private String empNo;
    private String assetTypeCd;   // SIGN / SEAL
    private String assetNm;
    private String filePath;      // S3 key or path
    private String useYn;
    private LocalDateTime regDtm;
    private LocalDateTime modDtm;
}