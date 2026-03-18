package com.flowenect.hr.board.mapper;

import org.apache.ibatis.annotations.Mapper;

import com.flowenect.hr.dto.board.CommonScheduleDTO;

@Mapper
public interface CommonScheduleMapper {

	/**
     * 일정 등록
     * BoardMapper.insertBoard() 성공 후 실행됩니다.
     */
    int insertSchedule(CommonScheduleDTO commonSchedule);

    /**
     * 참조 게시글 번호로 일정 삭제
     * 게시글 삭제(deleteBoard)를 수행하기 직전에 이 메서드를 먼저 실행합니다.
     */
    int deleteSchedule(int refPostNo);

    /**
     * (참고) 연차 연동 등 다른 출처의 일정을 지울 때 사용
     */
    int deleteScheduleByNo(int schdNo);
}
