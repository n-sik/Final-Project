package com.flowenect.hr.mypage.service;

import com.flowenect.hr.dto.mypage.MyPageProfileDTO;
import com.flowenect.hr.dto.mypage.MyPageUpdateRequestDTO;

public interface MyPageService {
    MyPageProfileDTO getMyProfile(String empNo);

    boolean verifyCurrentPassword(String empNo, String rawPassword);

    boolean updateMyProfile(String empNo, MyPageUpdateRequestDTO req);
    
    MyPageProfileDTO readMyProfile(String empNo);
    
    boolean deleteProfileImg(String empNo);
}
