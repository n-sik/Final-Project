package com.flowenect.hr.aprv.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.flowenect.hr.aprv.service.AprvAssetService;
import com.flowenect.hr.aprv.service.AprvFileService;
import com.flowenect.hr.aprv.service.AprvPdfService;
import com.flowenect.hr.aprv.service.AprvService;
import com.flowenect.hr.aprv.service.AprvSignManageService;
import com.flowenect.hr.dto.aprv.AprvCodeDTO;
import com.flowenect.hr.dto.aprv.AprvCreateDTO;
import com.flowenect.hr.dto.aprv.AprvEmpOptionDTO;
import com.flowenect.hr.dto.aprv.AprvEmpSnapDTO;
import com.flowenect.hr.dto.aprv.AprvFormTypeDTO;
import com.flowenect.hr.dto.aprv.AprvProcessDTO;
import com.flowenect.hr.dto.aprv.AprvReadDTO;
import com.flowenect.hr.dto.aprv.AprvReadListCondDTO;
import com.flowenect.hr.dto.aprv.AprvSignAssetDTO;
import com.flowenect.hr.dto.aprv.AprvAssetHistDTO;
import com.flowenect.hr.security.auth.EmpDTOWrapper;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
@RequestMapping("/aprv")
public class AprvController {

    // HR 부서 코드(더미/운영 코드 기준)
    private static final String HR_DEPT_CD = "2026HR01";

    private final AprvService aprvService;
    private final AprvPdfService aprvPdfService;

    // 자산 이미지 스트리밍용 서비스
    private final AprvAssetService aprvAssetService;

    // 첨부 다운로드/조회
    private final AprvFileService aprvFileService;

    // 결재 서명/직인 관리(목록/미리보기)
    private final AprvSignManageService signManageService;

    private String requireEmpNo(EmpDTOWrapper principal) {
        if (principal == null || principal.getRealUser() == null) {
            throw new IllegalStateException("로그인이 필요합니다.");
        }
        return principal.getRealUser().getEmpNo();
    }

    private String findDeptHeadEmpNo(List<AprvEmpOptionDTO> deptHeads, String deptCd) {
        if (deptHeads == null || deptCd == null) return null;
        for (AprvEmpOptionDTO e : deptHeads) {
            if (deptCd.equals(e.getDeptCd())) return e.getEmpNo();
        }
        return null;
    }

    @GetMapping("/readList")
    public String readList(
            @ModelAttribute AprvReadListCondDTO cond,
            @AuthenticationPrincipal EmpDTOWrapper principal,
            Model model
    ) {
        String empNo = requireEmpNo(principal);

        Map<String, Object> result = aprvService.readList(cond, empNo);

        model.addAttribute("docs", result.get("docs"));
        model.addAttribute("forms", result.get("forms"));
        model.addAttribute("page", result.get("page"));

        model.addAttribute("fromDt", cond.getFromDt());
        model.addAttribute("toDt", cond.getToDt());
        model.addAttribute("docStatCd", cond.getDocStatCd());
        model.addAttribute("formCd", cond.getFormCd());
        model.addAttribute("aprvNo", cond.getAprvNo());
        model.addAttribute("aprvTtlPrefix", cond.getAprvTtlPrefix());

        return "aprv/aprvList";
    }

    @GetMapping("/pendingList")
    public String pendingList(
            @ModelAttribute AprvReadListCondDTO cond,
            @AuthenticationPrincipal EmpDTOWrapper principal,
            Model model
    ) {
        String empNo = requireEmpNo(principal);
        cond.setBox("pending");

        Map<String, Object> result = aprvService.readList(cond, empNo);

        model.addAttribute("docs", result.get("docs"));
        model.addAttribute("forms", result.get("forms"));
        model.addAttribute("page", result.get("page"));

        model.addAttribute("fromDt", cond.getFromDt());
        model.addAttribute("toDt", cond.getToDt());
        model.addAttribute("docStatCd", cond.getDocStatCd());
        model.addAttribute("formCd", cond.getFormCd());
        model.addAttribute("aprvNo", cond.getAprvNo());
        model.addAttribute("aprvTtlPrefix", cond.getAprvTtlPrefix());

        return "aprv/aprvPendingList";
    }

