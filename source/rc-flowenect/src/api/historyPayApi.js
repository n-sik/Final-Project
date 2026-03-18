import apiClient from "./apiClient";

let BASE = "/api/history/pay";

function compactParams(params) {
  let q = { ...params };
  Object.keys(q).forEach((k) => {
    let v = q[k];
    if (v === undefined || v === null) delete q[k];
    else if (typeof v === "string" && v.trim() === "") delete q[k];
    else if (String(v) === "ALL") delete q[k];
  });
  return q;
}

export async function fetchPayHistList({
  tab = "EMP_BASE",
  page = 1,
  size = 10,
  startDate = "",
  endDate = "",
  payMonthFrom = "",
  payMonthTo = "",
  deptNm = "ALL",
  posCd = "ALL",
  empNm = "",
  empNo = "",
  status = "ALL",
  bankName = "",
  salaryItemCode = "ALL",
  taxType = "ALL",
  confirmYn = "ALL",
} = {}) {
  let params = compactParams({
    tab,
    page,
    size,
    startDate,
    endDate,
    payMonthFrom,
    payMonthTo,
    deptNm,
    posCd,
    empNm,
    empNo,
    status,
    bankName,
    salaryItemCode,
    taxType,
    confirmYn,
  });

  let res = await apiClient.get(`${BASE}/list`, { params });
  let data = res?.data;

  return {
    list: Array.isArray(data?.list) ? data.list : [],
    paging:
      data?.paging || {
        page,
        size,
        totalCount: 0,
        totalPageCount: 1,
        startPage: 1,
        endPage: 1,
        prev: false,
        next: false,
      },
  };
}

export async function fetchPayStepSetDetail(startDate) {
  if (!startDate) return [];
  let res = await apiClient.get(`${BASE}/step-set/detail`, { params: { startDate } });
  return Array.isArray(res?.data) ? res.data : [];
}

export async function fetchPayrollHistoryDetail(payrollNo) {
  if (!payrollNo) return null;
  let res = await apiClient.get(`/api/payroll/statements/${payrollNo}`);
  return res?.data ?? null;
}

export async function fetchPayHistoryFilterOptions() {
  let [deptRes, posRes, itemRes] = await Promise.all([
    apiClient.get("/api/emp/departments"),
    apiClient.get("/api/payroll/positions"),
    apiClient.get("/api/payroll/allowance-def"),
  ]);

  return {
    departments: Array.isArray(deptRes?.data) ? deptRes.data : [],
    positions: Array.isArray(posRes?.data) ? posRes.data : [],
    salaryItems: Array.isArray(itemRes?.data) ? itemRes.data : [],
  };
}
