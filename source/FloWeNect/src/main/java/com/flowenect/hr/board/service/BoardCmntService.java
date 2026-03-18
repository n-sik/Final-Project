package com.flowenect.hr.board.service;

import java.util.List;

import com.flowenect.hr.dto.board.BoardCmntDTO;

public interface BoardCmntService {

	/**
     * 댓글 등록
     * @param boardCmnt 등록할 댓글 정보
     * @return 등록된 댓글의 PK (cmntNo)
     */
    int createComment(BoardCmntDTO boardCmnt);

    /**
     * 특정 게시글의 댓글 목록 조회
     * @param postNo 게시글 번호
     * @return 댓글 목록 리스트
     */
    List<BoardCmntDTO> readCommentList(int postNo);

    /**
     * 댓글 수정
     * @param boardCmnt 수정할 댓글 정보 (cmntNo, commentCn 필수)
     * @return 수정 성공 여부 (1: 성공, 0: 실패)
     */
    int modifyComment(BoardCmntDTO boardCmnt);

    /**
     * 댓글 삭제 (논리 삭제: DEL_YN = 'Y')
     * @param cmntNo 삭제할 댓글 번호
     * @return 삭제 성공 여부 (1: 성공, 0: 실패)
     */
    int removeComment(int cmntNo);
}
