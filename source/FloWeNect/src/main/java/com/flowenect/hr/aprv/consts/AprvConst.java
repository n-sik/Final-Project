package com.flowenect.hr.aprv.consts;

public final class AprvConst {

    // 문서 상태
    public static final String DOC_DRAFT = "DRAFT";
    public static final String DOC_IN_PROGRESS = "IN_PROGRESS";
    public static final String DOC_APPROVED = "APPROVED";
    public static final String DOC_REJECTED = "REJECTED";
    public static final String DOC_CANCELED = "CANCELED";
    public static final String DOC_SUBMITTED = "SUBMITTED";
    public static final String DOC_COMPLETED = "COMPLETED"; // 1단계 미사용(예약)

    // 결재라인 상태
    public static final String LINE_WAIT = "WAIT";
    public static final String LINE_APPROVED = "APPROVED";
    public static final String LINE_REJECTED = "REJECTED";
    public static final String LINE_CANCELED = "CANCELED"; // 선택(취소시 라인 무효화용)

    // 액션
    public static final String ACT_APPROVE = "APPROVE";
    public static final String ACT_REJECT = "REJECT";

    // 작성 액션 타입
    public static final String CREATE_SUBMIT = "SUBMIT";
    public static final String CREATE_TEMP_SAVE = "TEMP_SAVE";

    private AprvConst() {}
}
