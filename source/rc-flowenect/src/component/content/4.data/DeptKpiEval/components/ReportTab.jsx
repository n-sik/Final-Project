import React from 'react';
import {AlertCircle, BarChart3} from 'lucide-react';
import styles from '../DeptKpiEval.module.css';

const ReportTab = ({ aiData, isAiLoading }) => {
  const content = aiData?.aiInsight || aiData?.AI_INSIGHT || aiData?.ai_insight;
  const grade = aiData?.performanceGrade || aiData?.PERFORMANCE_GRADE || "미측정";

  const getGradeClass = (g) => {
    if (g === '우수') return styles.excellent;
    if (g === '미흡') return styles.poor;
    return styles.good;
  };

  // 1. 데이터가 아예 없을 때 (초기 상태)
  if (!aiData && !isAiLoading) {
    return (
      <div className={styles.reportContainer}>
        <div className={styles.emptyAiReportFrame}>
          <div className={styles.aiHeaderPlaceholder}>
            <div className={styles.shimmerTitle}></div>
            <div className={styles.shimmerBadge}></div>
          </div>
          
          <div className={styles.emptyReportBody}>
            <div className={styles.iconCircleLarge}>
              <BarChart3 size={40} color="#e2e8f0" />
            </div>
            <h3>부서 성과 분석 리포트가 비어 있습니다</h3>
            <p>상단의 <strong>[AI 성과 평가하기]</strong> 버튼을 클릭하면<br/>
            현재 분기의 KPI 달성도를 분석하여 리포트를 생성합니다.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.reportContainer}>
      <div className={`${styles.aiFullReportCard} ${styles.fadeAnim}`}>
        <div className={styles.aiHeader}>
          <div className={styles.aiTitle}>
            <div className={styles.aiBadgeSmall}>STRATEGY REPORT</div>
            <h2>AI 조직 성과 전략 리포트</h2>
          </div>
          <div className={`${styles.aiGradeBadge} ${getGradeClass(grade)}`}>
            종합 등급: {grade}
          </div>
        </div>

        <div className={styles.aiDivider} />

        <div className={styles.aiBody}>
          {isAiLoading ? (
            <div className={styles.contentLoading}>
               <div className={styles.spinner} />
               <p>AI가 조직 데이터를 정밀 분석 중입니다...</p>
            </div>
          ) : (
            <div className={styles.aiContentText}>
              {content ? (
                <div className={styles.reportParagraph}>
                  {content}
                </div>
              ) : (
                <div className={styles.errorText}>
                  <AlertCircle size={20} />
                  <span>리포트 본문 데이터를 불러오는 데 실패했습니다.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportTab;