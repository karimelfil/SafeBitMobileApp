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
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome6";
import LinearGradient from "react-native-linear-gradient";
import {
  deactivateAccount,
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
import FancyBackButton from "../components/common/FancyBackButton";
import styles from "./ProfileScreen.styles";

const GENDER_OPTIONS = [
  { code: 1, label: "Male" },
  { code: 2, label: "Female" },
];

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
  check: "circle-check",
  circle: "circle",
  close: "xmark",
};

function toDateInput(value) {
  if (!value) return "";
  if (String(value).includes("T")) return String(value).split("T")[0];
  return String(value);
}

function formatDisplayDate(value) {
  if (!value) return "Not set";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
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

function getApiErrorMessage(err, fallback) {
  const responseData = err?.response?.data;
  if (!responseData) return fallback;
  if (typeof responseData === "string") return responseData;
  if (typeof responseData?.message === "string") return responseData.message;
  if (typeof responseData?.title === "string") return responseData.title;
  return fallback;
}

function SelectModal({ visible, title, options, onSelect, onClose, selectedId }) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.selectModalCard}>
          <View style={styles.selectModalHeader}>
            <Text style={styles.selectModalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name={UI_ICONS.close} size={20} color="#9CA3AF" solid />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.selectList} showsVerticalScrollIndicator={false}>
            {options.map((item) => {
              const selected = String(selectedId) === String(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.selectItem, selected && styles.selectItemActive]}
                  onPress={() => {
                    onSelect(item.id);
                    onClose();
                  }}
                >
                  <Icon
                    name={selected ? UI_ICONS.check : UI_ICONS.circle}
                    size={18}
                    color={selected ? "#1DB954" : "#6B7280"}
                    solid
                  />
                  <Text style={[styles.selectItemText, selected && styles.selectItemTextActive]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function ProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [userId, setUserId] = useState(null);
  const [viewMode, setViewMode] = useState("main");

  const [profile, setProfile] = useState(null);
  const [editProfile, setEditProfile] = useState(null);

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

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const deleteOk = deleteConfirmText.trim().toUpperCase() === "DELETE";

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
    setViewMode("editPersonal");
  };

  const openEditHealth = () => {
    setPendingAllergyId(healthAllergyIds[0] || allergyOptions[0]?.id || null);
    setPendingDiseaseId(healthDiseaseIds[0] || diseaseOptions[0]?.id || null);
    setViewMode("editHealth");
  };

  const loadData = useCallback(async () => {
    try {
      if (!profile) setLoading(true);

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
      setEditProfile({
        firstName: profileData?.firstName || "",
        lastName: profileData?.lastName || "",
        email: profileData?.email || "",
        phone: profileData?.phone || "",
        dateOfBirth: toDateInput(profileData?.dateOfBirth),
        gender: Number(profileData?.gender) === 2 ? 2 : 1,
      });

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

      setPendingAllergyId(allergyIds[0] || allergies[0]?.id || null);
      setPendingDiseaseId(diseaseIds[0] || diseases[0]?.id || null);
    } catch (err) {
      console.error("loadData error:", err?.response?.data || err);
      Alert.alert("Error", "Failed to load profile information.");
    } finally {
      setLoading(false);
    }
  }, [navigation, profile]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  async function onAddAllergy() {
    if (!userId || !pendingAllergyId) return;

    if (hasId(healthAllergyIds, pendingAllergyId)) {
      Alert.alert("Already Added", "This allergen is already saved in your profile.");
      return;
    }

    try {
      setSaving(true);
      await addUserAllergies(userId, { userId, allergyIds: [pendingAllergyId] });
      await loadData();
      Alert.alert("Success", "Allergen added.");
    } catch (err) {
      Alert.alert("Error", getApiErrorMessage(err, "Could not add allergen."));
    } finally {
      setSaving(false);
    }
  }

  async function onAddDisease() {
    if (!userId || !pendingDiseaseId) return;

    if (hasId(healthDiseaseIds, pendingDiseaseId)) {
      Alert.alert("Already Added", "This condition is already saved in your profile.");
      return;
    }

    try {
      setSaving(true);
      await addUserDiseases(userId, { userId, diseaseIds: [pendingDiseaseId] });
      await loadData();
      Alert.alert("Success", "Condition added.");
    } catch (err) {
      Alert.alert("Error", getApiErrorMessage(err, "Could not add condition."));
    } finally {
      setSaving(false);
    }
  }

  async function onDeleteAllergy(allergyId) {
    if (!userId) return;

    try {
      setSaving(true);
      await deleteUserAllergy(userId, allergyId);
      await loadData();
    } catch (err) {
      Alert.alert("Error", getApiErrorMessage(err, "Could not delete allergy."));
    } finally {
      setSaving(false);
    }
  }

  async function onDeleteDisease(diseaseId) {
    if (!userId) return;

    try {
      setSaving(true);
      await deleteUserDisease(userId, diseaseId);
      await loadData();
    } catch (err) {
      Alert.alert("Error", getApiErrorMessage(err, "Could not delete disease."));
    } finally {
      setSaving(false);
    }
  }

  async function onSavePersonal() {
    if (!editProfile || !userId) return;

    try {
      setSaving(true);

      await updateUserProfile(userId, {
        userId,
        firstName: String(editProfile.firstName || "").trim(),
        lastName: String(editProfile.lastName || "").trim(),
        phone: String(editProfile.phone || "").trim(),
        dateOfBirth: editProfile.dateOfBirth,
        gender: Number(editProfile.gender) === 2 ? 2 : 1,
      });

      await loadData();
      setViewMode("main");
      Alert.alert("Success", "Personal information updated successfully.");
    } catch (err) {
      Alert.alert("Error", getApiErrorMessage(err, "Could not update personal information."));
    } finally {
      setSaving(false);
    }
  }

  async function onConfirmDeleteAccount() {
    if (!deleteOk || !userId) return;

    try {
      setSaving(true);
      await deactivateAccount({ userId });
      await AsyncStorage.multiRemove(["token", "role", "userId"]);
      setShowDeleteDialog(false);
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      Alert.alert("Done", "Account deleted successfully.");
    } catch {
      Alert.alert("Error", "Could not delete your account.");
    } finally {
      setSaving(false);
    }
  }

  async function onLogout() {
    await AsyncStorage.multiRemove(["token", "role", "userId"]);
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  }

  if (loading && !profile) {
    return (
      <LinearGradient colors={["#000000", "#0A0A0A"]} style={styles.safe}>
        <SafeAreaView style={styles.safe}>
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
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
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
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
                  {healthAllergyNames.length > 0 ? (
                    healthAllergyNames.map((name) => (
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
                  {healthDiseaseNames.length > 0 ? (
                    healthDiseaseNames.map((name) => (
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
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.card}>
                <View style={styles.cardTitleRow}>
                  <Icon name={UI_ICONS.allergies} size={16} color="#1DB954" solid />
                  <Text style={styles.cardTitle}>Allergies</Text>
                </View>

                <View style={styles.selectorRow}>
                  <Pressable style={styles.selectorBtn} onPress={() => setAllergyPickerOpen(true)}>
                    <Text style={styles.selectorText}>
                      {pendingAllergyId ? getNameById(allergyOptions, pendingAllergyId) : "Select allergen"}
                    </Text>
                  </Pressable>
                  <TouchableOpacity style={styles.addBtn} onPress={onAddAllergy} disabled={saving}>
                    <Icon name={UI_ICONS.add} size={14} color="#03150A" solid />
                  </TouchableOpacity>
                </View>

                <View style={styles.chipsWrap}>
                  {healthAllergyIds.map((id) => (
                    <View key={`a-${id}`} style={styles.chipDanger}>
                      <Text style={styles.chipDangerText}>{getNameById(allergyOptions, id)}</Text>
                      <TouchableOpacity onPress={() => onDeleteAllergy(id)} disabled={saving}>
                        <Icon name={UI_ICONS.remove} size={12} color="#F87171" solid />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.card}>
                <View style={styles.cardTitleRow}>
                  <Icon name={UI_ICONS.diseases} size={16} color="#1DB954" solid />
                  <Text style={styles.cardTitle}>Chronic Conditions</Text>
                </View>

                <View style={styles.selectorRow}>
                  <Pressable style={styles.selectorBtn} onPress={() => setDiseasePickerOpen(true)}>
                    <Text style={styles.selectorText}>
                      {pendingDiseaseId ? getNameById(diseaseOptions, pendingDiseaseId) : "Select condition"}
                    </Text>
                  </Pressable>
                  <TouchableOpacity style={styles.addBtn} onPress={onAddDisease} disabled={saving}>
                    <Icon name={UI_ICONS.add} size={14} color="#03150A" solid />
                  </TouchableOpacity>
                </View>

                <View style={styles.chipsWrap}>
                  {healthDiseaseIds.map((id) => (
                    <View key={`d-${id}`} style={styles.chipWarn}>
                      <Text style={styles.chipWarnText}>{getNameById(diseaseOptions, id)}</Text>
                      <TouchableOpacity onPress={() => onDeleteDisease(id)} disabled={saving}>
                        <Icon name={UI_ICONS.remove} size={12} color="#FACC15" solid />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          )}

          {viewMode === "editPersonal" && editProfile && (
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.card}>
                <Text style={styles.inputLabel}>First Name</Text>
                <TextInput
                  value={editProfile.firstName}
                  onChangeText={(v) => setEditProfile((s) => ({ ...s, firstName: v }))}
                  style={styles.input}
                  placeholder="First name"
                  placeholderTextColor="#6B7280"
                />

                <Text style={styles.inputLabel}>Last Name</Text>
                <TextInput
                  value={editProfile.lastName}
                  onChangeText={(v) => setEditProfile((s) => ({ ...s, lastName: v }))}
                  style={styles.input}
                  placeholder="Last name"
                  placeholderTextColor="#6B7280"
                />

                <Text style={styles.inputLabel}>Email</Text>
                <TextInput value={editProfile.email} editable={false} style={[styles.input, styles.inputDisabled]} />

                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput
                  value={editProfile.phone}
                  onChangeText={(v) => setEditProfile((s) => ({ ...s, phone: v }))}
                  style={styles.input}
                  placeholder="Phone"
                  placeholderTextColor="#6B7280"
                  keyboardType="phone-pad"
                />

                <Text style={styles.inputLabel}>Date of Birth</Text>
                <TextInput
                  value={editProfile.dateOfBirth}
                  onChangeText={(v) => setEditProfile((s) => ({ ...s, dateOfBirth: v }))}
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#6B7280"
                />

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

          <SelectModal
            visible={allergyPickerOpen}
            title="Select Allergen"
            options={allergyOptions}
            selectedId={pendingAllergyId}
            onSelect={setPendingAllergyId}
            onClose={() => setAllergyPickerOpen(false)}
          />

          <SelectModal
            visible={diseasePickerOpen}
            title="Select Condition"
            options={diseaseOptions}
            selectedId={pendingDiseaseId}
            onSelect={setPendingDiseaseId}
            onClose={() => setDiseasePickerOpen(false)}
          />

          <View style={styles.bottomNav}>
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("UserDashboard")}>
              <Icon name={UI_ICONS.home} size={18} color="#9CA3AF" solid />
              <Text style={styles.navLabel}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navCenterWrap}
              onPress={() => Alert.alert("Coming soon", "Upload will be available soon.")}
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
