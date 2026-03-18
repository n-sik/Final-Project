package com.flowenect.hr.aprv.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.flowenect.hr.aprv.service.AprvSignManageService;
import com.flowenect.hr.dto.aprv.AprvSignAssetDTO;
import com.flowenect.hr.security.auth.EmpDTOWrapper;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
@RequestMapping("/aprv/asset")
public class AprvSignManageController {

    private final AprvSignManageService signManageService;

    private String requireEmpNo(EmpDTOWrapper principal) {
        if (principal == null || principal.getRealUser() == null) {
            throw new IllegalStateException("로그인이 필요합니다.");
        }
        return principal.getRealUser().getEmpNo();
    }

    @GetMapping("/manage")
    public String manage(
            @AuthenticationPrincipal EmpDTOWrapper principal,
            Model model
    ) {
        String empNo = requireEmpNo(principal);

        List<AprvSignAssetDTO> signList = signManageService.getAssetList(empNo, "SIGN");
        List<AprvSignAssetDTO> sealList = signManageService.getAssetList(empNo, "SEAL");

        model.addAttribute("signList", signList);
        model.addAttribute("sealList", sealList);

        return "aprv/aprvAssetManage";
    }

    @PostMapping("/upload")
    public String upload(
            @AuthenticationPrincipal EmpDTOWrapper principal,
            @RequestParam("assetTypeCd") String assetTypeCd,
            @RequestParam(value = "assetNm", required = false) String assetNm,
            @RequestParam("file") MultipartFile file,
            RedirectAttributes ra
    ) {
        String empNo = requireEmpNo(principal);

        try {
            signManageService.uploadAsset(empNo, assetTypeCd, assetNm, file);
            ra.addFlashAttribute("msg", "업로드가 완료되었습니다.");
        } catch (Exception e) {
            ra.addFlashAttribute("msg", e.getMessage());
        }

        return "redirect:/aprv/asset/manage";
    }

    @GetMapping("/image")
    @ResponseBody
    public org.springframework.http.ResponseEntity<byte[]> image(
            @AuthenticationPrincipal EmpDTOWrapper principal,
            @RequestParam("assetNo") long assetNo
    ) {
        String empNo = requireEmpNo(principal);
        return signManageService.loadAssetImage(assetNo, empNo);
    }
}
