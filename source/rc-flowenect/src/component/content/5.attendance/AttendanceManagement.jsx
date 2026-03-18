import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";
import clsx from "clsx";
import styled from "./AttendanceManagement.module.css";

import {
  Ban,
  CheckCircle2,
  Clock3,
  LogOut,
  Palmtree,
  Users,
  Search,
  X,
} from "lucide-react";
import apiClient from "../../../api/apiClient";

// ─── Constants & Helpers ──────────────────────────────────────────────────────
const PAGE_SIZE = 10;
const STATUSES = ["전체", "PRESENT", "LATE", "OFF", "VACATION", "ABSENT"];
const STATUS_LABEL = {
  전체: "전체",
  PRESENT: "출근",
  LATE: "지각",
  OFF: "퇴근",
  VACATION: "연차",
  ABSENT: "결근",
};

const formatTime = (dtm) => {
  if (!dtm) return "—";
  const timePart = dtm.split(" ")[1];
  return timePart ? timePart.substring(0, 5) : "—";
};

const STAT_CARDS = [
  {
    key: "total",
    label: "전체 인원",
    icon: Users,
    accent: "#7C3AED",
    light: "#F3E8FF",
  },
  {
    key: "present",
    label: "출근",
    icon: CheckCircle2,
    accent: "#15803D",
    light: "#DCFCE7",
  },
  {
    key: "late",
    label: "지각",
    icon: Clock3,
    accent: "#D97706",
    light: "#FFFBEB",
  },
  {
    key: "off",
    label: "퇴근",
    icon: LogOut,
    accent: "#344054",
    light: "#F2F4F7",
  },
  {
    key: "vacation",
    label: "연차",
    icon: Palmtree,
    accent: "#0891B2",
    light: "#CFFAFE",
  },
  {
    key: "absent",
    label: "결근",
    icon: Ban,
    accent: "#B42318",
    light: "#FEE4E2",
  },
];

function deriveStats(records) {
  return {
    total: records.length,
    present: records.filter((r) => r.attdStatCd === "PRESENT").length,
    late: records.filter((r) => r.attdStatCd === "LATE").length,
    off: records.filter((r) => r.attdStatCd === "OFF").length,
    vacation: records.filter((r) => r.attdStatCd === "VACATION").length,
    absent: records.filter((r) => r.attdStatCd === "ABSENT").length,
  };
}

