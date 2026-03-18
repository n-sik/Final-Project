package com.flowenect.hr.mypage.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flowenect.hr.dto.EmpDTO;
import com.flowenect.hr.dto.mypage.MyPageProfileDTO;
import com.flowenect.hr.dto.mypage.MyPageUpdateRequestDTO;
import com.flowenect.hr.dto.mypage.MyPageVerifyRequestDTO;
import com.flowenect.hr.mypage.service.MyPageService;
import com.flowenect.hr.security.AuthenticationUtils;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/rest/mypage")
@RequiredArgsConstructor
public class MyPageController {

    private final MyPageService myPageService;

    private static final String SESSION_KEY = "MYPAGE_VERIFIED_AT";
    // 보안 확인 유효시간(분) - 필요시 조정
    private static final long VERIFIED_TTL_MS = 10L * 60L * 1000L;
    
    /**
     * 내 정보 조회
     */
    @GetMapping("/me")
    public ResponseEntity<MyPageProfileDTO> getMyProfile(Authentication authentication) {
        EmpDTO user = AuthenticationUtils.getRealUser(authentication);
        
        MyPageProfileDTO profile = myPageService.readMyProfile(user.getEmpNo());
        
        log.info(">>>> [REST] 프로필 조회 완료: {}", user.getEmpNo());
        return ResponseEntity.ok(profile);
    }

    /**
     * 마이페이지 진입 보안 확인(현재 비밀번호)
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verify(Authentication authentication,
                                    @Valid @RequestBody MyPageVerifyRequestDTO req,
                                    BindingResult bindingResult,
                                    HttpSession session) {

        if (bindingResult.hasErrors()) {
            String msg = bindingResult.getAllErrors().get(0).getDefaultMessage();
            return ResponseEntity.badRequest().body(Map.of("message", msg));
        }
        
        String currentPwd = Optional.ofNullable(req.getCurrentPwd())
                .map(String::trim)
                .orElse("");

        EmpDTO user = AuthenticationUtils.getRealUser(authentication);
        boolean ok = myPageService.verifyCurrentPassword(user.getEmpNo(), currentPwd);
        if (!ok) {
            return ResponseEntity.status(401).body(Map.of("message", "현재 비밀번호가 올바르지 않습니다."));
        }

        session.setAttribute(SESSION_KEY, System.currentTimeMillis());
        return ResponseEntity.ok("success");
    }

    private boolean isVerified(HttpSession session) {
        Object v = session.getAttribute(SESSION_KEY);
        if (!(v instanceof Long)) return false;
        long at = (Long) v;
        return (System.currentTimeMillis() - at) <= VERIFIED_TTL_MS;
    }

    /**
     * 내 정보 수정
     * - 사원명/직위/부서는 변경 불가
     * - 비밀번호/이메일/휴대폰/주소만 변경
     */
    @PutMapping(value = "/me", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateMyProfile(Authentication authentication,
                                             @Valid MyPageUpdateRequestDTO req, 
                                             BindingResult bindingResult,
                                             HttpSession session) {

        if (!isVerified(session)) {
            return ResponseEntity.status(401).body(Map.of("message", "현재 비밀번호 확인이 필요합니다."));
        }

        // 검증 오류 체크
        if (bindingResult.hasErrors()) {
            String msg = bindingResult.getAllErrors().get(0).getDefaultMessage();
            return ResponseEntity.badRequest().body(Map.of("message", msg));
        }

        // 비밀번호 변경 시 확인 값 일치 체크
        String newPwd = Optional.ofNullable(req.getNewPwd())
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .orElse(null);

        String newPwd2 = Optional.ofNullable(req.getNewPwdConfirm())
                 .map(String::trim)
                 .filter(s -> !s.isEmpty())
                 .orElse(null);
        
        if ((newPwd != null || newPwd2 != null) && (newPwd == null || !newPwd.equals(newPwd2))) {
            return ResponseEntity.badRequest().body(Map.of("message", "비밀번호 확인 값이 일치하지 않습니다."));
        }

        EmpDTO user = AuthenticationUtils.getRealUser(authentication);
        
        // 🚩 서비스 호출 시 profileImg도 함께 넘겨줍니다.
        // MyPageService의 updateMyProfile 메서드 시그니처 수정이 필요할 수 있습니다.
        boolean ok = myPageService.updateMyProfile(user.getEmpNo(), req);
        
        return ResponseEntity.ok(ok ? "success" : "fail");
    }
    
    /**
     * 프로필 이미지 삭제 (S3 파일은 유지)
     */
    @DeleteMapping("/profile-img")
    public ResponseEntity<String> deleteProfileImg(Authentication authentication) {
        try {
            EmpDTO user = AuthenticationUtils.getRealUser(authentication);
            String empNo = user.getEmpNo();

            boolean isDeleted = myPageService.deleteProfileImg(empNo);

            if (isDeleted) {
                return ResponseEntity.ok("success");
            } else {
                return ResponseEntity.ok("no_data");
            }
            
        } catch (Exception e) {
            log.error(">>>> [오류] 프로필 이미지 삭제 중 에러 발생: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("fail");
        }
    }
}
