import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/client.js";

export async function login(email, password) {
  const res = await api.post("auth/login", {
    email,
    password,
  });

  const { token, role, userId } = res.data;

  await AsyncStorage.setItem("token", token);
  await AsyncStorage.setItem("role", role);
  await AsyncStorage.setItem("userId", String(userId));

  return { token, role, userId };
}

export async function register(payload) {
  const res = await api.post("auth/register", payload);
  return res.data;
}
