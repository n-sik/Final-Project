import React, { useMemo } from "react";
import clsx from "clsx";
import { Plus } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";

import styled from "./AllowTab.module.css";

export default function AllowTab({ allowDefRows, allowDefForm, setAllowDefForm }) {
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

    const allowDefCols = useMemo(
        () => [
            { headerName: "코드", field: "salaryItemCode", width: 140 },
            { headerName: "수당명", field: "salaryItemName", flex: 1 },
            { headerName: "구분", field: "itemType", width: 120 },
            { headerName: "과세", field: "taxType", width: 120 },
        ],
        [],
    );

    return (
        <div className={styled.innerSplit}>
            <div className={styled.innerLeft}>
                {/* ✅ 그리드 내부(테두리 안) 하단 중앙 + 버튼 */}
                <div className={clsx("ag-theme-alpine", styled.grid)}>
                    <AgGridReact
                        theme={themeQuartz}
                        rowData={allowDefRows}
                        columnDefs={allowDefCols}
                        {...gridDefaults}
                        rowSelection={{ mode: "singleRow", enableClickSelection: true }}
                        onRowClicked={(e) => setAllowDefForm({ ...e.data })}
                    />

                    <button
                        type="button"
                        className={styled.gridPlusBtn}
                        onClick={() =>
                            setAllowDefForm({
                                salaryItemCode: "",
                                salaryItemName: "",
                                itemType: "지급",
                                taxType: "과세",
                            })
                        }
                        title="신규 등록"
                        aria-label="신규 등록"
                    >
                        <Plus size={18} />
                    </button>
                </div>
            </div>

            <div className={styled.innerRight}>
                <div className={styled.formBox}>
                    <div className={styled.formRow}>
                        <label>코드</label>
                        <div
                            className={styled.codeBox}
                            title={allowDefForm.salaryItemCode ? "저장된 코드" : "신규 등록 시 자동 생성"}
                        >
                            {allowDefForm.salaryItemCode ? allowDefForm.salaryItemCode : "(자동 생성)"}
                        </div>
                    </div>
                    <div className={styled.formRow}>
                        <label>수당명</label>
                        <input
                            value={allowDefForm.salaryItemName}
                            onChange={(e) =>
                                setAllowDefForm((v) => ({
                                    ...v,
                                    salaryItemName: e.target.value,
                                }))
                            }
                        />
                    </div>
                    <div className={styled.formRow}>
                        <label>구분</label>
                        <select
                            value={allowDefForm.itemType}
                            onChange={(e) =>
                                setAllowDefForm((v) => ({
                                    ...v,
                                    itemType: e.target.value,
                                }))
                            }
                        >
                            <option value="지급">지급</option>
                            <option value="공제">공제</option>
                        </select>
                    </div>
                    <div className={styled.formRow}>
                        <label>과세</label>
                        <select
                            value={allowDefForm.taxType}
                            onChange={(e) =>
                                setAllowDefForm((v) => ({
                                    ...v,
                                    taxType: e.target.value,
                                }))
                            }
                        >
                            <option value="과세">과세</option>
                            <option value="비과세">비과세</option>
                        </select>
                    </div>

                    <div className={styled.hint}>
                        ※ 신규 등록 시 코드는 자동 생성됩니다. (목록에서 선택하면 수정)
                    </div>
                </div>
            </div>
        </div>
    );
}
