import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { FontAwesome6 as Icon } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  getAllergies,
  getDiseases,
  getUserProfile,
  getUserHealthSummary,
  addUserAllergies,
  addUserDiseases,
  deleteUserAllergy,
  deleteUserDisease,
  updateUserProfile,
} from "../api/user";
import { deactivateAccount, logout } from "../api/auth";
import FancyBackButton from "../components/common/FancyBackButton";
import styles from "./ProfileScreen.styles";

const GENDER_OPTIONS = [
  { code: 1, label: "Male" },
  { code: 2, label: "Female" },
];

const PHONE_MAX_LENGTH = 18;

const UI_ICONS = {
  profile: "user-shield",
  personal: "id-card",
  email: "envelope",
  phone: "phone",
  dob: "calendar-days",
  gender: "venus-mars",
  editPersonal: "pen-to-square",
  editHealth: "heart-pulse",
  allergies: "circle-exclamation",
  diseases: "notes-medical",
  add: "plus",
  remove: "xmark",
  logout: "right-from-bracket",
  back: "arrow-left",
  delete: "trash",
  chevron: "chevron-right",
  warning: "triangle-exclamation",
  keyboard: "keyboard",
  home: "house",
  upload: "upload",
  user: "user",
  check: "check",
  circle: "circle",
  close: "xmark",
};

function toDateInput(value) {
  if (!value) return "";
  if (String(value).includes("T")) return String(value).split("T")[0];
  return String(value);
}

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function resolveCanonicalUserId(profileData, fallbackUserId) {
  return profileData?.userId ?? profileData?.id ?? fallbackUserId;
}

function findOptionById(options, id) {
  const key = String(id);
  return options.find((item) => String(item.id) === key);
}

function getNameById(options, id) {
  const byId = findOptionById(options, id);
  return byId?.name || String(id);
}

function hasId(list, id) {
  const key = String(id);
  return Array.isArray(list) && list.some((x) => String(x) === key);
}

function getNextAvailableOptionId(options, selectedIds, fallbackId = null) {
  const nextOption = options.find((item) => !hasId(selectedIds, item.id));
  return nextOption?.id ?? fallbackId;
}

function getFilteredOptions(options, query) {
  const search = String(query || "").trim().toLowerCase();
  return [...options]
    .filter((item) => !search || String(item.name || "").toLowerCase().includes(search))
    .sort((a, b) => {
      const getRank = (name) => {
        const label = String(name || "").toLowerCase();
        if (!search) return 0;
        if (label === search) return 0;
        if (label.startsWith(search)) return 1;
        if (label.includes(search)) return 2;
        return 3;
      };
      const rankDiff = getRank(a.name) - getRank(b.name);
      if (rankDiff !== 0) return rankDiff;
      return String(a.name || "").localeCompare(String(b.name || ""));
    });
}

function getApiErrorMessage(err, fallback) {
  const responseData = err?.response?.data;
  if (!responseData) return fallback;
  if (typeof responseData === "string") return responseData;
  if (typeof responseData?.message === "string") return responseData.message;
  if (typeof responseData?.title === "string") return responseData.title;
  return fallback;
}

function normalizePhoneForValidation(value) {
  return String(value || "").replace(/[^\d+]/g, "");
}

function isValidLebanesePhone(value) {
  const clean = normalizePhoneForValidation(value);
  if (!clean) return true;

  let digits = clean;
  if (digits.startsWith("+961")) digits = digits.slice(4);
  else if (digits.startsWith("00961")) digits = digits.slice(5);

  if (digits.startsWith("0")) digits = digits.slice(1);

  return /^\d{7,8}$/.test(digits);
}

