import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { Pencil, Plus, RefreshCcw, Trash2 } from "lucide-react";

import apiClient from "../../../api/apiClient";
import {
  createProject,
  deleteProject,
  fetchProjectDetail,
  fetchProjects,
  restoreProject,
  updateProject,
} from "../../../api/projectApi";
import contentSty from "../Content.module.css";
import sty from "./ProjectManagement.module.css";

const MODE = {
  VIEW: "VIEW",
  EDIT: "EDIT",
  CREATE: "CREATE",
};

const DEFAULT_FILTER = {
  deptCd: "ALL",
  projectStatCd: "ING",
  useYn: "Y",
  startDate: "",
  endDate: "",
};

const ALL_FILTER = {
  deptCd: "ALL",
  projectStatCd: "ALL",
  useYn: "ALL",
  startDate: "",
  endDate: "",
};

function toDateOnly(v) {
  if (!v) return "";
  const s = String(v);
  if (s.includes("T")) return s.split("T")[0];
  if (s.includes(" ")) return s.split(" ")[0];
  return s;
}

function overlapsProjectPeriod(project, filterStart, filterEnd) {
  const projectStart = toDateOnly(project?.startDtm);
  const projectEnd = toDateOnly(project?.endDtm);

  if (!filterStart && !filterEnd) return true;
  if (!projectStart || !projectEnd) return false;

  if (filterStart && filterEnd) {
    return projectStart <= filterEnd && projectEnd >= filterStart;
  }
  if (filterStart) {
    return projectEnd >= filterStart;
  }
  return projectStart <= filterEnd;
}

function normalizeProjectToForm(p) {
  return {
    projectNo: p?.projectNo ?? "",
    deptCd: p?.deptCd ?? "",
    projectNm: p?.projectNm ?? "",
    projectStatCd: p?.projectStatCd ?? "ING",
    startDtm: toDateOnly(p?.startDtm),
    endDtm: toDateOnly(p?.endDtm),
    projectDesc: p?.projectDesc ?? "",
    useYn: p?.useYn ?? "Y",
    mainImgPath: p?.mainImgPath ?? "",
  };
}

function isSameForm(a, b) {
  const keys = [
    "projectNo",
    "deptCd",
    "projectNm",
    "projectStatCd",
    "startDtm",
    "endDtm",
    "projectDesc",
    "useYn",
    "mainImgPath",
  ];
  return keys.every((k) => String(a?.[k] ?? "") === String(b?.[k] ?? ""));
}

function projectStatusLabel(projectStatCd) {
  if (projectStatCd === "END") return "완료";
  if (projectStatCd === "HOLD") return "보류";
  return "진행";
}

function projectStatusClass(projectStatCd) {
  if (projectStatCd === "END") return sty.st_END;
  if (projectStatCd === "HOLD") return sty.st_HOLD;
  return sty.st_ING;
}

function useYnLabel(useYn) {
  return useYn === "N" ? "삭제" : "사용";
}

function useYnClass(useYn) {
  return useYn === "N" ? sty.st_DELETED : sty.st_USE;
}

