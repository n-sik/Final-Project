package com.flowenect.hr.dto.behavior.res;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BehaviorRspnsAnswerDTO {
	private Integer qstNo;
	private String qstNm;
	private Integer itemNo;
	private String itemCn;
	private String itemType;
	private Integer rspnsVal;
}
