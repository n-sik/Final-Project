package com.flowenect.hr.commons.file.service;

import java.io.IOException;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.flowenect.hr.commons.file.FileType;
import com.flowenect.hr.commons.file.storage.FileStorage;
import com.flowenect.hr.dto.FileDTO;
import com.flowenect.hr.dto.FileMetaDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CopyObjectRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileServiceImpl implements FileService {

	private final FileStorage fileStorage;
	private final S3Client s3Client;
	
	@Value("${cloud.aws.s3.bucket}")
    private String bucketName;
	
	@Override
	public <T> FileDTO<T> saveFile(MultipartFile file, T refNo, String fileTypeCd) {
		return this.saveFile(file, refNo, fileTypeCd, null);
	}

	/**
	 * ✅ 파일 물리 저장 및 메타 정보 생성
	 * 1. 경로 결정: 외부 전달 경로(domainPath)가 있으면 우선 사용, 없으면 Enum 정책에 따름
	 * 2. 스토리지 업로드: 결정된 경로로 실제 파일 전송
	 * 3. 메타 정보 추출: 업로드 결과물에서 파일명, 경로, 확장자 등을 분리하여 DTO 생성
	 */
	@Override
	@Transactional
	public <T> FileDTO<T> saveFile(MultipartFile file, T refNo, String fileTypeCd, String domainPath) {
		String refNoStr = String.valueOf(refNo);

		// 🚩 경로 우선순위: domainPath(커스텀) > Enum 기본 경로
	    String finalPath = (domainPath != null && !domainPath.isEmpty()) 
	                       ? domainPath 
	                       : determineDomainPath(fileTypeCd, refNoStr);

	    // 실제 파일 업로드 처리 (S3에 물리 파일 저장)
	    String uploadedPath = fileStorage.upload(file, finalPath);

	    // DB 저장 및 관리용 파일 상세 정보(Meta) 생성
	    FileMetaDTO fileMeta = FileMetaDTO.builder()
	            .fileNm(file.getOriginalFilename())           // 원본 파일명
	            .saveFileNm(extractFileName(uploadedPath))    // S3에 저장된 실제 Key명
	            .filePath(extractPath(uploadedPath))          // 파일 저장 경로 (마지막 / 포함)
	            .fileSize(file.getSize())                     // 파일 크기
	            .fileExt(extractExt(file.getOriginalFilename())) // 확장자
	            .regDtm(LocalDateTime.now())                  // 등록 일시
	            .delYn("N")                                   // 삭제 여부
	            .build();

	    return new FileDTO<>(refNo, fileTypeCd, fileMeta);
	}

	/**
	 * 📂 파일 유형(Enum)에 따른 기본 도메인 경로 결정
	 */
	private String determineDomainPath(String fileTypeCd, String refNoStr) {
		return FileType.of(fileTypeCd).getFullPath(refNoStr);
	}

	/**
	 * ✂️ 전체 경로(Key)에서 실제 파일명만 추출 (예: path/to/file.jpg -> file.jpg)
	 */
	private String extractFileName(String path) {
		if (path == null || !path.contains("/"))
			return path;
		return path.substring(path.lastIndexOf("/") + 1);
	}

	/**
	 * ✂️ 전체 경로(Key)에서 디렉토리 경로만 추출 (예: path/to/file.jpg -> path/to/)
	 */
	private String extractPath(String path) {
		if (path == null || !path.contains("/"))
			return "";
		return path.substring(0, path.lastIndexOf("/") + 1);
	}

	/**
	 * ✂️ 원본 파일명에서 확장자 추출 (예: photo.png -> png)
	 */
	private String extractExt(String fileName) {
		if (fileName == null || !fileName.contains("."))
			return "";
		return fileName.substring(fileName.lastIndexOf(".") + 1);
	}

	/**
	 * ✅ S3 물리 폴더 생성
	 * S3는 실제 폴더 개념이 없으므로, 경로 끝에 '/'를 붙인 0바이트 객체를 생성하여 폴더 구조를 흉내냄
	 */
	@Override
	public boolean makeDirectory(String domainPath) {
	    try {
	        String folderKey = domainPath.endsWith("/") ? domainPath : domainPath + "/";

	        PutObjectRequest putRequest = PutObjectRequest.builder()
	                .bucket(bucketName)
	                .key(folderKey)
	                .build();

	        // 내용물(RequestBody)이 비어있는 객체 전송
	        s3Client.putObject(putRequest, RequestBody.empty());
	        
	        log.info("S3 물리 폴더 생성 완료: {}", folderKey);
	        return true;
	    } catch (Exception e) {
	        log.error("S3 폴더 생성 실패: {}", e.getMessage());
	        return false;
	    }
	}

	/**
	 * ✅ S3 파일 이동 (Copy & Delete)
	 * S3는 원자적인 '이동' 기능이 없으므로, 대상을 복사(Copy)한 후 원본을 삭제(Delete)함
	 */
	@Override
    public void moveS3File(String oldPath, String targetPath, String saveFileNm) {
        try {
            String sourceKey = oldPath + saveFileNm;
            String destinationKey = targetPath + saveFileNm;

            // 1. 대상 경로로 복사 시도
            CopyObjectRequest copyRequest = CopyObjectRequest.builder()
                    .sourceBucket(bucketName)
                    .sourceKey(sourceKey)
                    .destinationBucket(bucketName)
                    .destinationKey(destinationKey)
                    .build();
            s3Client.copyObject(copyRequest);

            // 2. 복사 성공 시 원본 삭제
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(sourceKey)
                    .build();
            s3Client.deleteObject(deleteRequest);

            log.info("S3 물리 이동 완료: {} -> {}", sourceKey, destinationKey);

        } catch (S3Exception e) {
            log.error("AWS S3 오류: {}", e.awsErrorDetails().errorMessage());
            throw new RuntimeException("S3 물리 이동 실패", e);
        }
    }
	
	/**
	 * ✅ S3에서 파일 데이터(byte[]) 읽기
	 * 미리보기(inline) 또는 다운로드 시 S3 객체를 스트림으로 읽어 바이트 배열로 반환
	 */
	public byte[] getS3FileBytes(FileMetaDTO fileMeta) {
	    String filePath = fileMeta.getFilePath();
	    // 경로와 파일명 사이의 슬래시(/) 정규화
	    if (filePath != null && !filePath.endsWith("/")) filePath += "/";
	    String s3Key = filePath + fileMeta.getSaveFileNm();

	    try (ResponseInputStream<GetObjectResponse> s3Object = s3Client.getObject(
	            GetObjectRequest.builder().bucket(bucketName).key(s3Key).build())) {
	        return s3Object.readAllBytes();
	    } catch (IOException e) {
	        throw new RuntimeException("파일 읽기 실패: " + s3Key, e);
	    }
	}
}