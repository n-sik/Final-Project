import React from 'react';
// 아이콘이 필요 없으므로 Chevron 관련 import는 삭제해도 됩니다.
import styles from '../ProjectPerformance.module.css';

const ProjectTable = ({ projects, onRowClick }) => {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.mainTable}>
        <thead>
          <tr>
            {/* 정렬 관련 onClick과 sortConfig 참조를 모두 제거했습니다 */}
            <th>프로젝트명</th>
            <th>부서</th>
            <th>담당자</th>
            <th>상태</th>
            <th>종료일</th>
          </tr>
        </thead>
        <tbody>
          {/* projects가 null이거나 undefined일 경우를 대비해 옵셔널 체이닝 추가 */}
          {projects?.length > 0 ? (
            projects.map(p => (
              <tr 
                key={p.projectNo} 
                onClick={() => onRowClick(p)} 
                className={styles.clickableRow}
              >
                <td className={styles.projectName}>{p.projectNm}</td>
                <td>{p.deptNm}</td>
                <td>{p.regEmpNm}</td>
                <td>
                  <span className={`${styles.statusBadge} ${styles[p.projectStatCd]}`}>
                    {p.projectStatCd === 'END' ? '완료' : '진행'}
                  </span>
                </td>
                <td>{p.endDtm?.substring(0, 10)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                데이터가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectTable;