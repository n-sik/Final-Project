package com.flowenect.hr.emp.service;

import java.util.List;

import org.springframework.security.core.AuthenticationException;
import org.springframework.web.multipart.MultipartFile;

import com.flowenect.hr.commons.exception.PkNotFoundException;
import com.flowenect.hr.dto.DeptDTO;
import com.flowenect.hr.dto.EmpDTO;
import com.flowenect.hr.dto.PositionDTO;
//  확인
public interface EmpService {

	/**
	 * 직위 목록 조회 (사원 등록 - 선택박스, 직위관리)
	 * @param useYn "Y"면 사용중인 것만, null이면 전체 조회
	 */
	List<PositionDTO> readPosList(String useYn);
	
	/**
	 * 직위 등록
	 */
	int createPos(PositionDTO pos);
	
	/**
	 * 직위 수정
	 */
	int modifyPos(PositionDTO pos);
	
	/**
	 * 직위 삭제
	 */
	int removePos(String posCd);
	
	/**
	 * 부서 목록 조회 (선택박스)
	 */
	List<DeptDTO> readDeptList();
	
	/**
     * 사원 정보 등록 및 모든 관련 파일(프로필 + 서류) 통합 업로드
     * @param emp 사원 정보
     * @param files 파일 배열 (0번째는 프로필, 나머지는 증빙서류 등 약속 가능)
     */
    int createEmp(EmpDTO emp, MultipartFile[] files);

	/**
	 * 특정 사원 조회
	 */
	EmpDTO readEmp(String empNo) throws PkNotFoundException;

	/**
	 * 사원 목록 조회
	 */
	List<EmpDTO> readEmpList();
	
	/**
	 * 사원 수정
	 */
	int modifyEmp(EmpDTO emp, MultipartFile profileImg);

	/**
	 * 사원 정보 수정 (2차 인증: 현재 비밀번호 확인 필요)
	 */
//	boolean modifyEmp(EmpDTO emp) throws AuthenticationException;

	/**
	 * 사원 삭제 (2차 인증: 현재 비밀번호 확인 필요)
	 */
	boolean removeEmp(EmpDTO emp) throws AuthenticationException;

	/**
	 * 비밀번호 변경
	 */
	boolean changePassword(String empNo, String currentPassword, String newPassword)
			throws AuthenticationException;

	/**
	 * 존재 여부 확인 (username=EMP_NO)
	 */
	boolean isExistEmpNo(String empNo);

	/**
	 * 권한 부여
	 */
	boolean grantRole(String empNo, String roleCd);

	/**
	 * 권한 회수
	 */
	boolean revokeRole(String empNo, String roleCd);

	/**
	 * 권한 전체 교체(옵션)
	 */
	boolean replaceRoles(String empNo, List<String> roleCds);

	/**
	 * 프로필 경로 업데이트
	 */
	boolean updateProfilePath(String empNo, String profilePath);
}
