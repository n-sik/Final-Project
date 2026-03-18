package com.flowenect.hr.department.board.controller;

import java.nio.charset.StandardCharsets;
import java.util.List;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriUtils;

import com.flowenect.hr.commons.file.service.FileService;
import com.flowenect.hr.department.board.service.WorkDriveService;
import com.flowenect.hr.dto.FileMetaDTO;
import com.flowenect.hr.security.auth.EmpDTOWrapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequestMapping("/work-drive")
@RequiredArgsConstructor
public class BoardController {

    private final WorkDriveService workDriveService;
    private final FileService fileService;

    @GetMapping("/readList")
    public String boardForm(
            @AuthenticationPrincipal EmpDTOWrapper userDetails, 
            @RequestParam(required = false) String currentPath, 
            Model model) {
    	
        String deptCd = userDetails.getRealUser().getDeptCd();
        String calculatedRoot = "dept/" + deptCd + "/data/";
        String path = (currentPath == null || currentPath.isEmpty()) 
                      ? calculatedRoot : currentPath;
        
        model.addAttribute("rootPath", calculatedRoot); 
        model.addAttribute("currentPath", path);      
        model.addAttribute("deptCd", deptCd);          
        model.addAttribute("fileList", workDriveService.readFileList(deptCd, path));
        
        return "department/board/boardForm";
    }

    @PostMapping("/upload")
    @ResponseBody
    public String uploadFiles(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam String currentPath, 
            @AuthenticationPrincipal EmpDTOWrapper userDetails) {
    	
    	String deptCd = userDetails.getRealUser().getDeptCd();
        String empNm = userDetails.getRealUser().getEmpNm();
        return workDriveService.uploadFiles(files, deptCd, currentPath, empNm);
    }

    @PostMapping("/createfolder")
    @ResponseBody
    public String createfolder(@RequestParam String folderName,
                               @RequestParam String currentPath,
                               @AuthenticationPrincipal EmpDTOWrapper userDetails) {
        String deptCd = userDetails.getRealUser().getDeptCd();
        String empNm = userDetails.getRealUser().getEmpNm();
        return workDriveService.createFolder(folderName, currentPath, deptCd, empNm);
    }

    @PostMapping("/move")
    @ResponseBody
    public String moveFile(@RequestParam Long fileNo, @RequestParam String targetPath) {
        return workDriveService.moveFile(fileNo, targetPath);
    }

    @PostMapping("/delete")
    @ResponseBody
    public String deleteFiles(@RequestParam("fileNos") List<Long> fileNos) {
        workDriveService.deleteFiles(fileNos);
        return "SUCCESS";
    }
    
    @GetMapping("/{action}/{fileNo}")
    @ResponseBody
    public ResponseEntity<byte[]> handleFileAction(@PathVariable String action, @PathVariable Long fileNo) {
        // 1. 서비스 호출 (파일 메타 정보와 S3 바이트 데이터를 한 번에 가져오거나 분리)
    	FileMetaDTO fileMeta = workDriveService.selectByFileNo(fileNo);
        if (fileMeta == null) return ResponseEntity.notFound().build();

        byte[] bytes = fileService.getS3FileBytes(fileMeta);
        
        // 2. 응답 설정 (이전과 동일)
        String dispositionType = "download".equals(action) ? "attachment" : "inline";
        String encodedFileName = UriUtils.encode(fileMeta.getFileNm(), StandardCharsets.UTF_8);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentDisposition(ContentDisposition.builder(dispositionType)
                .filename(encodedFileName).build());

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaTypeFactory.getMediaType(fileMeta.getFileNm()).orElse(MediaType.APPLICATION_OCTET_STREAM))
                .body(bytes);
    }
}