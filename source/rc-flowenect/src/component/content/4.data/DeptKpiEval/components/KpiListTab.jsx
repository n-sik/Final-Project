import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BarChart2, Target } from 'lucide-react';
import styles from '../DeptKpiEval.module.css';

const KpiListTab = ({ projects = [] }) => {
  const [expandedId, setExpandedId] = useState(null);

  // 상태 코드별 스타일 매핑 (CSS Modules 클래스 가정)
  const getStatusClass = (status) => {
    switch (status) {
      case '진행': return styles.statusOngoing;
      case '완료': return styles.statusCompleted;
      case '지연': return styles.statusDelayed;
      default: return styles.statusDefault;
    }
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.projectTable}>
        <thead>
          <tr>
            <th style={{ width: '60px' }}>NO</th>
            <th>프로젝트 정보</th>
            <th style={{ width: '100px' }}>상태</th>
            <th style={{ width: '200px' }}>평균 달성률</th>
            <th style={{ width: '50px' }}></th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => {
            const kpiCount = p.kpi?.length || 0;
            const avg = kpiCount 
              ? (p.kpi.reduce((a, c) => a + c.progressRate, 0) / kpiCount).toFixed(1) 
              : 0;
            const isExpanded = expandedId === p.projectNo;

            return (
              <React.Fragment key={p.projectNo}>
                {/* 메인 행 */}
                <tr 
                  className={`${styles.projectRow} ${isExpanded ? styles.activeRow : ''}`} 
                  onClick={() => setExpandedId(isExpanded ? null : p.projectNo)}
                >
                  <td className={styles.textCenter}>{p.projectNo}</td>
                  <td>
                    <div className={styles.projectInfoCell}>
                      <span className={styles.projectName}>{p.projectNm}</span>
                      <span className={styles.kpiCountBadge}>KPI {kpiCount}건</span>
                    </div>
                  </td>
                  <td className={styles.textCenter}>
                    <span className={`${styles.statusBadge} ${getStatusClass(p.projectStatCd)}`}>
                      {p.projectStatCd}
                    </span>
                  </td>
                  <td>
                    <div className={styles.avgProgressWrapper}>
                      <div className={styles.miniProgressBar}>
                        <div 
                          className={styles.miniProgressFill} 
                          style={{ width: `${avg}%`, backgroundColor: avg >= 100 ? '#10b981' : '#3b82f6' }}
                        />
                      </div>
                      <span className={styles.avgText}>{avg}%</span>
                    </div>
                  </td>
                  <td className={styles.textCenter}>
                    {isExpanded ? <ChevronUp size={20} color="#666" /> : <ChevronDown size={20} color="#666" />}
                  </td>
                </tr>

                {/* 상세 KPI 그리드 (아코디언) */}
                {isExpanded && (
                  <tr className={styles.accordionRow}>
                    <td colSpan="5" className={styles.accordionContent}>
                      <div className={styles.expandedHeader}>
                        <Target size={16} /> <strong>세부 KPI 달성 현황</strong>
                      </div>
                      <div className={styles.viewOnlyKpiGrid}>
                        {kpiCount > 0 ? (
                          p.kpi.map((k) => (
                            <div key={k.kpiNo} className={styles.viewKpiCard}>
                              <div className={styles.viewKpiHeader}>
                                <span className={styles.kpiName}>{k.kpiNm}</span>
                                <span className={styles.kpiPercent}>{k.progressRate}%</span>
                              </div>
                              <div className={styles.progressBar}>
                                <div 
                                  className={styles.progressFill} 
                                  style={{ 
                                    width: `${k.progressRate}%`,
                                    backgroundColor: k.progressRate >= 100 ? '#059669' : k.progressRate >= 80 ? '#10b981' : '#3b82f6'
                                  }} 
                                />
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className={styles.noData}>등록된 KPI가 없습니다.</div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default KpiListTab;