package com.flowenect.hr.department.board.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.flowenect.hr.commons.file.service.FileService;
import com.flowenect.hr.department.board.mapper.WorkDriveMapper;
import com.flowenect.hr.dto.FileDTO;
import com.flowenect.hr.dto.FileMetaDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class WorkDriveServiceImpl implements WorkDriveService {

	private final FileService fileService;
	private final WorkDriveMapper workDriveMapper;
	private static final String HR_DEPT_CD = "2026HR01";
	/**
	 * ✅ 부서 및 경로별 파일 목록 조회
	 */
	@Override
	public List<FileDTO<String>> readFileList(String deptCd, String path) {
		return workDriveMapper.selectFileListByPath(deptCd, path);
	}

	/**
	 * ✅ 파일 번호로 단일 파일 메타 정보 상세 조회 컨트롤러에서 파일 보기/다운로드 시 S3 경로를 찾기 위해 호출합니다.
	 */
	@Override
	public FileMetaDTO selectByFileNo(Long fileNo) {
		// 🚩 [수정] null 대신 매퍼를 호출하여 DB 데이터를 반환합니다.
		return workDriveMapper.selectByFileNo(fileNo);
	}

	/**
	 * ✅ 다중 파일 업로드 S3에 물리 파일을 저장(currentPath 반영)하고, 그 메타 정보를 DB에 저장합니다.
	 */
	@Override
	@Transactional
	public String uploadFiles(MultipartFile[] files, String deptCd, String currentPath, String empNm) {
		try {
			for (MultipartFile file : files) {
				// FileService의 4개 인자 버전 메서드를 사용하여 커스텀 경로로 업로드
				FileDTO<String> uploadedFile = fileService.saveFile(file, deptCd, "DEPT", currentPath);

				// DB 저장을 위해 추가 정보(현재 경로, 업로드한 사원명) 설정
				uploadedFile.getFileMeta().setFilePath(currentPath);
				uploadedFile.getFileMeta().setEmpNm(empNm);

				workDriveMapper.insertFile(uploadedFile, HR_DEPT_CD);
			}
			return "SUCCESS";
		} catch (Exception e) {
			log.error("업로드 서비스 에러", e);
			throw new RuntimeException("업로드 중 오류 발생", e);
		}
	}

	@Override
	@Transactional
	public String uploadSingleFile(MultipartFile file, String empNo, String deptCd) {
	    try {
	    	
	    	String folderPath = "dept/" + HR_DEPT_CD + "/data/" + empNo + "/";
	        
	        FileDTO<String> uploadedFile = fileService.saveFile(file, empNo, "DOC", folderPath);
	        
	        log.info("최종 DB 저장 경로: {}", uploadedFile.getFileMeta().getFilePath());

	        workDriveMapper.insertFile(uploadedFile, HR_DEPT_CD);
	        
	        return uploadedFile.getRefNo();
	    } catch (Exception e) {
	        log.error("파일 업로드 실패", e);
	        throw new RuntimeException("파일 업로드 중 오류 발생", e);
	    }
	}

	/**
	 * ✅ 새 폴더 생성 S3에 0바이트 객체로 폴더 구조를 만들고, DB에는 '폴더' 타입으로 메타데이터를 등록합니다.
	 */
	@Override
	@Transactional
	public String createFolder(String folderName, String currentPath, String deptCd, String empNm) {
	    // 경로 끝 슬래시 보정
		
		log.info("{}", folderName);
		log.info("{}", empNm);
		
		
		if (!currentPath.endsWith("/")) currentPath += "/";
	    
	    String fullS3Path = currentPath + folderName + "/";
	    fileService.makeDirectory(fullS3Path);
	    

	    FileMetaDTO folderMeta = FileMetaDTO.builder()
	            .fileNm(folderName)
	            .saveFileNm(folderName)
	            .filePath(currentPath) // 부모 경로
	            .fileSize(0L)
	            .fileExt("폴더")
	            .regDtm(LocalDateTime.now())
	            .delYn("N")
	            .empNm(empNm)
	            .build();

	    FileDTO<String> folderDto = new FileDTO<>(HR_DEPT_CD, "DEPT", folderMeta);
	    workDriveMapper.insertFile(folderDto, HR_DEPT_CD); 
	    
	    return "SUCCESS";
	}

	/**
	 * ✅ 파일/폴더 이동 (Drag & Drop) S3 물리적 위치를 변경(Copy & Delete)한 후, DB의 filePath 컬럼을
	 * 업데이트합니다.
	 */
	@Override
	@Transactional
	public String moveFile(Long fileNo, String targetPath) {
		try {
			FileMetaDTO fileMeta = workDriveMapper.selectByFileNo(fileNo);
			if (fileMeta == null)
				return "NOT_FOUND";

			String oldPath = fileMeta.getFilePath();
			String saveFileNm = fileMeta.getSaveFileNm();

			// 1. S3 물리 이동
			fileService.moveS3File(oldPath, targetPath, saveFileNm);

			// 2. DB 경로 정보 업데이트
			int result = workDriveMapper.updateFilePath(fileNo, targetPath);

			log.info("파일 이동 완료: {} -> {} (파일명: {})", oldPath, targetPath, saveFileNm);
			return (result > 0) ? "SUCCESS" : "FAIL";

		} catch (Exception e) {
			log.error("파일 이동 중 물리적 에러 발생: {}", e.getMessage());
			throw new RuntimeException("S3 Move Failed", e);
		}
	}

	/**
	 * ✅ 파일 논리 삭제 실제 파일을 지우지 않고 USE_YN 상태만 'N'으로 변경합니다.
	 */
	@Override
	public void deleteFiles(List<Long> fileNos) {
		workDriveMapper.updateUseYn(fileNos);
	}
}