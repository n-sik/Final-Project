package com.flowenect.hr.dto.behavior.res;

import java.util.List;

import com.flowenect.hr.dto.behavior.BehaviorTypeDTO;

import lombok.Data;

@Data
public class BehaviorResultDetailRes {
	/** 행동유형 리포트(BehaviorType.TYPE_CN) */
	private BehaviorTypeDTO type;
	private BehaviorRspnsDetailMstDTO mst;
	private List<BehaviorRspnsAnswerDTO> answers;
}
