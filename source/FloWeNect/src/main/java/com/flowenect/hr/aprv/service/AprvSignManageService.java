package com.flowenect.hr.aprv.service;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import com.flowenect.hr.dto.aprv.AprvSignAssetDTO;

/**
 * 서명/직인 자산 관리(업로드/조회/미리보기)
 * - USE_YN 정책: 업로드 시 항상 'Y'로 insert, 과거 자산도 계속 'Y'(히스토리)
 * - React 불필요: JSP 화면에서 사용
 */
public interface AprvSignManageService {

    void uploadAsset(String empNo, String assetTypeCd, String assetNm, MultipartFile file);

    List<AprvSignAssetDTO> getAssetList(String empNo, String assetTypeCd);

    ResponseEntity<byte[]> loadAssetImage(long assetNo, String viewerEmpNo);
}
