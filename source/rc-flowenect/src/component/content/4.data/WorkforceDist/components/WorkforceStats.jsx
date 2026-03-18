import React from 'react';
import styles from '../WorkforceDist.module.css';

const WorkforceStats = ({ data = [], total }) => {
  const stats = data.reduce((acc, cur) => {
    const status = (cur.stts || cur.empStatNm || '').toString().toUpperCase().trim();
    if (status === 'WORK' || status === '재직') acc.work++;
    else if (status === 'LEAVE' || status === '휴직') acc.leave++;
    else if (status === 'RESIGN' || status === '퇴사') acc.resign++;
    return acc;
  }, { work: 0, leave: 0, resign: 0 });

  const cardItems = [
    { title: '전체 인원', value: total, color: '#1e293b', label: '명' },
    { title: '재직', value: stats.work, color: '#10b981', label: '명' },
    { title: '휴직', value: stats.leave, color: '#f59e0b', label: '명' },
    { title: '퇴사', value: stats.resign, color: '#ef4444', label: '명' },
  ];

  return (
    <div className={styles.statsGrid}>
      {cardItems.map((card, idx) => (
        <div key={idx} className={styles.statCard} style={{ borderLeft: `5px solid ${card.color}` }}>
          <span className={styles.statTitle}>{card.title}</span>
          <div className={styles.valueGroup}>
            <span className={styles.statValue} style={{ color: card.color }}>{card.value.toLocaleString()}</span>
            <span className={styles.statLabel}>{card.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkforceStats;