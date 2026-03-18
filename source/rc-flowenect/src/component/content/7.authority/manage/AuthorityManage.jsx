import React, { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  RefreshCcw,
  RotateCcw,
  Save,
  Search,
  Settings,
  Shield,
  Trash2,
  X,
} from "lucide-react";

import { fetchDepts } from "../../../../api/deptApi";
import apiClient from "../../../../api/apiClient";
import {
  createRole,
  deleteRole,
  downloadAuthorityEmpExcel,
  fetchAuthorityEmpList,
  fetchRoleHierarchy,
  fetchRoleList,
  refreshRoleHierarchy,
  replaceRoleHierarchy,
  updateEmpRoles,
  updateRole,
} from "../../../../api/authorityApi";

import styled from "./AuthorityManage.module.css";

const DEFAULT_PAGING = {
  page: 1,
  recordSize: 10,
  size: 10,
  totalCount: 0,
  totalPageCount: 1,
  startPage: 1,
  endPage: 1,
};

const DEFAULT_FILTERS = {
  deptCd: "ALL",
  posCd: "ALL",
  empNm: "",
  empNo: "",
  deptRoleCd: "ALL",
  posRoleCd: "ALL",
  acntActYn: "ALL",
};

const DEFAULT_ROLE_FORM = {
  roleCd: "",
  roleNm: "",
  roleDesc: "",
};

const STATIC_DEPT_ROLES = [
  { roleCd: "ROLE_HR", roleNm: "인사 권한" },
  { roleCd: "ROLE_USER", roleNm: "일반 권한" },
];

const STATIC_POS_ROLES = [
  { roleCd: "ROLE_LEADER", roleNm: "리더 권한" },
  { roleCd: "ROLE_EMP", roleNm: "사원 권한" },
];

function safeText(value) {
  if (value === undefined || value === null) return "";
  return String(value);
}

function pageNumbersFromPaging(paging) {
  let start = paging?.startPage ?? 1;
  let end = paging?.endPage ?? paging?.totalPageCount ?? 1;
  let numbers = [];
  for (let page = start; page <= end; page += 1) {
    numbers.push(page);
  }
  return numbers;
}

function buildRoleLabel(role) {
  if (!role?.roleCd) return "-";
  if (!role?.roleNm) return role.roleCd;
  return `${role.roleNm} (${role.roleCd})`;
}

function mapRoleName(roleCd, roles, fallback) {
  if (!roleCd) return fallback || "-";
  let found = (roles || []).find((role) => role.roleCd === roleCd);
  return found?.roleNm || fallback || roleCd;
}

