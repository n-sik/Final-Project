import React from 'react';
import styles from '../ResignStatus.module.css';

/**
 * 부서 목록 테이블 컴포넌트 (가운데 정렬 + 전체 부서 추가)
 */
const DeptStatusTable = ({ data, onDeptSelect, activeDept }) => {
  return (
    <div className={styles['table-wrapper']}>
      <table className={styles['dept-table']}>
        <thead>
          <tr>
            <th style={{ textAlign: 'center' }}>부서 목록</th>
          </tr>
        </thead>
        <tbody>
          {/* ✅ 1. '전체 부서' 항목을 수동으로 추가 */}
          <tr 
            className={activeDept === 'ALL' ? styles['selected-dept'] : ''}
            onClick={() => onDeptSelect('ALL')}
            style={{ cursor: 'pointer' }}
          >
            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>전체 부서</td>
          </tr>

          {/* ✅ 2. 서버에서 넘어온 부서 리스트 렌더링 */}
          {data && data.length > 0 ? (
            data.map((dept, index) => (
              <tr 
                key={dept.docWrtrDeptCd || index} 
                className={activeDept === dept.docWrtrDeptCd ? styles['selected-dept'] : ''}
                onClick={() => onDeptSelect(dept.docWrtrDeptCd)}
                style={{ cursor: 'pointer' }} 
              >
                <td style={{ textAlign: 'center' }}>{dept.deptNm}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className={styles['no-data']} style={{ textAlign: 'center', padding: '20px 0' }}>
                부서 정보를 불러오는 중...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DeptStatusTable;