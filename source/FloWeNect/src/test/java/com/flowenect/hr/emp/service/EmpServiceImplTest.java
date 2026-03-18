package com.flowenect.hr.emp.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.flowenect.hr.commons.exception.PkNotFoundException;
import com.flowenect.hr.dto.EmpDTO;
import com.flowenect.hr.dto.PositionDTO;

import lombok.extern.slf4j.Slf4j;

@SpringBootTest(properties = { "jasypt.encryptor.password=java" })
@Slf4j
@Transactional
class EmpServiceImplTest {

	@Autowired
	EmpService empService;
	
//	@Autowired
//	MultipartFile fileMultipartFile;
//	
//	@Test
//	void testCreateEmp() {
//		EmpDTO emp = EmpDTO.builder()
//							.deptCd("2026HR01")
//							.posCd("POS_02")
//							.empNm("테스트")
//							.pwd("1234")
//							.hireDt(LocalDate.now())
//							.empEmail("test@test.com")
//							.hpNo("010-1111-1111")
//							.rrno("260101-1111111")
//							.zipCd("12345")
//			                .addr1("서울시 강남구")
//			                .addr2("테헤란로 123")
//			                .empStatCd("WORK")
//							.build();
//		
//		int result = empService.createEmp(emp, fileMultipartFile);
//		
//		assertThat(result).isEqualTo(1);
//		assertThat(emp.getEmpNo()).isNotNull();
//		log.info("생성된 사원번호: {}, 이름: {}", emp.getEmpNo(), emp.getEmpNm());
//	}

	@Test
	void testReadEmp() {
		// DB에 존재하는 사번 입력
		String empNo = "2026020209";
				
		EmpDTO emp = empService.readEmp(empNo);
				
		assertNotNull(emp, "조회된 사원 정보가 null입니다. 사번을 확인하세요.");
		assertEquals(empNo, emp.getEmpNo(), "조회된 사번이 일치하지 않습니다.");
		        
		log.info("======= 사원 상세 정보 =======");
		log.info("사번: {}", emp.getEmpNo());
		log.info("이름: {}", emp.getEmpNm());
		log.info("부서: {}", emp.getDeptCd());
		log.info("직위: {}", emp.getPosCd());
		log.info("입사일자: {}", emp.getHireDt());
		log.info("상태: {}", emp.getEmpStatCd());
		log.info("============================");
		
	
		if (empNo == null) {
			assertThrows(PkNotFoundException.class, () -> {
				empService.readEmp(empNo);
			}, "사원이 없으면 PkNotFoundException 발생합니다.");
		}
	}

	@Test
	void testReadEmpList() {
		List<EmpDTO> list = empService.readEmpList();

		assertNotNull(list, "조회된 리스트 객체 자체가 null입니다.");
        assertFalse(list.isEmpty(), "조회된 사원 데이터가 한 건도 없습니다. DB를 확인하세요.");
		
        log.info("조회된 사원 목록 (총 {}명)", list.size());
		list.forEach(emp -> log.info("사원명: {}, 사번: {}, 부서: {}, 직위: {}, 입사일자: {}, 상태: {}", 
				emp.getEmpNm(), emp.getEmpNo(), emp.getDeptCd(), emp.getPosCd(), emp.getHireDt(), emp.getEmpStatCd()));
	}

	@Test
	void testModifyEmp() {
		// 1. 준비: 수정할 사원 정보 (기존에 DB에 있는 사번 사용)
        String empNo = "2026020206";
        EmpDTO updateDto = EmpDTO.builder()
                .empNo(empNo)
                .empNm("수정된이름")
                .deptCd("2026PD01")
                .posCd("POS_03")
                .hireDt(LocalDate.now())
                .empEmail("edit_service@test.com")
                .empStatCd("재직")
                .build();

        // 2. 가짜 이미지 파일 생성 (Spring에서 제공하는 MockMultipartFile)
        // (파라미터명, 파일명, 컨텐츠타입, 내용)
//        MockMultipartFile mockFile = new MockMultipartFile(
//                "profileImg", 
//                "test.jpg", 
//                "image/jpeg", 
//                "test image content".getBytes()
//        );

        // 3. 실행
//        int result = empService.modifyEmp(updateDto, mockFile);
        int result = empService.modifyEmp(updateDto, null);

        // 4. 검증
        assertThat(result).isEqualTo(1);
        
        log.info("수정 서비스 결과: {} (1이면 성공)", result);
	}
	
//	@Test
//	void testModifyEmp() {
//		
//	}

