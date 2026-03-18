import React, { useMemo } from "react";
import clsx from "clsx";
import { X } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";

import styled from "./StepRateHistoryModal.module.css";

export default function StepRateHistoryModal({ open, onClose, salaryStep, rows }) {
  const cols = useMemo(
    () => [
      { headerName: "호봉", field: "salaryStep", width: 90 },
      { headerName: "가산율(%)", field: "increaseRate", width: 120 },
      { headerName: "사용여부", field: "useYn", width: 100 },
      { headerName: "적용시작", field: "startDtm", width: 120 },
      { headerName: "적용종료", field: "endDtm", width: 120 },
    ],
    [],
  );

  if (!open) return null;

  return (
    <div className={styled.backdrop} onMouseDown={onClose}>
      <div className={styled.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styled.modalHeader}>
          <div>
            <div className={styled.modalTitle}>호봉 가산율 이력</div>
            <div className={styled.modalSub}>호봉: {salaryStep ?? "-"}</div>
          </div>
          <button className={styled.iconBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styled.modalBody}>
          <div className={clsx("ag-theme-alpine", styled.grid)}>
            <AgGridReact
              theme={themeQuartz}
              rowData={rows || []}
              columnDefs={cols}
              suppressCellFocus
              domLayout="autoHeight"
            />
          </div>

          {(rows || []).length === 0 && <div className={styled.empty}>등록된 이력이 없습니다.</div>}
        </div>
      </div>
    </div>
  );
}
