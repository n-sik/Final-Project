package com.flowenect.hr.sidebar.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.flowenect.hr.sidebar.service.SideBarService;


import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/sidebar")
@RequiredArgsConstructor
public class SideBarController {
	
	private final SideBarService sideBarService;
	
	@GetMapping("/menu")
	public ResponseEntity<?> getMenuList(@RequestParam String empNo){
		return ResponseEntity.ok(
					sideBarService.getMenuList(empNo)
				);
	}
	
	 @PostMapping("/order")
	    public ResponseEntity<?> saveMenuOrder(
	            @RequestParam String empNo,
	            @RequestBody List<Long> menuOrderList) {

	        sideBarService.saveMenuOrder(empNo, menuOrderList);
	        return ResponseEntity.ok().build(); 
	    }
}
