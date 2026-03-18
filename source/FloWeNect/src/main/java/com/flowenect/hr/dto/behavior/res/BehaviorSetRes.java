package com.flowenect.hr.dto.behavior.res;

import java.util.List;

import com.flowenect.hr.dto.behavior.BehaviorTypeDTO;
import com.flowenect.hr.dto.behavior.QuestionDTO;
import com.flowenect.hr.dto.behavior.QuestionItemDTO;
import com.flowenect.hr.dto.behavior.TestMstDTO;

import lombok.Data;

@Data
public class BehaviorSetRes {
	private List<TestMstDTO> testMst;
	private List<QuestionDTO> questions;
	private List<QuestionItemDTO> questionItems;
	private List<BehaviorTypeDTO> behaviorTypes;
}