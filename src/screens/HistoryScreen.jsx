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
import FancyBackButton from "./common/FancyBackButton";
import styles, { getHistoryIconBorderStyle } from "../style/HistoryScreen.styles";

const PAGE_SIZE = 5;

const STATUS_META = {
  safe: {
    label: "Safe",
    icon: "shield-halved",
    color: "#20C765",
    badgeStyle: styles.badgeSafe,
    badgeTextStyle: styles.badgeTextSafe,
    cardStyle: styles.dishCardSafe,
  },
  risky: {
    label: "Risky",
    icon: "triangle-exclamation",
    color: "#F5B400",
    badgeStyle: styles.badgeWarning,
    badgeTextStyle: styles.badgeTextWarning,
    cardStyle: styles.dishCardWarning,
  },
  unsafe: {
    label: "Unsafe",
    icon: "circle-xmark",
    color: "#FF4D4D",
    badgeStyle: styles.badgeUnsafe,
    badgeTextStyle: styles.badgeTextUnsafe,
    cardStyle: styles.dishCardUnsafe,
  },
  unknown: {
    label: "Review",
    icon: "clipboard-list",
    color: "#A3A3A3",
    badgeStyle: styles.badgeNeutral,
    badgeTextStyle: styles.badgeTextNeutral,
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

function getScanAccentStyle(status) {
  if (status === "safe") return styles.accentSafe;
  if (status === "risky") return styles.accentRisky;
  if (status === "unsafe") return styles.accentUnsafe;
  return styles.accentNeutral;
}

function getAiNarrative(record) {
  const summaryText =
    record?.ShortSummary ||
    record?.Summary?.short_summary ||
    record?.Summary?.shortSummary ||
    "";

  if (String(summaryText).trim()) return String(summaryText).trim();

  const { safe, risky, unsafe } = getRecordTotals(record);
  const total = safe + risky + unsafe;

  if (!total) {
    return "No dish classification is available yet. Open the scan to review extracted menu items.";
  }

  if (unsafe > 0) {
    return `AI flagged ${unsafe} ${unsafe === 1 ? "dish" : "dishes"} as unsafe and recommends avoiding them.`;
  }

  if (risky > 0) {
    return `AI marked ${risky} ${risky === 1 ? "dish" : "dishes"} as risky. Confirm ingredients with the restaurant before ordering.`;
  }

  return `AI reviewed ${total} ${total === 1 ? "dish" : "dishes"} and found no warning flags.`;
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
  const triggers = Array.isArray(dish?.DetectedTriggers)
    ? dish.DetectedTriggers.filter(Boolean)
    : [];

  if (conflicts.length > 0) {
    return conflicts
      .map((conflict) => String(conflict?.explanation || "").trim())
      .filter(Boolean)
      .join(" ");
  }

  if (notes.length > 0) {
    return notes.map((note) => String(note).trim()).filter(Boolean).join(" ");
  }

  if (triggers.length > 0) {
    return `AI detected possible triggers in this dish: ${triggers.map(formatToken).join(", ")}.`;
  }

  return "No detailed AI explanation was returned for this dish.";
}

function formatDateTime(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value || "Unknown date";

  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSavedMenuLocation(scan) {
  return String(scan?.MenuLocation || scan?.FilePath || "").trim();
}

function buildStatusBreakdown(record) {
  const { safe, risky, unsafe } = getRecordTotals(record);

  return [
    { key: "safe", label: "Safe", count: safe, status: "safe" },
    { key: "risky", label: "Risky", count: risky, status: "risky" },
    { key: "unsafe", label: "Unsafe", count: unsafe, status: "unsafe" },
  ];
}

export default function HistoryScreen({ navigation, route }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedScan, setSelectedScan] = useState(route?.params?.initialScan || null);
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

  const filteredHistory = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return history;

    return history.filter((record) =>
      String(record?.RestaurantName || "").toLowerCase().includes(term)
    );
  }, [history, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / PAGE_SIZE));

  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const totalSafe = history.reduce((acc, scan) => acc + (Number(scan.SafeCount) || 0), 0);
  const totalRisky = history.reduce((acc, scan) => acc + (Number(scan.RiskyCount) || 0), 0);
  const totalUnsafe = history.reduce((acc, scan) => acc + (Number(scan.UnsafeCount) || 0), 0);
  const totalScannedDishes = totalSafe + totalRisky + totalUnsafe;

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

    handleViewScan(initialScan);
    navigation.setParams?.({ initialScan: undefined });
  }, [navigation, route?.params?.initialScan]);

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
        RiskyCount: scan.RiskyCount,
        UnsafeCount: scan.UnsafeCount,
      });
    } catch (err) {
      setDetailsError(err?.message || "Failed to load scan details.");
    } finally {
      setDetailsLoading(false);
    }
  }

  function renderDishCard(dish) {
    const meta = getStatusMeta(dish?.SafetyStatus);
    const status = String(dish?.SafetyStatus || "unknown").toLowerCase();

    return (
      <View key={dish.DishID || dish.DishName} style={[styles.dishCard, meta.cardStyle]}>
        <View style={styles.dishHeaderRow}>
          <View style={getHistoryIconBorderStyle(styles.dishIconBox, meta.color)}>
            <Icon name={meta.icon} size={16} color={meta.color} solid />
          </View>

          <View style={styles.dishTitleWrap}>
            <Text style={styles.dishEyebrow}>Dish result</Text>
            <Text style={styles.dishTitle}>{dish.DishName || "Unnamed dish"}</Text>
          </View>

          <View style={[styles.badge, meta.badgeStyle]}>
            <Text style={meta.badgeTextStyle}>{meta.label}</Text>
          </View>
        </View>

        {status !== "safe" && (
          <View style={styles.aiNoteBox}>
            <View style={styles.aiNoteHeader}>
              <Icon name="sparkles" size={12} color="#D4D4D4" solid />
              <Text style={styles.aiNoteLabel}>AI note</Text>
            </View>
            <Text style={styles.aiNoteText}>{getDishPrimaryExplanation(dish)}</Text>
          </View>
        )}

        <Text style={styles.blockTitle}>Extracted ingredients</Text>

        {Array.isArray(dish.Ingredients) && dish.Ingredients.length > 0 ? (
          <View style={styles.chipsWrap}>
            {dish.Ingredients.map((ingredient, index) => (
              <View key={`${dish.DishID}-${ingredient}-${index}`} style={styles.ingredientChip}>
                <Text style={styles.ingredientChipText}>{ingredient}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.mutedText}>No ingredient details were returned for this dish.</Text>
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
              <View style={styles.headerTextWrap}>
                <Text style={styles.screenTitle}>{selectedScan.RestaurantName}</Text>
                <Text style={styles.screenSubtitle}>
                  Personalized safety report with AI-backed dish notes.
                </Text>
              </View>

              <View style={[styles.headerIconBox, getScanAccentStyle(overallStatus)]}>
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
                  <Text style={styles.heroBody}>{getAiNarrative(selectedScan)}</Text>
                </View>

                <View style={styles.scoreRing}>
                  <Text style={styles.scoreValue}>{safePercent}%</Text>
                  <Text style={styles.scoreLabel}>Safe</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statValueSafe}>{totals.safe}</Text>
                  <Text style={styles.statLabel}>Safe</Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={styles.statValueRisky}>{totals.risky}</Text>
                  <Text style={styles.statLabel}>Risky</Text>
                </View>

                <View style={styles.statCardLast}>
                  <Text style={styles.statValueUnsafe}>{totals.unsafe}</Text>
                  <Text style={styles.statLabel}>Unsafe</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaChip}>
                  <Icon name="calendar" size={12} color="#D7FBE8" solid />
                  <Text style={styles.metaChipText}>{formatDateTime(selectedScan.ScanDate)}</Text>
                </View>

                <View style={styles.metaChip}>
                  <Icon name="layer-group" size={12} color="#D7FBE8" solid />
                  <Text style={styles.metaChipText}>
                    {totalDishes} {totalDishes === 1 ? "dish" : "dishes"}
                  </Text>
                </View>
              </View>

              {!!getSavedMenuLocation(selectedScan) && (
                <Text style={styles.fileLocation}>
                  Saved menu: {getSavedMenuLocation(selectedScan)}
                </Text>
              )}
            </View>

            {detailsLoading && (
              <View style={styles.statusCard}>
                <ActivityIndicator size="small" color="#20C765" />
                <Text style={styles.statusText}>Loading scan details...</Text>
              </View>
            )}

            {!!detailsError && (
              <View style={styles.statusCard}>
                <Icon name="triangle-exclamation" size={20} color="#FCA5A5" solid />
                <Text style={styles.errorText}>{detailsError}</Text>
              </View>
            )}

            {!detailsLoading && dishes.length > 0 && (
              <View style={styles.sectionGroup}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Dish breakdown</Text>
                  <Text style={styles.sectionCount}>{dishes.length} items</Text>
                </View>

                {dishes.map(renderDishCard)}
              </View>
            )}

            {!detailsLoading && dishes.length === 0 && (
              <View style={styles.statusCard}>
                <Icon name="clipboard-list" size={22} color="#A3A3A3" solid />
                <Text style={styles.statusText}>No dish details were returned for this scan.</Text>
              </View>
            )}
          </ScrollView>

          <BottomNav navigation={navigation} />
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
            <View style={styles.headerTextWrap}>
              <Text style={styles.screenTitle}>Scan History</Text>
              <Text style={styles.screenSubtitle}>
                Review previous restaurant scans and reopen full safety reports.
              </Text>
            </View>

            <View style={styles.headerIconBox}>
              <Icon name="clock-rotate-left" size={20} color="#FFFFFF" solid />
            </View>
          </View>

          <View style={styles.searchWrap}>
            <Icon name="magnifying-glass" size={15} color="#A3A3A3" solid style={styles.searchIcon} />
            <TextInput
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="Search restaurant"
              placeholderTextColor="#7D7D7D"
              style={styles.searchInput}
              returnKeyType="search"
            />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.emptyWrap}>
              <ActivityIndicator size="large" color="#20C765" />
              <Text style={styles.statusText}>Loading scan history...</Text>
            </View>
          ) : error ? (
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIconWrap}>
                <Icon name="triangle-exclamation" size={26} color="#FF4D4D" solid />
              </View>
              <Text style={styles.emptyTitle}>Couldnâ€™t load history</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <>
              <View style={styles.historyHeroCard}>
                <View style={styles.heroBadgeRow}>
                  <View style={styles.heroBadge}>
                    <Icon name="database" size={11} color="#D7FBE8" solid />
                    <Text style={styles.heroBadgeText}>SCAN ARCHIVE</Text>
                  </View>

                  <View style={styles.heroMiniIcon}>
                    <Icon name="chart-simple" size={14} color="#D7FBE8" solid />
                  </View>
                </View>

                <Text style={styles.historyHeroTitle}>A professional view of every menu scan</Text>
                <Text style={styles.historyHeroBody}>
                  Track restaurant checks, compare safety outcomes, and reopen detailed AI reports.
                </Text>

                <View style={styles.historyHeroStats}>
                  <View style={styles.historyHeroStatCard}>
                    <Text style={styles.historyHeroStatValue}>{history.length}</Text>
                    <Text style={styles.historyHeroStatLabel}>Saved scans</Text>
                  </View>

                  <View style={styles.historyHeroStatCardLast}>
                    <Text style={styles.historyHeroStatValue}>{totalScannedDishes}</Text>
                    <Text style={styles.historyHeroStatLabel}>Classified dishes</Text>
                  </View>
                </View>
              </View>

              <View style={styles.summaryGrid}>
                <SummaryCard icon="receipt" label="Total scans" value={history.length} />
                <SummaryCard icon="shield-halved" label="Safe dishes" value={totalSafe} tone="safe" />
                <SummaryCard icon="triangle-exclamation" label="Risky dishes" value={totalRisky} tone="risky" />
                <SummaryCard icon="circle-xmark" label="Unsafe dishes" value={totalUnsafe} tone="unsafe" />
              </View>

              {filteredHistory.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <View style={styles.emptyIconWrap}>
                    <Icon name="magnifying-glass" size={26} color="#A3A3A3" solid />
                  </View>
                  <Text style={styles.emptyTitle}>No matching scans</Text>
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
                      <View style={[styles.historyTopAccent, getScanAccentStyle(status)]} />

                      <View style={styles.historyIntroRow}>
                        <View style={[styles.scanIconBox, getScanAccentStyle(status)]}>
                          <Icon name="file-lines" size={18} color="#FFFFFF" solid />
                        </View>

                        <View style={styles.historyIntroBody}>
                          <View style={styles.inlineMetaRow}>
                            <View style={[styles.badge, statusMeta.badgeStyle]}>
                              <Text style={statusMeta.badgeTextStyle}>
                                {statusMeta.label} scan
                              </Text>
                            </View>

                            <Text style={styles.historyDate}>{formatDateTime(record.ScanDate)}</Text>
                          </View>

                          <Text style={styles.historyCardTitle}>{record.RestaurantName}</Text>
                          <Text style={styles.historyNarrative}>{getAiNarrative(record)}</Text>
                        </View>
                      </View>

                      <View style={styles.historyStatsRow}>
                        {buildStatusBreakdown(record).map((item) => (
                          <View key={item.key} style={styles.historyStatPill}>
                            <View
                              style={[
                                styles.dot,
                                item.status === "safe" && styles.dotSafe,
                                item.status === "risky" && styles.dotRisky,
                                item.status === "unsafe" && styles.dotUnsafe,
                              ]}
                            />
                            <Text style={styles.historyStatText}>
                              {item.count} {item.label}
                            </Text>
                          </View>
                        ))}
                      </View>

                      <View style={styles.historyFooter}>
                        <Text style={styles.historyFooterText}>
                          {totalDishes} {totalDishes === 1 ? "dish" : "dishes"} classified
                        </Text>

                        <View style={styles.openReportButton}>
                          <Text style={styles.openReportText}>Open report</Text>
                          <Icon name="chevron-right" size={13} color="#E5E5E5" solid />
                        </View>
                      </View>
                    </Pressable>
                  );
                })
              )}

              {filteredHistory.length > PAGE_SIZE && (
                <View style={styles.paginationWrap}>
                  <Text style={styles.paginationText}>
                    Showing {(currentPage - 1) * PAGE_SIZE + 1}-
                    {Math.min(currentPage * PAGE_SIZE, filteredHistory.length)} of{" "}
                    {filteredHistory.length}
                  </Text>

                  <View style={styles.paginationRow}>
                    <Pressable
                      style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
                      disabled={currentPage === 1}
                      onPress={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    >
                      <Icon name="chevron-left" size={12} color="#FFFFFF" solid />
                      <Text style={styles.pageButtonText}>Previous</Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.pageButton,
                        currentPage === totalPages && styles.pageButtonDisabled,
                      ]}
                      disabled={currentPage === totalPages}
                      onPress={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    >
                      <Text style={styles.pageButtonText}>Next</Text>
                      <Icon name="chevron-right" size={12} color="#FFFFFF" solid />
                    </Pressable>
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>

        <BottomNav navigation={navigation} />
      </View>
    </SafeAreaView>
  );
}