function isValidDateOfBirth(value) {
  const clean = String(value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) return false;

  const [year, month, day] = clean.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const isRealDate =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;

  if (!isRealDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date <= today;
}

function isUnauthorizedError(err) {
  return Number(err?.response?.status) === 401;
}

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [userId, setUserId] = useState(null);
  const [viewMode, setViewMode] = useState("main");

  const [profile, setProfile] = useState(null);
  const [editProfile, setEditProfile] = useState(null);
  const [editPersonalErrors, setEditPersonalErrors] = useState({});

  const [allergyOptions, setAllergyOptions] = useState([]);
  const [diseaseOptions, setDiseaseOptions] = useState([]);

  const [healthAllergyNames, setHealthAllergyNames] = useState([]);
  const [healthDiseaseNames, setHealthDiseaseNames] = useState([]);

  const [healthAllergyIds, setHealthAllergyIds] = useState([]);
  const [healthDiseaseIds, setHealthDiseaseIds] = useState([]);

  const [pendingAllergyId, setPendingAllergyId] = useState(null);
  const [pendingDiseaseId, setPendingDiseaseId] = useState(null);

  const [allergyPickerOpen, setAllergyPickerOpen] = useState(false);
  const [diseasePickerOpen, setDiseasePickerOpen] = useState(false);
  const [allergySearch, setAllergySearch] = useState("");
  const [diseaseSearch, setDiseaseSearch] = useState("");

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const deleteOk = deleteConfirmText.trim() === "DELETE";

  const displayGender = useMemo(() => {
    const code = Number(profile?.gender ?? editProfile?.gender);
    return GENDER_OPTIONS.find((g) => g.code === code)?.label || "Not set";
  }, [profile?.gender, editProfile?.gender]);

  const displayName = useMemo(() => {
    const first = profile?.firstName?.trim() || "";
    const last = profile?.lastName?.trim() || "";
    const full = `${first} ${last}`.trim();
    return full || profile?.email || "Profile";
  }, [profile]);

  const displaySub = useMemo(() => profile?.email || "Manage your account", [profile?.email]);
  const displayedHealthAllergies = useMemo(() => {
    if (healthAllergyIds.length > 0) {
      return healthAllergyIds.map((id) => getNameById(allergyOptions, id));
    }
    return healthAllergyNames;
  }, [allergyOptions, healthAllergyIds, healthAllergyNames]);
  const displayedHealthDiseases = useMemo(() => {
    if (healthDiseaseIds.length > 0) {
      return healthDiseaseIds.map((id) => getNameById(diseaseOptions, id));
    }
    return healthDiseaseNames;
  }, [diseaseOptions, healthDiseaseIds, healthDiseaseNames]);

  const onBack = () => {
    if (viewMode !== "main") {
      setViewMode("main");
      return;
    }
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate("UserDashboard");
  };

  const openEditPersonal = () => {
    if (profile) {
      setEditProfile({
        firstName: profile?.firstName || "",
        lastName: profile?.lastName || "",
        email: profile?.email || "",
        phone: profile?.phone || "",
        dateOfBirth: toDateInput(profile?.dateOfBirth),
        gender: Number(profile?.gender) === 2 ? 2 : 1,
      });
    }
    setEditPersonalErrors({});
    setViewMode("editPersonal");
  };

  const openEditHealth = () => {
    setPendingAllergyId(getNextAvailableOptionId(allergyOptions, healthAllergyIds, allergyOptions[0]?.id || null));
    setPendingDiseaseId(getNextAvailableOptionId(diseaseOptions, healthDiseaseIds, diseaseOptions[0]?.id || null));
    setAllergySearch("");
    setDiseaseSearch("");
    setAllergyPickerOpen(false);
    setDiseasePickerOpen(false);
    setViewMode("editHealth");
  };

  const resetSessionAndGoToLogin = useCallback(async () => {
    await AsyncStorage.multiRemove(["token", "role", "userId"]);
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  }, [navigation]);

  const handleUnauthorized = useCallback(async () => {
    await resetSessionAndGoToLogin();
    Alert.alert("Session Expired", "Please log in again.");
  }, [resetSessionAndGoToLogin]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const storedUserId = await AsyncStorage.getItem("userId");
      if (!storedUserId) {
        Alert.alert("Session Error", "Missing user id. Please log in again.");
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        return;
      }

      const storedId = storedUserId;

      const [profileRes, allergiesRes, diseasesRes] = await Promise.all([
        getUserProfile(storedId),
        getAllergies(),
        getDiseases(),
      ]);

      const profileData = profileRes?.data || profileRes;
      const canonicalUserId = resolveCanonicalUserId(profileData, storedId);
      setUserId(canonicalUserId);

      const allergies = normalizeList(allergiesRes);
      const diseases = normalizeList(diseasesRes);

      setAllergyOptions(allergies);
      setDiseaseOptions(diseases);

      setProfile(profileData);
      setEditProfile((current) =>
        viewMode === "editPersonal" && current
          ? current
          : {
              firstName: profileData?.firstName || "",
              lastName: profileData?.lastName || "",
              email: profileData?.email || "",
              phone: profileData?.phone || "",
              dateOfBirth: toDateInput(profileData?.dateOfBirth),
              gender: Number(profileData?.gender) === 2 ? 2 : 1,
            }
      );

      const summary = await getUserHealthSummary(canonicalUserId);
      const summaryData = summary?.data || summary;

      setHealthAllergyNames(summaryData?.allergies || []);
      setHealthDiseaseNames(summaryData?.diseases || []);

      const allergyIds = (summaryData?.allergies || [])
        .map((name) => allergies.find((a) => String(a.name).toLowerCase() === String(name).toLowerCase())?.id)
        .filter((x) => x != null);

      const diseaseIds = (summaryData?.diseases || [])
        .map((name) => diseases.find((d) => String(d.name).toLowerCase() === String(name).toLowerCase())?.id)
        .filter((x) => x != null);

      setHealthAllergyIds(allergyIds);
      setHealthDiseaseIds(diseaseIds);

      setPendingAllergyId((currentId) => {
        if (currentId && !hasId(allergyIds, currentId)) return currentId;
        return getNextAvailableOptionId(allergies, allergyIds, allergies[0]?.id || null);
      });
      setPendingDiseaseId((currentId) => {
        if (currentId && !hasId(diseaseIds, currentId)) return currentId;
        return getNextAvailableOptionId(diseases, diseaseIds, diseases[0]?.id || null);
      });
    } catch (err) {
      if (isUnauthorizedError(err)) {
        await handleUnauthorized();
        return;
      }
      Alert.alert("Error", "Failed to load profile information.");
    } finally {
      setLoading(false);
    }
  }, [handleUnauthorized, navigation, viewMode]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  async function onAddAllergy(allergyId = pendingAllergyId, options = {}) {
    if (!userId || !allergyId) return;

    if (hasId(healthAllergyIds, allergyId)) {
      Alert.alert("Already Added", "This allergen is already saved in your profile.");
      return;
    }

    try {
      setSaving(true);
      const nextIds = [...healthAllergyIds, allergyId];
      await addUserAllergies(Number(userId), { userId: Number(userId), allergyIds: [Number(allergyId)] });
      setHealthAllergyIds(nextIds);
      setHealthAllergyNames(nextIds.map((id) => getNameById(allergyOptions, id)));
      setPendingAllergyId(getNextAvailableOptionId(allergyOptions, nextIds, allergyId));
      if (!options.silent) Alert.alert("Success", "Allergen added.");
    } catch (err) {
      if (isUnauthorizedError(err)) {
        await handleUnauthorized();
        return;
      }
      Alert.alert("Error", getApiErrorMessage(err, "Could not add allergen."));
    } finally {
      setSaving(false);
    }
  }

  async function onAddDisease(diseaseId = pendingDiseaseId, options = {}) {
    if (!userId || !diseaseId) return;

    if (hasId(healthDiseaseIds, diseaseId)) {
      Alert.alert("Already Added", "This condition is already saved in your profile.");
      return;
    }

    try {
      setSaving(true);
      const nextIds = [...healthDiseaseIds, diseaseId];
      await addUserDiseases(Number(userId), { userId: Number(userId), diseaseIds: [Number(diseaseId)] });
      setHealthDiseaseIds(nextIds);
      setHealthDiseaseNames(nextIds.map((id) => getNameById(diseaseOptions, id)));
      setPendingDiseaseId(getNextAvailableOptionId(diseaseOptions, nextIds, diseaseId));
      if (!options.silent) Alert.alert("Success", "Condition added.");
    } catch (err) {
      if (isUnauthorizedError(err)) {
        await handleUnauthorized();
        return;
      }
      Alert.alert("Error", getApiErrorMessage(err, "Could not add condition."));
    } finally {
      setSaving(false);
    }
  }

  async function onDeleteAllergy(allergyId, options = {}) {
    if (!userId) return;

    try {
      setSaving(true);
      await deleteUserAllergy(Number(userId), Number(allergyId));
      const nextIds = healthAllergyIds.filter((id) => String(id) !== String(allergyId));
      setHealthAllergyIds(nextIds);
      setHealthAllergyNames(nextIds.map((id) => getNameById(allergyOptions, id)));
      setPendingAllergyId((currentId) => {
        if (currentId && !hasId(nextIds, currentId)) return currentId;
        return getNextAvailableOptionId(allergyOptions, nextIds, allergyOptions[0]?.id || null);
      });
      if (!options.silent) Alert.alert("Success", "Allergy removed from your health profile.");
    } catch (err) {
      if (isUnauthorizedError(err)) {
        await handleUnauthorized();
        return;
      }
      Alert.alert("Error", getApiErrorMessage(err, "Could not delete allergy."));
    } finally {
      setSaving(false);
    }
  }

  async function onDeleteDisease(diseaseId, options = {}) {
    if (!userId) return;

    try {
      setSaving(true);
      await deleteUserDisease(Number(userId), Number(diseaseId));
      const nextIds = healthDiseaseIds.filter((id) => String(id) !== String(diseaseId));
      setHealthDiseaseIds(nextIds);
      setHealthDiseaseNames(nextIds.map((id) => getNameById(diseaseOptions, id)));
      setPendingDiseaseId((currentId) => {
        if (currentId && !hasId(nextIds, currentId)) return currentId;
        return getNextAvailableOptionId(diseaseOptions, nextIds, diseaseOptions[0]?.id || null);
      });
      if (!options.silent) Alert.alert("Success", "Condition removed from your health profile.");
    } catch (err) {
      if (isUnauthorizedError(err)) {
        await handleUnauthorized();
        return;
      }
      Alert.alert("Error", getApiErrorMessage(err, "Could not delete disease."));
    } finally {
      setSaving(false);
    }
  }

  function onToggleAllergyOption(allergyId) {
    if (saving) return;
    if (hasId(healthAllergyIds, allergyId)) {
      onDeleteAllergy(allergyId, { silent: true });
      return;
    }
    onAddAllergy(allergyId, { silent: true });
  }

  function onToggleDiseaseOption(diseaseId) {
    if (saving) return;
    if (hasId(healthDiseaseIds, diseaseId)) {
      onDeleteDisease(diseaseId, { silent: true });
      return;
    }
    onAddDisease(diseaseId, { silent: true });
  }

  function onClearAllergies() {
    if (saving || healthAllergyIds.length === 0) return;
    Alert.alert("Clear Allergies", "Remove all allergies from your profile?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear all",
        style: "destructive",
        onPress: async () => {
          for (const id of [...healthAllergyIds]) {
            await onDeleteAllergy(id, { silent: true });
          }
        },
      },
    ]);
  }

  function onClearDiseases() {
    if (saving || healthDiseaseIds.length === 0) return;
    Alert.alert("Clear Conditions", "Remove all chronic conditions from your profile?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear all",
        style: "destructive",
        onPress: async () => {
          for (const id of [...healthDiseaseIds]) {
            await onDeleteDisease(id, { silent: true });
          }
        },
      },
    ]);
  }

  async function onSavePersonal() {
    if (!editProfile || !userId) return;

    const nextErrors = {};
    const phoneValue = String(editProfile.phone || "").trim();
    const dobValue = String(editProfile.dateOfBirth || "").trim();

    if (!isValidLebanesePhone(phoneValue)) {
      nextErrors.phone = "Enter a valid Lebanese phone number, e.g. 03 123 456 or +961 3 123 456.";
    }

    if (!dobValue) {
      nextErrors.dateOfBirth = "Date of birth is required.";
    } else if (!isValidDateOfBirth(dobValue)) {
      nextErrors.dateOfBirth = "Enter a valid date of birth in YYYY-MM-DD format.";
    }

    setEditPersonalErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setSaving(true);

      await updateUserProfile(Number(userId), {
        userId: Number(userId),
        firstName: String(editProfile.firstName || "").trim(),
        lastName: String(editProfile.lastName || "").trim(),
        phone: phoneValue,
        dateOfBirth: dobValue,
        gender: Number(editProfile.gender) === 2 ? 2 : 1,
      });

      setProfile((current) => ({
        ...current,
        firstName: String(editProfile.firstName || "").trim(),
        lastName: String(editProfile.lastName || "").trim(),
        phone: phoneValue,
        dateOfBirth: dobValue,
        gender: Number(editProfile.gender) === 2 ? 2 : 1,
      }));
      setEditPersonalErrors({});
      setViewMode("main");
      Alert.alert("Success", "Personal information updated successfully.");
    } catch (err) {
      if (isUnauthorizedError(err)) {
        await handleUnauthorized();
        return;
      }
      Alert.alert("Error", getApiErrorMessage(err, "Could not update personal information."));
    } finally {
      setSaving(false);
    }
  }

  async function onConfirmDeleteAccount() {
    if (!deleteOk || !userId) return;

    try {
      setSaving(true);
      await deactivateAccount({ userId: Number(userId) });
      await AsyncStorage.multiRemove(["token", "role", "userId"]);
      setShowDeleteDialog(false);
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      Alert.alert("Done", "Account deleted successfully.");
    } catch (err) {
      if (isUnauthorizedError(err)) {
        await handleUnauthorized();
        return;
      }
      Alert.alert("Error", getApiErrorMessage(err, "Could not delete your account."));
    } finally {
      setSaving(false);
    }
  }

  async function onLogout() {
    try {
      await logout();
    } catch (err) {
      if (!isUnauthorizedError(err)) {
        Alert.alert("Error", getApiErrorMessage(err, "Could not log out right now."));
        return;
      }
    }

    await AsyncStorage.multiRemove(["token", "role", "userId"]);
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  }

  if (loading && !profile) {
    return (
      <LinearGradient colors={["#000000", "#0A0A0A"]} style={styles.safe}>
        <SafeAreaView style={styles.safe} edges={["top"]}>
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color="#1DB954" />
            <Text style={styles.loaderText}>Loading profile...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#000000", "#0A0A0A"]} style={styles.safe}>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.container}>
          <View style={styles.header}>
            <FancyBackButton onPress={onBack} label="Back" />

            {(viewMode === "main" || viewMode === "editHealth") && (
              <Text style={styles.headerTitle}>
                {viewMode === "main" ? "Profile" : "Update Health Profile"}
              </Text>
            )}

            {viewMode === "editPersonal" && (
              <Text style={styles.headerTitle}>Update Personal Information</Text>
            )}
          </View>

          {viewMode === "main" && profile && (
            <ScrollView
              contentContainerStyle={[
                styles.scrollContent,
                { paddingBottom: 106 + insets.bottom },
              ]}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.profileHeadCard}>
                <LinearGradient
                  colors={["rgba(29,185,84,0.22)", "rgba(29,185,84,0.06)"]}
                  style={styles.profileBadge}
                >
                  <View style={styles.profileBadgeInner}>
                    <Icon name={UI_ICONS.profile} size={20} color="#1DB954" solid />
                  </View>
                </LinearGradient>

                <View style={styles.profileHeadTextWrap}>
                  <Text style={styles.profileName} numberOfLines={1}>
                    {displayName}
                  </Text>
                  <Text style={styles.profileSub} numberOfLines={1}>
                    {displaySub}
                  </Text>
                </View>
              </View>

              <View style={styles.card}>
                <View style={styles.cardTitleRow}>
                  <Icon name={UI_ICONS.editHealth} size={18} color="#1DB954" solid />
                  <Text style={styles.cardTitle}>Health Overview</Text>
                </View>

                <Text style={styles.healthLabel}>Allergies</Text>
                <View style={styles.chipsWrap}>
                  {displayedHealthAllergies.length > 0 ? (
                    displayedHealthAllergies.map((name) => (
                      <View key={`main-allergy-${name}`} style={styles.chipDanger}>
                        <Text style={styles.chipDangerText}>{name}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.healthEmptyText}>No allergies saved</Text>
                  )}
                </View>

                <Text style={[styles.healthLabel, styles.healthLabelSecond]}>Chronic Conditions</Text>
                <View style={styles.chipsWrap}>
                  {displayedHealthDiseases.length > 0 ? (
                    displayedHealthDiseases.map((name) => (
                      <View key={`main-disease-${name}`} style={styles.chipWarn}>
                        <Text style={styles.chipWarnText}>{name}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.healthEmptyText}>No conditions saved</Text>
                  )}
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitleStandalone}>Account Management</Text>

                <TouchableOpacity style={styles.actionBtn} onPress={openEditPersonal}>
                  <View style={styles.actionLeft}>
                    <Icon name={UI_ICONS.editPersonal} size={16} color="#1DB954" solid />
                    <Text style={styles.actionText}>Update Personal Info</Text>
                  </View>
                  <Icon name={UI_ICONS.chevron} size={14} color="#6B7280" solid />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={openEditHealth}>
                  <View style={styles.actionLeft}>
                    <Icon name={UI_ICONS.editHealth} size={16} color="#1DB954" solid />
                    <Text style={styles.actionText}>Update Health Profile</Text>
                  </View>
                  <Icon name={UI_ICONS.chevron} size={14} color="#6B7280" solid />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnDanger]}
                  onPress={() => {
                    setDeleteConfirmText("");
                    setShowDeleteDialog(true);
                  }}
                >
                  <View style={styles.actionLeft}>
                    <Icon name={UI_ICONS.delete} size={16} color="#F87171" solid />
                    <Text style={styles.actionTextDanger}>Delete Account</Text>
                  </View>
                  <Icon name={UI_ICONS.chevron} size={14} color="#6B7280" solid />
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
                <Icon name={UI_ICONS.logout} size={16} color="#FFFFFF" solid />
                <Text style={styles.logoutText}>Log Out</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {viewMode === "editHealth" && (
            <ScrollView
              contentContainerStyle={[
                styles.scrollContent,
                { paddingBottom: 106 + insets.bottom },
              ]}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.card}>
                <View style={styles.cardTitleRow}>
                  <Icon name={UI_ICONS.allergies} size={16} color="#1DB954" solid />
                  <Text style={styles.cardTitle}>Allergies</Text>
                </View>

                <View style={styles.healthDropdown}>
                  <Pressable
                    style={styles.healthDropdownHeader}
                    onPress={() => setAllergyPickerOpen((open) => !open)}
                  >
                    <View style={styles.healthDropdownTitleRow}>
                      <Text style={styles.healthDropdownTitle}>Select your allergies</Text>
                      {healthAllergyIds.length > 0 && (
                        <View style={styles.selectedCountPill}>
                          <Text style={styles.selectedCountText}>{healthAllergyIds.length} selected</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.healthHeaderActions}>
                      {healthAllergyIds.length > 0 && (
                        <Pressable
                          style={styles.clearAllBtn}
                          onPress={(event) => {
                            event.stopPropagation();
                            onClearAllergies();
                          }}
                          disabled={saving}
                        >
                          <Text style={styles.clearAllText}>Clear all</Text>
                        </Pressable>
                      )}
                      {allergyPickerOpen && (
                        <Pressable
                          style={styles.doneBtn}
                          onPress={(event) => {
                            event.stopPropagation();
                            setAllergyPickerOpen(false);
                          }}
                        >
                          <Text style={styles.doneBtnText}>Done</Text>
                        </Pressable>
                      )}
                    </View>
                    <Icon
                      name={allergyPickerOpen ? "chevron-up" : "chevron-down"}
                      size={12}
                      color="#9CA3AF"
                      solid
                    />
                  </Pressable>

                  {allergyPickerOpen && (
                    <>
                      {healthAllergyIds.length > 0 && (
                        <View style={styles.selectedChipsWrap}>
                          {healthAllergyIds.map((id) => (
                            <Pressable
                              key={`a-${id}`}
                              style={styles.selectedHealthChip}
                              onPress={() => onToggleAllergyOption(id)}
                              disabled={saving}
                            >
                              <Text style={styles.selectedHealthChipText}>{getNameById(allergyOptions, id)}</Text>
                              <Icon name={UI_ICONS.remove} size={11} color="#0F8F4A" solid />
                            </Pressable>
                          ))}
                        </View>
                      )}

                      <View style={styles.healthSearchWrap}>
                        <Icon name="magnifying-glass" size={13} color="#6B7280" solid />
                        <TextInput
                          value={allergySearch}
                          onChangeText={setAllergySearch}
                          style={styles.healthSearchInput}
                          placeholder="Search allergies..."
                          placeholderTextColor="#6B7280"
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      </View>

                      <ScrollView
                        style={styles.healthDropdownList}
                        nestedScrollEnabled
                        showsVerticalScrollIndicator={false}
                      >
                        {getFilteredOptions(allergyOptions, allergySearch).map((item) => {
                          const checked = hasId(healthAllergyIds, item.id);
                          return (
                            <Pressable
                              key={item.id}
                              style={styles.healthOptionRow}
                              onPress={() => onToggleAllergyOption(item.id)}
                              disabled={saving}
                            >
                              <View style={[styles.healthCheckbox, checked && styles.healthCheckboxOn]}>
                                {checked && <Icon name={UI_ICONS.check} size={11} color="#03150A" solid />}
                              </View>
                              <Text style={styles.healthOptionText}>{item.name}</Text>
                            </Pressable>
                          );
                        })}
                        {getFilteredOptions(allergyOptions, allergySearch).length === 0 && (
                          <Text style={styles.modalNoResultsText}>No matching allergies found.</Text>
                        )}
                      </ScrollView>
                    </>
                  )}
                </View>
              </View>

              <View style={styles.card}>
                <View style={styles.cardTitleRow}>
                  <Icon name={UI_ICONS.diseases} size={16} color="#1DB954" solid />
                  <Text style={styles.cardTitle}>Chronic Conditions</Text>
                </View>

                <View style={styles.healthDropdown}>
                  <Pressable
                    style={styles.healthDropdownHeader}
                    onPress={() => setDiseasePickerOpen((open) => !open)}
                  >
                    <View style={styles.healthDropdownTitleRow}>
                      <Text style={styles.healthDropdownTitle}>Select your conditions</Text>
                      {healthDiseaseIds.length > 0 && (
                        <View style={styles.selectedCountPill}>
                          <Text style={styles.selectedCountText}>{healthDiseaseIds.length} selected</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.healthHeaderActions}>
                      {healthDiseaseIds.length > 0 && (
                        <Pressable
                          style={styles.clearAllBtn}
                          onPress={(event) => {
                            event.stopPropagation();
                            onClearDiseases();
                          }}
                          disabled={saving}
                        >
                          <Text style={styles.clearAllText}>Clear all</Text>
                        </Pressable>
                      )}
                      {diseasePickerOpen && (
                        <Pressable
                          style={styles.doneBtn}
                          onPress={(event) => {
                            event.stopPropagation();
                            setDiseasePickerOpen(false);
                          }}
                        >
                          <Text style={styles.doneBtnText}>Done</Text>
                        </Pressable>
                      )}
                    </View>
                    <Icon
                      name={diseasePickerOpen ? "chevron-up" : "chevron-down"}
                      size={12}
                      color="#9CA3AF"
                      solid
                    />
                  </Pressable>

                  {diseasePickerOpen && (
                    <>
                      {healthDiseaseIds.length > 0 && (
                        <View style={styles.selectedChipsWrap}>
                          {healthDiseaseIds.map((id) => (
                            <Pressable
                              key={`d-${id}`}
                              style={styles.selectedHealthChip}
                              onPress={() => onToggleDiseaseOption(id)}
                              disabled={saving}
                            >
                              <Text style={styles.selectedHealthChipText}>{getNameById(diseaseOptions, id)}</Text>
                              <Icon name={UI_ICONS.remove} size={11} color="#0F8F4A" solid />
                            </Pressable>
                          ))}
                        </View>
                      )}

                      <View style={styles.healthSearchWrap}>
                        <Icon name="magnifying-glass" size={13} color="#6B7280" solid />
                        <TextInput
                          value={diseaseSearch}
                          onChangeText={setDiseaseSearch}
                          style={styles.healthSearchInput}
                          placeholder="Search diseases or conditions..."
                          placeholderTextColor="#6B7280"
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      </View>

                      <ScrollView
                        style={styles.healthDropdownList}
                        nestedScrollEnabled
                        showsVerticalScrollIndicator={false}
                      >
                        {getFilteredOptions(diseaseOptions, diseaseSearch).map((item) => {
                          const checked = hasId(healthDiseaseIds, item.id);
                          return (
                            <Pressable
                              key={item.id}
                              style={styles.healthOptionRow}
                              onPress={() => onToggleDiseaseOption(item.id)}
                              disabled={saving}
                            >
                              <View style={[styles.healthCheckbox, checked && styles.healthCheckboxOn]}>
                                {checked && <Icon name={UI_ICONS.check} size={11} color="#03150A" solid />}
                              </View>
                              <Text style={styles.healthOptionText}>{item.name}</Text>
                            </Pressable>
                          );
                        })}
                        {getFilteredOptions(diseaseOptions, diseaseSearch).length === 0 && (
                          <Text style={styles.modalNoResultsText}>No matching conditions found.</Text>
                        )}
                      </ScrollView>
                    </>
                  )}
                </View>
              </View>
            </ScrollView>
          )}

          {viewMode === "editPersonal" && editProfile && (
            <ScrollView
              contentContainerStyle={[
                styles.scrollContent,
                { paddingBottom: 106 + insets.bottom },
              ]}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.card}>
                <Text style={styles.editHint}>You can edit your personal information below and save when you are ready.</Text>
                <Text style={styles.inputLabel}>First Name</Text>
                <TextInput
                  value={editProfile.firstName}
                  onChangeText={(v) => setEditProfile((s) => ({ ...s, firstName: v }))}
                  style={styles.input}
                  placeholder="First name"
                  placeholderTextColor="#6B7280"
                  editable={!saving}
                />

                <Text style={styles.inputLabel}>Last Name</Text>
                <TextInput
                  value={editProfile.lastName}
                  onChangeText={(v) => setEditProfile((s) => ({ ...s, lastName: v }))}
                  style={styles.input}
                  placeholder="Last name"
                  placeholderTextColor="#6B7280"
                  editable={!saving}
                />

                <Text style={styles.inputLabel}>Email</Text>
                <TextInput value={editProfile.email} editable={false} style={[styles.input, styles.inputDisabled]} />

                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput
                  value={editProfile.phone}
                  onChangeText={(v) => {
                    const value = v.replace(/[^\d+\s()-]/g, "");
                    setEditProfile((s) => ({ ...s, phone: value }));
                    setEditPersonalErrors((current) => ({ ...current, phone: undefined }));
                  }}
                  style={[styles.input, editPersonalErrors.phone && styles.inputError]}
                  placeholder="Phone"
                  placeholderTextColor="#6B7280"
                  keyboardType="phone-pad"
                  maxLength={PHONE_MAX_LENGTH}
                  editable={!saving}
                />
                {editPersonalErrors.phone ? (
                  <Text style={styles.errorText}>{editPersonalErrors.phone}</Text>
                ) : null}

                <Text style={styles.inputLabel}>Date of Birth</Text>
                <TextInput
                  value={editProfile.dateOfBirth}
                  onChangeText={(v) => {
                    setEditProfile((s) => ({ ...s, dateOfBirth: v }));
                    setEditPersonalErrors((current) => ({
                      ...current,
                      dateOfBirth: undefined,
                    }));
                  }}
                  style={[
                    styles.input,
                    editPersonalErrors.dateOfBirth && styles.inputError,
                  ]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#6B7280"
                  maxLength={10}
                  editable={!saving}
                />
                {editPersonalErrors.dateOfBirth ? (
                  <Text style={styles.errorText}>{editPersonalErrors.dateOfBirth}</Text>
                ) : null}

                <Text style={styles.inputLabel}>Gender</Text>
                <TextInput value={displayGender} editable={false} style={[styles.input, styles.inputDisabled]} />

                <TouchableOpacity
                  style={[styles.saveBtn, saving && styles.btnDisabled]}
                  onPress={onSavePersonal}
                  disabled={saving}
                >
                  {saving ? <ActivityIndicator color="#03150A" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}

          <Modal transparent visible={showDeleteDialog} animationType="fade" onRequestClose={() => setShowDeleteDialog(false)}>
            <View style={styles.modalBackdrop}>
              <View style={styles.deleteCard}>
                <Text style={styles.deleteTitle}>Delete Account</Text>
                <Text style={styles.deleteBody}>
                  This is permanent. To confirm, type <Text style={styles.deleteInlineStrong}>DELETE</Text>.
                </Text>

                <View style={styles.warningBox}>
                  <Icon name={UI_ICONS.warning} size={18} color="#F87171" solid />
                  <Text style={styles.warningText}>
                    Your scan history, health profile and all data will be removed forever.
                  </Text>
                </View>

                <View style={styles.deleteInputWrap}>
                  <Icon name={UI_ICONS.keyboard} size={14} color="#6B7280" solid />
                  <TextInput
                    value={deleteConfirmText}
                    onChangeText={setDeleteConfirmText}
                    style={styles.deleteInput}
                    placeholder="Type DELETE"
                    placeholderTextColor="#6B7280"
                    autoCapitalize="characters"
                  />
                </View>

                <View style={styles.deleteBtnRow}>
                  <TouchableOpacity style={styles.deleteCancelBtn} onPress={() => setShowDeleteDialog(false)}>
                    <Text style={styles.deleteCancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.deleteDangerBtn, (!deleteOk || saving) && styles.deleteDangerBtnDisabled]}
                    onPress={onConfirmDeleteAccount}
                    disabled={!deleteOk || saving}
                  >
                    {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.deleteDangerText}>Delete</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 10) }]}>
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("UserDashboard")}>
              <Icon name={UI_ICONS.home} size={18} color="#9CA3AF" solid />
              <Text style={styles.navLabel}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navCenterWrap}
              onPress={() => navigation.navigate("MenuUpload")}
            >
              <View style={styles.navCenterBtn}>
                <Icon name={UI_ICONS.upload} size={20} color="#03150A" solid />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem}>
              <Icon name={UI_ICONS.user} size={18} color="#1DB954" solid />
              <Text style={styles.navLabelActive}>Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
