import React, { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCcw,
  Search,
  Users,
  X,
} from "lucide-react";

import {
  downloadApntHistExcel,
  downloadPromotionHistExcel,
  fetchApntHistList,
  fetchPromotionHistList,
} from "../../../../../api/historyWorkforceApi";

import styles from "./WorkforceHistory.module.css";

function todayYmd() {
  let d = new Date();
  let y = d.getFullYear();
  let m = String(d.getMonth() + 1).padStart(2, "0");
  let day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function monthAgoYmd() {
  let d = new Date();
  d.setMonth(d.getMonth() - 1);
  let y = d.getFullYear();
  let m = String(d.getMonth() + 1).padStart(2, "0");
  let day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function safeDateRange(startDate, endDate) {
  if (!startDate || !endDate) return null;
  try {
    let start = new Date(startDate);
    let end = new Date(endDate);
    let diff = end.getTime() - start.getTime();
    let days = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
    if (Number.isNaN(days)) return null;
    return days;
  } catch {
    return null;
  }
}
function monthLaterYmd() {
  let d = new Date();
  d.setMonth(d.getMonth() + 1);
  let y = d.getFullYear();
  let m = String(d.getMonth() + 1).padStart(2, "0");
  let day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildInitialFilters(tab) {
  let startDate = monthAgoYmd();
  let endDate = monthLaterYmd();

  if (tab === "PROMO") {
    return {
      startDate,
      endDate,
      empNm: "",
      procEmpNm: "",
      bfPosNm: "",
      afPosNm: "",
      promoRsn: "",
    };
  }

  return {
    startDate,
    endDate,
    empNm: "",
    procEmpNm: "",
    bfDeptNm: "",
    afDeptNm: "",
    apntRsn: "",
  };
}

function buildRowKey(activeTab, row) {
  if (activeTab === "PROMO") {
    return `${row.promoDt || ""}-${row.empNm || ""}-${row.procEmpNm || ""}-${row.bfPosNm || ""}-${row.afPosNm || ""}`;
  }
  return `${row.apntDt || ""}-${row.empNm || ""}-${row.procEmpNm || ""}-${row.bfDeptNm || ""}-${row.afDeptNm || ""}`;
}

function downloadBlob(response, fallbackName) {
  let blob = response?.data;
  if (!blob) return;

  let disposition = response?.headers?.["content-disposition"] || "";
  let matched = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  let filename = fallbackName;
  if (matched?.[1]) {
    filename = decodeURIComponent(matched[1]);
  }

  let url = window.URL.createObjectURL(blob);
  let link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export default function WorkforceHistory() {
  let [activeTab, setActiveTab] = useState("APNT");
  let [filters, setFilters] = useState(() => buildInitialFilters("APNT"));
  let [recordSize, setRecordSize] = useState(10);
  let [page, setPage] = useState(1);
  let [rows, setRows] = useState([]);
  let [paging, setPaging] = useState({ page: 1, size: 10, totalCount: 0, totalPageCount: 1, startPage: 1, endPage: 1, prev: false, next: false });
  let [loading, setLoading] = useState(false);
  let [errorMessage, setErrorMessage] = useState("");

  let [detailOpen, setDetailOpen] = useState(false);
  let [detailRow, setDetailRow] = useState(null);
  let [selectedRowKey, setSelectedRowKey] = useState("");

  let requestSeqRef = useRef(0);

  let canSearchHint = useMemo(() => {
    let days = safeDateRange(filters.startDate, filters.endDate);
    if (!days || days <= 31) return null;
    return `기간이 ${days}일입니다. 조회 범위가 넓으면 이력 조회 시간이 길어질 수 있습니다.`;
  }, [filters.endDate, filters.startDate]);

  useEffect(() => {
    setFilters(buildInitialFilters(activeTab));
    setRecordSize(10);
    setPage(1);
    setRows([]);
    setPaging({ page: 1, size: 10, totalCount: 0, totalPageCount: 1, startPage: 1, endPage: 1, prev: false, next: false });
    setErrorMessage("");
    setSelectedRowKey("");
    setDetailRow(null);
    setDetailOpen(false);
  }, [activeTab]);

  useEffect(() => {
    let timer = setTimeout(() => {
      loadList(1);
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filters, recordSize]);

  async function loadList(nextPage) {
    let targetPage = nextPage ?? page;
    let requestSeq = requestSeqRef.current + 1;
    requestSeqRef.current = requestSeq;
    setLoading(true);
    setErrorMessage("");

    try {
      let payload = { page: targetPage, size: recordSize, ...filters };
      let response = activeTab === "APNT" ? await fetchApntHistList(payload) : await fetchPromotionHistList(payload);
      if (requestSeq !== requestSeqRef.current) return;

      setRows(Array.isArray(response?.list) ? response.list : []);
      setPaging(response?.paging || { page: 1, size: recordSize, totalCount: 0, totalPageCount: 1, startPage: 1, endPage: 1, prev: false, next: false });
      setPage(targetPage);
    } catch (e) {
      console.error(e);
      if (requestSeq !== requestSeqRef.current) return;
      setErrorMessage("인력관리이력을 불러오지 못했습니다.");
      setRows([]);
      setPaging({ page: 1, size: recordSize, totalCount: 0, totalPageCount: 1, startPage: 1, endPage: 1, prev: false, next: false });
      setPage(1);
    } finally {
      if (requestSeq === requestSeqRef.current) {
        setLoading(false);
      }
    }
  }

  function handleFilterChange(name, value) {
    setFilters((prev) => {
      let next = { ...prev, [name]: value };
      if (name === "startDate" && next.endDate && value && value > next.endDate) {
        next.endDate = value;
      }
      if (name === "endDate" && next.startDate && value && value < next.startDate) {
        next.startDate = value;
      }
      return next;
    });
    setPage(1);
  }

  function resetFilters() {
    setFilters(buildInitialFilters(activeTab));
    setRecordSize(10);
    setPage(1);
    setErrorMessage("");
    setSelectedRowKey("");
    setDetailRow(null);
    setDetailOpen(false);
  }

  async function handleExcelDownload() {
    if ((paging?.totalCount ?? 0) <= 0) {
      alert("다운로드할 조회 결과가 없습니다.");
      return;
    }

    try {
      let response = activeTab === "APNT"
        ? await downloadApntHistExcel(filters)
        : await downloadPromotionHistExcel(filters);
      downloadBlob(response, activeTab === "APNT" ? "인사발령이력.xlsx" : "승진이력.xlsx");
    } catch (e) {
      console.error(e);
      alert("엑셀 다운로드 중 오류가 발생했습니다.");
    }
  }

  function openDetail(row) {
    setDetailRow(row);
    setSelectedRowKey(buildRowKey(activeTab, row));
    setDetailOpen(true);
  }

  function closeDetail() {
    setDetailOpen(false);
  }

  let pageNumbers = useMemo(() => {
    let numbers = [];
    for (let p = paging.startPage; p <= paging.endPage; p += 1) {
      numbers.push(p);
    }
    return numbers;
  }, [paging.endPage, paging.startPage]);

  let detailTitle = activeTab === "APNT" ? "인사발령 이력 상세" : "승진 이력 상세";
  let detailSummary = activeTab === "APNT"
    ? `${detailRow?.empNm || "-"}님의 부서 변경 이력입니다.`
    : `${detailRow?.empNm || "-"}님의 승진 처리 이력입니다.`;

  return (
    <div className={styles.wrap}>
      <div className={styles.headerCard}>
        <div className={styles.headerTitleBox}>
          <div className={styles.title}>인력관리이력</div>
          <div className={styles.subTitle}>인사발령과 승진 이력을 같은 화면 체계로 확인하고 필요한 조건으로 바로 찾을 수 있습니다.</div>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.tabs}>
            <button
              type="button"
              className={clsx(styles.tabBtn, activeTab === "APNT" && styles.tabBtnActive)}
              onClick={() => setActiveTab("APNT")}
              disabled={loading}
            >
              인사발령
            </button>
            <button
              type="button"
              className={clsx(styles.tabBtn, activeTab === "PROMO" && styles.tabBtnActive)}
              onClick={() => setActiveTab("PROMO")}
              disabled={loading}
            >
              승진관리
            </button>
          </div>

          <button type="button" className={clsx(styles.actionBtn, styles.primaryBtn)} onClick={() => loadList(1)} disabled={loading}>
            <Search size={15} /> 즉시조회
          </button>
          <button type="button" className={clsx(styles.actionBtn, styles.ghostBtn)} onClick={resetFilters} disabled={loading}>
            <RefreshCcw size={15} /> 초기화
          </button>
        </div>
      </div>

      <div className={styles.filterCard}>
        <div className={styles.filterGrid}>
          <div className={clsx(styles.filterItem, styles.filterItemPeriod)}>
            <label className={styles.filterLabel}>{activeTab === "APNT" ? "발생일자" : "발생일자"}</label>
            <div className={styles.dateRow}>
              <input className={styles.control} type="date" value={filters.startDate} onChange={(e) => handleFilterChange("startDate", e.target.value)} />
              <span className={styles.wave}>~</span>
              <input className={styles.control} type="date" value={filters.endDate} onChange={(e) => handleFilterChange("endDate", e.target.value)} />
            </div>
            <div className={styles.filterGuide}>※ 기본 설정은 오늘 기준 전·후 1개월입니다. 필요 시 기간을 변경해 조회해 주세요.</div>
          </div>

          <div className={styles.filterItem}>
            <label className={styles.filterLabel}>대상자</label>
            <input className={styles.control} type="text" value={filters.empNm} placeholder="예: 김인사" onChange={(e) => handleFilterChange("empNm", e.target.value)} />
          </div>

          <div className={styles.filterItem}>
            <label className={styles.filterLabel}>처리자</label>
            <input className={styles.control} type="text" value={filters.procEmpNm} placeholder="예: 관리자" onChange={(e) => handleFilterChange("procEmpNm", e.target.value)} />
          </div>

          {activeTab === "APNT" ? (
            <>
              <div className={styles.filterItem}>
                <label className={styles.filterLabel}>이전부서</label>
                <input className={styles.control} type="text" value={filters.bfDeptNm} placeholder="예: 인사팀" onChange={(e) => handleFilterChange("bfDeptNm", e.target.value)} />
              </div>
              <div className={styles.filterItem}>
                <label className={styles.filterLabel}>변경후부서</label>
                <input className={styles.control} type="text" value={filters.afDeptNm} placeholder="예: 총무팀" onChange={(e) => handleFilterChange("afDeptNm", e.target.value)} />
              </div>
              <div className={styles.filterItem}>
                <label className={styles.filterLabel}>발령사유</label>
                <input className={styles.control} type="text" value={filters.apntRsn} placeholder="예: 조직 개편" onChange={(e) => handleFilterChange("apntRsn", e.target.value)} />
              </div>
            </>
          ) : (
            <>
              <div className={styles.filterItem}>
                <label className={styles.filterLabel}>이전직급</label>
                <input className={styles.control} type="text" value={filters.bfPosNm} placeholder="예: 대리" onChange={(e) => handleFilterChange("bfPosNm", e.target.value)} />
              </div>
              <div className={styles.filterItem}>
                <label className={styles.filterLabel}>변경후직급</label>
                <input className={styles.control} type="text" value={filters.afPosNm} placeholder="예: 과장" onChange={(e) => handleFilterChange("afPosNm", e.target.value)} />
              </div>
              <div className={styles.filterItem}>
                <label className={styles.filterLabel}>승진사유</label>
                <input className={styles.control} type="text" value={filters.promoRsn} placeholder="예: 정기 승진" onChange={(e) => handleFilterChange("promoRsn", e.target.value)} />
              </div>
            </>
          )}
        </div>

        {canSearchHint ? <div className={styles.warnBox}>{canSearchHint}</div> : null}
        {errorMessage ? <div className={styles.warnBox}>{errorMessage}</div> : null}
      </div>

      <div className={styles.resultCard}>
        <div className={styles.resultHeader}>
          <div className={styles.resultTitle}>조회 결과</div>

          <div className={styles.resultTools}>
            <span className={styles.countTag}>총 <b>{paging?.totalCount ?? 0}</b>건</span>

            <div className={styles.pageSizeBox}>
              <span>페이지 크기</span>
              <select value={recordSize} onChange={(e) => setRecordSize(Number(e.target.value) || 10)}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <button type="button" className={clsx(styles.actionBtn, styles.ghostBtn)} onClick={handleExcelDownload} disabled={loading || (paging?.totalCount ?? 0) <= 0}>
              <Download size={16} /> Excel
            </button>
          </div>
        </div>

        <div className={styles.resultSection}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: 72 }}>번호</th>
                  <th style={{ width: 120 }}>발생일자</th>
                  <th style={{ width: 120 }}>대상자</th>
                  <th style={{ width: 150 }}>{activeTab === "APNT" ? "이전부서" : "이전직급"}</th>
                  <th style={{ width: 150 }}>{activeTab === "APNT" ? "변경후부서" : "변경후직급"}</th>
                  <th style={{ width: 260 }}>{activeTab === "APNT" ? "발령사유" : "승진사유"}</th>
                  <th style={{ width: 120 }}>처리자</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className={styles.emptyState}>불러오는 중...</td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={styles.emptyState}>조회된 내역이 없습니다.</td>
                  </tr>
                ) : (
                  rows.map((row, index) => {
                    let rowNo = ((paging?.page ?? page) - 1) * (paging?.size ?? recordSize) + index + 1;
                    let rowKey = buildRowKey(activeTab, row);
                    return (
                      <tr key={rowKey} className={clsx(styles.row, rowKey === selectedRowKey && styles.activeRow)} onClick={() => openDetail(row)}>
                        <td>{rowNo}</td>
                        <td>{activeTab === "APNT" ? row.apntDt || "-" : row.promoDt || "-"}</td>
                        <td>{row.empNm || "-"}</td>
                        <td>{activeTab === "APNT" ? row.bfDeptNm || "-" : row.bfPosNm || "-"}</td>
                        <td>{activeTab === "APNT" ? row.afDeptNm || "-" : row.afPosNm || "-"}</td>
                        <td className={styles.reasonCell}>{activeTab === "APNT" ? row.apntRsn || "-" : row.promoRsn || "-"}</td>
                        <td>{row.procEmpNm || "-"}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <div className={styles.pagingBar}>
            <button className={styles.pageBtn} disabled={!paging?.prev || loading} onClick={() => loadList((paging?.startPage ?? 1) - 1)}>
              <ChevronLeft size={16} />
            </button>
            {pageNumbers.map((p) => (
              <button key={p} className={clsx(styles.pageBtn, p === (paging?.page ?? page) && styles.pageBtnActive)} disabled={loading} onClick={() => loadList(p)}>
                {p}
              </button>
            ))}
            <button className={styles.pageBtn} disabled={!paging?.next || loading} onClick={() => loadList((paging?.endPage ?? 1) + 1)}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {detailOpen ? (
        <div className={styles.modalOverlay} onClick={closeDetail}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.modalTitle}>{detailTitle}</div>
                <div className={styles.modalSubTitle}>선택한 이력의 주요 정보를 항목별로 확인할 수 있습니다.</div>
              </div>
              <button type="button" className={styles.iconBtn} onClick={closeDetail}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {!detailRow ? (
                <div className={styles.modalState}>상세 데이터가 없습니다.</div>
              ) : (
                <>
                  <div className={styles.summaryBanner}>
                    <Users size={16} />
                    <span>{detailSummary}</span>
                  </div>

                  <div className={styles.detailGrid}>
                    <div className={styles.detailCard}>
                      <div className={styles.detailLabel}>발생일자</div>
                      <div className={styles.detailValue}>{activeTab === "APNT" ? detailRow.apntDt || "-" : detailRow.promoDt || "-"}</div>
                    </div>
                    <div className={styles.detailCard}>
                      <div className={styles.detailLabel}>대상자</div>
                      <div className={styles.detailValue}>{detailRow.empNm || "-"}</div>
                    </div>
                    <div className={styles.detailCard}>
                      <div className={styles.detailLabel}>이전 값</div>
                      <div className={styles.detailValue}>{activeTab === "APNT" ? detailRow.bfDeptNm || "-" : detailRow.bfPosNm || "-"}</div>
                    </div>
                    <div className={styles.detailCard}>
                      <div className={styles.detailLabel}>변경후 값</div>
                      <div className={styles.detailValue}>{activeTab === "APNT" ? detailRow.afDeptNm || "-" : detailRow.afPosNm || "-"}</div>
                    </div>
                    <div className={styles.detailCard}>
                      <div className={styles.detailLabel}>처리자</div>
                      <div className={styles.detailValue}>{detailRow.procEmpNm || "-"}</div>
                    </div>
                    <div className={styles.detailCard}>
                      <div className={styles.detailLabel}>변경 흐름</div>
                      <div className={styles.flowValue}>
                        <span>{activeTab === "APNT" ? detailRow.bfDeptNm || "-" : detailRow.bfPosNm || "-"}</span>
                        <ArrowRight size={16} />
                        <span>{activeTab === "APNT" ? detailRow.afDeptNm || "-" : detailRow.afPosNm || "-"}</span>
                      </div>
                    </div>
                    <div className={clsx(styles.detailCard, styles.detailWide)}>
                      <div className={styles.detailLabel}>{activeTab === "APNT" ? "발령사유" : "승진사유"}</div>
                      <div className={styles.detailValue}>{activeTab === "APNT" ? detailRow.apntRsn || "-" : detailRow.promoRsn || "-"}</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
