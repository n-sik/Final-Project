package com.flowenect.hr.commons.file.service;

import org.springframework.web.multipart.MultipartFile;

import com.flowenect.hr.dto.FileDTO;
import com.flowenect.hr.dto.FileMetaDTO;

public interface FileService {
	
	/**
     * ✅ [일반형] S3 물리 파일 업로드 및 메타 정보 생성
     * 시스템에서 정의한 기본 규칙(FileType Enum)에 따라 경로를 자동 생성하여 저장합니다.
     * * @param <T>          참조 번호(PK)의 타입 (Integer, Long, String 등)
     * @param file         업로드할 실제 파일 (MultipartFile)
     * @param refNo        연관된 데이터의 고유 식별자 (예: 게시글 번호, 사원 번호)
     * @param fileTypeCd   파일 유형 코드 (예: BOARD, PROFILE, DEPT_DOC)
     * @return 파일 메타 정보가 담긴 FileDTO 객체
     */
    <T> FileDTO<T> saveFile(MultipartFile file, T refNo, String fileTypeCd);

    /**
     * ✅ [경로 지정형] S3 물리 파일 업로드 및 메타 정보 생성
     * 사용자가 전달한 특정 경로(domainPath)를 우선적으로 사용하여 파일을 저장합니다.
     * 워크드라이브처럼 동적인 폴더 구조가 필요한 경우에 사용합니다.
     * * @param <T>          참조 번호(PK)의 타입 (Integer, Long, String 등)
     * @param file         업로드할 실제 파일 (MultipartFile)
     * @param refNo        연관된 데이터의 고유 식별자 (예: 게시글 번호, 사원 번호)
     * @param fileTypeCd   파일 유형 코드 (예: BOARD, PROFILE, DEPT_DOC)
     * @param domainPath   사용자가 직접 지정한 S3 업로드 경로 (예: deptHR/2026/data/ㅇㅇ/)
     * @return 파일 메타 정보가 담긴 FileDTO 객체
     */
    <T> FileDTO<T> saveFile(MultipartFile file, T refNo, String fileTypeCd, String domainPath);
    
    /**
     * ✅ 물리적 폴더 생성 메서드
     * S3 상에 경로 끝에 '/'를 포함한 0바이트 객체를 생성하여 폴더 구조 형성
     * @param domainPath   생성할 폴더의 전체 경로 (예: dept/hr/2026/)
     * @return 생성 성공 여부
     */
    boolean makeDirectory(String domainPath);

    /**
     * ✅ S3 물리 파일 이동 (복사 후 삭제)
     * S3는 이동 기능이 없으므로 CopyObject 후 DeleteObject 순서로 진행
     * @param oldPath      원본 파일이 위치한 경로
     * @param targetPath   파일을 옮길 대상 경로
     * @param saveFileNm   저장된 파일명 (UUID가 포함된 실제 S3 키명)
     */
    void moveS3File(String oldPath, String targetPath, String saveFileNm);
    
    /**
     * ✅ S3 물리 파일 데이터 읽기
     * 이미지 미리보기(inline) 또는 파일 다운로드(attachment) 시 바이트 스트림 반환
     * @param fileMeta     파일 상세 정보 (경로 및 저장파일명 정보 포함)
     * @return 파일의 바이트 배열(byte array) 데이터
     */
    byte[] getS3FileBytes(FileMetaDTO fileMeta);
}