import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  errorCodes as documentErrorCodes,
  isErrorWithCode as isDocumentErrorWithCode,
  keepLocalCopy,
  pick,
  types as documentTypes,
} from "@react-native-documents/picker";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import Icon from "react-native-vector-icons/FontAwesome6";
import FancyBackButton from "../components/common/FancyBackButton";
import { submitDishFeedback } from "../api/feedback";
import { uploadMenu } from "../api/menu";
import styles from "./MenuUploadScreen.styles";

function getStatusIcon(status) {
  if (status === "safe") {
    return { name: "shield-halved", color: "#22C55E" };
  }
  if (status === "warning") {
    return { name: "triangle-exclamation", color: "#EAB308" };
  }
  return { name: "circle-xmark", color: "#EF4444" };
}

function getStatusLabel(status) {
  if (status === "safe") return "Safe";
  if (status === "warning") return "Risky";
  return "Unsafe";
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

function buildDishWarnings(dish) {
  const warnings = [];

  if (dish?.needs_user_confirmation) {
    warnings.push("Needs confirmation with the restaurant before ordering.");
  }

  (dish?.notes || []).forEach((note) => {
    if (note) warnings.push(note);
  });

  (dish?.conflicts || []).forEach((conflict) => {
    if (conflict?.explanation) warnings.push(conflict.explanation);
  });

  return [...new Set(warnings)];
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
    ).toUpperCase();
    const needsUserConfirmation = Boolean(
      dish?.needs_user_confirmation ?? dish?.needsUserConfirmation
    );
    const isSafe = safetyLevel === "SAFE";
    const isUnsafe = safetyLevel === "RISKY" || safetyLevel === "UNSAFE";
    const hasWarning = safetyLevel === "CAUTION" || needsUserConfirmation;
    const displayLevel =
      safetyLevel === "CAUTION"
        ? "RISKY"
        : isUnsafe
        ? "UNSAFE"
        : safetyLevel || "UNKNOWN";

    const ingredients = buildDetectedIngredients(dish);
    const conflicts = Array.isArray(dish?.conflicts) ? dish.conflicts : [];
    const notes = Array.isArray(dish?.notes) ? dish.notes : [];
    const firstConflict = conflicts[0]?.explanation;
    const firstNote = notes[0];
    const rawDishName =
      dish?.dish_name || dish?.dishName || dish?.DishName || `Dish ${index + 1}`;
    const name = String(rawDishName).replace(/^Dish Name:\s*/i, "").trim();
    const description = isSafe
      ? ingredients.length
        ? `Detected ingredients: ${ingredients.join(", ")}`
        : "No ingredients detected"
      : firstConflict ||
        firstNote ||
        (ingredients.length
          ? `Detected ingredients: ${ingredients.join(", ")}`
          : "No ingredients detected");

    const dishId =
      toValidDishId(dish?.dish_id ?? dish?.dishId ?? dish?.DishId) ??
      storedDishIdByName.get(cleanDishName(name)) ??
      null;

    return {
      id: dishId ?? `${payload?.menuId || "menu"}-${index}`,
      dishId,
      name,
      description,
      category: safetyLevel || "UNKNOWN",
      displayLevel,
      allergens: ingredients,
      diseases: buildDetectedDiseases(dish),
      warnings: buildDishWarnings(dish),
      isSafe,
      isUnsafe,
      hasWarning,
      status: isSafe ? "safe" : isUnsafe ? "unsafe" : "warning",
    };
  });
}

function getRecommendation(status) {
  if (status === "safe") {
    return "This item appears compatible with your profile based on the detected ingredients and allergen signals.";
  }

  if (status === "warning") {
    return "This item needs extra attention, so confirm ingredients or preparation details with the restaurant before ordering.";
  }

  return "This item is not recommended for your profile due to strong allergen or dietary risk indicators.";
}

function getOverallMessage(safePercent, warningCount, unsafeCount) {
  if (safePercent >= 70 && unsafeCount === 0) {
    return "This menu looks generally friendly for your dietary profile, with several strong options you can prioritize.";
  }

  if (unsafeCount > 0) {
    return "This menu includes some dishes that may not be suitable for you, so review flagged items carefully before ordering.";
  }

  if (warningCount > 0) {
    return "There are good options here, but a few dishes need extra attention before you make a final choice.";
  }

  return "Your analysis is ready. Review the dish-by-dish assessment below.";
}

function bytesToMb(size) {
  if (!size || Number.isNaN(Number(size))) return 0;
  return Number(size) / 1024 / 1024;
}

