import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../api/client";
import FancyBackButton from "../components/common/FancyBackButton";
import styles from "./ResetPasswordScreen.styles";
const logo = require("../../assets/logo.png");

export default function ResetPasswordScreen({ route, navigation }) {
  const token = route?.params?.token;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secure1, setSecure1] = useState(true);
  const [secure2, setSecure2] = useState(true);
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return newPassword.length > 0 && confirmPassword.length > 0 && !loading;
  }, [newPassword, confirmPassword, loading]);

  async function handleReset() {
    if (!token) {
      Alert.alert("Invalid Link", "Reset token is missing or invalid.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      await api.post("auth/reset-password", {
        token,
        newPassword,
        confirmPassword,
      });

      Alert.alert("Success", "Password reset successfully");

      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (err) {
      Alert.alert(
        "Error",
        err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          "Reset failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <FancyBackButton onPress={() => navigation.navigate("Login")} label="Back to Login" />

          <View style={styles.header}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
            <Text style={styles.brand}>SafeBite</Text>
          </View>

          <Text style={styles.title}>Set New Password</Text>
          <Text style={styles.desc}>
            Enter your new password and confirm it to finish resetting your account.
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.passwordWrap}>
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter your new password"
                placeholderTextColor="#6B7280"
                secureTextEntry={secure1}
                style={styles.passwordInput}
              />
              <Pressable onPress={() => setSecure1((s) => !s)} hitSlop={10} style={styles.eyeBtn}>
                <Text style={styles.eyeText}>{secure1 ? "ðŸ‘" : "ðŸ™ˆ"}</Text>
              </Pressable>
            </View>

            <Text style={[styles.label, styles.labelSpaced]}>Confirm Password</Text>
            <View style={styles.passwordWrap}>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                placeholderTextColor="#6B7280"
                secureTextEntry={secure2}
                style={styles.passwordInput}
              />
              <Pressable onPress={() => setSecure2((s) => !s)} hitSlop={10} style={styles.eyeBtn}>
                <Text style={styles.eyeText}>{secure2 ? "ðŸ‘" : "ðŸ™ˆ"}</Text>
              </Pressable>
            </View>

            <Pressable
              onPress={handleReset}
              disabled={!canSubmit}
              style={({ pressed }) => [
                styles.btn,
                !canSubmit && styles.disabled,
                pressed && canSubmit && styles.pressed,
              ]}
            >
              {loading ? <ActivityIndicator /> : <Text style={styles.btnText}>Reset Password</Text>}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

