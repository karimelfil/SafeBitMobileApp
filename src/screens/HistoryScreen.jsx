import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome6";
import FancyBackButton from "../components/common/FancyBackButton";
import styles from "./HistoryScreen.styles";

const mockHistory = [
  {
    id: "1",
    restaurantName: "The Green Garden",
    date: "2025-11-15",
    safeDishes: 12,
    warningDishes: 3,
    unsafeDishes: 2,
    location: "123 Main St, New York",
    scanType: "photo",
    totalItems: 17,
    dishes: [
      {
        id: "1",
        name: "Mediterranean Quinoa Bowl",
        category: "Main Course",
        status: "safe",
        description: "Organic quinoa with roasted vegetables and tahini dressing",
        allergens: [],
        warnings: [],
      },
      {
        id: "2",
        name: "Grilled Salmon",
        category: "Main Course",
        status: "safe",
        description: "Wild-caught salmon with lemon herb butter",
        allergens: ["Fish"],
        warnings: [],
      },
      {
        id: "3",
        name: "Peanut Satay Noodles",
        category: "Main Course",
        status: "unsafe",
        description: "Rice noodles with peanut satay sauce and vegetables",
        allergens: ["Peanuts", "Soy"],
        warnings: ["High allergen risk"],
      },
      {
        id: "4",
        name: "Classic Caesar Salad",
        category: "Appetizer",
        status: "warning",
        description: "Romaine lettuce with Caesar dressing and croutons",
        allergens: ["Dairy", "Wheat"],
        warnings: ["Contains dairy and gluten"],
      },
      {
        id: "5",
        name: "Gluten-Free Pasta",
        category: "Main Course",
        status: "safe",
        description: "Corn pasta with fresh tomato basil sauce",
        allergens: [],
        warnings: [],
      },
    ],
  },
  {
    id: "2",
    restaurantName: "Pasta Paradise",
    date: "2025-11-14",
    safeDishes: 8,
    warningDishes: 5,
    unsafeDishes: 1,
    location: "456 Italian Ave, Boston",
    scanType: "pdf",
    totalItems: 14,
    dishes: [
      {
        id: "1",
        name: "Margherita Pizza",
        category: "Main Course",
        status: "warning",
        description: "Traditional pizza with tomato and mozzarella",
        allergens: ["Dairy", "Wheat"],
        warnings: ["Contains gluten and dairy"],
      },
      {
        id: "2",
        name: "Seafood Linguine",
        category: "Main Course",
        status: "unsafe",
        description: "Linguine pasta with mixed seafood in white wine sauce",
        allergens: ["Shellfish", "Fish", "Wheat"],
        warnings: ["Multiple allergens present"],
      },
      {
        id: "3",
        name: "Caprese Salad",
        category: "Appetizer",
        status: "warning",
        description: "Fresh mozzarella, tomatoes, and basil",
        allergens: ["Dairy"],
        warnings: ["Contains dairy"],
      },
      {
        id: "4",
        name: "Grilled Vegetable Plate",
        category: "Main Course",
        status: "safe",
        description: "Seasonal grilled vegetables with olive oil",
        allergens: [],
        warnings: [],
      },
    ],
  },
  {
    id: "3",
    restaurantName: "Sushi Station",
    date: "2025-11-12",
    safeDishes: 6,
    warningDishes: 2,
    unsafeDishes: 4,
    location: "789 Ocean Drive, Miami",
    scanType: "photo",
    totalItems: 12,
    dishes: [
      {
        id: "1",
        name: "California Roll",
        category: "Sushi",
        status: "warning",
        description: "Crab, avocado, and cucumber",
        allergens: ["Shellfish"],
        warnings: ["Contains imitation crab"],
      },
      {
        id: "2",
        name: "Salmon Nigiri",
        category: "Sushi",
        status: "safe",
        description: "Fresh salmon over rice",
        allergens: ["Fish"],
        warnings: [],
      },
      {
        id: "3",
        name: "Spicy Tuna Roll",
        category: "Sushi",
        status: "unsafe",
        description: "Tuna with spicy mayo",
        allergens: ["Fish", "Soy", "Eggs"],
        warnings: ["Multiple allergens"],
      },
    ],
  },
  {
    id: "4",
    restaurantName: "Burger Bliss",
    date: "2025-11-10",
    safeDishes: 10,
    warningDishes: 2,
    unsafeDishes: 0,
    location: "321 Burger Lane, Chicago",
    scanType: "photo",
    totalItems: 12,
    dishes: [
      {
        id: "1",
        name: "Classic Beef Burger",
        category: "Main Course",
        status: "warning",
        description: "Angus beef patty with lettuce and tomato",
        allergens: ["Dairy", "Wheat"],
        warnings: ["Bun contains gluten"],
      },
      {
        id: "2",
        name: "Veggie Burger",
        category: "Main Course",
        status: "safe",
        description: "House-made vegetable patty on gluten-free bun",
        allergens: [],
        warnings: [],
      },
      {
        id: "3",
        name: "Sweet Potato Fries",
        category: "Side",
        status: "safe",
        description: "Oven-baked sweet potato fries",
        allergens: [],
        warnings: [],
      },
    ],
  },
  {
    id: "5",
    restaurantName: "Mediterranean Delight",
    date: "2025-11-08",
    safeDishes: 15,
    warningDishes: 4,
    unsafeDishes: 3,
    location: "654 Olive Street, Los Angeles",
    scanType: "pdf",
    totalItems: 22,
    dishes: [
      {
        id: "1",
        name: "Hummus Platter",
        category: "Appetizer",
        status: "safe",
        description: "Fresh hummus with pita bread",
        allergens: ["Sesame"],
        warnings: [],
      },
      {
        id: "2",
        name: "Lamb Kebabs",
        category: "Main Course",
        status: "safe",
        description: "Grilled lamb with herbs and spices",
        allergens: [],
        warnings: [],
      },
      {
        id: "3",
        name: "Baklava",
        category: "Dessert",
        status: "unsafe",
        description: "Layered pastry with nuts and honey",
        allergens: ["Tree Nuts", "Wheat"],
        warnings: ["Contains multiple nuts"],
      },
    ],
  },
];

function formatDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDishStatusIcon(status) {
  if (status === "safe") return { name: "shield-halved", color: "#22C55E" };
  if (status === "warning") return { name: "triangle-exclamation", color: "#EAB308" };
  return { name: "circle-xmark", color: "#EF4444" };
}

function getStatusLabel(status) {
  if (status === "safe") return "Best Pick";
  if (status === "warning") return "Use Caution";
  return "Avoid";
}

function getRecommendation(status) {
  if (status === "safe") {
    return "This item looked compatible with your profile based on the detected ingredients and allergen signals.";
  }
  if (status === "warning") {
    return "This item may still work for you, but it should be confirmed with the restaurant before ordering.";
  }
  return "This item was flagged as a strong dietary or allergen risk for your profile.";
}

function getOverallMessage(safePercent, warningCount, unsafeCount) {
  if (safePercent >= 70 && unsafeCount === 0) {
    return "This scan looks generally friendly for your dietary profile, with several strong options you can prioritize.";
  }
  if (unsafeCount > 0) {
    return "This scan includes some dishes that may not be suitable for you, so the flagged items should be reviewed carefully.";
  }
  if (warningCount > 0) {
    return "There are good options here, but a few dishes need extra attention before you make a final choice.";
  }
  return "Your saved menu analysis is ready to review.";
}

