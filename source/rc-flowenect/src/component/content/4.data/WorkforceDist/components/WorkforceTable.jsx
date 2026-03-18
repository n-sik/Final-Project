import styles from '../WorkforceDist.module.css';

const WorkforceTable = ({ data }) => (
  <div className={styles.tableScroll}>
    <table className={styles.table}>
      <thead>
        <tr>
          <th>사번</th><th>성명</th><th>부서</th><th>직위</th><th>상태</th><th>입사일</th>
        </tr>
      </thead>
      <tbody>
        {data.map(emp => (
          <tr key={emp.empNo} className={styles.tr}>
            <td>{emp.empNo}</td>
            <td className={styles.tdBold}>{emp.empNm}</td>
            <td>{emp.deptNm}</td>
            <td><span className={styles.posBadge}>{emp.posNm}</span></td>
            <td><span className={styles.statusBadge} data-status={emp.empStatNm}>{emp.empStatNm}</span></td>
            <td>{emp.hireDt}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default WorkforceTable;