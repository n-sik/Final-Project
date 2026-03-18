import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  UserPlus,
  Search,
  Edit,
  Building2,
  ShieldCheck,
  UserRound,
  Upload,
} from "lucide-react";
import styled from "./Registration.module.css";
import clsx from "clsx";
import apiClient from "../../../api/apiClient";
import Position from "./Position";
import { arrayMove } from "@dnd-kit/sortable";

// 상태 코드 → 한글 + 배지 클래스 매핑
const STAT_MAP = {
  WORK: { label: "재직", cls: "badgeWork" },
  LEAVE: { label: "휴직", cls: "badgeLeave" },
  RESIGN: { label: "퇴사", cls: "badgeResign" },
};

const Registration = () => {
  const [activeTab, setActiveTab] = useState("employees");
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [files, setFiles] = useState({
    profileImg: null,
    idCardImg: null,
    bankBookImg: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCell, setEditingCell] = useState(null);
  const [originalPositions, setOriginalPositions] = useState([]);

  // 유효성 검사 에러 상태 추가
  const [errors, setErrors] = useState({});

  const itemsPerPage = 10;
  const pageGroupSize = 5;

  const [formData, setFormData] = useState({
    empNo: "",
    pwd: "1234",
    deptCd: "",
    posCd: "",
    empNm: "",
    hireDt: "",
    empStatCd: "WORK",
    acntActYn: "Y",
    empEmail: "",
    hpNo: "",
    rrno: "",
    zipCd: "",
    addr1: "",
    addr2: "",
  });

  // 카카오 주소 API 스크립트 동적 로드 (이 부분이 핵심입니다)
  useEffect(() => {
    const scriptId = "kakao-address-script";
    const isExist = document.getElementById(scriptId);

    if (!isExist) {
      const script = document.createElement("script");
      script.src =
        "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      script.id = scriptId;
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const empResponse = await apiClient.get("/api/emp/list");
        if (Array.isArray(empResponse.data)) setEmployees(empResponse.data);

        const posUsedRes = await apiClient.get("/api/emp/positions?useYn=Y");
        if (Array.isArray(posUsedRes.data)) setPositions(posUsedRes.data);

        const deptResponse = await apiClient.get("/api/emp/departments");
        if (Array.isArray(deptResponse.data)) setDepartments(deptResponse.data);
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
        setEmployees([]);
        setPositions([]);
        setDepartments([]);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === "positions") loadPositions();
  }, [activeTab]);

  const loadPositions = async () => {
    try {
      const res = await apiClient.get("/api/emp/positions");
      if (Array.isArray(res.data)) {
        const sorted = [...res.data].sort((a, b) => a.posLvl - b.posLvl);
        setPositions(sorted);
        setOriginalPositions(JSON.parse(JSON.stringify(sorted)));
      }
    } catch (error) {
      console.error("직위 목록 로딩 실패", error);
    }
  };

  // 주소 검색 API 핸들러
  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: (data) => {
        let fullAddr = data.address;
        let extraAddr = "";

        if (data.addressType === "R") {
          if (data.bname !== "") extraAddr += data.bname;
          if (data.buildingName !== "")
            extraAddr +=
              extraAddr !== "" ? `, ${data.buildingName}` : data.buildingName;
          fullAddr += extraAddr !== "" ? ` (${extraAddr})` : "";
        }

        setFormData((prev) => ({
          ...prev,
          zipCd: data.zonecode,
          addr1: fullAddr,
        }));
        // 주소 입력 시 관련 에러 초기화
        setErrors((prev) => ({ ...prev, zipCd: null, addr1: null }));
      },
    }).open();
  };

  // 유효성 검사 로직
  const validateForm = () => {
    const newErrors = {};
    const hpRegex = /^010-\d{3,4}-\d{4}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const rrnoRegex = /^\d{6}-\d{7}$/;

    if (!formData.empNm) newErrors.empNm = "성명을 입력해주세요.";
    if (!formData.deptCd) newErrors.deptCd = "부서를 선택해주세요.";
    if (!formData.posCd) newErrors.posCd = "직위를 선택해주세요.";
    if (!formData.hireDt) newErrors.hireDt = "입사일자를 선택해주세요.";

    if (formData.hpNo && !hpRegex.test(formData.hpNo)) {
      newErrors.hpNo = "형식(010-0000-0000)을 확인해주세요.";
    }
    if (formData.empEmail && !emailRegex.test(formData.empEmail)) {
      newErrors.empEmail = "유효한 이메일을 입력해주세요.";
    }
    if (formData.rrno && !rrnoRegex.test(formData.rrno)) {
      newErrors.rrno = "형식(######-#######)을 확인해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const filteredEmployees = employees.filter((emp) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      emp.empNm?.toLowerCase().includes(s) ||
      emp.empNo?.toLowerCase().includes(s)
    );
  });

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const currentEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const deptMap = Object.fromEntries(
    departments.map((d) => [d.deptCd, d.deptNm]),
  );
  const posMap = Object.fromEntries(positions.map((p) => [p.posCd, p.posNm]));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSelectEmployee = async (employee) => {
    try {
      const { data } = await apiClient.get(`/api/emp/${employee.empNo}`);
      setSelectedEmployee(data);
      setIsEditMode(true);
      setErrors({}); // 선택 시 에러 초기화
      setFormData({
        empNo: data.empNo || "",
        pwd: "",
        deptCd: data.deptCd || "",
        posCd: data.posCd || "",
        empNm: data.empNm || "",
        hireDt: data.hireDt || "",
        empStatCd: data.empStatCd || "WORK",
        acntActYn: data.acntActYn || "Y",
        empEmail: data.empEmail || "",
        hpNo: data.hpNo || "",
        rrno: data.rrno || "",
        zipCd: data.zipCd || "",
        addr1: data.addr1 || "",
        addr2: data.addr2 || "",
      });
    } catch (error) {
      console.error("해당 사원 조회 실패:", error);
      Swal.fire({
        icon: "error",
        title: "조회 실패",
        text: "사원 정보를 불러오는데 실패했습니다.",
        confirmButtonColor: "#3085d6",
      });
    }
  };

  const handleNewEmployee = () => {
    setSelectedEmployee(null);
    setIsEditMode(false);
    setErrors({});
    setFormData({
      empNo: "",
      pwd: "1234",
      deptCd: "",
      posCd: "",
      empNm: "",
      hireDt: "",
      empStatCd: "WORK",
      acntActYn: "Y",
      empEmail: "",
      hpNo: "",
      rrno: "",
      zipCd: "",
      addr1: "",
      addr2: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "Y" : "N") : value,
    }));
    // 입력 시 해당 필드의 에러 메시지 삭제
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사 실행
    if (!validateForm()) {
      Swal.fire({
        icon: "warning",
        title: "입력 정보 확인",
        text: "필수 항목 입력 및 형식을 확인해주세요.",
      });
      return;
    }

    const sendData = new FormData();

    sendData.append(
      "emp",
      new Blob([JSON.stringify(formData)], { type: "application/json" }),
    );

    if (files.profileImg) {
      sendData.append("attachFiles", files.profileImg);
    }
    if (files.idCardImg) {
      sendData.append("attachFiles", files.idCardImg);
    }
    if (files.bankBookImg) {
      sendData.append("attachFiles", files.bankBookImg);
    }

    try {
      Swal.showLoading();

      const url = isEditMode ? "/api/emp/modify" : "/api/emp/register";
      const method = isEditMode ? "put" : "post";

      const response = await apiClient[method](url, sendData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: isEditMode ? "수정 완료" : "등록 완료",
          timer: 1500,
        });

        // 목록 새로고침 및 초기화
        const refreshRes = await apiClient.get("/api/emp/list");
        setEmployees(refreshRes.data);
        handleNewEmployee();
        setFiles({ profileImg: null, idCardImg: null, bankBookImg: null });
      }
    } catch (error) {
      console.error("저장 실패:", error);
      Swal.fire({
        icon: "error",
        title: "저장 실패",
        text: error.response?.data || "서버 오류 발생",
      });
    }
  };

  const handleAddRow = () => {
    const maxNum =
      positions.length > 0
        ? Math.max(
            ...positions.map((p) => {
              const n = parseInt(p.posCd.replace("POS_", ""));
              return isNaN(n) ? 0 : n;
            }),
          )
        : 0;
    const maxLvl =
      positions.length > 0 ? Math.max(...positions.map((p) => p.posLvl)) : 0;
    setPositions([
      ...positions,
      {
        posCd: `POS_${String(maxNum + 1).padStart(2, "0")}`,
        posNm: "신규",
        posLvl: maxLvl + 1,
        useYn: "Y",
        isNew: true,
      },
    ]);
  };

  const handleDoubleClick = (posCd, field) => setEditingCell({ posCd, field });

  const handleEditComplete = (posCd, field, value) => {
    setPositions((prev) =>
      prev.map((p) => (p.posCd === posCd ? { ...p, [field]: value } : p)),
    );
  };

  const handleSaveAll = async () => {
    const result = await Swal.fire({
      title: "변경사항을 저장하시겠습니까?",
      text: "수정된 정보가 서버에 반영됩니다.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      cancelButtonText: "취소",
      confirmButtonText: "저장",
      reverseButtons: true, // 취소 버튼을 왼쪽으로
    });

    if (!result.isConfirmed) return;

    try {
      for (const pos of positions) {
        if (pos.isNew) {
          const { posCd, ...regData } = pos;
          await apiClient.post("/api/emp/positions/create", regData);
        } else {
          await apiClient.put("/api/emp/positions/modify", pos);
        }
      }
      Swal.fire("성공", "성공적으로 저장되었습니다.", "success");
      loadPositions();
    } catch (error) {
      console.error("일괄 저장 오류:", error);
      Swal.fire("오류", "저장 중 오류가 발생했습니다.", "error");
    }
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    setPositions((prev) => {
      const oldIndex = prev.findIndex((p) => p.posCd === active.id);
      const newIndex = prev.findIndex((p) => p.posCd === over.id);
      return arrayMove(prev, oldIndex, newIndex).map((item, index) => ({
        ...item,
        posLvl: index + 1,
      }));
    });
  };

  const handleCancelEdit = () => setEditingCell(null);

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles?.[0])
      setFiles((prev) => ({ ...prev, [name]: selectedFiles[0] }));
  };

  return (
    <div className={styled.contentContainer}>
      {/* 탭 네비게이션 */}
      <div className={styled.tabNavigation}>
        {[
          {
            key: "employees",
            icon: <UserPlus size={16} />,
            label: "사원 목록",
          },
          {
            key: "positions",
            icon: <ShieldCheck size={16} />,
            label: "직위 관리",
          },
          {
            key: "departments",
            icon: <Building2 size={16} />,
            label: "부서 관리",
          },
        ] // 아래 filter를 추가하여 "부서 관리" 탭만 제외합니다.
          .filter((tab) => tab.key !== "departments")
          .map(({ key, icon, label }) => (
            <button
              key={key}
              className={clsx(
                styled.tabButton,
                activeTab === key && styled.tabActive,
              )}
              onClick={() => setActiveTab(key)}
            >
              {icon}
              {label}
            </button>
          ))}
      </div>

      <div className={styled.mainSplitLayout}>
        {/* ===== 사원 목록 탭 ===== */}
        {activeTab === "employees" && (
          <div className={styled.listSide}>
            <div className={styled.sideHeader}>
              <h3>
                사원 목록
                <span className={styled.countTag}>
                  총 {filteredEmployees.length}명
                </span>
              </h3>
              <div className={styled.searchBox}>
                <Search size={16} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="이름, 사번으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className={styled.tableWrapper}>
              <table className={styled.dataTable}>
                <thead>
                  <tr>
                    <th>사원정보</th>
                    <th>부서</th>
                    <th>직위</th>
                    <th>입사일자</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEmployees.map((emp) => {
                    const stat = STAT_MAP[emp.empStatCd] || {
                      label: emp.empStatCd,
                      cls: "",
                    };
                    return (
                      <tr
                        key={emp.empNo}
                        className={clsx(
                          styled.tableRow,
                          selectedEmployee?.empNo === emp.empNo &&
                            styled.selected,
                        )}
                        onClick={() => handleSelectEmployee(emp)}
                      >
                        <td>
                          <div className={styled.info}>
                            <span className={styled.name}>{emp.empNm}</span>
                            <span className={styled.idSub}>{emp.empNo}</span>
                          </div>
                        </td>
                        <td>{deptMap[emp.deptCd] || "-"}</td>
                        <td>{posMap[emp.posCd] || "-"}</td>
                        <td className={styled.dateCell}>{emp.hireDt}</td>
                        <td>
                          <span
                            className={clsx(
                              styled.statusBadge,
                              stat.cls && styled[stat.cls],
                            )}
                          >
                            {stat.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 &&
              (() => {
                // 현재 페이지가 속한 그룹 계산 (예: 1~5페이지면 그룹 0, 6~10페이지면 그룹 1)
                const currentGroup = Math.floor(
                  (currentPage - 1) / pageGroupSize,
                );
                const startPage = currentGroup * pageGroupSize + 1;
                const endPage = Math.min(
                  startPage + pageGroupSize - 1,
                  totalPages,
                );

                const pageNums = [];
                for (let i = startPage; i <= endPage; i++) pageNums.push(i);

                return (
                  <div className={styled.paginationWrapper}>
                    {/* 1. 이전 5페이지 그룹으로 이동 (<<) */}
                    <button
                      className={styled.paginationBtn}
                      onClick={() => setCurrentPage(startPage - 1)}
                      disabled={startPage === 1} // 첫 번째 그룹이면 비활성화
                    >
                      «
                    </button>

                    {/* 2. 현재 그룹의 페이지 번호들 (1 2 3 4 5) */}
                    <div className={styled.paginationNumbers}>
                      {pageNums.map((num) => (
                        <button
                          key={num}
                          className={clsx(
                            styled.paginationNumber,
                            currentPage === num && styled.pageActive,
                          )}
                          onClick={() => setCurrentPage(num)}
                        >
                          {num}
                        </button>
                      ))}
                    </div>

                    {/* 3. 다음 5페이지 그룹으로 이동 (>>) */}
                    <button
                      className={styled.paginationBtn}
                      onClick={() => setCurrentPage(endPage + 1)}
                      disabled={endPage >= totalPages} // 마지막 그룹이면 비활성화
                    >
                      »
                    </button>
                  </div>
                );
              })()}
          </div>
        )}

        {/* ===== 직위 관리 탭 ===== */}
        {activeTab === "positions" && (
          <Position
            positions={positions}
            handleAddRow={handleAddRow}
            handleSaveAll={handleSaveAll}
            handleDragEnd={handleDragEnd}
            editingCell={editingCell}
            setEditingCell={setEditingCell}
            handleDoubleClick={handleDoubleClick}
            handleEditComplete={handleEditComplete}
            handleCancelEdit={handleCancelEdit}
          />
        )}

        {/* ===== 부서 관리 탭 ===== */}
        {activeTab === "departments" && (
          <div className={styled.listSide}>
            <div className={styled.sideHeader}>
              <h3>
                부서 목록
                <span className={styled.countTag}>
                  총 {departments.length}개
                </span>
              </h3>
              <button className={styled.btnPrimary}>+ 부서 추가</button>
            </div>
            <div className={styled.tableWrapper}>
              <table className={styled.dataTable}>
                <thead>
                  <tr>
                    <th>부서명</th>
                    <th>부서코드</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept) => (
                    <tr key={dept.deptCd} className={styled.tableRow}>
                      <td>{dept.deptNm}</td>
                      <td>
                        <span className={styled.codeChip}>{dept.deptCd}</span>
                      </td>
                      <td>
                        <div className={styled.actionBtns}>
                          <button className={styled.btnEdit}>수정</button>
                          <button className={styled.btnDelete}>삭제</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== 오른쪽: 등록/수정 폼 ===== */}
        <div className={styled.formSide}>
          <div className={styled.sideHeader}>
            <h3 className={styled.formTitle}>
              {isEditMode ? (
                <>
                  <Edit
                    size={18}
                    className={styled.titleIcon}
                    style={{ marginRight: "8px" }}
                  />
                  <span>사원 정보 수정</span>
                </>
              ) : (
                <>
                  <UserPlus
                    size={18}
                    className={styled.titleIcon}
                    style={{ marginRight: "8px" }}
                  />
                  <span>신규 사원 등록</span>
                </>
              )}
            </h3>
            <div className={styled.headerActions}>
              {isEditMode && (
                <button
                  type="button"
                  className={styled.btnCancel}
                  onClick={handleNewEmployee}
                >
                  취소
                </button>
              )}
              <button type="submit" form="empForm" className={styled.btnSubmit}>
                {isEditMode ? "수정" : "등록"}
              </button>
            </div>
          </div>

          <div className={styled.scrollArea}>
            <form id="empForm" onSubmit={handleSubmit}>
              <div className={styled.formInnerWrapper}>
                {/* 조직 및 계정 정보 */}
                <section className={styled.formCard}>
                  <h4 className={styled.sectionTitle}>
                    <Building2 size={16} />
                    조직 및 계정 정보
                    <span className={styled.requiredNote}>* 필수</span>
                  </h4>
                  <div className={styled.grid2Cols}>
                    <div className={styled.formGroup}>
                      <label className={styled.requiredLabel}>사원번호</label>
                      <input
                        type="text"
                        name="empNo"
                        className={styled.modernInput}
                        placeholder="자동 생성"
                        value={formData.empNo}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className={styled.formGroup}>
                      <label className={styled.requiredLabel}>비밀번호</label>
                      <input
                        type="password"
                        name="pwd"
                        className={clsx(
                          styled.modernInput,
                          isEditMode && styled.readonlyInput,
                        )}
                        placeholder="수정 불가(보안 항목)"
                        value={formData.pwd}
                        onChange={handleInputChange}
                        readOnly={isEditMode}
                      />
                    </div>
                    <div className={styled.formGroup}>
                      <label className={styled.requiredLabel}>부서</label>
                      <select
                        name="deptCd"
                        className={clsx(
                          styled.modernSelect,
                          errors.deptCd && styled.inputError,
                        )}
                        value={formData.deptCd || ""}
                        onChange={handleInputChange}
                      >
                        <option value="">선택</option>
                        {departments.map((d) => (
                          <option key={d.deptCd} value={d.deptCd}>
                            {d.deptNm}
                          </option>
                        ))}
                      </select>
                      {errors.deptCd && (
                        <span className={styled.errorText}>
                          {errors.deptCd}
                        </span>
                      )}
                    </div>
                    <div className={styled.formGroup}>
                      <label className={styled.requiredLabel}>직위</label>
                      <select
                        name="posCd"
                        className={clsx(
                          styled.modernSelect,
                          errors.posCd && styled.inputError,
                        )}
                        value={formData.posCd || ""}
                        onChange={handleInputChange}
                      >
                        <option value="">선택</option>
                        {positions
                          .filter((p) => p.useYn === "Y")
                          .map((p) => (
                            <option key={p.posCd} value={p.posCd}>
                              {p.posNm}
                            </option>
                          ))}
                      </select>
                      {errors.posCd && (
                        <span className={styled.errorText}>{errors.posCd}</span>
                      )}
                    </div>
                    <div className={styled.formGroup}>
                      <label className={styled.requiredLabel}>사원명</label>
                      <input
                        type="text"
                        name="empNm"
                        className={clsx(
                          styled.modernInput,
                          errors.empNm && styled.inputError,
                        )}
                        placeholder="홍길동"
                        value={formData.empNm}
                        onChange={handleInputChange}
                      />
                      {errors.empNm && (
                        <span className={styled.errorText}>{errors.empNm}</span>
                      )}
                    </div>
                    <div className={styled.formGroup}>
                      <label className={styled.requiredLabel}>입사일자</label>
                      <input
                        type="date"
                        name="hireDt"
                        className={clsx(
                          styled.modernInput,
                          errors.hireDt && styled.inputError,
                        )}
                        value={formData.hireDt}
                        onChange={handleInputChange}
                      />
                      {errors.hireDt && (
                        <span className={styled.errorText}>
                          {errors.hireDt}
                        </span>
                      )}
                    </div>
                  </div>
                </section>

                {/* 보안 및 상태 */}
                <section
                  className={clsx(styled.formCard, styled.formCardAccent)}
                >
                  <h4 className={styled.sectionTitle}>
                    <ShieldCheck size={16} />
                    보안 및 상태
                  </h4>
                  <div className={styled.grid2Cols}>
                    <div className={styled.formGroup}>
                      <label>재직상태</label>
                      <select
                        name="empStatCd"
                        className={styled.modernSelect}
                        value={formData.empStatCd}
                        onChange={handleInputChange}
                      >
                        <option value="WORK">재직</option>
                        <option value="LEAVE">휴직</option>
                        <option value="RESIGN">퇴사</option>
                      </select>
                    </div>
                    <div className={styled.formGroup}>
                      <label>계정 활성화</label>
                      <div className={styled.toggleWrap}>
                        <input
                          type="checkbox"
                          id="active-chk"
                          name="acntActYn"
                          checked={formData.acntActYn === "Y"}
                          onChange={handleInputChange}
                        />
                        <label
                          htmlFor="active-chk"
                          className={styled.toggleLabel}
                        >
                          <span className={styled.toggleTrack}>
                            <span className={styled.toggleThumb} />
                          </span>
                          {formData.acntActYn === "Y" ? "활성" : "비활성"}
                        </label>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 개인 신상 정보 */}
                <section className={styled.formCard}>
                  <h4 className={styled.sectionTitle}>
                    <UserRound size={16} />
                    개인 신상 정보
                  </h4>
                  <div className={styled.grid2Cols}>
                    <div className={styled.formGroup}>
                      <label>이메일 주소</label>
                      <input
                        type="email"
                        name="empEmail"
                        className={clsx(
                          styled.modernInput,
                          errors.empEmail && styled.inputError,
                        )}
                        placeholder="example@email.com"
                        value={formData.empEmail}
                        onChange={handleInputChange}
                      />
                      {errors.empEmail && (
                        <span className={styled.errorText}>
                          {errors.empEmail}
                        </span>
                      )}
                    </div>
                    <div className={styled.formGroup}>
                      <label>휴대전화</label>
                      <input
                        type="tel"
                        name="hpNo"
                        className={clsx(
                          styled.modernInput,
                          errors.hpNo && styled.inputError,
                        )}
                        placeholder="010-0000-0000"
                        value={formData.hpNo}
                        onChange={handleInputChange}
                      />
                      {errors.hpNo && (
                        <span className={styled.errorText}>{errors.hpNo}</span>
                      )}
                    </div>
                    <div className={clsx(styled.formGroup, styled.colSpan2)}>
                      <label>주민등록번호</label>
                      <input
                        type="text"
                        name="rrno"
                        className={clsx(
                          styled.modernInput,
                          errors.rrno && styled.inputError,
                        )}
                        placeholder="######-#######"
                        value={formData.rrno}
                        onChange={handleInputChange}
                      />
                      {errors.rrno && (
                        <span className={styled.errorText}>{errors.rrno}</span>
                      )}
                    </div>
                    <div className={clsx(styled.formGroup, styled.colSpan2)}>
                      <label>주소</label>
                      <div className={styled.addressSearchGroup}>
                        <input
                          type="text"
                          name="zipCd"
                          className={clsx(styled.modernInput, styled.zipInput)}
                          placeholder="우편번호"
                          value={formData.zipCd}
                          readOnly
                        />
                        <button
                          type="button"
                          className={styled.btnOutline}
                          onClick={handleAddressSearch}
                        >
                          검색
                        </button>
                      </div>
                      <input
                        type="text"
                        name="addr1"
                        className={styled.modernInput}
                        placeholder="기본 주소"
                        value={formData.addr1}
                        readOnly
                        style={{ marginTop: "8px" }}
                      />
                      <input
                        type="text"
                        name="addr2"
                        className={styled.modernInput}
                        placeholder="상세 주소"
                        value={formData.addr2}
                        onChange={handleInputChange}
                        style={{ marginTop: "8px" }}
                      />
                    </div>
                  </div>
                </section>

                {/* 증빙 서류 */}
                <section className={styled.formCard}>
                  <h4 className={styled.sectionTitle}>
                    <Upload size={16} />
                    증빙 서류 등록
                  </h4>
                  <div className={styled.fileList}>
                    {[
                      { name: "profileImg", label: "프로필 사진" },
                      { name: "bankBookImg", label: "통장사본" },
                      { name: "idCardImg", label: "신분증사본" },
                    ].map(({ name, label }) => (
                      <label key={name} className={styled.fileItem}>
                        <span className={styled.fileLabel}>{label}</span>
                        <input
                          type="file"
                          name={name}
                          onChange={handleFileChange}
                          className={styled.fileInput}
                        />
                        <span className={styled.fileBtnText}>
                          {files[name] ? files[name].name : "파일 선택"}
                        </span>
                      </label>
                    ))}
                  </div>
                </section>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;
