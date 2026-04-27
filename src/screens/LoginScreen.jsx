import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome6 as Icon } from "@expo/vector-icons";
import { login } from "../api/auth";
import FancyBackButton from "../components/common/FancyBackButton";
import styles from "./LoginScreen.styles";

const logo = require("../../assets/logo.png");
const EMAIL_MAX_LENGTH = 254;
const PASSWORD_MAX_LENGTH = 16;

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.length > 0 && !loading;
  }, [email, password, loading]);

  function onBack() {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate("Welcome");
  }

  async function onSubmit() {
    const nextErrors = {};
    const cleanEmail = email.trim();

    if (!cleanEmail) nextErrors.email = "Email is required.";
    else if (cleanEmail.length > EMAIL_MAX_LENGTH)
      nextErrors.email = `Email cannot exceed ${EMAIL_MAX_LENGTH} characters.`;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail))
      nextErrors.email = "Enter a valid email address.";

    if (!password) nextErrors.password = "Password is required.";
    else if (password.length > PASSWORD_MAX_LENGTH)
      nextErrors.password = `Password cannot exceed ${PASSWORD_MAX_LENGTH} characters.`;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setLoading(true);

      const { role } = await login(email.trim(), password);

      if (role === "User") {
        navigation.reset({
          index: 0,
          routes: [{ name: "UserDashboard" }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        setErrors({ password: "Email or password is incorrect." });
      } else {
        setErrors({ form: "Something went wrong. Please try again." });
      }
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
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <FancyBackButton onPress={onBack} label="Back" />

          <View style={styles.header}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
            <Text style={styles.welcome}>Welcome Back</Text>
            <Text style={styles.desc}>
              Sign in to continue and explore safe meals{"\n"}
              tailored to you
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setErrors((current) => ({ ...current, email: undefined, form: undefined }));
              }}
              placeholder="Enter your email"
              placeholderTextColor="#6B7280"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              autoCorrect={false}
              maxLength={EMAIL_MAX_LENGTH}
              style={[styles.input, errors.email && styles.inputError]}
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

            <Text style={styles.passwordLabel}>Password</Text>
            <View style={[styles.passwordWrap, errors.password && styles.inputError]}>
              <TextInput
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  setErrors((current) => ({
                    ...current,
                    password: undefined,
                    form: undefined,
                  }));
                }}
                placeholder="Enter your password"
                placeholderTextColor="#6B7280"
                secureTextEntry={secure}
                style={styles.passwordInput}
                autoComplete="password"
                textContentType="password"
                maxLength={PASSWORD_MAX_LENGTH}
              />
              <Pressable
                onPress={() => setSecure((value) => !value)}
                hitSlop={10}
                style={styles.eyeBtn}
                accessibilityRole="button"
                accessibilityLabel={secure ? "Show password" : "Hide password"}
              >
                <Icon
                  name={secure ? "eye" : "eye-slash"}
                  size={18}
                  color="#9CA3AF"
                  solid
                />
              </Pressable>
            </View>
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}
            {errors.form ? <Text style={styles.errorText}>{errors.form}</Text> : null}

            <Pressable onPress={() => navigation.navigate("ForgotPassword")}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </Pressable>

            <Pressable
              onPress={onSubmit}
              disabled={!canSubmit}
              style={({ pressed }) => [
                styles.primaryBtn,
                !canSubmit && styles.disabled,
                pressed && canSubmit && styles.pressed,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.primaryBtnText}>Log In</Text>
              )}
            </Pressable>

            <Pressable onPress={() => navigation.navigate("Register")}>
              <Text style={styles.bottomLink}>
                Don&apos;t have an account?{" "}
                <Text style={styles.bottomLinkStrong}>Create one</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
