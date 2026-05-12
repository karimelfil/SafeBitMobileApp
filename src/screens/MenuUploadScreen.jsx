import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { FontAwesome6 as Icon } from "@expo/vector-icons";
import FancyBackButton from "./common/FancyBackButton";
import { submitDishFeedback } from "../api/feedback";
import { uploadMenu } from "../api/menu";
import styles, { getMenuIconBorderStyle } from "../style/MenuUploadScreen.styles";

const STATUS_META = {
  safe: {
    label: "Safe",
    icon: "shield-halved",
    color: "#20C765",
    badgeStyle: styles.badgeSafe,
    badgeTextStyle: styles.badgeTextSafe,
    cardStyle: styles.dishCardSafe,
    accentStyle: styles.accentSafe,
  },
  risky: {
    label: "Risky",
    icon: "triangle-exclamation",
    color: "#F5B400",
    badgeStyle: styles.badgeWarning,
    badgeTextStyle: styles.badgeTextWarning,
    cardStyle: styles.dishCardWarning,
    accentStyle: styles.accentRisky,
  },
  unsafe: {
    label: "Unsafe",
    icon: "circle-xmark",
    color: "#FF4D4D",
    badgeStyle: styles.badgeUnsafe,
    badgeTextStyle: styles.badgeTextUnsafe,
    cardStyle: styles.dishCardUnsafe,
    accentStyle: styles.accentUnsafe,
  },
  unknown: {
    label: "Review",
    icon: "clipboard-list",
    color: "#A3A3A3",
    badgeStyle: styles.badgeNeutral,
    badgeTextStyle: styles.badgeTextNeutral,
    cardStyle: styles.dishCardNeutral,
    accentStyle: styles.accentNeutral,
  },
};

function getStatusMeta(status) {
  return STATUS_META[String(status || "unknown").toLowerCase()] || STATUS_META.unknown;
}

function getOverallStatus(safeCount, riskyCount, unsafeCount) {
  if (unsafeCount > 0) return "unsafe";
  if (riskyCount > 0) return "risky";
  if (safeCount > 0) return "safe";
  return "unknown";
}

