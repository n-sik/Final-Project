import React from 'react';
import { Target, ListChecks, TrendingUp } from 'lucide-react';
import styles from '../DeptKpiEval.module.css';

const SummaryCards = ({ projectsCount, totalKpis, avgProgress }) => {
  return (
    <div className={styles.summaryGrid}>
      <div className={styles.cardSmall}>
        <Target size={24} color="#1c7ed6" />
        <div>
          <p>프로젝트</p>
          <strong>{projectsCount}개</strong>
        </div>
      </div>
      <div className={styles.cardSmall}>
        <ListChecks size={24} color="#2b8a3e" />
        <div>
          <p>성과지표(KPI)</p>
          <strong>{totalKpis}개</strong>
        </div>
      </div>
      <div className={styles.cardSmall}>
        <TrendingUp size={24} color="#d9480f" />
        <div>
          <p>평균 달성률</p>
          <strong>{avgProgress}%</strong>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;