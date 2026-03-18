import React, { useMemo, useRef } from "react";
import clsx from "clsx";
import { Plus, Trash2 } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";

import styled from "./SalaryManageRightPanel.module.css";

export default function SalaryManageRightPanel({
    selectedEmp,
    empPayInfo,
    setEmpPayInfo,
    empAllowances,
    setEmpAllowances,
    onOpenAllowanceModal,
}) {
    const allowGridApiRef = useRef(null);

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

    const allowCols = useMemo(
        () => [
            {
                headerName: "수당코드",
                field: "salaryItemCode",
                flex: 1,
                minWidth: 90,
            },
            {
                headerName: "수당명",
                field: "salaryItemName",
                flex: 2,
                minWidth: 130,
            },
            {
                headerName: "금액",
                field: "itemAmount",
                flex: 1,
                minWidth: 80,
                editable: true,
            },
            {
                headerName: "적용시작",
                field: "startDtm",
                flex: 1,
                minWidth: 100,
                editable: true,
            },
            {
                headerName: "적용종료",
                field: "endDtm",
                flex: 1,
                minWidth: 100,
                editable: true,
            },
        ],
        [],
    );

    const deleteSelectedAllowances = () => {
        const api = allowGridApiRef.current;
        if (!api) return;

        const selected = api.getSelectedRows?.() || [];
        if (selected.length === 0) {
            alert("삭제할 수당을 선택하세요.");
            return;
        }

        const selectedCodes = new Set(selected.map((r) => r.salaryItemCode));
        setEmpAllowances((prev) =>
            (prev || []).filter((r) => !selectedCodes.has(r.salaryItemCode)),
        );
        api.deselectAll?.();
    };

    return (
        <div className={styled.rightPanel}>
            <div className={styled.rightScroll}>
                <div className={styled.sectionCard}>
                    <div className={styled.sectionHeader}>
                        개인 기준금액 관리
                    </div>

                    <div className={styled.formBox}>
                        {/* 선택사원 / 사원번호 */}
                        <div className={styled.pairRow}>
                            <div className={styled.formRow}>
                                <label>선택 사원</label>
                                <input
                                    value={selectedEmp ? selectedEmp.empNm : ""}
                                    disabled
                                    placeholder="사원을 선택하세요"
                                />
                            </div>

                            <div className={styled.formRow}>
                                <label>사원 번호</label>
                                <input
                                    value={empPayInfo.empNo ?? ""}
                                    disabled
                                />
                            </div>
                        </div>

                        {/* 기준금액 */}
                        <div className={styled.pairRow}>
                            <div className={styled.formRow}>
                                <label>기준금액(원)</label>
                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={
                                        empPayInfo.usePositionBase
                                            ? (empPayInfo.appliedBaseAmt ?? "")
                                            : (empPayInfo.baseAmt ?? "")
                                    }
                                    disabled={!!empPayInfo.usePositionBase}
                                    onChange={(e) =>
                                        setEmpPayInfo((v) => ({
                                            ...v,
                                            baseAmt:
                                                e.target.value === ""
                                                    ? ""
                                                    : e.target.value.replace(
                                                          /[^\d]/g,
                                                          "",
                                                      ),
                                        }))
                                    }
                                    placeholder={
                                        empPayInfo.usePositionBase
                                            ? "직위 기준금액 적용"
                                            : "개인 기준금액 입력"
                                    }
                                />
                            </div>

                            <div className={styled.formRow}>
                                <label className={styled.checkLabel}>
                                    <input
                                        type="checkbox"
                                        checked={!!empPayInfo.usePositionBase}
                                        onChange={(e) =>
                                            setEmpPayInfo((v) => ({
                                                ...v,
                                                usePositionBase:
                                                    e.target.checked,
                                                baseAmt: e.target.checked
                                                    ? ""
                                                    : v.baseAmt,
                                            }))
                                        }
                                    />
                                    직위 기준금 적용
                                </label>
                            </div>
                        </div>

                        {/* 급여계좌은행 / 계좌번호 */}
                        <div className={styled.pairRow}>
                            <div className={styled.formRow}>
                                <label>급여계좌은행</label>
                                <input
                                    value={empPayInfo.bankName ?? ""}
                                    onChange={(e) =>
                                        setEmpPayInfo((prev) => ({
                                            ...prev,
                                            bankName: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <div className={styled.formRow}>
                                <label>계좌번호</label>
                                <input
                                    value={empPayInfo.accntNo ?? ""}
                                    onChange={(e) =>
                                        setEmpPayInfo((prev) => ({
                                            ...prev,
                                            accntNo: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>

                        {/* 공제대상가족수 / 호봉 */}
                        <div className={styled.pairRow}>
                            <div className={styled.formRow}>
                                <label>공제대상가족수</label>
                                <input
                                    value={empPayInfo.deductFamCnt ?? ""}
                                    onChange={(e) =>
                                        setEmpPayInfo((prev) => ({
                                            ...prev,
                                            deductFamCnt: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <div className={styled.formRow}>
                                <label>호봉</label>
                                <input
                                    value={empPayInfo.salaryGrade ?? ""}
                                    onChange={(e) =>
                                        setEmpPayInfo((prev) => ({
                                            ...prev,
                                            salaryGrade: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>

                        {/* 적용일 */}
                        <div className={styled.pairRow}>
                            <div className={styled.formRow}>
                                <label>적용일</label>
                                <input
                                    value={empPayInfo.startDtm ?? ""}
                                    disabled
                                    placeholder="YYYY-MM-DD"
                                />
                            </div>
                        </div>

                        {/* 조정사유 */}
                        <div className={styled.formRow}>
                            <label>조정사유</label>
                            <input
                                value={empPayInfo.adjustRsn ?? ""}
                                onChange={(e) =>
                                    setEmpPayInfo((prev) => ({
                                        ...prev,
                                        adjustRsn: e.target.value,
                                    }))
                                }
                            />
                        </div>
                    </div>
                </div>

                <div className={styled.sectionCard}>
                    <div className={styled.sectionHeaderRow}>
                        <span className={styled.sectionHeader}>
                            사원별 수당
                        </span>

                        <div className={styled.sectionHeaderActions}>
                            <button
                                type="button"
                                className={clsx(
                                    styled.btnSmall,
                                    styled.btnDanger,
                                )}
                                onClick={deleteSelectedAllowances}
                                disabled={!selectedEmp}
                                title="선택 수당 삭제"
                            >
                                <Trash2 size={14} />
                                삭제
                            </button>
                        </div>
                    </div>

                    <div className={clsx("ag-theme-alpine", styled.gridSmall)}>
                        <AgGridReact
                            theme={themeQuartz}
                            rowData={empAllowances}
                            columnDefs={allowCols}
                            {...gridDefaults}
                            rowSelection={{
                                mode: "multiRow",
                                checkboxes: true,
                                headerCheckbox: true,
                                enableClickSelection: true,
                            }}
                            onGridReady={(params) => {
                                allowGridApiRef.current = params.api;
                                params.api.sizeColumnsToFit();
                            }}
                            onGridSizeChanged={(params) =>
                                params.api.sizeColumnsToFit()
                            }
                            stopEditingWhenCellsLoseFocus
                            onCellValueChanged={(e) => {
                                const next = [...empAllowances];
                                next[e.rowIndex] = {
                                    ...next[e.rowIndex],
                                    ...e.data,
                                };
                                setEmpAllowances(next);
                            }}
                        />

                        <button
                            type="button"
                            className={styled.gridPlusBtn}
                            onClick={onOpenAllowanceModal}
                            disabled={!selectedEmp}
                            title="수당 추가"
                            aria-label="수당 추가"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