export default function ProjectManagement() {
  const [mode, setMode] = useState(MODE.VIEW);

  const [filters, setFilters] = useState(DEFAULT_FILTER);
  const [keywordDraft, setKeywordDraft] = useState("");
  const [keywordCommit, setKeywordCommit] = useState("");

  const isComposingRef = useRef(false);

  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [projects, setProjects] = useState([]);
  const [selectedProjectNo, setSelectedProjectNo] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  const [form, setForm] = useState(normalizeProjectToForm(null));
  const baselineRef = useRef(normalizeProjectToForm(null));

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const deptOptions = useMemo(() => {
    return (departments || []).filter((d) => (d?.delYn ? d.delYn === "N" : true));
  }, [departments]);

  const deptNmByCd = useMemo(() => {
    const map = new Map();
    (deptOptions || []).forEach((d) => {
      if (d?.deptCd) map.set(String(d.deptCd), d.deptNm ?? "");
    });
    return map;
  }, [deptOptions]);

  const empByNo = useMemo(() => {
    const map = new Map();
    (employees || []).forEach((e) => {
      if (e?.empNo) map.set(String(e.empNo), e);
    });
    return map;
  }, [employees]);

  const posNmByCd = useMemo(() => {
    const map = new Map();
    (positions || []).forEach((p) => {
      if (p?.posCd) map.set(String(p.posCd), p.posNm ?? "");
    });
    return map;
  }, [positions]);

  const selectedDeptInfo = useMemo(() => {
    const deptCd =
      mode === MODE.CREATE || mode === MODE.EDIT
        ? form.deptCd
        : selectedProject?.deptCd ?? "";
    return deptOptions.find((d) => d.deptCd === deptCd);
  }, [deptOptions, form.deptCd, mode, selectedProject?.deptCd]);

  const deptHeadInfo = useMemo(() => {
    const headNoRaw = selectedDeptInfo?.deptHeadEmpNo
      ? String(selectedDeptInfo.deptHeadEmpNo)
      : "";
    const headNmRaw = selectedDeptInfo?.deptHeadEmpNm ?? "";

    const emp = headNoRaw ? empByNo.get(headNoRaw) : null;
    const empNo = headNoRaw || "";
    const empNm = headNmRaw || (emp?.empNm ?? "");
    const posCd = emp?.posCd ? String(emp.posCd) : "";
    const posNm = posCd ? posNmByCd.get(posCd) ?? "" : "";

    return {
      empNo: empNo || "미지정",
      empNm: empNm || "미지정",
      posNm: posNm || "미지정",
    };
  }, [
    empByNo,
    posNmByCd,
    selectedDeptInfo?.deptHeadEmpNm,
    selectedDeptInfo?.deptHeadEmpNo,
  ]);

  const isDirty = useMemo(() => {
    if (mode === MODE.VIEW) return false;
    return !isSameForm(form, baselineRef.current);
  }, [form, mode]);

  const canEditFields = mode === MODE.EDIT || mode === MODE.CREATE;

  const apiParams = useMemo(() => {
    return {
      deptCd: filters.deptCd || "ALL",
      projectStatCd: filters.projectStatCd || "ALL",
      useYn: filters.useYn || "ALL",
    };
  }, [filters.deptCd, filters.projectStatCd, filters.useYn]);

  const filteredProjects = useMemo(() => {
    const k = (keywordCommit || "").trim().toLowerCase();
    return (projects || []).filter((p) => {
      const matchesKeyword = !k
        ? true
        : String(p?.projectNm ?? "").toLowerCase().includes(k);
      const matchesPeriod = overlapsProjectPeriod(
        p,
        filters.startDate,
        filters.endDate,
      );
      return matchesKeyword && matchesPeriod;
    });
  }, [filters.endDate, filters.startDate, keywordCommit, projects]);

  const totalCount = filteredProjects.length;
  const selectedIsDeleted = selectedProject?.useYn === "N";

  async function loadDepartments() {
    try {
      const res = await apiClient.get("/api/emp/departments");
      setDepartments(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setDepartments([]);
    }
  }

  async function loadEmployeesAndPositions() {
    try {
      const [empRes, posRes] = await Promise.all([
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

  async function loadProjects(nextSelectedNo = null, paramsOverride = null) {
    setLoading(true);
    try {
      const list = await fetchProjects(paramsOverride ?? apiParams);
      setProjects(list);

      const keepNo = nextSelectedNo ?? selectedProjectNo;
      if (keepNo && list.some((p) => String(p.projectNo) === String(keepNo))) {
        await selectProject(keepNo, { silent: true });
      } else {
        setSelectedProjectNo(null);
        setSelectedProject(null);
        if (mode === MODE.VIEW) {
          const empty = normalizeProjectToForm(null);
          setForm(empty);
          baselineRef.current = empty;
        }
      }
    } catch (e) {
      console.error(e);
      alert("프로젝트 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function selectProject(projectNo, { silent = false } = {}) {
    if (!projectNo) return;

    if (mode !== MODE.VIEW && isDirty && !silent) {
      const ok = window.confirm(
        "저장하지 않은 변경사항이 있습니다. 이동하면 변경사항이 사라집니다. 이동할까요?",
      );
      if (!ok) return;
    }

    setMode(MODE.VIEW);
    setSelectedProjectNo(projectNo);
    setLoading(true);
    try {
      const detail = await fetchProjectDetail(projectNo);
      setSelectedProject(detail);
      const f = normalizeProjectToForm(detail);
      setForm(f);
      baselineRef.current = f;
    } catch (e) {
      console.error(e);
      alert("프로젝트 상세를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function startEdit() {
    if (!selectedProject) return;
    const f = normalizeProjectToForm(selectedProject);
    setForm(f);
    baselineRef.current = f;
    setMode(MODE.EDIT);
  }

  function startCreate() {
    if (mode !== MODE.VIEW && isDirty) {
      const ok = window.confirm(
        "저장하지 않은 변경사항이 있습니다. 새로 등록하면 변경사항이 사라집니다. 진행할까요?",
      );
      if (!ok) return;
    }

    const initDeptCd = filters.deptCd !== "ALL" ? filters.deptCd : "";
    const f = normalizeProjectToForm({
      deptCd: initDeptCd,
      useYn: "Y",
      projectStatCd: "ING",
    });

    setSelectedProjectNo(null);
    setSelectedProject(null);
    setForm(f);
    baselineRef.current = f;
    setMode(MODE.CREATE);
  }

  function cancelEditOrCreate() {
    const base = baselineRef.current;
    setForm(base);

    if (mode === MODE.EDIT) {
      setMode(MODE.VIEW);
      return;
    }

    setMode(MODE.VIEW);
    setSelectedProjectNo(null);
    setSelectedProject(null);

    const empty = normalizeProjectToForm(null);
    setForm(empty);
    baselineRef.current = empty;
  }

  function clearSelection() {
    if (mode !== MODE.VIEW && isDirty) {
      const ok = window.confirm(
        "저장하지 않은 변경사항이 있습니다. 선택을 해제하면 변경사항이 사라집니다. 진행할까요?",
      );
      if (!ok) return;
    }

    setMode(MODE.VIEW);
    setSelectedProjectNo(null);
    setSelectedProject(null);

    const empty = normalizeProjectToForm(null);
    setForm(empty);
    baselineRef.current = empty;
  }

  function validateForm() {
    if (!form.deptCd) return "담당부서를 선택해주세요.";
    if (!form.projectNm.trim()) return "프로젝트명을 입력해주세요.";
    if (!form.projectStatCd) return "상태를 선택해주세요.";
    if (!form.startDtm) return "시작일을 입력해주세요.";
    if (!form.endDtm) return "종료일을 입력해주세요.";
    if (!form.projectDesc.trim()) return "프로젝트 내용을 입력해주세요.";

    if (form.startDtm && form.endDtm) {
      const s = new Date(form.startDtm);
      const e = new Date(form.endDtm);
      if (Number.isFinite(s.getTime()) && Number.isFinite(e.getTime())) {
        if (e.getTime() < s.getTime()) return "종료일은 시작일 이후여야 합니다.";
      }
    }
    return null;
  }

  async function save() {
    const err = validateForm();
    if (err) {
      alert(err);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        deptCd: form.deptCd,
        projectNm: form.projectNm.trim(),
        projectDesc: form.projectDesc.trim(),
        projectStatCd: form.projectStatCd,
        startDtm: form.startDtm,
        endDtm: form.endDtm,
        useYn: form.useYn || "Y",
        mainImgPath: form.mainImgPath || "",
      };

      let savedNo = null;
      if (mode === MODE.CREATE) {
        const res = await createProject(payload);
        savedNo = res?.projectNo ?? res?.id ?? null;
        alert("프로젝트가 등록되었습니다.");
      } else if (mode === MODE.EDIT) {
        const res = await updateProject({ ...payload, projectNo: form.projectNo });
        savedNo = res?.projectNo ?? form.projectNo;
        alert("프로젝트가 수정되었습니다.");
      }

      setMode(MODE.VIEW);
      await loadProjects(savedNo);
      if (savedNo) await selectProject(savedNo, { silent: true });
    } catch (e) {
      console.error(e);
      alert("저장에 실패했습니다. 서버 로그를 확인해주세요.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(projectNo) {
    if (!projectNo) return;
    const ok = window.confirm("삭제 하시겠습니까?");
    if (!ok) return;

    try {
      await deleteProject(projectNo);
      alert("삭제되었습니다.");
      await loadProjects(projectNo);
    } catch (e) {
      console.error(e);
      alert("삭제에 실패했습니다.");
    }
  }

  async function onRestore(projectNo) {
    if (!projectNo) return;
    const ok = window.confirm("복구 하시겠습니까?");
    if (!ok) return;

    try {
      await restoreProject(projectNo);
      alert("복구되었습니다.");
      await loadProjects(projectNo);
    } catch (e) {
      console.error(e);
      alert("복구에 실패했습니다.");
    }
  }

  function showAllProjects() {
    if (mode !== MODE.VIEW && isDirty) {
      const ok = window.confirm(
        "저장하지 않은 변경사항이 있습니다. 전체보기로 이동하면 변경사항이 사라집니다. 진행할까요?",
      );
      if (!ok) return;
    }

    const keepNo = selectedProjectNo;

    setMode(MODE.VIEW);
    setFilters(ALL_FILTER);
    setKeywordDraft("");
    setKeywordCommit("");

    if (!keepNo) {
      setSelectedProjectNo(null);
      setSelectedProject(null);
      const empty = normalizeProjectToForm(null);
      setForm(empty);
      baselineRef.current = empty;
    }
  }

  useEffect(() => {
    loadDepartments();
    loadEmployeesAndPositions();
  }, []);

  useEffect(() => {
    if (isComposingRef.current) return;

    const t = setTimeout(() => {
      const v = keywordDraft.trim();
      if (v.length < 2) {
        setKeywordCommit("");
        return;
      }
      setKeywordCommit(v);
    }, 400);

    return () => clearTimeout(t);
  }, [keywordDraft]);

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiParams.deptCd, apiParams.projectStatCd, apiParams.useYn]);

  return (
    <div className={sty.pageRoot}>
      <div className={clsx(contentSty.contentCard, sty.pmContentCard, sty.card)}>
        <div className={sty.layoutRoot}>
          <div className={sty.topHeaderBox}>
            <div className={sty.topTitleBox}>
              <div className={sty.topTitle}>프로젝트 관리</div>
              <div className={sty.topSubTitle}>
                담당부서별 프로젝트 조회 및 등록, 수정, 삭제/복구를 관리합니다.
              </div>
            </div>
          </div>

          <div className={sty.split}>
            <section className={sty.left}>
              <div className={sty.sectionHeader}>
                <div className={sty.sectionTitle}>프로젝트 목록</div>

                <div className={sty.sectionTools}>
                  <span className={sty.countTag}>
                    총 <b>{totalCount}</b>건
                  </span>

                  <button
                    type="button"
                    className={sty.utilityBtn}
                    onClick={showAllProjects}
                    disabled={loading || saving}
                    title="전체보기"
                  >
                    전체보기
                  </button>
                </div>
              </div>

              <div className={sty.filterBox}>
                <div className={sty.inlineFilterRow}>
                  <div className={clsx(sty.filterField, sty.filterDept)}>
                    <label className={sty.label}>담당부서</label>
                    <select
                      className={sty.select}
                      value={filters.deptCd}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, deptCd: e.target.value }))
                      }
                      disabled={loading || saving}
                    >
                      <option value="ALL">전체</option>
                      {deptOptions.map((d) => (
                        <option key={d.deptCd} value={d.deptCd}>
                          {d.deptNm}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={clsx(sty.filterField, sty.filterState)}>
                    <label className={sty.label}>상태</label>
                    <select
                      className={sty.select}
                      value={filters.projectStatCd}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          projectStatCd: e.target.value,
                        }))
                      }
                      disabled={loading || saving}
                    >
                      <option value="ALL">전체</option>
                      <option value="ING">진행</option>
                      <option value="END">완료</option>
                      <option value="HOLD">보류</option>
                    </select>
                  </div>

                  <div className={clsx(sty.filterField, sty.filterUse)}>
                    <label className={sty.label}>사용여부</label>
                    <select
                      className={sty.select}
                      value={filters.useYn}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, useYn: e.target.value }))
                      }
                      disabled={loading || saving}
                    >
                      <option value="ALL">전체</option>
                      <option value="Y">사용</option>
                      <option value="N">삭제</option>
                    </select>
                  </div>

                  <div className={clsx(sty.filterField, sty.filterDate)}>
                    <label className={sty.label}>시작일</label>
                    <input
                      type="date"
                      className={sty.input}
                      value={filters.startDate}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, startDate: e.target.value }))
                      }
                      disabled={loading || saving}
                    />
                  </div>

                  <div className={clsx(sty.filterField, sty.filterDate)}>
                    <label className={sty.label}>종료일</label>
                    <input
                      type="date"
                      className={sty.input}
                      value={filters.endDate}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, endDate: e.target.value }))
                      }
                      disabled={loading || saving}
                    />
                  </div>
                </div>

                <div className={sty.filterRow}>
                  <label className={sty.label}>검색</label>
                  <input
                    className={sty.input}
                    value={keywordDraft}
                    onChange={(e) => setKeywordDraft(e.target.value)}
                    onCompositionStart={() => {
                      isComposingRef.current = true;
                    }}
                    onCompositionEnd={() => {
                      isComposingRef.current = false;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const v = keywordDraft.trim();
                        setKeywordCommit(v.length >= 2 ? v : "");
                      }
                    }}
                    placeholder="프로젝트명으로 검색..."
                    disabled={loading || saving}
                  />
                </div>
              </div>

              <div className={sty.resultSection}>
                <div className={sty.tableShell}>
                  <div className={sty.tableHeadWrap}>
                    <table className={clsx(sty.table, sty.tableHeadTable)}>
                      <colgroup>
                        <col className={sty.noCol} />
                        <col className={sty.deptCol} />
                        <col className={sty.projectCol} />
                        <col className={sty.statusCol} />
                        <col className={sty.periodCol} />
                        <col className={sty.useCol} />
                      </colgroup>
                      <thead>
                        <tr>
                          <th className={sty.noCol}>번호</th>
                          <th className={sty.deptCol}>담당부서</th>
                          <th className={sty.projectCol}>프로젝트명</th>
                          <th className={sty.statusCol}>상태</th>
                          <th className={sty.periodCol}>수행기간</th>
                          <th className={sty.useCol}>사용여부</th>
                        </tr>
                      </thead>
                    </table>
                  </div>

                  <div className={sty.tableBodyWrap}>
                    {loading && <div className={sty.loading}>로딩 중...</div>}

                    {!loading && filteredProjects.length === 0 && (
                      <div className={clsx(contentSty.emptyState, sty.emptyCompact)}>
                        <p>조회 결과가 없습니다.</p>
                      </div>
                    )}

                    {!loading && filteredProjects.length > 0 && (
                      <table className={clsx(sty.table, sty.tableBodyTable)}>
                        <colgroup>
                          <col className={sty.noCol} />
                          <col className={sty.deptCol} />
                          <col className={sty.projectCol} />
                          <col className={sty.statusCol} />
                          <col className={sty.periodCol} />
                          <col className={sty.useCol} />
                        </colgroup>
                        <tbody>
                          {filteredProjects.map((p, idx) => {
                            const isActive =
                              String(p.projectNo) === String(selectedProjectNo);
                            const deptNm = p.deptNm || deptNmByCd.get(String(p.deptCd)) || "";
                            const period = `${toDateOnly(p.startDtm)} ~ ${toDateOnly(p.endDtm)}`;

                            return (
                              <tr
                                key={p.projectNo}
                                className={clsx(sty.tableRow, isActive && sty.activeRow)}
                                onClick={() => selectProject(p.projectNo)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") selectProject(p.projectNo);
                                }}
                              >
                                <td className={sty.noCol}>{idx + 1}</td>
                                <td className={sty.deptCol} title={deptNm}>{deptNm || "(부서미지정)"}</td>
                                <td className={clsx(sty.projectCol, sty.projectNameCell)} title={p.projectNm}>
                                  {p.projectNm}
                                </td>
                                <td className={sty.statusCol}>
                                  <span
                                    className={clsx(
                                      sty.badge,
                                      projectStatusClass(p.projectStatCd),
                                    )}
                                  >
                                    {projectStatusLabel(p.projectStatCd)}
                                  </span>
                                </td>
                                <td className={sty.periodCol} title={period}>{period}</td>
                                <td className={sty.useCol}>
                                  <span
                                    className={clsx(sty.badge, useYnClass(p.useYn))}
                                  >
                                    {useYnLabel(p.useYn)}
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
                <div className={sty.sectionTitle}>프로젝트 관리</div>

                <div className={sty.sectionTools}>
                  {mode === MODE.VIEW && !selectedProject && (
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

                  {mode === MODE.VIEW && selectedProject && (
                    <>
                      <button
                        type="button"
                        className={sty.btnCancel}
                        onClick={clearSelection}
                        disabled={loading || saving}
                      >
                        선택해제
                      </button>

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
                          onClick={() => onRestore(selectedProjectNo)}
                          disabled={!selectedProjectNo || loading || saving}
                        >
                          <RefreshCcw size={16} />
                          복구
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={sty.btnDanger}
                          onClick={() => onDelete(selectedProjectNo)}
                          disabled={!selectedProjectNo || loading || saving}
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
                        className={sty.btnCancel}
                        onClick={cancelEditOrCreate}
                        disabled={saving}
                      >
                        취소
                      </button>
                      <button
                        type="button"
                        className={sty.btnPrimary}
                        onClick={save}
                        disabled={saving}
                      >
                        {saving ? "저장중..." : "저장"}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className={sty.rightScroll}>
                <div className={sty.form}>

                    <div className={sty.formRow}>
                      <label className={sty.formLabel}>
                        담당부서 <span className={sty.reqStar}>*</span>
                      </label>
                      <select
                        className={sty.select}
                        value={form.deptCd}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, deptCd: e.target.value }))
                        }
                        disabled={!canEditFields || saving}
                      >
                        <option value="">선택</option>
                        {deptOptions.map((d) => (
                          <option key={d.deptCd} value={d.deptCd}>
                            {d.deptNm}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={sty.formRow}>
                      <label className={sty.formLabel}>부서장 정보</label>
                      <div className={sty.headGrid}>
                        <div className={sty.headItem}>
                          <div className={sty.headLabel}>부서장</div>
                          <input
                            className={sty.input}
                            value={deptHeadInfo.empNm}
                            readOnly
                            disabled
                          />
                        </div>

                        <div className={sty.headItem}>
                          <div className={sty.headLabel}>직위</div>
                          <input
                            className={sty.input}
                            value={deptHeadInfo.posNm}
                            readOnly
                            disabled
                          />
                        </div>

                        <div className={sty.headItem}>
                          <div className={sty.headLabel}>사원번호</div>
                          <input
                            className={sty.input}
                            value={deptHeadInfo.empNo}
                            readOnly
                            disabled
                          />
                        </div>
                      </div>
                    </div>

                    <div className={sty.formRow}>
                      <label className={sty.formLabel}>
                        프로젝트명 <span className={sty.reqStar}>*</span>
                      </label>
                      <input
                        className={sty.input}
                        value={form.projectNm}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            projectNm: e.target.value,
                          }))
                        }
                        disabled={!canEditFields || saving}
                        placeholder="프로젝트명을 입력하세요"
                      />
                    </div>

                    <div className={sty.formRow}>
                      <label className={sty.formLabel}>
                        상태 <span className={sty.reqStar}>*</span>
                      </label>
                      <select
                        className={sty.select}
                        value={form.projectStatCd}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            projectStatCd: e.target.value,
                          }))
                        }
                        disabled={!canEditFields || saving}
                      >
                        <option value="ING">진행</option>
                        <option value="END">완료</option>
                        <option value="HOLD">보류</option>
                      </select>
                    </div>

                    <div className={sty.formRow}>
                      <label className={sty.formLabel}>
                        수행기간 <span className={sty.reqStar}>*</span>
                      </label>
                      <div className={sty.periodGrid}>
                        <div className={sty.periodItem}>
                          <div className={sty.headLabel}>시작일</div>
                          <input
                            type="date"
                            className={sty.input}
                            value={form.startDtm}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                startDtm: e.target.value,
                              }))
                            }
                            disabled={!canEditFields || saving}
                          />
                        </div>

                        <div className={sty.periodItem}>
                          <div className={sty.headLabel}>종료일</div>
                          <input
                            type="date"
                            className={sty.input}
                            value={form.endDtm}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                endDtm: e.target.value,
                              }))
                            }
                            disabled={!canEditFields || saving}
                          />
                        </div>
                      </div>
                    </div>

                    <div className={sty.formRow}>
                      <label className={sty.formLabel}>
                        프로젝트 내용 <span className={sty.reqStar}>*</span>
                      </label>
                      <textarea
                        className={sty.textarea}
                        value={form.projectDesc}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            projectDesc: e.target.value,
                          }))
                        }
                        disabled={!canEditFields || saving}
                        placeholder="프로젝트 내용을 입력하세요"
                      />
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
