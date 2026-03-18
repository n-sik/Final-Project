package com.flowenect.hr.dto.behavior.req;

import java.util.List;

import lombok.Data;

@Data
public class BehaviorTestReq {

	private RspnsReq rspns;
	private List<RspnsResultsReq> rspnsResults;
	
}
