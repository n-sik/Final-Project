package com.flowenect.hr.aprv.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.flowenect.hr.aprv.mapper.AprvMapper;
import com.flowenect.hr.commons.file.storage.FileStorage;
import com.flowenect.hr.dto.aprv.AprvSignAssetDTO;

import lombok.RequiredArgsConstructor;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

@Service
@RequiredArgsConstructor
public class AprvSignManageServiceImpl implements AprvSignManageService {

    private final AprvMapper aprvMapper;
    private final FileStorage fileStorage;

    @Value("${aprv.asset.prefix:aprv/asset}")
    private String assetPrefix;

    @Value("${storage.type:s3}")
    private String storageType;

    @Value("${storage.local.path:}")
    private String localBasePath;

    @Value("${cloud.aws.s3.bucket:}")
    private String bucket;

    @Autowired(required = false)
    private S3Client s3Client;

    @Override
    public void uploadAsset(String empNo, String assetTypeCd, String assetNm, org.springframework.web.multipart.MultipartFile file) {

        if (!StringUtils.hasText(empNo)) {
            throw new IllegalStateException("로그인이 필요합니다.");
        }
        if (!StringUtils.hasText(assetTypeCd) || !("SIGN".equals(assetTypeCd) || "SEAL".equals(assetTypeCd))) {
            throw new IllegalArgumentException("자산 타입이 올바르지 않습니다.");
        }
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일을 선택해 주세요.");
        }
        if (file.getContentType() != null && !file.getContentType().toLowerCase().startsWith("image/")) {
            throw new IllegalArgumentException("이미지 파일만 업로드할 수 있습니다.");
        }

        String finalAssetNm = StringUtils.hasText(assetNm) ? assetNm.trim() : assetTypeCd;

        // 저장 경로: aprv/asset/sign/EMP001
        String domainPath = assetPrefix + "/" + assetTypeCd.toLowerCase() + "/" + empNo;

        // fileStorage가 storage.type에 따라 local 또는 S3로 저장
        String savedPath = fileStorage.upload(file, domainPath);

        int inserted = aprvMapper.insertAprvSignAsset(empNo, assetTypeCd, finalAssetNm, savedPath);
        if (inserted == 0) {
            throw new IllegalStateException("DB 저장에 실패했습니다.");
        }
    }

    @Override
    public List<AprvSignAssetDTO> getAssetList(String empNo, String assetTypeCd) {
        if (!StringUtils.hasText(empNo)) {
            throw new IllegalStateException("로그인이 필요합니다.");
        }
        if (!StringUtils.hasText(assetTypeCd) || !("SIGN".equals(assetTypeCd) || "SEAL".equals(assetTypeCd))) {
            throw new IllegalArgumentException("자산 타입이 올바르지 않습니다.");
        }
        return aprvMapper.selectAprvSignAssetList(empNo, assetTypeCd);
    }

    @Override
    public ResponseEntity<byte[]> loadAssetImage(long assetNo, String empNo) {

        if (!StringUtils.hasText(empNo)) {
            return ResponseEntity.status(401).build();
        }

        AprvSignAssetDTO dto = aprvMapper.selectAprvSignAssetByAssetNo(assetNo, empNo);
        if (dto == null || !StringUtils.hasText(dto.getFilePath())) {
            return ResponseEntity.notFound().build();
        }

        byte[] bytes = loadBytes(dto.getFilePath());
        if (bytes == null || bytes.length == 0) {
            return ResponseEntity.notFound().build();
        }

        String contentType = guessContentType(dto.getFilePath());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(bytes);
    }

    private byte[] loadBytes(String filePath) {
        if ("local".equalsIgnoreCase(storageType)) {
            return loadLocalBytes(filePath);
        }
        return loadS3Bytes(filePath);
    }

    private byte[] loadLocalBytes(String filePath) {
        try {
            if (!StringUtils.hasText(localBasePath)) return null;
            File f = new File(localBasePath, filePath);
            if (!f.exists() || !f.isFile()) return null;
            return Files.readAllBytes(f.toPath());
        } catch (IOException e) {
            return null;
        }
    }

    private byte[] loadS3Bytes(String s3Key) {
        if (s3Client == null) return null;
        if (!StringUtils.hasText(bucket)) return null;

        try {
            GetObjectRequest getReq = GetObjectRequest.builder()
                    .bucket(bucket)
                    .key(s3Key)
                    .build();

            ResponseInputStream<GetObjectResponse> s3Obj = s3Client.getObject(getReq);
            byte[] bytes = s3Obj.readAllBytes();
            s3Obj.close();
            return bytes;

        } catch (IOException e) {
            return null;
        } catch (RuntimeException e) {
            return null;
        }
    }

    private String guessContentType(String path) {
        String p = path.toLowerCase();
        if (p.endsWith(".png")) return MediaType.IMAGE_PNG_VALUE;
        if (p.endsWith(".jpg") || p.endsWith(".jpeg")) return MediaType.IMAGE_JPEG_VALUE;
        if (p.endsWith(".gif")) return MediaType.IMAGE_GIF_VALUE;
        if (p.endsWith(".webp")) return "image/webp";
        return MediaType.APPLICATION_OCTET_STREAM_VALUE;
    }
}
