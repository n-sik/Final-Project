import apiClient from "./apiClient";

/**
 * 부서 관리 API
 * - GET    /api/dept?delYn=&keyword=
 * - GET    /api/dept/{deptCd}
 * - GET    /api/dept/types
 * - POST   /api/dept
 * - PUT    /api/dept
 * - DELETE /api/dept/{deptCd}
 * - PUT    /api/dept/{deptCd}/restore
 */

let BASE = "/api/dept";

export let fetchDepts = async (params = {}) => {
  let res = await apiClient.get(BASE, { params });
  let data = res?.data;
  return Array.isArray(data) ? data : [];
};

export let fetchDeptDetail = async (deptCd) => {
  let res = await apiClient.get(`${BASE}/${deptCd}`);
  return res?.data;
};

export let fetchDeptTypes = async () => {
  let res = await apiClient.get(`${BASE}/types`);
  let data = res?.data;
  return Array.isArray(data) ? data : [];
};

export let createDept = async (payload) => {
  let res = await apiClient.post(BASE, payload);
  return res?.data;
};

export let updateDept = async (payload) => {
  let res = await apiClient.put(BASE, payload);
  return res?.data;
};

export let deleteDept = async (deptCd) => {
  let res = await apiClient.delete(`${BASE}/${deptCd}`);
  return res?.data;
};

export let restoreDept = async (deptCd) => {
  let res = await apiClient.put(`${BASE}/${deptCd}/restore`);
  return res?.data;
};