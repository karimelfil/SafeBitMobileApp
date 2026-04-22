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
import FancyBackButton from "../components/common/FancyBackButton";
import { submitDishFeedback } from "../api/feedback";
import { uploadMenu } from "../api/menu";
import styles from "./MenuUploadScreen.styles";

function getStatusIcon(status) {
  if (status === "safe") {
    return { name: "shield-halved", color: "#22C55E" };
  }
  if (status === "risky") {
    return { name: "triangle-exclamation", color: "#EAB308" };
  }
  return { name: "circle-xmark", color: "#EF4444" };
}

function getStatusLabel(status) {
  if (status === "safe") return "Safe";
  if (status === "risky") return "Risky";
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

function getDishPrimaryExplanation(dish, ingredients) {
  const shortSummary =
    dish?.short_summary || dish?.shortSummary || dish?.ShortSummary || "";
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
    const displayLevel =
      safetyLevel === "safe"
        ? "SAFE"
        : safetyLevel === "risky"
        ? "RISKY"
        : safetyLevel === "unsafe"
        ? "UNSAFE"
        : "UNKNOWN";

    const ingredients = buildDetectedIngredients(dish);
    const rawDishName =
      dish?.dish_name || dish?.dishName || dish?.DishName || `Dish ${index + 1}`;
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
      displayLevel,
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
    return "No dish classification is available yet. Open the scan to review the extracted menu items.";
  }

  if (unsafeCount > 0) {
    return `AI flagged ${unsafeCount} ${unsafeCount === 1 ? "dish as unsafe" : "dishes as unsafe"} and recommends avoiding them before ordering.`;
  }

  if (riskyCount > 0) {
    return `AI marked ${riskyCount} ${riskyCount === 1 ? "dish as risky" : "dishes as risky"} and suggests confirming ingredients with the restaurant.`;
  }

  return `AI reviewed ${total} ${total === 1 ? "dish" : "dishes"} and found a clean result with no warning flags.`;
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

function formatImagePickerAsset(asset, fallbackType, source = "library") {
  const preferredUri = asset?.uri;
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
    (dish) => dish.hasWarning || dish.category === "risky"
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
      Alert.alert(
        "Upload Error",
        err?.message || "Could not open the PDF picker."
      );
    }
  }

  async function handlePhotoLibrarySelect() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Photo library permission is needed to choose an image."
        );
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
        Alert.alert(
          "Permission Required",
          "Camera permission is needed to take a photo."
        );
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
        : dish.status === "risky"
        ? styles.dishStatusBadgeWarning
        : styles.dishStatusBadgeUnsafe;

    const badgeTextStyle =
      dish.status === "safe"
        ? styles.dishStatusBadgeTextSafe
        : dish.status === "risky"
        ? styles.dishStatusBadgeTextWarning
        : styles.dishStatusBadgeTextUnsafe;

    const reportLinkStyle =
      dish.status === "safe"
        ? styles.reportLinkSafe
        : dish.status === "risky"
        ? styles.reportLinkRisky
        : styles.reportLinkUnsafe;

    const recommendationBoxStyle =
      dish.status === "safe"
        ? styles.recommendationBoxSafe
        : dish.status === "risky"
        ? styles.recommendationBoxRisky
        : styles.recommendationBoxUnsafe;

    const recommendationTextStyle =
      dish.status === "safe"
        ? styles.recommendationTextSafe
        : dish.status === "risky"
        ? styles.recommendationTextRisky
        : styles.recommendationTextUnsafe;

    const ingredientChipStyle =
      dish.status === "safe"
        ? styles.allergenChipSafe
        : dish.status === "risky"
        ? styles.allergenChipRisky
        : styles.allergenChipUnsafe;

    const ingredientChipTextStyle =
      dish.status === "safe"
        ? styles.allergenChipTextSafe
        : dish.status === "risky"
        ? styles.allergenChipTextRisky
        : styles.allergenChipTextUnsafe;

    const diseaseChipStyle =
      dish.status === "safe"
        ? styles.diseaseChipSafe
        : dish.status === "risky"
        ? styles.diseaseChipRisky
        : styles.diseaseChipUnsafe;

    const diseaseChipTextStyle =
      dish.status === "safe"
        ? styles.diseaseChipTextSafe
        : dish.status === "risky"
        ? styles.diseaseChipTextRisky
        : styles.diseaseChipTextUnsafe;

    return (
      <View
        key={dish.id}
        style={[
          styles.dishCard,
          dish.status === "safe" && styles.dishCardSafe,
          dish.status === "risky" && styles.dishCardWarning,
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
          <Text style={styles.detailNarrativeLabel}>AI note</Text>
          <Text style={[styles.recommendationText, recommendationTextStyle]}>
            {dish.aiNote || "No detailed AI explanation was returned for this dish."}
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
    const overallMessage = getAiNarrative(
      analysisSummary,
      safeCount,
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
                  <Text style={styles.heroEyebrow}>AI Summary</Text>
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
