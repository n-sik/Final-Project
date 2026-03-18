import React, { useMemo } from "react";
import clsx from "clsx";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";

import styled from "./BaseTab.module.css";

export default function BaseTab({
  gradeBaseAmtRows,
  posList,
  selectedPos,
  setSelectedPos,
  posBaseAmtForm,
  setPosBaseAmtForm,
  loadPosBaseAmt,
  onOpenHistory,
}) {
  const fitCols = (api) => {
    // ag-grid는 초기 레이아웃/데이터 반영 타이밍에 따라 sizeColumnsToFit이 누락되는 경우가 있어
    // requestAnimationFrame으로 한 번 더 보정한다.
    try {
      api.sizeColumnsToFit();
      requestAnimationFrame(() => api.sizeColumnsToFit());
    } catch {
      // no-op
    }
  };

  const gridDefaults = useMemo(
    () => ({
      defaultColDef: {
        resizable: false,
        sortable: true,
        suppressMovable: true,
      },
      suppressCellFocus: true,
    }),
    [],
  );

  const gradeBaseCols = useMemo(
    () => [
      {
        headerName: "직위",
        field: "posCd",
        flex: 1,
        headerClass: styled.headerCenter,
        cellClass: styled.cellCenter,
        valueFormatter: (p) => {
          const cd = p.value;
          const pos = posList.find((x) => x.posCd === cd);
          return pos?.posNm || cd || "";
        },
      },
      {
        headerName: "기준금액",
        field: "stdAmt",
        flex: 1,
        headerClass: styled.headerRight,
        cellClass: styled.cellRight,
      },
      {
        headerName: "적용일",
        field: "startDtm",
        flex: 1,
        headerClass: styled.headerCenter,
        cellClass: styled.cellCenter,
      },
      {
        headerName: "이력",
        field: "history",
        flex: 1,
        headerClass: styled.headerCenter,
        cellClass: styled.cellCenter,
        cellRenderer: (p) => (
          <button
            type="button"
            className={styled.historyBtn}
            title="직위별 기준금액 이력"
            onClick={(e) => {
              e.stopPropagation();
              onOpenHistory?.(p.data);
            }}
          >
            <i className="bi bi-info-circle" />
          </button>
        ),
      },
    ],
    [posList, onOpenHistory],
  );

  return (
    <div className={styled.innerSplit}>
      <div className={styled.innerLeft}>
        <div className={clsx("ag-theme-alpine", styled.grid)}>
          <AgGridReact
            theme={themeQuartz}
            rowData={gradeBaseAmtRows}
            columnDefs={gradeBaseCols}
            {...gridDefaults}
            rowSelection={{ mode: "singleRow", enableClickSelection: true }}
            onGridReady={(p) => fitCols(p.api)}
            onFirstDataRendered={(p) => fitCols(p.api)}
            onGridSizeChanged={(p) => fitCols(p.api)}
            onRowClicked={(e) => {
              const row = e.data;
              const pos = posList.find((p) => p.posCd === row?.posCd) || null;
              setSelectedPos(pos);
              // 적용일은 화면에서 수정 불가 (저장 로직은 '오늘' 기준)
              setPosBaseAmtForm({
                posCd: row?.posCd ?? "",
                stdAmt: row?.stdAmt ?? "",
                startDtm: posBaseAmtForm.startDtm,
              });
            }}
          />
        </div>
      </div>

      <div className={styled.innerRight}>
        <div className={styled.formBox}>
          <div className={styled.formRow}>
            <label>직위</label>
            <select
              value={selectedPos?.posCd ?? ""}
              onChange={(e) => {
                const posCd = e.target.value;
                const pos = posList.find((p) => p.posCd === posCd) || null;
                setSelectedPos(pos);
                loadPosBaseAmt(posCd);
              }}
            >
              <option value="">선택</option>
              {posList.map((p) => (
                <option key={p.posCd} value={p.posCd}>
                  {p.posNm}
                </option>
              ))}
            </select>
          </div>

          <div className={styled.formRow}>
            <label>기준금액</label>
            <input
              value={posBaseAmtForm.stdAmt}
              onChange={(e) =>
                setPosBaseAmtForm((v) => ({
                  ...v,
                  stdAmt: e.target.value,
                }))
              }
              placeholder="예) 3000000"
            />
          </div>

          <div className={styled.formRow}>
            <label>적용일</label>
            <input value={posBaseAmtForm.startDtm} disabled />
          </div>

          <div className={styled.hint}>
            ※ 저장 기준은 "오늘"입니다. (오늘 수정하면 UPDATE, 다른 날 수정하면 이력이 누적됩니다.)
          </div>
        </div>
      </div>
    </div>
  );
}
