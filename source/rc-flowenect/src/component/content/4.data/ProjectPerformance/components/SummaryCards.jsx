import { LayoutGrid, CheckCheck, LoaderCircle, OctagonX } from 'lucide-react';
import styles from '../ProjectPerformance.module.css';

const SummaryCards = ({ summary }) => {
  return (
    <div className={styles.summaryGrid}>
      <div className={styles.statCard}>
        <div className={`${styles.iconCircle} ${styles.blue}`}>
          <LayoutGrid size={28} strokeWidth={1.8} />
        </div>
        <div className={styles.statDetail}>
          <span>누적 프로젝트</span>
          <h3>{summary.total.toLocaleString()}개</h3>
        </div>
      </div>
      <div className={styles.statCard}>
        <div className={`${styles.iconCircle} ${styles.green}`}>
          <CheckCheck size={28} strokeWidth={1.8} />
        </div>
        <div className={styles.statDetail}>
          <span>최종 완료</span>
          <h3>{summary.end.toLocaleString()}개</h3>
        </div>
      </div>
      <div className={styles.statCard}>
        <div className={`${styles.iconCircle} ${styles.orange}`}>
          <LoaderCircle size={28} strokeWidth={1.8} />
        </div>
        <div className={styles.statDetail}>
          <span>진행 중</span>
          <h3>{summary.ing.toLocaleString()}개</h3>
        </div>
      </div>
      <div className={styles.statCard}>
        <div className={`${styles.iconCircle} ${styles.red}`}>
          <OctagonX size={28} strokeWidth={1.8} />
        </div>
        <div className={styles.statDetail}>
          <span>기한 초과</span>
          <h3>{summary.delay.toLocaleString()}개</h3>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;