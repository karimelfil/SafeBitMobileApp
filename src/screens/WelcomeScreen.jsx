import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./WelcomeScreen.styles";

const logo = require("../../assets/logo.png");

export default function WelcomeScreen({ navigation }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const logoFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(logoFade, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, slide, logoScale, logoFade]);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.content,
            { opacity: fade, transform: [{ translateY: slide }] },
          ]}
        >
          <Animated.Image
            source={logo}
            resizeMode="contain"
            style={[
              styles.logo,
              { opacity: logoFade, transform: [{ scale: logoScale }] },
            ]}
          />

          <Text style={styles.title}>Welcome to SafeBit</Text>

          <Text style={styles.subtitle}>
            Scan menus, detect ingredients instantly, and discover safe meals
            based on your dietary profile, allergies, and food sensitivities.
          </Text>

          <View style={styles.buttons}>
            <Pressable
              onPress={() => navigation.navigate("Login")}
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.primaryBtnText}>Log In</Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate("Register")}
              style={({ pressed }) => [
                styles.outlineBtn,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.outlineBtnText}>Create Account</Text>
            </Pressable>
          </View>
        </Animated.View>

        <Text style={styles.footer}>SafeBit - Your safety is our priority</Text>
      </View>
    </SafeAreaView>
  );
}