function formatTag(tag) {
  return String(tag || "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function cleanDishName(name) {
  return String(name ?? "")
    .replace(/^Dish Name:\s*/i, "")
    .trim()
    .toLowerCase();
}

function toValidDishId(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function normalizeStoredDish(dish) {
  const id = toValidDishId(
    dish?.dishID ?? dish?.dishId ?? dish?.DishID ?? dish?.DishId ?? dish?.id
  );
  const name = cleanDishName(dish?.dishName ?? dish?.DishName ?? dish?.name);
  return { id, name };
}

function extractStoredDishes(payload) {
  const candidates = [
    payload?.dishes,
    payload?.menu?.dishes,
    payload?.menuDishes,
    payload?.savedDishes,
    payload?.createdDishes,
    payload?.result?.dishes,
    payload?.data?.dishes,
    payload?.aiResult?.savedDishes,
  ];

  const merged = [];

  for (const list of candidates) {
    if (Array.isArray(list)) merged.push(...list);
  }

  return merged.map(normalizeStoredDish).filter((item) => item.id && item.name);
}

function buildDetectedIngredients(dish) {
  const ingredientsRaw =
    dish?.ingredients_found || dish?.ingredientsFound || dish?.IngredientsFound;
  const ingredients = Array.isArray(ingredientsRaw) ? ingredientsRaw : [];

  return ingredients.map(formatTag).filter(Boolean);
}

function getDishPrimaryExplanation(dish, ingredients) {
  const shortSummary = dish?.short_summary || dish?.shortSummary || dish?.ShortSummary || "";

  if (String(shortSummary).trim()) {
    return String(shortSummary).trim();
  }

  const conflicts = Array.isArray(dish?.conflicts) ? dish.conflicts.filter(Boolean) : [];
  const notes = Array.isArray(dish?.notes) ? dish.notes.filter(Boolean) : [];

  if (conflicts.length > 0) {
    const explanation = conflicts
      .map((conflict) => String(conflict?.explanation || "").trim())
      .filter(Boolean)
      .join(" ");

    if (explanation) return explanation;
  }

  if (notes.length > 0) {
    const noteText = notes.map((note) => String(note).trim()).filter(Boolean).join(" ");
    if (noteText) return noteText;
  }

  if (ingredients.length > 0) {
    return `AI detected possible triggers in this dish: ${ingredients.join(", ")}.`;
  }

  return "No detailed AI explanation was returned for this dish.";
}

function buildDetectedDiseases(dish) {
  const diseaseTriggers = Array.isArray(dish?.conflicts)
    ? dish.conflicts
        .filter((conflict) => String(conflict?.type || "").toLowerCase() === "disease")
        .map((conflict) => conflict?.trigger)
    : [];

  return [...new Set(diseaseTriggers.map(formatTag).filter(Boolean))];
}

function mapUploadResponseToResults(payload) {
  const aiResult = payload?.aiResult || {};
  const apiDishesRaw = aiResult?.dishes || aiResult?.Dishes;
  const apiDishes = Array.isArray(apiDishesRaw) ? apiDishesRaw : [];
  const storedDishes = extractStoredDishes(payload);
  const storedDishIdByName = new Map(storedDishes.map((dish) => [dish.name, dish.id]));

  return apiDishes.map((dish, index) => {
    const safetyLevel = String(
      dish?.safety_level || dish?.safetyLevel || dish?.SafetyLevel || ""
    ).toLowerCase();

    const needsUserConfirmation = Boolean(
      dish?.needs_user_confirmation ?? dish?.needsUserConfirmation
    );

    const isSafe = safetyLevel === "safe";
    const isUnsafe = safetyLevel === "unsafe";
    const hasWarning = safetyLevel === "risky" || needsUserConfirmation;

    const ingredients = buildDetectedIngredients(dish);
    const rawDishName = dish?.dish_name || dish?.dishName || dish?.DishName || `Dish ${index + 1}`;
    const name = String(rawDishName).replace(/^Dish Name:\s*/i, "").trim();
    const aiNote = getDishPrimaryExplanation(dish, ingredients);

    const dishId =
      toValidDishId(dish?.dish_id ?? dish?.dishId ?? dish?.DishId) ??
      storedDishIdByName.get(cleanDishName(name)) ??
      null;

    return {
      id: dishId ?? `${payload?.menuId || "menu"}-${index}`,
      dishId,
      name,
      aiNote,
      category: safetyLevel || "unknown",
      allergens: ingredients,
      diseases: buildDetectedDiseases(dish),
      isSafe,
      isUnsafe,
      hasWarning,
      status: isSafe ? "safe" : isUnsafe ? "unsafe" : "risky",
    };
  });
}

function getAiNarrative(summaryText, safeCount, riskyCount, unsafeCount) {
  if (String(summaryText || "").trim()) {
    return String(summaryText).trim();
  }

  const total = safeCount + riskyCount + unsafeCount;

  if (!total) {
    return "No dish classification is available yet. Upload a clearer menu to review extracted items.";
  }

  if (unsafeCount > 0) {
    return `AI flagged ${unsafeCount} ${unsafeCount === 1 ? "dish" : "dishes"} as unsafe and recommends avoiding them.`;
  }

  if (riskyCount > 0) {
    return `AI marked ${riskyCount} ${riskyCount === 1 ? "dish" : "dishes"} as risky. Confirm ingredients with the restaurant before ordering.`;
  }

  return `AI reviewed ${total} ${total === 1 ? "dish" : "dishes"} and found no warning flags.`;
}

function bytesToMb(size) {
  if (!size || Number.isNaN(Number(size))) return 0;
  return Number(size) / 1024 / 1024;
}

function formatPickedFile(file, fallbackType) {
  const mimeType = file?.type || "";
  const isPdf = mimeType.includes("pdf") || String(file?.name || "").toLowerCase().endsWith(".pdf");

  return {
    name: file?.name || "selected-file",
    sizeMb: bytesToMb(file?.size),
    type: isPdf ? "PDF" : fallbackType,
    uri: file?.uri || null,
    mimeType,
  };
}

function formatImagePickerAsset(asset, fallbackType, source = "library") {
  const safeName =
    asset?.fileName ||
    (source === "camera" ? `camera-menu-${Date.now()}.jpg` : `menu-${Date.now()}.jpg`);

  const safeType =
    asset?.mimeType ||
    asset?.type ||
    (source === "camera" ? "image/jpeg" : "application/octet-stream");

  return formatPickedFile(
    {
      name: safeName,
      size: asset?.fileSize,
      type: safeType,
      uri: asset?.uri,
    },
    fallbackType
  );
}

export default function MenuUploadScreen({ navigation }) {
  const [restaurantName, setRestaurantName] = useState("");
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [viewMode, setViewMode] = useState("upload");
  const [results, setResults] = useState([]);
  const [reportDish, setReportDish] = useState(null);
  const [reportMessage, setReportMessage] = useState("");
  const [analysisSummary, setAnalysisSummary] = useState("");

  const safeDishes = results.filter((dish) => dish.isSafe);
  const warningDishes = results.filter((dish) => dish.hasWarning || dish.category === "risky");
  const unsafeDishes = results.filter((dish) => dish.isUnsafe);

  const safeCount = safeDishes.length;
  const warningCount = warningDishes.length;
  const unsafeCount = unsafeDishes.length;
  const totalItems = results.length;
  const safePercent = totalItems > 0 ? Math.round((safeCount / totalItems) * 100) : 0;
  const selectedFileTypeLabel = file?.type || "Menu";
  const overallStatus = getOverallStatus(safeCount, warningCount, unsafeCount);
  const overallMeta = getStatusMeta(overallStatus);

  async function openUploadOptions() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const selected = result.assets?.[0];
      if (!selected) return;

      setFile(
        formatPickedFile(
          {
            ...selected,
            name: selected?.name || "menu-upload.pdf",
            type: selected?.mimeType || "application/pdf",
          },
          "PDF"
        )
      );
    } catch (err) {
      Alert.alert("Upload Error", err?.message || "Could not open the PDF picker.");
    }
  }

  async function handlePhotoLibrarySelect() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Permission Required", "Photo library permission is needed to choose an image.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.82,
        allowsMultipleSelection: false,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];

      if (!asset?.uri) {
        Alert.alert("Upload Error", "No photo was selected.");
        return;
      }

      setFile(formatImagePickerAsset(asset, "Image", "library"));
    } catch {
      Alert.alert("Upload Error", "Could not open the photo library.");
    }
  }

  async function handleCameraSelect() {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Permission Required", "Camera permission is needed to take a photo.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 1,
        cameraType: ImagePicker.CameraType.back,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];

      if (!asset) {
        Alert.alert("Camera Error", "No photo was captured.");
        return;
      }

      setFile(formatImagePickerAsset(asset, "Camera Photo", "camera"));
    } catch {
      Alert.alert("Camera Error", "Could not open the camera.");
    }
  }

  async function handleAnalyze() {
    if (!restaurantName.trim()) {
      Alert.alert("Missing Restaurant", "Please enter the restaurant name.");
      return;
    }

    if (!file) {
      Alert.alert("Missing Menu", "Please upload or capture a menu first.");
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await uploadMenu({
        file,
        restaurantName: restaurantName.trim(),
      });

      const mappedResults = mapUploadResponseToResults(response);
      const aiResult = response?.aiResult || {};
      const summaryText =
        aiResult?.summary?.short_summary ||
        aiResult?.summary?.shortSummary ||
        response?.summary?.short_summary ||
        response?.summary?.shortSummary ||
        "";

      setResults(mappedResults);
      setAnalysisSummary(String(summaryText).trim());
      setIsAnalyzing(false);
      setViewMode("results");
      Alert.alert("Analysis Complete", "Your menu safety report is ready.");
    } catch (err) {
      setIsAnalyzing(false);

      const isNetworkError =
        !err?.response &&
        String(err?.message || "").toLowerCase().includes("network error");

      Alert.alert(
        "Upload Error",
        (isNetworkError
          ? "Could not analyze this file right now. Please try again, or use Choose Photo for the most reliable result."
          : null) ||
          err?.response?.data?.message ||
          err?.response?.data?.title ||
          (typeof err?.response?.data === "string" ? err.response.data : null) ||
          err?.message ||
          "Could not analyze this menu."
      );
    }
  }

  function resetToUpload() {
    setViewMode("upload");
    setFile(null);
    setResults([]);
    setRestaurantName("");
    setReportDish(null);
    setReportMessage("");
    setAnalysisSummary("");
  }

  async function submitReport() {
    if (!reportMessage.trim()) {
      Alert.alert("Missing Message", "Please type your feedback.");
      return;
    }

    if (!reportDish?.dishId) {
      Alert.alert("Missing Dish", "This dish does not have a valid dish id for reporting.");
      return;
    }

    try {
      await submitDishFeedback({
        dishID: Number(reportDish.dishId),
        message: reportMessage.trim(),
      });

      Alert.alert("Thank You", "Your report has been submitted.");
      setReportMessage("");
      setReportDish(null);
      setViewMode("results");
    } catch (err) {
      Alert.alert(
        "Report Error",
        err?.response?.data?.message ||
          err?.response?.data?.title ||
          (typeof err?.response?.data === "string" ? err.response.data : null) ||
          err?.message ||
          "Could not submit your report."
      );
    }
  }

  function renderBottomNav(active) {
    return (
      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem} onPress={() => navigation.navigate("UserDashboard")}>
          <Icon name="house" size={18} color={active === "home" ? "#20C765" : "#A3A3A3"} solid />
          <Text style={active === "home" ? styles.navLabelActive : styles.navLabel}>Home</Text>
        </Pressable>

        <Pressable style={styles.navCenterWrap} onPress={() => setViewMode("upload")}>
          <View style={styles.navCenterButton}>
            <Icon name="upload" size={20} color="#03150A" solid />
          </View>
        </Pressable>

        <Pressable style={styles.navItem} onPress={() => navigation.navigate("Profile")}>
          <Icon name="user" size={18} color={active === "profile" ? "#20C765" : "#A3A3A3"} solid />
          <Text style={active === "profile" ? styles.navLabelActive : styles.navLabel}>Profile</Text>
        </Pressable>
      </View>
    );
  }

  function renderDishCard(dish) {
    const meta = getStatusMeta(dish.status);

    return (
      <View key={dish.id} style={[styles.dishCard, meta.cardStyle]}>
        <View style={styles.dishHeaderRow}>
          <View style={getMenuIconBorderStyle(styles.dishIconBox, meta.color)}>
            <Icon name={meta.icon} size={16} color={meta.color} solid />
          </View>

          <View style={styles.dishTitleWrap}>
            <Text style={styles.dishEyebrow}>Dish result</Text>
            <Text style={styles.dishTitle}>{dish.name}</Text>
          </View>

          <View style={[styles.badge, meta.badgeStyle]}>
            <Text style={meta.badgeTextStyle}>{meta.label}</Text>
          </View>
        </View>

        <View style={styles.aiNoteBox}>
          <View style={styles.aiNoteHeader}>
            <Icon name="sparkles" size={12} color="#D4D4D4" solid />
            <Text style={styles.aiNoteLabel}>AI note</Text>
          </View>
          <Text style={styles.aiNoteText}>
            {dish.aiNote || "No detailed AI explanation was returned for this dish."}
          </Text>
        </View>

        {dish.allergens.length > 0 && (
          <View>
            <Text style={styles.blockTitle}>Detected ingredients</Text>
            <View style={styles.chipsWrap}>
              {dish.allergens.map((allergen) => (
                <View key={`${dish.id}-${allergen}`} style={styles.ingredientChip}>
                  <Text style={styles.ingredientChipText}>{allergen}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {dish.diseases.length > 0 && (
          <View>
            <Text style={styles.blockTitle}>Detected diseases</Text>
            <View style={styles.chipsWrap}>
              {dish.diseases.map((disease) => (
                <View key={`${dish.id}-${disease}`} style={styles.ingredientChip}>
                  <Text style={styles.ingredientChipText}>{disease}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.reportWrap}>
          <Pressable
            onPress={() => {
              setReportDish({
                dishId: dish.dishId,
                name: dish.name,
                status: dish.status,
              });
              setViewMode("report");
            }}
          >
            <View style={styles.reportButton}>
              <Icon name="flag" size={12} color="#E5E5E5" solid />
              <Text style={styles.reportButtonText}>Report incorrect detection</Text>
            </View>
          </Pressable>
        </View>
      </View>
    );
  }

  if (viewMode === "report" && reportDish) {
    const reportMeta = getStatusMeta(reportDish.status);

    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.container}>
          <View style={styles.header}>
            <FancyBackButton onPress={() => setViewMode("results")} label="Back" />

            <View style={styles.detailHeaderRow}>
              <View style={styles.headerTextWrap}>
                <Text style={styles.screenTitle}>Report Issue</Text>
                <Text style={styles.screenSubtitle}>
                  Tell us what is wrong with{" "}
                  <Text style={styles.highlightText}>{reportDish.name}</Text>.
                </Text>
              </View>

              <View style={[styles.headerIconBox, reportMeta.accentStyle]}>
                <Icon name="flag" size={20} color="#FFFFFF" solid />
              </View>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Your Message</Text>
              <TextInput
                value={reportMessage}
                onChangeText={setReportMessage}
                placeholder="Describe the incorrect detection, missing ingredients, or any other issue..."
                placeholderTextColor="#7D7D7D"
                multiline
                style={[styles.input, styles.textarea]}
              />
            </View>

            <Pressable style={styles.primaryButton} onPress={submitReport}>
              <Icon name="paper-plane" size={15} color="#03150A" solid />
              <Text style={styles.primaryButtonText}>Submit Report</Text>
            </Pressable>
          </ScrollView>

          {renderBottomNav("upload")}
        </View>
      </SafeAreaView>
    );
  }

  if (viewMode === "results") {
    const overallMessage = getAiNarrative(analysisSummary, safeCount, warningCount, unsafeCount);

    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.container}>
          <View style={styles.header}>
            <FancyBackButton onPress={resetToUpload} label="New Scan" />

            <View style={styles.detailHeaderRow}>
              <View style={styles.headerTextWrap}>
                <Text style={styles.screenTitle}>{restaurantName}</Text>
                <Text style={styles.screenSubtitle}>
                  Personalized menu safety report with AI-backed dish notes.
                </Text>
              </View>

              <View style={[styles.headerIconBox, overallMeta.accentStyle]}>
                <Icon name="shield-halved" size={22} color="#FFFFFF" solid />
              </View>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.heroCard}>
              <View style={styles.heroTopRow}>
                <View style={styles.heroTextWrap}>
                  <Text style={styles.heroEyebrow}>AI Summary</Text>
                  <Text style={styles.heroTitle}>Safety overview</Text>
                  <Text style={styles.heroBody}>{overallMessage}</Text>
                </View>

                <View style={styles.scoreRing}>
                  <Text style={styles.scoreValue}>{safePercent}%</Text>
                  <Text style={styles.scoreLabel}>Safe</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statValueSafe}>{safeCount}</Text>
                  <Text style={styles.statLabel}>Safe</Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={styles.statValueRisky}>{warningCount}</Text>
                  <Text style={styles.statLabel}>Risky</Text>
                </View>

                <View style={styles.statCardLast}>
                  <Text style={styles.statValueUnsafe}>{unsafeCount}</Text>
                  <Text style={styles.statLabel}>Unsafe</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaChip}>
                  <Icon name="utensils" size={12} color="#D7FBE8" solid />
                  <Text style={styles.metaChipText}>{restaurantName || "Restaurant"}</Text>
                </View>

                <View style={styles.metaChip}>
                  <Icon name="file-lines" size={12} color="#D7FBE8" solid />
                  <Text style={styles.metaChipText}>{selectedFileTypeLabel}</Text>
                </View>

                <View style={styles.metaChip}>
                  <Icon name="layer-group" size={12} color="#D7FBE8" solid />
                  <Text style={styles.metaChipText}>
                    {totalItems} {totalItems === 1 ? "dish" : "dishes"}
                  </Text>
                </View>
              </View>
            </View>

            {results.length > 0 && (
              <View style={styles.sectionGroup}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Dish breakdown</Text>
                  <Text style={styles.sectionCount}>{results.length} items</Text>
                </View>

                {results.map(renderDishCard)}
              </View>
            )}

            {results.length === 0 && (
              <View style={styles.emptyStateCard}>
                <View style={styles.emptyIconWrap}>
                  <Icon name="clipboard-list" size={24} color="#A3A3A3" solid />
                </View>
                <Text style={styles.emptyTitle}>No menu items detected</Text>
                <Text style={styles.emptyStateText}>
                  Try uploading a clearer image or a higher-quality PDF.
                </Text>
              </View>
            )}
          </ScrollView>

          {renderBottomNav("upload")}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <FancyBackButton onPress={() => navigation.navigate("UserDashboard")} label="Back" />

          <View style={styles.detailHeaderRow}>
            <View style={styles.headerTextWrap}>
              <Text style={styles.screenTitle}>Upload Menu</Text>
              <Text style={styles.screenSubtitle}>Take a photo or upload a PDF to analyze.</Text>
            </View>

            <View style={styles.headerIconBox}>
              <Icon name="upload" size={20} color="#FFFFFF" solid />
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.uploadHeroCard}>
            <View style={styles.heroBadgeRow}>
              <View style={styles.heroBadge}>
                <Icon name="wand-magic-sparkles" size={11} color="#D7FBE8" solid />
                <Text style={styles.heroBadgeText}>AI MENU CHECK</Text>
              </View>

              <View style={styles.heroMiniIcon}>
                <Icon name="shield-halved" size={14} color="#D7FBE8" solid />
              </View>
            </View>

            <Text style={styles.uploadHeroTitle}>Upload once, get a polished safety report</Text>
            <Text style={styles.uploadHeroBody}>
              Scan menus using PDFs, gallery images, or live camera capture.
            </Text>

            <View style={styles.uploadHeroStats}>
              <View style={styles.uploadHeroStatCard}>
                <Text style={styles.uploadHeroStatValue}>3</Text>
                <Text style={styles.uploadHeroStatLabel}>Input modes</Text>
              </View>

              <View style={styles.uploadHeroStatCard}>
                <Text style={styles.uploadHeroStatValue}>AI</Text>
                <Text style={styles.uploadHeroStatLabel}>Dish checks</Text>
              </View>

              <View style={styles.uploadHeroStatCardLast}>
                <Text style={styles.uploadHeroStatValue}>Fast</Text>
                <Text style={styles.uploadHeroStatLabel}>Results</Text>
              </View>
            </View>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>Restaurant Name</Text>
            <TextInput
              value={restaurantName}
              onChangeText={setRestaurantName}
              style={styles.input}
              placeholder="Enter restaurant name"
              placeholderTextColor="#7D7D7D"
            />
          </View>

          {!file ? (
            <View>
              <Pressable style={[styles.uploadCard, styles.uploadCardDashed]} onPress={openUploadOptions}>
                <View style={styles.uploadCardGlow} />

                <View style={styles.uploadCenter}>
                  <View style={styles.uploadIconCircle}>
                    <Icon name="file-pdf" size={28} color="#20C765" solid />
                  </View>

                  <View style={styles.uploadPill}>
                    <Text style={styles.uploadPillText}>Preferred for multi-page menus</Text>
                  </View>

                  <Text style={styles.uploadTitle}>Upload Menu PDF</Text>
                  <Text style={styles.uploadSub}>Tap to choose a PDF file</Text>
                  <Text style={styles.uploadTiny}>Use the photo buttons below for images.</Text>
                </View>
              </Pressable>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <Pressable style={styles.actionRowCard} onPress={handlePhotoLibrarySelect}>
                <View style={styles.actionIconBox}>
                  <Icon name="image" size={20} color="#20C765" solid />
                </View>

                <View style={styles.actionBody}>
                  <Text style={styles.actionTitle}>Choose Photo</Text>
                  <Text style={styles.actionSub}>Analyze a gallery image</Text>
                </View>

                <View style={styles.actionArrowWrap}>
                  <Icon name="arrow-right" size={14} color="#A7F3D0" solid />
                </View>
              </Pressable>

              <Pressable style={styles.actionRowCard} onPress={handleCameraSelect}>
                <View style={styles.actionIconBox}>
                  <Icon name="camera" size={20} color="#20C765" solid />
                </View>

                <View style={styles.actionBody}>
                  <Text style={styles.actionTitle}>Take Photo</Text>
                  <Text style={styles.actionSub}>Use your camera</Text>
                </View>

                <View style={styles.actionArrowWrap}>
                  <Icon name="arrow-right" size={14} color="#A7F3D0" solid />
                </View>
              </Pressable>
            </View>
          ) : (
            <View style={styles.selectedFileCard}>
              <View style={styles.actionIconBox}>
                <Icon name="file-lines" size={20} color="#20C765" solid />
              </View>

              <View style={styles.selectedFileBody}>
                <Text style={styles.selectedFileName}>{file.name}</Text>
                <Text style={styles.selectedFileMeta}>
                  {`${file.type} â€¢ ${file.sizeMb.toFixed(2)} MB`}
                </Text>

                <View style={styles.selectedFilePill}>
                  <Text style={styles.selectedFilePillText}>Ready for analysis</Text>
                </View>
              </View>

              <Pressable style={styles.removeFileButton} onPress={() => setFile(null)}>
                <Icon name="circle-xmark" size={22} color="#FF4D4D" solid />
              </Pressable>
            </View>
          )}

          <Pressable
            onPress={handleAnalyze}
            disabled={!file || !restaurantName.trim() || isAnalyzing}
            style={[
              styles.primaryButton,
              (!file || !restaurantName.trim() || isAnalyzing) && styles.primaryButtonDisabled,
            ]}
          >
            {isAnalyzing ? (
              <ActivityIndicator color="#03150A" />
            ) : (
              <>
                <Icon name="wand-magic-sparkles" size={15} color="#03150A" solid />
                <Text style={styles.primaryButtonText}>Analyze Menu</Text>
              </>
            )}
          </Pressable>

          <View style={styles.infoCard}>
            <View style={styles.infoTitleRow}>
              <Icon name="circle-exclamation" size={16} color="#20C765" solid />
              <Text style={styles.infoTitle}>How it works</Text>
            </View>

            <Text style={styles.infoBody}>
              We scan the menu and identify dishes that are safer based on your allergy and health
              profile. You will see clear recommendations, warnings, and flagged items.
            </Text>

            <View style={styles.infoFeatureRow}>
              <View style={styles.infoFeaturePill}>
                <Icon name="shield-halved" size={12} color="#8EF0BA" solid />
                <Text style={styles.infoFeatureText}>Personalized</Text>
              </View>

              <View style={styles.infoFeaturePill}>
                <Icon name="bolt" size={12} color="#8EF0BA" solid />
                <Text style={styles.infoFeatureText}>Fast review</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {renderBottomNav("upload")}
      </View>
    </SafeAreaView>
  );
}


