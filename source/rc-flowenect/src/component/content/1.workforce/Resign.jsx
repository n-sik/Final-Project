import React, { useState, useMemo, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, Search, Calendar, Loader2 } from "lucide-react";
import styles from "./Resign.module.css";
import clsx from "clsx";
import apiClient from "../../../api/apiClient";

// ━━━ 상수 ━━━
const STATUS_CONFIG = {
  APPROVED:   { cls: styles.statusWaiting,  dot: "#f5a623", label: "대기중"  },
  COMPLETED:  { cls: styles.statusDone,     dot: "#6366f1", label: "완료"    },
  REJECTED:   { cls: styles.statusRejected, dot: "#dc3545", label: "반려"    },
};

const isPending = (cd) => cd === "APPROVED";

const DEPT_MAP = {
  "2026HR01": "인사부서",
  "2026PD01": "생산제조부서",
  "2026DV01": "개발1부서",
  "2026DV02": "개발2부서",
  "2026PM01": "서비스기획부서",
  "2026CS01": "고객지원부서",
  "2026MK01": "마케팅부서",
  "2026SL01": "영업부서",
};
const deptName = (cd) => DEPT_MAP[cd] ?? cd;

const POS_MAP = {
  "POS_06": "대표",
  "POS_05": "부장",
  "POS_04": "차장",
  "POS_03": "과장",
  "POS_02": "대리",
  "POS_01": "사원",
};
const posName = (cd) => POS_MAP[cd] ?? cd;

const getToday    = () => new Date().toISOString().split("T")[0];
const getMonthAgo = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().split("T")[0];
};
const fmtDate = (val) => val ? String(val).slice(0, 10) : "-";

const ITEMS_PER_PAGE = 12;

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG["APPROVED"];
  return (
    <span className={clsx(styles.statusTag, cfg.cls)}>
      <span className={clsx(styles.statusDot)} style={{ background: cfg.dot }} />
      {cfg.label ?? status}
    </span>
  );
};

