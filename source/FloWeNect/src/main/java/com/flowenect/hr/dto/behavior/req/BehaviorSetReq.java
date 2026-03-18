package com.flowenect.hr.dto.behavior.req;

import java.util.List;

import lombok.Data;

@Data
public class BehaviorSetReq {

	private String id;
	private String testNm;
	private String testDesc;

	private List<SectionReq> sections;
	private List<ResultReq> results;

}
