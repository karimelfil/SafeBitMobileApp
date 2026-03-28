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
  pick,
  types as documentTypes,
} from "@react-native-documents/picker";
import { launchCamera } from "react-native-image-picker";
import Icon from "react-native-vector-icons/FontAwesome6";
import FancyBackButton from "../components/common/FancyBackButton";
import styles from "./MenuUploadScreen.styles";

const mockResults = [
  {
    id: "1",
    name: "Grilled Salmon",
    category: "Main Course",
    status: "safe",
    description: "Fresh Atlantic salmon with herbs and lemon.",
    allergens: ["Fish"],
    warnings: [],
  },
  {
    id: "2",
    name: "Caesar Salad",
    category: "Appetizer",
    status: "warning",
    description: "Romaine lettuce with Caesar dressing, parmesan, and croutons.",
    allergens: ["Dairy", "Wheat", "Fish"],
    warnings: ["Contains anchovies in dressing"],
  },
  {
    id: "3",
    name: "Peanut Butter Cookies",
    category: "Dessert",
    status: "unsafe",
    description: "Classic peanut butter cookies with a dense nut base.",
    allergens: ["Peanuts", "Wheat", "Eggs"],
    warnings: ["High peanut content"],
  },
  {
    id: "4",
    name: "Margherita Pizza",
    category: "Main Course",
    status: "warning",
    description: "Traditional pizza with tomato sauce, basil, and mozzarella.",
    allergens: ["Dairy", "Wheat"],
    warnings: ["Contains gluten and dairy"],
  },
  {
    id: "5",
    name: "Grilled Chicken Breast",
    category: "Main Course",
    status: "safe",
    description: "Lean grilled chicken breast served with herbs.",
    allergens: [],
    warnings: [],
  },
  {
    id: "6",
    name: "Beef Tacos",
    category: "Main Course",
    status: "safe",
    description: "Seasoned beef in corn tortillas with fresh toppings.",
    allergens: [],
    warnings: [],
  },
];

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
  if (status === "safe") return "Best Pick";
  if (status === "warning") return "Use Caution";
  return "Avoid";
}

function getRecommendation(status) {
  if (status === "safe") {
    return "This item appears compatible with your profile based on the detected ingredients and allergen signals.";
  }
  if (status === "warning") {
    return "This item may still be suitable, but you should confirm ingredients or preparation details with the restaurant before ordering.";
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

export default function MenuUploadScreen({ navigation }) {
  const [restaurantName, setRestaurantName] = useState("");
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [viewMode, setViewMode] = useState("upload");
  const [results, setResults] = useState([]);
  const [reportDish, setReportDish] = useState(null);
  const [reportMessage, setReportMessage] = useState("");

  const safeDishes = results.filter((dish) => dish.status === "safe");
  const warningDishes = results.filter((dish) => dish.status === "warning");
  const unsafeDishes = results.filter((dish) => dish.status === "unsafe");

  const safeCount = safeDishes.length;
  const warningCount = warningDishes.length;
  const unsafeCount = unsafeDishes.length;

  const totalItems = results.length;
  const safePercent = totalItems > 0 ? Math.round((safeCount / totalItems) * 100) : 0;

  async function openUploadOptions() {
    try {
      const result = await pick({
        type: [documentTypes.images, documentTypes.pdf],
        presentationStyle: "fullScreen",
      });

      const selected = result?.[0];

      if (!selected) {
        return;
      }

      setFile(formatPickedFile(selected, "Image"));
    } catch (err) {
      if (
        isDocumentErrorWithCode(err) &&
        err.code === documentErrorCodes.OPERATION_CANCELED
      ) {
        return;
      }

      Alert.alert("Upload Error", "Could not open the file picker.");
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
        quality: 0.8,
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

      setFile(
        formatPickedFile(
          {
            name: asset.fileName,
            size: asset.fileSize,
            type: asset.type,
            uri: asset.uri,
          },
          "Camera Photo"
        )
      );
    } catch {
      Alert.alert("Camera Error", "Could not open the camera.");
    }
  }

  function handleAnalyze() {
    if (!restaurantName.trim()) {
      Alert.alert("Missing Restaurant", "Please enter the restaurant name.");
      return;
    }

    if (!file) {
      Alert.alert("Missing Menu", "Please upload or capture a menu first.");
      return;
    }

    setIsAnalyzing(true);

    setTimeout(() => {
      setResults(mockResults);
      setIsAnalyzing(false);
      setViewMode("results");
      Alert.alert("Analysis Complete", "Your menu safety report is ready.");
    }, 2000);
  }

  function resetToUpload() {
    setViewMode("upload");
    setFile(null);
    setResults([]);
    setRestaurantName("");
    setReportDish(null);
    setReportMessage("");
  }

  function submitReport() {
    if (!reportMessage.trim()) {
      Alert.alert("Missing Message", "Please type your feedback.");
      return;
    }

    Alert.alert("Thank You", "Your report has been submitted.");
    setReportMessage("");
    setReportDish(null);
    setViewMode("results");
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

        <Text style={styles.dishDescription}>{dish.description}</Text>

        <View style={styles.recommendationBox}>
          <Text style={styles.recommendationText}>
            {getRecommendation(dish.status)}
          </Text>
        </View>

        <View style={styles.categoryChip}>
          <Text style={styles.categoryChipText}>{dish.category}</Text>
        </View>

        {dish.allergens.length > 0 && (
          <View>
            <Text style={styles.blockTitle}>Detected allergens</Text>
            <View style={styles.chipsWrap}>
              {dish.allergens.map((allergen) => (
                <View key={`${dish.id}-${allergen}`} style={styles.allergenChip}>
                  <Text style={styles.allergenChipText}>{allergen}</Text>
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
                <View key={`${dish.id}-${warning}`} style={styles.warningChip}>
                  <Text style={styles.warningChipText}>{warning}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.reportWrap}>
          <Pressable
            onPress={() => {
              setReportDish(dish.name);
              setViewMode("report");
            }}
          >
            <Text style={styles.reportLink}>Report incorrect detection</Text>
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
              <Text style={styles.highlightText}>{reportDish}</Text>.
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
                  <Text style={styles.insightText}>Best picks</Text>
                </View>

                <View style={styles.insightPill}>
                  <Text style={styles.insightValueWarning}>{warningCount}</Text>
                  <Text style={styles.insightText}>Use caution</Text>
                </View>

                <View style={[styles.insightPill, styles.insightPillLast]}>
                  <Text style={styles.insightValueUnsafe}>{unsafeCount}</Text>
                  <Text style={styles.insightText}>Avoid</Text>
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
                  {safePercent}% of detected menu items are considered safer for your
                  profile based on the current analysis.
                </Text>
              </View>
            </View>

            {safeDishes.length > 0 && (
              <View style={styles.sectionGroup}>
                <View style={styles.sectionGroupHeader}>
                  <Text style={styles.sectionGroupTitle}>Best Picks</Text>
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
                  <Text style={styles.sectionGroupTitle}>Use Caution</Text>
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
                  <Text style={styles.sectionGroupTitle}>Avoid</Text>
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
          <FancyBackButton onPress={() => navigation.navigate("UserDashboard")} label="Back" />
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
                  <Text style={styles.uploadSub}>Tap to choose a photo or PDF</Text>
                  <Text style={styles.uploadTiny}>PNG, JPG or PDF (max 10MB)</Text>
                </View>
              </Pressable>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

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