function downloadBlob(response, defaultFileName) {
  let disposition =
    response?.headers?.["content-disposition"] ||
    response?.headers?.["Content-Disposition"] ||
    "";

  let fileName = defaultFileName;
  let match = disposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);

  if (match) {
    try {
      fileName = decodeURIComponent(match[1] || match[2] || defaultFileName);
    } catch {
      fileName = match[1] || match[2] || defaultFileName;
    }
  }

  let blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  let url = window.URL.createObjectURL(blob);
  let link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export default function AuthorityManage() {
  const [tab, setTab] = useState("EMP");

  const [depts, setDepts] = useState([]);
  const [positions, setPositions] = useState([]);
  const [roles, setRoles] = useState([]);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [recordSize, setRecordSize] = useState(10);
  const [rows, setRows] = useState([]);
  const [paging, setPaging] = useState(DEFAULT_PAGING);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);
  const [selectedEmpNo, setSelectedEmpNo] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [editDeptRole, setEditDeptRole] = useState("ROLE_USER");
  const [editPosRole, setEditPosRole] = useState("ROLE_EMP");
  const [savingEmpRole, setSavingEmpRole] = useState(false);

  const [roleSaving, setRoleSaving] = useState(false);
  const [roleFormMode, setRoleFormMode] = useState("CREATE");
  const [roleForm, setRoleForm] = useState(DEFAULT_ROLE_FORM);
  const [selectedRoleCd, setSelectedRoleCd] = useState("");

  const [hierLoading, setHierLoading] = useState(false);
  const [edges, setEdges] = useState([]);
  const [hierDirty, setHierDirty] = useState(false);

  const recordSizeMountedRef = useRef(false);

  const deptRoleOptions = useMemo(() => {
    return STATIC_DEPT_ROLES.map((item) => ({
      ...item,
      roleNm: mapRoleName(item.roleCd, roles, item.roleNm),
    }));
  }, [roles]);

  const posRoleOptions = useMemo(() => {
    return STATIC_POS_ROLES.map((item) => ({
      ...item,
      roleNm: mapRoleName(item.roleCd, roles, item.roleNm),
    }));
  }, [roles]);

  const pageNumbers = useMemo(() => pageNumbersFromPaging(paging), [paging]);

  const selectedDept = useMemo(() => {
    if (!selectedRow?.deptCd) return null;
    return (depts || []).find((dept) => dept.deptCd === selectedRow.deptCd) || null;
  }, [depts, selectedRow]);

  const currentPage = paging?.page ?? page ?? 1;
  const totalPageCount = paging?.totalPageCount ?? 1;

  useEffect(() => {
    bootstrap();
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!recordSizeMountedRef.current) {
      recordSizeMountedRef.current = true;
      return;
    }
    loadList(1, filters, recordSize);
  }, [recordSize]); // eslint-disable-line

  useEffect(() => {
    if (tab === "HIER") {
      loadHierarchy();
    }
  }, [tab]); // eslint-disable-line

  async function bootstrap() {
    try {
      let [deptList, posResponse] = await Promise.all([
        fetchDepts({ delYn: "N" }),
        apiClient.get("/api/emp/positions", { params: { useYn: "Y" } }),
      ]);

      setDepts(Array.isArray(deptList) ? deptList : []);
      setPositions(Array.isArray(posResponse?.data) ? posResponse.data : []);
    } catch (error) {
      console.error(error);
      setDepts([]);
      setPositions([]);
    }

    await loadRoles(true);
    await loadList(1, DEFAULT_FILTERS, 10);
  }

  async function loadRoles(keepRoleSelection = true, preferredRoleCd = "") {
    try {
      let response = await fetchRoleList();
      let list = Array.isArray(response) ? response : [];
      setRoles(list);

      let targetRoleCd = preferredRoleCd || (keepRoleSelection ? selectedRoleCd : "");

      if (targetRoleCd) {
        let selected = list.find((role) => role.roleCd === targetRoleCd);
        if (selected) {
          setSelectedRoleCd(selected.roleCd || "");
          setRoleFormMode("EDIT");
          setRoleForm({
            roleCd: selected.roleCd || "",
            roleNm: selected.roleNm || "",
            roleDesc: selected.roleDesc || "",
          });
          return;
        }
      }

      if (!keepRoleSelection) {
        return;
      }

      if (!selectedRoleCd && list.length > 0) {
        let firstRole = list[0];
        setSelectedRoleCd(firstRole.roleCd || "");
        setRoleFormMode("EDIT");
        setRoleForm({
          roleCd: firstRole.roleCd || "",
          roleNm: firstRole.roleNm || "",
          roleDesc: firstRole.roleDesc || "",
        });
      }
    } catch (error) {
      console.error(error);
      setRoles([]);
    }
  }

  async function loadList(nextPage = 1, nextFilters = filters, nextRecordSize = recordSize) {
    setLoading(true);
    try {
      let response = await fetchAuthorityEmpList({
        page: nextPage,
        recordSize: nextRecordSize,
        params: {
          deptCd: nextFilters.deptCd,
          posCd: nextFilters.posCd,
          empNm: safeText(nextFilters.empNm).trim(),
          empNo: safeText(nextFilters.empNo).trim(),
          deptRoleCd: nextFilters.deptRoleCd,
          posRoleCd: nextFilters.posRoleCd,
          acntActYn: nextFilters.acntActYn,
        },
      });

      let list = Array.isArray(response?.list) ? response.list : [];
      let nextPaging = {
        ...DEFAULT_PAGING,
        ...(response?.paging || {}),
        page: response?.paging?.page ?? nextPage,
        size: response?.paging?.size ?? nextRecordSize,
      };

      setRows(list);
      setPaging(nextPaging);
      setPage(nextPage);

      setSelectedEmpNo((prev) => {
        if (!prev) return list[0]?.empNo || "";
        let exists = list.some((row) => row.empNo === prev);
        return exists ? prev : list[0]?.empNo || "";
      });
    } catch (error) {
      console.error(error);
      alert("권한 목록을 불러오지 못했습니다.");
      setRows([]);
      setPaging({
        ...DEFAULT_PAGING,
        page: 1,
        size: nextRecordSize,
        recordSize: nextRecordSize,
      });
      setPage(1);
      setSelectedEmpNo("");
    } finally {
      setLoading(false);
    }
  }

  async function loadHierarchy() {
    setHierLoading(true);
    try {
      let response = await fetchRoleHierarchy();
      let list = Array.isArray(response) ? response : [];
      setEdges(list);
      setHierDirty(false);
    } catch (error) {
      console.error(error);
      alert("권한 상속 구조를 불러오지 못했습니다.");
      setEdges([]);
      setHierDirty(false);
    } finally {
      setHierLoading(false);
    }
  }

  function handleFilterChange(name, value) {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  }

  async function resetFilters() {
    setFilters(DEFAULT_FILTERS);
    setRecordSize(10);
    setPage(1);
    await loadList(1, DEFAULT_FILTERS, 10);
  }

  function openEdit(row) {
    if (!row?.empNo) return;
    setSelectedEmpNo(row.empNo);
    setSelectedRow(row);
    setEditDeptRole(row.deptRoleCd || "ROLE_USER");
    setEditPosRole(row.posRoleCd || "ROLE_EMP");
    setModalOpen(true);
  }

  function closeEdit() {
    setModalOpen(false);
    setSelectedRow(null);
  }

  function applyPolicyToModal() {
    let isHrDept = selectedDept?.deptTypeCd === "HR01";
    let isLeader =
      !!selectedDept?.deptHeadEmpNo && selectedDept.deptHeadEmpNo === selectedRow?.empNo;

    setEditDeptRole(isHrDept ? "ROLE_HR" : "ROLE_USER");
    setEditPosRole(isLeader ? "ROLE_LEADER" : "ROLE_EMP");
  }

  async function saveEmpRoles() {
    if (!selectedRow?.empNo) return;

    setSavingEmpRole(true);
    try {
      await updateEmpRoles(selectedRow.empNo, {
        empNo: selectedRow.empNo,
        roleCds: [editDeptRole, editPosRole],
      });
      alert("사원 권한이 저장되었습니다.");
      closeEdit();
      await loadList(page, filters, recordSize);
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "사원 권한 저장에 실패했습니다.");
    } finally {
      setSavingEmpRole(false);
    }
  }

  async function handleExcelDownload() {
    if ((paging?.totalCount ?? 0) <= 0) {
      alert("다운로드할 조회 결과가 없습니다.");
      return;
    }

    setExcelLoading(true);
    try {
      let response = await downloadAuthorityEmpExcel({
        params: {
          deptCd: filters.deptCd,
          posCd: filters.posCd,
          empNm: safeText(filters.empNm).trim(),
          empNo: safeText(filters.empNo).trim(),
          deptRoleCd: filters.deptRoleCd,
          posRoleCd: filters.posRoleCd,
          acntActYn: filters.acntActYn,
        },
      });
      downloadBlob(response, "권한관리_사원권한.xlsx");
    } catch (error) {
      console.error(error);
      alert("엑셀 파일을 다운로드하지 못했습니다.");
    } finally {
      setExcelLoading(false);
    }
  }

  function selectRole(role) {
    if (!role?.roleCd) return;
    setSelectedRoleCd(role.roleCd);
    setRoleFormMode("EDIT");
    setRoleForm({
      roleCd: role.roleCd || "",
      roleNm: role.roleNm || "",
      roleDesc: role.roleDesc || "",
    });
  }

  function resetRoleForm() {
    setRoleFormMode("CREATE");
    setSelectedRoleCd("");
    setRoleForm(DEFAULT_ROLE_FORM);
  }

  async function handleDeleteRole() {
    let targetRoleCd = safeText(roleForm.roleCd).trim();

    if (roleFormMode !== "EDIT" || !targetRoleCd) {
      alert("삭제할 권한 항목을 먼저 선택해 주세요.");
      return;
    }

    let confirmed = window.confirm(
      `선택한 권한 항목을 삭제하시겠습니까?\n권한코드: ${targetRoleCd}`
    );
    if (!confirmed) return;

    setRoleSaving(true);
    try {
      await deleteRole(targetRoleCd);
      alert("권한 항목이 삭제되었습니다.");
      setSelectedRoleCd("");
      setRoleFormMode("CREATE");
      setRoleForm(DEFAULT_ROLE_FORM);
      await loadRoles(true);
      await loadHierarchy();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "권한 항목 삭제에 실패했습니다.");
    } finally {
      setRoleSaving(false);
    }
  }

  async function saveRole() {
    let payload = {
      roleCd: safeText(roleForm.roleCd).trim(),
      roleNm: safeText(roleForm.roleNm).trim(),
      roleDesc: safeText(roleForm.roleDesc).trim(),
    };

    if (!payload.roleCd && roleFormMode === "CREATE") {
      alert("권한코드를 입력해 주세요.");
      return;
    }

    if (!payload.roleNm) {
      alert("권한명을 입력해 주세요.");
      return;
    }

    setRoleSaving(true);
    try {
      let targetRoleCd = roleFormMode === "CREATE" ? payload.roleCd : roleForm.roleCd;

      if (roleFormMode === "CREATE") {
        await createRole(payload);
        alert("권한 항목이 등록되었습니다.");
      } else {
        await updateRole(roleForm.roleCd, payload);
        alert("권한 항목이 수정되었습니다.");
      }

      await loadRoles(true, targetRoleCd);
      await loadHierarchy();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "권한 항목 저장에 실패했습니다.");
    } finally {
      setRoleSaving(false);
    }
  }

  function addEdge() {
    let parentRoleCd = roles[0]?.roleCd || "ROLE_HR";
    let childRoleCd = roles[1]?.roleCd || roles[0]?.roleCd || "ROLE_USER";

    setEdges((prev) => [
      ...(prev || []),
      { parentRoleCd, childRoleCd },
    ]);
    setHierDirty(true);
  }

  function updateEdge(index, key, value) {
    setEdges((prev) =>
      (prev || []).map((edge, edgeIndex) => {
        if (edgeIndex !== index) return edge;
        return { ...edge, [key]: value };
      })
    );
    setHierDirty(true);
  }

  function removeEdge(index) {
    setEdges((prev) => (prev || []).filter((_, edgeIndex) => edgeIndex !== index));
    setHierDirty(true);
  }

  async function saveHierarchy() {
    setHierLoading(true);
    try {
      await replaceRoleHierarchy(edges);
      await refreshRoleHierarchy();
      alert("권한 상속 구조가 저장되었습니다.");
      await loadHierarchy();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "권한 상속 구조 저장에 실패했습니다.");
    } finally {
      setHierLoading(false);
    }
  }

  function renderTabBar() {
    return (
      <div className={styled.tabBar}>
        <button
          className={clsx(styled.tabBtn, tab === "EMP" && styled.tabBtnActive)}
          onClick={() => setTab("EMP")}
          type="button"
        >
          사원 권한
        </button>
        <button
          className={clsx(styled.tabBtn, tab === "HIER" && styled.tabBtnActive)}
          onClick={() => setTab("HIER")}
          type="button"
        >
          권한 상속 설정
        </button>
      </div>
    );
  }

  return (
    <div className={styled.wrap}>
      <div className={styled.headerCard}>
        <div className={styled.headerTitleBox}>
          <div className={styled.title}>권한 관리</div>
          <div className={styled.subTitle}>
            사원별 권한 상태와 권한 상속 구조를 한 화면에서 확인하고 바로 정리할 수 있습니다.
            권한 변경 내용은 사용자 접근 범위에 직접 반영되므로, 조회 후 필요한 대상만 선택해서 적용해 주세요.
          </div>
        </div>

        <div className={styled.headerActions}>
          {tab === "EMP" ? (
            <>
              <button
                className={clsx(styled.actionBtn, styled.primaryBtn)}
                onClick={() => loadList(1, filters, recordSize)}
                type="button"
                disabled={loading}
                style={{ display: 'none' }}
              >
                <Search size={15} /> 즉시조회
              </button>
              <button
                className={clsx(styled.actionBtn, styled.ghostBtn)}
                onClick={resetFilters}
                type="button"
                disabled={loading}
              >
                <RefreshCcw size={15} /> 초기화
              </button>
              <button
                className={clsx(styled.actionBtn, styled.ghostBtn)}
                onClick={handleExcelDownload}
                type="button"
                disabled={excelLoading || loading}
              >
                <Download size={15} /> 엑셀
              </button>
            </>
          ) : (
            <>
              <button
                className={clsx(styled.actionBtn, styled.ghostBtn)}
                onClick={() => {
                  loadRoles(true);
                  loadHierarchy();
                }}
                type="button"
                disabled={hierLoading}
              >
                <RefreshCcw size={15} /> 새로고침
              </button>
              <button
                className={clsx(styled.actionBtn, styled.primaryBtn)}
                onClick={saveHierarchy}
                type="button"
                disabled={hierLoading || !hierDirty}
              >
                <Save size={15} /> 저장
              </button>
            </>
          )}
        </div>
      </div>

      <div className={styled.filterCard}>
        {renderTabBar()}

        {tab === "EMP" ? (
          <div className={styled.filterGrid}>
            <div className={styled.filterItem}>
              <label className={styled.filterLabel}>부서</label>
              <select
                className={styled.control}
                value={filters.deptCd}
                onChange={(event) => handleFilterChange("deptCd", event.target.value)}
              >
                <option value="ALL">전체</option>
                {(depts || []).map((dept) => (
                  <option key={dept.deptCd} value={dept.deptCd}>
                    {dept.deptNm}
                  </option>
                ))}
              </select>
            </div>

            <div className={styled.filterItem}>
              <label className={styled.filterLabel}>직위</label>
              <select
                className={styled.control}
                value={filters.posCd}
                onChange={(event) => handleFilterChange("posCd", event.target.value)}
              >
                <option value="ALL">전체</option>
                {(positions || []).map((position) => (
                  <option key={position.posCd} value={position.posCd}>
                    {position.posNm}
                  </option>
                ))}
              </select>
            </div>

            <div className={styled.filterItem}>
              <label className={styled.filterLabel}>사원명</label>
              <input
                className={styled.control}
                value={filters.empNm}
                placeholder="예: 김인사"
                onChange={(event) => handleFilterChange("empNm", event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    loadList(1, filters, recordSize);
                  }
                }}
              />
            </div>

            <div className={styled.filterItem}>
              <label className={styled.filterLabel}>사원번호</label>
              <input
                className={styled.control}
                value={filters.empNo}
                placeholder="예: 2025001"
                onChange={(event) => handleFilterChange("empNo", event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    loadList(1, filters, recordSize);
                  }
                }}
              />
            </div>

            <div className={styled.filterItem}>
              <label className={styled.filterLabel}>부서권한</label>
              <select
                className={styled.control}
                value={filters.deptRoleCd}
                onChange={(event) => handleFilterChange("deptRoleCd", event.target.value)}
              >
                <option value="ALL">전체</option>
                {deptRoleOptions.map((role) => (
                  <option key={role.roleCd} value={role.roleCd}>
                    {buildRoleLabel(role)}
                  </option>
                ))}
              </select>
            </div>

            <div className={styled.filterItem}>
              <label className={styled.filterLabel}>직급권한</label>
              <select
                className={styled.control}
                value={filters.posRoleCd}
                onChange={(event) => handleFilterChange("posRoleCd", event.target.value)}
              >
                <option value="ALL">전체</option>
                {posRoleOptions.map((role) => (
                  <option key={role.roleCd} value={role.roleCd}>
                    {buildRoleLabel(role)}
                  </option>
                ))}
              </select>
            </div>

            <div className={styled.filterItem}>
              <label className={styled.filterLabel}>계정활성</label>
              <select
                className={styled.control}
                value={filters.acntActYn}
                onChange={(event) => handleFilterChange("acntActYn", event.target.value)}
              >
                <option value="ALL">전체</option>
                <option value="Y">활성</option>
                <option value="N">비활성</option>
              </select>
            </div>
          </div>
        ) : null}
      </div>

      {tab === "EMP" ? (
        <div className={styled.resultCard}>
          <div className={styled.resultHeader}>
            <div className={styled.resultTitle}>조회 결과</div>
            <div className={styled.resultTools}>
              <div className={styled.countTag}>총 {paging?.totalCount ?? 0}건</div>
              <div className={styled.pageSizeBox}>
                <span>페이지 크기</span>
                <select
                  value={recordSize}
                  onChange={(event) => setRecordSize(Number(event.target.value) || 10)}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styled.tableWrap}>
            <table className={styled.table}>
              <thead>
                <tr>
                  <th>번호</th>
                  <th>부서</th>
                  <th>직위</th>
                  <th>사원명</th>
                  <th>사원번호</th>
                  <th>부서권한</th>
                  <th>직급권한</th>
                  <th>계정 활성</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className={styled.centerCell}>
                      불러오는 중입니다.
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className={styled.centerCell}>
                      조회 결과가 없습니다.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, rowIndex) => {
                    let active = row.empNo === selectedEmpNo;
                    let rowNo = ((currentPage - 1) * recordSize) + rowIndex + 1;

                    return (
                      <tr
                        key={row.empNo}
                        className={clsx(styled.row, active && styled.activeRow)}
                        onClick={() => setSelectedEmpNo(row.empNo)}
                      >
                        <td>{rowNo}</td>
                        <td>{row.deptNm || "-"}</td>
                        <td>{row.posNm || "-"}</td>
                        <td>{row.empNm || "-"}</td>
                        <td>{row.empNo || "-"}</td>
                        <td>{row.deptRoleNm || row.deptRoleCd || "-"}</td>
                        <td>{row.posRoleNm || row.posRoleCd || "-"}</td>
                        <td>{row.acntActNm || "-"}</td>
                        <td>
                          <button
                            className={styled.inlineBtn}
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              openEdit(row);
                            }}
                          >
                            <Shield size={13} /> 변경
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className={styled.bottomBar}>
            <div className={styled.pagingBar}>
              <button
                className={styled.pageBtn}
                type="button"
                onClick={() => loadList(currentPage - 1, filters, recordSize)}
                disabled={currentPage <= 1 || loading}
              >
                <ChevronLeft size={16} />
              </button>

              {pageNumbers.map((number) => (
                <button
                  key={number}
                  className={clsx(
                    styled.pageBtn,
                    number === currentPage && styled.pageBtnActive
                  )}
                  type="button"
                  onClick={() => loadList(number, filters, recordSize)}
                  disabled={loading}
                >
                  {number}
                </button>
              ))}

              <button
                className={styled.pageBtn}
                type="button"
                onClick={() => loadList(currentPage + 1, filters, recordSize)}
                disabled={currentPage >= totalPageCount || loading}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className={styled.hierWrap}>
          <div className={styled.resultCard}>
            <div className={styled.resultHeader}>
              <div className={styled.resultTitle}>권한 항목 관리</div>
              <div className={styled.resultTools}>
                <div className={styled.helperText}>
                  새 권한을 등록하거나 기존 권한의 표시명과 설명을 정리할 수 있습니다.
                </div>
              </div>
            </div>

            <div className={styled.roleManageArea}>
              <div className={styled.roleListBox}>
                <div className={styled.sectionTitle}>등록된 권한</div>
                <div className={styled.tableWrapSmall}>
                  <table className={styled.table}>
                    <thead>
                      <tr>
                        <th>권한코드</th>
                        <th>권한명</th>
                        <th>사용여부</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(roles || []).length === 0 ? (
                        <tr>
                          <td colSpan={3} className={styled.centerCell}>
                            등록된 권한이 없습니다.
                          </td>
                        </tr>
                      ) : (
                        roles.map((role) => {
                          let active = role.roleCd === selectedRoleCd;
                          return (
                            <tr
                              key={role.roleCd}
                              className={clsx(styled.row, active && styled.activeRow)}
                              onClick={() => selectRole(role)}
                            >
                              <td>{role.roleCd}</td>
                              <td>{role.roleNm || "-"}</td>
                              <td>{role.useYn === "Y" ? "사용" : "미사용"}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={styled.roleFormBox}>
                <div className={styled.sectionTitle}>
                  {roleFormMode === "CREATE" ? "권한 항목 등록" : "권한 항목 수정"}
                </div>

                <div className={styled.formGrid}>
                  <div className={styled.formItem}>
                    <label className={styled.filterLabel}>권한코드</label>
                    <input
                      className={styled.control}
                      value={roleForm.roleCd}
                      placeholder="예: ROLE_MANAGER"
                      disabled={roleFormMode === "EDIT"}
                      onChange={(event) =>
                        setRoleForm((prev) => ({
                          ...prev,
                          roleCd: event.target.value.toUpperCase(),
                        }))
                      }
                    />
                    <div className={styled.formGuide}>
                      기존 권한코드는 변경하지 않고, 새 권한은 ROLE_ 형식으로 등록합니다.
                    </div>
                  </div>

                  <div className={styled.formItem}>
                    <label className={styled.filterLabel}>권한명</label>
                    <input
                      className={styled.control}
                      value={roleForm.roleNm}
                      placeholder="예: 팀장 권한"
                      onChange={(event) =>
                        setRoleForm((prev) => ({ ...prev, roleNm: event.target.value }))
                      }
                    />
                  </div>

                  <div className={styled.formItemWide}>
                    <label className={styled.filterLabel}>설명</label>
                    <textarea
                      className={styled.textarea}
                      value={roleForm.roleDesc}
                      placeholder="권한 사용 범위와 용도를 입력해 주세요."
                      onChange={(event) =>
                        setRoleForm((prev) => ({ ...prev, roleDesc: event.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className={styled.formActionRow}>
                  <button
                    className={clsx(styled.actionBtn, styled.ghostBtn)}
                    type="button"
                    onClick={resetRoleForm}
                    disabled={roleSaving}
                  >
                    <Plus size={14} /> 신규입력
                  </button>

                  {roleFormMode === "EDIT" ? (
                    <button
                      className={clsx(styled.actionBtn, styled.dangerBtn)}
                      type="button"
                      onClick={handleDeleteRole}
                      disabled={roleSaving}
                    >
                      <Trash2 size={14} /> 삭제
                    </button>
                  ) : null}

                  <button
                    className={clsx(styled.actionBtn, styled.primaryBtn)}
                    type="button"
                    onClick={saveRole}
                    disabled={roleSaving}
                  >
                    <Save size={14} /> 저장
                  </button>
                </div>

              </div>
            </div>
          </div>

          <div className={styled.resultCard}>
            <div className={styled.resultHeader}>
              <div className={styled.resultTitle}>권한 상속 설정</div>
              <div className={styled.resultTools}>
                <button
                  className={clsx(styled.actionBtn, styled.ghostBtn)}
                  type="button"
                  onClick={addEdge}
                  disabled={hierLoading}
                >
                  <Plus size={14} /> 추가
                </button>
                <button
                  className={clsx(styled.actionBtn, styled.ghostBtn)}
                  type="button"
                  onClick={async () => {
                    try {
                      await refreshRoleHierarchy();
                      alert("서버 권한 구조를 다시 반영했습니다.");
                    } catch (error) {
                      console.error(error);
                      alert("서버 반영에 실패했습니다.");
                    }
                  }}
                  disabled={hierLoading}
                >
                  <RotateCcw size={14} /> 서버 반영
                </button>
              </div>
            </div>

            <div className={styled.hierHint}>
              <Settings size={15} />
              <span>
                상위 권한이 하위 권한의 접근 범위를 함께 포함하도록 설정하는 화면입니다.
                예를 들어 인사 권한이 일반 권한을 포함하도록 구성하면, 인사 담당자는 일반 사용자 기능도 함께 사용할 수 있습니다.
              </span>
            </div>

            <div className={styled.tableWrap}>
              <table className={styled.table}>
                <thead>
                  <tr>
                    <th>상위 권한</th>
                    <th>하위 권한</th>
                    <th>삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {hierLoading ? (
                    <tr>
                      <td colSpan={3} className={styled.centerCell}>
                        불러오는 중입니다.
                      </td>
                    </tr>
                  ) : edges.length === 0 ? (
                    <tr>
                      <td colSpan={3} className={styled.centerCell}>
                        설정된 권한 상속 구조가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    edges.map((edge, index) => (
                      <tr
                        key={`${index}-${edge.parentRoleCd}-${edge.childRoleCd}`}
                        className={styled.row}
                      >
                        <td>
                          <select
                            className={styled.control}
                            value={edge.parentRoleCd}
                            onChange={(event) =>
                              updateEdge(index, "parentRoleCd", event.target.value)
                            }
                          >
                            {(roles || []).map((role) => (
                              <option key={`parent-${role.roleCd}`} value={role.roleCd}>
                                {buildRoleLabel(role)}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            className={styled.control}
                            value={edge.childRoleCd}
                            onChange={(event) =>
                              updateEdge(index, "childRoleCd", event.target.value)
                            }
                          >
                            {(roles || []).map((role) => (
                              <option key={`child-${role.roleCd}`} value={role.roleCd}>
                                {buildRoleLabel(role)}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <button
                            className={styled.inlineBtn}
                            type="button"
                            onClick={() => removeEdge(index)}
                          >
                            <X size={13} /> 삭제
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className={styled.bottomBar}>
              <div className={styled.pagingPlaceholder} />
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className={styled.modalOverlay} onMouseDown={closeEdit}>
          <div className={styled.modal} onMouseDown={(event) => event.stopPropagation()}>
            <div className={styled.modalHeader}>
              <div>
                <div className={styled.modalTitle}>사원 권한 변경</div>
                <div className={styled.modalSubTitle}>
                  선택한 사원의 부서권한과 직급권한을 바로 조정합니다.
                </div>
              </div>
              <button className={styled.iconBtn} type="button" onClick={closeEdit}>
                <X size={18} />
              </button>
            </div>

            <div className={styled.modalBody}>
              <div className={styled.kvGrid}>
                <div className={styled.kvItem}>
                  <div className={styled.kvKey}>사원</div>
                  <div className={styled.kvValue}>
                    {selectedRow?.empNm} ({selectedRow?.empNo})
                  </div>
                </div>
                <div className={styled.kvItem}>
                  <div className={styled.kvKey}>부서</div>
                  <div className={styled.kvValue}>{selectedRow?.deptNm || "-"}</div>
                </div>
                <div className={styled.kvItem}>
                  <div className={styled.kvKey}>직위</div>
                  <div className={styled.kvValue}>{selectedRow?.posNm || "-"}</div>
                </div>
                <div className={styled.kvItem}>
                  <div className={styled.kvKey}>계정 활성</div>
                  <div className={styled.kvValue}>{selectedRow?.acntActNm || "-"}</div>
                </div>
              </div>

              <div className={styled.formGrid}>
                <div className={styled.formItem}>
                  <label className={styled.filterLabel}>부서권한</label>
                  <select
                    className={styled.control}
                    value={editDeptRole}
                    onChange={(event) => setEditDeptRole(event.target.value)}
                  >
                    {deptRoleOptions.map((role) => (
                      <option key={`edit-dept-${role.roleCd}`} value={role.roleCd}>
                        {buildRoleLabel(role)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styled.formItem}>
                  <label className={styled.filterLabel}>직급권한</label>
                  <select
                    className={styled.control}
                    value={editPosRole}
                    onChange={(event) => setEditPosRole(event.target.value)}
                  >
                    {posRoleOptions.map((role) => (
                      <option key={`edit-pos-${role.roleCd}`} value={role.roleCd}>
                        {buildRoleLabel(role)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styled.noticeBox}>
                <Shield size={15} />
                권한은 부서권한 1개와 직급권한 1개 조합으로 관리합니다. 부서장과 인사부서 여부를 기준으로 기본값을 다시 적용하려면 아래 정책 적용 버튼을 사용해 주세요.
              </div>
            </div>

            <div className={styled.modalFooter}>
              <button
                className={clsx(styled.actionBtn, styled.ghostBtn)}
                type="button"
                onClick={applyPolicyToModal}
                disabled={savingEmpRole}
              >
                <RotateCcw size={14} /> 정책 적용
              </button>

              <div className={styled.modalFooterRight}>
                <button
                  className={clsx(styled.actionBtn, styled.ghostBtn)}
                  type="button"
                  onClick={closeEdit}
                  disabled={savingEmpRole}
                >
                  취소
                </button>
                <button
                  className={clsx(styled.actionBtn, styled.primaryBtn)}
                  type="button"
                  onClick={saveEmpRoles}
                  disabled={savingEmpRole}
                >
                  <Save size={14} /> 저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}