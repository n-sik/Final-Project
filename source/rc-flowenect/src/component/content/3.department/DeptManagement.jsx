import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { Pencil, Plus, RefreshCcw, Trash2 } from "lucide-react";

import apiClient from "../../../api/apiClient";
import {
  createDept,
  deleteDept,
  fetchDeptDetail,
  fetchDepts,
  fetchDeptTypes,
  restoreDept,
  updateDept,
} from "../../../api/deptApi";
import contentSty from "../Content.module.css";
import sty from "./DeptManagement.module.css";

let MODE = {
  VIEW: "VIEW",
  EDIT: "EDIT",
  CREATE: "CREATE",
};

let DEFAULT_FILTER = {
  delYn: "N",
  searchField: "ALL",
};

let SEARCH_FIELD_OPTIONS = [
  { value: "ALL", label: "전체 항목" },
  { value: "deptCd", label: "부서코드" },
  { value: "deptNm", label: "부서명" },
  { value: "deptTypeNm", label: "부서종류" },
  { value: "upDeptNm", label: "상위부서" },
  { value: "deptHeadEmpNm", label: "부서장" },
  { value: "deptTel", label: "대표전화" },
  { value: "deptLoc", label: "위치" },
];

function normalizeDeptToForm(d) {
  return {
    deptCd: d?.deptCd ?? "",
    deptNm: d?.deptNm ?? "",
    deptTypeCd: d?.deptTypeCd ?? "",
    upDeptCd: d?.upDeptCd ?? "",
    deptHeadEmpNo: d?.deptHeadEmpNo ?? "",
    deptLoc: d?.deptLoc ?? "",
    deptTel: d?.deptTel ?? "",
    delYn: d?.delYn ?? "N",
  };
}

function isSameForm(a, b) {
  let keys = [
    "deptCd",
    "deptNm",
    "deptTypeCd",
    "upDeptCd",
    "deptHeadEmpNo",
    "deptLoc",
    "deptTel",
    "delYn",
  ];
  return keys.every((k) => String(a?.[k] ?? "") === String(b?.[k] ?? ""));
}

function statusLabel(delYn) {
  return delYn === "Y" ? "삭제" : "사용";
}

function statusClass(delYn) {
  return delYn === "Y" ? sty.st_DELETED : sty.st_USE;
}

function getErrorMessage(error, fallbackMsg) {
  let data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data.trim();
  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message.trim();
  }
  return fallbackMsg;
}

function buildAncestorPath(allDepts, startDeptCd) {
  if (!startDeptCd) return [];

  let map = new Map((allDepts || []).map((d) => [String(d.deptCd), d]));
  let path = [];
  let cursor = String(startDeptCd);
  let guard = 0;

  while (cursor) {
    let current = map.get(cursor);
    if (!current) break;
    path.unshift(cursor);

    let next = current.upDeptCd ? String(current.upDeptCd) : "";
    if (!next) break;

    cursor = next;
    guard += 1;
    if (guard > 200) break;
  }

  return path;
}

function buildDescendantSet(allDepts, deptCd) {
  if (!deptCd) return new Set();

  let childrenMap = new Map();
  (allDepts || []).forEach((d) => {
    let parent = d?.upDeptCd ? String(d.upDeptCd) : "";
    if (!parent) return;
    if (!childrenMap.has(parent)) childrenMap.set(parent, []);
    childrenMap.get(parent).push(String(d.deptCd));
  });

  let result = new Set();
  let stack = [String(deptCd)];
  let guard = 0;

  while (stack.length > 0) {
    let current = stack.pop();
    let children = childrenMap.get(current) || [];
    children.forEach((childCd) => {
      if (result.has(childCd)) return;
      result.add(childCd);
      stack.push(childCd);
    });

    guard += 1;
    if (guard > 5000) break;
  }

  return result;
}

function getHierarchyRowLabel(level) {
  return `${level + 1}차 상위부서`;
}

