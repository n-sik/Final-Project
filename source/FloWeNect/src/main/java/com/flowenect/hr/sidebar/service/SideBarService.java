package com.flowenect.hr.sidebar.service;

import java.util.List;

import com.flowenect.hr.dto.sidebar.MenuDTO;

public interface SideBarService {
	
	// 사용자별 메뉴 조회
    List<MenuDTO> getMenuList(String empNo);

    // 대메뉴 순서 저장
    void saveMenuOrder(String empNo, List<Long> menuOrderList);
}
