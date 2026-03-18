import React from 'react';
import styles from '../ResignStatus.module.css';

const RetireDetailModal = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <h2>퇴직 신청 상세 정보</h2>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </header>
        
        <div className={styles.modalBody}>
          <div className={styles.infoGroup}>
            <label>기안자 / 사번</label>
            <p>{data.docWrtrEmpNm || '관리자'} ({data.empNo || '-'})</p>
          </div>
          <div className={styles.infoGroup}>
            <label>부서</label>
            <p>{data.deptNm || '-'}</p>
          </div>
          <div className={styles.infoGroup}>
            <label>퇴직 예정일</label>
            <p>{data.expRetrDt ? data.expRetrDt.split(' ')[0] : '데이터 없음'}</p>
          </div>
          <div className={styles.infoGroup}>
            <label>퇴직 사유</label>
            <div className={styles.reasonBox}>
              {data.retrRsn || '등록된 사유가 없습니다.'}
            </div>
          </div>
          <div className={styles.infoGroup}>
            <label>신청 일시</label>
            {/* 💡 이 부분에서 에러가 났으므로 안전하게 수정 */}
            <p>{data.submitDtm ? data.submitDtm.replace('T', ' ') : '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetireDetailModal;