import apiClient from "./apiClient";

let BASE = "/api/history/workforce";

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
  });
  return params;
}

export async function fetchApntHistList({
  page = 1,
  size = 10,
  startDate = "",
  endDate = "",
  empNm = "",
  procEmpNm = "",
  bfDeptNm = "",
  afDeptNm = "",
  apntRsn = "",
} = {}) {
  let params = buildParams({ page, size, startDate, endDate, empNm, procEmpNm, bfDeptNm, afDeptNm, apntRsn });
  let res = await apiClient.get(`${BASE}/apnt/list`, { params });
  let data = res?.data;
  return {
    list: Array.isArray(data?.list) ? data.list : [],
    paging: data?.paging || { page, size, totalCount: 0, totalPageCount: 1, startPage: 1, endPage: 1, prev: false, next: false },
  };
}

export async function fetchPromotionHistList({
  page = 1,
  size = 10,
  startDate = "",
  endDate = "",
  empNm = "",
  procEmpNm = "",
  bfPosNm = "",
  afPosNm = "",
  promoRsn = "",
} = {}) {
  let params = buildParams({ page, size, startDate, endDate, empNm, procEmpNm, bfPosNm, afPosNm, promoRsn });
  let res = await apiClient.get(`${BASE}/promotion/list`, { params });
  let data = res?.data;
  return {
    list: Array.isArray(data?.list) ? data.list : [],
    paging: data?.paging || { page, size, totalCount: 0, totalPageCount: 1, startPage: 1, endPage: 1, prev: false, next: false },
  };
}

export async function downloadApntHistExcel({
  startDate = "",
  endDate = "",
  empNm = "",
  procEmpNm = "",
  bfDeptNm = "",
  afDeptNm = "",
  apntRsn = "",
} = {}) {
  let params = buildParams({ startDate, endDate, empNm, procEmpNm, bfDeptNm, afDeptNm, apntRsn });
  return apiClient.get(`${BASE}/apnt/excel`, { params, responseType: "blob" });
}

export async function downloadPromotionHistExcel({
  startDate = "",
  endDate = "",
  empNm = "",
  procEmpNm = "",
  bfPosNm = "",
  afPosNm = "",
  promoRsn = "",
} = {}) {
  let params = buildParams({ startDate, endDate, empNm, procEmpNm, bfPosNm, afPosNm, promoRsn });
  return apiClient.get(`${BASE}/promotion/excel`, { params, responseType: "blob" });
}
