package com.flowenect.hr.board.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.flowenect.hr.dto.board.BoardDTO;
import com.flowenect.hr.dto.board.BoardFileDTO;
import com.flowenect.hr.dto.board.BoardTypeDTO;

@Mapper
public interface BoardMapper {

	/**
	 * 게시글 등록
	 */
	int insertBoard(BoardDTO board);
	
	/**
	 * 게시글 수정
	 */
	int updateBoard(BoardDTO board);
	
	/**
     * 게시글 삭제 (Hard Delete 또는 Soft Delete)
     * 일정 테이블의 데이터를 먼저 삭제한 후 호출되어야 합니다.
 	 */	
	int deleteBoard(int postNo);
	
	/**
     * 게시글 전체 목록 조회
     */
    List<BoardDTO> selectBoardList();
	
	/**
	 * 게시글 상세 조회
	 */
    BoardDTO selectBoardDetail(int postNo);
    
    /**
	 * 게시판 타입 조회 (교육/채용 여부 확인용)
	 */
    BoardTypeDTO selectBoardType(int boardTypeNo);

    /** 서버 페이징: 게시글 목록 */
    List<BoardDTO> selectBoardPage(com.flowenect.hr.dto.board.BoardSearchCondDTO cond);

    /** 서버 페이징: 총 개수 */
    int selectBoardCount(com.flowenect.hr.dto.board.BoardSearchCondDTO cond);

	/** 조회수 +1 */
	int increaseViewCnt(int postNo);

	// ===== 첨부파일(BOARD_FILE) =====
	int insertBoardFile(BoardFileDTO file);
	List<BoardFileDTO> selectBoardFilesByPostNo(int postNo);
	BoardFileDTO selectBoardFileByNo(long boardFileNo);
	int softDeleteBoardFile(long boardFileNo);
	
}
