package com.flowenect.hr.aprv.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.flowenect.hr.aprv.mapper.AprvMapper;
import com.flowenect.hr.aprv.util.PdfFileNameUtil;
import com.flowenect.hr.dto.aprv.AprvAssetHistDTO;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;

import lombok.RequiredArgsConstructor;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
@RequiredArgsConstructor
public class AprvPdfServiceImpl implements AprvPdfService {

    private final AprvMapper aprvMapper;
    private final AprvAccessService aprvAccessService;
    private final AprvDocRenderService aprvDocRenderService;
    @Autowired(required = false)
    private S3Client s3Client;


    @Value("${cloud.aws.s3.bucket:}")
    private String bucket;

    @Value("${aprv.pdf.s3-prefix:aprv/pdf}")
    private String aprvPdfPrefix;

    /**
     * (기존 호환) 문서 미리보기 PDF bytes 생성
     * - B방안: docView(JSP) 템플릿을 SYSTEM 모드로 서버 내부 렌더링 → PDF 변환
     */
    @Override
    public byte[] generatePdfBytes(long aprvNo, String empNo) {
        aprvAccessService.assertDocAccess(aprvNo, empNo);

        // SYSTEM_PDF 정책: 결재라인 표는 포함, 서명칸은 '결재 예정'
        String html = aprvDocRenderService.renderDocViewHtml(aprvNo, empNo, "SYSTEM", null);
        return renderPdf(html);
    }

    /**
     * 상신 시 SYSTEM_PDF 저장
     */
    @Transactional(propagation = Propagation.NESTED)
    @Override
    public long generateAndSaveSystemPdfOnSubmit(long aprvNo, String empNo) {
        aprvAccessService.assertDocAccess(aprvNo, empNo);

        // 중복 생성 방지
        var existing = aprvMapper.selectLatestPdfByAprvNoAndDiv(aprvNo, "SYSTEM_PDF");
        if (existing != null && existing.getFilePath() != null && !existing.getFilePath().isBlank()) {
            return aprvNo;
        }

        byte[] pdfBytes = generatePdfBytes(aprvNo, empNo);

        String fileNm = PdfFileNameUtil.buildPdfFileName(aprvNo);
        String saveFileNm = UUID.randomUUID() + "-" + fileNm;
        String s3Key = aprvPdfPrefix + "/" + aprvNo + "/" + saveFileNm;

        assertS3Ready();

        PutObjectRequest putReq = PutObjectRequest.builder()
                .bucket(bucket)
                .key(s3Key)
                .contentType("application/pdf")
                .build();

        s3Client.putObject(putReq, RequestBody.fromBytes(pdfBytes));

        int inserted = aprvMapper.insertSystemPdfFile(
                aprvNo,
                fileNm,
                saveFileNm,
                s3Key,
                pdfBytes.length,
                "pdf"
        );

        if (inserted == 0) {
            throw new IllegalStateException("SYSTEM_PDF 메타 저장 실패");
        }

        return aprvNo;
    }

    /**
     * 최신 SYSTEM_PDF bytes 로드
     */
    @Override
    public byte[] loadLatestSystemPdfBytes(long aprvNo, String empNo) {
        aprvAccessService.assertDocAccess(aprvNo, empNo);

        var meta = aprvMapper.selectLatestPdfByAprvNoAndDiv(aprvNo, "SYSTEM_PDF");
        if (meta == null || meta.getFilePath() == null || meta.getFilePath().isBlank()) {
            throw new IllegalStateException("상신 PDF(SYSTEM_PDF)가 존재하지 않습니다.");
        }

        return loadS3Bytes(meta.getFilePath());
    }

    /**
     * 결재 완료 시 FINAL_PDF 저장
     * - B방안: docView(JSP) FINAL 모드 렌더링 → 서명/직인(결재자 선택 1개) data URI로 주입 → PDF 변환
     */
    @Transactional(propagation = Propagation.NESTED)
    @Override
    public long generateAndSaveFinalPdf(long aprvNo, String savedByEmpNo) {
        aprvAccessService.assertDocAccess(aprvNo, savedByEmpNo);

        // FINAL 중복 생성 방지
        var existingFinal = aprvMapper.selectLatestPdfByAprvNoAndDiv(aprvNo, "FINAL_PDF");
        if (existingFinal != null && existingFinal.getFilePath() != null && !existingFinal.getFilePath().isBlank()) {
            return aprvNo;
        }

        byte[] pdfBytes = generateFinalPdfBytes(aprvNo, savedByEmpNo);

        String fileNm = PdfFileNameUtil.buildPdfFileName(aprvNo);
        String saveFileNm = UUID.randomUUID() + "-" + fileNm;
        String s3Key = aprvPdfPrefix + "/" + aprvNo + "/final/" + saveFileNm;

        assertS3Ready();

        PutObjectRequest putReq = PutObjectRequest.builder()
                .bucket(bucket)
                .key(s3Key)
                .contentType("application/pdf")
                .build();

        s3Client.putObject(putReq, RequestBody.fromBytes(pdfBytes));

        int inserted = aprvMapper.insertApprFile(
                aprvNo,
                fileNm,
                saveFileNm,
                s3Key,
                pdfBytes.length,
                "pdf",
                "FINAL_PDF"
        );

        if (inserted == 0) {
            throw new IllegalStateException("FINAL_PDF 저장에 실패했습니다.");
        }

        return aprvNo;
    }

