import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

import {
  fetchAllowanceDef,
  fetchDeductionRates,
  fetchEmpAllowances,
  fetchEmpBase,
  fetchEmpBaseHistory,
  fetchEmployees,
  fetchMasters,
  fetchPosBaseAmt,
  fetchPosBaseAmtHistory,
  fetchStepRates,
  saveEmpAllowances,
  saveEmpBase,
  savePosBaseAmt,
  saveStepRates,
  upsertAllowanceDef,
  upsertDeductionRate,
} from "../services/payrollService";

const DEFAULT_EMP_PAY_INFO = {
  paySeq: null,
  empNo: "",
  baseAmt: "",
  usePositionBase: true,
  appliedBaseAmt: "",
  bankName: "",
  accntNo: "",
  deductFamCnt: "",
  salaryGrade: "",
  adjustRsn: "",
  startDtm: "",
  endDtm: "",
};

const DEFAULT_POS_BASE_AMT_FORM = {
  posCd: "",
  stdAmt: "",
  startDtm: "",
};

const DEFAULT_STEP_FORM = {
  salaryStep: "",
  increaseRate: "",
  useYn: "Y",
};

const DEFAULT_ALLOW_DEF_FORM = {
  salaryItemCode: "",
  salaryItemName: "",
  itemType: "지급",
  taxType: "과세",
};

const DEFAULT_DEDUCT_FORM = {
  rateNo: null,
  pensionRate: "",
  healthRate: "",
  employRate: "",
  careRate: "",
  incomeTaxRate: "",
  localTaxRate: "",
  startDtm: "",
};

