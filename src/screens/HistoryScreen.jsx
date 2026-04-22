import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome6 as Icon } from "@expo/vector-icons";
import { getScanDetails, getScanHistory } from "../api/scan";
import FancyBackButton from "../components/common/FancyBackButton";
import styles from "./HistoryScreen.styles";

const PAGE_SIZE = 5;

const STATUS_META = {
  safe: {
    label: "Safe",
    icon: "shield-halved",
    color: "#22C55E",
    badgeStyle: styles.dishStatusBadgeSafe,
    badgeTextStyle: styles.dishStatusBadgeTextSafe,
    cardStyle: styles.dishCardSafe,
  },
  risky: {
    label: "Risky",
    icon: "triangle-exclamation",
    color: "#EAB308",
    badgeStyle: styles.dishStatusBadgeWarning,
    badgeTextStyle: styles.dishStatusBadgeTextWarning,
    cardStyle: styles.dishCardWarning,
  },
  unsafe: {
    label: "Unsafe",
    icon: "circle-xmark",
    color: "#EF4444",
    badgeStyle: styles.dishStatusBadgeUnsafe,
    badgeTextStyle: styles.dishStatusBadgeTextUnsafe,
    cardStyle: styles.dishCardUnsafe,
  },
  unknown: {
    label: "Review",
    icon: "clipboard-list",
    color: "#94A3B8",
    badgeStyle: styles.dishStatusBadgeNeutral,
    badgeTextStyle: styles.dishStatusBadgeTextNeutral,
    cardStyle: styles.dishCardNeutral,
  },
};

function getStatusMeta(status) {
  return STATUS_META[String(status || "unknown").toLowerCase()] || STATUS_META.unknown;
}

function getRecordTotals(record) {
  return {
    safe: Number(record?.SafeCount) || 0,
    risky: Number(record?.RiskyCount) || 0,
    unsafe: Number(record?.UnsafeCount) || 0,
  };
}

function getOverallStatus(record) {
  const { risky, unsafe } = getRecordTotals(record);
  if (unsafe > 0) return "unsafe";
  if (risky > 0) return "risky";
  return "safe";
}

function getAiNarrative(record) {
  const summaryText =
    record?.ShortSummary ||
    record?.Summary?.short_summary ||
    record?.Summary?.shortSummary ||
    "";

  if (String(summaryText).trim()) {
    return String(summaryText).trim();
  }

  const { safe, risky, unsafe } = getRecordTotals(record);
  const total = safe + risky + unsafe;

  if (!total) {
    return "No dish classification is available yet. Open the scan to review the extracted menu items.";
  }

  if (unsafe > 0) {
    return `AI flagged ${unsafe} ${unsafe === 1 ? "dish as unsafe" : "dishes as unsafe"} and recommends avoiding them before ordering.`;
  }

  if (risky > 0) {
    return `AI marked ${risky} ${risky === 1 ? "dish as risky" : "dishes as risky"} and suggests confirming ingredients with the restaurant.`;
  }

  return `AI reviewed ${total} ${total === 1 ? "dish" : "dishes"} and found a clean result with no warning flags.`;
}