    /**
     * 최신 PDF bytes 로드
     * - 승인 완료(APPROVED)이면 FINAL_PDF 우선, 아니면 SYSTEM_PDF
     */
    @Override
    public byte[] loadLatestPdfBytes(long aprvNo, String empNo) {
        aprvAccessService.assertDocAccess(aprvNo, empNo);

        var doc = aprvMapper.selectAprvDocByAprvNo(aprvNo);
        if (doc != null && "APPROVED".equals(doc.getStatCd())) {
            var finalMeta = aprvMapper.selectLatestPdfByAprvNoAndDiv(aprvNo, "FINAL_PDF");
            if (finalMeta != null && finalMeta.getFilePath() != null && !finalMeta.getFilePath().isBlank()) {
                return loadS3Bytes(finalMeta.getFilePath());
            }
        }

        return loadLatestSystemPdfBytes(aprvNo, empNo);
    }

    // ==========================
    // 내부 구현
    // ==========================

    private byte[] generateFinalPdfBytes(long aprvNo, String empNo) {
        aprvAccessService.assertDocAccess(aprvNo, empNo);

        // FINAL_PDF: 결재자별 선택 타입(SIGN/SEAL) 1개만 표시 (SIGN 우선, 없으면 SEAL)
        Map<Long, String> assetImgMap = buildAssetImgMap(aprvNo);

        // FINAL 모드 렌더링: JSP에서 assetImgMap(lineNo -> dataUri)을 src로 사용
        String html = aprvDocRenderService.renderDocViewHtml(aprvNo, empNo, "FINAL", assetImgMap);
        return renderPdf(html);
    }

    private byte[] renderPdf(String html) {
        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.withHtmlContent(html, null);
            builder.toStream(os);
            builder.run();
            return os.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("PDF 생성 실패", e);
        }
    }

    private byte[] loadS3Bytes(String s3Key) {
        assertS3Ready();

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
            throw new IllegalStateException("S3 파일 읽기 실패", e);
        }
    }

    private void assertS3Ready() {
        if (s3Client == null) {
            throw new IllegalStateException("S3Client 빈이 없습니다. cloud.aws.active=true 및 AWS 설정(키/리전)을 확인해 주세요.");
        }
        if (!StringUtils.hasText(bucket)) {
            throw new IllegalStateException("cloud.aws.s3.bucket 설정이 필요합니다.");
        }
    }

    /**
     * FINAL_PDF용 서명/직인 이미지 data URI 맵 생성
     * - 정책: 결재자 선택 타입 1개만 표시
     * - 구현: ASSET_HIST에서 lineNo별 SIGN 우선, 없으면 SEAL
     */
    private Map<Long, String> buildAssetImgMap(long aprvNo) {
        List<AprvAssetHistDTO> hists = aprvMapper.selectAssetHistListByAprvNo(aprvNo);
        Map<Long, String> map = new HashMap<>();

        if (hists == null || hists.isEmpty()) {
            return map;
        }

        // 1) SIGN 우선
        for (AprvAssetHistDTO h : hists) {
            if (h == null || h.getLineNo() == null) continue;
            if (!"SIGN".equals(h.getAssetTypeCd())) continue;
            if (h.getFilePathSnap() == null || h.getFilePathSnap().isBlank()) continue;

            String dataUri = toDataUri(h.getFilePathSnap());
            if (dataUri != null && !dataUri.isBlank()) {
                map.put(h.getLineNo(), dataUri);
            }
        }

        // 2) SIGN 없는 라인은 SEAL
        for (AprvAssetHistDTO h : hists) {
            if (h == null || h.getLineNo() == null) continue;
            if (!"SEAL".equals(h.getAssetTypeCd())) continue;
            if (h.getFilePathSnap() == null || h.getFilePathSnap().isBlank()) continue;

            if (map.containsKey(h.getLineNo())) continue;

            String dataUri = toDataUri(h.getFilePathSnap());
            if (dataUri != null && !dataUri.isBlank()) {
                map.put(h.getLineNo(), dataUri);
            }
        }

        return map;
    }

    private String toDataUri(String s3Key) {
        byte[] bytes = loadS3Bytes(s3Key);
        if (bytes == null || bytes.length == 0) return null;

        String mime = guessImgMime(s3Key);
        String b64 = Base64.getEncoder().encodeToString(bytes);
        return "data:" + mime + ";base64," + b64;
    }

    private String guessImgMime(String key) {
        String k = key == null ? "" : key.toLowerCase();
        if (k.endsWith(".png")) return "image/png";
        if (k.endsWith(".jpg") || k.endsWith(".jpeg")) return "image/jpeg";
        if (k.endsWith(".gif")) return "image/gif";
        return "application/octet-stream";
    }
}