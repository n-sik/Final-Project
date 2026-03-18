package com.flowenect.hr.department.board.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.flowenect.hr.dto.FileDTO;
import com.flowenect.hr.dto.FileMetaDTO;

@Mapper
public interface WorkDriveMapper {
    
    /**
     * 부서별 파일 목록 조회
     */
    List<FileDTO<String>> selectFileListByDept(String deptCd);
    
    /**
     * 파일 저장 (WORK_DRIVE 테이블)
     */
    int insertFile(@Param("file") FileDTO<String> fileDto, @Param("deptCd") String deptCd);
    
    /**
     * 파일 삭제 (USE_YN = 'N'으로 변경)
     */
    int updateUseYn(List<Long> fileNos);
    
    
    /**
     * 파일 번호로 파일 메타 정보 조회
     * @param fileNo 파일 번호
     * @return 파일 메타 정보
     */
    FileMetaDTO selectByFileNo(Long fileNo);
    
    
    /**
     * 파일 또는 폴더의 논리적 위치(경로)를 변경합니다.
     * 드래그 앤 드롭 이동 기능에서 사용됩니다.
     * * @param fileNo 이동할 파일/폴더의 고유 번호 (PK)
     * @param targetPath 이동될 대상 폴더의 경로 (예: deptHR/2026HR01/data/폴더명/)
     * @return 업데이트 성공 시 1, 실패 시 0
     */
    int updateFilePath(@Param("fileNo") Long fileNo, @Param("targetPath") String targetPath);
    
    /**
     * 특정 부서의 특정 경로 내에 있는 파일 및 폴더 목록을 조회합니다.
     * * @param deptCd   부서 코드 (예: 2026HR01)
     * @param filePath 현재 보고 있는 폴더 경로 (예: deptHR/2026HR01/data/)
     * @return 파일 및 폴더 목록
     */
    List<FileDTO<String>> selectFileListByPath(@Param("deptCd") String deptCd, 
                                               @Param("filePath") String filePath);
    
}