	@Test
	void testRemoveEmp() {
		
	}

	@Test
	void testChangePassword() {
		
	}

	@Test
	void testIsExistEmpNo() {
		
	}

	@Test
	void testGrantRole() {
		
	}

	@Test
	void testRevokeRole() {
		
	}

	@Test
	void testReplaceRoles() {
		
	}

	@Test
	void testUpdateProfilePath() {
		
	}

	@Test
	void testreadPosList() {
		// 1. 전체 조회 (관리자용 - null)
        log.info("=== 전체 직위 조회 ===");
        empService.readPosList(null)
                  .forEach(t -> log.info("직위코드 : {}, 직위명 : {}, 사용여부 : {}", t.getPosCd(), t.getPosNm(), t.getUseYn()));
        
        // 2. 사용 중인 것만 조회 (선택박스용 - 'Y')
        log.info("=== 사용 중인 직위 조회 ===");
        List<PositionDTO> usedList = empService.readPosList("Y");
        usedList.forEach(t -> assertThat(t.getUseYn()).isEqualTo("Y"));
	}
	
	@Test
	void testcreatePos() {
		// 등록할 데이터 준비
        PositionDTO dto = new PositionDTO();
        dto.setPosCd("P_SRV_01");
        dto.setPosNm("서비스테스트");
        dto.setPosLvl(50);
        dto.setUseYn("Y");

        // 서비스 메서드 실행
        int result = empService.createPos(dto);

        // 성공 확인
        assertThat(result).isEqualTo(1);
	}
	
	@Test
	void testmodifyPos() {
		// 수정할 대상 데이터 먼저 등록
        PositionDTO dto = new PositionDTO();
        dto.setPosCd("P_SRV_02");
        dto.setPosNm("수정전");
        dto.setPosLvl(60);
        dto.setUseYn("Y");
        empService.createPos(dto);

        // 데이터 변경 후 수정 실행
        dto.setPosNm("수정후");
        int result = empService.modifyPos(dto);

        // 수정 성공 결과 확인
        assertThat(result).isEqualTo(1);
	}
	
	@Test
	void testremovePos() {
		// Given: 테스트용 데이터 등록
        String targetCd = "P_DEL_01";
        PositionDTO dto = PositionDTO.builder()
                .posCd(targetCd)
                .posNm("삭제테스트")
                .posLvl(90)
                .useYn("Y")
                .build();
        empService.createPos(dto);

        // When: 삭제 실행 (USE_YN -> 'N')
        int result = empService.removePos(targetCd);

        // Then: 
        assertThat(result).isEqualTo(1); // 영향받은 행 수가 1인지 확인
        
        // 추가 검증: 전체 목록 조회 시 해당 데이터의 상태가 'N'인지 확인
        PositionDTO deletedDto = empService.readPosList(null).stream()
                .filter(p -> targetCd.equals(p.getPosCd()))
                .findFirst()
                .orElseThrow();
        
        assertThat(deletedDto.getUseYn()).isEqualTo("N");
        log.info("삭제 후 상태값 확인: {}", deletedDto.getUseYn());
	}
	
	@Test
	void testreadDepList() {
		empService.readDeptList()
					.forEach(t -> log.info("부서종류코드 : {}, 부서코드 : {}, 부서명 : {}", t.getDeptTypeCd(), t.getDeptCd(), t.getDeptNm()));
	}

}
