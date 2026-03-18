import apiClient from "./apiClient";

let BASE = "/api/accesslog";

function buildSearchParams({ page, recordSize, params }) {
  let q = {
    "paging.page": page,
    "paging.recordSize": recordSize,
  };

  let safeParams = params || {};
  Object.keys(safeParams).forEach((k) => {
    let v = safeParams[k];
    if (v === undefined || v === null) return;
    if (String(v).trim() === "") return;
    if (String(v) === "ALL") return;
    q[`params.${k}`] = v;
  });

  return q;
}

export let fetchAccessLogList = async ({ page = 1, recordSize = 10, params = {} } = {}) => {
  let q = buildSearchParams({ page, recordSize, params });
  let res = await apiClient.get(`${BASE}/list`, { params: q });
  let data = res?.data;

  return {
    list: Array.isArray(data?.list) ? data.list : [],
    paging: data?.paging || { page, recordSize, totalCount: 0, totalPageCount: 1 },
  };
};

export let fetchAccessLogDetail = async (accessLogNo) => {
  if (!accessLogNo) return null;
  let res = await apiClient.get(`${BASE}/${accessLogNo}`);
  return res?.data ?? null;
};

export let fetchAccessLogFilterOptions = async () => {
  let [deptRes, posRes] = await Promise.all([
    apiClient.get("/api/emp/departments"),
    apiClient.get("/api/emp/positions", { params: { useYn: "Y" } }),
  ]);

  return {
    departments: Array.isArray(deptRes?.data) ? deptRes.data : [],
    positions: Array.isArray(posRes?.data) ? posRes.data : [],
  };
};

export let downloadAccessLogExcel = async ({ params = {} } = {}) => {
  let q = buildSearchParams({ page: 1, recordSize: 100, params });
  return apiClient.get(`${BASE}/excel`, { params: q, responseType: "blob" });
};
