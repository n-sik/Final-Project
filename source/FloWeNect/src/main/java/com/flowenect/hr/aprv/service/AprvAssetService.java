package com.flowenect.hr.aprv.service;

import org.springframework.http.ResponseEntity;

public interface AprvAssetService {
    ResponseEntity<byte[]> loadAssetHistImage(long lineNo, String assetTypeCd, String viewerEmpNo);
}