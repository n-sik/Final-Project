package com.flowenect.hr.board.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.flowenect.hr.dto.board.BoardCmntDTO;

@Mapper
public interface BoardCmntMapper {

	// 댓글 등록
    int insertComment(BoardCmntDTO boardCmnt);

    // 게시글별 댓글 목록 조회
    List<BoardCmntDTO> selectCommentList(int postNo);

    // 댓글 수정
    int updateComment(BoardCmntDTO boardCmnt);
    
    // 댓글 삭제 (DEL_YN 업데이트)
    int deleteComment(int cmntNo);
}
