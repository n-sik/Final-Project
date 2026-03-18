import React, { useMemo } from "react";
import clsx from "clsx";
import { X } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";

import styled from "./EmpPayInfoHistoryModal.module.css";

export default function EmpPayInfoHistoryModal({ open, onClose, emp, rows }) {
  const cols = useMemo(
    () => [
      { headerName: "PAY_SEQ", field: "paySeq", width: 110 },
      { headerName: "기준금액", field: "baseAmt", width: 120 },
      { headerName: "은행", field: "bankName", width: 110 },
      { headerName: "계좌번호", field: "accntNo", flex: 1, minWidth: 160 },
      { headerName: "공제대상가족수", field: "deductFamCnt", width: 140 },
      { headerName: "호봉", field: "salaryGrade", width: 90 },
      { headerName: "조정사유", field: "adjustRsn", flex: 1, minWidth: 180 },
      { headerName: "적용시작", field: "startDtm", width: 110 },
      { headerName: "적용종료", field: "endDtm", width: 110 },
    ],
    [],
  );

  if (!open) return null;

  return (
    <div className={styled.backdrop} onMouseDown={onClose}>
      <div className={styled.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styled.modalHeader}>
          <div>
            <div className={styled.modalTitle}>개인 기준금액 이력</div>
            <div className={styled.modalSub}>
              {emp?.empNm ?? ""} ({emp?.empNo ?? ""})
            </div>
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

          {(rows || []).length === 0 && (
            <div className={styled.empty}>등록된 이력이 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
}