function formatPickedFile(file, fallbackType) {
  const mimeType = file?.type || "";
  const isPdf =
    mimeType.includes("pdf") ||
    String(file?.name || "").toLowerCase().endsWith(".pdf");

  return {
    name: file?.name || "selected-file",
    sizeMb: bytesToMb(file?.size),
    type: isPdf ? "PDF" : fallbackType,
    uri: file?.uri || null,
    mimeType,
  };
}

async function normalizePickedPdf(file) {
  if (!file?.uri) return file;
  if (Platform.OS !== "android") return file;

  try {
    const copied = await keepLocalCopy({
      destination: "cachesDirectory",
      files: [
        {
          uri: file.uri,
          fileName: file.name || "menu-upload.pdf",
        },
      ],
    });

    const localCopy = copied?.[0];

    if (localCopy?.status === "success" && localCopy.localUri) {
      return {
        ...file,
        uri: localCopy.localUri,
      };
    }
  } catch {
    return file;
  }

  return file;
}

function formatImagePickerAsset(asset, fallbackType, source = "library") {
  const preferredUri = asset?.uri;
  const safeName =
    asset?.fileName ||
    (source === "camera" ? `camera-menu-${Date.now()}.jpg` : `menu-${Date.now()}.jpg`);
  const safeType =
    asset?.type ||
    (source === "camera" ? "image/jpeg" : "application/octet-stream");

  return formatPickedFile(
    {
      name: safeName,
      size: asset?.fileSize,
      type: safeType,
      uri: preferredUri,
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
  const warningDishes = results.filter(
    (dish) => dish.hasWarning || dish.category === "CAUTION"
  );
  const unsafeDishes = results.filter((dish) => dish.isUnsafe);

  const safeCount = safeDishes.length;
  const warningCount = warningDishes.length;
  const unsafeCount = unsafeDishes.length;

  const totalItems = results.length;
  const safePercent =
    totalItems > 0 ? Math.round((safeCount / totalItems) * 100) : 0;

  async function openUploadOptions() {
    try {
      const result = await pick({
        type: [documentTypes.pdf],
        presentationStyle: "fullScreen",
      });

      const selected = result?.[0];

      if (!selected) {
        return;
      }

      const normalizedPdf = await normalizePickedPdf(selected);
      setFile(
        formatPickedFile(
          {
            ...normalizedPdf,
            name: normalizedPdf?.name || selected?.name || "menu-upload.pdf",
            type:
              normalizedPdf?.type ||
              selected?.type ||
              "application/pdf",
          },
          "PDF"
        )
      );
    } catch (err) {
      if (
        isDocumentErrorWithCode(err) &&
        err.code === documentErrorCodes.OPERATION_CANCELED
      ) {
        return;
      }

      Alert.alert(
        "Upload Error",
        err?.message || "Could not open the PDF picker."
      );
    }
  }

  async function handlePhotoLibrarySelect() {
    try {
      const result = await launchImageLibrary({
        mediaType: "photo",
        selectionLimit: 1,
        quality: 0.82,
        maxWidth: 1600,
        maxHeight: 1600,
        includeBase64: false,
        assetRepresentationMode: "current",
      });

      if (result.didCancel) return;

      if (result.errorCode) {
        Alert.alert(
          "Upload Error",
          result.errorMessage || "Could not open the photo library."
        );
        return;
      }

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
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "SafeBite needs access to your camera to take a menu photo.",
            buttonPositive: "Allow",
            buttonNegative: "Cancel",
          }
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            "Permission Required",
            "Camera permission is needed to take a photo."
          );
          return;
        }
      }

      const result = await launchCamera({
        mediaType: "photo",
        cameraType: "back",
        saveToPhotos: false,
        quality: 1,
        maxWidth: 2400,
        maxHeight: 2400,
        includeBase64: false,
        assetRepresentationMode: "current",
        conversionQuality: 1,
      });

      if (result.didCancel) return;

      if (result.errorCode) {
        Alert.alert(
          "Camera Error",
          result.errorMessage || "Could not open the camera."
        );
        return;
      }

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
        String(err?.message || "")
          .toLowerCase()
          .includes("network error");

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
        <Pressable
          style={styles.navItem}
          onPress={() => navigation.navigate("UserDashboard")}
        >
          <Icon
            name="house"
            size={18}
            color={active === "home" ? "#1DB954" : "#9CA3AF"}
            solid
          />
          <Text style={active === "home" ? styles.navLabelActive : styles.navLabel}>
            Home
          </Text>
        </Pressable>

        <Pressable
          style={styles.navCenterWrap}
          onPress={() => setViewMode("upload")}
        >
          <View style={styles.navCenterBtn}>
            <Icon name="upload" size={20} color="#03150A" solid />
          </View>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() => navigation.navigate("Profile")}
        >
          <Icon
            name="user"
            size={18}
            color={active === "profile" ? "#1DB954" : "#9CA3AF"}
            solid
          />
          <Text style={active === "profile" ? styles.navLabelActive : styles.navLabel}>
            Profile
          </Text>
        </Pressable>
      </View>
    );
  }

  function renderDishCard(dish) {
    const icon = getStatusIcon(dish.status);
    const badgeLabel = getStatusLabel(dish.status);

    const badgeStyle =
      dish.status === "safe"
        ? styles.dishStatusBadgeSafe
        : dish.status === "warning"
        ? styles.dishStatusBadgeWarning
        : styles.dishStatusBadgeUnsafe;

    const badgeTextStyle =
      dish.status === "safe"
        ? styles.dishStatusBadgeTextSafe
        : dish.status === "warning"
        ? styles.dishStatusBadgeTextWarning
        : styles.dishStatusBadgeTextUnsafe;

    const reportLinkStyle =
      dish.status === "safe"
        ? styles.reportLinkSafe
        : dish.status === "warning"
        ? styles.reportLinkRisky
        : styles.reportLinkUnsafe;

    const recommendationBoxStyle =
      dish.status === "safe"
        ? styles.recommendationBoxSafe
        : dish.status === "warning"
        ? styles.recommendationBoxRisky
        : styles.recommendationBoxUnsafe;

    const recommendationTextStyle =
      dish.status === "safe"
        ? styles.recommendationTextSafe
        : dish.status === "warning"
        ? styles.recommendationTextRisky
        : styles.recommendationTextUnsafe;

    const warningChipStyle =
      dish.status === "safe"
        ? styles.warningChipSafe
        : dish.status === "warning"
        ? styles.warningChipRisky
        : styles.warningChipUnsafe;

    const warningChipTextStyle =
      dish.status === "safe"
        ? styles.warningChipTextSafe
        : dish.status === "warning"
        ? styles.warningChipTextRisky
        : styles.warningChipTextUnsafe;

    const ingredientChipStyle =
      dish.status === "safe"
        ? styles.allergenChipSafe
        : dish.status === "warning"
        ? styles.allergenChipRisky
        : styles.allergenChipUnsafe;

    const ingredientChipTextStyle =
      dish.status === "safe"
        ? styles.allergenChipTextSafe
        : dish.status === "warning"
        ? styles.allergenChipTextRisky
        : styles.allergenChipTextUnsafe;

    const diseaseChipStyle =
      dish.status === "safe"
        ? styles.diseaseChipSafe
        : dish.status === "warning"
        ? styles.diseaseChipRisky
        : styles.diseaseChipUnsafe;

    const diseaseChipTextStyle =
      dish.status === "safe"
        ? styles.diseaseChipTextSafe
        : dish.status === "warning"
        ? styles.diseaseChipTextRisky
        : styles.diseaseChipTextUnsafe;

    return (
      <View
        key={dish.id}
        style={[
          styles.dishCard,
          dish.status === "safe" && styles.dishCardSafe,
          dish.status === "warning" && styles.dishCardWarning,
          dish.status === "unsafe" && styles.dishCardUnsafe,
        ]}
      >
        <View style={styles.dishTitleRow}>
          <Icon name={icon.name} size={16} color={icon.color} solid />
          <Text style={styles.dishTitle}>{dish.name}</Text>
        </View>

        <View style={[styles.dishStatusBadge, badgeStyle]}>
          <Text style={badgeTextStyle}>{badgeLabel}</Text>
        </View>

        <View style={[styles.recommendationBox, recommendationBoxStyle]}>
          <Text style={[styles.recommendationText, recommendationTextStyle]}>
            {getRecommendation(dish.status)}
          </Text>
        </View>

        {dish.allergens.length > 0 && (
          <View>
            <Text style={styles.blockTitle}>Detected ingredients</Text>
            <View style={styles.chipsWrap}>
              {dish.allergens.map((allergen) => (
                <View
                  key={`${dish.id}-${allergen}`}
                  style={[styles.allergenChip, ingredientChipStyle]}
                >
                  <Text style={[styles.allergenChipText, ingredientChipTextStyle]}>
                    {allergen}
                  </Text>
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
                <View
                  key={`${dish.id}-${disease}`}
                  style={[styles.diseaseChip, diseaseChipStyle]}
                >
                  <Text style={[styles.diseaseChipText, diseaseChipTextStyle]}>
                    {disease}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {dish.warnings.length > 0 && (
          <View>
            <Text style={[styles.blockTitle, styles.warningTitle]}>Warnings</Text>
            <View style={styles.chipsWrap}>
              {dish.warnings.map((warning) => (
                <View key={`${dish.id}-${warning}`} style={[styles.warningChip, warningChipStyle]}>
                  <Text style={[styles.warningChipText, warningChipTextStyle]}>
                    {warning}
                  </Text>
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
            <Text style={[styles.reportLink, reportLinkStyle]}>
              Report incorrect detection
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (viewMode === "report" && reportDish) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.container}>
          <View style={styles.header}>
            <FancyBackButton onPress={() => setViewMode("results")} label="Back" />
            <Text style={styles.headerTitle}>Report Issue</Text>
            <Text style={styles.headerSubtitle}>
              Tell us what is wrong with{" "}
              <Text style={styles.highlightText}>{reportDish.name}</Text>.
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Your Message</Text>
              <TextInput
                value={reportMessage}
                onChangeText={setReportMessage}
                placeholder="Describe the incorrect detection, missing ingredients, or any other issue..."
                placeholderTextColor="#6B7280"
                multiline
                style={[styles.input, styles.textarea]}
              />
            </View>

            <Pressable style={styles.primaryBtn} onPress={submitReport}>
              <Text style={styles.primaryBtnText}>Submit Report</Text>
            </Pressable>
          </ScrollView>

          {renderBottomNav("upload")}
        </View>
      </SafeAreaView>
    );
  }

  if (viewMode === "results") {
    const overallMessage = getOverallMessage(
      safePercent,
      warningCount,
      unsafeCount
    );

    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.container}>
          <View style={styles.header}>
            <FancyBackButton onPress={resetToUpload} label="New Scan" />

            <View style={styles.resultsHeaderRow}>
              <View style={styles.resultsHeaderBody}>
                <Text style={styles.resultsTitle}>{restaurantName}</Text>
                <Text style={styles.resultsSubtitle}>
                  Personalized Menu Safety Report
                </Text>
              </View>

              <View style={styles.shieldBox}>
                <Icon name="shield-halved" size={28} color="#FFFFFF" solid />
              </View>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.heroCard}>
              <View style={styles.heroTopRow}>
                <View style={styles.heroContent}>
                  <Text style={styles.heroEyebrow}>Analysis Complete</Text>
                  <Text style={styles.heroHeadline}>Your safety overview</Text>
                  <Text style={styles.heroSubtext}>{overallMessage}</Text>
                </View>

                <View style={styles.scoreRing}>
                  <Text style={styles.scoreValue}>{safePercent}%</Text>
                  <Text style={styles.scoreLabel}>Safe</Text>
                </View>
              </View>

              <View style={styles.insightRow}>
                <View style={styles.insightPill}>
                  <Text style={styles.insightValueSafe}>{safeCount}</Text>
                  <Text style={styles.insightText}>Safe</Text>
                </View>

                <View style={styles.insightPill}>
                  <Text style={styles.insightValueWarning}>{warningCount}</Text>
                  <Text style={styles.insightText}>Risky</Text>
                </View>

                <View style={[styles.insightPill, styles.insightPillLast]}>
                  <Text style={styles.insightValueUnsafe}>{unsafeCount}</Text>
                  <Text style={styles.insightText}>Unsafe</Text>
                </View>
              </View>
            </View>

            <View style={styles.safetyCard}>
              <View style={styles.safetyIconCircle}>
                <Icon name="shield-halved" size={15} color="#FFFFFF" solid />
              </View>
              <View style={styles.safetyTextWrap}>
                <Text style={styles.safetyTitle}>Safety Summary</Text>
                <Text style={styles.safetyDescription}>
                  {analysisSummary ||
                    `${safePercent}% of detected menu items are considered safer for your profile based on the current analysis.`}
                </Text>
              </View>
            </View>

            {safeDishes.length > 0 && (
              <View style={styles.sectionGroup}>
                <View style={styles.sectionGroupHeader}>
                  <Text style={styles.sectionGroupTitle}>Safe</Text>
                  <Text style={styles.sectionGroupCount}>
                    {safeDishes.length} items
                  </Text>
                </View>
                {safeDishes.map(renderDishCard)}
              </View>
            )}

            {warningDishes.length > 0 && (
              <View style={styles.sectionGroup}>
                <View style={styles.sectionGroupHeader}>
                  <Text style={styles.sectionGroupTitle}>Risky</Text>
                  <Text style={styles.sectionGroupCount}>
                    {warningDishes.length} items
                  </Text>
                </View>
                {warningDishes.map(renderDishCard)}
              </View>
            )}

            {unsafeDishes.length > 0 && (
              <View style={styles.sectionGroup}>
                <View style={styles.sectionGroupHeader}>
                  <Text style={styles.sectionGroupTitle}>Unsafe</Text>
                  <Text style={styles.sectionGroupCount}>
                    {unsafeDishes.length} items
                  </Text>
                </View>
                {unsafeDishes.map(renderDishCard)}
              </View>
            )}

            {results.length === 0 && (
              <View style={styles.emptyStateCard}>
                <Text style={styles.emptyStateText}>
                  No menu items were detected from this file. Try uploading a clearer
                  image or a higher-quality PDF.
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
          <FancyBackButton
            onPress={() => navigation.navigate("UserDashboard")}
            label="Back"
          />
          <Text style={styles.headerTitle}>Upload Menu</Text>
          <Text style={styles.headerSubtitle}>
            Take a photo or upload a PDF to analyze
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>Restaurant Name</Text>
            <TextInput
              value={restaurantName}
              onChangeText={setRestaurantName}
              style={styles.input}
              placeholder="Enter restaurant name"
              placeholderTextColor="#6B7280"
            />
          </View>

          {!file ? (
            <View>
              <Pressable
                style={[styles.uploadCard, styles.uploadCardDashed]}
                onPress={openUploadOptions}
              >
                <View style={styles.uploadCenter}>
                  <View style={styles.uploadIconCircle}>
                    <Icon name="upload" size={28} color="#1DB954" solid />
                  </View>
                  <Text style={styles.uploadTitle}>Upload Menu</Text>
                  <Text style={styles.uploadSub}>Tap to choose a PDF</Text>
                  <Text style={styles.uploadTiny}>PDF only here. Use photo buttons below for images.</Text>
                </View>
              </Pressable>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <Pressable style={styles.actionRowCard} onPress={handlePhotoLibrarySelect}>
                <View style={styles.actionIconBox}>
                  <Icon name="image" size={20} color="#1DB954" solid />
                </View>
                <View style={styles.actionBody}>
                  <Text style={styles.actionTitle}>Choose Photo</Text>
                  <Text style={styles.actionSub}>Gallery image analysis</Text>
                </View>
              </Pressable>

              <Pressable style={styles.actionRowCard} onPress={handleCameraSelect}>
                <View style={styles.actionIconBox}>
                  <Icon name="camera" size={20} color="#1DB954" solid />
                </View>
                <View style={styles.actionBody}>
                  <Text style={styles.actionTitle}>Take Photo</Text>
                  <Text style={styles.actionSub}>Use your camera</Text>
                </View>
              </Pressable>
            </View>
          ) : (
            <View style={styles.selectedFileCard}>
              <View style={styles.actionIconBox}>
                <Icon name="file-lines" size={20} color="#1DB954" solid />
              </View>

              <View style={styles.selectedFileBody}>
                <Text style={styles.selectedFileName}>{file.name}</Text>
                <Text style={styles.selectedFileMeta}>
                  {`${file.type} - ${file.sizeMb.toFixed(2)} MB`}
                </Text>
              </View>

              <Pressable style={styles.removeFileBtn} onPress={() => setFile(null)}>
                <Icon name="circle-xmark" size={22} color="#EF4444" solid />
              </Pressable>
            </View>
          )}

          <Pressable
            onPress={handleAnalyze}
            disabled={!file || !restaurantName.trim() || isAnalyzing}
            style={[
              styles.primaryBtn,
              (!file || !restaurantName.trim() || isAnalyzing) &&
                styles.primaryBtnDisabled,
            ]}
          >
            {isAnalyzing ? (
              <ActivityIndicator color="#03150A" />
            ) : (
              <Text style={styles.primaryBtnText}>Analyze Menu</Text>
            )}
          </Pressable>

          <View style={styles.infoCard}>
            <View style={styles.infoTitleRow}>
              <Icon name="circle-exclamation" size={16} color="#1DB954" solid />
              <Text style={styles.infoTitle}>How it works</Text>
            </View>
            <Text style={styles.infoBody}>
              We scan the menu and identify dishes that are safer based on your
              allergy and health profile. You will see clear recommendations,
              warnings, and flagged items to help you order with more confidence.
            </Text>
          </View>
        </ScrollView>

        {renderBottomNav("upload")}
      </View>
    </SafeAreaView>
  );
}