function formatToken(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getDishPrimaryExplanation(dish) {
  const shortSummary = dish?.ShortSummary ? String(dish.ShortSummary).trim() : "";
  if (shortSummary) return shortSummary;

  const conflicts = Array.isArray(dish?.Conflicts) ? dish.Conflicts.filter(Boolean) : [];
  const notes = Array.isArray(dish?.Notes) ? dish.Notes.filter(Boolean) : [];
  const detectedTriggers = Array.isArray(dish?.DetectedTriggers)
    ? dish.DetectedTriggers.filter(Boolean)
    : [];
  const confidence = Number(dish?.Confidence);
  const ingredientCoverage = Number(dish?.IngredientCoverage);

  if (conflicts.length > 0) {
    return conflicts
      .map((conflict) => String(conflict?.explanation || "").trim())
      .filter(Boolean)
      .join(" ");
  }

  if (notes.length > 0) {
    return notes.map((note) => String(note).trim()).filter(Boolean).join(" ");
  }

  if (detectedTriggers.length > 0) {
    return `AI detected possible triggers in this dish: ${detectedTriggers
      .map(formatToken)
      .join(", ")}.`;
  }

  if (Number.isFinite(confidence) && confidence > 0) {
    const confidenceText = `${Math.round(confidence * 100)}% confidence`;
    if (Number.isFinite(ingredientCoverage) && ingredientCoverage > 0) {
      return `AI classified this dish as ${String(dish?.SafetyStatus || "UNKNOWN").toLowerCase()} with ${confidenceText} and ${Math.round(
        ingredientCoverage * 100
      )}% ingredient coverage.`;
    }
    return `AI classified this dish as ${String(dish?.SafetyStatus || "UNKNOWN").toLowerCase()} with ${confidenceText}.`;
  }

  return "No detailed AI explanation was returned for this dish.";
}

function formatDateTime(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value || "Unknown date";
  return parsed.toLocaleString();
}

function getSavedMenuLocation(scan) {
  const rawLocation = scan?.MenuLocation || scan?.FilePath || "";
  return String(rawLocation).trim();
}

function buildStatusBreakdown(record) {
  const { safe, risky, unsafe } = getRecordTotals(record);
  return [
    { key: "safe", label: "Safe dishes", count: safe, status: "safe" },
    { key: "risky", label: "Risky dishes", count: risky, status: "risky" },
    { key: "unsafe", label: "Unsafe dishes", count: unsafe, status: "unsafe" },
  ];
}

function getScanAccentStyle(status) {
  if (status === "safe") return styles.scanOrbSafe;
  if (status === "risky") return styles.scanOrbRisky;
  if (status === "unsafe") return styles.scanOrbUnsafe;
  return styles.scanOrbNeutral;
}

export default function HistoryScreen({ navigation, route }) {
  const initialScanFromRoute = route?.params?.initialScan || null;
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedScan, setSelectedScan] = useState(initialScanFromRoute);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchScanHistory() {
      try {
        setLoading(true);
        const data = await getScanHistory();
        if (!active) return;
        setHistory(Array.isArray(data) ? data : []);
        setError("");
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Failed to load scan history. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchScanHistory();

    return () => {
      active = false;
    };
  }, []);

  const filteredHistory = useMemo(
    () =>
      history.filter((record) =>
        String(record?.RestaurantName || "").toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [history, searchTerm]
  );

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / PAGE_SIZE));
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const totalSafe = history.reduce((acc, scan) => acc + (Number(scan.SafeCount) || 0), 0);
  const totalRisky = history.reduce((acc, scan) => acc + (Number(scan.RiskyCount) || 0), 0);
  const totalUnsafe = history.reduce((acc, scan) => acc + (Number(scan.UnsafeCount) || 0), 0);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    const initialScan = route?.params?.initialScan;
    if (!initialScan) return;

    setSelectedScan((current) =>
      current && String(current?.ScanID) === String(initialScan?.ScanID)
        ? current
        : initialScan
    );
  }, [route?.params?.initialScan]);

  useEffect(() => {
    const initialScan = route?.params?.initialScan;
    if (!initialScan) return;

    handleViewScan(initialScan);
    navigation.setParams?.({ initialScan: undefined });
  }, [route?.params?.initialScan, navigation]);

  async function handleViewScan(scan) {
    setSelectedScan(scan);
    setDetailsError("");
    setDetailsLoading(true);

    try {
      const details = await getScanDetails(scan.ScanID);
      setSelectedScan({
        ...scan,
        ...details,
        SafeCount: scan.SafeCount,
        UnsafeCount: scan.UnsafeCount,
        RiskyCount: scan.RiskyCount,
      });
    } catch (err) {
      setDetailsError(err?.message || "Failed to load scan details.");
    } finally {
      setDetailsLoading(false);
    }
  }

  function renderDishCard(dish) {
    const dishMeta = getStatusMeta(dish?.SafetyStatus);
    const status = String(dish?.SafetyStatus || "unknown").toLowerCase();

    return (
      <View
        key={dish.DishID}
        style={[styles.dishCard, dishMeta.cardStyle !== styles.dishCard && dishMeta.cardStyle]}
      >
        <View style={styles.dishTitleRow}>
          <Icon name={dishMeta.icon} size={16} color={dishMeta.color} solid />
          <View style={styles.dishTitleTextWrap}>
            <Text style={styles.dishTitle}>{dish.DishName}</Text>
          </View>
        </View>

        <View style={[styles.dishStatusBadge, dishMeta.badgeStyle]}>
          <Text style={dishMeta.badgeTextStyle}>{dishMeta.label}</Text>
        </View>

        {status !== "safe" && (
          <View style={styles.recommendationBox}>
            <Text style={styles.detailNarrativeLabel}>AI note</Text>
            <Text style={styles.recommendationText}>{getDishPrimaryExplanation(dish)}</Text>
          </View>
        )}

        <Text style={styles.blockTitle}>Extracted ingredients</Text>
        {Array.isArray(dish.Ingredients) && dish.Ingredients.length > 0 ? (
          <View style={styles.chipsWrap}>
            {dish.Ingredients.map((ingredient, ingredientIndex) => (
              <View
                key={`${dish.DishID}-${ingredient}-${ingredientIndex}`}
                style={styles.ingredientChip}
              >
                <Text style={styles.ingredientChipText}>{ingredient}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.dishDescription}>
            No ingredient details were returned for this dish.
          </Text>
        )}
      </View>
    );
  }

  if (selectedScan) {
    const totals = getRecordTotals(selectedScan);
    const totalDishes = totals.safe + totals.risky + totals.unsafe;
    const safePercent = totalDishes ? Math.round((totals.safe / totalDishes) * 100) : 0;
    const dishes = Array.isArray(selectedScan.Dishes) ? selectedScan.Dishes : [];
    const overallStatus = getOverallStatus(selectedScan);
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.container}>
          <View style={styles.header}>
            <FancyBackButton onPress={() => setSelectedScan(null)} label="Back to History" />

            <View style={styles.detailHeaderRow}>
              <View style={styles.detailHeaderBody}>
                <Text style={styles.resultsTitle}>{selectedScan.RestaurantName}</Text>
                <Text style={styles.resultsSubtitle}>
                  Personalized menu safety report with the AI notes returned for this scan.
                </Text>
              </View>

              <View style={[styles.shieldBox, getScanAccentStyle(overallStatus)]}>
                <Icon name="shield-halved" size={22} color="#FFFFFF" solid />
              </View>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.heroCard}>
              <View style={styles.heroTopRow}>
                <View style={styles.heroContent}>
                  <Text style={styles.heroEyebrow}>AI Summary</Text>
                  <Text style={styles.heroHeadline}>Your safety overview</Text>
                  <Text style={styles.heroSubtext}>{getAiNarrative(selectedScan)}</Text>
                  <Text style={styles.savedScanMeta}>{formatDateTime(selectedScan.ScanDate)}</Text>
                  {!!getSavedMenuLocation(selectedScan) && (
                    <Text style={styles.savedScanLocation}>
                      Saved menu: {getSavedMenuLocation(selectedScan)}
                    </Text>
                  )}
                </View>

                <View style={styles.scoreRing}>
                  <Text style={styles.scoreValue}>{safePercent}%</Text>
                  <Text style={styles.scoreLabel}>Safe</Text>
                </View>
              </View>

              <View style={styles.insightRow}>
                <View style={styles.insightPill}>
                  <Text style={styles.insightValueSafe}>{selectedScan.SafeCount || 0}</Text>
                  <Text style={styles.insightText}>Safe dishes</Text>
                </View>
                <View style={styles.insightPill}>
                  <Text style={styles.insightValueWarning}>{selectedScan.RiskyCount || 0}</Text>
                  <Text style={styles.insightText}>Risky dishes</Text>
                </View>
                <View style={[styles.insightPill, styles.insightPillLast]}>
                  <Text style={styles.insightValueUnsafe}>{selectedScan.UnsafeCount || 0}</Text>
                  <Text style={styles.insightText}>Unsafe dishes</Text>
                </View>
              </View>
            </View>

            {detailsLoading && (
              <View style={styles.statusCard}>
                <ActivityIndicator size="small" color="#1DB954" />
                <Text style={styles.statusText}>Loading scan details...</Text>
              </View>
            )}

            {!!detailsError && (
              <View style={styles.statusCard}>
                <Text style={styles.errorText}>{detailsError}</Text>
              </View>
            )}

            {!detailsLoading && dishes.length > 0 && (
              <View style={styles.sectionGroup}>
                <View style={styles.sectionGroupHeader}>
                  <Text style={styles.sectionGroupTitle}>Dish breakdown</Text>
                  <Text style={styles.sectionGroupCount}>{dishes.length} extracted items</Text>
                </View>
                {dishes.map(renderDishCard)}
              </View>
            )}

            {!detailsLoading && dishes.length === 0 && (
              <View style={styles.statusCard}>
                <Text style={styles.statusText}>
                  No dish details were returned for this scan.
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.bottomNav}>
            <Pressable style={styles.navItem} onPress={() => navigation.navigate("UserDashboard")}>
              <Icon name="house" size={18} color="#9CA3AF" solid />
              <Text style={styles.navLabel}>Home</Text>
            </Pressable>

            <Pressable style={styles.navCenterWrap} onPress={() => navigation.navigate("MenuUpload")}>
              <View style={styles.navCenterBtn}>
                <Icon name="upload" size={20} color="#03150A" solid />
              </View>
            </Pressable>

            <Pressable style={styles.navItem} onPress={() => navigation.navigate("Profile")}>
              <Icon name="user" size={18} color="#9CA3AF" solid />
              <Text style={styles.navLabel}>Profile</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <FancyBackButton onPress={() => navigation.navigate("UserDashboard")} label="Back" />

          <View style={styles.listHeaderRow}>
            <View style={styles.listHeaderTextWrap}>
              <Text style={styles.listTitle}>Scan History</Text>
              <Text style={styles.listSubtitle}>
                Review every scan with richer safety signals and clearer dish details.
              </Text>
            </View>
            <View style={styles.headerOrb}>
              <Icon name="clock-rotate-left" size={20} color="#FFFFFF" solid />
            </View>
          </View>

          <View style={styles.searchWrap}>
            <Icon name="magnifying-glass" size={16} color="#6B7280" solid style={styles.searchIcon} />
            <TextInput
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="Search by restaurant name..."
              placeholderTextColor="#6B7280"
              style={styles.searchInput}
            />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.emptyWrap}>
              <ActivityIndicator size="large" color="#1DB954" />
              <Text style={styles.statusText}>Loading scan history...</Text>
            </View>
          ) : error ? (
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIconWrap}>
                <Icon name="triangle-exclamation" size={28} color="#F87171" solid />
              </View>
              <Text style={styles.emptyTitle}>Couldn't load history</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Total scans</Text>
                  <Text style={styles.summaryValue}>{history.length}</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Safe dishes</Text>
                  <Text style={[styles.summaryValue, styles.summaryValueSafe]}>{totalSafe}</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Risky dishes</Text>
                  <Text style={[styles.summaryValue, styles.summaryValueWarning]}>{totalRisky}</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Unsafe dishes</Text>
                  <Text style={[styles.summaryValue, styles.summaryValueUnsafe]}>{totalUnsafe}</Text>
                </View>
              </View>

              {filteredHistory.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <View style={styles.emptyIconWrap}>
                    <Icon name="magnifying-glass" size={28} color="#9CA3AF" solid />
                  </View>
                  <Text style={styles.emptyTitle}>No matching scans found</Text>
                  <Text style={styles.emptyText}>
                    Try another restaurant name or clear the search field.
                  </Text>
                </View>
              ) : (
                paginatedHistory.map((record) => {
                  const totals = getRecordTotals(record);
                  const totalDishes = totals.safe + totals.risky + totals.unsafe;
                  const status = getOverallStatus(record);
                  const statusMeta = getStatusMeta(status);

                  return (
                    <Pressable
                      key={record.ScanID}
                      style={styles.historyCard}
                      onPress={() => handleViewScan(record)}
                    >
                      <View style={styles.historyAccentLine} />

                      <View style={styles.historyCardTop}>
                        <View style={styles.historyCardBody}>
                          <View style={styles.historyIntroRow}>
                            <View style={[styles.scanOrb, getScanAccentStyle(status)]}>
                              <Icon name="file-lines" size={18} color="#FFFFFF" solid />
                            </View>

                            <View style={styles.historyIntroBody}>
                              <View style={styles.inlineMetaRow}>
                                <View style={[styles.detailPill, statusMeta.badgeStyle]}>
                                  <Text style={statusMeta.badgeTextStyle}>{statusMeta.label} scan</Text>
                                </View>
                                <Text style={styles.historyCardMeta}>{formatDateTime(record.ScanDate)}</Text>
                              </View>

                              <Text style={styles.historyCardTitle}>{record.RestaurantName}</Text>
                              <Text style={styles.historyNarrative}>{getAiNarrative(record)}</Text>
                            </View>
                          </View>

                          <View style={styles.historyBottomRow}>
                            <View style={styles.historyStatsRow}>
                              {buildStatusBreakdown(record).map((item) => (
                                <View key={item.key} style={styles.historyStatPill}>
                                  <View
                                    style={[
                                      styles.dot,
                                      item.status === "safe" && styles.dotSafe,
                                      item.status === "risky" && styles.dotWarn,
                                      item.status === "unsafe" && styles.dotUnsafe,
                                    ]}
                                  />
                                  <Text style={styles.historyStatText}>
                                    {item.count} {item.label}
                                  </Text>
                                </View>
                              ))}
                            </View>

                            <View style={styles.historyActionWrap}>
                              <Text style={styles.historyActionText}>Open report</Text>
                              <Icon name="chevron-right" size={14} color="#9CA3AF" solid />
                            </View>
                          </View>

                          <Text style={styles.savedScanLocation}>
                            {totalDishes} {totalDishes === 1 ? "dish" : "dishes"} classified
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                })
              )}

              {filteredHistory.length > PAGE_SIZE && (
                <View style={styles.paginationWrap}>
                  <Text style={styles.listSubtitle}>
                    Showing {(currentPage - 1) * PAGE_SIZE + 1}-
                    {Math.min(currentPage * PAGE_SIZE, filteredHistory.length)} of {filteredHistory.length} scans
                  </Text>
                  <View style={styles.paginationRow}>
                    <Pressable
                      style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
                      disabled={currentPage === 1}
                      onPress={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    >
                      <Text style={styles.pageBtnText}>Previous</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
                      disabled={currentPage === totalPages}
                      onPress={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    >
                      <Text style={styles.pageBtnText}>Next</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>

        <View style={styles.bottomNav}>
          <Pressable style={styles.navItem} onPress={() => navigation.navigate("UserDashboard")}>
            <Icon name="house" size={18} color="#9CA3AF" solid />
            <Text style={styles.navLabel}>Home</Text>
          </Pressable>

          <Pressable style={styles.navCenterWrap} onPress={() => navigation.navigate("MenuUpload")}>
            <View style={styles.navCenterBtn}>
              <Icon name="upload" size={20} color="#03150A" solid />
            </View>
          </Pressable>

          <Pressable style={styles.navItem} onPress={() => navigation.navigate("Profile")}>
            <Icon name="user" size={18} color="#9CA3AF" solid />
            <Text style={styles.navLabel}>Profile</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
