package com.flowenect.hr.aprv.service;

import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;

public interface AprvFileService {
	
    ResponseEntity<Resource> download(long fileNo, String empNo);

    void saveAttachments(long aprvNo, java.util.List<org.springframework.web.multipart.MultipartFile> files, String empNo);

}
