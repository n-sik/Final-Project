// Position.jsx
import React from "react";
import clsx from "clsx";
import styled from "./Registration.module.css";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

const SortableRow = ({ pos, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pos.posCd });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? "#f0f4ff" : undefined,
    boxShadow: isDragging ? "0 4px 16px rgba(79,70,229,0.15)" : undefined,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={styled.sortableRow}
    >
      {/* 드래그 핸들: GripVertical 아이콘만 핸들 역할 */}
      <td className={styled.dragHandleTd}>
        <span
          className={styled.dragHandle}
          {...listeners}
          title="드래그하여 순서 변경"
        >
          <GripVertical size={16} />
        </span>
        <span className={styled.levelBadge}>{pos.posLvl}</span>
      </td>
      {children}
    </tr>
  );
};

export default function Position({
  positions,
  handleAddRow,
  handleSaveAll,
  handleDragEnd,
  editingCell,
  setEditingCell,
  handleDoubleClick,
  handleEditComplete,
  handleCancelEdit,
}) {
  return (
    <div className={styled.listSide}>
      <div className={styled.sideHeader}>
        <h3>
          직위 목록
          <span className={styled.countTag}>총 {positions.length}개</span>
        </h3>
        <div className={styled.btnGroup}>
          <button onClick={handleAddRow} className={styled.btnOutline}>
            + 행 추가
          </button>
          <button onClick={handleSaveAll} className={styled.btnPrimary}>
            저장
          </button>
        </div>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className={styled.tableWrapper}>
          <table className={styled.dataTable}>
            <thead>
              <tr>
                <th style={{ width: "125px", textAlign: "center" }}>레벨</th>
                <th style={{ width: "220px" }}>직위코드</th>
                <th>
                  직위명 <span className={styled.editHint}>더블클릭 수정</span>
                </th>
                <th style={{ width: "125px", textAlign: "center" }}>사용</th>
              </tr>
            </thead>
            <SortableContext
              items={positions.map((p) => p.posCd)}
              strategy={verticalListSortingStrategy}
            >
              <tbody>
                {positions.map((pos) => (
                  <SortableRow key={pos.posCd} pos={pos}>
                    <td>
                      <span
                        className={clsx(
                          styled.codeChip,
                          pos.isNew && styled.codeChipNew,
                        )}
                      >
                        {pos.posCd}
                      </span>
                    </td>

                    <td
                      className={styled.editableCell}
                      onDoubleClick={() =>
                        handleDoubleClick(pos.posCd, "posNm")
                      }
                    >
                      {editingCell?.posCd === pos.posCd &&
                      editingCell?.field === "posNm" ? (
                        <input
                          autoFocus
                          className={styled.inlineInput}
                          value={pos.posNm}
                          onChange={(e) =>
                            handleEditComplete(
                              pos.posCd,
                              "posNm",
                              e.target.value,
                            )
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") setEditingCell(null);
                            if (e.key === "Escape") handleCancelEdit();
                          }}
                          onBlur={() => setEditingCell(null)}
                          onMouseDown={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className={styled.editableText}>{pos.posNm}</span>
                      )}
                    </td>

                    <td style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        className={styled.modernCheckbox}
                        checked={pos.useYn === "Y"}
                        onMouseDown={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          handleEditComplete(
                            pos.posCd,
                            "useYn",
                            e.target.checked ? "Y" : "N",
                          )
                        }
                      />
                    </td>
                  </SortableRow>
                ))}
              </tbody>
            </SortableContext>
          </table>
        </div>
      </DndContext>

      <p className={styled.editHint}>
        💡 <b>직위명</b> 셀을 더블클릭하여 수정할 수 있습니다.
      </p>
    </div>
  );
}
