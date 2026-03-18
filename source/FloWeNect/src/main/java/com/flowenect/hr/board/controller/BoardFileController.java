package com.flowenect.hr.board.controller;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.flowenect.hr.board.service.BoardService;
import com.flowenect.hr.dto.board.BoardFileDTO;
import com.flowenect.hr.dto.EmpDTO;
import com.flowenect.hr.security.AuthenticationUtils;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class BoardFileController {

	private final BoardService boardService;

	@Value("${storage.type:s3}")
	private String storageType;

	@Value("${storage.local.path:}")
	private String localBasePath;

	@Value("${storage.s3.bucket:${cloud.aws.s3.bucket:}}")
	private String s3Bucket;

	@org.springframework.beans.factory.annotation.Autowired(required = false)
	private software.amazon.awssdk.services.s3.S3Client s3Client;

	/**
	 * 첨부파일 업로드
	 * - 파일은 fileService(commons/file)로 실제 저장
	 * - DB에는 BOARD_FILE에 메타 저장
	 */
	@PostMapping(path = "/rest/board/file/upload/{postNo}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<List<BoardFileDTO>> upload(
            @PathVariable int postNo,
            @RequestParam String regEmpNo,
            Authentication authentication,
			@RequestPart("files") List<MultipartFile> files) {
        try {
            if (authentication != null && authentication.isAuthenticated()) {
                EmpDTO u = AuthenticationUtils.getRealUser(authentication);
                if (u != null && u.getEmpNo() != null && !u.getEmpNo().isBlank()) {
                    regEmpNo = u.getEmpNo();
                }
            }
        } catch (Exception ignore) {}
        return ResponseEntity.ok(boardService.uploadBoardFiles(postNo, regEmpNo, files));
    }

	/**
	 * 첨부파일 목록
	 */
	@GetMapping("/rest/board/file/readList/{postNo}")
	public ResponseEntity<List<BoardFileDTO>> readList(@PathVariable int postNo) {
		return ResponseEntity.ok(boardService.listBoardFiles(postNo));
	}

	/**
	 * 첨부파일 다운로드
	 * - DB의 filePath/saveFileNm을 이용해 파일서버에서 읽어옴
	 */
	@GetMapping("/rest/board/file/download/{boardFileNo}")
	public ResponseEntity<?> download(@PathVariable long boardFileNo) throws IOException {
		BoardFileDTO f = boardService.getBoardFile(boardFileNo);
		if (f == null) return ResponseEntity.notFound().build();

		String originalName = StringUtils.hasText(f.getFileNm()) ? f.getFileNm() : ("file_" + boardFileNo);
		String encodedName = URLEncoder.encode(originalName, StandardCharsets.UTF_8).replaceAll("\\+", "%20");

		// storage.type == local
		if ("local".equalsIgnoreCase(storageType)) {
			if (!StringUtils.hasText(localBasePath)) {
				return ResponseEntity.internalServerError().body("storage.local.path 설정이 필요합니다.");
			}

			File file = new File(localBasePath, f.getFilePath() + File.separator + f.getSaveFileNm());
			if (!file.exists()) return ResponseEntity.notFound().build();

			InputStreamResource resource = new InputStreamResource(new FileInputStream(file));
			return ResponseEntity.ok()
					.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedName)
					.contentType(MediaType.APPLICATION_OCTET_STREAM)
					.contentLength(file.length())
					.body(resource);
		}

		// storage.type == s3 (기본)
		if (s3Client == null) {
			return ResponseEntity.internalServerError().body("S3Client 빈이 없습니다. storage.type을 local로 설정하거나 S3 설정을 확인하세요.");
		}
		if (!StringUtils.hasText(s3Bucket)) {
			return ResponseEntity.internalServerError().body("storage.s3.bucket 설정이 필요합니다.");
		}

		String key = buildKey(f.getFilePath(), f.getSaveFileNm());
		software.amazon.awssdk.services.s3.model.GetObjectRequest req =
				software.amazon.awssdk.services.s3.model.GetObjectRequest.builder()
						.bucket(s3Bucket)
						.key(key)
						.build();

		software.amazon.awssdk.core.ResponseInputStream<software.amazon.awssdk.services.s3.model.GetObjectResponse> s3is =
				s3Client.getObject(req);

		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedName)
				.contentType(MediaType.APPLICATION_OCTET_STREAM)
				.body(new InputStreamResource(s3is));
	}

	@DeleteMapping("/rest/board/file/remove/{boardFileNo}")
	public ResponseEntity<String> remove(@PathVariable long boardFileNo) {
		int r = boardService.deleteBoardFile(boardFileNo);
		return r == 1 ? ResponseEntity.ok("success") : ResponseEntity.internalServerError().build();
	}
	
	private String buildKey(String filePath, String saveFileNm) {
	    String p = (filePath == null) ? "" : filePath.trim();
	    String n = (saveFileNm == null) ? "" : saveFileNm.trim();

	    if (!StringUtils.hasText(p)) return n;
	    // 끝 슬래시 제거
	    while (p.endsWith("/") || p.endsWith("\\")) {
	        p = p.substring(0, p.length() - 1);
	    }
	    return p + "/" + n;
	}
}
