package com.flowenect.hr.dept.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flowenect.hr.commons.exception.PkNotFoundException;
import com.flowenect.hr.dept.mapper.DeptMapper;
import com.flowenect.hr.dto.DeptDTO;
import com.flowenect.hr.dto.dept.DeptCreateReqDTO;
import com.flowenect.hr.dto.dept.DeptManageDTO;
import com.flowenect.hr.dto.dept.DeptModifyReqDTO;
import com.flowenect.hr.dto.dept.DeptSearchReqDTO;
import com.flowenect.hr.dto.dept.DeptTypeDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeptServiceImpl implements DeptService {

    private final DeptMapper deptMapper;

    @Override
    public List<DeptManageDTO> readList(DeptSearchReqDTO cond) {

        // 기본값: delYn 미지정(null/"")이면 'N'
        if (cond == null) {
            cond = new DeptSearchReqDTO();
        }
        if (cond.getDelYn() == null || cond.getDelYn().isBlank()) {
            cond.setDelYn("N");
        }
        if (cond.getSearchField() == null || cond.getSearchField().isBlank()) {
            cond.setSearchField("ALL");
        }
        if (cond.getKeyword() != null) {
            cond.setKeyword(cond.getKeyword().trim());
            if (cond.getKeyword().isBlank()) {
                cond.setKeyword(null);
            }
        }

        return deptMapper.selectDeptManageList(cond);
    }

    @Override
    public DeptManageDTO read(String deptCd) {
        DeptManageDTO dto = deptMapper.selectDeptManage(deptCd);
        if (dto == null) {
            throw new PkNotFoundException("부서가 존재하지 않습니다. deptCd=" + deptCd);
        }
        return dto;
    }

    @Transactional
    @Override
    public void create(DeptCreateReqDTO req) {
        validateCreate(req);

        // 상위부서 존재 확인(선택)
        if (req.getUpDeptCd() != null && !req.getUpDeptCd().isBlank()) {
            DeptDTO up = deptMapper.selectDeptBasic(req.getUpDeptCd());
            if (up == null) {
                throw new IllegalArgumentException("상위부서가 존재하지 않습니다. upDeptCd=" + req.getUpDeptCd());
            }
            if ("Y".equals(up.getDelYn())) {
                throw new IllegalArgumentException("삭제된 부서는 상위부서로 지정할 수 없습니다. upDeptCd=" + req.getUpDeptCd());
            }
            // 등록 시에는 deptCd가 아직 DB에 없지만, self-check 정도는 가능
            if (req.getUpDeptCd().equals(req.getDeptCd())) {
                throw new IllegalArgumentException("상위부서는 자기 자신을 선택할 수 없습니다.");
            }
        }

        // 중복 PK 방지
        DeptDTO exist = deptMapper.selectDeptBasic(req.getDeptCd());
        if (exist != null) {
            throw new IllegalArgumentException("이미 존재하는 부서코드입니다. deptCd=" + req.getDeptCd());
        }

        int updated = deptMapper.insertDept(req);
        if (updated != 1) {
            throw new IllegalStateException("부서 등록에 실패했습니다.");
        }
    }

    @Transactional
    @Override
    public void modify(DeptModifyReqDTO req) {
        validateModify(req);

        // 존재 확인
        read(req.getDeptCd());

        // 상위부서 존재 확인 + 순환 방지
        validateUpDeptCycle(req.getDeptCd(), req.getUpDeptCd());

        int updated = deptMapper.updateDept(req);
        if (updated != 1) {
            throw new IllegalStateException("부서 수정에 실패했습니다.");
        }
    }

    @Transactional
    @Override
    public void softDelete(String deptCd) {
        // 존재 확인
        read(deptCd);

        int childCnt = deptMapper.countChildDeptByDeptCd(deptCd);
        int empCnt = deptMapper.countEmpByDeptCd(deptCd);

        if (childCnt > 0 || empCnt > 0) {
            StringBuilder sb = new StringBuilder("부서를 삭제할 수 없습니다. ");

            if (childCnt > 0) {
                sb.append("하위 부서 ").append(childCnt).append("개");
            }
            if (childCnt > 0 && empCnt > 0) {
                sb.append(", ");
            }
            if (empCnt > 0) {
                sb.append("소속 사원 ").append(empCnt).append("명");
            }
            sb.append("이(가) 존재합니다.");

            throw new IllegalStateException(sb.toString());
        }

        int updated = deptMapper.updateDeptDelYn(deptCd, "Y");
        if (updated != 1) {
            throw new IllegalStateException("부서 삭제(DEL_YN='Y') 처리에 실패했습니다.");
        }
    }

    @Transactional
    @Override
    public void restore(String deptCd) {
        // 존재 확인
        read(deptCd);

        DeptDTO current = deptMapper.selectDeptBasic(deptCd);
        if (current != null && current.getUpDeptCd() != null && !current.getUpDeptCd().isBlank()) {
            DeptDTO up = deptMapper.selectDeptBasic(current.getUpDeptCd());
            if (up == null) {
                throw new IllegalStateException("상위부서가 존재하지 않아 복구할 수 없습니다. upDeptCd=" + current.getUpDeptCd());
            }
            if ("Y".equals(up.getDelYn())) {
                throw new IllegalStateException("상위 부서가 삭제 상태이므로 복구할 수 없습니다. 먼저 상위 부서를 복구해 주세요.");
            }
        }

        int updated = deptMapper.updateDeptDelYn(deptCd, "N");
        if (updated != 1) {
            throw new IllegalStateException("부서 복구(DEL_YN='N') 처리에 실패했습니다.");
        }
    }

    @Override
    public List<DeptTypeDTO> readDeptTypeList() {
        return deptMapper.selectDeptTypeList();
    }

    private static void validateCreate(DeptCreateReqDTO req) {
        if (req == null) {
            throw new IllegalArgumentException("요청값이 없습니다.");
        }
        if (req.getDeptCd() == null || req.getDeptCd().isBlank()) {
            throw new IllegalArgumentException("부서코드(deptCd)는 필수입니다.");
        }
        if (req.getDeptTypeCd() == null || req.getDeptTypeCd().isBlank()) {
            throw new IllegalArgumentException("부서종류코드(deptTypeCd)는 필수입니다.");
        }
        if (req.getDeptNm() == null || req.getDeptNm().isBlank()) {
            throw new IllegalArgumentException("부서명(deptNm)은 필수입니다.");
        }
        // 정책: 등록 시 부서장 필수
        if (req.getDeptHeadEmpNo() == null || req.getDeptHeadEmpNo().isBlank()) {
            throw new IllegalArgumentException("부서장(deptHeadEmpNo)은 등록 시 필수입니다.");
        }
    }

    private static void validateModify(DeptModifyReqDTO req) {
        if (req == null) {
            throw new IllegalArgumentException("요청값이 없습니다.");
        }
        if (req.getDeptCd() == null || req.getDeptCd().isBlank()) {
            throw new IllegalArgumentException("부서코드(deptCd)는 필수입니다.");
        }
        if (req.getDeptTypeCd() == null || req.getDeptTypeCd().isBlank()) {
            throw new IllegalArgumentException("부서종류코드(deptTypeCd)는 필수입니다.");
        }
        if (req.getDeptNm() == null || req.getDeptNm().isBlank()) {
            throw new IllegalArgumentException("부서명(deptNm)은 필수입니다.");
        }
        if (req.getDelYn() == null || req.getDelYn().isBlank()) {
            // 복구/중지 상태도 수정 화면에서 같이 관리 가능하게
            throw new IllegalArgumentException("삭제여부(delYn)는 필수입니다.");
        }
        if (!("Y".equals(req.getDelYn()) || "N".equals(req.getDelYn()))) {
            throw new IllegalArgumentException("삭제여부(delYn)는 Y 또는 N만 가능합니다.");
        }
        // 정책: 수정 시 deptHeadEmpNo는 NULL 허용(공석)
    }

    /**
     * 순환 방지:
     * - upDeptCd가 null이면 OK
     * - upDeptCd == deptCd 금지
     * - upDeptCd의 조상 체인을 타고 올라가며 deptCd가 나오면 금지
     */
    private void validateUpDeptCycle(String deptCd, String upDeptCd) {

        if (upDeptCd == null || upDeptCd.isBlank()) {
            return;
        }
        if (upDeptCd.equals(deptCd)) {
            throw new IllegalArgumentException("상위부서는 자기 자신을 선택할 수 없습니다.");
        }

        DeptDTO up = deptMapper.selectDeptBasic(upDeptCd);
        if (up == null) {
            throw new IllegalArgumentException("상위부서가 존재하지 않습니다. upDeptCd=" + upDeptCd);
        }
        if ("Y".equals(up.getDelYn())) {
            throw new IllegalArgumentException("삭제된 부서는 상위부서로 지정할 수 없습니다. upDeptCd=" + upDeptCd);
        }

        // upDeptCd의 조상들을 따라가며 deptCd가 나오면 cycle
        String cursor = upDeptCd;
        int guard = 0;

        while (cursor != null && !cursor.isBlank()) {
            if (cursor.equals(deptCd)) {
                throw new IllegalArgumentException("상위부서 설정으로 조직도 순환이 발생합니다. (cycle)");
            }
            cursor = deptMapper.selectUpDeptCd(cursor);
            guard++;

            // 안전장치(비정상 데이터로 무한 루프 방지)
            if (guard > 200) {
                throw new IllegalStateException("상위부서 체인 검증 중 비정상 데이터가 감지되었습니다.");
            }
        }
    }
}