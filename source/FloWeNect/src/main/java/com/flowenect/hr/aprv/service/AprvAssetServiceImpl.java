package com.flowenect.hr.aprv.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.flowenect.hr.aprv.mapper.AprvMapper;

import lombok.RequiredArgsConstructor;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

@Service
@RequiredArgsConstructor
public class AprvAssetServiceImpl implements AprvAssetService {

    private final AprvMapper aprvMapper;
    private final AprvAccessService aprvAccessService;

    @Value("${storage.type:s3}")
    private String storageType;

    @Value("${storage.local.path:}")
    private String localBasePath;

    @Value("${cloud.aws.s3.bucket:}")
    private String bucket;

    @Autowired(required = false)
    private S3Client s3Client;

    @Override
    public ResponseEntity<byte[]> loadAssetHistImage(long lineNo, String assetTypeCd, String viewerEmpNo) {

        // 이미지 응답은 예외를 던지면 ControllerAdvice가 redirect(302)로 바꿔서 깨질 수 있음
        // -> 400/403/404로 정상 종료
        if (!StringUtils.hasText(viewerEmpNo)) {
            return ResponseEntity.status(401).build();
        }

        if (!StringUtils.hasText(assetTypeCd) || (!"SIGN".equals(assetTypeCd) && !"SEAL".equals(assetTypeCd))) {
            return ResponseEntity.badRequest().build();
        }

        // ✅ IDOR 방어: lineNo -> aprvNo 역추적 후 문서 접근권한 체크
        Long aprvNo = aprvMapper.selectAprvNoByLineNo(lineNo);
        if (aprvNo == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            aprvAccessService.assertDocAccess(aprvNo, viewerEmpNo);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).build();
        }

        var hist = aprvMapper.selectAssetHistByLineNoAndType(lineNo, assetTypeCd);
        if (hist == null || !StringUtils.hasText(hist.getFilePathSnap())) {
            return ResponseEntity.notFound().build();
        }

        byte[] bytes = loadBytes(hist.getFilePathSnap());
        if (bytes == null || bytes.length == 0) {
            return ResponseEntity.notFound().build();
        }

        String contentType = guessContentType(hist.getFilePathSnap());
        return ResponseEntity.ok()
                .header("Content-Type", contentType)
                .header("Cache-Control", "no-store")
                .body(bytes);
    }

    private byte[] loadBytes(String path) {
        if ("local".equalsIgnoreCase(storageType)) {
            return loadLocalBytes(path);
        }
        return loadS3Bytes(path);
    }

    private byte[] loadLocalBytes(String path) {
        try {
            if (!StringUtils.hasText(localBasePath)) return null;
            File f = new File(localBasePath, path);
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
        if (p.endsWith(".png")) return "image/png";
        if (p.endsWith(".jpg") || p.endsWith(".jpeg")) return "image/jpeg";
        if (p.endsWith(".gif")) return "image/gif";
        if (p.endsWith(".webp")) return "image/webp";
        return "application/octet-stream";
    }
}
