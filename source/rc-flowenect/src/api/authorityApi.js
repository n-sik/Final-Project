import apiClient from "./apiClient";

const BASE = "/api/authority";

function buildSearchParams({ page = 1, recordSize = 10, params = {} } = {}) {
  let queryParams = {
    "paging.page": page,
    "paging.recordSize": recordSize,
  };

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (String(value).trim() === "") return;
    if (String(value) === "ALL") return;
    queryParams[`params.${key}`] = value;
  });

  return queryParams;
}

export async function fetchAuthorityEmpList({ page = 1, recordSize = 10, params = {} } = {}) {
  let response = await apiClient.get(`${BASE}/emp/list`, {
    params: buildSearchParams({ page, recordSize, params }),
  });

  let data = response?.data;
  return {
    list: Array.isArray(data?.list) ? data.list : [],
    paging: data?.paging || { page, recordSize, totalCount: 0, totalPageCount: 1 },
  };
}

export async function downloadAuthorityEmpExcel({ params = {} } = {}) {
  return apiClient.get(`${BASE}/emp/excel`, {
    params: buildSearchParams({ page: 1, recordSize: 10000, params }),
    responseType: "blob",
  });
}

export async function fetchRoleList() {
  let response = await apiClient.get(`${BASE}/roles`);
  return Array.isArray(response?.data) ? response.data : [];
}

export async function createRole(payload) {
  let response = await apiClient.post(`${BASE}/roles`, payload);
  return response?.data;
}

export async function updateRole(roleCd, payload) {
  let response = await apiClient.put(`${BASE}/roles/${encodeURIComponent(roleCd)}`, payload);
  return response?.data;
}

export async function updateEmpRoles(empNo, payload) {
  let response = await apiClient.put(`${BASE}/emp/${encodeURIComponent(empNo)}/roles`, payload);
  return response?.data;
}

export async function fetchRoleHierarchy() {
  let response = await apiClient.get(`${BASE}/hierarchy`);
  return Array.isArray(response?.data) ? response.data : [];
}

export async function replaceRoleHierarchy(edges) {
  let response = await apiClient.put(`${BASE}/hierarchy`, edges);
  return response?.data;
}

export async function refreshRoleHierarchy() {
  let response = await apiClient.post(`${BASE}/hierarchy/refresh`);
  return response?.data;
}

export async function deleteRole(roleCd) {
  let response = await apiClient.delete(`${BASE}/roles/${encodeURIComponent(roleCd)}`);
  return response?.data;
}