package com.flowenect.hr.mypage.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.flowenect.hr.commons.file.mapper.FileMapper;
import com.flowenect.hr.commons.file.service.FileService;
import com.flowenect.hr.department.board.service.WorkDriveService;
import com.flowenect.hr.dto.FileDTO;
import com.flowenect.hr.dto.mypage.MyPageProfileDTO;
import com.flowenect.hr.dto.mypage.MyPageUpdateRequestDTO;
import com.flowenect.hr.emp.mapper.EmpMapper;
import com.flowenect.hr.mypage.mapper.MyPageMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class MyPageServiceImpl implements MyPageService {

	private final MyPageMapper myPageMapper;
    private final EmpMapper empMapper;         
    private final FileMapper fileMapper;       
    private final FileService fileService;     
    private final WorkDriveService workDriveService; 
    private final PasswordEncoder passwordEncoder;

    @Override
    public MyPageProfileDTO getMyProfile(String empNo) {
        return myPageMapper.selectMyProfile(empNo);
    }

    @Override
    public boolean verifyCurrentPassword(String empNo, String rawPassword) {
        String hash = myPageMapper.selectMyPasswordHash(empNo);
        if (hash == null || rawPassword == null) return false;
        return passwordEncoder.matches(rawPassword, hash);
    }

    @Override
    @Transactional
    public boolean updateMyProfile(String empNo, MyPageUpdateRequestDTO req) {
        // 🚩 1) 비밀번호 필수 검증 (입력 안 하면 저장 불가)
        String newPwd = emptyToNull(req.getNewPwd());
        if (newPwd == null) {
            throw new RuntimeException("비밀번호와 비밀번호 재확인을 입력해야 수정이 가능합니다.");
        }

        // 2) 연락처/주소 업데이트
        int updated = myPageMapper.updateMyContact(
                empNo,
                emptyToNull(req.getEmpEmail()),
                emptyToNull(req.getHpNo()),
                emptyToNull(req.getZipCd()),
                emptyToNull(req.getAddr1()),
                emptyToNull(req.getAddr2())
        );

        // 3) 비밀번호 암호화 저장
        String encoded = passwordEncoder.encode(newPwd);
        myPageMapper.updateMyPassword(empNo, encoded);
        
        // 4) 프로필 이미지 처리
        MultipartFile profileImg = req.getProfileImg();
        if (profileImg != null && !profileImg.isEmpty()) {
            try {
                // 기존 프로필 'N' 처리
                fileMapper.updatePreviousProfileDisabled(empNo);
                
                var currentEmp = empMapper.selectEmp(empNo);
                
                // 워크드라이브 업로드 (백업용)
                workDriveService.uploadSingleFile(profileImg, empNo, currentEmp.getDeptCd());

                // DB 저장용 DTO 생성 및 사번(refNo) 세팅
                FileDTO<String> fileDto = fileService.saveFile(profileImg, empNo, "PROFILE");
                fileDto.setRefNo(empNo); // 🚩 SQL의 #{refNo}와 매핑
                
                fileMapper.insertEmpFile(fileDto);
                log.info("사원 [{}] 프로필 교체 완료", empNo);

            } catch (Exception e) {
                log.error("이미지 처리 중 에러", e);
                throw new RuntimeException("사진 저장 중 오류가 발생했습니다.", e);
            }
        }
        return updated > 0;
    }
    
    @Override
    public MyPageProfileDTO readMyProfile(String empNo) {
    	
        MyPageProfileDTO profile = myPageMapper.selectMyProfile(empNo);
        
        FileDTO<String> profileImg = fileMapper.selectLatestProfile(empNo);
        
        profile.setProfileImgDto(profileImg);
        
        return profile;
    }

    private String emptyToNull(String v) {
        if (v == null) return null;
        String t = v.trim();
        return t.isEmpty() ? null : t;
    }

	@Override
	public boolean deleteProfileImg(String empNo) {
		int result = myPageMapper.updateProfileImgDisabled(empNo);
        return result > 0;
	}
}