function SummaryCard({ icon, label, value, tone }) {
  const valueStyle =
    tone === "safe"
      ? styles.summaryValueSafe
      : tone === "risky"
        ? styles.summaryValueRisky
        : tone === "unsafe"
          ? styles.summaryValueUnsafe
          : null;

  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryIconBox}>
        <Icon name={icon} size={14} color="#D7FBE8" solid />
      </View>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, valueStyle]}>{value}</Text>
    </View>
  );
}

function BottomNav({ navigation }) {
  return (
    <View style={styles.bottomNav}>
      <Pressable style={styles.navItem} onPress={() => navigation.navigate("UserDashboard")}>
        <Icon name="house" size={18} color="#20C765" solid />
        <Text style={styles.navLabelActive}>Home</Text>
      </Pressable>

      <Pressable style={styles.navCenterWrap} onPress={() => navigation.navigate("MenuUpload")}>
        <View style={styles.navCenterButton}>
          <Icon name="upload" size={20} color="#03150A" solid />
        </View>
      </Pressable>

      <Pressable style={styles.navItem} onPress={() => navigation.navigate("Profile")}>
        <Icon name="user" size={18} color="#A3A3A3" solid />
        <Text style={styles.navLabel}>Profile</Text>
      </Pressable>
    </View>
  );
}