    @GetMapping("/processedList")
    public String processedList(
            @ModelAttribute AprvReadListCondDTO cond,
            @AuthenticationPrincipal EmpDTOWrapper principal,
            Model model
    ) {
        String empNo = requireEmpNo(principal);
        cond.setBox("processed");

        Map<String, Object> result = aprvService.readList(cond, empNo);

        model.addAttribute("docs", result.get("docs"));
        model.addAttribute("forms", result.get("forms"));
        model.addAttribute("page", result.get("page"));

        model.addAttribute("fromDt", cond.getFromDt());
        model.addAttribute("toDt", cond.getToDt());
        model.addAttribute("docStatCd", cond.getDocStatCd());
        model.addAttribute("formCd", cond.getFormCd());
        model.addAttribute("aprvNo", cond.getAprvNo());
        model.addAttribute("aprvTtlPrefix", cond.getAprvTtlPrefix());

        return "aprv/aprvProcessedList";
    }

    /**
     * 기안 작성 화면
     */
    @GetMapping("/create")
    public String createForm(
            @AuthenticationPrincipal EmpDTOWrapper principal,
            Model model
    ) {
        String empNo = requireEmpNo(principal);

        model.addAttribute("forms", aprvService.readFormTypes());

        // 결재자/참조자 후보
        List<AprvEmpOptionDTO> deptHeadOptions = aprvService.readDeptHeadOptions();
        model.addAttribute("approverCandidates", deptHeadOptions);
        model.addAttribute("refCandidates", aprvService.readEmpOptions());

        // 작성자 스냅샷(부서/직위명 포함)
        AprvEmpSnapDTO loginEmp = aprvService.readEmpSnap(empNo);

        // ✅ [추가-1] NPE 방지: 작성자 스냅샷이 없으면 명시적으로 실패(500 NPE 대신)
        if (loginEmp == null) {
            throw new IllegalStateException("작성자 정보를 찾을 수 없습니다.");
        }

        model.addAttribute("loginEmp", loginEmp);

        // 휴가/휴직 종류(코드테이블)
        model.addAttribute("leaveTypes", aprvService.readStatCodes("LEAVE_TP"));
        model.addAttribute("loaTypes", aprvService.readStatCodes("LOA_TP"));
        model.addAttribute("apptTypes", aprvService.readStatCodes("APPT_TP"));

        // 부서/직위 옵션
        model.addAttribute("deptCodes", aprvService.readDeptCodes());
        model.addAttribute("posCodes", aprvService.readPosCodes());

        // ===== 기본 결재라인 정책 =====
        // (일반) 1차=내 부서장(부서장이면 본인), 2차=인사부서장
        // (인사부서장 본인 기안) 1차=본인만, 2차 없음
        String myDeptHeadEmpNo = findDeptHeadEmpNo(deptHeadOptions, loginEmp.getDeptCd());
        String hrDeptHeadEmpNo = findDeptHeadEmpNo(deptHeadOptions, HR_DEPT_CD);

        boolean isHrHead = hrDeptHeadEmpNo != null && hrDeptHeadEmpNo.equals(empNo);

        String defaultApprover1 = isHrHead ? empNo : myDeptHeadEmpNo;
        String defaultApprover2 = isHrHead ? "" : (hrDeptHeadEmpNo == null ? "" : hrDeptHeadEmpNo);

        model.addAttribute("defaultApprover1", defaultApprover1 == null ? "" : defaultApprover1);
        model.addAttribute("defaultApprover2", defaultApprover2);

        model.addAttribute("dto", AprvCreateDTO.builder()
                .actionType("TEMP_SAVE")
                .build());

        return "aprv/aprvForm";
    }

