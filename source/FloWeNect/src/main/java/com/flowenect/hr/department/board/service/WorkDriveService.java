package com.flowenect.hr.department.board.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.flowenect.hr.dto.FileDTO;
import com.flowenect.hr.dto.FileMetaDTO;

public interface WorkDriveService {
	/**
     * [조회] 특정 부서의 특정 경로에 있는 파일 및 폴더 목록을 가져옵니다.
     * @param deptCd   조회할 부서 코드 (예: 2026HR01)
     * @param path     조회할 현재 디렉토리 경로 (예: deptHR/2026HR01/data/)
     * @return         해당 경로에 존재하는 파일/폴더 DTO 리스트
     */
    List<FileDTO<String>> readFileList(String deptCd, String path);
    
    /**
     * [상세 조회] 파일 번호(PK)를 이용해 단일 파일의 메타 정보를 조회합니다.
     * S3에서 파일을 읽어오거나 다운로드할 때 경로 정보를 얻기 위해 사용됩니다.
     * @param fileNo   조회할 파일 고유 번호
     * @return         파일의 상세 메타 정보 (파일명, 경로, 확장자 등)
     */
    FileMetaDTO selectByFileNo(Long fileNo);

    /**
     * [업로드] 다중 파일을 S3 물리 저장소에 업로드하고 DB 메타데이터를 생성합니다.
     * @param files        사용자가 선택한 파일 배열
     * @param deptCd       업로드 주체 부서 코드
     * @param currentPath  파일이 저장될 현재 폴더 위치
     * @return             성공 시 "SUCCESS", 실패 시 에러 메시지
     */
    String uploadFiles(MultipartFile[] files, String deptCd, String currentPath, String empNm);
    
    String uploadSingleFile(MultipartFile file, String empNo, String deptCd);

    /**
     * [폴더 생성] 새 디렉토리를 S3에 생성하고 DB에 '폴더' 타입으로 등록합니다.
     * @param folderName   생성할 폴더 명
     * @param parentPath   새 폴더가 위치할 부모 경로
     * @param deptCd       소유 부서 코드
     * @param empNm        생성자 이름 (작성자 표시용)
     * @return             성공 시 "SUCCESS", 실패 시 "ERROR"
     */
    String createFolder(String folderName, String currentPath, String deptCd, String empNm);

    /**
     * [이동] 파일이나 폴더의 위치(Path)를 변경합니다. (드래그 앤 드롭 대응)
     * @param fileNo       이동시킬 파일의 고유 번호 (PK)
     * @param targetPath   이동 목표가 되는 폴더의 경로
     * @return             성공 시 "SUCCESS", 실패 시 "FAIL" 또는 "ERROR"
     */
    String moveFile(Long fileNo, String targetPath);

    /**
     * [삭제] 선택된 파일들을 논리적으로 삭제 처리(USE_YN = 'N') 합니다.
     * @param fileNos      삭제 대상 파일 번호 리스트
     */
    void deleteFiles(List<Long> fileNos);
    
}
