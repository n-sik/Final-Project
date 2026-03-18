import React from 'react';
import styles from '../ResignStatus.module.css';

const StatCard = ({ title, count, type }) => {
  const cardClassName = `${styles['stat-card']} ${styles[`card-${type}`]}`;

  return (
    <div className={cardClassName}>
      <h4 className={styles['stat-title']}>{title}</h4>
      <p className={styles['stat-count']}>{count}건</p>
    </div>
  );
};

export default StatCard;