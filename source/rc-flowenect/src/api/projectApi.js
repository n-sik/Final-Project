import apiClient from "./apiClient";

/**
 * 프로젝트 관리 API
 * - GET    /api/project?deptCd=&projectStatCd=&useYn=&keyword=
 * - GET    /api/project/{projectNo}
 * - POST   /api/project
 * - PUT    /api/project
 * - DELETE /api/project/{projectNo}
 * - PUT    /api/project/{projectNo}/restore
 */
const BASE = "/api/project";

export const fetchProjects = async (params = {}) => {
  const { data } = await apiClient.get(BASE, { params });
  return Array.isArray(data) ? data : [];
};

export const fetchProjectDetail = async (projectNo) => {
  const { data } = await apiClient.get(`${BASE}/${projectNo}`);
  return data;
};

export const createProject = async (payload) => {
  const { data } = await apiClient.post(BASE, payload);
  return data;
};

export const updateProject = async (payload) => {
  const { data } = await apiClient.put(BASE, payload);
  return data;
};

export const deleteProject = async (projectNo) => {
  const { data } = await apiClient.delete(`${BASE}/${projectNo}`);
  return data;
};

export const restoreProject = async (projectNo) => {
  const { data } = await apiClient.put(`${BASE}/${projectNo}/restore`);
  return data;
};
