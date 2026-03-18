import React from "react";
import styles from "../AttendLog.module.css";

const AttendTable = ({ list }) => {
  const STATUS_CONFIG = {
    PRESENT: { label: "출근", class: styles.normal },
    LATE: { label: "지각", class: styles.late },
    VACATION: { label: "휴가", class: styles.vacation },
    ABSENT: { label: "결근", class: styles.absent },
  };

  const formatDateTime = (val, type) => {
    if (!val) return "-";
    const splitVal = val.split(" ");
    return type === "date" ? splitVal[0] : splitVal[1] || "-";
  };

  return (
    <div className={styles.container}>
      <div className={styles.tableCard}>
        <table className={styles.mainTable}>
          <thead>
            <tr>
              <th style={{ width: "20%" }}>날짜</th>
              <th style={{ width: "20%" }}>출근 시간</th>
              <th style={{ width: "20%" }}>퇴근 시간</th>
              <th style={{ width: "20%" }}>상태</th>
              <th style={{ width: "20%" }}>비고</th>
            </tr>
          </thead>
          <tbody>
            {list && list.length > 0 ? (
              list.map((item, idx) => {
                const inTime = formatDateTime(item.inDtm, "time");

                // 💡 지각 판별 로직 (24시간제 기준)
                // 00:00:00 ~ 09:00:00 사이면 정상
                // 09:10:00부터는 지각
                const isLateByTime = inTime !== "-" && inTime > "09:10:00";

                // 상태 결정
                // 시간상 9시를 넘었거나, DB 상태가 LATE인 경우에만 '지각' 배지 적용
                const status =
                  isLateByTime || item.attdStatCd === "LATE"
                    ? STATUS_CONFIG.LATE
                    : STATUS_CONFIG[item.attdStatCd];

                return (
                  <tr
                    key={idx}
                    className={
                      item.attdStatCd === "ABSENT" ? styles.absentRow : ""
                    }
                  >
                    <td className={styles.dateText}>
                      {formatDateTime(item.workDt, "date")}
                    </td>
                    <td>{inTime}</td>
                    <td>{formatDateTime(item.outDtm, "time")}</td>
                    <td>
                      {status && (
                        <span
                          className={`${styles.statusBadge} ${status.class}`}
                        >
                          {status.label}
                        </span>
                      )}
                    </td>
                    <td className={styles.remark}>
                      {/* 9시 이후 출근자만 비고란에 문구 표시 */}
                      {isLateByTime || item.attdStatCd === "LATE"
                        ? "입실 시간 초과"
                        : item.attdStatCd === "ABSENT"
                          ? "결근 처리됨"
                          : item.remark || "-"}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className={styles.noData}>
                  조회된 기록이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendTable;
