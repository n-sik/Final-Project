package com.flowenect.hr.emp.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.flowenect.hr.commons.exception.PkNotFoundException;
import com.flowenect.hr.commons.file.mapper.FileMapper;
import com.flowenect.hr.commons.file.service.FileService;
import com.flowenect.hr.department.board.service.WorkDriveService;
import com.flowenect.hr.department.kpi.mapper.TaskMapper;
import com.flowenect.hr.dto.DeptDTO;
import com.flowenect.hr.dto.EmpDTO;
import com.flowenect.hr.dto.FileDTO;
import com.flowenect.hr.dto.PositionDTO;
import com.flowenect.hr.dto.kpi.TaskDTO;
import com.flowenect.hr.emp.mapper.EmpMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmpServiceImpl implements EmpService {

	private final EmpMapper empMapper;
	private final AuthenticationManager authenticationManager;
	private final PasswordEncoder passwordEncoder;
	private final FileService fileService;
	private final FileMapper fileMapper;
	private final WorkDriveService workDriveService;

	// 사원 등록 시 담당 업무 자동 부여
	private final TaskMapper taskMapper;
	
	private static final String HR_PROJ_NO = "2026HR01";

	@Override
	@Transactional
	public int createEmp(EmpDTO emp, MultipartFile[] attachFiles) {

	    log.info("인서트 전 데이터 체크 - 부서: {}, 직위: {}, 이름: {}", emp.getDeptCd(), emp.getPosCd(), emp.getEmpNm());
	    log.info("사원 등록 비즈니스 로직 시작: {}", emp.getEmpNm());

	    if (emp.getEmpStatCd() == null) emp.setEmpStatCd("WORK");
	    if (emp.getAcntActYn() == null) emp.setAcntActYn("Y");
	    emp.setPwd(passwordEncoder.encode(emp.getPwd()));

	    int result = empMapper.insertEmp(emp);

	    if (result > 0) {
	        String empNo = emp.getEmpNo();
	        String deptCd = emp.getDeptCd();
	        log.info("사원 등록 완료 - 사번: {}", empNo);

	        // 3. 신규 사원 기본 업무 할당
	        TaskDTO defaultTask = new TaskDTO();
	        defaultTask.setEmpNo(empNo);
	        defaultTask.setDeptCd(deptCd);
	        defaultTask.setTaskTitle("신규 사원 기본 업무 할당");
	        defaultTask.setTaskStatCd("진행중");
	        defaultTask.setDelYn("N");
	        defaultTask.setTaskStartDtm(java.sql.Date.valueOf(LocalDate.now()));
	        defaultTask.setTaskEndDtm(java.sql.Date.valueOf("9999-12-31"));
	        taskMapper.insertTask(defaultTask);

	        try {
	            if (attachFiles != null && attachFiles.length > 0) {
	                boolean hasValidFile = false;
	                
	                for (MultipartFile file : attachFiles) {
	                    if (file != null && !file.isEmpty()) {
	                        hasValidFile = true;
	                        break;
	                    }
	                }

	                if (hasValidFile) {
	                    String parentPath = "dept/" + HR_PROJ_NO + "/data/";
	                    workDriveService.createFolder(empNo, parentPath, deptCd, emp.getEmpNm());
	                    log.info("파일 업로드를 위한 사원 전용 폴더 생성 완료: {}{}", parentPath, empNo);

	                    for (int i = 0; i < attachFiles.length; i++) {
	                        MultipartFile file = attachFiles[i];
	                        if (file == null || file.isEmpty()) continue;

	                        String typeCd = (i == 0) ? "PROFILE" : "DOC";

	                        FileDTO<String> fileDto = fileService.saveFile(file, empNo, typeCd);
	                        String externalId = workDriveService.uploadSingleFile(file, empNo, deptCd);
	                        
	                        fileDto.setRefNo(externalId);
	                        fileMapper.insertEmpFile(fileDto);
	                    }
	                }
	            }
	        } catch (Exception e) {
	            log.error("파일 처리 중 치명적 오류 발생: {}", e.getMessage());
	            throw new RuntimeException("사원 등록 중 파일/폴더 생성 실패 (전체 롤백)", e);
	        }
	    }

	    return result;
	}

	/*
	 * @Override
	 * 
	 * @Transactional public ServiceResult createEmp(EmpDTO emp) { // username =
	 * EMP_NO if (isExistEmpNo(emp.getEmpNo())) { return ServiceResult.PKDUPLICATED;
	 * }
	 * 
	 * // 비밀번호 암호화 저장 emp.setPwd(passwordEncoder.encode(emp.getPwd()));
	 * 
	 * int rowcnt = empMapper.insertEmp(emp); if (rowcnt <= 0) return
	 * ServiceResult.FAIL;
	 * 
	 * // 기본 권한 부여(로그인 가능 최소 권한) empMapper.insertEmpRole(emp.getEmpNo(),
	 * "ROLE_USER");
	 * 
	 * return ServiceResult.OK; }
	 */

	/**
	 * 특정 사원 조회
	 * 
	 * @param empNo 사원번호
	 * @return EmpDTO 사원 정보
	 * @throws PkNotFoundException 해당 사번이 없을 경우 발생
	 */

	@Override
	public EmpDTO readEmp(String empNo) throws PkNotFoundException {

		log.info("특정 사원 조회 비즈니스 로직 시작: {}", empNo);

		// DB에서 데이터 조회
		EmpDTO emp = empMapper.selectEmp(empNo);

		// 데이터가 없으면 예외 발생
		if (emp == null) {
			log.info("조회 실패: 사번 {}에 해당하는 사원이 없습니다.", empNo);
			throw new PkNotFoundException(empNo + " 사원을 찾을 수 없습니다.");
		}
		log.info("조회 성공: {}", emp.getEmpNm());
		return emp;
	}

	/*
	 * @Override public EmpDTO readEmp(String empNo) throws PkNotFoundException {
	 * EmpDTO emp = empMapper.selectEmp(empNo); if (emp == null) { throw new
	 * PkNotFoundException("%s 사원 없음".formatted(empNo)); } return emp; }
	 */

	/**
	 * 사원 목록 조회
	 */
	@Override
	public List<EmpDTO> readEmpList() {
		List<EmpDTO> list = empMapper.selectEmpList();

		// 만약 조회 결과가 null이면 빈 리스트를 반환
		if (list == null) {
			return new ArrayList<>();
		}

		log.info("조회된 총 사원 수: {}", list.size());

		return list;
	}

	// 2차 인증

	private Authentication reAuthenticate(String empNo, String password) throws AuthenticationException {
		UsernamePasswordAuthenticationToken token = UsernamePasswordAuthenticationToken.unauthenticated(empNo,
				password);
		return authenticationManager.authenticate(token);
	}

	private void changeAuthentication(String empNo, String password) {
		Authentication newAuth = reAuthenticate(empNo, password);
		SecurityContextHolder.getContext().setAuthentication(newAuth);
	}

	/*
	 * @Override
	 * 
	 * @Transactional public boolean modifyEmp(EmpDTO emp) throws
	 * AuthenticationException {
	 * 
	 * String empNo = emp.getEmpNo(); String currentPassword = emp.getPwd();
	 * 
	 * reAuthenticate(empNo, currentPassword);
	 * 
	 * // 비밀번호 변경은 changePassword로만 하도록 pwd는 null 처리 emp.setPwd(null);
	 * 
	 * boolean success = empMapper.updateEmp(emp) > 0; if (success) { // 인증정보 유지/갱신
	 * changeAuthentication(empNo, currentPassword); } return success; }
	 */

	@Override
	@Transactional
	public boolean removeEmp(EmpDTO emp) throws AuthenticationException {
		String empNo = emp.getEmpNo();
		String currentPassword = emp.getPwd();

		// 1) 대상 존재 확인
		EmpDTO saved = empMapper.selectEmp(empNo);
		if (saved == null) {
			return false;
		}

		// 2) 이미 비활성/퇴사면 중복 처리 방지
		// ACNT_ACT_YN이 CHAR(1) 이고 'N'이면 막기
		if ("N".equals(saved.getAcntActYn())) {
			return false;
		}

		// 3) 2차 인증(현재 비밀번호 확인)
		reAuthenticate(empNo, currentPassword);

		// 4) 논리삭제(퇴사처리) 실행
		int rowcnt = empMapper.deleteEmp(empNo);
		return rowcnt > 0;
	}

	@Override
	@Transactional
	public boolean changePassword(String empNo, String currentPassword, String newPassword)
			throws AuthenticationException {

		// 현재 비밀번호 확인(2차 인증)
		reAuthenticate(empNo, currentPassword);

		// 새 비밀번호 암호화 후 저장
		String encodedNew = passwordEncoder.encode(newPassword);

		int rowcnt = empMapper.updatePassword(EmpDTO.builder().empNo(empNo).pwd(encodedNew).build());

		if (rowcnt > 0) {
			// 변경 후 세션 인증정보도 갱신
			changeAuthentication(empNo, newPassword);
			return true;
		}
		return false;
	}

	@Override
	public boolean isExistEmpNo(String empNo) {
		return empMapper.selectEmpForAuth(empNo) != null;
	}

	// 권한 관리(옵션)

	@Override
	@Transactional
	public boolean grantRole(String empNo, String roleCd) {
		return empMapper.insertEmpRole(empNo, roleCd) > 0;
	}

	@Override
	@Transactional
	public boolean revokeRole(String empNo, String roleCd) {
		return empMapper.deleteEmpRole(empNo, roleCd) > 0;
	}

	@Override
	@Transactional
	public boolean replaceRoles(String empNo, List<String> roleCds) {
		empMapper.deleteEmpRoles(empNo);

		int cnt = 0;
		for (String roleCd : roleCds) {
			cnt += empMapper.insertEmpRole(empNo, roleCd);
		}
		return cnt == roleCds.size();
	}

	@Override
	@Transactional
	public boolean updateProfilePath(String empNo, String profilePath) {
		return empMapper.updateProfilePath(empNo, profilePath) > 0;
	}

	/**
	 * 직위 목록 조회
	 * 
	 * @param useYn "Y" 전달 시 사용 중인 직위만(선택박스), null 전달 시 전체 조회
	 */
	@Override
	@Transactional
	public List<PositionDTO> readPosList(String useYn) {
		log.info("직위 목록 조회 요청 - 조건(useYn): {}", useYn);
		return empMapper.selectPosList(useYn);
	}

	/**
	 * 직위 등록
	 * 
	 * @Transactional: 직위 등록 중 오류 발생 시 모든 작업을 롤백합니다.
	 */
	@Override
	@Transactional
	public int createPos(PositionDTO pos) {
		log.info("직위 등록 요청: {} ({})", pos.getPosNm(), pos.getPosCd());
		return empMapper.insertPos(pos);
	}

	/**
	 * 직위 수정
	 * 
	 * @Transactional: 직위 수정 중 오류 발생 시 모든 작업을 롤백합니다.
	 */
	@Override
	@Transactional
	public int modifyPos(PositionDTO pos) {
		log.info("직위 수정 요청: {}", pos.getPosCd());
		// 수정 성공 여부를 확인하기 위해 실행 결과(영향받은 행 수)를 받음
		int result = empMapper.updatePos(pos);

		if (result == 0) {
			// WHERE POS_CD = #{posCd} 조건에 맞는 데이터가 없는 경우
			throw new RuntimeException("수정할 직위 정보를 찾을 수 없습니다.");
		}

		return result;
	}

	/**
	 * 직위 삭제
	 * 
	 * @Transactional: 직위 삭제 중 오류 발생 시 모든 작업을 롤백합니다.
	 */
	@Override
	@Transactional
	public int removePos(String posCd) {
		log.info("직위 삭제(비활성화) 요청: {}", posCd);

		int result = empMapper.deletePos(posCd);

		if (result == 0) {
			throw new RuntimeException("삭제할 직위 정보를 찾을 수 없습니다.");
		}

		return result;
	}

	// 부서 목록 조회 (선택박스)
	@Override
	public List<DeptDTO> readDeptList() {
		return empMapper.selectDeptList();
	}

	/**
	 * 사원 수정
	 * 
	 * @Transactional: 사원 정보 수정 중 오류 발생 시 모든 작업을 롤백합니다.
	 */
	@Override
	@Transactional
	public int modifyEmp(EmpDTO emp, MultipartFile profileImg) {

		log.info("사원 수정 비즈니스 로직 시작: {}", emp.getEmpNm());

		// 1. 필수 데이터 검증 (사번이 없으면 수정을 진행할 수 없음)
		if (emp.getEmpNo() == null || emp.getEmpNo().trim().isEmpty()) {
			log.error("수정 실패: 사원 번호가 누락되었습니다.");
			return 0;
		}

		try {
			// 2. 파일 처리 로직 (이미지가 있을 경우)
			if (profileImg != null && !profileImg.isEmpty()) {
				log.info("프로필 이미지 업로드 처리 중: {}", profileImg.getOriginalFilename());
				// 파일 저장 로직 호출 (예: fileService.upload(profileImg))
				// String savedFileName = fileService.upload(profileImg);
				// emp.setProfilePath(savedFileName);
			}

			// 3. Mapper 호출하여 DB 수정 실행
			int result = empMapper.updateEmp(emp);

			if (result > 0) {
				log.info("사원 정보 수정 성공 - 사번: {}", emp.getEmpNo());
			} else {
				log.warn("수정된 행이 없습니다. 사번을 확인하세요: {}", emp.getEmpNo());
			}

			return result;

		} catch (Exception e) {
			log.error("사원 수정 상세 에러 원인: ", e);
//	        log.error("사원 수정 중 예외 발생: {}", e.getMessage());
			// 필요에 따라 커스텀 예외를 던지거나 0을 반환
			throw new RuntimeException("사원 정보 수정 중 서버 오류가 발생했습니다.");
		}

	}

}
