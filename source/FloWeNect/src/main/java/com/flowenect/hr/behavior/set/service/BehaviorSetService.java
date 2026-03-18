package com.flowenect.hr.behavior.set.service;

import com.flowenect.hr.dto.behavior.req.BehaviorSetReq;
import com.flowenect.hr.dto.behavior.res.BehaviorSetRes;

public interface BehaviorSetService {

	void createBehavior(BehaviorSetReq req);

	BehaviorSetRes readListBehaviorSet();

	void modifyBehavior(BehaviorSetReq req);

	void deleteBehavior(Integer id);



}
