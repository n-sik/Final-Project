import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Cpu, Target, BookOpen, RefreshCw, PlayCircle, ShieldAlert, FileText, BarChart3, LayoutDashboard } from 'lucide-react';
import styles from '../IndividualEval.module.css';

const AiTotalReport = ({ aiResult, isAiLoading, onRunAnalysis, initialData }) => {

    // 1. 사원을 선택하지 않았거나 기초 데이터가 아직 오지 않았을 때 (틀 유지용 플레이스홀더)
    if (!initialData && !isAiLoading) {
        return (
            <div className={styles.fadeAnim}>
                <div className={styles.emptyAnalysisBox}>
                    <div className={styles.headerZoneSlim}>
                        <div className={styles.headerTitleGroup}>
                            <LayoutDashboard size={28} color="#cbd5e1" />
                            <h4 style={{color: '#94a3b8'}}>성과 분석 데이터 대기 중</h4>
                        </div>
                        <p>사원을 선택하면 정량/정성 평가 데이터가 이곳에 로드됩니다.</p>
                    </div>
                    <div className={styles.sideBySidePlaceholder}>
                        <div className={styles.skeletonSide}></div>
                        <div className={styles.skeletonSide}></div>
                    </div>
                </div>
            </div>
        );
    }

    const quant = initialData?.quantResult;
    const displayComment = initialData?.regComent || quant?.regComent;
    const hasData = initialData?.quantResult || (initialData?.qualList?.length > 0);

    // 2. AI 분석 중일 때 (애니메이션이 포함된 로딩 상태)
    if (isAiLoading) {
        return (
            <div className={`${styles.fadeAnim} ${styles.loadingWrapper}`}>
                <div className={styles.loadingContent}>
                    <div className={styles.digitalWave}>
                        <Cpu size={50} color="#6366f1" strokeWidth={1.5} className={styles.pulseIcon} />
                    </div>
                    <div className={styles.loadingTextZone}>
                        <h4>AI 핵심 역량 엔진 가동 중</h4>
                        <p>업무 성과 점수와 동료 피드백 정보를 융합하여 정밀 분석을 수행하고 있습니다.</p>
                        <div className={styles.loadingBarTrack}>
                            <div className={styles.loadingBarThumb}></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 3. 분석 결과가 있을 때 (최종 리포트 화면)
    if (aiResult) {
        const data = aiResult;
        return (
            <article className={styles.fadeAnim}>
                <header className={styles.topDashboard}>
                    <div className={styles.headerInfo}>
                        <div className={styles.tagRow}>
                            <span className={styles.mainTag}>AI COMPREHENSIVE ANALYSIS</span>
                        </div>
                        <h2 className={styles.reportTitle}>성과 인사이트 리포트: {data.name || '검토 대상'}</h2>
                    </div>
                    <button onClick={onRunAnalysis} className={styles.refreshBtn}>
                        <RefreshCw size={14} /> 리포트 업데이트
                    </button>
                </header>

                <div className={styles.evidenceLabel}>ANALYSIS EVIDENCE & INSIGHTS</div>

                <div className={styles.contentStack}>
                    <section className={styles.contentCard}>
                        <div className={styles.cardHeader}>
                            <BookOpen size={18} color="#6366f1" />
                            <span>AI 성과 정합성 및 핵심 역량 제언</span>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={styles.insightWrapper}>
                                <ReactMarkdown>{data.aiInsight || data}</ReactMarkdown>
                            </div>
                        </div>
                    </section>
                </div>
            </article>
        );
    }

    // 4. 분석 결과가 없을 때 (기초 데이터 대조 화면 - 분석 시작 전)
    return (
        <div className={styles.fadeAnim}>
            <div className={styles.emptyAnalysisBox}>
                <div className={styles.headerZoneSlim}>
                    <div className={styles.headerTitleGroup}>
                        <Target size={28} color="#6366f1" />
                        <h4>AI 종합 분석 대시보드</h4>
                    </div>
                    <p>등록된 정량 점수와 정성 피드백을 기반으로 종합 역량을 도출합니다.</p>
                </div>

                <div className={styles.sideBySideContainer}>
                    {/* 정량 데이터 사이드 */}
                    <div className={styles.analysisSide}>
                        <div className={styles.sideHeader}>
                            <BarChart3 size={18} color="#4f46e5" />
                            <span>정량평가 지표</span>
                        </div>
                        <div className={styles.sideContent}>
                            {quant ? (
                                <>
                                    <div className={styles.compactScoreGrid}>
                                        <div className={styles.miniScore}><span>정렬</span><strong>{quant.scoreAlign}</strong></div>
                                        <div className={styles.miniScore}><span>속도</span><strong>{quant.scoreSpeed}</strong></div>
                                        <div className={styles.miniScore}><span>성실</span><strong>{quant.scoreFaith}</strong></div>
                                        <div className={styles.miniScore}><span>성취</span><strong>{quant.scoreReach}</strong></div>
                                        <div className={styles.miniScore}><span>난이도</span><strong>{quant.scoreDiff}</strong></div>
                                    </div>
                                    <div className={styles.scrollTextWrapper}>
                                        <h5>📝 Performance Summary</h5>
                                        <div className={styles.preTextSmall}>{quant.aiSummary}</div>
                                    </div>
                                </>
                            ) : (
                                <div className={styles.emptyNotice}>수집된 정량 점수가 없습니다.</div>
                            )}
                        </div>
                    </div>

                    {/* 정성 데이터 사이드 */}
                    <div className={styles.analysisSide}>
                        <div className={styles.sideHeader}>
                            <FileText size={18} color="#4f46e5" />
                            <span>정성평가 기록 ({initialData?.qualList?.length || 0}건)</span>
                        </div>
                        <div className={styles.sideContent}>
                            {initialData?.qualList?.length > 0 ? (
                                <div className={styles.qualScrollList}>
                                    {initialData.qualList.map((item, idx) => (
                                        <div key={idx} className={styles.miniQualCard}>
                                            <div className={styles.miniQualMeta}>
                                                <span className={styles.qCd}>{item.EVAL_CD}</span>
                                                <span className={styles.qSc}>{item.EVAL_SCORE}점</span>
                                            </div>
                                            <p className={styles.qCm}>{item.EVAL_COMMENT}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.emptyNotice}>등록된 서술형 피드백이 없습니다.</div>
                            )}
                        </div>
                    </div>
                </div>

                {displayComment && (
                    <div className={styles.wideCorrectionBox}>
                        <div className={styles.corHeader}>
                            <ShieldAlert size={18} color="#f43f5e" />
                            <strong>부서장 최종 정정 및 특이사항</strong>
                        </div>
                        <div className={styles.corBody}>
                            "{displayComment}"
                        </div>
                    </div>
                )}

                <button 
                    onClick={onRunAnalysis} 
                    className={styles.primaryAnalysisBtn}
                    // 💡 데이터가 아예 없거나 이미 로딩 중이면 버튼 비활성화
                    disabled={!hasData || isAiLoading}
                    style={{
                        opacity: (!hasData || isAiLoading) ? 0.6 : 1,
                        cursor: (!hasData || isAiLoading) ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isAiLoading ? (
                        <><RefreshCw className={styles.spinner} size={20} /> AI 분석 엔진 가동 중...</>
                    ) : (
                        <><PlayCircle size={22} /> {hasData ? "데이터 융합 및 AI 종합 재분석 실행" : "분석 가능한 데이터 없음"}</>
                    )}
                </button>
            </div>
        </div>
    );
};

export default AiTotalReport;