function getSearchPlaceholder(searchField) {
  switch (searchField) {
    case "deptCd":
      return "부서코드 검색";
    case "deptNm":
      return "부서명 검색";
    case "deptTypeNm":
      return "부서종류 검색";
    case "upDeptNm":
      return "상위부서 검색";
    case "deptHeadEmpNm":
      return "부서장 검색";
    case "deptTel":
      return "대표전화 검색";
    case "deptLoc":
      return "위치 검색";
    default:
      return "부서코드, 부서명, 부서종류, 상위부서, 부서장, 대표전화, 위치 검색";
  }
}

export default function DeptManagement() {
  let [mode, setMode] = useState(MODE.VIEW);

  let [filters, setFilters] = useState(DEFAULT_FILTER);
  let [keywordDraft, setKeywordDraft] = useState("");
  let [keywordCommit, setKeywordCommit] = useState("");
  let isComposingRef = useRef(false);

  let [deptTypes, setDeptTypes] = useState([]);
  let [employees, setEmployees] = useState([]);
  let [positions, setPositions] = useState([]);
  let [hierarchyDepts, setHierarchyDepts] = useState([]);

  let [depts, setDepts] = useState([]);
  let [selectedDeptCd, setSelectedDeptCd] = useState(null);
  let [selectedDept, setSelectedDept] = useState(null);

  let [form, setForm] = useState(normalizeDeptToForm(null));
  let baselineRef = useRef(normalizeDeptToForm(null));
  let [parentSelections, setParentSelections] = useState([]);

  let [loading, setLoading] = useState(false);
  let [saving, setSaving] = useState(false);

  let canEditFields = mode === MODE.EDIT || mode === MODE.CREATE;
  let selectedIsDeleted = selectedDept?.delYn === "Y";

  let deptTypeNmByCd = useMemo(() => {
    let map = new Map();
    (deptTypes || []).forEach((t) => {
      if (t?.deptTypeCd) map.set(String(t.deptTypeCd), t.deptTypeNm ?? "");
    });
    return map;
  }, [deptTypes]);

  let deptNmByCd = useMemo(() => {
    let map = new Map();
    (hierarchyDepts || []).forEach((d) => {
      if (d?.deptCd) map.set(String(d.deptCd), d.deptNm ?? "");
    });
    return map;
  }, [hierarchyDepts]);

  let posNmByCd = useMemo(() => {
    let map = new Map();
    (positions || []).forEach((p) => {
      if (p?.posCd) map.set(String(p.posCd), p.posNm ?? "");
    });
    return map;
  }, [positions]);

  let empByNo = useMemo(() => {
    let map = new Map();
    (employees || []).forEach((e) => {
      if (e?.empNo) map.set(String(e.empNo), e);
    });
    return map;
  }, [employees]);

  let activeHierarchyDepts = useMemo(() => {
    return (hierarchyDepts || []).filter((d) => d?.delYn !== "Y");
  }, [hierarchyDepts]);

  let forbiddenParentSet = useMemo(() => {
    if (mode !== MODE.EDIT || !form.deptCd) return new Set();
    let set = buildDescendantSet(activeHierarchyDepts, form.deptCd);
    set.add(String(form.deptCd));
    return set;
  }, [activeHierarchyDepts, form.deptCd, mode]);

  let filteredParentOptions = useMemo(() => {
    return activeHierarchyDepts.filter(
      (d) => !forbiddenParentSet.has(String(d.deptCd)),
    );
  }, [activeHierarchyDepts, forbiddenParentSet]);

  let parentRows = useMemo(() => {
    let rows = [];
    let parentCd = "";
    let level = 0;

    while (true) {
      let options = filteredParentOptions.filter((d) => {
        let upCd = d?.upDeptCd ? String(d.upDeptCd) : "";
        return upCd === parentCd;
      });

      if (options.length === 0) break;

      let value = parentSelections[level] ?? "";
      rows.push({
        level,
        label: getHierarchyRowLabel(level),
        value,
        options,
      });

      if (!value) break;

      parentCd = String(value);
      level += 1;

      if (level > 50) break;
    }

    return rows;
  }, [filteredParentOptions, parentSelections]);

  let selectedParentPreview = useMemo(() => {
    let labels = (parentSelections || [])
      .filter(Boolean)
      .map((deptCd) => deptNmByCd.get(String(deptCd)) || String(deptCd));
    if (labels.length === 0) return "선택 안 함";
    return labels.join(" > ");
  }, [deptNmByCd, parentSelections]);

  let leaderOptions = useMemo(() => {
    return (employees || []).map((emp) => {
      let deptNm = deptNmByCd.get(String(emp.deptCd)) || "미지정 부서";
      let posNm = posNmByCd.get(String(emp.posCd)) || "미지정 직위";
      return {
        ...emp,
        optionLabel: `${deptNm} ${posNm} ${emp.empNm} (${emp.empNo})`,
      };
    });
  }, [deptNmByCd, employees, posNmByCd]);

  let apiParams = useMemo(() => {
    return {
      delYn: filters.delYn || "N",
      searchField: filters.searchField || "ALL",
      keyword: keywordCommit || undefined,
    };
  }, [filters.delYn, filters.searchField, keywordCommit]);

  let totalCount = depts.length;

  let isDirty = useMemo(() => {
    if (mode === MODE.VIEW) return false;
    return !isSameForm(form, baselineRef.current);
  }, [form, mode]);

  function syncParentSelectionsFromDept(upDeptCd, allDeptList) {
    let nextPath = buildAncestorPath(allDeptList, upDeptCd);
    setParentSelections(nextPath);
  }

  async function loadDeptTypes() {
    try {
      let list = await fetchDeptTypes();
      setDeptTypes(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
      setDeptTypes([]);
    }
  }

  async function loadEmployeesAndPositions() {
    try {
      let [empRes, posRes] = await Promise.all([
        apiClient.get("/api/emp/list"),
        apiClient.get("/api/emp/positions", { params: { useYn: "Y" } }),
      ]);

      setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
      setPositions(Array.isArray(posRes.data) ? posRes.data : []);
    } catch (e) {
      console.error(e);
      setEmployees([]);
      setPositions([]);
    }
  }

  async function loadHierarchyDepts() {
    try {
      let list = await fetchDepts({ delYn: "ALL" });
      let safeList = Array.isArray(list) ? list : [];
      setHierarchyDepts(safeList);
      return safeList;
    } catch (e) {
      console.error(e);
      setHierarchyDepts([]);
      return [];
    }
  }

  async function loadDepts(nextSelectedCd = null, paramsOverride = null, nextHierarchy = null) {
    setLoading(true);
    try {
      let list = await fetchDepts(paramsOverride ?? apiParams);
      let safeList = Array.isArray(list) ? list : [];
      setDepts(safeList);

      let keepCd = nextSelectedCd ?? selectedDeptCd;
      if (keepCd && safeList.some((d) => String(d.deptCd) === String(keepCd))) {
        await selectDept(keepCd, { silent: true, nextHierarchy: nextHierarchy ?? hierarchyDepts });
      } else {
        setSelectedDeptCd(null);
        setSelectedDept(null);
        if (mode === MODE.VIEW) {
          let empty = normalizeDeptToForm(null);
          setForm(empty);
          baselineRef.current = empty;
          setParentSelections([]);
        }
      }
    } catch (e) {
      console.error(e);
      alert(getErrorMessage(e, "부서 목록을 불러오지 못했습니다."));
    } finally {
      setLoading(false);
    }
  }

  async function selectDept(
    deptCd,
    { silent = false, nextHierarchy = null } = {},
  ) {
    if (!deptCd) return;

    if (mode !== MODE.VIEW && isDirty && !silent) {
      let ok = window.confirm(
        "저장하지 않은 변경사항이 있습니다. 이동하면 변경사항이 사라집니다. 이동할까요?",
      );
      if (!ok) return;
    }

    setMode(MODE.VIEW);
    setSelectedDeptCd(deptCd);
    setLoading(true);
    try {
      let detail = await fetchDeptDetail(deptCd);
      let safeDetail = detail ?? null;
      let allDeptList = nextHierarchy ?? hierarchyDepts;

      setSelectedDept(safeDetail);
      let f = normalizeDeptToForm(safeDetail);
      setForm(f);
      baselineRef.current = f;
      syncParentSelectionsFromDept(f.upDeptCd, allDeptList);
    } catch (e) {
      console.error(e);
      alert(getErrorMessage(e, "부서 상세를 불러오지 못했습니다."));
    } finally {
      setLoading(false);
    }
  }

  function startCreate() {
    if (mode !== MODE.VIEW && isDirty) {
      let ok = window.confirm(
        "저장하지 않은 변경사항이 있습니다. 이동하면 변경사항이 사라집니다. 등록 화면으로 이동할까요?",
      );
      if (!ok) return;
    }

    setMode(MODE.CREATE);
    setSelectedDeptCd(null);
    setSelectedDept(null);

    let empty = normalizeDeptToForm({ delYn: "N" });
    setForm(empty);
    baselineRef.current = empty;
    setParentSelections([]);
  }

  function startEdit() {
    if (!selectedDeptCd || !selectedDept) {
      alert("수정할 부서를 선택해 주세요.");
      return;
    }

    setMode(MODE.EDIT);
    let f = normalizeDeptToForm(selectedDept);
    setForm(f);
    baselineRef.current = f;
    syncParentSelectionsFromDept(f.upDeptCd, hierarchyDepts);
  }

  function cancelEdit() {
    if (mode === MODE.VIEW) return;

    let ok = true;
    if (isDirty) ok = window.confirm("변경사항을 취소할까요?");
    if (!ok) return;

    setMode(MODE.VIEW);
    if (selectedDept) {
      let f = normalizeDeptToForm(selectedDept);
      setForm(f);
      baselineRef.current = f;
      syncParentSelectionsFromDept(f.upDeptCd, hierarchyDepts);
    } else {
      let empty = normalizeDeptToForm(null);
      setForm(empty);
      baselineRef.current = empty;
      setParentSelections([]);
    }
  }

  function handleParentLevelChange(level, value) {
    let nextSelections = parentSelections.slice(0, level);
    if (value) nextSelections.push(value);
    setParentSelections(nextSelections);

    setForm((prev) => ({
      ...prev,
      upDeptCd: nextSelections.length > 0 ? nextSelections[nextSelections.length - 1] : "",
    }));
  }

  function validateForm() {
    if (mode === MODE.CREATE && !String(form.deptCd || "").trim()) {
      alert("부서코드는 필수입니다.");
      return false;
    }

    if (!String(form.deptNm || "").trim()) {
      alert("부서명은 필수입니다.");
      return false;
    }

    if (!String(form.deptTypeCd || "").trim()) {
      alert("부서종류는 필수입니다.");
      return false;
    }

    if (mode === MODE.CREATE && !String(form.deptHeadEmpNo || "").trim()) {
      alert("등록 시 부서장은 필수입니다.");
      return false;
    }

    if (form.upDeptCd && String(form.upDeptCd) === String(form.deptCd)) {
      alert("상위부서는 자기 자신을 선택할 수 없습니다.");
      return false;
    }

    if (
      mode === MODE.EDIT &&
      form.upDeptCd &&
      forbiddenParentSet.has(String(form.upDeptCd))
    ) {
      alert("자기 자신 또는 하위 부서는 상위부서로 지정할 수 없습니다.");
      return false;
    }

    return true;
  }

  async function save() {
    if (!canEditFields) return;
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (mode === MODE.CREATE) {
        let payload = {
          deptCd: String(form.deptCd).trim(),
          upDeptCd: form.upDeptCd ? String(form.upDeptCd).trim() : null,
          deptTypeCd: String(form.deptTypeCd).trim(),
          deptHeadEmpNo: String(form.deptHeadEmpNo).trim(),
          deptNm: String(form.deptNm).trim(),
          deptLoc: form.deptLoc ? String(form.deptLoc).trim() : null,
          deptTel: form.deptTel ? String(form.deptTel).trim() : null,
        };
        await createDept(payload);
        alert("등록되었습니다.");
        setMode(MODE.VIEW);
        let nextHierarchy = await loadHierarchyDepts();
        await loadDepts(String(form.deptCd).trim(), null, nextHierarchy);
      } else {
        let payload = {
          deptCd: String(form.deptCd).trim(),
          upDeptCd: form.upDeptCd ? String(form.upDeptCd).trim() : null,
          deptTypeCd: String(form.deptTypeCd).trim(),
          deptHeadEmpNo: form.deptHeadEmpNo
            ? String(form.deptHeadEmpNo).trim()
            : null,
          deptNm: String(form.deptNm).trim(),
          deptLoc: form.deptLoc ? String(form.deptLoc).trim() : null,
          deptTel: form.deptTel ? String(form.deptTel).trim() : null,
          delYn: form.delYn || "N",
        };
        await updateDept(payload);
        alert("저장되었습니다.");
        setMode(MODE.VIEW);
        let nextHierarchy = await loadHierarchyDepts();
        await loadDepts(String(form.deptCd).trim(), null, nextHierarchy);
      }
    } catch (e) {
      console.error(e);
      alert(getErrorMessage(e, "저장에 실패했습니다."));
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!selectedDeptCd) {
      alert("삭제할 부서를 선택해 주세요.");
      return;
    }

    let ok = window.confirm(
      "해당 부서를 삭제 처리할까요?\n(하위 부서 또는 소속 사원이 있으면 삭제할 수 없습니다)",
    );
    if (!ok) return;

    setSaving(true);
    try {
      await deleteDept(selectedDeptCd);
      alert("삭제되었습니다.");
      let nextHierarchy = await loadHierarchyDepts();
      await loadDepts(null, null, nextHierarchy);
    } catch (e) {
      console.error(e);
      alert(getErrorMessage(e, "삭제 처리에 실패했습니다."));
    } finally {
      setSaving(false);
    }
  }

  async function onRestore() {
    if (!selectedDeptCd) {
      alert("복구할 부서를 선택해 주세요.");
      return;
    }

    let ok = window.confirm("해당 부서를 복구할까요?");
    if (!ok) return;

    setSaving(true);
    try {
      await restoreDept(selectedDeptCd);
      alert("복구되었습니다.");
      let nextHierarchy = await loadHierarchyDepts();
      await loadDepts(selectedDeptCd, null, nextHierarchy);
    } catch (e) {
      console.error(e);
      alert(getErrorMessage(e, "복구에 실패했습니다."));
    } finally {
      setSaving(false);
    }
  }

  function showAllDepts() {
    setFilters({ delYn: "ALL", searchField: "ALL" });
    setKeywordDraft("");
    setKeywordCommit("");
  }

  useEffect(() => {
    loadDeptTypes();
    loadEmployeesAndPositions();
    loadHierarchyDepts();
  }, []);

  useEffect(() => {
    if (mode !== MODE.VIEW) return;
    syncParentSelectionsFromDept(selectedDept?.upDeptCd ?? "", hierarchyDepts);
  }, [hierarchyDepts, mode, selectedDept?.upDeptCd]);

  useEffect(() => {
    loadDepts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiParams.delYn, apiParams.searchField, apiParams.keyword]);

  useEffect(() => {
    if (isComposingRef.current) return;

    let timer = setTimeout(() => {
      let value = String(keywordDraft || "").trim();
      setKeywordCommit(value);
    }, 400);

    return () => clearTimeout(timer);
  }, [keywordDraft]);

  return (
    <div className={sty.pageRoot}>
      <div className={clsx(contentSty.contentCard, sty.dmContentCard, sty.card)}>
        <div className={sty.layoutRoot}>
          <div className={sty.topHeaderBox}>
            <div className={sty.topTitleBox}>
              <div className={sty.topTitle}>부서 관리</div>
              <div className={sty.topSubTitle}>
                부서 조회 및 등록, 수정, 삭제/복구를 관리 합니다.
              </div>
            </div>
          </div>

          <div className={sty.split}>
            <section className={sty.left}>
              <div className={sty.sectionHeader}>
                <div className={sty.sectionTitle}>부서 목록</div>

                <div className={sty.sectionTools}>
                  <span className={sty.countTag}>
                    총 <b>{totalCount}</b>건
                  </span>

                  <button
                    type="button"
                    className={sty.utilityBtn}
                    onClick={showAllDepts}
                    disabled={loading || saving}
                  >
                    전체보기
                  </button>
                </div>
              </div>

              <div className={sty.filterBox}>
                <div className={sty.inlineFilterRow}>
                  <div className={clsx(sty.filterField, sty.filterState)}>
                    <label className={sty.label}>상태</label>
                    <select
                      className={sty.select}
                      value={filters.delYn}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, delYn: e.target.value }))
                      }
                      disabled={loading || saving}
                    >
                      <option value="ALL">전체</option>
                      <option value="N">사용</option>
                      <option value="Y">삭제</option>
                    </select>
                  </div>

                  <div className={clsx(sty.filterField, sty.filterSearchField)}>
                    <label className={sty.label}>검색 항목</label>
                    <select
                      className={sty.select}
                      value={filters.searchField}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          searchField: e.target.value,
                        }))
                      }
                      disabled={loading || saving}
                    >
                      {SEARCH_FIELD_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={clsx(sty.filterField, sty.filterKeyword)}>
                    <label className={sty.label}>검색</label>
                    <input
                      className={sty.input}
                      value={keywordDraft}
                      onChange={(e) => setKeywordDraft(e.target.value)}
                      onCompositionStart={() => {
                        isComposingRef.current = true;
                      }}
                      onCompositionEnd={(e) => {
                        isComposingRef.current = false;
                        setKeywordCommit(String(e.target.value || "").trim());
                      }}
                      onKeyDown={(e) => {
                        if (e.key !== "Enter") return;
                        if (isComposingRef.current) return;
                        setKeywordCommit(String(keywordDraft || "").trim());
                      }}
                      placeholder={getSearchPlaceholder(filters.searchField)}
                      disabled={loading || saving}
                    />
                  </div>

                  <div className={clsx(sty.filterField, sty.filterRefresh)}>
                    <label className={sty.label}>&nbsp;</label>
                    <button
                      type="button"
                      className={sty.utilityBtn}
                      onClick={() => loadDepts(selectedDeptCd, apiParams)}
                      disabled={loading || saving}
                      title="검색 새로고침"
                    >
                      <RefreshCcw size={16} />
                      새로고침
                    </button>
                  </div>
                </div>
              </div>

              <div className={sty.resultSection}>
                <div className={sty.tableShell}>
                  <div className={sty.tableHeadWrap}>
                    <table className={clsx(sty.table, sty.tableHeadTable)}>
                      <colgroup>
                        <col className={sty.noCol} />
                        <col className={sty.codeCol} />
                        <col className={sty.nameCol} />
                        <col className={sty.parentCol} />
                        <col className={sty.typeCol} />
                        <col className={sty.headCol} />
                        <col className={sty.statusCol} />
                      </colgroup>
                      <thead>
                        <tr>
                          <th className={sty.noCol}>번호</th>
                          <th className={sty.codeCol}>부서코드</th>
                          <th className={sty.nameCol}>부서명</th>
                          <th className={sty.parentCol}>상위부서</th>
                          <th className={sty.typeCol}>부서종류</th>
                          <th className={sty.headCol}>부서장</th>
                          <th className={sty.statusCol}>상태</th>
                        </tr>
                      </thead>
                    </table>
                  </div>

                  <div className={sty.tableBodyWrap}>
                    {loading && <div className={sty.loading}>로딩 중...</div>}

                    {!loading && depts.length === 0 && (
                      <div className={clsx(contentSty.emptyState, sty.emptyCompact)}>
                        <p>조회 결과가 없습니다.</p>
                      </div>
                    )}

                    {!loading && depts.length > 0 && (
                      <table className={clsx(sty.table, sty.tableBodyTable)}>
                        <colgroup>
                          <col className={sty.noCol} />
                          <col className={sty.codeCol} />
                          <col className={sty.nameCol} />
                          <col className={sty.parentCol} />
                          <col className={sty.typeCol} />
                          <col className={sty.headCol} />
                          <col className={sty.statusCol} />
                        </colgroup>
                        <tbody>
                          {depts.map((dept, idx) => {
                            let isActive =
                              String(dept.deptCd) === String(selectedDeptCd);

                            return (
                              <tr
                                key={dept.deptCd}
                                className={clsx(sty.tableRow, isActive && sty.activeRow)}
                                onClick={() => selectDept(dept.deptCd)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") selectDept(dept.deptCd);
                                }}
                              >
                                <td className={sty.noCol}>{idx + 1}</td>
                                <td className={sty.codeCol} title={dept.deptCd}>
                                  {dept.deptCd}
                                </td>
                                <td className={clsx(sty.nameCol, sty.nameCell)} title={dept.deptNm}>
                                  {dept.deptNm}
                                </td>
                                <td className={sty.parentCol} title={dept.upDeptNm || "-"}>
                                  {dept.upDeptNm || "-"}
                                </td>
                                <td className={sty.typeCol} title={dept.deptTypeNm || "-"}>
                                  {dept.deptTypeNm || "-"}
                                </td>
                                <td className={sty.headCol} title={dept.deptHeadEmpNm || "-"}>
                                  {dept.deptHeadEmpNm || "-"}
                                </td>
                                <td className={sty.statusCol}>
                                  <span
                                    className={clsx(
                                      sty.badge,
                                      statusClass(dept.delYn),
                                    )}
                                  >
                                    {statusLabel(dept.delYn)}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className={sty.right}>
              <div className={sty.sectionHeader}>
                <div className={sty.sectionTitle}>
                  {mode === MODE.CREATE
                    ? "부서 등록"
                    : mode === MODE.EDIT
                      ? "부서 수정"
                      : "부서 관리"}
                </div>

                <div className={sty.sectionTools}>
                  {mode === MODE.VIEW && !selectedDept && (
                    <button
                      type="button"
                      className={sty.btnPrimary}
                      onClick={startCreate}
                      disabled={loading || saving}
                    >
                      <Plus size={16} />
                      등록
                    </button>
                  )}

                  {mode === MODE.VIEW && selectedDept && (
                    <>
                      <button
                        type="button"
                        className={sty.btnOutline}
                        onClick={startEdit}
                        disabled={loading || saving}
                      >
                        <Pencil size={16} />
                        수정
                      </button>

                      {selectedIsDeleted ? (
                        <button
                          type="button"
                          className={sty.btnOutline}
                          onClick={onRestore}
                          disabled={loading || saving}
                        >
                          <RefreshCcw size={16} />
                          복구
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={sty.btnDanger}
                          onClick={onDelete}
                          disabled={loading || saving}
                        >
                          <Trash2 size={16} />
                          삭제
                        </button>
                      )}
                    </>
                  )}

                  {(mode === MODE.EDIT || mode === MODE.CREATE) && (
                    <>
                      <button
                        type="button"
                        className={sty.btnPrimary}
                        onClick={save}
                        disabled={saving || !isDirty}
                      >
                        저장
                      </button>
                      <button
                        type="button"
                        className={sty.btnCancel}
                        onClick={cancelEdit}
                        disabled={saving}
                      >
                        취소
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className={sty.formScroll}>
                <div className={sty.formGrid}>
                  <div className={sty.inlineFieldRowThree}>
                    <div className={sty.inlineFieldItem}>
                      <label className={sty.label}>부서코드</label>
                      <input
                        className={sty.input}
                        value={form.deptCd}
                        disabled={mode !== MODE.CREATE}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, deptCd: e.target.value }))
                        }
                        placeholder="예) HR01"
                      />
                    </div>

                    <div className={sty.inlineFieldItem}>
                      <label className={sty.label}>부서명</label>
                      <input
                        className={sty.input}
                        value={form.deptNm}
                        disabled={!canEditFields}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, deptNm: e.target.value }))
                        }
                        placeholder="부서명을 입력"
                      />
                    </div>

                    <div className={sty.inlineFieldItem}>
                      <label className={sty.label}>부서종류</label>
                      <select
                        className={sty.select}
                        value={form.deptTypeCd}
                        disabled={!canEditFields}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            deptTypeCd: e.target.value,
                          }))
                        }
                      >
                        <option value="">선택</option>
                        {(deptTypes || []).map((deptType) => (
                          <option
                            key={deptType.deptTypeCd}
                            value={deptType.deptTypeCd}
                          >
                            {deptType.deptTypeNm}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={sty.fieldBlock}>
                    <div className={sty.fieldBlockHeader}>
                      <div className={sty.fieldBlockTitle}>상위부서</div>
                      <div className={sty.fieldBlockSubTitle}>
                        기존 조직 체인을 따라 필요한 단계만 순서대로 선택합니다.
                      </div>
                    </div>

                    {mode === MODE.VIEW ? (
                      <div className={sty.pathReadonlyBox}>
                        {(parentSelections || []).length === 0 ? (
                          <div className={sty.pathEmpty}>미지정</div>
                        ) : (
                          <div className={sty.pathBadgeWrap}>
                            {parentSelections.map((deptCd) => (
                              <span key={deptCd} className={sty.pathBadge}>
                                {deptNmByCd.get(String(deptCd)) || deptCd}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={sty.pathSelectorList}>
                        {parentRows.length === 0 ? (
                          <div className={sty.pathEmpty}>선택 가능한 상위부서가 없습니다.</div>
                        ) : (
                          parentRows.map((row) => (
                            <div key={row.level} className={sty.pathRow}>
                              <div className={sty.pathRowLabel}>{row.label}</div>
                              <select
                                className={sty.select}
                                value={row.value}
                                onChange={(e) =>
                                  handleParentLevelChange(row.level, e.target.value)
                                }
                                disabled={!canEditFields}
                              >
                                <option value="">선택 안 함</option>
                                {row.options.map((dept) => (
                                  <option key={dept.deptCd} value={dept.deptCd}>
                                    {dept.deptNm} ({dept.deptCd})
                                  </option>
                                ))}
                              </select>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    <div className={sty.previewBox}>
                      <div className={sty.previewLabel}>선택된 상위부서</div>
                      <div className={sty.previewValue}>{selectedParentPreview}</div>
                    </div>
                  </div>

                  <div className={sty.fieldBlock}>
                    <div className={sty.inlineFieldItem}>
                      <label className={sty.label}>부서장</label>
                      <select
                        className={sty.select}
                        value={form.deptHeadEmpNo || ""}
                        disabled={!canEditFields}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            deptHeadEmpNo: e.target.value,
                          }))
                        }
                      >
                        <option value="">
                          {mode === MODE.CREATE ? "선택" : "(공석)"}
                        </option>
                        {leaderOptions.map((emp) => (
                          <option key={emp.empNo} value={emp.empNo}>
                            {emp.optionLabel}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={sty.inlineFieldRowTwo}>
                    <div className={sty.inlineFieldItem}>
                      <label className={sty.label}>대표전화</label>
                      <input
                        className={sty.input}
                        value={form.deptTel}
                        disabled={!canEditFields}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, deptTel: e.target.value }))
                        }
                        placeholder="예) 042-000-0000"
                      />
                    </div>

                    <div className={sty.inlineFieldItem}>
                      <label className={sty.label}>위치</label>
                      <input
                        className={sty.input}
                        value={form.deptLoc}
                        disabled={!canEditFields}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, deptLoc: e.target.value }))
                        }
                        placeholder="예) 3층"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
