import axios from "axios";
import api from "./client";

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const pickFirst = (obj, keys, fallback = null) => {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null) return value;
  }
  return fallback;
};

const extractList = (payload) => {
  if (Array.isArray(payload)) return payload;
  const nested = pickFirst(payload, ["history", "scanHistory", "data", "items", "results"], []);
  return Array.isArray(nested) ? nested : [];
};

const normalizeHistoryRecord = (record, index) => ({
  ScanID: pickFirst(record, ["ScanID", "scanID", "scanId", "id", "Id"], index + 1),
  RestaurantName: String(
    pickFirst(record, ["RestaurantName", "restaurantName", "name", "Name"], "Unknown restaurant")
  ),
  ScanDate: String(
    pickFirst(record, ["ScanDate", "scanDate", "createdAt", "CreatedAt", "date", "Date"], new Date().toISOString())
  ),
  SafeCount: toNumber(pickFirst(record, ["SafeCount", "safeCount", "safe", "Safe"])),
  UnsafeCount: toNumber(pickFirst(record, ["UnsafeCount", "unsafeCount", "unsafe", "Unsafe"])),
  RiskyCount: toNumber(pickFirst(record, ["RiskyCount", "riskyCount", "warningCount", "warnings", "Warnings"])),
});

const normalizeDish = (dish, index) => ({
  DishID: pickFirst(dish, ["DishID", "dishID", "dishId", "id", "Id"], index + 1),
  DishName: String(pickFirst(dish, ["DishName", "dishName", "name", "Name"], `Dish ${index + 1}`)),
  SafetyStatus: String(
    pickFirst(dish, ["SafetyStatus", "safetyStatus", "status", "Status"], "UNKNOWN")
  ).toUpperCase(),
  Ingredients: Array.isArray(pickFirst(dish, ["Ingredients", "ingredients"], []))
    ? pickFirst(dish, ["Ingredients", "ingredients"], [])
    : [],
  DetectedTriggers: Array.isArray(pickFirst(dish, ["DetectedTriggers", "detectedTriggers"], []))
    ? pickFirst(dish, ["DetectedTriggers", "detectedTriggers"], [])
    : [],
  IngredientsFound: Array.isArray(pickFirst(dish, ["IngredientsFound", "ingredientsFound"], []))
    ? pickFirst(dish, ["IngredientsFound", "ingredientsFound"], [])
    : [],
  PredictedIngredients: Array.isArray(
    pickFirst(dish, ["PredictedIngredients", "predictedIngredients"], [])
  )
    ? pickFirst(dish, ["PredictedIngredients", "predictedIngredients"], [])
    : [],
  IngredientPredictionUsed: Boolean(
    pickFirst(dish, ["IngredientPredictionUsed", "ingredientPredictionUsed"], false)
  ),
  Confidence: Number(pickFirst(dish, ["Confidence", "confidence"], 0)) || 0,
  IngredientCoverage: Number(pickFirst(dish, ["IngredientCoverage", "ingredientCoverage"], 0)) || 0,
  NeedsUserConfirmation: Boolean(
    pickFirst(dish, ["NeedsUserConfirmation", "needsUserConfirmation"], false)
  ),
  Conflicts: Array.isArray(pickFirst(dish, ["Conflicts", "conflicts"], []))
    ? pickFirst(dish, ["Conflicts", "conflicts"], [])
    : [],
  Notes: Array.isArray(pickFirst(dish, ["Notes", "notes"], []))
    ? pickFirst(dish, ["Notes", "notes"], [])
    : [],
  ShortSummary: pickFirst(dish, ["ShortSummary", "shortSummary"], null),
});

const normalizeDetails = (payload) => ({
  ScanID: pickFirst(payload, ["ScanID", "scanID", "scanId", "id", "Id"], null),
  RestaurantName: String(
    pickFirst(payload, ["RestaurantName", "restaurantName", "name", "Name"], "Unknown restaurant")
  ),
  ScanDate: String(
    pickFirst(payload, ["ScanDate", "scanDate", "createdAt", "CreatedAt", "date", "Date"], new Date().toISOString())
  ),
  FilePath: String(pickFirst(payload, ["FilePath", "filePath"], "") || ""),
  Summary: pickFirst(payload, ["Summary", "summary"], null),
  ShortSummary:
    pickFirst(payload, ["ShortSummary", "shortSummary"], null) ||
    pickFirst(payload, ["Summary", "summary"], {})?.short_summary ||
    pickFirst(payload, ["Summary", "summary"], {})?.shortSummary ||
    null,
  Dishes: Array.isArray(pickFirst(payload, ["Dishes", "dishes"], []))
    ? pickFirst(payload, ["Dishes", "dishes"], []).map(normalizeDish)
    : [],
});

const toApiError = (error, fallbackMessage) => {
  const apiMessage =
    error?.response?.data?.message ||
    (typeof error?.response?.data === "string" ? error.response.data : "") ||
    (axios.isAxiosError(error) ? error.message : "") ||
    fallbackMessage;

  return new Error(apiMessage);
};

export async function getScanHistory() {
  try {
    const res = await api.get("scan/history");
    return extractList(res.data).map(normalizeHistoryRecord);
  } catch (error) {
    throw toApiError(error, "Failed to load scan history.");
  }
}

export async function getScanDetails(scanId) {
  try {
    const res = await api.get(`scan/${scanId}`);
    return normalizeDetails(res.data || {});
  } catch (error) {
    throw toApiError(error, "Failed to load scan details.");
  }
}
