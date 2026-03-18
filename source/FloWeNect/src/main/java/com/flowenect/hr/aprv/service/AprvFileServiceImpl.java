package com.flowenect.hr.aprv.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.flowenect.hr.aprv.mapper.AprvMapper;
import com.flowenect.hr.dto.aprv.ApprFileDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AprvFileServiceImpl implements AprvFileService {

    private final AprvMapper aprvMapper;
    private final AprvAccessService aprvAccessService;

    @Value("${app.upload.root-path:./uploads}")
    private String uploadRootPath;

    @Override
    public ResponseEntity<Resource> download(long fileNo, String empNo) {

        // 다운로드는 redirect(302) 끼면 깨짐 -> 예외 대신 HTTP 상태로 종료
        if (empNo == null || empNo.isBlank()) {
            return ResponseEntity.status(401).build();
        }

        ApprFileDTO file = aprvMapper.selectApprFileByFileNo(fileNo);
        if (file == null) {
            return ResponseEntity.notFound().build();
        }

        // 문서 접근권한 체크 (IDOR 방어)
        try {
            aprvAccessService.assertDocAccess(file.getAprvNo(), empNo);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).build();
        }

        // 내부 경로 탈출 방지
        Path root = Paths.get(uploadRootPath).toAbsolutePath().normalize();
        Path path = Paths.get(file.getFilePath()).toAbsolutePath().normalize();
        if (!path.startsWith(root)) {
            return ResponseEntity.status(403).build();
        }

        if (!Files.exists(path) || !Files.isRegularFile(path)) {
            return ResponseEntity.notFound().build();
        }

        try {
            Resource resource = new UrlResource(path.toUri());

            String downloadName = (file.getFileNm() != null && !file.getFileNm().isBlank())
                    ? file.getFileNm()
                    : "download";

            String encoded = URLEncoder.encode(downloadName, StandardCharsets.UTF_8).replace("+", "%20");

            String contentType = Files.probeContentType(path);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            long contentLength = Files.size(path);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, contentType)
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(contentLength))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encoded)
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @Override
    public void saveAttachments(long aprvNo, java.util.List<org.springframework.web.multipart.MultipartFile> files, String empNo) {

        aprvAccessService.assertDocAccess(aprvNo, empNo);

        if (files == null || files.isEmpty()) return;

        try {
            Path dir = Paths.get(uploadRootPath, "aprv", String.valueOf(aprvNo), "attach");
            Files.createDirectories(dir);

            for (org.springframework.web.multipart.MultipartFile f : files) {
                if (f == null || f.isEmpty()) continue;

                String origin = f.getOriginalFilename();
                String fileNm = (origin == null || origin.isBlank()) ? "attach" : origin;

                String saveFileNm = java.util.UUID.randomUUID() + "-" + fileNm;
                Path path = dir.resolve(saveFileNm);

                f.transferTo(path.toFile());

                String storedPath = path.toString().replace("\\", "/");
                long size = Files.size(path);

                // ✅ ZIP 원본 시그니처 그대로
                aprvMapper.insertApprFile(
                        aprvNo,
                        fileNm,
                        saveFileNm,
                        storedPath,
                        size,
                        getExt(fileNm),
                        "ATTACH"
                );
            }
        } catch (Exception e) {
            throw new IllegalStateException("첨부파일 저장 실패", e);
        }
    }

    private String getExt(String name) {
        if (name == null) return "";
        int idx = name.lastIndexOf('.');
        if (idx < 0) return "";
        return name.substring(idx + 1).toLowerCase();
    }
}