    @PostMapping("/modify")
    public String modify(
            @ModelAttribute AprvProcessDTO dto,
            @AuthenticationPrincipal EmpDTOWrapper principal
    ) {
        String empNo = requireEmpNo(principal);
        aprvService.modify(dto, empNo);
        return "redirect:/aprv/readList";
    }

    @PostMapping("/remove")
    public String remove(
            @RequestParam("aprvNo") long aprvNo,
            @AuthenticationPrincipal EmpDTOWrapper principal
    ) {
        String empNo = requireEmpNo(principal);
        aprvService.remove(aprvNo, empNo);
        return "redirect:/aprv/readList";
    }

    @PostMapping("/create")
    public String create(
            @ModelAttribute AprvCreateDTO dto,
            @AuthenticationPrincipal EmpDTOWrapper principal,
            RedirectAttributes ra
    ) {
        String empNo = requireEmpNo(principal);

        long aprvNo = aprvService.create(dto, empNo);

        if ("SUBMIT".equals(dto.getActionType())) {
            ra.addFlashAttribute("msg", "상신 완료");
        } else {
            ra.addFlashAttribute("msg", "임시저장 완료");
        }

        return "redirect:/aprv/readList?box=mine";
    }

    @GetMapping("/read")
    public String read(
            @RequestParam("aprvNo") long aprvNo,
            @AuthenticationPrincipal EmpDTOWrapper principal,
            Model model
    ) {
        String empNo = requireEmpNo(principal);

        AprvReadDTO data = aprvService.read(aprvNo, empNo);

        model.addAttribute("doc", data.getDoc());
        model.addAttribute("lines", data.getLineList());

        model.addAttribute("isMyTurn", data.isCanApprove());
        model.addAttribute("canCancel", data.isCanCancel());
        model.addAttribute("isWriter", empNo.equals(data.getDoc().getEmpNo()));

        model.addAttribute("refs", data.getRefs());
        model.addAttribute("files", data.getFiles());

        model.addAttribute("leave", data.getLeave());
        model.addAttribute("loa", data.getLoa());
        model.addAttribute("promotion", data.getPromotion());
        model.addAttribute("appointment", data.getAppointment());
        model.addAttribute("headcount", data.getHeadcount());
        model.addAttribute("retire", data.getRetire());

        // =========================================
        // 상세 화면 표시용 코드/명 매핑
        // =========================================
        List<AprvCodeDTO> deptCodes = aprvService.readDeptCodes();
        List<AprvCodeDTO> posCodes = aprvService.readPosCodes();
        List<AprvCodeDTO> leaveTypes = aprvService.readStatCodes("LEAVE_TP");
        List<AprvCodeDTO> loaTypes = aprvService.readStatCodes("LOA_TP");

        Map<String, String> deptMap = new HashMap<>();
        for (AprvCodeDTO c : deptCodes) {
            deptMap.put(c.getCode(), c.getName());
        }
        Map<String, String> posMap = new HashMap<>();
        for (AprvCodeDTO c : posCodes) {
            posMap.put(c.getCode(), c.getName());
        }
        Map<String, String> leaveTypeMap = new HashMap<>();
        for (AprvCodeDTO c : leaveTypes) {
            leaveTypeMap.put(c.getCode(), c.getName());
        }
        Map<String, String> loaTypeMap = new HashMap<>();
        for (AprvCodeDTO c : loaTypes) {
            loaTypeMap.put(c.getCode(), c.getName());
        }

        model.addAttribute("deptMap", deptMap);
        model.addAttribute("posMap", posMap);
        model.addAttribute("leaveTypeMap", leaveTypeMap);
        model.addAttribute("loaTypeMap", loaTypeMap);

        // =========================================
        // 타겟 사원 스냅샷(승진/발령/퇴직 등)
        // =========================================
        if (data.getPromotion() != null && data.getPromotion().getTargetEmpNo() != null && !data.getPromotion().getTargetEmpNo().isBlank()) {
            model.addAttribute("promotionTargetEmp", aprvService.readEmpSnap(data.getPromotion().getTargetEmpNo()));
        }
        if (data.getAppointment() != null && data.getAppointment().getTargetEmpNo() != null && !data.getAppointment().getTargetEmpNo().isBlank()) {
            model.addAttribute("appointmentTargetEmp", aprvService.readEmpSnap(data.getAppointment().getTargetEmpNo()));
        }
        if (data.getRetire() != null && data.getRetire().getEmpNo() != null && !data.getRetire().getEmpNo().isBlank()) {
            model.addAttribute("retireTargetEmp", aprvService.readEmpSnap(data.getRetire().getEmpNo()));
        }

        // =========================================
        // 결재라인 서명/직인 스냅샷(표시용)
        // =========================================
        Map<Long, AprvAssetHistDTO> assetHistMap = new HashMap<>();
        if (data.getAssetHists() != null) {
            for (AprvAssetHistDTO h : data.getAssetHists()) {
                if (h != null && h.getLineNo() != null) {
                    assetHistMap.put(h.getLineNo(), h);
                }
            }
        }
        model.addAttribute("assetHistMap", assetHistMap);

        // =========================================
        // 승인(내 차례)인 경우: 서명/직인 보유 여부 + 최신 이미지(미리보기)
        // =========================================
        if (data.isCanApprove()) {
            List<AprvSignAssetDTO> signList = signManageService.getAssetList(empNo, "SIGN");
            List<AprvSignAssetDTO> sealList = signManageService.getAssetList(empNo, "SEAL");

            boolean hasSignAsset = (signList != null && !signList.isEmpty());
            boolean hasSealAsset = (sealList != null && !sealList.isEmpty());

            model.addAttribute("hasSignAsset", hasSignAsset);
            model.addAttribute("hasSealAsset", hasSealAsset);

            if (hasSignAsset) {
                model.addAttribute("signLatest", signList.get(0));
            }
            if (hasSealAsset) {
                model.addAttribute("sealLatest", sealList.get(0));
            }
        }

        if (data.getLineList() != null && data.getLineList().size() >= 1) {
            model.addAttribute("line1", data.getLineList().get(0));
        }
        if (data.getLineList() != null && data.getLineList().size() >= 2) {
            model.addAttribute("line2", data.getLineList().get(1));
        }

        return "aprv/aprvDetail";
    }

