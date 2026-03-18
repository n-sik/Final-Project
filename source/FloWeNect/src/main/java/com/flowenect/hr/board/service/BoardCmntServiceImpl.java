package com.flowenect.hr.board.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flowenect.hr.board.mapper.BoardCmntMapper;
import com.flowenect.hr.dto.board.BoardCmntDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class BoardCmntServiceImpl implements BoardCmntService {

	private final BoardCmntMapper boardCmntMapper;
	
	/**
     * 댓글 등록
     */
	@Override
	@Transactional
	public int createComment(BoardCmntDTO boardCmnt) {
		log.info("댓글 등록 요청: 게시글 번호 {}, 작성자 {}", boardCmnt.getPostNo(), boardCmnt.getWriterEmpNo());
        
        // 1. 매퍼 호출 (selectKey에 의해 boardCmnt 객체에 cmntNo가 채워짐)
        int result = boardCmntMapper.insertComment(boardCmnt);
        
        if (result > 0) {
            log.info("댓글 등록 성공. 생성된 댓글 번호: {}", boardCmnt.getCmntNo());
            return boardCmnt.getCmntNo(); // 생성된 PK 반환
        } else {
            log.error("댓글 등록 실패");
            return 0;
        }
	}

	/**
     * 특정 게시글의 댓글 목록 조회
     */
	@Override
	@Transactional
	public List<BoardCmntDTO> readCommentList(int postNo) {
		log.info("댓글 목록 조회 요청: 게시글 번호 {}", postNo);
		return boardCmntMapper.selectCommentList(postNo);
	}

	/**
	 * 댓글 수정
	 */
	@Override
	@Transactional
	public int modifyComment(BoardCmntDTO boardCmnt) {
		log.info("댓글 수정 요청: 댓글 번호 {}", boardCmnt.getCmntNo());
		return boardCmntMapper.updateComment(boardCmnt);
	}

	/**
	 * 댓글 삭제
	 */
	@Override
	@Transactional
	public int removeComment(int cmntNo) {
		log.info("댓글 삭제 요청: 댓글 번호 {}", cmntNo);
		return boardCmntMapper.deleteComment(cmntNo);
	}

}