const Resign = () => {
  const [resignList, setResignList]       = useState([]);
  const [isLoading, setIsLoading]         = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedDetail, setDetail]       = useState(null);
  const [searchName, setSearchName]       = useState("");
  const [startDate, setStartDate]         = useState(getMonthAgo());
  const [endDate, setEndDate]             = useState(getToday());
  const [currentPage, setCurrentPage]     = useState(1);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get("/api/resign/readList");
      setResignList(response.data);
      return response.data;
    } catch (error) {
      console.error("퇴직 데이터 로딩 실패:", error);
      alert("데이터를 불러오는데 실패했습니다.");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredData = useMemo(() =>
    resignList
      .filter(item => {
        const matchName = (item.empNm || "").includes(searchName);
        const reqDate = fmtDate(item.reqDtm ?? item.submitDtm);
        const matchDate =
          (!startDate || reqDate >= startDate) &&
          (!endDate   || reqDate <= endDate);
        return matchName && matchDate;
      })
      .sort((a, b) =>
        isPending(a.statCd) === isPending(b.statCd)
          ? 0 : isPending(a.statCd) ? -1 : 1
      ),
  [resignList, searchName, startDate, endDate]);

  const { currentItems, totalPages } = useMemo(() => {
    const total    = Math.ceil(filteredData.length / ITEMS_PER_PAGE) || 1;
    const lastIdx  = currentPage * ITEMS_PER_PAGE;
    const firstIdx = lastIdx - ITEMS_PER_PAGE;
    return { currentItems: filteredData.slice(firstIdx, lastIdx), totalPages: total };
  }, [filteredData, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchName, startDate, endDate]);

  const stats = useMemo(() => ({
    total:    resignList.length,
    waiting:  resignList.filter(i => isPending(i.statCd)).length,
    approved: resignList.filter(i => i.statCd === "COMPLETED").length,
    rejected: resignList.filter(i => i.statCd === "REJECTED").length,
  }), [resignList]);

  const pendingInPage      = currentItems.filter(i => isPending(i.statCd));
  const allPendingSelected =
    pendingInPage.length > 0 &&
    pendingInPage.every(i => selectedItems.includes(i.aprvNo));

  const handleSelectAll  = (e) =>
    setSelectedItems(e.target.checked ? pendingInPage.map(i => i.aprvNo) : []);

  const handleSelectItem = (aprvNo) =>
    setSelectedItems(prev =>
      prev.includes(aprvNo) ? prev.filter(x => x !== aprvNo) : [...prev, aprvNo]
    );

  const handleProcess = async (procStatCd) => {
    if (!selectedItems.length) return alert("처리할 대상을 선택해주세요.");
    if (!window.confirm(`선택한 ${selectedItems.length}건을 ${procStatCd === "COMPLETED" ? "완료" : "반려"} 처리하시겠습니까?`)) return;
    try {
      await apiClient.post("/api/resign/approve/bulk", { aprvNos: selectedItems, statCd: procStatCd });
      await fetchData();
      setSelectedItems([]);
      setDetail(null);
      alert(`${procStatCd === "COMPLETED" ? "완료" : "반려"} 처리가 완료되었습니다.`);
    } catch (error) {
      console.error("처리 실패:", error);
      alert("처리에 실패했습니다.");
    }
  };

  const handleProcessOne = async (procStatCd, item) => {
    if (!window.confirm(`이 건을 ${procStatCd === "COMPLETED" ? "완료" : "반려"} 처리하시겠습니까?`)) return;
    try {
      await apiClient.post("/api/resign/approve/one", { aprvNo: item.aprvNo, statCd: procStatCd });
      const refreshed = await fetchData();
      const updated = refreshed.find(i => String(i.aprvNo) === String(item.aprvNo));
      setDetail(updated ?? { ...item, procStatCd });
      alert(`${procStatCd === "COMPLETED" ? "완료" : "반려"} 처리가 완료되었습니다.`);
    } catch (error) {
      console.error("처리 실패:", error);
      alert("처리에 실패했습니다.");
    }
  };

  return (
    <div className={clsx(styles.resignRoot)}>
      <div className={clsx(styles.resignPageHeader)}>
        <div>
          <div className={clsx(styles.resignPageTitle)}>퇴사 관리</div>
          <div className={clsx(styles.resignPageSub)}>전자결재 완료된 퇴직 요청 건을 최종 승인하거나 반려합니다</div>
        </div>
      </div>

      <div className={clsx(styles.resignBody)}>
        <div className={clsx(styles.resignLeft)}>
          <div className={clsx(styles.resignCard)}>

            <div className={clsx(styles.resignFilterBar)}>
              <div className={clsx(styles.filterGroup)}>
                <Calendar size={16} color="#8892a4" />
                <input type="date" className={clsx(styles.dateInput)}
                  value={startDate} onChange={e => setStartDate(e.target.value)} />
                <span style={{ color: "#b0b8c8", fontSize: 13 }}>~</span>
                <input type="date" className={clsx(styles.dateInput)}
                  value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
              <div className={clsx(styles.filterDivider)} />
              <div className={clsx(styles.searchInputWrapper)}>
                <Search size={15} />
                <input type="text" placeholder="사원명 검색"
                  value={searchName} onChange={e => setSearchName(e.target.value)} />
              </div>
              <div className={clsx(styles.filterActions)}>
                {selectedItems.length > 0 && (
                  <span className={clsx(styles.selectedBadge)}>{selectedItems.length}건 선택됨</span>
                )}
                <button className={clsx(styles.btnReject)} onClick={() => handleProcess("REJECTED")}>
                  <XCircle size={15} /> 반려
                </button>
                <button className={clsx(styles.btnApprove)} onClick={() => handleProcess("COMPLETED")}>
                  <CheckCircle size={15} /> 승인
                </button>
              </div>
            </div>

            <div className={clsx(styles.resignTableWrap)}>
              <table className={clsx(styles.resignTable)}>
                <thead>
                  <tr>
                    <th><input type="checkbox" onChange={handleSelectAll} checked={allPendingSelected} /></th>
                    <th>신청일</th>
                    <th>사원번호</th>
                    <th>사원명</th>
                    <th>소속</th>
                    <th>직급</th>
                    <th>퇴사예정일</th>
                    <th>퇴사사유</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan="9" className={clsx(styles.emptyRow)}>
                      <Loader2 className="animate-spin" style={{ margin: "0 auto" }} /> 데이터를 불러오는 중입니다...
                    </td></tr>
                  ) : currentItems.length === 0 ? (
                    <tr><td colSpan="9" className={clsx(styles.emptyRow)}>조회된 결과가 없습니다.</td></tr>
                  ) : currentItems.map(item => (
                    <tr key={item.aprvNo}
                      className={clsx(
                        selectedItems.includes(item.aprvNo) && styles.selectedRow,  // ✅ retrNo → aprvNo
                        !isPending(item.statCd) && styles.processedRow
                      )}
                      onClick={() => setDetail(item)}
                      style={{ cursor: "pointer" }}
                    >
                      <td onClick={e => e.stopPropagation()}>
                        {isPending(item.statCd) && (
                          <input type="checkbox"
                            checked={selectedItems.includes(item.aprvNo)}  // ✅ retrNo → aprvNo
                            onChange={() => handleSelectItem(item.aprvNo)} />
                        )}
                      </td>
                      <td>{fmtDate(item.reqDtm ?? item.submitDtm)}</td>
                      <td>{item.empNo}</td>
                      <td style={{ fontWeight: 600 }}>{item.empNm}</td>
                      <td>{deptName(item.deptCd)}</td>
                      <td>{posName(item.posCd)}</td>
                      <td className={clsx(styles.dateHighlight)}>{fmtDate(item.expRetrDt)}</td>
                      <td>{item.retrRsn}</td>
                      <td><StatusBadge status={item.statCd} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={clsx(styles.pagination)}>
              <button className={clsx(styles.pageBtn)}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}>이전</button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i}
                  className={clsx(styles.pageBtn, { [styles.active]: currentPage === i + 1 })}
                  onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
              ))}
              <button className={clsx(styles.pageBtn)}
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}>다음</button>
            </div>
          </div>
        </div>

        <div className={clsx(styles.resignRight)}>
          <div className={clsx(styles.resignStatsCard)}>
            <div className={clsx(styles.resignCardHeader)}>
              <span className={clsx(styles.resignCardTitle)}>현황 요약</span>
            </div>
            <div className={clsx(styles.resignStatsGrid)}>
              <div className={clsx(styles.statItem, styles.blue)}>
                <span className={clsx(styles.statNum)}>{stats.total}</span>
                <span className={clsx(styles.statLabel)}>전체 건수</span>
              </div>
              <div className={clsx(styles.statItem, styles.amber)}>
                <span className={clsx(styles.statNum)}>{stats.waiting}</span>
                <span className={clsx(styles.statLabel)}>대기중</span>
              </div>
              <div className={clsx(styles.statItem, styles.green)}>
                <span className={clsx(styles.statNum)}>{stats.approved}</span>
                <span className={clsx(styles.statLabel)}>승인 완료</span>
              </div>
              <div className={clsx(styles.statItem, styles.red)}>
                <span className={clsx(styles.statNum)}>{stats.rejected}</span>
                <span className={clsx(styles.statLabel)}>반려</span>
              </div>
            </div>
          </div>

          <div className={clsx(styles.resignDetailCard)}>
            <div className={clsx(styles.resignCardHeader)}>
              <span className={clsx(styles.resignCardTitle)}>상세 정보</span>
              {selectedDetail && <StatusBadge status={selectedDetail.statCd} />}
            </div>

            {!selectedDetail ? (
              <div className={clsx(styles.emptyDetail)}>
                목록에서 항목을 선택하면<br />상세 정보가 표시됩니다
              </div>
            ) : (
              <div className={clsx(styles.resignDetailBody)}>
                <div className={clsx(styles.detailRow)}>
                  <div className={clsx(styles.detailGroup)}>
                    <div className={clsx(styles.detailLabel)}>사원번호</div>
                    <div className={clsx(styles.detailValue)}>{selectedDetail.empNo}</div>
                  </div>
                  <div className={clsx(styles.detailGroup)}>
                    <div className={clsx(styles.detailLabel)}>사원명</div>
                    <div className={clsx(styles.detailValue)}>{selectedDetail.empNm}</div>
                  </div>
                </div>
                <div className={clsx(styles.detailGroup)}>
                  <div className={clsx(styles.detailLabel)}>소속</div>
                  <div className={clsx(styles.detailValue)}>{deptName(selectedDetail.deptCd)}</div>
                </div>
                <div className={clsx(styles.detailRow)}>
                  <div className={clsx(styles.detailGroup)}>
                    <div className={clsx(styles.detailLabel)}>직급</div>
                    <div className={clsx(styles.detailValue)}>{posName(selectedDetail.posCd)}</div>
                  </div>
                  <div className={clsx(styles.detailGroup)}>
                    <div className={clsx(styles.detailLabel)}>신청일</div>
                    <div className={clsx(styles.detailValue)}>{fmtDate(selectedDetail.reqDtm)}</div>
                  </div>
                </div>
                <div className={clsx(styles.detailGroup)}>
                  <div className={clsx(styles.detailLabel)}>퇴사예정일</div>
                  <div className={clsx(styles.detailValue, styles.detailValueRed)}>
                    {fmtDate(selectedDetail.expRetrDt)}
                  </div>
                </div>
                <div className={clsx(styles.detailGroup)}>
                  <div className={clsx(styles.detailLabel)}>퇴사사유</div>
                  <div className={clsx(styles.detailValue, styles.detailValueReason)}>
                    {selectedDetail.retrRsn}
                  </div>
                </div>

                {isPending(selectedDetail.statCd) && (
                  <div className={clsx(styles.detailActions)}>
                    <button className={clsx(styles.btnReject)}
                      style={{ flex: 1, justifyContent: "center" }}
                      onClick={() => handleProcessOne("REJECTED", selectedDetail)}>
                      <XCircle size={14} /> 반려
                    </button>
                    <button className={clsx(styles.btnApprove)}
                      style={{ flex: 1, justifyContent: "center" }}
                      onClick={() => handleProcessOne("COMPLETED", selectedDetail)}>
                      <CheckCircle size={14} /> 승인
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resign;