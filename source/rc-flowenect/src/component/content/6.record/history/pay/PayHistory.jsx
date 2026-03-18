import React, { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import * as XLSX from "xlsx";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCcw,
  Search,
  X,
} from "lucide-react";

import {
  fetchPayHistList,
  fetchPayHistoryFilterOptions,
  fetchPayrollHistoryDetail,
  fetchPayStepSetDetail,
} from "../../../../../api/historyPayApi";

import styles from "./PayHistory.module.css";

const TAB_LABELS = {
  EMP_BASE: "사원별 기준정보",
  EMP_ALLOW: "사원별 수당",
  POS_BASE: "직위별 기준금액",
  STEP_SET: "호봉 가산율",
  INSURANCE: "공제율",
  PAYROLL: "월별 급여처리/명세",
};

const TABS = [
  "EMP_BASE",
  "EMP_ALLOW",
  "POS_BASE",
  "STEP_SET",
  "INSURANCE",
  "PAYROLL",
];

const MONEY_KEYS = new Set([
  "baseAmt",
  "itemAmount",
  "stdAmt",
  "totalPayAmt",
  "totalDeductAmt",
  "netPayAmt",
]);

function currentMonth() {
  let d = new Date();
  let y = d.getFullYear();
  let m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function currentMonthRange() {
  let d = new Date();
  let y = d.getFullYear();
  let m = d.getMonth();
  let start = new Date(y, m, 1);
  let end = new Date(y, m + 1, 0);

  let toYmd = (value) => {
    let yy = value.getFullYear();
    let mm = String(value.getMonth() + 1).padStart(2, "0");
    let dd = String(value.getDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
  };

  return {
    startDate: toYmd(start),
    endDate: toYmd(end),
  };
}

function buildInitialFilters(tab) {
  let monthRange = currentMonthRange();

  if (tab === "PAYROLL") {
    let month = currentMonth();
    return {
      startDate: "",
      endDate: "",
      payMonthFrom: month,
      payMonthTo: month,
      deptNm: "ALL",
      posCd: "ALL",
      empNm: "",
      empNo: "",
      status: "ALL",
      bankName: "",
      salaryItemCode: "ALL",
      taxType: "ALL",
      confirmYn: "ALL",
    };
  }

  return {
    startDate: monthRange.startDate,
    endDate: monthRange.endDate,
    payMonthFrom: "",
    payMonthTo: "",
    deptNm: "ALL",
    posCd: "ALL",
    empNm: "",
    empNo: "",
    status: "ALL",
    bankName: "",
    salaryItemCode: "ALL",
    taxType: "ALL",
    confirmYn: "ALL",
  };
}

function formatDate(v) {
  if (!v) return "-";
  return String(v).replaceAll("-", "/");
}

function formatMonth(v) {
  if (!v) return "-";
  let s = String(v);
  if (s.length === 6) return `${s.slice(0, 4)}-${s.slice(4, 6)}`;
  return s;
}

function formatMoney(v) {
  if (v === undefined || v === null || v === "") return "-";
  let n = Number(v);
  if (Number.isNaN(n)) return "-";
  return n.toLocaleString();
}

function formatRate(v) {
  if (v === undefined || v === null || v === "") return "-";
  let n = Number(v);
  if (Number.isNaN(n)) return "-";
  return `${n}%`;
}

function maskAccount(v) {
  if (!v) return "-";
  let s = String(v);
  if (s.length <= 4) return s;
  return `${s.slice(0, 3)}****${s.slice(-4)}`;
}

function statusLabel(v) {
  if (v === "CURRENT") return "현재 적용";
  if (v === "ENDED") return "종료";
  return v || "-";
}

function confirmLabel(v) {
  return v === "Y" ? "확정" : "미확정";
}

function payTypeLabel(v) {
  if (v === "PAY") return "지급";
  if (v === "DEDUCT") return "공제";
  if (v === "TOTAL") return "합계";
  return v || "-";
}

function toYm(value) {
  if (!value) return "";
  return String(value).replaceAll("-", "");
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

function safeMonthRange(startMonth, endMonth) {
  if (!startMonth || !endMonth) return null;
  try {
    let [startY, startM] = String(startMonth).split("-").map(Number);
    let [endY, endM] = String(endMonth).split("-").map(Number);
    if ([startY, startM, endY, endM].some((v) => Number.isNaN(v))) return null;
    return (endY - startY) * 12 + (endM - startM) + 1;
  } catch {
    return null;
  }
}

function pageNumbersFromPaging(paging) {
  let start = paging?.startPage ?? 1;
  let end = paging?.endPage ?? paging?.totalPageCount ?? 1;
  let arr = [];
  for (let p = start; p <= end; p += 1) arr.push(p);
  return arr;
}

function makeSheetFromAoA(rows, widths = []) {
  let ws = XLSX.utils.aoa_to_sheet(rows);
  if (widths.length > 0) {
    ws["!cols"] = widths.map((wch) => ({ wch }));
  }
  if (rows.length >= 1 && rows[0].length >= 1) {
    let endRef = XLSX.utils.encode_cell({ r: 0, c: rows[0].length - 1 });
    ws["!autofilter"] = { ref: `A1:${endRef}` };
  }
  return ws;
}

function downloadWorkbook(filename, sheets) {
  let wb = XLSX.utils.book_new();
  sheets.forEach((sheet) => {
    XLSX.utils.book_append_sheet(wb, sheet.ws, sheet.name);
  });
  XLSX.writeFile(wb, filename);
}

function columnsForTab(tab) {
  switch (tab) {
    case "EMP_ALLOW":
      return [
        { key: "rowNo", label: "번호", width: 72 },
        { key: "status", label: "상태", width: 96 },
        { key: "deptNm", label: "부서", width: 130 },
        { key: "posNm", label: "직위", width: 100 },
        { key: "empNm", label: "사원명", width: 100 },
        { key: "empNo", label: "사원번호", width: 110 },
        { key: "salaryItemName", label: "수당명", width: 130 },
        { key: "taxType", label: "과세구분", width: 96 },
        { key: "itemAmount", label: "금액", width: 126 },
        { key: "startDtm", label: "적용시작일", width: 120 },
        { key: "endDtm", label: "적용종료일", width: 120 },
      ];
    case "POS_BASE":
      return [
        { key: "rowNo", label: "번호", width: 72 },
        { key: "status", label: "상태", width: 96 },
        { key: "posNm", label: "직위", width: 150 },
        { key: "stdAmt", label: "기준금액", width: 150 },
        { key: "startDtm", label: "적용시작일", width: 130 },
        { key: "endDtm", label: "적용종료일", width: 130 },
      ];
    case "STEP_SET":
      return [
        { key: "rowNo", label: "번호", width: 72 },
        { key: "status", label: "상태", width: 96 },
        { key: "useYn", label: "사용여부", width: 100 },
        { key: "startDtm", label: "적용시작일", width: 130 },
        { key: "endDtm", label: "적용종료일", width: 130 },
        { key: "stepCount", label: "호봉 수", width: 100 },
        { key: "createdDtm", label: "등록일", width: 120 },
      ];
    case "INSURANCE":
      return [
        { key: "rowNo", label: "번호", width: 72 },
        { key: "status", label: "상태", width: 96 },
        { key: "pensionRate", label: "국민연금", width: 110 },
        { key: "healthRate", label: "건강보험", width: 110 },
        { key: "employRate", label: "고용보험", width: 110 },
        { key: "careRate", label: "장기요양", width: 110 },
        { key: "incomeTaxRate", label: "소득세", width: 110 },
        { key: "localTaxRate", label: "지방소득세", width: 120 },
        { key: "startDtm", label: "적용시작일", width: 120 },
        { key: "endDtm", label: "적용종료일", width: 120 },
      ];
    case "PAYROLL":
      return [
        { key: "rowNo", label: "번호", width: 72 },
        { key: "payYyyymm", label: "급여월", width: 100 },
        { key: "confirmYn", label: "확정여부", width: 100 },
        { key: "deptNm", label: "부서", width: 130 },
        { key: "posNm", label: "직위", width: 100 },
        { key: "empNm", label: "사원명", width: 100 },
        { key: "empNo", label: "사원번호", width: 110 },
        { key: "totalPayAmt", label: "총지급액", width: 126 },
        { key: "totalDeductAmt", label: "총공제액", width: 126 },
        { key: "netPayAmt", label: "실지급액", width: 126 },
        { key: "createdDtm", label: "생성일시", width: 140 },
      ];
    case "EMP_BASE":
    default:
      return [
        { key: "rowNo", label: "번호", width: 72 },
        { key: "status", label: "상태", width: 96 },
        { key: "deptNm", label: "부서", width: 130 },
        { key: "posNm", label: "직위", width: 100 },
        { key: "empNm", label: "사원명", width: 100 },
        { key: "empNo", label: "사원번호", width: 110 },
        { key: "baseAmt", label: "기준급", width: 126 },
        { key: "bankName", label: "은행", width: 100 },
        { key: "accntNo", label: "계좌번호", width: 140 },
        { key: "startDtm", label: "적용시작일", width: 120 },
        { key: "endDtm", label: "적용종료일", width: 120 },
      ];
  }
}

function getCellText(key, row, rowNo) {
  if (key === "rowNo") return rowNo;
  if (key === "status") return statusLabel(row.status);
  if (key === "confirmYn") return confirmLabel(row.confirmYn);
  if (key === "payYyyymm") return formatMonth(row.payYyyymm);
  if (MONEY_KEYS.has(key)) return formatMoney(row[key]);
  if (["pensionRate", "healthRate", "employRate", "careRate", "incomeTaxRate", "localTaxRate"].includes(key)) {
    return formatRate(row[key]);
  }
  if (key === "accntNo") return maskAccount(row.accntNo);
  if (key === "useYn") return row.useYn === "Y" ? "사용" : "미사용";
  return row[key] || "-";
}

function listExportRowsForTab(tab, rows) {
  let columns = columnsForTab(tab);
  return rows.map((row, index) => columns.map((col) => getCellText(col.key, row, index + 1)));
}

function detailSheetHeaders(tab) {
  switch (tab) {
    case "EMP_ALLOW":
      return ["번호", "상태", "부서", "직위", "사원명", "사원번호", "수당명", "수당코드", "구분", "과세구분", "금액", "적용시작일", "적용종료일"];
    case "POS_BASE":
      return ["번호", "상태", "직위", "기준금액", "적용시작일", "적용종료일"];
    case "STEP_SET":
      return ["번호", "상태", "사용여부", "적용시작일", "적용종료일", "호봉", "가산율", "등록일"];
    case "INSURANCE":
      return ["번호", "상태", "국민연금율", "건강보험율", "고용보험율", "장기요양율", "소득세율", "지방소득세율", "적용시작일", "적용종료일"];
    case "PAYROLL":
      return ["번호", "급여월", "확정여부", "부서", "직위", "사원명", "사원번호", "총지급액", "총공제액", "실지급액", "생성일시", "구분", "항목명", "항목코드", "금액", "과세여부"];
    case "EMP_BASE":
    default:
      return ["번호", "상태", "부서", "직위", "사원명", "사원번호", "기준급", "은행", "계좌번호", "부양가족수", "호봉", "조정사유", "적용시작일", "적용종료일"];
  }
}

function buildDetailExportRows(tab, detailResults) {
  let rows = [];

  detailResults.forEach((entry) => {
    let rowNo = entry.rowNo;
    let row = entry.row;

    if (tab === "EMP_ALLOW") {
      rows.push([
        rowNo,
        statusLabel(row.status),
        row.deptNm || "-",
        row.posNm || "-",
        row.empNm || "-",
        row.empNo || "-",
        row.salaryItemName || "-",
        row.salaryItemCode || "-",
        row.itemType || "-",
        row.taxType || "-",
        formatMoney(row.itemAmount),
        row.startDtm || "-",
        row.endDtm || "-",
      ]);
      return;
    }

    if (tab === "POS_BASE") {
      rows.push([
        rowNo,
        statusLabel(row.status),
        row.posNm || "-",
        formatMoney(row.stdAmt),
        row.startDtm || "-",
        row.endDtm || "-",
      ]);
      return;
    }

    if (tab === "STEP_SET") {
      let items = Array.isArray(entry.items) ? entry.items : [];
      if (items.length === 0) {
        rows.push([
          rowNo,
          statusLabel(row.status),
          row.useYn === "Y" ? "사용" : "미사용",
          row.startDtm || "-",
          row.endDtm || "-",
          "-",
          "-",
          "-",
        ]);
      } else {
        items.forEach((item) => {
          rows.push([
            rowNo,
            statusLabel(row.status),
            row.useYn === "Y" ? "사용" : "미사용",
            row.startDtm || "-",
            row.endDtm || "-",
            item.salaryStep ?? "-",
            formatRate(item.increaseRate),
            item.createdDtm || "-",
          ]);
        });
      }
      return;
    }

    if (tab === "INSURANCE") {
      rows.push([
        rowNo,
        statusLabel(row.status),
        formatRate(row.pensionRate),
        formatRate(row.healthRate),
        formatRate(row.employRate),
        formatRate(row.careRate),
        formatRate(row.incomeTaxRate),
        formatRate(row.localTaxRate),
        row.startDtm || "-",
        row.endDtm || "-",
      ]);
      return;
    }

    if (tab === "PAYROLL") {
      let data = entry.data || {};
      let items = Array.isArray(data.items) ? data.items : [];
      if (items.length === 0) {
        rows.push([
          rowNo,
          formatMonth(row.payYyyymm),
          confirmLabel(row.confirmYn),
          row.deptNm || "-",
          row.posNm || "-",
          row.empNm || "-",
          row.empNo || "-",
          formatMoney(row.totalPayAmt),
          formatMoney(row.totalDeductAmt),
          formatMoney(row.netPayAmt),
          row.createdDtm || "-",
          "-",
          "-",
          "-",
          "-",
          "-",
        ]);
      } else {
        items.forEach((item) => {
          rows.push([
            rowNo,
            formatMonth(row.payYyyymm),
            confirmLabel(row.confirmYn),
            row.deptNm || "-",
            row.posNm || "-",
            row.empNm || "-",
            row.empNo || "-",
            formatMoney(row.totalPayAmt),
            formatMoney(row.totalDeductAmt),
            formatMoney(row.netPayAmt),
            row.createdDtm || "-",
            payTypeLabel(item.itemTypeCd),
            item.itemName || "-",
            item.itemCode || "-",
            formatMoney(item.amount),
            item.taxableYn === "Y" ? "과세" : item.taxableYn === "N" ? "비과세" : "-",
          ]);
        });
      }
      return;
    }

    rows.push([
      rowNo,
      statusLabel(row.status),
      row.deptNm || "-",
      row.posNm || "-",
      row.empNm || "-",
      row.empNo || "-",
      formatMoney(row.baseAmt),
      row.bankName || "-",
      maskAccount(row.accntNo),
      row.deductFamCnt ?? "-",
      row.salaryGrade ?? "-",
      row.adjustRsn || "-",
      row.startDtm || "-",
      row.endDtm || "-",
    ]);
  });

  return rows;
}

export default function PayHistory() {
  let [activeTab, setActiveTab] = useState("EMP_BASE");
  let [filters, setFilters] = useState(buildInitialFilters("EMP_BASE"));
  let [recordSize, setRecordSize] = useState(10);
  let [page, setPage] = useState(1);
  let [rows, setRows] = useState([]);
  let [paging, setPaging] = useState({
    page: 1,
    size: 10,
    totalCount: 0,
    totalPageCount: 1,
    startPage: 1,
    endPage: 1,
    prev: false,
    next: false,
  });
  let [loading, setLoading] = useState(false);
  let [excelLoading, setExcelLoading] = useState(false);
  let [error, setError] = useState("");

  let [departments, setDepartments] = useState([]);
  let [positions, setPositions] = useState([]);
  let [salaryItems, setSalaryItems] = useState([]);

  let [detailOpen, setDetailOpen] = useState(false);
  let [detailLoading, setDetailLoading] = useState(false);
  let [detail, setDetail] = useState(null);
  let [selectedKey, setSelectedKey] = useState(null);

  let requestSeqRef = useRef(0);

  let columns = useMemo(() => columnsForTab(activeTab), [activeTab]);
  let pageNumbers = useMemo(() => pageNumbersFromPaging(paging), [paging]);
  let filterGuideText = useMemo(() => {
    if (activeTab === "PAYROLL") {
      return "※ 기본 설정은 이번 달 급여월 조회입니다. 필요 시 급여월 범위를 변경해 조회해 주세요.";
    }
    return "※ 기본 설정은 이번 달 조회입니다. 필요 시 적용 기간을 변경해 조회해 주세요.";
  }, [activeTab]);
  let canSearchHint = useMemo(() => {
    if (activeTab === "PAYROLL") {
      let months = safeMonthRange(filters.payMonthFrom, filters.payMonthTo);
      if (!months || months <= 3) return null;
      return `급여월 범위가 ${months}개월입니다. 조회량이 많으면 조회 속도가 느려질 수 있습니다.`;
    }

    let days = safeDateRange(filters.startDate, filters.endDate);
    if (!days || days <= 31) return null;
    return `적용 기간이 ${days}일입니다. 조회량이 많으면 조회 속도가 느려질 수 있습니다.`;
  }, [activeTab, filters.endDate, filters.payMonthFrom, filters.payMonthTo, filters.startDate]);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    let timer = setTimeout(() => {
      loadList(1);
    }, 250);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filters, recordSize]);

  async function loadFilterOptions() {
    try {
      let data = await fetchPayHistoryFilterOptions();
      setDepartments(Array.isArray(data?.departments) ? data.departments : []);
      setPositions(Array.isArray(data?.positions) ? data.positions : []);
      setSalaryItems(Array.isArray(data?.salaryItems) ? data.salaryItems : []);
    } catch (e) {
      console.error(e);
    }
  }

  function normalizedPayload(targetPage, sizeOverride) {
    return {
      tab: activeTab,
      page: targetPage,
      size: sizeOverride ?? recordSize,
      startDate: filters.startDate,
      endDate: filters.endDate,
      payMonthFrom: toYm(filters.payMonthFrom),
      payMonthTo: toYm(filters.payMonthTo),
      deptNm: filters.deptNm,
      posCd: filters.posCd,
      empNm: filters.empNm,
      empNo: filters.empNo,
      status: filters.status,
      bankName: filters.bankName,
      salaryItemCode: filters.salaryItemCode,
      taxType: filters.taxType,
      confirmYn: filters.confirmYn,
    };
  }

  async function loadList(nextPage) {
    let targetPage = nextPage ?? page;
    let requestSeq = requestSeqRef.current + 1;
    requestSeqRef.current = requestSeq;
    setLoading(true);
    setError("");

    try {
      let res = await fetchPayHistList(normalizedPayload(targetPage));
      if (requestSeq !== requestSeqRef.current) return;

      setRows(Array.isArray(res?.list) ? res.list : []);
      setPaging(
        res?.paging || {
          page: 1,
          size: recordSize,
          totalCount: 0,
          totalPageCount: 1,
          startPage: 1,
          endPage: 1,
          prev: false,
          next: false,
        }
      );
      setPage(targetPage);
    } catch (e) {
      console.error(e);
      if (requestSeq !== requestSeqRef.current) return;
      setError("급여관리 이력을 불러오지 못했습니다.");
      setRows([]);
      setPaging({
        page: 1,
        size: recordSize,
        totalCount: 0,
        totalPageCount: 1,
        startPage: 1,
        endPage: 1,
        prev: false,
        next: false,
      });
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
      if (name === "payMonthFrom" && next.payMonthTo && value && value > next.payMonthTo) {
        next.payMonthTo = value;
      }
      if (name === "payMonthTo" && next.payMonthFrom && value && value < next.payMonthFrom) {
        next.payMonthFrom = value;
      }

      return next;
    });
    setPage(1);
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
    setFilters(buildInitialFilters(tab));
    setRecordSize(10);
    setPage(1);
    setRows([]);
    setPaging({
      page: 1,
      size: 10,
      totalCount: 0,
      totalPageCount: 1,
      startPage: 1,
      endPage: 1,
      prev: false,
      next: false,
    });
    setDetailOpen(false);
    setDetail(null);
    setSelectedKey(null);
    setError("");
  }

  function resetFilters() {
    setFilters(buildInitialFilters(activeTab));
    setRecordSize(10);
    setPage(1);
    setError("");
  }

  async function fetchAllRowsForExport() {
    let total = paging?.totalCount ?? 0;
    if (total <= 0) return [];

    let pageSize = 100;
    let totalPages = Math.max(1, Math.ceil(total / pageSize));
    let allRows = [];

    for (let p = 1; p <= totalPages; p += 1) {
      let res = await fetchPayHistList(normalizedPayload(p, pageSize));
      allRows = allRows.concat(Array.isArray(res?.list) ? res.list : []);
      if (allRows.length >= total) break;
    }

    return allRows;
  }

  async function fetchDetailForExport(row, rowNo) {
    if (activeTab === "STEP_SET") {
      let items = await fetchPayStepSetDetail(row.startDtm);
      return { rowNo, row, items: Array.isArray(items) ? items : [] };
    }

    if (activeTab === "PAYROLL") {
      let data = await fetchPayrollHistoryDetail(row.payrollNo);
      return { rowNo, row, data: data || {} };
    }

    return { rowNo, row };
  }

  async function handleExcelDownload() {
    if ((paging?.totalCount ?? 0) <= 0) {
      setError("다운로드할 조회 결과가 없습니다.");
      return;
    }

    setExcelLoading(true);
    setError("");

    try {
      let exportRows = await fetchAllRowsForExport();
      let listColumns = columnsForTab(activeTab);
      let listAoA = [
        listColumns.map((col) => col.label),
        ...listExportRowsForTab(activeTab, exportRows),
      ];
      let listWidths = listColumns.map((col) => Math.max(Math.floor((col.width || 120) / 7), 12));

      let detailResults = await Promise.all(
        exportRows.map((row, index) => fetchDetailForExport(row, index + 1))
      );
      let detailHeaders = detailSheetHeaders(activeTab);
      let detailAoA = [detailHeaders, ...buildDetailExportRows(activeTab, detailResults)];
      let detailWidths = detailHeaders.map((header) => Math.max(String(header).length * 2, 14));

      let today = new Date();
      let fileDate = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
      downloadWorkbook(`${TAB_LABELS[activeTab]}_이력_${fileDate}.xlsx`, [
        { name: "조회결과", ws: makeSheetFromAoA(listAoA, listWidths) },
        { name: "상세결과", ws: makeSheetFromAoA(detailAoA, detailWidths) },
      ]);
    } catch (e) {
      console.error(e);
      setError("엑셀 파일을 다운로드하지 못했습니다.");
    } finally {
      setExcelLoading(false);
    }
  }

  async function openDetail(row) {
    let key =
      row.histKey ||
      row.payrollNo ||
      `${activeTab}-${row.startDtm}-${row.empNo || row.posCd || row.rateNo || ""}`;

    setSelectedKey(key);
    setDetailOpen(true);
    setDetailLoading(true);
    setDetail(null);

    try {
      if (activeTab === "STEP_SET") {
        let items = await fetchPayStepSetDetail(row.startDtm);
        setDetail({ kind: "STEP_SET", row, items });
        return;
      }

      if (activeTab === "PAYROLL") {
        let data = await fetchPayrollHistoryDetail(row.payrollNo);
        setDetail({ kind: "PAYROLL", row, data });
        return;
      }

      setDetail({ kind: activeTab, row });
    } catch (e) {
      console.error(e);
      setDetail({ kind: activeTab, row });
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDetail() {
    setDetailOpen(false);
    setDetailLoading(false);
    setDetail(null);
  }

  function renderAmountText(value) {
    return <span className={styles.amountText}>{value}</span>;
  }

  function renderCell(col, row, rowIndex) {
    let rowNo = ((paging?.page ?? page) - 1) * (paging?.size ?? recordSize) + rowIndex + 1;

    if (col.key === "rowNo") return rowNo;

    if (col.key === "status") {
      return (
        <span className={clsx(styles.chip, row.status === "CURRENT" ? styles.chipCurrent : styles.chipPast)}>
          {statusLabel(row.status)}
        </span>
      );
    }

    if (col.key === "confirmYn") {
      return (
        <span className={clsx(styles.chip, row.confirmYn === "Y" ? styles.chipCurrent : styles.chipPending)}>
          {confirmLabel(row.confirmYn)}
        </span>
      );
    }

    if (col.key === "payYyyymm") return formatMonth(row.payYyyymm);
    if (MONEY_KEYS.has(col.key)) return renderAmountText(formatMoney(row[col.key]));
    if (["pensionRate", "healthRate", "employRate", "careRate", "incomeTaxRate", "localTaxRate"].includes(col.key)) {
      return formatRate(row[col.key]);
    }
    if (col.key === "accntNo") return maskAccount(row.accntNo);
    if (col.key === "useYn") return row.useYn === "Y" ? "사용" : "미사용";
    return row[col.key] || "-";
  }

  function renderInlineField(label, control, extraClassName, guideText) {
    return (
      <div className={clsx(styles.filterItem, extraClassName)}>
        <label className={styles.filterLabel}>{label}</label>
        <div className={styles.filterControlBox}>{control}</div>
        {guideText ? <div className={styles.filterGuide}>{guideText}</div> : null}
      </div>
    );
  }

  function renderDateRangeFilter(labelText = "적용기간") {
    return renderInlineField(
      labelText,
      <div className={styles.dateRow}>
        <input
          className={styles.control}
          type="date"
          value={filters.startDate}
          onChange={(e) => handleFilterChange("startDate", e.target.value)}
        />
        <span className={styles.wave}>~</span>
        <input
          className={styles.control}
          type="date"
          value={filters.endDate}
          onChange={(e) => handleFilterChange("endDate", e.target.value)}
        />
      </div>,
      styles.filterItemPeriod,
      filterGuideText
    );
  }

  function renderMonthRangeFilter() {
    return renderInlineField(
      "급여월",
      <div className={styles.dateRow}>
        <input
          className={styles.control}
          type="month"
          value={filters.payMonthFrom}
          onChange={(e) => handleFilterChange("payMonthFrom", e.target.value)}
        />
        <span className={styles.wave}>~</span>
        <input
          className={styles.control}
          type="month"
          value={filters.payMonthTo}
          onChange={(e) => handleFilterChange("payMonthTo", e.target.value)}
        />
      </div>,
      styles.filterItemPeriod,
      filterGuideText
    );
  }

  function renderStatusFilter() {
    return renderInlineField(
      "상태",
      <select className={styles.control} value={filters.status} onChange={(e) => handleFilterChange("status", e.target.value)}>
        <option value="ALL">전체</option>
        <option value="CURRENT">현재 적용</option>
        <option value="ENDED">종료</option>
      </select>
    );
  }

  function renderDeptFilter() {
    return renderInlineField(
      "부서",
      <select className={styles.control} value={filters.deptNm} onChange={(e) => handleFilterChange("deptNm", e.target.value)}>
        <option value="ALL">전체</option>
        {departments.map((dept) => (
          <option key={dept.deptCd || dept.deptNm} value={dept.deptNm}>
            {dept.deptNm}
          </option>
        ))}
      </select>
    );
  }

  function renderPosFilter() {
    return renderInlineField(
      "직위",
      <select className={styles.control} value={filters.posCd} onChange={(e) => handleFilterChange("posCd", e.target.value)}>
        <option value="ALL">전체</option>
        {positions.map((pos) => (
          <option key={pos.posCd} value={pos.posCd}>
            {pos.posNm}
          </option>
        ))}
      </select>
    );
  }

  function renderEmpNmFilter() {
    return renderInlineField(
      "사원명",
      <input
        className={styles.control}
        value={filters.empNm}
        onChange={(e) => handleFilterChange("empNm", e.target.value)}
        placeholder="예: 김인사"
      />
    );
  }

  function renderEmpNoFilter() {
    return renderInlineField(
      "사원번호",
      <input
        className={styles.control}
        value={filters.empNo}
        onChange={(e) => handleFilterChange("empNo", e.target.value)}
        placeholder="예: 2025001"
      />
    );
  }

  function renderFilterItems() {
    if (activeTab === "PAYROLL") {
      return (
        <>
          {renderMonthRangeFilter()}
          {renderInlineField(
            "확정여부",
            <select className={styles.control} value={filters.confirmYn} onChange={(e) => handleFilterChange("confirmYn", e.target.value)}>
              <option value="ALL">전체</option>
              <option value="Y">확정</option>
              <option value="N">미확정</option>
            </select>
          )}
          {renderDeptFilter()}
          {renderPosFilter()}
          {renderEmpNmFilter()}
          {renderEmpNoFilter()}
        </>
      );
    }

    if (activeTab === "POS_BASE") {
      return (
        <>
          {renderDateRangeFilter()}
          {renderStatusFilter()}
          {renderPosFilter()}
        </>
      );
    }

    if (activeTab === "STEP_SET" || activeTab === "INSURANCE") {
      return (
        <>
          {renderDateRangeFilter()}
          {renderStatusFilter()}
        </>
      );
    }

    if (activeTab === "EMP_ALLOW") {
      return (
        <>
          {renderDateRangeFilter()}
          {renderStatusFilter()}
          {renderDeptFilter()}
          {renderPosFilter()}
          {renderEmpNmFilter()}
          {renderEmpNoFilter()}
          {renderInlineField(
            "수당명",
            <select className={styles.control} value={filters.salaryItemCode} onChange={(e) => handleFilterChange("salaryItemCode", e.target.value)}>
              <option value="ALL">전체</option>
              {salaryItems.map((item) => (
                <option key={item.salaryItemCode} value={item.salaryItemCode}>
                  {item.salaryItemName}
                </option>
              ))}
            </select>
          )}
          {renderInlineField(
            "과세구분",
            <select className={styles.control} value={filters.taxType} onChange={(e) => handleFilterChange("taxType", e.target.value)}>
              <option value="ALL">전체</option>
              <option value="과세">과세</option>
              <option value="비과세">비과세</option>
            </select>
          )}
        </>
      );
    }

    return (
      <>
        {renderDateRangeFilter()}
        {renderStatusFilter()}
        {renderDeptFilter()}
        {renderPosFilter()}
        {renderEmpNmFilter()}
        {renderEmpNoFilter()}
        {renderInlineField(
          "은행",
          <input
            className={styles.control}
            value={filters.bankName}
            onChange={(e) => handleFilterChange("bankName", e.target.value)}
            placeholder="예: 국민"
          />
        )}
      </>
    );
  }

  function renderPairCards(pairs) {
    return (
      <div className={styles.detailGrid}>
        {pairs.map(([label, value, isWide]) => (
          <div key={label} className={clsx(styles.detailCard, isWide && styles.detailWide)}>
            <div className={styles.detailLabel}>{label}</div>
            <div className={styles.detailValue}>{value}</div>
          </div>
        ))}
      </div>
    );
  }

  function renderDetailBody() {
    if (!detail) return null;

    if (detail.kind === "STEP_SET") {
      let row = detail.row;
      let items = Array.isArray(detail.items) ? detail.items : [];
      return (
        <>
          <div className={styles.summaryBanner}>선택한 호봉 가산율 이력의 상세 정보입니다.</div>
          {renderPairCards([
            ["상태", statusLabel(row.status)],
            ["사용여부", row.useYn === "Y" ? "사용" : "미사용"],
            ["적용시작일", formatDate(row.startDtm)],
            ["적용종료일", formatDate(row.endDtm)],
          ])}
          <div className={styles.modalSectionTitle}>호봉별 가산율</div>
          <table className={styles.detailTable}>
            <thead>
              <tr>
                <th>호봉</th>
                <th>가산율</th>
                <th>등록일</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={3} className={styles.centerCell}>상세 정보가 없습니다.</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.stepRateNo || item.salaryStep}>
                    <td>{item.salaryStep}</td>
                    <td>{formatRate(item.increaseRate)}</td>
                    <td>{item.createdDtm || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      );
    }

    if (detail.kind === "PAYROLL") {
      let row = detail.row;
      let data = detail.data || {};
      let items = Array.isArray(data.items) ? data.items : [];
      return (
        <>
          <div className={styles.summaryBanner}>선택한 급여 명세의 상세 정보입니다.</div>
          {renderPairCards([
            ["급여월", formatMonth(row.payYyyymm)],
            ["확정여부", confirmLabel(row.confirmYn)],
            ["사원명", row.empNm || "-"],
            ["사원번호", row.empNo || "-"],
            ["부서명", row.deptNm || "-"],
            ["직위명", row.posNm || "-"],
            ["생성일시", row.createdDtm || "-"],
            ["총지급액", `${formatMoney(row.totalPayAmt)}원`],
            ["총공제액", `${formatMoney(row.totalDeductAmt)}원`],
            ["실지급액", `${formatMoney(row.netPayAmt)}원`],
          ])}
          <div className={styles.modalSectionTitle}>명세 항목</div>
          <table className={styles.detailTable}>
            <thead>
              <tr>
                <th>구분</th>
                <th>항목명</th>
                <th>항목코드</th>
                <th>금액</th>
                <th>과세여부</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.centerCell}>상세 정보가 없습니다.</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.itemDetailNo || `${item.itemCode}-${item.itemName}`}>
                    <td>{payTypeLabel(item.itemTypeCd)}</td>
                    <td>{item.itemName || "-"}</td>
                    <td>{item.itemCode || "-"}</td>
                    <td>{formatMoney(item.amount)}</td>
                    <td>
                      {item.taxableYn === "Y"
                        ? "과세"
                        : item.taxableYn === "N"
                          ? "비과세"
                          : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      );
    }

    let row = detail.row;
    let pairs = [];

    if (detail.kind === "EMP_BASE") {
      pairs = [
        ["상태", statusLabel(row.status)],
        ["부서명", row.deptNm || "-"],
        ["직위명", row.posNm || "-"],
        ["사원명", row.empNm || "-"],
        ["사원번호", row.empNo || "-"],
        ["기준급", `${formatMoney(row.baseAmt)}원`],
        ["은행", row.bankName || "-"],
        ["계좌번호", maskAccount(row.accntNo)],
        ["부양가족수", row.deductFamCnt ?? "-"],
        ["호봉", row.salaryGrade ?? "-"],
        ["조정사유", row.adjustRsn || "-", true],
        ["적용기간", `${formatDate(row.startDtm)} ~ ${formatDate(row.endDtm)}`, true],
      ];
    } else if (detail.kind === "EMP_ALLOW") {
      pairs = [
        ["상태", statusLabel(row.status)],
        ["부서명", row.deptNm || "-"],
        ["직위명", row.posNm || "-"],
        ["사원명", row.empNm || "-"],
        ["사원번호", row.empNo || "-"],
        ["수당명", row.salaryItemName || "-"],
        ["수당코드", row.salaryItemCode || "-"],
        ["구분", row.itemType || "-"],
        ["과세구분", row.taxType || "-"],
        ["금액", `${formatMoney(row.itemAmount)}원`],
        ["적용기간", `${formatDate(row.startDtm)} ~ ${formatDate(row.endDtm)}`, true],
      ];
    } else if (detail.kind === "POS_BASE") {
      pairs = [
        ["상태", statusLabel(row.status)],
        ["직위명", row.posNm || "-"],
        ["기준금액", `${formatMoney(row.stdAmt)}원`],
        ["적용기간", `${formatDate(row.startDtm)} ~ ${formatDate(row.endDtm)}`, true],
      ];
    } else if (detail.kind === "INSURANCE") {
      pairs = [
        ["상태", statusLabel(row.status)],
        ["국민연금율", formatRate(row.pensionRate)],
        ["건강보험율", formatRate(row.healthRate)],
        ["고용보험율", formatRate(row.employRate)],
        ["장기요양율", formatRate(row.careRate)],
        ["소득세율", formatRate(row.incomeTaxRate)],
        ["지방소득세율", formatRate(row.localTaxRate)],
        ["적용기간", `${formatDate(row.startDtm)} ~ ${formatDate(row.endDtm)}`, true],
      ];
    }

    return (
      <>
        <div className={styles.summaryBanner}>선택한 이력의 상세 정보입니다.</div>
        {renderPairCards(pairs)}
      </>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.headerCard}>
        <div className={styles.headerTitleBox}>
          <div className={styles.title}>급여관리이력</div>
          <div className={styles.subTitle}>
            사원별 급여 기준정보와 수당, 직위별 기준금액, 호봉 가산율, 공제율, 월별 급여처리 내역의 적용 이력을 구분하여 조회할 수 있습니다.
          </div>
        </div>

        <div className={styles.headerActions}>
          <button className={clsx(styles.actionBtn, styles.primaryBtn)} onClick={() => loadList(1)} disabled={loading || excelLoading}>
            <Search size={15} /> 즉시조회
          </button>
          <button className={clsx(styles.actionBtn, styles.ghostBtn)} onClick={resetFilters} disabled={loading || excelLoading}>
            <RefreshCcw size={15} /> 초기화
          </button>
        </div>
      </div>

      <div className={styles.filterCard}>
        <div className={styles.tabBar}>
          {TABS.map((tab) => (
            <button
              key={tab}
              className={clsx(styles.tabBtn, activeTab === tab && styles.tabBtnActive)}
              onClick={() => handleTabChange(tab)}
              disabled={loading || excelLoading}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        <div className={styles.filterGrid}>{renderFilterItems()}</div>
        {canSearchHint ? <div className={styles.warnBox}>{canSearchHint}</div> : null}
        {error ? <div className={styles.warnBox}>{error}</div> : null}
      </div>

      <div className={styles.resultCard}>
        <div className={styles.resultHeader}>
          <div className={styles.resultTitle}>조회 결과</div>
          <div className={styles.resultTools}>
            <span className={styles.countTag}>총 {(paging?.totalCount ?? 0).toLocaleString()}건</span>
            <div className={styles.pageSizeBox}>
              <span>페이지 크기</span>
              <select
                value={recordSize}
                onChange={(e) => setRecordSize(Number(e.target.value) || 10)}
                disabled={loading || excelLoading}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <button
              className={clsx(styles.actionBtn, styles.ghostBtn)}
              onClick={handleExcelDownload}
              disabled={loading || excelLoading || (paging?.totalCount ?? 0) <= 0}
            >
              <Download size={15} /> Excel
            </button>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key} style={col.width ? { width: col.width } : undefined}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className={styles.centerCell}>불러오는 중...</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className={styles.centerCell}>조회된 내역이 없습니다.</td>
                </tr>
              ) : (
                rows.map((row, index) => {
                  let key =
                    row.histKey ||
                    row.payrollNo ||
                    `${activeTab}-${row.startDtm}-${row.empNo || row.posCd || row.rateNo || index}`;

                  return (
                    <tr
                      key={key}
                      className={clsx(styles.row, key === selectedKey && styles.activeRow)}
                      onClick={() => openDetail(row)}
                    >
                      {columns.map((col) => (
                        <td
                          key={`${key}-${col.key}`}
                          className={MONEY_KEYS.has(col.key) ? styles.moneyCell : undefined}
                        >
                          {renderCell(col, row, index)}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.bottomBar}>
          <div className={styles.pagingBar}>
            <button
              className={styles.pageBtn}
              disabled={!paging?.prev || loading || excelLoading}
              onClick={() => loadList((paging?.startPage ?? 1) - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            {pageNumbers.map((p) => (
              <button
                key={p}
                className={clsx(styles.pageBtn, p === page && styles.pageBtnActive)}
                disabled={loading || excelLoading}
                onClick={() => loadList(p)}
              >
                {p}
              </button>
            ))}
            <button
              className={styles.pageBtn}
              disabled={!paging?.next || loading || excelLoading}
              onClick={() => loadList((paging?.endPage ?? 1) + 1)}
            >
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
                <div className={styles.modalTitle}>{TAB_LABELS[activeTab]} 상세</div>
                <div className={styles.modalSubTitle}>선택한 이력의 세부 정보를 항목별로 확인할 수 있습니다.</div>
              </div>
              <button className={styles.iconBtn} onClick={closeDetail}>
                <X size={18} />
              </button>
            </div>
            <div className={styles.modalBody}>
              {detailLoading ? (
                <div className={styles.modalState}>상세 정보를 불러오는 중...</div>
              ) : detail ? (
                renderDetailBody()
              ) : (
                <div className={styles.modalState}>상세 정보가 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
