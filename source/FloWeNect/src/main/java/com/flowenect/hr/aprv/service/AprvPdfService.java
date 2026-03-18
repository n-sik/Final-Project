package com.flowenect.hr.aprv.service;

public interface AprvPdfService {

    /**
     * 미리보기/완료본 PDF를 생성해서 byte[]로 반환
     */
	byte[] generatePdfBytes(long aprvNo, String empNo);

    /**
     * 결재 완료 시: PDF 생성 -> 파일 저장 -> 파일 메타를 APPR_FILE에 등록
     * @return 저장된 파일의 식별자(필요 없으면 0 반환)
     * 2단계: 최종 승인 PDF 생성(서명/직인 오버레이/최종본 생성 정책 확정 후 적용)
     */
	long generateAndSaveFinalPdf(long aprvNo, String savedByEmpNo);
	
	long generateAndSaveSystemPdfOnSubmit(long aprvNo, String empNo);

	byte[] loadLatestSystemPdfBytes(long aprvNo, String empNo);
	
    byte[] loadLatestPdfBytes(long aprvNo, String empNo);
    
    
}
