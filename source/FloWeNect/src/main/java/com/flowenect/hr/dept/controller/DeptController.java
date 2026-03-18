package com.flowenect.hr.dept.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flowenect.hr.dept.service.DeptService;
import com.flowenect.hr.dto.dept.DeptCreateReqDTO;
import com.flowenect.hr.dto.dept.DeptManageDTO;
import com.flowenect.hr.dto.dept.DeptModifyReqDTO;
import com.flowenect.hr.dto.dept.DeptSearchReqDTO;
import com.flowenect.hr.dto.dept.DeptTypeDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/dept")
@RequiredArgsConstructor
public class DeptController {

    private final DeptService deptService;

    /**
     * 부서 목록 조회 (부서관리용)
     * - delYn: N / Y / ALL
     * - keyword: deptCd 또는 deptNm LIKE 검색
     */
    @GetMapping
    public ResponseEntity<List<DeptManageDTO>> readList(DeptSearchReqDTO cond) {
        List<DeptManageDTO> list = deptService.readList(cond);
        return ResponseEntity.ok(list);
    }

    /**
     * 부서 상세 조회
     */
    @GetMapping("/{deptCd}")
    public ResponseEntity<DeptManageDTO> read(@PathVariable("deptCd") String deptCd) {
        DeptManageDTO dto = deptService.read(deptCd);
        return ResponseEntity.ok(dto);
    }

    /**
     * 부서 등록
     */
    @PostMapping
    public ResponseEntity<String> create(@RequestBody DeptCreateReqDTO req) {
        log.info("[부서 등록] req={}", req);
        deptService.create(req);
        return ResponseEntity.ok("success");
    }

    /**
     * 부서 수정/복구
     * - delYn='N'이면 복구도 가능
     */
    @PutMapping
    public ResponseEntity<String> modify(@RequestBody DeptModifyReqDTO req) {
        log.info("[부서 수정/복구] req={}", req);
        deptService.modify(req);
        return ResponseEntity.ok("success");
    }

    /**
     * 부서 사용중지(소프트 삭제)
     * - DEL_YN='Y'
     * - 조건: 해당 부서 소속 사원 0명
     */
    @DeleteMapping("/{deptCd}")
    public ResponseEntity<String> remove(@PathVariable("deptCd") String deptCd) {
        log.info("[부서 사용중지(소프트)] deptCd={}", deptCd);
        deptService.softDelete(deptCd);
        return ResponseEntity.ok("success");
    }

    /**
     * 부서 복구
     * - DEL_YN='N'
     */
    @PutMapping("/{deptCd}/restore")
    public ResponseEntity<String> restore(@PathVariable("deptCd") String deptCd) {
        log.info("[부서 복구] deptCd={}", deptCd);
        deptService.restore(deptCd);
        return ResponseEntity.ok("success");
    }

    /**
     * 부서종류 코드 조회 (드롭다운용)
     */
    @GetMapping("/types")
    public ResponseEntity<List<DeptTypeDTO>> readDeptTypes() {
        return ResponseEntity.ok(deptService.readDeptTypeList());
    }
}