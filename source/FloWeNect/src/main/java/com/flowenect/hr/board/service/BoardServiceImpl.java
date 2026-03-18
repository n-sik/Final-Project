package com.flowenect.hr.board.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.flowenect.hr.board.mapper.BoardMapper;
import com.flowenect.hr.board.mapper.CommonScheduleMapper;
import com.flowenect.hr.commons.file.FileType;
import com.flowenect.hr.commons.file.service.FileService;
import com.flowenect.hr.dto.FileDTO;
import com.flowenect.hr.dto.board.BoardDTO;
import com.flowenect.hr.dto.board.BoardFileDTO;
import com.flowenect.hr.dto.board.BoardTypeDTO;
import com.flowenect.hr.dto.notification.NotificationDTO;
import com.flowenect.hr.notification.service.NotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class BoardServiceImpl implements BoardService {

	private final BoardMapper boardMapper;
	private final CommonScheduleMapper commonScheduleMapper;
	private final FileService fileService;
	private final NotificationService notificationService;
	
	/**
     * 게시글 등록 + 일정 자동 등록 연동
     */
	@Override
	@Transactional
	public int createBoard(BoardDTO board) {
		log.info("게시글 등록 시작: {}", board.getTitle());

        // 게시글 데이터 등록 (MyBatis selectKey에 의해 board 객체에 postNo가 채워짐)
        int result = boardMapper.insertBoard(board);

        if (result > 0) {
            // 게시판 타입 확인 (4: 교육, 5: 채용)
            int boardTypeNo = board.getBoardTypeNo();
            
            if (boardTypeNo == 4 || boardTypeNo == 5) {
                log.info("교육/채용 게시글 감지 (Type: {}). 일정 등록 로직을 실행합니다.", boardTypeNo);

                // periodYn = 'Y'인 경우에만 일정 등록
                if ("Y".equalsIgnoreCase(board.getPeriodYn()) && board.getStartDtm() != null && board.getEndDtm() != null) {
                    com.flowenect.hr.dto.board.CommonScheduleDTO sch = com.flowenect.hr.dto.board.CommonScheduleDTO.builder()
                        .empNo(board.getRegEmpNo())
                        .refPostNo(board.getPostNo())
                        .schdDivCd(boardTypeNo == 4 ? "EDU" : "RECRUIT")
                        .schdTitle(board.getTitle())
                        .schdCn(board.getCn())
                        .schdStDtm(board.getStartDtm())
                        .schdEdDtm(board.getEndDtm())
                        .allDayYn("N")
                        .schdPrio(1)
                        .build();

                    commonScheduleMapper.insertSchedule(sch);
                }
            }

            // ✅ '건의'(BOARD_TYPE_NO=6) 제외 신규 게시글 -> 전사 알림
            if (boardTypeNo != 6) {
                String title = (board.getTitle() != null && !board.getTitle().isBlank())
                        ? board.getTitle()
                        : "(제목 없음)";

                NotificationDTO template = NotificationDTO.builder()
                        .notiTypeCd("BOARD")
                        .notiCn("새 게시글이 등록되었습니다: " + title)
                        .srcTypeCd("BOARD")
                        .srcNo(String.valueOf(board.getPostNo()))
                        .moveUrl("/board")
                        .readYn("N")
                        .build();

                notificationService.createAndPushToAllEmployees(template);
            }
        }

        return board.getPostNo(); // 생성된 PK 반환 // 생성된 PK 반환
	}

	/**
     * 게시글 수정
     */
	@Override
	@Transactional
	public int modifyBoard(BoardDTO board) {
		log.info("게시글 수정: {}", board.getPostNo());
		return boardMapper.updateBoard(board);
	}

	/**
     * 게시글 삭제 
     */
	@Override
	@Transactional
	public int removeBoard(int postNo) {
		// 일정 먼저 삭제 (FK 데이터 정리)
	    commonScheduleMapper.deleteSchedule(postNo);
	    
		log.info("게시글 삭제: {}", postNo);
		return boardMapper.deleteBoard(postNo);
	}

	/**
     * 게시글 상세 조회
     */
	@Override
	@Transactional
	public BoardDTO readBoardDetail(int postNo) {
		// ✅ 상세 조회 시 조회수 증가 + 첨부파일 함께 조회
		boardMapper.increaseViewCnt(postNo);
		BoardDTO board = boardMapper.selectBoardDetail(postNo);
		if (board != null) {
			board.setFiles(boardMapper.selectBoardFilesByPostNo(postNo));
		}
		return board;
	}

	/**
     * 게시글 전체 목록 조회
     */
	@Override
	@Transactional
	public List<BoardDTO> readBoardList() {
		return boardMapper.selectBoardList();
	}

	/**
     * 게시판 종류 조회
     */
	@Override
	@Transactional
	public com.flowenect.hr.dto.board.BoardPageResDTO readBoardPage(com.flowenect.hr.dto.board.BoardSearchCondDTO cond) {
        int safePage = Math.max(1, cond.getPage());
        int safeSize = Math.max(1, cond.getSize());
        cond.setPage(safePage);
        cond.setSize(safeSize);
        cond.setOffset((safePage - 1) * safeSize);

        int total = boardMapper.selectBoardCount(cond);
        java.util.List<com.flowenect.hr.dto.board.BoardDTO> list = boardMapper.selectBoardPage(cond);

        return com.flowenect.hr.dto.board.BoardPageResDTO.builder()
            .list(list)
            .totalCount(total)
            .build();
    }

	/**
     * 게시판 종류 조회
     */
	@Override
	@Transactional
	public BoardTypeDTO readBoardType(int boardTypeNo) {
		return boardMapper.selectBoardType(boardTypeNo);
	}

	// =====================
	// 첨부파일(BOARD_FILE)
	// =====================
	@Override
	@Transactional
	public List<BoardFileDTO> uploadBoardFiles(int postNo, String regEmpNo, List<MultipartFile> files) {
		if (files == null || files.isEmpty()) {
			return boardMapper.selectBoardFilesByPostNo(postNo);
		}

		for (MultipartFile file : files) {
			if (file == null || file.isEmpty()) continue;

			// commons/file 패키지는 수정하지 않고, 제공된 FileService를 그대로 사용
			FileDTO<String> uploadedFile = fileService.saveFile(file, regEmpNo, "MAIN_BOARD");
			if (uploadedFile == null || uploadedFile.getFileMeta() == null) continue;

			BoardFileDTO row = BoardFileDTO.builder()
					.postNo((long) postNo)
					.fileNm(uploadedFile.getFileMeta().getFileNm())
					.saveFileNm(uploadedFile.getFileMeta().getSaveFileNm())
					.filePath(uploadedFile.getFileMeta().getFilePath())
					.fileSize(uploadedFile.getFileMeta().getFileSize())
					.fileExt(uploadedFile.getFileMeta().getFileExt())
					.delYn("N")
					.regDtm(LocalDateTime.now())
					.build();

			boardMapper.insertBoardFile(row);
		}

		return boardMapper.selectBoardFilesByPostNo(postNo);
	}

	@Override
	@Transactional(readOnly = true)
	public List<BoardFileDTO> listBoardFiles(int postNo) {
		return boardMapper.selectBoardFilesByPostNo(postNo);
	}

	@Override
	@Transactional(readOnly = true)
	public BoardFileDTO getBoardFile(long boardFileNo) {
		return boardMapper.selectBoardFileByNo(boardFileNo);
	}

	@Override
	@Transactional
	public int deleteBoardFile(long boardFileNo) {
		return boardMapper.softDeleteBoardFile(boardFileNo);
	}

}
