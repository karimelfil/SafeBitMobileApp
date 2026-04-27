import React, { useCallback, useState } from "react";
import {
  Alert,
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome6 as Icon } from "@expo/vector-icons";
import { getScanHistory } from "../api/scan";
import { getUserProfile } from "../api/user";
import styles from "./UserDashboard.styles";

const logo = require("../../assets/logo.png");

export default function UserDashboard({ navigation }) {
  const insets = useSafeAreaInsets();
  const [firstName, setFirstName] = useState("");
  const [recentScans, setRecentScans] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      (async () => {
        try {
          const storedUserId = await AsyncStorage.getItem("userId");
          if (!storedUserId) return;

          const profileRes = await getUserProfile(storedUserId);
          const profileData = profileRes?.data || profileRes;
          const history = await getScanHistory();

          const sortedHistory = Array.isArray(history)
            ? [...history].sort(
                (a, b) => new Date(b?.ScanDate || 0).getTime() - new Date(a?.ScanDate || 0).getTime()
              )
            : [];

          if (active) {
            setFirstName(String(profileData?.firstName || "").trim());
            setRecentScans(sortedHistory.slice(0, 4));
          }
        } catch (err) {
          if (active) {
            setFirstName("");
            setRecentScans([]);
            if (err?.response?.status !== 401) {
              Alert.alert("Error", "Could not load your dashboard data.");
            }
          }
        }
      })();

      return () => {
        active = false;
      };
    }, [])
  );

  const greetingName = firstName || "User";
  const totalSafe = recentScans.reduce((total, scan) => total + Number(scan.SafeCount || 0), 0);
  const totalRisky = recentScans.reduce(
    (total, scan) => total + Number(scan.RiskyCount || 0) + Number(scan.UnsafeCount || 0),
    0
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.brandWrap}>
              <Image source={logo} style={styles.logo} resizeMode="contain" />
              <Text style={styles.brandText}>SafeBite</Text>
            </View>

            <Pressable
              onPress={() => navigation.navigate("Profile")}
              style={styles.profileBtn}
            >
              <Icon name="user" size={16} color="#000000" solid />
            </Pressable>
          </View>

          <Text style={styles.hello}>Hello, {greetingName}</Text>
          <Text style={styles.sub}>Choose meals with confidence from any menu.</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 106 + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.scanCard}>
            <View style={styles.scanRow}>
              <View style={styles.scanIconBox}>
                <Icon name="qrcode" size={24} color="#FFFFFF" solid />
              </View>
              <View style={styles.scanTextWrap}>
                <Text style={styles.scanTitle}>Scan a menu</Text>
                <Text style={styles.scanSub}>Upload a photo or PDF and get meal safety results.</Text>
              </View>
            </View>

            <Pressable
              onPress={() => navigation.navigate("MenuUpload")}
              style={styles.scanBtn}
            >
              <Icon name="camera" size={14} color="#000000" solid />
              <Text style={styles.scanBtnText}>Start Scanning</Text>
            </Pressable>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Icon name="shield-heart" size={16} color="#1DB954" solid />
              <View>
                <Text style={styles.summaryValue}>{totalSafe}</Text>
                <Text style={styles.summaryLabel}>Safe items</Text>
              </View>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Icon name="triangle-exclamation" size={16} color="#F59E0B" solid />
              <View>
                <Text style={styles.summaryValue}>{totalRisky}</Text>
                <Text style={styles.summaryLabel}>Need review</Text>
              </View>
            </View>
          </View>

          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Recent Scans</Text>
            <Pressable
              onPress={() => navigation.navigate("History")}
              style={styles.moreBtn}
            >
              <Text style={styles.moreBtnText}>...</Text>
            </Pressable>
          </View>

          {recentScans.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Icon name="receipt" size={18} color="#1DB954" solid />
              </View>
              <View style={styles.emptyTextWrap}>
                <Text style={styles.scanItemTitle}>No recent scans yet</Text>
                <Text style={styles.scanItemDate}>
                  Your latest menu checks will appear here.
                </Text>
              </View>
            </View>
          ) : (
            recentScans.map((scan) => (
              <Pressable
                key={scan.ScanID}
                style={styles.scanItem}
                onPress={() =>
                  navigation.navigate("History", {
                    initialScan: scan,
                  })
                }
              >
                <View style={styles.scanItemHeader}>
                  <View style={styles.scanItemIcon}>
                    <Icon name="utensils" size={14} color="#1DB954" solid />
                  </View>
                  <View style={styles.scanItemTextWrap}>
                    <Text style={styles.scanItemTitle} numberOfLines={1}>
                      {scan.RestaurantName}
                    </Text>
                    <Text style={styles.scanItemDate}>
                      {new Date(scan.ScanDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={12} color="#6B7280" solid />
                </View>

                <View style={styles.badgesRow}>
                  <View style={styles.badgeWrap}>
                    <View style={[styles.dot, styles.dotSafe]} />
                    <Text style={styles.badgeText}>{scan.SafeCount} Safe</Text>
                  </View>

                  <View style={styles.badgeWrap}>
                    <View style={[styles.dot, styles.dotWarn]} />
                    <Text style={styles.badgeText}>{scan.RiskyCount} Risky</Text>
                  </View>

                  <View style={styles.badgeWrap}>
                    <View style={[styles.dot, styles.dotUnsafe]} />
                    <Text style={styles.badgeText}>{scan.UnsafeCount} Unsafe</Text>
                  </View>
                </View>
              </Pressable>
            ))
          )}

          <View style={styles.safetyCard}>
            <Text style={styles.safetyTitle}>Your Safety, Our Priority</Text>
            <Text style={styles.safetyBody}>
              We analyze every menu item against your personal health profile to
              keep you safe.
            </Text>
          </View>
        </ScrollView>

        <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <Pressable style={styles.navItem}>
            <Icon name="house" size={18} color="#1DB954" solid />
            <Text style={styles.navLabelActive}>Home</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("MenuUpload")}
            style={styles.navCenterWrap}
          >
            <View style={styles.navCenterBtn}>
              <Icon name="upload" size={20} color="#000000" solid />
            </View>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("Profile")}
            style={styles.navItem}
          >
            <Icon name="user" size={18} color="#9CA3AF" solid />
            <Text style={styles.navLabel}>Profile</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
