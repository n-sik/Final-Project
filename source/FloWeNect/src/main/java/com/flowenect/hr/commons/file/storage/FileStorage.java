package com.flowenect.hr.commons.file.storage;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorage {
	String upload(MultipartFile file, String domainPath);
	
	/**
     * ✅ 추가: 물리적 디렉토리 생성
     * @param domainPath 저장할 도메인 경로 (예: "dept/2026HR01/work-drive/new_folder")
     * @return 생성 성공 여부
     */
    boolean createDirectory(String domainPath);
}
