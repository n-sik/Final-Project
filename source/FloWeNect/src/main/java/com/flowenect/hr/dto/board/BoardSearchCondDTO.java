package com.flowenect.hr.dto.board;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 서버 페이징/검색 조건 DTO */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardSearchCondDTO {
  private int boardTypeNo;
  private int page;     // 1-base
  private int size;
  private int offset;   // (page-1)*size

  private String searchType; // title | writer
  private String keyword;
}
