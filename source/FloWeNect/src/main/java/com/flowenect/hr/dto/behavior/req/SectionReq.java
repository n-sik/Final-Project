package com.flowenect.hr.dto.behavior.req;

import java.util.List;

import lombok.Data;

@Data
public class SectionReq {

  private String id;
  private String qstNm;
  private List<QuestionItemReq> questions;

}