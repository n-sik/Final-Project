import apiClient from "../../../../../api/apiClient";

// 급여관리 화면에서 사용하는 API 호출을 한 곳에서 관리

export async function fetchEmployees() {
  const { data } = await apiClient.get("/api/payroll/employees");
  return data || [];
}

export async function fetchMasters() {
  const [posRes, baseRes, stepRes, allowRes, deductRes] = await Promise.all([
    apiClient.get("/api/payroll/positions"),
    apiClient.get("/api/payroll/pos-base-amt/list"),
    apiClient.get("/api/payroll/step-rates"),
    apiClient.get("/api/payroll/allowance-def"),
    apiClient.get("/api/payroll/deduction-rate"),
  ]);

  return {
    posList: posRes.data || [],
    gradeBaseAmtRows: baseRes.data || [],
    stepRates: stepRes.data || [],
    allowDefRows: allowRes.data || [],
    deductRows: deductRes.data || [],
  };
}

export async function fetchEmpBase(empNo) {
  const { data } = await apiClient.get(`/api/payroll/emp-base/${empNo}`);
  return data || {};
}

export async function fetchEmpBaseHistory(empNo) {
  const { data } = await apiClient.get(`/api/payroll/emp-base/${empNo}/history`);
  return data || [];
}

export async function fetchEmpAllowances(empNo) {
  const { data } = await apiClient.get(`/api/payroll/emp-allowances/${empNo}`);
  return data || [];
}

export async function saveEmpBase(empNo, payload) {
  await apiClient.post(`/api/payroll/emp-base/${empNo}`, payload);
}

export async function saveEmpAllowances(empNo, payload) {
  await apiClient.post(`/api/payroll/emp-allowances/${empNo}`, payload);
}

export async function fetchPosBaseAmt(posCd) {
  const { data } = await apiClient.get("/api/payroll/pos-base-amt", {
    params: { posCd },
  });
  return data || null;
}

export async function fetchPosBaseAmtHistory(posCd) {
  const { data } = await apiClient.get(`/api/payroll/pos-base-amt/${posCd}/history`);
  return data || [];
}

export async function savePosBaseAmt(payload) {
  await apiClient.post("/api/payroll/pos-base-amt", payload);
}

export async function saveStepRates(payload) {
  await apiClient.post("/api/payroll/step-rates", payload);
}

export async function fetchStepRates() {
  const { data } = await apiClient.get("/api/payroll/step-rates");
  return data || [];
}

export async function upsertAllowanceDef(payload) {
  const { data } = await apiClient.post("/api/payroll/allowance-def", payload);
  return data;
}

export async function fetchAllowanceDef() {
  const { data } = await apiClient.get("/api/payroll/allowance-def");
  return data || [];
}

export async function upsertDeductionRate(payload) {
  await apiClient.post("/api/payroll/deduction-rate", payload);
}

export async function fetchDeductionRates() {
  const { data } = await apiClient.get("/api/payroll/deduction-rate");
  return data || [];
}
