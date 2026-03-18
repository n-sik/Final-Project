import React, { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCcw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  downloadAprvHistExcel,
  fetchAprvFormTypes,
  fetchAprvHistDetail,
  fetchAprvHistList,
  fetchAprvStatusTypes,
} from "../../../../../api/historyAprvApi";

import styles from "./AprvHistory.module.css";

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

function buildInitialFilters() {
  return {
    startDate: monthAgoYmd(),
    endDate: todayYmd(),
    formCd: "ALL",
    empNm: "",
    aprvTtl: "",
    statCd: "ALL",
  };
}

function statClass(statCd) {
  let code = (statCd || "").toUpperCase();
  if (code === "APPROVED") return styles.statApproved;
  if (code === "REJECTED") return styles.statRejected;
  if (code === "IN_PROGRESS" || code === "SUBMITTED") return styles.statInProgress;
  if (code === "CANCELED" || code === "CANCEL") return styles.statCanceled;
  return styles.statDefault;
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

export default function AprvHistory() {
  let [filters, setFilters] = useState(buildInitialFilters);
  let [recordSize, setRecordSize] = useState(10);
  let [page, setPage] = useState(1);
  let [rows, setRows] = useState([]);
  let [paging, setPaging] = useState({ page: 1, size: 10, totalCount: 0, totalPageCount: 1, startPage: 1, endPage: 1, prev: false, next: false });
  let [loading, setLoading] = useState(false);
  let [errorMessage, setErrorMessage] = useState("");

  let [formOptions, setFormOptions] = useState([]);
  let [statusOptions, setStatusOptions] = useState([]);

  let [detailOpen, setDetailOpen] = useState(false);
  let [detailLoading, setDetailLoading] = useState(false);
  let [detail, setDetail] = useState(null);
  let [selectedAprvNo, setSelectedAprvNo] = useState(null);

  let requestSeqRef = useRef(0);

  let canSearchHint = useMemo(() => {
    let days = safeDateRange(filters.startDate, filters.endDate);
    if (!days || days <= 31) return null;
    return `기간이 ${days}일입니다. 조회 범위가 넓으면 이력 조회 시간이 길어질 수 있습니다.`;
  }, [filters.endDate, filters.startDate]);

  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    let timer = setTimeout(() => {
      loadList(1);
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, recordSize]);

  async function loadOptions() {
    try {
      let [forms, statuses] = await Promise.all([fetchAprvFormTypes(), fetchAprvStatusTypes()]);
      setFormOptions(Array.isArray(forms) ? forms : []);
      setStatusOptions(Array.isArray(statuses) ? statuses : []);
    } catch (e) {
      console.error(e);
      setFormOptions([]);
      setStatusOptions([]);
    }
  }

  async function loadList(nextPage) {
    let targetPage = nextPage ?? page;
    let requestSeq = requestSeqRef.current + 1;
    requestSeqRef.current = requestSeq;
    setLoading(true);
    setErrorMessage("");

    try {
      let response = await fetchAprvHistList({ page: targetPage, size: recordSize, ...filters });
      if (requestSeq !== requestSeqRef.current) return;
      setRows(Array.isArray(response?.list) ? response.list : []);
      setPaging(response?.paging || { page: 1, size: recordSize, totalCount: 0, totalPageCount: 1, startPage: 1, endPage: 1, prev: false, next: false });
      setPage(targetPage);
    } catch (e) {
      console.error(e);
      if (requestSeq !== requestSeqRef.current) return;
      setErrorMessage("전자결재이력을 불러오지 못했습니다.");
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
    setFilters(buildInitialFilters());
    setRecordSize(10);
    setPage(1);
    setErrorMessage("");
    setSelectedAprvNo(null);
    setDetail(null);
    setDetailOpen(false);
  }

  async function handleExcelDownload() {
    if ((paging?.totalCount ?? 0) <= 0) {
      alert("다운로드할 조회 결과가 없습니다.");
      return;
    }

    try {
      let response = await downloadAprvHistExcel(filters);
      downloadBlob(response, "전자결재이력.xlsx");
    } catch (e) {
      console.error(e);
      alert("엑셀 다운로드 중 오류가 발생했습니다.");
    }
  }

  async function openDetail(row) {
    if (!row?.aprvNo) return;
    setSelectedAprvNo(row.aprvNo);
    setDetailOpen(true);
    setDetailLoading(true);

    try {
      let response = await fetchAprvHistDetail(row.aprvNo);
      setDetail(response);
    } catch (e) {
      console.error(e);
      setDetail(null);
      alert("상세 정보를 불러오지 못했습니다.");
    } finally {
      setDetailLoading(false);
    }
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

  let summaryText = detail
    ? `문서 상태: ${detail.statNm || detail.statCd || "-"} / HR 반영: ${detail.hrApplyNm || detail.hrApplyYn || "-"}`
    : "-";

  return (
    <div className={styles.wrap}>
      <div className={styles.headerCard}>
        <div className={styles.headerTitleBox}>
          <div className={styles.title}>전자결재이력</div>
          <div className={styles.subTitle}>상신된 전자결재 문서를 동일한 조회 체계로 확인하고, 문서별 상세 내용까지 바로 점검할 수 있습니다.</div>
        </div>

        <div className={styles.headerActions}>
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
            <label className={styles.filterLabel}>상신일자</label>
            <div className={styles.dateRow}>
              <input className={styles.control} type="date" value={filters.startDate} onChange={(e) => handleFilterChange("startDate", e.target.value)} />
              <span className={styles.wave}>~</span>
              <input className={styles.control} type="date" value={filters.endDate} onChange={(e) => handleFilterChange("endDate", e.target.value)} />
            </div>
            <div className={styles.filterGuide}>※ 기본 설정은 최근 1개월 조회입니다. 필요 시 기간을 변경해 조회해 주세요.</div>
          </div>

          <div className={styles.filterItem}>
            <label className={styles.filterLabel}>결재양식</label>
            <select className={styles.control} value={filters.formCd} onChange={(e) => handleFilterChange("formCd", e.target.value)}>
              <option value="ALL">전체</option>
              {formOptions.map((option) => (
                <option key={option.code} value={option.code}>{option.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterItem}>
            <label className={styles.filterLabel}>기안자</label>
            <input className={styles.control} type="text" value={filters.empNm} placeholder="예: 김기안" onChange={(e) => handleFilterChange("empNm", e.target.value)} />
          </div>

          <div className={styles.filterItem}>
            <label className={styles.filterLabel}>문서제목</label>
            <input className={styles.control} type="text" value={filters.aprvTtl} placeholder="예: 인사발령 요청" onChange={(e) => handleFilterChange("aprvTtl", e.target.value)} />
          </div>

          <div className={styles.filterItem}>
            <label className={styles.filterLabel}>문서상태</label>
            <select className={styles.control} value={filters.statCd} onChange={(e) => handleFilterChange("statCd", e.target.value)}>
              <option value="ALL">전체</option>
              {statusOptions.map((option) => (
                <option key={option.code} value={option.code}>{option.name}</option>
              ))}
            </select>
          </div>
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
                  <th style={{ width: 120 }}>상신일자</th>
                  <th style={{ width: 140 }}>결재양식</th>
                  <th style={{ width: 120 }}>기안자</th>
                  <th style={{ width: 320 }}>문서제목</th>
                  <th style={{ width: 120 }}>문서상태</th>
                  <th style={{ width: 120 }}>최종확정일</th>
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
                    return (
                      <tr key={row.aprvNo || `${row.submitDtm}-${index}`} className={clsx(styles.row, row.aprvNo === selectedAprvNo && styles.activeRow)} onClick={() => openDetail(row)}>
                        <td>{rowNo}</td>
                        <td>{row.submitDtm || "-"}</td>
                        <td>{row.formNm || "-"}</td>
                        <td>{row.empNm || "-"}</td>
                        <td className={styles.titleCell}>{row.aprvTtl || "-"}</td>
                        <td>
                          <span className={clsx(styles.statBadge, statClass(row.statCd))}>{row.statNm || row.statCd || "-"}</span>
                        </td>
                        <td>{row.finalDtm || "-"}</td>
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
                <div className={styles.modalTitle}>전자결재 이력 상세</div>
                <div className={styles.modalSubTitle}>선택한 문서의 주요 정보를 항목별로 확인할 수 있습니다.</div>
              </div>
              <button type="button" className={styles.iconBtn} onClick={closeDetail}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {detailLoading ? (
                <div className={styles.modalState}>불러오는 중...</div>
              ) : !detail ? (
                <div className={styles.modalState}>상세 데이터가 없습니다.</div>
              ) : (
                <>
                  <div className={styles.summaryBanner}>
                    <ShieldCheck size={16} />
                    <span>{summaryText}</span>
                  </div>

                  <div className={styles.detailGrid}>
                    <div className={styles.detailCard}>
                      <div className={styles.detailLabel}>문서번호</div>
                      <div className={styles.detailValue}>{detail.aprvNo || "-"}</div>
                    </div>
                    <div className={styles.detailCard}>
                      <div className={styles.detailLabel}>상신일자</div>
                      <div className={styles.detailValue}>{detail.submitDtm || "-"}</div>
                    </div>
                    <div className={styles.detailCard}>
                      <div className={styles.detailLabel}>결재양식</div>
                      <div className={styles.detailValue}>{detail.formNm || "-"}</div>
                    </div>
                    <div className={styles.detailCard}>
                      <div className={styles.detailLabel}>문서상태</div>
                      <div className={styles.detailValue}><span className={clsx(styles.statBadge, statClass(detail.statCd))}>{detail.statNm || detail.statCd || "-"}</span></div>
                    </div>
                    <div className={styles.detailCard}>
                      <div className={styles.detailLabel}>기안자</div>
                      <div className={styles.detailValue}>{detail.empNm || "-"}</div>
                    </div>
                    <div className={styles.detailCard}>
                      <div className={styles.detailLabel}>최종확정일</div>
                      <div className={styles.detailValue}>{detail.finalDtm || "-"}</div>
                    </div>
                    <div className={styles.detailCard}>
                      <div className={styles.detailLabel}>작성부서</div>
                      <div className={styles.detailValue}>{detail.docWrtrDeptNm || "-"}</div>
                    </div>
                    <div className={styles.detailCard}>
                      <div className={styles.detailLabel}>작성직위</div>
                      <div className={styles.detailValue}>{detail.docWrtrPosNm || "-"}</div>
                    </div>
                    <div className={styles.detailCard}>
                      <div className={styles.detailLabel}>HR 반영 여부</div>
                      <div className={styles.detailValue}>{detail.hrApplyNm || detail.hrApplyYn || "-"}</div>
                    </div>
                    <div className={styles.detailCard}>
                      <div className={styles.detailLabel}>상태메모</div>
                      <div className={styles.detailValue}>{detail.docStatCmt || "-"}</div>
                    </div>
                    <div className={clsx(styles.detailCard, styles.detailWide)}>
                      <div className={styles.detailLabel}>문서제목</div>
                      <div className={styles.detailValue}>{detail.aprvTtl || "-"}</div>
                    </div>
                    <div className={clsx(styles.detailCard, styles.detailWide)}>
                      <div className={styles.detailLabel}>문서내용</div>
                      <div className={styles.detailValue}>{detail.aprvCn || "-"}</div>
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
