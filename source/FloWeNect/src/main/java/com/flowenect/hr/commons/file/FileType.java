package com.flowenect.hr.commons.file;

import java.util.Arrays;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum FileType {
	
    EMP_PROFILE("emp", "profile"),
    EMP_DOC("emp", "docs"),
    DEPT_LOGO("dept", "logo"),
    BOARD_ATTACH("board", "attach"),
    DEPT("dept" ,"data"),
    MAIN_BOARD("mainboard", "data"),
    DRIVE("deptHR", "data"), 
    COMMON("common", "temp");
	

    private final String category; // emp, dept 등
    private final String subDir;   // profile, logo 등

    // 파일 타입 코드로 Enum 객체를 찾는 메서드
    public static FileType of(String code) {
        return Arrays.stream(values())
                .filter(type -> type.name().equals(code))
                .findFirst()
                .orElse(COMMON); // 매칭되는 게 없으면 공통 폴더로
    }

    // 최종 경로 조립 로직을 Enum 내부로 캡슐화
    public String getFullPath(String refNo) {
        return String.format("%s/%s/%s", this.category, refNo, this.subDir);
    }
}
