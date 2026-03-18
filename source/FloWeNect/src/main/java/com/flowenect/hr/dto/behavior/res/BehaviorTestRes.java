package com.flowenect.hr.dto.behavior.res;

import java.util.List;

import com.flowenect.hr.dto.behavior.QuestionDTO;
import com.flowenect.hr.dto.behavior.QuestionItemDTO;
import com.flowenect.hr.dto.behavior.TestMstDTO;

import lombok.Data;

@Data
public class BehaviorTestRes {
	private TestMstDTO testMst;
	private List<QuestionDTO> questions;
	private List<QuestionItemDTO> questionItems;
}
