package com.flowenect.hr.mypage.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.flowenect.hr.dto.mypage.MyPageProfileDTO;

@Mapper
public interface MyPageMapper {

    MyPageProfileDTO selectMyProfile(@Param("empNo") String empNo);

    String selectMyPasswordHash(@Param("empNo") String empNo);

    int updateMyContact(@Param("empNo") String empNo,
                        @Param("empEmail") String empEmail,
                        @Param("hpNo") String hpNo,
                        @Param("zipCd") String zipCd,
                        @Param("addr1") String addr1,
                        @Param("addr2") String addr2);

    int updateMyPassword(@Param("empNo") String empNo,
                         @Param("pwd") String encodedPwd);
    
    int updateProfileImgDisabled(@Param("empNo") String empNo);
}
