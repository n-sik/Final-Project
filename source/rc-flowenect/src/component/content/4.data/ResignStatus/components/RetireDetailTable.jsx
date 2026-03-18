import React from 'react';
import styles from '../ResignStatus.module.css';

/**
 * 💡 내부 컴포넌트: 상태 배지
 * 서버의 APPROVED, REJECTED, CANCEL 코드에 맞춰 매핑
 */
const StatusBadge = ({ code }) => {
  const STATUS_MAP = {
    APPROVED: { label: '승인', class: 'status-approve' },
    REJECTED: { label: '반려', class: 'status-reject' },
    CANCELED: { label: '취소', class: 'status-cancel' }, // ✅ CANCELED로 수정
    DRAFT:    { label: '임시저장', class: 'status-draft' }, // ✅ DRAFT 추가
    WAIT:     { label: '대기', class: 'status-wait' },
  };

  const status = STATUS_MAP[code] || { label: code || '미정', class: 'status-default' };

  return (
    <span className={`${styles['status-badge']} ${styles[status.class]}`}>
      {status.label}
    </span>
  );
};

/**
 * 💡 메인 컴포넌트: 상세 내역 테이블
 */
const RetireDetailTable = ({ list, loading, pagingInfo, searchParams, onRowClick }) => {
  return (
    <div className={styles['table-scroll-box']}>
      {loading ? (
        <div className={styles.loading}>데이터 동기화 중...</div>
      ) : (
        <table className={styles['data-table']}>
          <thead>
            <tr>
              <th style={{ textAlign: 'center' }}>No</th>
              <th style={{ textAlign: 'center' }}>사번</th>
              <th style={{ textAlign: 'center' }}>이름</th>
              <th style={{ textAlign: 'center' }}>퇴직예정일</th>
              <th style={{ textAlign: 'center' }}>상태</th>
            </tr>
          </thead>
          <tbody>
            {list && list.length > 0 ? (
              list.map((item, index) => {
                // 페이징 번호 계산 (역순이 아닌 일반 순번)
                const currentPage = searchParams?.page || 1;
                const recordSize = searchParams?.recordSize || 10;
                const displayNo = ((currentPage - 1) * recordSize) + index + 1;

                return (
                  <tr 
                    key={item.retrNo || index} 
                    onClick={() => onRowClick(item)} 
                    className={styles.clickableRow}
                    style={{ textAlign: 'center' }}
                  >
                    <td>{displayNo}</td>
                    <td>{item.empNo}</td>
                    <td>{item.docWrtrEmpNm || '관리자'}</td>
                    <td>{item.expRetrDt ? item.expRetrDt.split(' ')[0] : '-'}</td>
                    <td>
                      {/* 내부에서 정의한 StatusBadge 사용 */}
                      <StatusBadge code={item.procStatCd || item.statCd} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className={styles['empty-msg']} style={{ textAlign: 'center', padding: '40px 0' }}>
                  조회된 내역이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RetireDetailTable;