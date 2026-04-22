import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { FontAwesome6 as Icon } from "@expo/vector-icons";
import FancyBackButton from "../components/common/FancyBackButton";
import styles from "./RegistrationScreen.styles";

import { register } from "../api/auth";
import { getAllergies, getDiseases } from "../api/user";

const logo = require("../../assets/logo.png");

function CheckRow({ label, checked, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.checkRow}>
      <View style={[styles.checkBox, checked && styles.checkBoxOn]}>
        {checked ? <Icon name="check" size={11} color="#000000" solid /> : null}
      </View>
      <Text style={styles.checkLabel} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

function YesNo({ value, onChange }) {
  return (
    <View style={styles.yesNoRow}>
      <Pressable
        onPress={() => onChange(true)}
        style={[
          styles.yesNoBtn,
          value === true ? styles.yesNoBtnOn : styles.yesNoBtnOff,
        ]}
      >
        <Text style={[styles.yesNoTxt, value === true && styles.yesNoTxtOn]}>
          Yes
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onChange(false)}
        style={[
          styles.yesNoBtn,
          value === false ? styles.yesNoBtnOn : styles.yesNoBtnOff,
        ]}
      >
        <Text style={[styles.yesNoTxt, value === false && styles.yesNoTxtOn]}>
          No
        </Text>
      </Pressable>
    </View>
  );
}

