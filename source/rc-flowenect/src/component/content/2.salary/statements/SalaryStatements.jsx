import React, { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";
import {
  CheckCircle2,
  FilePlus2,
  Save,
  Trash2,
  Mail,
  Download,
  CalendarDays,
} from "lucide-react";
import apiClient from "../../../../api/apiClient";
import styled from "./SalaryStatements.module.css";

function ymNow() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function ymToMonthValue(ym) {
  const safe = String(ym || ymNow());
  if (safe.length !== 6) return `${safe.slice(0, 4)}-${safe.slice(4, 6)}`;
  return `${safe.slice(0, 4)}-${safe.slice(4, 6)}`;
}

function monthValueToYm(monthValue) {
  return String(monthValue || "").replace("-", "");
}

function displayMonth(ym) {
  const safe = String(ym || "");
  if (safe.length !== 6) return safe;
  return `${safe.slice(0, 4)}.${safe.slice(4, 6)}`;
}

const fmtMoney = (v) => {
  const n = Number(v ?? 0);
  if (Number.isNaN(n)) return "0";
  return n.toLocaleString("ko-KR");
};

/**
 * ✅ itemTypeCd/itemType 혼용 + 영문/한글 혼용(PAY/DEDUCT vs 지급/공제) 정규화
 * - PAY  : 지급(기준급/식대/직위수당/유류비 등)
 * - DEDUCT: 공제(4대보험/세금 등)
 * - TOTAL 등은 그대로 반환(상세목록에서 제외용)
 */
function normalizeItemType(item) {
  const raw = String(item?.itemTypeCd ?? item?.itemType ?? item?.type ?? "")
    .trim();
  const upper = raw.toUpperCase();

  if (upper === "PAY" || raw === "지급") return "PAY";
  if (upper === "DEDUCT" || raw === "공제") return "DEDUCT";

  return upper || raw;
}

/** ✅ 상세 그리드에서 보여줄 구분 텍스트(지급/공제) */
function displayItemType(item) {
  const t = normalizeItemType(item);
  if (t === "PAY") return "지급";
  if (t === "DEDUCT") return "공제";
  return t;
}

export default function SalaryStatements() {
  const gridApiRef = useRef(null);
  const monthInputRef = useRef(null);

  const [selectedYm, setSelectedYm] = useState(ymNow());

  const [rows, setRows] = useState([]);
  const [detail, setDetail] = useState(null);

  const getPayrollKey = (row) => row?.payrollNo ?? row?.payrollId;
  const getConfirmYn = (row) => row?.confirmYn ?? row?.confirmedYn;
  const getPayYm = (row) => row?.payYyyymm ?? row?.payYm;

  const isConfirmed = (row) =>
    String(getConfirmYn(row) ?? "N").toUpperCase() === "Y";

  const defaultColDef = useMemo(
    () => ({
      resizable: false,
      sortable: false,
      filter: false,
      cellClass: styled.cellCenter,
      headerClass: styled.headerCenter,
    }),
    [],
  );

async function generate() {
        await apiClient.post("/api/payroll/statements/generate", null, {
            params: { payYm: ymNow() },
        });
        await loadList();
        alert("명세서를 생성했습니다.");
    }

  const colDefs = useMemo(
    () => [
      { headerName: "생성일시", field: "createdDtm", width: 170 },
      { headerName: "사원명", field: "empNm", width: 120 },
      {
        headerName: "직위",
        field: "posNm",
        width: 110,
        valueGetter: (p) => p.data?.posNm ?? p.data?.posCd ?? "",
      },
      {
        headerName: "부서",
        field: "deptNm",
        flex: 1,
        minWidth: 140,
        valueGetter: (p) => p.data?.deptNm ?? "",
      },
      {
        headerName: "확정여부",
        field: "confirmYn",
        width: 110,
        valueGetter: (p) => getConfirmYn(p.data) ?? "N",
        cellRenderer: (p) =>
          String(p.value).toUpperCase() === "Y" ? "Y" : "N",
      },
    ],
    [],
  );

  const buildSlip = (d) => {
    const items = d?.items || [];

    const pay = items.filter((i) => normalizeItemType(i) === "PAY");
    const deduct = items.filter((i) => normalizeItemType(i) === "DEDUCT");

    const paySum = pay.reduce((s, i) => s + Number(i.amount ?? i.amt ?? 0), 0);
    const deductSum = deduct.reduce(
      (s, i) => s + Number(i.amount ?? i.amt ?? 0),
      0,
    );
    const net = paySum - deductSum;

    const label = (i) => {
      const nm = i.itemName ?? i.itemNm ?? "";
      const t = normalizeItemType(i);
      const taxableYn = String(i.taxableYn ?? "Y").toUpperCase();
      if (t === "PAY" && taxableYn === "N") return `${nm}(비과세)`;
      return nm;
    };

    return { pay, deduct, paySum, deductSum, net, label };
  };

  const dtlCols = useMemo(
    () => [
      {
        headerName: "항목",
        field: "itemName",
        flex: 1,
        valueGetter: (p) => p.data?.itemName ?? p.data?.itemNm ?? "",
      },
      {
        headerName: "금액",
        field: "amount",
        width: 140,
        editable: () => !isConfirmed(detail),
        valueGetter: (p) => p.data?.amount ?? p.data?.amt ?? 0,
        valueSetter: (p) => {
          const next = Number(p.newValue ?? 0);
          if (Number.isNaN(next)) return false;
          if ("amount" in p.data) p.data.amount = next;
          else p.data.amt = next;
          return true;
        },
      },
      {
        headerName: "구분",
        field: "itemTypeCd",
        width: 110,
        valueGetter: (p) => displayItemType(p.data),
      },
    ],
    [detail],
  );

  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadList(targetYm = selectedYm) {
    const queryYm = targetYm || ymNow();
    const { data } = await apiClient.get("/api/payroll/statements", {
      params: { payYm: queryYm, fromYm: queryYm, toYm: queryYm },
    });
    setRows(data || []);
    setDetail(null);
  }

  async function handleMonthChange(e) {
    const nextYm = monthValueToYm(e.target.value);
    if (!nextYm) return;
    setSelectedYm(nextYm);
    await loadList(nextYm);
  }

  function openMonthPicker() {
    const input = monthInputRef.current;
    if (!input) return;

    if (typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      input.click();
    }
  }

  async function loadDetail(payrollKey) {
    if (!payrollKey) {
      setDetail(null);
      return;
    }
    const { data } = await apiClient.get(
      `/api/payroll/statements/${payrollKey}`,
    );
    setDetail(data || null);
  }

  async function saveDetail() {
    if (!detail) return;
    if (isConfirmed(detail)) {
      return alert("이미 확정된 명세서는 수정할 수 없습니다.");
    }

    const payrollKey = getPayrollKey(detail);
    if (!payrollKey) return alert("payroll 키가 없어 저장할 수 없습니다.");

    const items = (detail.items || []).map((i) => ({
      ...i,
      amt: i.amt !== undefined ? Number(i.amt || 0) : undefined,
      amount: i.amount !== undefined ? Number(i.amount || 0) : undefined,
    }));

    await apiClient.put(`/api/payroll/statements/${payrollKey}`, { items });
    await loadDetail(payrollKey);
    await loadList();
    alert("저장되었습니다.");
  }

  async function confirmSelected() {
    const api = gridApiRef.current;
    if (!api) return alert("그리드가 준비되지 않았습니다.");

    const selectedRows = api.getSelectedRows();
    if (selectedRows.length === 0) return alert("선택된 항목이 없습니다.");

    if (selectedRows.some((r) => isConfirmed(r))) {
      return alert("이미 확정된 항목이 포함되어 있습니다.");
    }

    const payrollIds = selectedRows
      .map((r) => getPayrollKey(r))
      .filter(Boolean);

    if (payrollIds.length === 0) {
      return alert("선택된 항목에서 payroll 키를 찾지 못했습니다.");
    }

    await apiClient.post("/api/payroll/statements/confirm", { payrollIds });
    await loadList();
    alert("확정되었습니다. (사원 이메일이 있으면 급여명세서 Excel이 발송됩니다.)");
  }

  async function deleteSelected() {
    const api = gridApiRef.current;
    if (!api) return alert("그리드가 준비되지 않았습니다.");

    const selectedRows = api.getSelectedRows();
    if (selectedRows.length === 0) return alert("선택된 항목이 없습니다.");

    if (selectedRows.some((r) => isConfirmed(r))) {
      return alert("확정된 명세서는 삭제할 수 없습니다.");
    }

    const payrollIds = selectedRows
      .map((r) => getPayrollKey(r))
      .filter(Boolean);

    if (payrollIds.length === 0) {
      return alert("선택된 항목에서 payroll 키를 찾지 못했습니다.");
    }

    await apiClient.delete("/api/payroll/statements", {
      data: { payrollIds },
    });
    await loadList();
    alert("삭제되었습니다.");
  }

  async function emailPreview() {
    if (!detail) return;

    const payrollKey = getPayrollKey(detail);
    if (!payrollKey) {
      return alert("payroll 키가 없어 메일 샘플을 열 수 없습니다.");
    }

    const { data } = await apiClient.get(
      `/api/payroll/statements/${payrollKey}/email-preview`,
    );

    const win = window.open("", "_blank");
    if (!win) return alert("팝업이 차단되었습니다.");

    win.document.write(
      `<pre style="white-space:pre-wrap;font-family:ui-monospace,monospace;">${data?.subject ?? ""}\n\n${data?.body ?? ""}</pre>`,
    );
    win.document.close();
  }

  async function downloadExcel() {
    if (!detail) return;

    const payrollKey = getPayrollKey(detail);
    if (!payrollKey) return alert("payroll 키가 없어 Excel를 받을 수 없습니다.");

    const res = await apiClient.get(
      `/api/payroll/statements/${payrollKey}/excel`,
      { responseType: "blob" },
    );

    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `급여명세서_${getPayYm(detail) || ""}_${detail.empNm || ""}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className={clsx(styled.wrap, styled.test)}>
      <div className={styled.headerRow}>
        <div className={styled.titleBox}>
          <div className={styled.title}>급여 명세서</div>
          <div className={styled.subTitle}>월별 조회 / 확정 / 수정</div>
        </div>

        <div className={styled.headerActions}>

            <button
                                    className={clsx(styled.btn, styled.btnPrimary)}
                                    onClick={generate}
                                >
                                    <FilePlus2 size={16} /> 명세서 생성
                                </button>

          <button
            className={clsx(styled.btn, styled.btnGhost)}
            onClick={emailPreview}
            disabled={!detail}
          >
            <Mail size={16} /> 메일 샘플
          </button>

          <button
            className={clsx(styled.btn, styled.btnGhost)}
            onClick={downloadExcel}
            disabled={!detail}
          >
            <Download size={16} /> Excel
          </button>

          <button
            className={clsx(styled.btn, styled.btnPrimary)}
            onClick={saveDetail}
            disabled={!detail || isConfirmed(detail)}
          >
            <Save size={16} /> 저장
          </button>
        </div>
      </div>

      <div className={styled.contentSplit}>
        <div className={styled.leftPanel}>
          <div className={styled.panelTopBar}>
            <div className={styled.filterRow}>
              <div
                className={styled.monthField}
                onClick={openMonthPicker}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openMonthPicker();
                  }
                }}
              >
                <CalendarDays size={16} className={styled.monthFieldIcon} />
                <span className={styled.monthFieldText}>
                  {displayMonth(selectedYm)}
                </span>
                <input
                  ref={monthInputRef}
                  type="month"
                  value={ymToMonthValue(selectedYm)}
                  onChange={handleMonthChange}
                  className={styled.monthFieldInput}
                  aria-label="기준 월 선택"
                  tabIndex={-1}
                />
              </div>
            </div>

            <div className={styled.listActions}>
              <button
                className={clsx(styled.btn, styled.btnGhost)}
                onClick={confirmSelected}
              >
                <CheckCircle2 size={16} /> 명세서 확정
              </button>
              <button
                className={clsx(styled.btn, styled.btnGhost)}
                onClick={deleteSelected}
              >
                <Trash2 size={16} /> 선택 삭제
              </button>
            </div>
          </div>

          <div
            className={clsx("ag-theme-quartz", styled.grid)}
            style={{ width: "100%" }}
          >
            <AgGridReact
              theme={themeQuartz}
              rowData={rows}
              columnDefs={colDefs}
              defaultColDef={defaultColDef}
              rowSelection={{
                mode: "multiRow",
                checkboxes: true,
                headerCheckbox: true,
                enableClickSelection: false,
              }}
              onRowClicked={(e) => loadDetail(getPayrollKey(e.data))}
              onGridReady={(p) => {
                gridApiRef.current = p.api;
              }}
            />
          </div>
        </div>

        <div className={styled.rightPanel}>
          <div className={styled.rightScroll}>
            <div className={styled.sectionCard}>
              <div className={styled.sectionHeaderRow}>
                <div className={styled.sectionHeader}>명세서 상세</div>
              </div>

              {!detail ? (
                <div className={styled.empty}>
                  왼쪽 목록에서 명세서를 선택하세요.
                </div>
              ) : (
                <>
                  <div className={styled.metaGrid}>
                    <div className={styled.metaItem}>
                      <div className={styled.metaLabel}>사원</div>
                      <div className={styled.metaValue}>{detail.empNm}</div>
                    </div>
                    <div className={styled.metaItem}>
                      <div className={styled.metaLabel}>부서</div>
                      <div className={styled.metaValue}>{detail.deptNm}</div>
                    </div>
                    <div className={styled.metaItem}>
                      <div className={styled.metaLabel}>직위</div>
                      <div className={styled.metaValue}>{detail.posNm}</div>
                    </div>
                    <div className={styled.metaItem}>
                      <div className={styled.metaLabel}>기준월</div>
                      <div className={styled.metaValue}>{getPayYm(detail)}</div>
                    </div>
                    <div className={styled.metaItem}>
                      <div className={styled.metaLabel}>이메일</div>
                      <div className={styled.metaValue}>
                        {detail.email ?? "-"}
                      </div>
                    </div>
                  </div>

                  {(() => {
                    const slip = buildSlip(detail);
                    return (
                      <div className={styled.slipCard}>
                        <div className={styled.slipTitle}>급여 명세서</div>

                        <div className={styled.slipTables}>
                          <div className={styled.slipTableBox}>
                            <div className={styled.slipTableHead}>[지급]</div>
                            <table className={styled.slipTable}>
                              <tbody>
                                {slip.pay.map((i, idx) => (
                                  <tr
                                    key={
                                      i.itemDetailNo ??
                                      i.itemCode ??
                                      `PAY-${idx}`
                                    }
                                  >
                                    <td className={styled.slipName}>
                                      {slip.label(i)}
                                    </td>
                                    <td className={styled.slipAmt}>
                                      {fmtMoney(i.amount ?? i.amt ?? 0)}
                                    </td>
                                  </tr>
                                ))}
                                <tr className={styled.slipTotalRow}>
                                  <td className={styled.slipName}>지급총액</td>
                                  <td className={styled.slipAmt}>
                                    {fmtMoney(slip.paySum)}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          <div className={styled.slipTableBox}>
                            <div className={styled.slipTableHead}>[공제]</div>
                            <table className={styled.slipTable}>
                              <tbody>
                                {slip.deduct.map((i, idx) => (
                                  <tr
                                    key={
                                      i.itemDetailNo ??
                                      i.itemCode ??
                                      `DEDUCT-${idx}`
                                    }
                                  >
                                    <td className={styled.slipName}>
                                      {slip.label(i)}
                                    </td>
                                    <td className={styled.slipAmt}>
                                      {fmtMoney(i.amount ?? i.amt ?? 0)}
                                    </td>
                                  </tr>
                                ))}
                                <tr className={styled.slipTotalRow}>
                                  <td className={styled.slipName}>공제합계</td>
                                  <td className={styled.slipAmt}>
                                    {fmtMoney(slip.deductSum)}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className={styled.slipNetRow}>
                          <div className={styled.slipNetLabel}>실지급액</div>
                          <div className={styled.slipNetAmt}>
                            {fmtMoney(slip.net)}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <details className={styled.rawDetail}>
                    <summary>상세 항목(편집/저장)</summary>
                    <div
                      className={clsx("ag-theme-quartz", styled.gridSmall)}
                      style={{ width: "100%" }}
                    >
                      <AgGridReact
                        theme={themeQuartz}
                        rowData={(detail.items || []).filter((i) => {
                          const t = normalizeItemType(i);
                          return t === "PAY" || t === "DEDUCT";
                        })}
                        columnDefs={dtlCols}
                        stopEditingWhenCellsLoseFocus
                        onCellValueChanged={() => {
                          setDetail((prev) =>
                            prev
                              ? { ...prev, items: [...(prev.items || [])] }
                              : prev,
                          );
                        }}
                      />
                    </div>
                  </details>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}