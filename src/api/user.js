import api from "./client";

export async function getAllergies() {
  const res = await api.get("user/allergies");
  return res.data;
}

export async function getDiseases() {
  const res = await api.get("user/diseases");
  return res.data;
}

export async function getUserProfile(userId) {
  const res = await api.get(`user/profile/${userId}`);
  return res.data;
}

export async function updateUserProfile(userId, payload) {
  const res = await api.patch(`user/profile/${userId}`, payload);
  return res.data;
}


export async function getUserHealthSummary(userId) {
  const res = await api.get(`user/${userId}/health/summary`);
  return res.data;
}


export async function addUserAllergies(userId, payload) {
  const res = await api.post(`user/${userId}/health/allergies`, payload);
  return res.data;
}

export async function addUserDiseases(userId, payload) {
  const res = await api.post(`user/${userId}/health/diseases`, payload);
  return res.data;
}


export async function deleteUserAllergy(userId, allergyId) {
  const res = await api.delete(`user/${userId}/health/allergies/${allergyId}`);
  return res.data;
}

export async function deleteUserDisease(userId, diseaseId) {
  const res = await api.delete(`user/${userId}/health/diseases/${diseaseId}`);
  return res.data;
}

export async function deactivateAccount(payload) {
  const res = await api.post("auth/deactivate-account", payload);
  return res.data;
}