package com.flowenect.hr.emp.mapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.flowenect.hr.dto.EmpDTO;
import com.flowenect.hr.dto.PositionDTO;

import lombok.extern.slf4j.Slf4j;

@SpringBootTest(properties = { "jasypt.encryptor.password=java" })
@Slf4j
@Transactional
class EmpMapperTest {

	@Autowired
	EmpMapper empMapper;
	EmpDTO empDto;

	@Test
	void testSelectEmpForAuth() {

	}

	@Test
	void testSelectEmpRoleCds() {

	}

	// 직위 목록 조회
	@Test
	void testSelectPosList() {
		// [A] 전체 조회 (관리자용)
        log.info("=== 전체 직위 목록 (N 포함) ===");
        List<PositionDTO> allList = empMapper.selectPosList(null);
        allList.forEach(t -> log.info("직위: [{}], 상태: {}", t.getPosNm(), t.getUseYn()));

        // [B] 사용 중인 직위만 조회 (선택박스용)
        log.info("=== 사용 중인 직위 목록 (Y만) ===");
        List<PositionDTO> yList = empMapper.selectPosList("Y");
        yList.forEach(t -> {
            assertThat(t.getUseYn()).isEqualTo("Y");
            log.info("직위명: {}", t.getPosNm());
        });
	}

	@Test
	void testinsertPos() {
		// 새로운 직위 데이터 준비
        PositionDTO pos = new PositionDTO();
        pos.setPosCd("POS_09");
        pos.setPosNm("신규직위");
        pos.setPosLvl(10);
        pos.setUseYn("Y");

        // 등록 메서드
        int result = empMapper.insertPos(pos);

        // 결과 검증
        assertThat(result).isEqualTo(1); // 영향을 받은 행의 수가 1이어야 함
	}
	
	@Test
	void testupdatePos() {
		// DB 에 있는 데이터 중 수정할 것 등록
        PositionDTO pos = new PositionDTO();
        pos.setPosCd("P_TEST_01");
        pos.setPosNm("수정전이름");
        pos.setPosLvl(20);
        pos.setUseYn("Y");
        empMapper.insertPos(pos);

        // 데이터 변경 및 수정 메서드
        pos.setPosNm("수정후이름");
        pos.setPosLvl(21);
        pos.setUseYn("N");
        
        int result = empMapper.updatePos(pos);

        // 결과 검증
        assertThat(result).isEqualTo(1); // 수정된 행의 수가 1이어야 함
	}

	@Test
	void testdeletePos() {
		// Given: 테스트용 직위 하나 등록 (예: P99)
        PositionDTO newPos = PositionDTO.builder()
                .posCd("P99")
                .posNm("테스트직위01")
                .posLvl(99)
                .useYn("Y")
                .build();
        empMapper.insertPos(newPos);

        // When: 삭제(논리 삭제) 수행
        int result = empMapper.deletePos("P99");

        // Then: 리턴값이 1인지 확인하고, 실제 DB에서 N으로 바뀌었는지 재조회
        assertThat(result).isEqualTo(1);
        
        // 다시 조회해서 상태 확인
        List<PositionDTO> list = empMapper.selectPosList(null);
        PositionDTO deletedPos = list.stream()
                .filter(p -> "P99".equals(p.getPosCd()))
                .findFirst()
                .orElse(null);

        assertThat(deletedPos).isNotNull();
        assertThat(deletedPos.getUseYn()).isEqualTo("N");
        log.info("삭제 후 상태 확인: {} -> {}", deletedPos.getPosCd(), deletedPos.getUseYn());
	}
	
	@Test
	void testSelectDeptList() {
		empMapper.selectDeptList().forEach(t -> log.info("부서종류코드 : {}, 부서코드 : {}, 부서명 : {}", t.getDeptTypeCd(), t.getDeptCd(), t.getDeptNm()));
	}

	@Test
	void testSelectEmp() {
		// DB에 존재하는 사번 입력
		String empNo = "2026020206";

		EmpDTO emp = empMapper.selectEmp(empNo);

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
	}

	@Test
	void testSelectEmpList() {
		List<EmpDTO> list = empMapper.selectEmpList();

		assertNotNull(list, "목록 자체가 null이면 안됩니다.");
		assertTrue(list.size() > 0, "조회된 사원 데이터가 최소 1건 이상이어야합니다.");

		list.forEach(emp -> log.info("사원명: {}, 사번: {}, 부서: {}, 직위: {}, 입사일자: {}, 상태: {}",
				emp.getEmpNm(), emp.getEmpNo(), emp.getDeptCd(), emp.getPosCd(), emp.getHireDt(), emp.getEmpStatCd()));
	}

	@Test
	void testInsertEmp() {
		// 테스트 DTO 데이터 준비
		EmpDTO emp = EmpDTO.builder()
							.deptCd("2026HR01")
							.posCd("POS_02")
							.empNm("테스트")
							.pwd("1234")
							.hireDt(LocalDate.now())
							.empEmail("test@test.com")
							.hpNo("010-1111-1111")
							.rrno("260101-1111111")
							.zipCd("12345")
			                .addr1("서울시 강남구")
			                .addr2("테헤란로 123")
			                .empStatCd("WORK")
							.build();

		// 실행
		int result = empMapper.insertEmp(emp);

		// 검증 - insert가 성공했는지
		assertThat(result).isEqualTo(1);

//		// 검증 - selectKey를 통해 사번(empNo)이 DTO에 잘 세팅되었는지
//		assertThat(emp.getEmpNo()).isNotNull();

		// 로그 출력 (콘솔에서 생성된 사번 확인)
		log.info("생성된 사원번호: {}", emp.getEmpNo());
	}

	@Test
	void testUpdateEmp() {

		String empNo = "2026020206";
		EmpDTO emp = empMapper.selectEmp(empNo);
		assertNotNull(emp, "수정할 사원이 존재하지 않습니다.");

		// 테스트 DTO 데이터 준비
		EmpDTO updateData = EmpDTO.builder()
									.empNo(empNo)
									.deptCd("2026PD01")
									.posCd("POS_03")
									.empNm("테스트03")
									.hireDt(emp.getHireDt())
									.empEmail("test@test.com")
									.hpNo("010-1111-1111")
									.rrno("260101-1111111")
									.zipCd("12345")
									.addr1("수정테스트")
									.addr2("01")
									.empStatCd("WORK")
									.acntActYn("Y")
									.build();

		// 실행
		int result = empMapper.updateEmp(updateData);

		// 검증 - update가 성공했는지
		assertThat(result).isEqualTo(1);

		// 확인용 재조회
		EmpDTO updatedEmp = empMapper.selectEmp(empNo);
	    assertThat(updatedEmp.getEmpNm()).isEqualTo("테스트03");

		// 로그 출력 (콘솔에서 수정된 사번 확인)
		log.info("수정 완료 - 사번: {}, 사원명: {}", updatedEmp.getEmpNo(), updatedEmp.getEmpNm());
	}

	@Test
	void testDeleteEmp() {

	}

	@Test
	void testUpdatePassword() {

	}

	@Test
	void testInsertEmpRole() {

	}

	@Test
	void testDeleteEmpRole() {

	}

	@Test
	void testDeleteEmpRoles() {

	}

	@Test
	void testInsertEmpFile() {

	}

	@Test
	void testUpdateProfilePath() {

	}

}
