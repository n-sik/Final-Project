package com.flowenect.hr.commons.file.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.flowenect.hr.dto.FileDTO;

@Mapper
public interface FileMapper {
	  /**
     * 부서별 파일 목록 조회
     * @param deptCd 부서코드
     * @return 부서에 속한 파일 리스트 (FileDTO<String> 형태)
     */
    List<FileDTO<String>> selectFileListByDept(String deptCd);

    /**
     * 파일 정보 등록
     * @param fileDto 등록할 파일 정보 (refNo에 부서코드 포함)
     * @return 영향받은 행 수
     */
    int insertFile(FileDTO<?> fileDto);

    /**
     * 파일 선택 삭제 (논리적 삭제: USE_YN = 'N')
     * @param fileNos 삭제할 파일 번호(WORK_DRIVE_NO) 리스트
     * @return 영향받은 행 수
     */
    int updateUseYn(List<Long> fileNos);
    
    /**
     * 사원 관련 파일 정보 등록 (프로필 사진 등)
     * @param fileDto refNo 필드에 사번(String)이 담겨야 함
     */
    int insertEmpFile(FileDTO<?> fileDto);
    
    /**
     * 사원의 기존 프로필 이미지들을 비활성화(USE_YN = 'N') 처리
     * @param empNo 사원번호
     */
    void updatePreviousProfileDisabled(String empNo);
    
    FileDTO<String> selectLatestProfile(String empNo);
}
