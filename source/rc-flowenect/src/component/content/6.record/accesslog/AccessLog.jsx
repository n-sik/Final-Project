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
  downloadAccessLogExcel,
  fetchAccessLogDetail,
  fetchAccessLogFilterOptions,
  fetchAccessLogList,
} from "../../../../api/accessLogApi";

import styled from "./AccessLog.module.css";

function todayYmd() {
  let d = new Date();
  let y = d.getFullYear();
  let m = String(d.getMonth() + 1).padStart(2, "0");
  let day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDtm(v) {
  if (!v) return "-";

  let s = String(v);
  if (s.includes("T")) {
    let [d, tRaw] = s.split("T");
    let t = tRaw;
    if (t.includes("+")) t = t.split("+")[0];
    if (t.includes("Z")) t = t.replace("Z", "");
    if (t.includes(".")) t = t.split(".")[0];
    return `${d.replaceAll("-", "/")} ${t}`;
  }

  if (s.includes(" ")) {
    let [d, t] = s.split(" ");
    if (t.includes(".")) t = t.split(".")[0];
    return `${d.replaceAll("-", "/")} ${t}`;
  }

  return s;
}

function statusLabel(v) {
  if (!v) return "-";
  return v === "ACTIVE" ? "접속중" : "접속종료";
}

function statusClassName(v) {
  return v === "ACTIVE" ? styled.chipActive : styled.chipEnded;
}

function formatRemainMin(v) {
  if (v === undefined || v === null || v === "") return "-";
  let n = Number(v);
  if (Number.isNaN(n)) return "-";
  if (n < 0) return `${Math.abs(n)}분 경과`;
  if (n < 60) return `${n}분`;
  let h = Math.floor(n / 60);
  let m = n % 60;
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
}

function formatTimeoutSec(v) {
  if (v === undefined || v === null || v === "") return "-";
  let n = Number(v);
  if (Number.isNaN(n) || n <= 0) return "-";
  let min = Math.floor(n / 60);
  if (min < 60) return `${min}분`;
  let hour = Math.floor(min / 60);
  let remain = min % 60;
  return remain > 0 ? `${hour}시간 ${remain}분` : `${hour}시간`;
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
  let today = todayYmd();
  return {
    startDate: today,
    endDate: today,
    deptNm: "ALL",
    posCd: "ALL",
    empNm: "",
    empNo: "",
    statusCd: "ALL",
    logoutReason: "ALL",
    loginIp: "",
  };
}

function buildStatusSummaryText(data) {
  let statusText = statusLabel(data?.statusCd);
  return statusText !== "-" ? `현재 상태: ${statusText}` : "-";
}

export default function AccessLog() {
  let [filters, setFilters] = useState(buildInitialFilters);
  let [recordSize, setRecordSize] = useState(10);
  let [page, setPage] = useState(1);
  let [rows, setRows] = useState([]);
  let [paging, setPaging] = useState({ page: 1, recordSize: 10, totalCount: 0, totalPageCount: 1 });
  let [loading, setLoading] = useState(false);

  let [departments, setDepartments] = useState([]);
  let [positions, setPositions] = useState([]);

  let [detailOpen, setDetailOpen] = useState(false);
  let [detailLoading, setDetailLoading] = useState(false);
  let [detail, setDetail] = useState(null);
  let [selectedAccessLogNo, setSelectedAccessLogNo] = useState(null);

  let requestSeqRef = useRef(0);

  let canSearchHint = useMemo(() => {
    let days = safeDateRange(filters.startDate, filters.endDate);
    if (!days || days <= 7) return null;
    return `기간이 ${days}일입니다. 로그량이 많으면 조회 속도가 느려질 수 있습니다.`;
  }, [filters.endDate, filters.startDate]);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    let timer = setTimeout(() => {
      loadList(1);
    }, 250);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, recordSize]);

  async function loadFilterOptions() {
    try {
      let data = await fetchAccessLogFilterOptions();
      setDepartments(Array.isArray(data?.departments) ? data.departments : []);
      setPositions(Array.isArray(data?.positions) ? data.positions : []);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadList(nextPage) {
    let targetPage = nextPage ?? page;
    let requestSeq = requestSeqRef.current + 1;
    requestSeqRef.current = requestSeq;
    setLoading(true);

    try {
      let params = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        deptNm: filters.deptNm,
        posCd: filters.posCd,
        empNm: filters.empNm,
        empNo: filters.empNo,
        statusCd: filters.statusCd,
        logoutReason: filters.logoutReason,
        loginIp: filters.loginIp,
      };

      let res = await fetchAccessLogList({ page: targetPage, recordSize, params });
      if (requestSeq !== requestSeqRef.current) return;

      setRows(Array.isArray(res?.list) ? res.list : []);
      setPaging(res?.paging || { page: 1, recordSize, totalCount: 0, totalPageCount: 1 });
      setPage(targetPage);
    } catch (e) {
      console.error(e);
      if (requestSeq !== requestSeqRef.current) return;
      alert("로그 이력을 불러오지 못했습니다.");
      setRows([]);
      setPaging({ page: 1, recordSize, totalCount: 0, totalPageCount: 1 });
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
  }

  async function handleExcelDownload() {
    if ((paging?.totalCount ?? 0) <= 0) {
      alert("다운로드할 조회 결과가 없습니다.");
      return;
    }

    try {
      let res = await downloadAccessLogExcel({
        params: {
          startDate: filters.startDate,
          endDate: filters.endDate,
          deptNm: filters.deptNm,
          posCd: filters.posCd,
          empNm: filters.empNm,
          empNo: filters.empNo,
          statusCd: filters.statusCd,
          logoutReason: filters.logoutReason,
          loginIp: filters.loginIp,
        },
      });

      let disposition = res?.headers?.["content-disposition"] || res?.headers?.["Content-Disposition"] || "";
      let fileName = "접속이력.xlsx";
      let match = disposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
      if (match) {
        fileName = decodeURIComponent(match[1] || match[2] || fileName);
      }

      let blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      let url = window.URL.createObjectURL(blob);
      let a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("엑셀 파일을 다운로드하지 못했습니다.");
    }
  }

  async function openDetail(row) {
    if (!row?.accessLogNo) return;
    setSelectedAccessLogNo(row.accessLogNo);
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      let data = await fetchAccessLogDetail(row.accessLogNo);
      setDetail(data || row);
    } catch (e) {
      console.error(e);
      setDetail(row);
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDetail() {
    setDetailOpen(false);
    setDetail(null);
  }

  let pageNumbers = useMemo(() => {
    let start = paging?.startPage ?? 1;
    let end = paging?.endPage ?? (paging?.totalPageCount ?? 1);
    let arr = [];
    for (let p = start; p <= end; p += 1) arr.push(p);
    return arr;
  }, [paging?.endPage, paging?.startPage, paging?.totalPageCount]);

  return (
    <div className={styled.wrap}>
      <div className={styled.headerCard}>
        <div className={styled.headerTitleBox}>
          <div className={styled.title}>로그조회</div>
          <div className={styled.subTitle}>
            사원별 접속 이력과 종료 유형을 기간별로 조회할 수 있습니다.
          </div>
        </div>

        <div className={styled.headerActions}>
          <button className={clsx(styled.actionBtn, styled.primaryBtn)} onClick={() => loadList(1)} disabled={loading}>
            <Search size={15} /> 즉시조회
          </button>
          <button className={clsx(styled.actionBtn, styled.ghostBtn)} onClick={resetFilters} disabled={loading}>
            <RefreshCcw size={15} /> 초기화
          </button>
        </div>
      </div>

      <div className={styled.filterCard}>
        <div className={styled.filterGrid}>
          <div className={clsx(styled.filterItem, styled.filterItemPeriod)}>
            <label className={styled.filterLabel}>조회 기간</label>
            <div className={styled.dateRow}>
              <input
                className={styled.control}
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
              />
              <span className={styled.wave}>~</span>
              <input
                className={styled.control}
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
              />
            </div>
            <div className={styled.filterGuide}>※ 기본 설정은 당일 조회입니다. 필요 시 기간을 변경해 조회해 주세요.</div>
          </div>

          <div className={styled.filterItem}>
            <label className={styled.filterLabel}>상태</label>
            <select
              className={styled.control}
              value={filters.statusCd}
              onChange={(e) => handleFilterChange("statusCd", e.target.value)}
            >
              <option value="ALL">전체</option>
              <option value="ACTIVE">접속중</option>
              <option value="ENDED">접속종료</option>
            </select>
          </div>

          <div className={styled.filterItem}>
            <label className={styled.filterLabel}>부서</label>
            <select
              className={styled.control}
              value={filters.deptNm}
              onChange={(e) => handleFilterChange("deptNm", e.target.value)}
            >
              <option value="ALL">전체</option>
              {departments.map((dept) => (
                <option key={dept.deptCd || dept.deptNm} value={dept.deptNm}>
                  {dept.deptNm}
                </option>
              ))}
            </select>
          </div>

          <div className={styled.filterItem}>
            <label className={styled.filterLabel}>직위</label>
            <select
              className={styled.control}
              value={filters.posCd}
              onChange={(e) => handleFilterChange("posCd", e.target.value)}
            >
              <option value="ALL">전체</option>
              {positions.map((pos) => (
                <option key={pos.posCd} value={pos.posCd}>
                  {pos.posNm}
                </option>
              ))}
            </select>
          </div>

          <div className={styled.filterItem}>
            <label className={styled.filterLabel}>사원명</label>
            <input
              className={styled.control}
              type="text"
              placeholder="예: 김인사"
              value={filters.empNm}
              onChange={(e) => handleFilterChange("empNm", e.target.value)}
            />
          </div>

          <div className={styled.filterItem}>
            <label className={styled.filterLabel}>사원번호</label>
            <input
              className={styled.control}
              type="text"
              placeholder="예: 2025001"
              value={filters.empNo}
              onChange={(e) => handleFilterChange("empNo", e.target.value)}
            />
          </div>

          <div className={styled.filterItem}>
            <label className={styled.filterLabel}>접속 IP</label>
            <input
              className={styled.control}
              type="text"
              placeholder="예: 10.20.31"
              value={filters.loginIp}
              onChange={(e) => handleFilterChange("loginIp", e.target.value)}
            />
          </div>
        </div>

        {canSearchHint ? <div className={styled.warnBox}>{canSearchHint}</div> : null}
      </div>

      <div className={styled.resultCard}>
        <div className={styled.resultHeader}>
          <div className={styled.resultTitle}>조회 결과</div>

          <div className={styled.resultTools}>
            <span className={styled.countTag}>
              총 <b>{paging?.totalCount ?? 0}</b>건
            </span>

            <div className={styled.pageSizeBox}>
              <span>페이지 크기</span>
              <select value={recordSize} onChange={(e) => setRecordSize(Number(e.target.value) || 10)}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <button
              className={clsx(styled.actionBtn, styled.ghostBtn)}
              onClick={handleExcelDownload}
              disabled={loading || (paging?.totalCount ?? 0) <= 0}
            >
              <Download size={16} /> Excel
            </button>
          </div>
        </div>

        <div className={styled.resultSection}>
          <div className={styled.tableWrap}>
            <table className={styled.table}>
              <thead>
                <tr>
                  <th style={{ width: 72 }}>번호</th>
                  <th style={{ width: 96 }}>상태</th>
                  <th style={{ width: 130 }}>부서</th>
                  <th style={{ width: 90 }}>직위</th>
                  <th style={{ width: 100 }}>사원명</th>
                  <th style={{ width: 110 }}>사원번호</th>
                  <th style={{ width: 160 }}>로그인 시각</th>
                  <th style={{ width: 160 }}>로그아웃 시각</th>
                  <th style={{ width: 130 }}>접속 IP</th>
                  <th style={{ width: 120 }}>체류 시간</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className={styled.emptyState}>불러오는 중...</td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className={styled.emptyState}>조회된 내역이 없습니다.</td>
                  </tr>
                ) : (
                  rows.map((row, index) => {
                    let rowNo = ((paging?.page ?? page) - 1) * (paging?.recordSize ?? recordSize) + index + 1;
                    return (
                      <tr
                        key={row.accessLogNo}
                        className={clsx(styled.row, row.accessLogNo === selectedAccessLogNo && styled.activeRow)}
                        onClick={() => openDetail(row)}
                      >
                        <td>{rowNo}</td>
                        <td>
                          <span className={clsx(styled.chip, statusClassName(row.statusCd))}>
                            {statusLabel(row.statusCd)}
                          </span>
                        </td>
                        <td>{row.deptNm || "-"}</td>
                        <td>{row.posNm || row.posCd || "-"}</td>
                        <td>{row.empNm || "-"}</td>
                        <td>{row.empNo || "-"}</td>
                        <td>{formatDtm(row.loginDtm)}</td>
                        <td>{formatDtm(row.logoutDtm)}</td>
                        <td>{row.loginIp || "-"}</td>
                        <td>{formatRemainMin(row.stayMin)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styled.bottomBar}>
          <div className={styled.pagingBar}>
            <button
              className={styled.pageBtn}
              disabled={!paging?.prev}
              onClick={() => loadList((paging?.startPage ?? 1) - 1)}
            >
              <ChevronLeft size={16} />
            </button>

            {pageNumbers.map((p) => (
              <button
                key={p}
                className={clsx(styled.pageBtn, p === (paging?.page ?? page) && styled.pageBtnActive)}
                onClick={() => loadList(p)}
              >
                {p}
              </button>
            ))}

            <button
              className={styled.pageBtn}
              disabled={!paging?.next}
              onClick={() => loadList((paging?.endPage ?? 1) + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {detailOpen ? (
        <div className={styled.modalOverlay} onClick={closeDetail}>
          <div className={styled.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styled.modalHeader}>
              <div>
                <div className={styled.modalTitle}>로그 이력 상세</div>
                <div className={styled.modalSubTitle}>선택한 로그의 주요 정보를 항목별로 확인할 수 있습니다.</div>
              </div>

              <button className={styled.iconBtn} onClick={closeDetail}>
                <X size={18} />
              </button>
            </div>

            <div className={styled.modalBody}>
              {detailLoading ? (
                <div className={styled.modalState}>불러오는 중...</div>
              ) : !detail ? (
                <div className={styled.modalState}>상세 데이터가 없습니다.</div>
              ) : (
                <>
                  <div className={styled.summaryBanner}>
                    <ShieldCheck size={16} />
                    <span>{buildStatusSummaryText(detail)}</span>
                  </div>

                  <div className={styled.detailGrid}>
                    <div className={styled.detailCard}>
                      <div className={styled.detailLabel}>로그 번호</div>
                      <div className={styled.detailValue}>{detail.accessLogNo || "-"}</div>
                    </div>
                    <div className={styled.detailCard}>
                      <div className={styled.detailLabel}>상태</div>
                      <div className={styled.detailValue}>
                        <span className={clsx(styled.chip, statusClassName(detail.statusCd))}>
                          {statusLabel(detail.statusCd)}
                        </span>
                      </div>
                    </div>
                    <div className={styled.detailCard}>
                      <div className={styled.detailLabel}>부서</div>
                      <div className={styled.detailValue}>{detail.deptNm || "-"}</div>
                    </div>
                    <div className={styled.detailCard}>
                      <div className={styled.detailLabel}>직위</div>
                      <div className={styled.detailValue}>{detail.posNm || detail.posCd || "-"}</div>
                    </div>
                    <div className={styled.detailCard}>
                      <div className={styled.detailLabel}>사원명</div>
                      <div className={styled.detailValue}>{detail.empNm || "-"}</div>
                    </div>
                    <div className={styled.detailCard}>
                      <div className={styled.detailLabel}>사원번호</div>
                      <div className={styled.detailValue}>{detail.empNo || "-"}</div>
                    </div>
                    <div className={styled.detailCard}>
                      <div className={styled.detailLabel}>로그인 시각</div>
                      <div className={styled.detailValue}>{formatDtm(detail.loginDtm)}</div>
                    </div>
                    <div className={styled.detailCard}>
                      <div className={styled.detailLabel}>로그아웃 시각</div>
                      <div className={styled.detailValue}>{formatDtm(detail.logoutDtm)}</div>
                    </div>
                    <div className={styled.detailCard}>
                      <div className={styled.detailLabel}>접속 IP</div>
                      <div className={styled.detailValue}>{detail.loginIp || "-"}</div>
                    </div>
                    <div className={styled.detailCard}>
                      <div className={styled.detailLabel}>로그아웃 IP</div>
                      <div className={styled.detailValue}>{detail.logoutIp || "-"}</div>
                    </div>
                    <div className={styled.detailCard}>
                      <div className={styled.detailLabel}>체류 시간</div>
                      <div className={styled.detailValue}>{formatRemainMin(detail.stayMin)}</div>
                    </div>
                    <div className={styled.detailCard}>
                      <div className={styled.detailLabel}>세션 정책</div>
                      <div className={styled.detailValue}>{formatTimeoutSec(detail.sessionTimeoutSec)}</div>
                      <div className={styled.detailSubValue}>만료 예정 {formatDtm(detail.sessionExpDtm)}</div>
                    </div>
                    <div className={styled.detailCard}>
                      <div className={styled.detailLabel}>접속 종료 예정</div>
                      <div className={styled.detailValue}>{formatDtm(detail.accessExpireDtm)}</div>
                      <div className={styled.detailSubValue}>남은 시간 {formatRemainMin(detail.expireRemainMin)}</div>
                    </div>
                    <div className={clsx(styled.detailCard, styled.detailWide)}>
                      <div className={styled.detailLabel}>User-Agent</div>
                      <div className={styled.detailMono}>{detail.loginUa || "-"}</div>
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
