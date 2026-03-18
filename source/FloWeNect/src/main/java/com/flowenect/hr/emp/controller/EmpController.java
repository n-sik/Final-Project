package com.flowenect.hr.emp.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import com.flowenect.hr.commons.exception.PkNotFoundException;
import com.flowenect.hr.commons.file.service.FileService;
import com.flowenect.hr.dto.DeptDTO;
import com.flowenect.hr.dto.EmpDTO;
import com.flowenect.hr.dto.PositionDTO;
import com.flowenect.hr.emp.service.EmpService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequestMapping("/api/emp")
@RequiredArgsConstructor
public class EmpController {
	
	private final FileService fileService;
	private final EmpService empService;
	
	/**
	 * 직위 목록 조회
	 * GET /positions?useYn=Y  (선택박스용)
     * GET /positions          (관리자용 - 전체조회)
	 */
	@GetMapping("/positions")
	public ResponseEntity<List<PositionDTO>> readPositions(
			@RequestParam(value = "useYn", required = false) String useYn
	) {
		log.info("직위 목록 조회 요청 - 조건(useYn): {}", useYn);
		
		List<PositionDTO> positions = empService.readPosList(useYn);
		
		// 로그를 찍어 데이터가 실제로 있는지 확인 (서버 콘솔 확인)
	    log.info("조회된 직위 수: {}", positions.size());
	    
		return ResponseEntity.ok(positions);
	}
	
	// 직위 등록
	@PostMapping("/positions/create")
	public ResponseEntity<String> create(@RequestBody PositionDTO dto) {
		log.info("직위 등록 요청: {}", dto.getPosNm());
        empService.createPos(dto);
        return ResponseEntity.ok("success");
	}

	// 직위 수정
	@PutMapping("/positions/modify")
	public ResponseEntity<String> modify(@RequestBody PositionDTO dto) {
		log.info("직위 수정 요청: {}", dto.getPosCd());
        empService.modifyPos(dto);
        return ResponseEntity.ok("success");
	}
	
	// 직위 삭제
	@DeleteMapping("/positions/remove/{posCd}")
	public ResponseEntity<String> remove(@PathVariable("posCd") String posCd) {
        log.info("직위 삭제 요청: {}", posCd);
        empService.removePos(posCd);
        return ResponseEntity.ok("success");
    }
	
	// 부서 목록 조회
	@GetMapping("/departments")
	@ResponseBody
	public ResponseEntity<List<DeptDTO>> getDepartments() {
		List<DeptDTO> departments = empService.readDeptList();
		
		// 로그를 찍어 데이터가 실제로 있는지 확인 (서버 콘솔 확인)
		log.info("조회된 부서 수: {}", departments.size());
		
		return ResponseEntity.ok(departments);
	}
	
	
	// 사원 목록 조회
	@GetMapping("/list")
	@ResponseBody
	public ResponseEntity<List<EmpDTO>> getList() {
		List<EmpDTO> list = empService.readEmpList();
		
		log.info("조회된 사원 (총 {}명)", list.size());
		
		return ResponseEntity.ok(list);
	}
	
	// 특정 사원 조회
	@GetMapping("/{empNo}")
	public ResponseEntity<?> getEmp( @PathVariable("empNo") String empNo ) {
		try {
			log.info("특정 사원 조회 요청 - 사번: {}", empNo);
			EmpDTO emp = empService.readEmp(empNo);
			return ResponseEntity.ok(emp);
			
		} catch (PkNotFoundException e) {
			log.info("해당 사원을 찾을 수 없음: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
			
		} catch (Exception e) {
			log.info("서버 오류 발생: {}", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
			
		}
	}
	
	// 사원 등록
	@PostMapping("/register")
	public ResponseEntity<?> registerEmp(
	        @RequestPart("emp") EmpDTO emp, 
	        @RequestPart(value = "attachFiles", required = false) MultipartFile[] attachFiles
	) {
	    log.info("사원 등록 요청: {}, 부서: {}", emp.getEmpNm(), emp.getDeptCd());
	    try {
	        int result = empService.createEmp(emp, attachFiles);

	        if (result > 0) {
	            log.info("등록 완료 - 사번: {}, 이름: {}", emp.getEmpNo(), emp.getEmpNm());
	            return ResponseEntity.ok("사원 등록 성공");
	        } else {
	            return ResponseEntity.badRequest().body("사원 등록 실패");
	        }
	        
	    } catch (Exception e) {
	        log.error("등록 중 에러 발생: ", e);
	        // 서비스에서 던진 RuntimeException 메시지가 여기까지 전달됩니다.
	        return ResponseEntity.internalServerError().body("에러 발생: " + e.getMessage());
	    }
	}
	
	// 사원 수정
	@PutMapping("/modify")
	public ResponseEntity<?> modifyEmp(
	    @RequestPart("emp") EmpDTO emp, 
	    @RequestPart(value = "profileImg", required = false) MultipartFile profileImg) {
	    
	    int result = empService.modifyEmp(emp, profileImg);
	    return result > 0 ? ResponseEntity.ok().build() : ResponseEntity.badRequest().build();
	}
	
/*	
	@PostMapping("/register")
	public ResponseEntity<String> registerEmployee(@ModelAttribute EmpDTO empDto,
			@RequestPart(value = "profileImg", required = false) MultipartFile profileImg) {

		empService.createEmp(empDto);
		return ResponseEntity.ok("사원 등록 성공!");
	}
*/	
}