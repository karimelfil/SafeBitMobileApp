import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../api/client";
import FancyBackButton from "../components/common/FancyBackButton";
import styles from "./ForgotPasswordScreen.styles";
const logo = require("../../assets/logo.png");

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => email.trim().length > 0 && !loading, [email, loading]);

  async function handleSend() {
    try {
      setLoading(true);
      await api.post("auth/forgot-password", { email: email.trim() });

      Alert.alert("Check your email", "If the email exists, a reset link has been sent.");



      navigation.goBack();
    } catch (err) {
      Alert.alert(
        "Error",
        err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          "Failed to send reset email"
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
          <FancyBackButton onPress={() => navigation.goBack()} label="Back to Login" />

          <View style={styles.header}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
            <Text style={styles.brand}>SafeBite</Text>
          </View>

          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.desc}>
            Enter your email and we&apos;ll send you a secure link{"\n"}to reset your password.
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="your.email@example.com"
              placeholderTextColor="#6B7280"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />

            <Pressable
              onPress={handleSend}
              disabled={!canSubmit}
              style={({ pressed }) => [
                styles.btn,
                !canSubmit && styles.disabled,
                pressed && canSubmit && styles.pressed,
              ]}
            >
              {loading ? <ActivityIndicator /> : <Text style={styles.btnText}>Send Reset Link</Text>}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

