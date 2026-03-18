import apiClient from "./apiClient";

let BASE = "/api/history/aprv";

function buildParams(values) {
  let params = { ...values };
  Object.keys(params).forEach((key) => {
    let value = params[key];
    if (value === undefined || value === null) {
      delete params[key];
      return;
    }
    if (typeof value === "string" && value.trim() === "") {
      delete params[key];
      return;
    }
    if (String(value) === "ALL") {
      delete params[key];
    }
  });
  return params;
}

export async function fetchAprvHistList({
  page = 1,
  size = 10,
  startDate = "",
  endDate = "",
  formCd = "ALL",
  empNm = "",
  aprvTtl = "",
  statCd = "ALL",
} = {}) {
  let params = buildParams({ page, size, startDate, endDate, formCd, empNm, aprvTtl, statCd });
  let res = await apiClient.get(`${BASE}/list`, { params });
  let data = res?.data;
  return {
    list: Array.isArray(data?.list) ? data.list : [],
    paging: data?.paging || { page, size, totalCount: 0, totalPageCount: 1, startPage: 1, endPage: 1, prev: false, next: false },
  };
}

export async function fetchAprvHistDetail(aprvNo) {
  if (!aprvNo) return null;
  let res = await apiClient.get(`${BASE}/${aprvNo}`);
  return res?.data ?? null;
}

export async function fetchAprvFormTypes() {
  let res = await apiClient.get(`${BASE}/forms`);
  let data = res?.data;
  return Array.isArray(data) ? data : [];
}

export async function fetchAprvStatusTypes() {
  let res = await apiClient.get(`${BASE}/statuses`);
  let data = res?.data;
  return Array.isArray(data) ? data : [];
}

export async function downloadAprvHistExcel({
  startDate = "",
  endDate = "",
  formCd = "ALL",
  empNm = "",
  aprvTtl = "",
  statCd = "ALL",
} = {}) {
  let params = buildParams({ startDate, endDate, formCd, empNm, aprvTtl, statCd });
  return apiClient.get(`${BASE}/excel`, { params, responseType: "blob" });
}
