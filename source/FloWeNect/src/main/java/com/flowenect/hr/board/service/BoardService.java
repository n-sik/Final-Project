package com.flowenect.hr.board.service;

import java.util.List;

import com.flowenect.hr.dto.board.BoardDTO;
import com.flowenect.hr.dto.board.BoardFileDTO;
import com.flowenect.hr.dto.board.BoardTypeDTO;

public interface BoardService {

	/**
     * 게시글 등록
     * (교육/채용 타입일 경우 일정 테이블 자동 등록 로직 포함)
     * @param board 게시글 정보
     * @return 생성된 게시글 번호
     */
    int createBoard(BoardDTO board);

    /**
     * 게시글 수정
     * @param board 수정할 정보
     * @return 수정 성공 여부
     */
    int modifyBoard(BoardDTO board);

    /**
     * 게시글 삭제 (Soft Delete)
     * @param postNo 게시글 번호
     * @return 삭제 성공 여부
     */
    int removeBoard(int postNo);

    /**
     * 게시글 상세 조회
     * @param postNo 게시글 번호
     * @return 게시글 상세 데이터
     */
    BoardDTO readBoardDetail(int postNo);

    /**
     * 게시글 목록 조회
     * @return 게시글 리스트
     */
    List<BoardDTO> readBoardList();
    
    /**
     * 게시판 종류 상세 조회
     * (Service 로직 내에서 특정 게시판 타입(교육/채용 등) 여부를 판별하거나 
     * 화면에 게시판 이름을 표시하기 위해 사용)
     * @param boardTypeNo 조회할 게시판 종류 번호 (PK)
     * @return 게시판 종류 정보 (BoardTypeDTO)
     */
    BoardTypeDTO readBoardType(int boardTypeNo);

	/** 서버 페이징 목록 */
	com.flowenect.hr.dto.board.BoardPageResDTO readBoardPage(com.flowenect.hr.dto.board.BoardSearchCondDTO cond);

	// =====================
	// 첨부파일(BOARD_FILE)
	// =====================
	List<BoardFileDTO> uploadBoardFiles(int postNo, String regEmpNo, List<org.springframework.web.multipart.MultipartFile> files);
	List<BoardFileDTO> listBoardFiles(int postNo);
	BoardFileDTO getBoardFile(long boardFileNo);
	int deleteBoardFile(long boardFileNo);
}