export default function RegistrationScreen({ navigation }) {
  const [step, setStep] = useState("personal");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [dateOfBirth, setDateOfBirth] = useState("");
  const [dobDate, setDobDate] = useState(new Date());
  const [dobOpen, setDobOpen] = useState(false);

  const [gender, setGender] = useState(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [hasAllergies, setHasAllergies] = useState(null);
  const [hasDiseases, setHasDiseases] = useState(null);
  const [isPregnant, setIsPregnant] = useState(null);

  const [allergies, setAllergies] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [selectedAllergyIds, setSelectedAllergyIds] = useState([]);
  const [selectedDiseaseIds, setSelectedDiseaseIds] = useState([]);

  const [loadingLists, setLoadingLists] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingLists(true);
        const [a, d] = await Promise.all([getAllergies(), getDiseases()]);
        if (!mounted) return;
        setAllergies(a || []);
        setDiseases(d || []);
      } catch (e) {
        Alert.alert(
          "Error",
          e?.response?.data?.message ||
            e?.response?.data ||
            e?.message ||
            "Failed to load allergies/diseases"
        );
      } finally {
        if (mounted) setLoadingLists(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (gender !== 2) setIsPregnant(null);
  }, [gender]);

  function toggleId(id, setSelected) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function validatePersonal() {
    if (!email.trim()) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(email.trim())) return "Enter a valid email";
    if (!dateOfBirth.trim()) return "Date of birth is required";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth.trim()))
      return "DOB must be YYYY-MM-DD";
    if (!gender) return "Please select gender";
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!confirmPassword) return "Confirm password is required";
    if (confirmPassword !== password) return "Passwords do not match";
    return null;
  }

  function validateHealth() {
    if (hasAllergies === null) return "Please answer allergies question";
    if (hasDiseases === null) return "Please answer diseases question";
    if (gender === 2 && isPregnant === null)
      return "Please answer pregnancy question";
    return null;
  }

  async function submitRegister() {
    const err = validateHealth();
    if (err) {
      Alert.alert("Fix this", err);
      return;
    }

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      dateOfBirth: dateOfBirth.trim(),
      gender: gender,
      isPregnant: gender === 2 ? isPregnant === true : false,
      password,
      confirmPassword,
      allergyIds: hasAllergies ? selectedAllergyIds : [],
      diseaseIds: hasDiseases ? selectedDiseaseIds : [],
    };

    try {
      setSubmitting(true);
      await register(payload);
      Alert.alert("Success", "Registration successful! Please log in.");
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (e) {
      Alert.alert(
        "Register Error",
        e?.response?.data?.message ||
          e?.response?.data ||
          e?.message ||
          "Registration failed"
      );
    } finally {
      setSubmitting(false);
    }
  }

  function ProgressHeader() {
    const step2Active = step === "health";
    return (
      <View style={styles.progressWrap}>
        <View style={styles.progressItem}>
          <View style={[styles.circle, styles.circleOn]}>
            <Text style={styles.circleTxtOn}>1</Text>
          </View>
          <Text style={styles.progressLabelOn}>Personal</Text>
        </View>

        <View
          style={[styles.progressLine, step2Active && styles.progressLineOn]}
        />

        <View style={styles.progressItem}>
          <View
            style={[
              styles.circle,
              step2Active ? styles.circleOn : styles.circleOff,
            ]}
          >
            <Text style={step2Active ? styles.circleTxtOn : styles.circleTxtOff}>
              2
            </Text>
          </View>
          <Text
            style={
              step2Active ? styles.progressLabelOn : styles.progressLabelOff
            }
          >
            Health
          </Text>
        </View>
      </View>
    );
  }

  const scrollProps = {
    keyboardShouldPersistTaps: "handled",
    keyboardDismissMode: Platform.OS === "ios" ? "interactive" : "on-drag",
    contentContainerStyle: styles.scroll,
  };

  function PersonalStep() {
    const openDobPicker = () => {
      if (Platform.OS === "android") {
        DateTimePickerAndroid.open({
          value: dobDate,
          mode: "date",
          maximumDate: new Date(),
          onChange: (event, selectedDate) => {
            if (event.type !== "set" || !selectedDate) return;
            setDobDate(selectedDate);
            const yyyy = selectedDate.getFullYear();
            const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
            const dd = String(selectedDate.getDate()).padStart(2, "0");
            setDateOfBirth(`${yyyy}-${mm}-${dd}`);
          },
        });
        return;
      }

      setDobOpen(true);
    };

    return (
      <ScrollView {...scrollProps}>
        <FancyBackButton onPress={() => navigation.goBack()} label="Back" />

        <View style={styles.logoWrap}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>

        <ProgressHeader />

        <Text style={styles.h1}>Create Account</Text>
        <Text style={styles.sub}>Step 1: Personal Information</Text>

        <View style={styles.row2}>
          <View style={styles.rowHalf}>
            <Text style={styles.label}>First Name (Optional)</Text>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              style={styles.input}
              placeholder="Enter your first name"
              placeholderTextColor="#6B7280"
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View style={styles.rowHalf}>
            <Text style={styles.label}>Last Name (Optional)</Text>
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              style={styles.input}
              placeholder="Enter your last name"
              placeholderTextColor="#6B7280"
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>
        </View>

        <Text style={styles.label}>Email Address *</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholder="Enter your email address"
          placeholderTextColor="#6B7280"
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
        />

        <Text style={styles.label}>Phone Number (Optional)</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          placeholder="Enter your phone number"
          placeholderTextColor="#6B7280"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Date of Birth *</Text>
        <Pressable style={styles.inputBtn} onPress={openDobPicker}>
          <Text style={styles.inputBtnText}>
            {dateOfBirth ? dateOfBirth : "Select your date of birth"}
          </Text>
        </Pressable>

        {Platform.OS === "ios" && dobOpen && (
          <DateTimePicker
            value={dobDate}
            mode="date"
            display="spinner"
            maximumDate={new Date()}
            onChange={(_, selectedDate) => {
              if (!selectedDate) return;
              setDobDate(selectedDate);
              const yyyy = selectedDate.getFullYear();
              const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
              const dd = String(selectedDate.getDate()).padStart(2, "0");
              setDateOfBirth(`${yyyy}-${mm}-${dd}`);
            }}
          />
        )}

        <Text style={styles.label}>Gender *</Text>
        <View style={styles.genderRow}>
          <Pressable
            onPress={() => setGender(1)}
            style={[
              styles.genderCard,
              gender === 1 ? styles.genderCardOn : styles.genderCardOff,
            ]}
          >
            <Icon
              name="mars"
              size={26}
              color={gender === 1 ? "#1DB954" : "#9AA0A6"}
              solid
              style={styles.genderIcon}
            />
            <Text
              style={[styles.genderText, gender === 1 && styles.genderTextOn]}
            >
              Male
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setGender(2)}
            style={[
              styles.genderCard,
              gender === 2 ? styles.genderCardOn : styles.genderCardOff,
            ]}
          >
            <Icon
              name="venus"
              size={26}
              color={gender === 2 ? "#1DB954" : "#9AA0A6"}
              solid
              style={styles.genderIcon}
            />
            <Text
              style={[styles.genderText, gender === 2 && styles.genderTextOn]}
            >
              Female
            </Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Password *</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          placeholder="Create a strong password"
          placeholderTextColor="#6B7280"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Confirm Password *</Text>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
          placeholder="Confirm your password"
          placeholderTextColor="#6B7280"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Pressable
          onPress={() => {
            const err = validatePersonal();
            if (err) return Alert.alert("Fix this", err);
            setStep("health");
          }}
          style={styles.mainBtn}
        >
          <Text style={styles.mainBtnTxt}>Continue to Health Information</Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate("Login")}>
          <Text style={styles.bottomText}>
            Already have an account?{" "}
            <Text style={styles.bottomTextGreen}>Log In</Text>
          </Text>
        </Pressable>
      </ScrollView>
    );
  }

  function HealthStep() {
    return (
      <ScrollView {...scrollProps}>
        <FancyBackButton onPress={() => setStep("personal")} label="Back" />

        <ProgressHeader />

        <Text style={styles.h1}>Health Information</Text>
        <Text style={styles.sub2}>
          Help us personalize your experience and keep you safe
        </Text>

        <Text style={styles.q}>Do you have any food allergies?</Text>
        <YesNo
          value={hasAllergies}
          onChange={(v) => {
            setHasAllergies(v);
            if (v === false) setSelectedAllergyIds([]);
          }}
        />

        {hasAllergies === true && (
          <View style={styles.box}>
            <Text style={styles.boxTitle}>Select your allergies:</Text>

            {loadingLists ? (
              <ActivityIndicator />
            ) : (
              <ScrollView
                style={styles.boxList}
                contentContainerStyle={styles.twoCols}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
              >
                {allergies.map((a) => (
                  <View key={a.id} style={styles.colItem}>
                    <CheckRow
                      label={a.name}
                      checked={selectedAllergyIds.includes(a.id)}
                      onPress={() => toggleId(a.id, setSelectedAllergyIds)}
                    />
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        <Text style={[styles.q, styles.qSpaced]}>
          Do you suffer from any chronic food-related diseases?
        </Text>
        <YesNo
          value={hasDiseases}
          onChange={(v) => {
            setHasDiseases(v);
            if (v === false) setSelectedDiseaseIds([]);
          }}
        />

        {hasDiseases === true && (
          <View style={styles.box}>
            <Text style={styles.boxTitle}>Select your conditions:</Text>

            {loadingLists ? (
              <ActivityIndicator />
            ) : (
              <ScrollView
                style={styles.boxList}
                contentContainerStyle={styles.twoCols}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
              >
                {diseases.map((d) => (
                  <View key={d.id} style={styles.colItem}>
                    <CheckRow
                      label={d.name}
                      checked={selectedDiseaseIds.includes(d.id)}
                      onPress={() => toggleId(d.id, setSelectedDiseaseIds)}
                    />
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {gender === 2 && (
          <>
            <Text style={[styles.q, styles.qSpaced]}>
              Are you currently pregnant?
            </Text>
            <YesNo value={isPregnant} onChange={setIsPregnant} />
          </>
        )}

        <Pressable
          onPress={submitRegister}
          disabled={submitting}
          style={[styles.mainBtn, submitting && styles.mainBtnDisabled]}
        >
          {submitting ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.mainBtnTxt}>Complete Registration</Text>
          )}
        </Pressable>
      </ScrollView>
    );
  }

return (
  <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
    <KeyboardAvoidingView
      style={styles.keyboardWrap}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <View style={styles.container}>
        {step === "personal" ? PersonalStep() : HealthStep()}
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>
);

}