// ─── EditModal ───────────────────────────────────────────────────────────────
function EditModal({ record, onSave, onClose }) {
  const [form, setForm] = useState({
    inDtm: record.inDtm ? record.inDtm.slice(11, 16) : "",
    outDtm: record.outDtm ? record.outDtm.slice(11, 16) : "",
    attdStatCd: record.attdStatCd || "PRESENT",
    remark: record.remark ?? "",
  });

  const handleChange = (key) => (e) => {
    const value = e.target.value;

    setForm((prev) => {
      const nextForm = { ...prev, [key]: value };

      // [추가] 상태가 연차/결근으로 변경되면 입력창의 시간을 자동으로 비움
      if (
        key === "attdStatCd" &&
        (value === "VACATION" || value === "ABSENT")
      ) {
        nextForm.inDtm = "";
        nextForm.outDtm = "";
      }
      return nextForm;
    });
  };

  // [추가] 연차/결근일 때 입력창 비활성화
  const isTimeDisabled =
    form.attdStatCd === "VACATION" || form.attdStatCd === "ABSENT";

  return (
    <div className={styled.modalOverlay} onClick={onClose}>
      <div className={styled.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styled.modalHeader}>
          <div>
            <p className={styled.modalTitle}>출퇴근 수정</p>
            <p className={styled.modalSub}>
              {record.empNo} · {record.workDt}
            </p>
          </div>
          <button
            className={clsx(styled.btn, styled.btnClose)}
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className={styled.modalBody}>
          <div className={styled.modalTimeGrid}>
            {[
              { label: "출근 시간", key: "inDtm" },
              { label: "퇴근 시간", key: "outDtm" },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className={styled.fieldLabel}>{label}</label>
                <input
                  type="time"
                  className={styled.fieldInput}
                  value={form[key]}
                  onChange={handleChange(key)}
                  disabled={isTimeDisabled} // 연차/결근 시 수정 못하게 막음
                  style={
                    isTimeDisabled
                      ? { backgroundColor: "#f3f4f6", cursor: "not-allowed" }
                      : {}
                  }
                />
              </div>
            ))}
          </div>

          <div>
            <label className={styled.fieldLabel}>상태</label>
            <select
              className={clsx(styled.fieldInput, styled.fieldInputSelect)}
              value={form.attdStatCd}
              onChange={handleChange("attdStatCd")}
            >
              {STATUSES.filter((s) => s !== "전체").map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={styled.fieldLabel}>사유 / 메모</label>
            <input
              className={styled.fieldInput}
              value={form.remark}
              onChange={handleChange("remark")}
              placeholder="사유를 입력하세요"
            />
          </div>
        </div>

        <div className={styled.modalFooter}>
          <button
            className={clsx(styled.btn, styled.btnCancel)}
            onClick={onClose}
          >
            취소
          </button>
          <button
            className={clsx(styled.btn, styled.btnSave)}
            onClick={() => onSave(form)}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

// 날짜를 "YYYY-MM-DD" 형식으로
const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function AttendanceManagement() {
  const [records, setRecords] = useState([]);
  const [summaryRecords, setSummaryRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("전체");
  const [filterDept, setFilterDept] = useState("전체");
  const [filterDate, setFilterDate] = useState(getTodayString());
  const [searchName, setSearchName] = useState("");
  const [editTarget, setEditTarget] = useState(null);
  const [selected, setSelected] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // ── Toast ──
  const [toast, setToast] = useState(null); // { type: "success" | "error", message: string }
  const toastTimer = useRef(null);

  const showToast = useCallback((type, message) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ type, message });
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const gridRef = useRef();

  const stats = useMemo(() => deriveStats(summaryRecords), [summaryRecords]);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const depts = useMemo(
    () => [
      "전체",
      ...new Set(summaryRecords.map((r) => r.deptNm).filter(Boolean)),
    ],
    [summaryRecords],
  );

  // ── AG Grid 컬럼 ──
  const columnDefs = useMemo(
    () => [
      {
        field: "empNo",
        headerName: "사원번호",
        width: 140,
        cellClass: clsx(styled.tableTdId, styled.cellCenter),
      },
      {
        field: "empNm",
        headerName: "이름",
        width: 140,
        cellRenderer: (p) => (
          <span className={styled.avatarName}>{p.value}</span>
        ),
      },
      { field: "deptNm", headerName: "부서", width: 150 },
      {
        field: "inDtm",
        headerName: "출근",
        width: 130,
        valueFormatter: (p) => formatTime(p.value),
        cellClass: (p) =>
          clsx(
            p.value ? styled.tableTdTime : styled.tableTdTimeEmpty,
            styled.cellCenter,
          ),
      },
      {
        field: "outDtm",
        headerName: "퇴근",
        width: 130,
        valueFormatter: (p) => formatTime(p.value),
        cellClass: (p) =>
          clsx(
            p.value ? styled.tableTdTime : styled.tableTdTimeEmpty,
            styled.cellCenter,
          ),
      },
      {
        field: "attdStatCd",
        headerName: "상태",
        width: 140,
        cellRenderer: (p) => {
          const code = p.value;
          const badgeClass = styled[`badge${code}`];
          return (
            <span className={clsx(styled.badge, badgeClass)}>
              <span className={styled.badgeDot} />
              {STATUS_LABEL[code] || code || "—"}
            </span>
          );
        },
      },
      {
        field: "remark",
        headerName: "사유",
        flex: 1,
        width: 150,
        valueFormatter: (p) => p.value || "—",
      },
      {
        headerName: "관리",
        width: 90,
        cellRenderer: (p) => (
          <button
            className={clsx(styled.btn, styled.btnGhost)}
            onClick={() => setEditTarget(p.data)}
          >
            수정
          </button>
        ),
      },
    ],
    [],
  );

  const defaultColDef = useMemo(
    () => ({
      resizable: false,
      sortable: true,
      suppressMovable: true,
      cellClass: styled.cellCenter,
      headerClass: styled.headerCenter,
    }),
    [],
  );

  const filteredRecords = useMemo(() => records, [records]);

  const fetchReadList = useCallback(
    async (page, workDt, status, name, dept) => {
      const params = { currentPage: page, workDt };
      if (status && status !== "전체") params.attdStatCd = status;
      if (name) params.empNm = name;
      if (dept && dept !== "전체") params.deptNm = dept;

      const response = await apiClient.get(`api/attendance/readList`, {
        params,
      });
      return response.data;
    },
    [],
  );

  const fetchSummary = useCallback(
    async (workDt) => {
      const first = await fetchReadList(1, workDt, "전체", "");
      const all = [...(first.list || [])];
      const total = first.totalCount || all.length;
      const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

      for (let p = 2; p <= pages; p++) {
        const next = await fetchReadList(p, workDt, "전체", "");
        all.push(...(next.list || []));
      }
      setSummaryRecords(all);
    },
    [fetchReadList],
  );

  const fetchTable = useCallback(
    async (page, workDt, status, name, dept) => {
      const data = await fetchReadList(page, workDt, status, name, dept);
      setRecords(data.list || []);
      setTotalCount(data.totalCount || 0);
    },
    [fetchReadList],
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await fetchSummary(filterDate);
        await fetchTable(1, filterDate, filterStatus, searchName, filterDept);
        setCurrentPage(1);
      } catch (e) {
        console.error(e);
        showToast("error", e.message || "조회 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDate]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await fetchTable(1, filterDate, filterStatus, searchName, filterDept);
        setCurrentPage(1);
      } catch (e) {
        console.error(e);
        showToast("error", e.message || "조회 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, searchName]);

  const handleSave = async (form) => {
    try {
      // 백엔드 ServiceImpl에서 처리하긴 하지만, 프론트에서도 명확히 null을 할당
      const isSpecialStatus =
        form.attdStatCd === "VACATION" || form.attdStatCd === "ABSENT";

      const payload = {
        attdNo: editTarget.attdNo ?? null,
        empNo: editTarget.empNo,
        workDt: filterDate,
        attdStatCd: form.attdStatCd,
        remark: form.remark,
        // 지각 여부 로직: 연차/결근이면 N, 그 외엔 시간이 09:10 이후면 Y
        lateYn: isSpecialStatus ? "N" : form.inDtm > "09:10" ? "Y" : "N",
        outAutoYn: "N",
        inDtm:
          isSpecialStatus || !form.inDtm
            ? null
            : `${filterDate} ${form.inDtm}:00`,
        outDtm:
          isSpecialStatus || !form.outDtm
            ? null
            : `${filterDate} ${form.outDtm}:00`,
      };

      const response = await apiClient.put(`api/attendance/modify`, payload);
      if (response.data !== "success")
        throw new Error("수정에 실패하였습니다.");

      showToast("success", "수정이 완료되었습니다.");
      setEditTarget(null);

      setLoading(true);
      await fetchSummary(filterDate);
      await fetchTable(
        currentPage,
        filterDate,
        filterStatus,
        searchName,
        filterDept,
      );
      setLoading(false);
    } catch (e) {
      setLoading(false);
      console.error("수정 오류:", e);
      showToast(
        "error",
        e.response?.data?.message || e.message || "수정에 실패했습니다.",
      );
    }
  };

  const goToPage = async (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    setLoading(true);
    try {
      await fetchTable(page, filterDate, filterStatus, searchName, filterDept);
    } catch (e) {
      showToast("error", e.message || "페이지 이동 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styled.page}>
      {/* ── Toast 알림 ── */}
      {toast && (
        <div className={`${styled.toast} ${styled[`toast_${toast.type}`]}`}>
          <span className={styled.toastIcon}>
            {toast.type === "success" ? "✓" : "✕"}
          </span>
          <span className={styled.toastMessage}>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className={styled.headerWrap}>
        <div className={styled.pageHeader}>
          <div>
            <h1 className={styled.pageHeaderTitle}>출퇴근 현황</h1>
            <p className={styled.pageHeaderSub}>
              {filterDate} 기준 · 총 {stats.total}명
            </p>
          </div>
          <div className={styled.pageHeaderActions}>
            <input
              type="date"
              className={clsx(styled.input, styled.inputDate)}
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={styled.content}>
        {/* StatCards */}
        <div className={styled.statGrid}>
          {STAT_CARDS.map(({ key, label, icon: Icon, accent, light }) => (
            <div key={key} className={styled.statCard}>
              <div className={styled.statCardTopRow}>
                <div
                  className={styled.statCardIcon}
                  style={{ background: light }}
                >
                  <Icon size={18} />
                </div>
                <div className={styled.statCardValueWrap}>
                  <div className={styled.statCardValue}>
                    {stats[key]}
                    <span className={styled.statCardUnit}>명</span>
                  </div>
                  <div className={styled.statCardLabel}>{label}</div>
                </div>
              </div>
              <div
                className={styled.statCardBar}
                style={{
                  background: accent,
                  width: `${stats.total > 0 ? (stats[key] / stats.total) * 100 : 0}%`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Table */}
        <div className={styled.tableCard}>
          <div className={styled.filterBar}>
            <div className={styled.searchWrapper}>
              <Search className={styled.searchIcon} size={14} />
              <input
                className={clsx(styled.input, styled.inputSearch)}
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="이름 검색"
              />
            </div>

            <div className={styled.searchWrapper}>
              <select
                className={clsx(styled.input, styled.inputSelect)}
                value={filterDept}
                onChange={async (e) => {
                  const dept = e.target.value;
                  setFilterDept(dept);
                  setLoading(true);
                  try {
                    await fetchTable(
                      1,
                      filterDate,
                      filterStatus,
                      searchName,
                      dept,
                    );
                    setCurrentPage(1);
                  } catch (err) {
                    showToast(
                      "error",
                      err.message || "부서 조회에 실패했습니다.",
                    );
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                {depts.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className={styled.filterBarChips}>
              {STATUSES.map((s) => (
                <button
                  key={s}
                  className={clsx(
                    styled.filterChip,
                    filterStatus === s && styled.filterChipActive,
                  )}
                  onClick={() => setFilterStatus(s)}
                >
                  {STATUS_LABEL[s] || s}
                </button>
              ))}
            </div>
          </div>

          <div className={styled.gridWrap}>
            <AgGridReact
              ref={gridRef}
              theme={themeQuartz}
              rowData={filteredRecords}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              suppressMovableColumns={true}
              headerHeight={40}
              rowHeight={46}
              onGridReady={(p) => p.api.sizeColumnsToFit()}
              onGridSizeChanged={(p) => p.api.sizeColumnsToFit()}
              onRowClicked={(e) => setSelected(e.data)}
            />
          </div>

          <div className={styled.pagination}>
            <button
              className={styled.pageBtn}
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ‹
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={clsx(
                  styled.pageBtn,
                  currentPage === i + 1 && styled.pageBtnActive,
                )}
                onClick={() => goToPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className={styled.pageBtn}
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {editTarget && (
        <EditModal
          record={editTarget}
          onSave={handleSave}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}
