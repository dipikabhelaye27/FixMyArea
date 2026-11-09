import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api` 
  : '/api';

const API = axios.create({
  baseURL,
});

export const getIssues = async (params = {}) => {
  const res = await API.get('/issues', { params });
  return res.data;
};

export const getIssueById = async (id) => {
  const res = await API.get(`/issues/${id}`);
  return res.data;
};

export const checkNearbyDuplicates = async (longitude, latitude, category) => {
  const res = await API.get('/issues/check-duplicates', {
    params: { longitude, latitude, category }
  });
  return res.data;
};

export const submitIssueReport = async (formData) => {
  const res = await API.post('/issues', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const upvoteIssue = async (id, citizenId) => {
  const res = await API.post(`/issues/${id}/upvote`, { citizenId });
  return res.data;
};

export const addCommentToIssue = async (id, author, text) => {
  const res = await API.post(`/issues/${id}/comment`, { author, text });
  return res.data;
};

export const updateIssueStatus = async (id, payload) => {
  const res = await API.patch(`/issues/${id}/status`, payload);
  return res.data;
};

export const resolveIssueWithProof = async (id, formData) => {
  const res = await API.post(`/issues/${id}/resolve`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const submitCitizenVerification = async (id, payload) => {
  const res = await API.post(`/issues/${id}/verify`, payload);
  return res.data;
};

export const mergeIntoMasterIssue = async (masterId, childId, citizenId) => {
  const res = await API.post('/issues/merge', { masterId, childId, citizenId });
  return res.data;
};

export const getAnalyticsStats = async () => {
  const res = await API.get('/analytics/overview');
  return res.data;
};

export const loginStaff = async (email, password) => {
  const res = await API.post('/auth/login', { email, password });
  return res.data;
};

export default API;

