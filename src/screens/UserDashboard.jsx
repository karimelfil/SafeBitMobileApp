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
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome6";
import { getUserProfile } from "../api/user";
import styles from "./UserDashboard.styles";

const logo = require("../../assets/logo.png");

const mockRecentScans = [
  {
    id: 1,
    restaurantName: "Italian Bistro",
    date: "2025-11-14",
    safeItems: 8,
    warningItems: 2,
    unsafeItems: 1,
  },
  {
    id: 2,
    restaurantName: "Sushi Paradise",
    date: "2025-11-13",
    safeItems: 5,
    warningItems: 3,
    unsafeItems: 2,
  },
  {
    id: 3,
    restaurantName: "Burger House",
    date: "2025-11-12",
    safeItems: 12,
    warningItems: 1,
    unsafeItems: 0,
  },
  {
    id: 4,
    restaurantName: "Thai Kitchen",
    date: "2025-11-10",
    safeItems: 6,
    warningItems: 4,
    unsafeItems: 1,
  },
];

export default function UserDashboard({ navigation }) {
  const [firstName, setFirstName] = useState("");

  useFocusEffect(
    useCallback(() => {
      let active = true;

      (async () => {
        try {
          const storedUserId = await AsyncStorage.getItem("userId");
          if (!storedUserId) return;

          const profileRes = await getUserProfile(storedUserId);
          const profileData = profileRes?.data || profileRes;

          if (active) {
            setFirstName(String(profileData?.firstName || "").trim());
          }
        } catch (err) {
          if (active) {
            setFirstName("");
            if (err?.response?.status !== 401) {
              Alert.alert("Error", "Could not load your name.");
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

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
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
          <Text style={styles.sub}>Scan a menu to discover safe meals</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.scanCard}>
            <View style={styles.scanRow}>
              <View style={styles.scanIconBox}>
                <Icon name="qrcode" size={24} color="#FFFFFF" solid />
              </View>
              <View style={styles.scanTextWrap}>
                <Text style={styles.scanTitle}>Scan Menu</Text>
                <Text style={styles.scanSub}>Upload a photo or PDF</Text>
              </View>
            </View>

            <Pressable
              onPress={() => navigation.navigate("MenuUpload")}
              style={styles.scanBtn}
            >
              <Text style={styles.scanBtnText}>Start Scanning</Text>
            </Pressable>
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

          {mockRecentScans.map((scan) => (
            <Pressable
              key={scan.id}
              style={styles.scanItem}
              onPress={() => navigation.navigate("History")}
            >
              <Text style={styles.scanItemTitle}>{scan.restaurantName}</Text>
              <Text style={styles.scanItemDate}>
                {new Date(scan.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>

              <View style={styles.badgesRow}>
                <View style={styles.badgeWrap}>
                  <View style={[styles.dot, styles.dotSafe]} />
                  <Text style={styles.badgeText}>{scan.safeItems} Safe</Text>
                </View>

                <View style={styles.badgeWrap}>
                  <View style={[styles.dot, styles.dotWarn]} />
                  <Text style={styles.badgeText}>{scan.warningItems} Warning</Text>
                </View>

                <View style={styles.badgeWrap}>
                  <View style={[styles.dot, styles.dotUnsafe]} />
                  <Text style={styles.badgeText}>{scan.unsafeItems} Unsafe</Text>
                </View>
              </View>
            </Pressable>
          ))}

          <View style={styles.safetyCard}>
            <Text style={styles.safetyTitle}>Your Safety, Our Priority</Text>
            <Text style={styles.safetyBody}>
              We analyze every menu item against your personal health profile to
              keep you safe.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.bottomNav}>
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
