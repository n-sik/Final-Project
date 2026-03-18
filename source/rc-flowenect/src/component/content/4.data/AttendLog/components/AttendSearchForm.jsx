import React from 'react';
import styles from '../AttendLog.module.css';

const AttendSearchForm = ({ searchParams, setSearchParams, onSearch, onExcelDownload }) => {

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 'Y' : 'N') : value
    }));
  };

  const handleReset = () => {
    setSearchParams(prev => ({
      empNo: prev.empNo,
      empNm: prev.empNm,
      startDate: '',
      endDate: '',
      status: '',
      lateOnly: 'N',
      autoOutOnly: 'N'
    }));
  };

  return (
    <div className={styles.searchBar}>
      {/* 사원 정보 */}
      <div className={styles.userChip}>
        <span className={styles.userDot} />
        <span className={styles.userName}>{searchParams.empNm || "미선택"}</span>
        {searchParams.empNo && (
          <span className={styles.userNo}>{searchParams.empNo}</span>
        )}
      </div>

      <div className={styles.divider} />

      {/* 기간 */}
      <div className={styles.fieldGroup}>
        <span className={styles.fieldLabel}>기간</span>
        <input type="date" name="startDate" className={styles.dateInput}
          value={searchParams.startDate} onChange={handleChange} />
        <span className={styles.sep}>~</span>
        <input type="date" name="endDate" className={styles.dateInput}
          value={searchParams.endDate} onChange={handleChange} />
      </div>

      <div className={styles.divider} />

      {/* 상태 */}
      <div className={styles.fieldGroup}>
        <span className={styles.fieldLabel}>상태</span>
        <select name="status" className={styles.select}
          value={searchParams.status} onChange={handleChange}>
          <option value="">전체</option>
          <option value="PRESENT">출근</option>
          <option value="LATE">지각</option>
          <option value="VACATION">휴가</option>
          <option value="ABSENT">결근</option>
        </select>
      </div>

      <div className={styles.divider} />

      {/* 토글 */}
      <div className={styles.toggleGroup}>
        <label className={styles.toggle}>
          <input type="checkbox" name="lateOnly"
            checked={searchParams.lateOnly === 'Y'} onChange={handleChange} />
          지각만
        </label>
        <label className={styles.toggle}>
          <input type="checkbox" name="autoOutOnly"
            checked={searchParams.autoOutOnly === 'Y'} onChange={handleChange} />
          퇴근누락
        </label>
      </div>

      {/* 버튼 */}
      <div className={styles.actions}>
        <button className={styles.resetBtn} onClick={handleReset}>초기화</button>
        <button className={styles.excelBtn} onClick={onExcelDownload}>엑셀 저장</button>
      </div>
    </div>
  );
};

export default AttendSearchForm;