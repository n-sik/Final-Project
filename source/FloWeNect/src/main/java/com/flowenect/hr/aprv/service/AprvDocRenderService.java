package com.flowenect.hr.aprv.service;

import java.util.Map;

/**
 * docView(JSP) 를 서버 내부에서 렌더링하여 HTML 문자열을 생성한다.
 *
 * B 방안: 화면(docView) = PDF 원본 템플릿
 */
public interface AprvDocRenderService {

    /**
     * @param aprvNo 결재문서 번호
     * @param empNo  접근 사용자
     * @param mode   VIEW | SYSTEM | FINAL
     * @param assetImgMap FINAL 모드에서 결재라인별(data URI) 이미지 맵(lineNo -> dataUri). 없으면 null
     */
    String renderDocViewHtml(long aprvNo, String empNo, String mode, Map<Long, String> assetImgMap);
}