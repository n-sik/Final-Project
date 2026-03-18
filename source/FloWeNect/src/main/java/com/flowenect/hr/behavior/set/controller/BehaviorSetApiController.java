package com.flowenect.hr.behavior.set.controller;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flowenect.hr.behavior.set.service.BehaviorSetService;
import com.flowenect.hr.dto.behavior.req.BehaviorSetReq;
import com.flowenect.hr.dto.behavior.res.BehaviorSetRes;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@RestController
@RequestMapping("api/behavior/set")
@RequiredArgsConstructor
public class BehaviorSetApiController {

	private final BehaviorSetService behaviorSetService;

	@GetMapping
	public  BehaviorSetRes readListBehaviorSet() {
		BehaviorSetRes res = behaviorSetService.readListBehaviorSet();
		log.info("{}", res);
		return res;
	}

	@PostMapping
	public BehaviorSetReq createBehaviorSet(@RequestBody BehaviorSetReq req) {
		log.info("**********************ㅁㅁㅁㅁㅁㅁㅁ*");
		log.info("**********************ㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁ*");
		log.info("***********************");
		log.info("{}", req);
		log.info("**********************ㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁ*");
		log.info("**********************ㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁ*");
		log.info("**********************ㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁ*");
		behaviorSetService.createBehavior(req);
		return req;
	}
	
	@PutMapping
	public BehaviorSetReq modifyBehaviorSet(@RequestBody BehaviorSetReq req) {
		// modifyBehavior 내부에서 req.id로 처리하기 때문에 req를 받고 넘김
		log.info("***********************");
		log.info("***********************");
		log.info("***********************");
		log.info("{}", req);
		log.info("***********************");
		log.info("***********************");
		log.info("***********************");
		behaviorSetService.modifyBehavior(req);
		return req;
	}
	
    @DeleteMapping("/{testNo}")
    public void deleteBehaviorSet(@PathVariable("testNo") Integer testNo) {
        behaviorSetService.deleteBehavior(testNo);
    }

}  
