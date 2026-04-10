import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { BASE_URL } from "./client";

export async function uploadMenu({ file, restaurantName }) {
  const formData = new FormData();
  const normalizedUri =
    Platform.OS === "ios" ? String(file.uri || "").replace("file://", "") : file.uri;

  formData.append("File", {
    uri: normalizedUri,
    type: file.mimeType || "application/octet-stream",
    name: file.name || "menu-upload",
  });

  formData.append("RestaurantName", restaurantName);

  const token = await AsyncStorage.getItem("token");
  const response = await fetch(`${BASE_URL}menu/upload`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const rawBody = await response.text();
  let data = null;

  if (rawBody) {
    try {
      data = JSON.parse(rawBody);
    } catch {
      data = rawBody;
    }
  }

  if (!response.ok) {
    throw {
      response: {
        status: response.status,
        data,
      },
      message:
        (typeof data === "object" ? data?.message || data?.title : data) ||
        `Upload failed with status ${response.status}`,
    };
  }

  return data;
}