export default function HistoryScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedScan, setSelectedScan] = useState(null);
  const history = mockHistory;

  const filteredHistory = history.filter((item) =>
    item.restaurantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedScan) {
    const safetyPercent = Math.round(
      (selectedScan.safeDishes / selectedScan.totalItems) * 100
    );
    const dishes = selectedScan.dishes || [];
    const safeDishes = dishes.filter((dish) => dish.status === "safe");
    const warningDishes = dishes.filter((dish) => dish.status === "warning");
    const unsafeDishes = dishes.filter((dish) => dish.status === "unsafe");
    const overallMessage = getOverallMessage(
      safetyPercent,
      selectedScan.warningDishes,
      selectedScan.unsafeDishes
    );

    function renderDishCard(dish) {
      const icon = getDishStatusIcon(dish.status);
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
        </View>
      );
    }

    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.container}>
          <View style={styles.header}>
            <FancyBackButton onPress={() => setSelectedScan(null)} label="Back to History" />

            <View style={styles.detailHeaderRow}>
              <View style={styles.detailHeaderBody}>
                <Text style={styles.resultsTitle}>{selectedScan.restaurantName}</Text>
                <Text style={styles.resultsSubtitle}>Personalized Menu Safety Report</Text>
              </View>

              <View style={styles.shieldBox}>
                <Icon name="shield-halved" size={26} color="#FFFFFF" solid />
              </View>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.heroCard}>
              <View style={styles.heroTopRow}>
                <View style={styles.heroContent}>
                  <Text style={styles.heroEyebrow}>Saved Scan</Text>
                  <Text style={styles.heroHeadline}>Your safety overview</Text>
                  <Text style={styles.heroSubtext}>{overallMessage}</Text>
                  <Text style={styles.savedScanMeta}>
                    {formatDate(selectedScan.date)} • {selectedScan.scanType.toUpperCase()} scan
                  </Text>
                  {!!selectedScan.location && (
                    <Text style={styles.savedScanLocation}>{selectedScan.location}</Text>
                  )}
                </View>

                <View style={styles.scoreRing}>
                  <Text style={styles.scoreValue}>{safetyPercent}%</Text>
                  <Text style={styles.scoreLabel}>Safe</Text>
                </View>
              </View>

              <View style={styles.insightRow}>
                <View style={styles.insightPill}>
                  <Text style={styles.insightValueSafe}>{selectedScan.safeDishes}</Text>
                  <Text style={styles.insightText}>Best picks</Text>
                </View>

                <View style={styles.insightPill}>
                  <Text style={styles.insightValueWarning}>{selectedScan.warningDishes}</Text>
                  <Text style={styles.insightText}>Use caution</Text>
                </View>

                <View style={[styles.insightPill, styles.insightPillLast]}>
                  <Text style={styles.insightValueUnsafe}>{selectedScan.unsafeDishes}</Text>
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
                  {safetyPercent}% of detected menu items were considered safer for your
                  profile based on the saved analysis.
                </Text>
              </View>
            </View>

            {safeDishes.length > 0 && (
              <View style={styles.sectionGroup}>
                <View style={styles.sectionGroupHeader}>
                  <Text style={styles.sectionGroupTitle}>Best Picks</Text>
                  <Text style={styles.sectionGroupCount}>{safeDishes.length} items</Text>
                </View>
                {safeDishes.map(renderDishCard)}
              </View>
            )}

            {warningDishes.length > 0 && (
              <View style={styles.sectionGroup}>
                <View style={styles.sectionGroupHeader}>
                  <Text style={styles.sectionGroupTitle}>Use Caution</Text>
                  <Text style={styles.sectionGroupCount}>{warningDishes.length} items</Text>
                </View>
                {warningDishes.map(renderDishCard)}
              </View>
            )}

            {unsafeDishes.length > 0 && (
              <View style={styles.sectionGroup}>
                <View style={styles.sectionGroupHeader}>
                  <Text style={styles.sectionGroupTitle}>Avoid</Text>
                  <Text style={styles.sectionGroupCount}>{unsafeDishes.length} items</Text>
                </View>
                {unsafeDishes.map(renderDishCard)}
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
            <View>
              <Text style={styles.listTitle}>Scan History</Text>
              <Text style={styles.listSubtitle}>{history.length} total scans</Text>
            </View>
            <View style={styles.clockWrap}>
              <Icon name="clock-rotate-left" size={22} color="#1DB954" solid />
            </View>
          </View>

          <View style={styles.searchWrap}>
            <Icon name="magnifying-glass" size={16} color="#6B7280" solid style={styles.searchIcon} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search restaurants..."
              placeholderTextColor="#6B7280"
              style={styles.searchInput}
            />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {filteredHistory.length === 0 ? (
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIconWrap}>
                <Icon name="clock-rotate-left" size={32} color="#4B5563" solid />
              </View>
              <Text style={styles.emptyTitle}>No scans found</Text>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? "Try a different search term."
                  : "Start scanning menus to build your history."}
              </Text>
              {!searchQuery && (
                <Pressable
                  style={styles.emptyBtn}
                  onPress={() => navigation.navigate("MenuUpload")}
                >
                  <Text style={styles.emptyBtnText}>Scan Your First Menu</Text>
                </Pressable>
              )}
            </View>
          ) : (
            filteredHistory.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => setSelectedScan(item)}
                style={styles.historyCard}
              >
                <View style={styles.historyCardTop}>
                  <View style={styles.historyCardBody}>
                    <Text style={styles.historyCardTitle}>{item.restaurantName}</Text>
                    <Text style={styles.historyCardMeta}>
                      {formatDate(item.date)} • {item.scanType.toUpperCase()}
                    </Text>

                    <View style={styles.historyStatsRow}>
                      <View style={styles.historyStatItem}>
                        <View style={[styles.dot, styles.dotSafe]} />
                        <Text style={styles.historyStatText}>{item.safeDishes} Safe</Text>
                      </View>
                      <View style={styles.historyStatItem}>
                        <View style={[styles.dot, styles.dotWarn]} />
                        <Text style={styles.historyStatText}>{item.warningDishes} Warning</Text>
                      </View>
                      <View style={styles.historyStatItem}>
                        <View style={[styles.dot, styles.dotUnsafe]} />
                        <Text style={styles.historyStatText}>{item.unsafeDishes} Unsafe</Text>
                      </View>
                    </View>
                  </View>

                  <Icon name="chevron-right" size={16} color="#6B7280" solid />
                </View>
              </Pressable>
            ))
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
