package com.flowenect.hr.commons.file.storage;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
@ConditionalOnProperty(name = "storage.type", havingValue = "local")
public class LocalFileStorageImpl implements FileStorage {

    @Value("${storage.local.path}")
    private String uploadPath;

    @Override
    public String upload(MultipartFile file, String domainPath) {
        if (file.isEmpty()) {
            throw new RuntimeException("파일이 비어있습니다.");
        }

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        
        try {
            Path root = Paths.get(uploadPath, domainPath); 
            
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }

            Path targetPath = root.resolve(fileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            return domainPath + "/" + fileName;
            
        } catch (IOException e) {
            throw new RuntimeException("로컬 파일 저장 실패", e);
        }
    }
    
    /**
     * ✅ 추가된 물리적 디렉토리 생성 로직
     */
    @Override
    public boolean createDirectory(String domainPath) {
        try {
            // 1. 설정된 기본 경로(uploadPath)와 요청된 도메인 경로(domainPath)를 결합
            Path root = Paths.get(uploadPath, domainPath); 
            
            // 2. 해당 경로에 폴더가 존재하는지 확인
            if (!Files.exists(root)) {
                // 3. 존재하지 않으면 생성 (createDirectories는 상위 폴더가 없으면 알아서 다 만듦)
                Files.createDirectories(root);
                return true;
            }
            
            // 이미 존재한다면 false 반환 (또는 필요에 따라 true 반환하도록 기획에 맞춰 수정 가능)
            return false;
            
        } catch (IOException e) {
            // 입출력 오류 발생 시 예외 처리
            throw new RuntimeException("로컬 디렉토리 생성 실패: " + domainPath, e);
        }
    }
}