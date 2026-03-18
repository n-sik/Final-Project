package com.flowenect.hr.commons.file.storage;

import java.io.IOException;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Component
@ConditionalOnProperty(name = "storage.type", havingValue = "s3")
@RequiredArgsConstructor
public class S3FileStorageImpl implements FileStorage {

	private final S3Client s3Client;

	@Value("${cloud.aws.s3.bucket}")
	private String bucket;

	@Override
	public String upload(MultipartFile file, String domainPath) {

		// 1. 파일명 생성
		String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

		// 2. S3 Key 조립 (예: "emp/profile/uuid_name.png")
		// domainPath가 뒤에 /가 없을 수도 있으니 체크해서 조립
		String s3Key = domainPath.endsWith("/") ? domainPath + fileName : domainPath + "/" + fileName;

		try {
			PutObjectRequest putObjectRequest = PutObjectRequest.builder().bucket(bucket).key(s3Key) // 조립된 경로+파일명 적용
					.contentType(file.getContentType()).build();

			s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

			// 3. 나중에 DB 조회를 위해 최종 저장된 전체 경로(Key)를 반환
			return s3Key;

		} catch (IOException e) {
			throw new RuntimeException("S3 Upload Failed", e);
		}
	}
	
	@Override
    public boolean createDirectory(String domainPath) {
        try {
            // 1. S3에서 폴더로 인식되려면 경로 끝에 반드시 '/'가 있어야 함
            String folderKey = domainPath.endsWith("/") ? domainPath : domainPath + "/";

            // 2. 0바이트 빈 객체 생성 요청
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(folderKey)
                    .build();

            // 3. 내용이 비어있는 RequestBody 전달
            s3Client.putObject(putObjectRequest, RequestBody.empty());
            
            return true;
        } catch (Exception e) {
            // S3 관련 예외 처리
            throw new RuntimeException("S3 가상 폴더 생성 실패: " + domainPath, e);
        }
    }
	
}