function todayYmd() {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function todayYmdFromDate(d) {
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * 어떤 형태의 날짜가 오더라도 "YYYY-MM-DD"로 정규화
 * - "2026-03-01"
 * - "2026-03-01 00:00:00"
 * - "2026-03-01T00:00:00.000Z"
 * - Date 객체
 */
function asYmd(v) {
  if (!v) return "";
  if (v instanceof Date) return todayYmdFromDate(v);
  const s = String(v);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

async function swalError(title, err) {
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "알 수 없는 오류가 발생했습니다.";

  await Swal.fire({
    icon: "error",
    title,
    text: msg,
    confirmButtonText: "확인",
  });
}

export default function useSalaryManageController() {
  // 공통 UI
  const [activeTab, setActiveTab] = useState("EMP");

  // 사원목록
  const [empRows, setEmpRows] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);

  // 개인 기준금액/수당
  const [empPayInfo, setEmpPayInfo] = useState(DEFAULT_EMP_PAY_INFO);
  const [empAllowances, setEmpAllowances] = useState([]);
  const [allowModalOpen, setAllowModalOpen] = useState(false);

  // 개인 기준금액 이력(모달)
  const [empBaseHistoryOpen, setEmpBaseHistoryOpen] = useState(false);
  const [empBaseHistoryEmp, setEmpBaseHistoryEmp] = useState(null);
  const [empBaseHistoryRows, setEmpBaseHistoryRows] = useState([]);

  // 마스터(기준금액/호봉, 수당정의, 공제율)
  const [posList, setPosList] = useState([]);
  const [selectedPos, setSelectedPos] = useState(null);
  const [gradeBaseAmtRows, setGradeBaseAmtRows] = useState([]);
  const [posBaseAmtForm, setPosBaseAmtForm] = useState({ ...DEFAULT_POS_BASE_AMT_FORM, startDtm: todayYmd() });

  // 직위별 기준금액 이력(모달)
  const [posBaseHistoryOpen, setPosBaseHistoryOpen] = useState(false);
  const [posBaseHistoryPos, setPosBaseHistoryPos] = useState(null);
  const [posBaseHistoryRows, setPosBaseHistoryRows] = useState([]);

  const [stepRates, setStepRates] = useState([]);
  const [selectedStepIdx, setSelectedStepIdx] = useState(null);
  const [stepForm, setStepForm] = useState(DEFAULT_STEP_FORM);

  // 호봉가산율 이력(모달)
  const [stepHistoryOpen, setStepHistoryOpen] = useState(false);
  const [stepHistoryStep, setStepHistoryStep] = useState(null);
  const [stepHistoryRows, setStepHistoryRows] = useState([]);

  const [allowDefRows, setAllowDefRows] = useState([]);
  const [allowDefForm, setAllowDefForm] = useState(DEFAULT_ALLOW_DEF_FORM);

  const [deductRows, setDeductRows] = useState([]);
  const [deductForm, setDeductForm] = useState({ ...DEFAULT_DEDUCT_FORM, startDtm: todayYmd() });

  // 오른쪽 패널은 EMP 탭에서만 자동 노출 (탭 변경 시 자동 ON/OFF)
  const showRight = useMemo(() => activeTab === "EMP", [activeTab]);

  const reloadEmployees = useCallback(async () => {
    try {
      const rows = await fetchEmployees();
      setEmpRows(rows);
    } catch (e) {
      await swalError("사원 목록 조회 실패", e);
    }
  }, []);

  const reloadMasters = useCallback(async () => {
    try {
      const m = await fetchMasters();
      setPosList(m.posList);
      setGradeBaseAmtRows(m.gradeBaseAmtRows);
      setStepRates(m.stepRates);
      setAllowDefRows(m.allowDefRows);
      setDeductRows(m.deductRows);
    } catch (e) {
      await swalError("마스터 정보 조회 실패", e);
    }
  }, []);

  useEffect(() => {
    reloadEmployees();
    reloadMasters();
  }, [reloadEmployees, reloadMasters]);

  const onSelectEmp = useCallback(async (emp) => {
    try {
      setSelectedEmp(emp);

      const [base, allowances] = await Promise.all([
        fetchEmpBase(emp.empNo),
        fetchEmpAllowances(emp.empNo),
      ]);

      setEmpPayInfo({
        paySeq: base?.paySeq ?? null,
        empNo: base?.empNo ?? emp.empNo,
        baseAmt: base?.baseAmt ?? "",
        usePositionBase: base?.baseAmt == null,
        appliedBaseAmt: emp?.baseAmt ?? base?.baseAmt ?? "",
        bankName: base?.bankName ?? "",
        accntNo: base?.accntNo ?? "",
        deductFamCnt: base?.deductFamCnt ?? "",
        salaryGrade: base?.salaryGrade ?? "",
        adjustRsn: base?.adjustRsn ?? "",
        startDtm: asYmd(base?.startDtm ?? ""),
        endDtm: asYmd(base?.endDtm ?? ""),
      });

      const normAllow = (allowances || []).map((a) => ({
        ...a,
        startDtm: asYmd(a?.startDtm),
        endDtm: asYmd(a?.endDtm),
      }));
      setEmpAllowances(normAllow);
    } catch (e) {
      await swalError("사원 선택 처리 실패", e);
    }
  }, []);

  const openEmpBaseHistory = useCallback(async (emp) => {
    try {
      if (!emp?.empNo) return;

      setEmpBaseHistoryEmp(emp);

      const rows = await fetchEmpBaseHistory(emp.empNo);
      const norm = (rows || []).map((r) => ({
        ...r,
        startDtm: asYmd(r?.startDtm),
        endDtm: asYmd(r?.endDtm),
      }));

      setEmpBaseHistoryRows(norm);
      setEmpBaseHistoryOpen(true);
    } catch (e) {
      await swalError("기준금액 이력 조회 실패", e);
    }
  }, []);

  const openPosBaseHistory = useCallback(async (row) => {
    try {
      const posCd = row?.posCd;
      if (!posCd) return;
      const pos = posList.find((p) => p.posCd === posCd) || null;
      setPosBaseHistoryPos(pos);

      const rows = await fetchPosBaseAmtHistory(posCd);
      const norm = (rows || []).map((r) => ({
        ...r,
        startDtm: asYmd(r?.startDtm),
        endDtm: asYmd(r?.endDtm),
      }));
      setPosBaseHistoryRows(norm);
      setPosBaseHistoryOpen(true);
    } catch (e) {
      await swalError("직위별 기준금액 이력 조회 실패", e);
    }
  }, [posList]);

  const saveEmpRight = useCallback(async () => {
    if (!selectedEmp) {
      await Swal.fire({
        icon: "warning",
        title: "사원을 선택해주세요.",
        confirmButtonText: "확인",
      });
      return;
    }

    // 화면은 '적용일(YYYY-MM-DD)'만 사용
    const s = asYmd(empPayInfo.startDtm);
    const e = asYmd(empPayInfo.endDtm);

    if (s && e && e < s) {
      await Swal.fire({
        icon: "warning",
        title: "적용기간 오류",
        text: "적용종료일은 적용일보다 빠를 수 없습니다.",
        confirmButtonText: "확인",
      });
      return;
    }

    const confirm = await Swal.fire({
      icon: "question",
      title: "저장하시겠습니까?",
      confirmButtonText: "저장",
      showCancelButton: true,
      cancelButtonText: "취소",
    });
    if (!confirm.isConfirmed) return;

    try {
      const trimmedBaseAmt = String(empPayInfo.baseAmt ?? "").trim();
      const usePositionBase = !!empPayInfo.usePositionBase;

      if (!usePositionBase) {
        if (trimmedBaseAmt === "") {
          await Swal.fire({
            icon: "warning",
            title: "개인 기준금액을 입력해주세요.",
            confirmButtonText: "확인",
          });
          return;
        }

        const baseAmtNumber = Number(trimmedBaseAmt);
        if (!Number.isFinite(baseAmtNumber) || baseAmtNumber <= 0) {
          await Swal.fire({
            icon: "warning",
            title: "개인 기준금액은 0보다 큰 금액만 입력할 수 있습니다.",
            confirmButtonText: "확인",
          });
          return;
        }
      }

      await saveEmpBase(selectedEmp.empNo, {
        ...empPayInfo,
        startDtm: s || null,
        // endDtm은 서버에서 9999-12-31로 강제하므로 null로 보내도 OK
        endDtm: e || null,
        baseAmt: usePositionBase ? null : Number(trimmedBaseAmt),
        deductFamCnt:
          empPayInfo.deductFamCnt === "" ? null : Number(empPayInfo.deductFamCnt),
        salaryGrade:
          empPayInfo.salaryGrade === "" ? null : Number(empPayInfo.salaryGrade),
      });

      await saveEmpAllowances(selectedEmp.empNo, {
        allowances: empAllowances.map((a) => ({
          salaryItemCode: a.salaryItemCode,
          itemAmount: a.itemAmount === "" ? 0 : Number(a.itemAmount),
          startDtm: asYmd(a.startDtm) || null,
          endDtm: asYmd(a.endDtm) || null,
        })),
      });

      await reloadEmployees();
      await reloadMasters();

      await Swal.fire({
        icon: "success",
        title: "저장되었습니다.",
        confirmButtonText: "확인",
      });
    } catch (e2) {
      await swalError("저장 실패", e2);
    }
  }, [selectedEmp, empPayInfo, empAllowances, reloadEmployees, reloadMasters]);

  const applyPickedAllowances = useCallback(
    (picked) => {
      const today = todayYmd();
      const existing = new Set(empAllowances.map((a) => a.salaryItemCode));
      const toAdd = (picked || [])
        .filter((p) => !existing.has(p.salaryItemCode))
        .map((p) => ({
          salaryItemCode: p.salaryItemCode,
          salaryItemName: p.salaryItemName,
          itemAmount: 0,
          startDtm: today,
          endDtm: "9999-12-31",
        }));
      setEmpAllowances((v) => [...v, ...toAdd]);
    },
    [empAllowances],
  );

  const onChangeTab = useCallback((nextKey) => {
    setActiveTab(nextKey);
  }, []);

  const onNewMaster = useCallback(() => {
    if (activeTab === "BASE") {
      setPosBaseAmtForm((v) => ({
        ...v,
        stdAmt: "",
        startDtm: todayYmd(),
      }));
    }
    if (activeTab === "STEP") {
      setSelectedStepIdx(null);
      setStepForm(DEFAULT_STEP_FORM);
    }
    if (activeTab === "ALLOW") {
      setAllowDefForm(DEFAULT_ALLOW_DEF_FORM);
    }
    if (activeTab === "DEDUCT") {
      setDeductForm({ ...DEFAULT_DEDUCT_FORM, startDtm: todayYmd() });
    }
  }, [activeTab]);

  const loadPosBaseAmt = useCallback(async (posCd) => {
    try {
      if (!posCd) {
        setPosBaseAmtForm({ ...DEFAULT_POS_BASE_AMT_FORM, startDtm: todayYmd() });
        return;
      }
      const data = await fetchPosBaseAmt(posCd);
      setPosBaseAmtForm({
        posCd: data?.posCd ?? posCd,
        stdAmt: data?.stdAmt ?? "",
        startDtm: todayYmd(),
      });
    } catch (e) {
      await swalError("직위 기준금액 조회 실패", e);
    }
  }, []);

  const savePosBaseAmtAction = useCallback(async () => {
    if (!selectedPos?.posCd) {
      await Swal.fire({
        icon: "warning",
        title: "직위를 선택해주세요.",
        confirmButtonText: "확인",
      });
      return;
    }

    const confirm = await Swal.fire({
      icon: "question",
      title: "저장하시겠습니까?",
      confirmButtonText: "저장",
      showCancelButton: true,
      cancelButtonText: "취소",
    });
    if (!confirm.isConfirmed) return;

    try {
      await savePosBaseAmt({
        posCd: selectedPos.posCd,
        stdAmt: posBaseAmtForm.stdAmt === "" ? null : Number(posBaseAmtForm.stdAmt),
        startDtm: null,
        endDtm: null,
      });
      await reloadMasters();

      await Swal.fire({
        icon: "success",
        title: "저장되었습니다.",
        confirmButtonText: "확인",
      });
    } catch (e) {
      await swalError("저장 실패", e);
    }
  }, [selectedPos, posBaseAmtForm, reloadMasters]);

  const upsertStepFromForm = useCallback(async () => {
    const s = stepForm.salaryStep;
    const r = stepForm.increaseRate;
    if (s === "" || r === "") {
      await Swal.fire({
        icon: "warning",
        title: "호봉/가산율을 입력해주세요.",
        confirmButtonText: "확인",
      });
      return;
    }

    const nextRow = {
      salaryStep: Number(s),
      increaseRate: Number(r),
      useYn: stepForm.useYn || "Y",
      startDtm: todayYmd(),
    };

    setStepRates((prev) => {
      const next = [...prev];
      if (selectedStepIdx === null || selectedStepIdx === undefined) {
        const idx = next.findIndex((x) => Number(x.salaryStep) === Number(nextRow.salaryStep));
        if (idx >= 0) next[idx] = { ...next[idx], ...nextRow };
        else next.push(nextRow);
        return next;
      }
      next[selectedStepIdx] = { ...next[selectedStepIdx], ...nextRow };
      return next;
    });

    setSelectedStepIdx(null);
    setStepForm(DEFAULT_STEP_FORM);
  }, [stepForm, selectedStepIdx]);

  const deleteSelectedStep = useCallback(async () => {
    if (selectedStepIdx === null || selectedStepIdx === undefined) {
      await Swal.fire({
        icon: "warning",
        title: "삭제할 호봉 행을 선택하세요.",
        confirmButtonText: "확인",
      });
      return;
    }

    const confirm = await Swal.fire({
      icon: "warning",
      title: "선택한 호봉을 삭제할까요?",
      confirmButtonText: "삭제",
      showCancelButton: true,
      cancelButtonText: "취소",
    });
    if (!confirm.isConfirmed) return;

    setStepRates((prev) => prev.filter((_, i) => i !== selectedStepIdx));
    setSelectedStepIdx(null);
    setStepForm(DEFAULT_STEP_FORM);
  }, [selectedStepIdx]);

  const saveStepRatesAction = useCallback(async () => {
    const confirm = await Swal.fire({
      icon: "question",
      title: "저장하시겠습니까?",
      confirmButtonText: "저장",
      showCancelButton: true,
      cancelButtonText: "취소",
    });
    if (!confirm.isConfirmed) return;

    try {
      await saveStepRates({
        items: stepRates.map((r) => ({
          salaryStep: Number(r.salaryStep),
          increaseRate: Number(r.increaseRate),
          useYn: r.useYn || "Y",
        })),
      });

      const data = await fetchStepRates();
      const norm = (data || []).map((x) => ({
        ...x,
        startDtm: asYmd(x?.startDtm),

      }));

      setStepRates(norm);
      setSelectedStepIdx(null);
      setStepForm(DEFAULT_STEP_FORM);

      await Swal.fire({
        icon: "success",
        title: "저장되었습니다.",
        confirmButtonText: "확인",
      });
    } catch (e) {
      await swalError("저장 실패", e);
    }
  }, [stepRates]);

  const openStepHistory = useCallback(
    (salaryStep) => {
      if (salaryStep === null || salaryStep === undefined || salaryStep === "") return;
      setStepHistoryStep(salaryStep);
      const rows = (stepRates || [])
        .filter((r) => String(r.salaryStep) === String(salaryStep))
        .map((r) => ({
          ...r,
          startDtm: asYmd(r?.startDtm),
          endDtm: asYmd(r?.endDtm),
        }))
        .sort((a, b) => String(b.startDtm || "").localeCompare(String(a.startDtm || "")));
      setStepHistoryRows(rows);
      setStepHistoryOpen(true);
    },
    [stepRates],
  );

  const saveAllowDefAction = useCallback(async () => {
    if (!allowDefForm.salaryItemName || String(allowDefForm.salaryItemName).trim() === "") {
      await Swal.fire({
        icon: "warning",
        title: "수당명을 입력해주세요.",
        confirmButtonText: "확인",
      });
      return;
    }

    const confirm = await Swal.fire({
      icon: "question",
      title: "저장하시겠습니까?",
      confirmButtonText: "저장",
      showCancelButton: true,
      cancelButtonText: "취소",
    });
    if (!confirm.isConfirmed) return;

    try {
      // 코드가 있으면 수정, 없으면 신규(코드 자동 생성)
      await upsertAllowanceDef(allowDefForm);
      const rows = await fetchAllowanceDef();
      setAllowDefRows(rows);
      setAllowDefForm(DEFAULT_ALLOW_DEF_FORM);

      await Swal.fire({
        icon: "success",
        title: "저장되었습니다.",
        confirmButtonText: "확인",
      });
    } catch (e) {
      await swalError("저장 실패", e);
    }
  }, [allowDefForm]);

  const saveDeductAction = useCallback(async () => {
    const confirm = await Swal.fire({
      icon: "question",
      title: "저장하시겠습니까?",
      confirmButtonText: "저장",
      showCancelButton: true,
      cancelButtonText: "취소",
    });
    if (!confirm.isConfirmed) return;

    try {
      await upsertDeductionRate({
        ...deductForm,
        startDtm: asYmd(deductForm.startDtm) || null,
        pensionRate: deductForm.pensionRate === "" ? null : Number(deductForm.pensionRate),
        healthRate: deductForm.healthRate === "" ? null : Number(deductForm.healthRate),
        employRate: deductForm.employRate === "" ? null : Number(deductForm.employRate),
        careRate: deductForm.careRate === "" ? null : Number(deductForm.careRate),
        incomeTaxRate: deductForm.incomeTaxRate === "" ? null : Number(deductForm.incomeTaxRate),
        localTaxRate: deductForm.localTaxRate === "" ? null : Number(deductForm.localTaxRate),
      });

      const rows = await fetchDeductionRates();
      const norm = (rows || []).map((x) => ({
        ...x,
        startDtm: asYmd(x?.startDtm),
      }));
      if (norm.length > 0) setDeductRows(norm);

      setDeductForm({ ...DEFAULT_DEDUCT_FORM, startDtm: todayYmd() });

      await Swal.fire({
        icon: "success",
        title: "저장되었습니다.",
        confirmButtonText: "확인",
      });
    } catch (e) {
      await swalError("저장 실패", e);
    }
  }, [deductForm]);

  return {
    // ui
    activeTab,
    showRight,
    onChangeTab,

    // header actions
    saveEmpRight,
    onNewMaster,
    saveStepRates: saveStepRatesAction,
    savePosBaseAmt: savePosBaseAmtAction,
    upsertAllowanceDef: saveAllowDefAction,
    upsertDeduct: saveDeductAction,

    // left - emp
    empRows,
    onSelectEmp,
    openEmpBaseHistory,

    // right
    selectedEmp,
    empPayInfo,
    setEmpPayInfo,
    empAllowances,
    setEmpAllowances,
    allowModalOpen,
    setAllowModalOpen,
    applyPickedAllowances,

    // history modal
    empBaseHistoryOpen,
    setEmpBaseHistoryOpen,
    empBaseHistoryEmp,
    empBaseHistoryRows,

    // base
    posList,
    selectedPos,
    setSelectedPos,
    gradeBaseAmtRows,
    posBaseAmtForm,
    setPosBaseAmtForm,
    loadPosBaseAmt,
    openPosBaseHistory,

    // pos base history modal
    posBaseHistoryOpen,
    setPosBaseHistoryOpen,
    posBaseHistoryPos,
    posBaseHistoryRows,

    // step
    stepRates,
    setStepRates,
    selectedStepIdx,
    setSelectedStepIdx,
    stepForm,
    setStepForm,
    upsertStepFromForm,
    deleteSelectedStep,

    stepHistoryOpen,
    setStepHistoryOpen,
    stepHistoryStep,
    stepHistoryRows,
    openStepHistory,

    // allow def
    allowDefRows,
    allowDefForm,
    setAllowDefForm,

    // deduct
    deductRows,
    deductForm,
    setDeductForm,
  };
}