    @GetMapping("/pdf")
    public ResponseEntity<byte[]> pdf(
            @RequestParam("aprvNo") long aprvNo,
            @AuthenticationPrincipal EmpDTOWrapper principal
    ) {
        String empNo = requireEmpNo(principal);

        // ✅ [추가-2] 바이너리 응답(PDF)에서 예외가 ControllerAdvice redirect(302)로 바뀌면 뷰어가 깨짐
        // 여기서 HTTP status로 종료
        try {
            byte[] pdf = aprvPdfService.loadLatestPdfBytes(aprvNo, empNo);
            if (pdf == null || pdf.length == 0) {
                pdf = aprvPdfService.generatePdfBytes(aprvNo, empNo);
            }

            if (pdf == null || pdf.length == 0) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .header("Content-Type", "application/pdf")
                    .header("Content-Disposition", "inline; filename=\"aprv_" + aprvNo + ".pdf\"")
                    .body(pdf);

        } catch (RuntimeException e) {
            String msg = e.getMessage();
            if (msg != null && msg.contains("권한")) {
                return ResponseEntity.status(403).build();
            }

            try {
                byte[] pdf = aprvPdfService.generatePdfBytes(aprvNo, empNo);
                if (pdf == null || pdf.length == 0) {
                    return ResponseEntity.notFound().build();
                }

                return ResponseEntity.ok()
                        .header("Content-Type", "application/pdf")
                        .header("Content-Disposition", "inline; filename=\"aprv_" + aprvNo + ".pdf\"")
                        .body(pdf);
            } catch (RuntimeException fallbackEx) {
                String fallbackMsg = fallbackEx.getMessage();
                if (fallbackMsg != null && fallbackMsg.contains("권한")) {
                    return ResponseEntity.status(403).build();
                }
                return ResponseEntity.status(404).build();
            }
        }
    }

