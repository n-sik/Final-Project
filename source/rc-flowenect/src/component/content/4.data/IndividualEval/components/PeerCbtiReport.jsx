import React, { useState } from 'react';
import { Users2, Award, Target, Sparkles, BrainCircuit, Activity, Loader2, Users, BarChart3, Info } from 'lucide-react';
import styles from '../IndividualEval.module.css';
import Pagination from '../../Common/Pagination'; 

const PeerCbtiReport = ({ data, empNo, aiResult, isAiLoading, onRunAnalysis }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 1; 

    const peerEvaluations = data?.peerEvaluations || [];
    const totalItems = peerEvaluations.length;
    const totalPageCount = Math.ceil(totalItems / itemsPerPage);
    const currentFeedback = peerEvaluations[currentPage - 1]; 

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return dateStr.substring(0, 10); 
    };

    // 💡 데이터가 아예 없을 때도 '틀'을 유지하기 위해 return 분기를 하단으로 이동
    return (
        <div className={styles.fadeAnim}>
            {/* 1. 상단 요약 섹션: 데이터 유무와 상관없이 구조 유지 */}
            <div className={styles.typeSummaryBox}>
                <div className={styles.typeIcon}>
                    {aiResult ? <Sparkles size={36} color="#6366f1" /> : <Award size={36} color="#cbd5e1" />}
                </div>
                <div className={styles.typeText}>
                    <div className={styles.aiBadge}>
                        <Activity size={14} /> 
                        AI Behavioral Synthesis {totalItems > 0 ? `(Analysis of ${totalItems} Peer Vectors)` : "(No Data)"}
                    </div>
                    
                    <div className={styles.titleWrapper}>
                        {aiResult?.modelCd && aiResult.modelCd !== 'UNKNOWN' && (
                            <span className={styles.modelCodeTag}>{aiResult.modelCd}</span>
                        )}
                        <h2 className={styles.typeName}>
                            {aiResult?.modelName 
                                ? aiResult.modelName 
                                : (totalItems > 0 ? (currentFeedback?.TYPE_NM || "미분류 모델") : "분석 대기 중")}
                        </h2>
                    </div>
                </div>
                
                {/* 데이터가 있을 때만 분석 버튼 활성화 (없으면 비활성화) */}
                {!aiResult && (
                    <button 
                        className={styles.analysisTriggerBtn} 
                        onClick={() => onRunAnalysis(empNo)}
                        disabled={isAiLoading || totalItems === 0}
                    >
                        {isAiLoading ? (
                            <><Loader2 className={styles.spinner} size={16} /> 벡터 매칭 중...</>
                        ) : (
                            <><BrainCircuit size={18} /> AI 심층 분석 실행</>
                        )}
                    </button>
                )}
            </div>

            {/* 2. AI 심층 분석 리포트 섹션: 결과가 있을 때만 슬라이드 다운 */}
            {aiResult ? (
                <div className={`${styles.aiDeepAnalysisSection} ${styles.slideDown}`}>
                    <div className={styles.aiAnalysisTitle}>
                        <BarChart3 size={20} color="#4f46e5" />
                        <h4>AI Peer-Vector 신뢰성 지표</h4>
                    </div>

                    <div className={styles.metricTableWrapper}>
                        <table className={styles.metricTable}>
                            <thead>
                                <tr>
                                    <th>분석 항목</th>
                                    <th>신뢰도 점수</th>
                                    <th>데이터 의미</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className={styles.metricLabel}><Target size={14} /> 모델 유사도</td>
                                    <td className={styles.metricValue}>
                                        {aiResult.similarity <= 10 ? aiResult.similarity * 10 : aiResult.similarity}%
                                    </td>
                                    <td className={styles.metricInfo}>
                                        피드백 데이터가 <strong>{aiResult.modelCd}</strong> 유형의 표준 패턴과 일치하는 정도입니다.
                                    </td>
                                </tr>
                                <tr>
                                    <td className={styles.metricLabel}><Users size={14} /> 인식 합의도</td>
                                    <td className={styles.metricValue}>
                                        {aiResult.consensus <= 10 ? aiResult.consensus * 10 : aiResult.consensus}%
                                    </td>
                                    <td className={styles.metricInfo}>
                                        동료 {totalItems}명의 의견이 얼마나 일관되게 <strong>{aiResult.modelName}</strong> 특성을 가리키는지 나타냅니다.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div className={styles.aiAnalysisContent}>
                        <div className={styles.aiAnalysisText}>
                            <div className={styles.textHeader}><Info size={16} /> AI 행동 양식 심층 분석</div>
                            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>
                                {aiResult.analysisText}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                /* 결과가 없을 때 보여줄 빈 플레이스홀더 (틀 유지용) */
                <div className={styles.aiPlaceholder}>
                    <p>분석 버튼을 클릭하면 AI의 심층 역량 분석 리포트가 생성됩니다.</p>
                </div>
            )}

            <div className={styles.dividerText}>Evidence: Individual Peer Feedback</div>

            {/* 3. 하단 동료 피드백 원문 섹션 */}
            <div className={styles.evidenceSection}>
                {totalItems > 0 ? (
                    <>
                        <div className={styles.feedbackCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.evaluatorInfo}>
                                    <Users size={16} />
                                    <span className={styles.evaluatorName}>{currentFeedback.EMP_NM} 님의 상세 의견</span>
                                </div>
                                <span className={styles.evalDate}>{formatDate(currentFeedback.RSPNS_DTM)}</span>
                            </div>
                            
                            <div className={styles.reportGrid}>
                                {currentFeedback.typeCn?.split('•').filter(Boolean).map((s, idx) => {
                                    const parts = s.split('\n');
                                    const title = parts[0];
                                    const content = parts.slice(1).join('\n');
                                    return (
                                        <div key={idx} className={styles.analysisCard}>
                                            <h5>{title.trim()}</h5>
                                            <p style={{ whiteSpace: 'pre-wrap' }}>
                                                {content.trim().replace(/ㆍ/g, '')}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        
                        <div className={styles.paginationWrapper}>
                            <Pagination 
                                paging={{
                                    startPage: 1,
                                    endPage: totalPageCount,
                                    totalPageCount: totalPageCount,
                                    prev: currentPage > 1, 
                                    next: currentPage < totalPageCount 
                                }}
                                currentPage={currentPage}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    </>
                ) : (
                    /* 동료 평가 데이터 자체가 없을 때의 처리 */
                   <div className={styles.emptyFeedbackPlaceholder}>
                        <div className={styles.emptyCardContent}>
                            <div className={styles.iconCircle}>
                                <Users2 size={32} color="#94a3b8" />
                            </div>
                            <h4>동료 피드백 데이터가 비어 있습니다</h4>
                            <p>
                                해당 사원에 대해 등록된 동료 평가가 아직 없습니다.<br />
                                <strong>동료 평가 시스템</strong>을 통해 피드백을 요청해 보세요.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PeerCbtiReport;