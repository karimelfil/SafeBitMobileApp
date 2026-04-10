import api from "./client";

export async function submitDishFeedback(payload) {
  const res = await api.post("feedback", payload);
  return res.data;
}