    // 파일 다운로드(기존 문서에 첨부가 있을 수 있어 유지)
    @GetMapping("/file/download")
    public ResponseEntity<Resource> download(
            @RequestParam("apprFileNo") long apprFileNo,
            @AuthenticationPrincipal EmpDTOWrapper principal
    ) {
        String empNo = requireEmpNo(principal);
        return aprvFileService.download(apprFileNo, empNo);
    }

    // =========================================================
    // docView + 자산 이미지 스트리밍
    // =========================================================

    @GetMapping("/docView")
    public String docView(
            @RequestParam("aprvNo") long aprvNo,
            @RequestParam(value = "mode", required = false) String mode,
            @AuthenticationPrincipal EmpDTOWrapper principal,
            Model model
    ) {
        String empNo = requireEmpNo(principal);

        AprvReadDTO data = aprvService.read(aprvNo, empNo);

        model.addAttribute("doc", data.getDoc());
        model.addAttribute("lines", data.getLineList());
        model.addAttribute("refs", data.getRefs());
        model.addAttribute("files", data.getFiles());

        model.addAttribute("leave", data.getLeave());
        model.addAttribute("loa", data.getLoa());
        model.addAttribute("promotion", data.getPromotion());
        model.addAttribute("appointment", data.getAppointment());
        model.addAttribute("headcount", data.getHeadcount());
        model.addAttribute("retire", data.getRetire());

        // 결재라인별 서명/직인 히스토리 리스트
        model.addAttribute("assetHist", aprvService.readAssetHistList(aprvNo, empNo));

        // ===== (추가) mode 정규화 =====
        String m = (mode == null || mode.isBlank()) ? "VIEW" : mode.trim().toUpperCase();
        if (!("VIEW".equals(m) || "SYSTEM".equals(m) || "FINAL".equals(m))) m = "VIEW";
        model.addAttribute("mode", m);

        // ===== (추가) formCd -> formNm =====
        model.addAttribute("formTypeMap", aprvService.readFormTypes()
                .stream().collect(java.util.stream.Collectors.toMap(
                        AprvFormTypeDTO::getFormCd,
                        AprvFormTypeDTO::getFormNm,
                        (a,b) -> a
                )));

        // ===== (추가) 코드 -> 코드명 (양식별 사용) =====
        model.addAttribute("leaveTypeMap", aprvService.readStatCodes("LEAVE_TP")
                .stream().collect(java.util.stream.Collectors.toMap(AprvCodeDTO::getCode, AprvCodeDTO::getName, (a,b)->a)));
        model.addAttribute("loaTypeMap", aprvService.readStatCodes("LOA_TP")
                .stream().collect(java.util.stream.Collectors.toMap(AprvCodeDTO::getCode, AprvCodeDTO::getName, (a,b)->a)));
        model.addAttribute("apptTypeMap", aprvService.readStatCodes("APPT_TP")
                .stream().collect(java.util.stream.Collectors.toMap(AprvCodeDTO::getCode, AprvCodeDTO::getName, (a,b)->a)));

        model.addAttribute("deptMap", aprvService.readDeptCodes()
                .stream().collect(java.util.stream.Collectors.toMap(AprvCodeDTO::getCode, AprvCodeDTO::getName, (a,b)->a)));
        model.addAttribute("posMap", aprvService.readPosCodes()
                .stream().collect(java.util.stream.Collectors.toMap(AprvCodeDTO::getCode, AprvCodeDTO::getName, (a,b)->a)));

        return "aprv/aprvDocView";
    }
    
    
    

    @GetMapping("/asset/hist/image")
    public ResponseEntity<byte[]> assetHistImage(
            @RequestParam("lineNo") long lineNo,
            @RequestParam("assetType") String assetType,
            @AuthenticationPrincipal EmpDTOWrapper principal
    ) {
        String empNo = requireEmpNo(principal);
        return aprvAssetService.loadAssetHistImage(lineNo, assetType, empNo);
    }
}