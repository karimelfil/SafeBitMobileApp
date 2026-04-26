import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
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
const EMAIL_MAX_LENGTH = 254;
const PHONE_MAX_LENGTH = 8;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 16;
const COUNTRIES = [
  { code: "+961", flag: "🇱🇧", name: "Lebanon" },
  { code: "+93", flag: "🇦🇫", name: "Afghanistan" },
  { code: "+355", flag: "🇦🇱", name: "Albania" },
  { code: "+213", flag: "🇩🇿", name: "Algeria" },
  { code: "+1-684", flag: "🇦🇸", name: "American Samoa" },
  { code: "+376", flag: "🇦🇩", name: "Andorra" },
  { code: "+244", flag: "🇦🇴", name: "Angola" },
  { code: "+1-264", flag: "🇦🇮", name: "Anguilla" },
  { code: "+1-268", flag: "🇦🇬", name: "Antigua and Barbuda" },
  { code: "+54", flag: "🇦🇷", name: "Argentina" },
  { code: "+374", flag: "🇦🇲", name: "Armenia" },
  { code: "+297", flag: "🇦🇼", name: "Aruba" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+43", flag: "🇦🇹", name: "Austria" },
  { code: "+994", flag: "🇦🇿", name: "Azerbaijan" },
  { code: "+1-242", flag: "🇧🇸", name: "Bahamas" },
  { code: "+973", flag: "🇧🇭", name: "Bahrain" },
  { code: "+880", flag: "🇧🇩", name: "Bangladesh" },
  { code: "+1-246", flag: "🇧🇧", name: "Barbados" },
  { code: "+375", flag: "🇧🇾", name: "Belarus" },
  { code: "+32", flag: "🇧🇪", name: "Belgium" },
  { code: "+501", flag: "🇧🇿", name: "Belize" },
  { code: "+229", flag: "🇧🇯", name: "Benin" },
  { code: "+1-441", flag: "🇧🇲", name: "Bermuda" },
  { code: "+975", flag: "🇧🇹", name: "Bhutan" },
  { code: "+591", flag: "🇧🇴", name: "Bolivia" },
  { code: "+387", flag: "🇧🇦", name: "Bosnia and Herzegovina" },
  { code: "+267", flag: "🇧🇼", name: "Botswana" },
  { code: "+55", flag: "🇧🇷", name: "Brazil" },
  { code: "+246", flag: "🇮🇴", name: "British Indian Ocean Territory" },
  { code: "+1-284", flag: "🇻🇬", name: "British Virgin Islands" },
  { code: "+673", flag: "🇧🇳", name: "Brunei" },
  { code: "+359", flag: "🇧🇬", name: "Bulgaria" },
  { code: "+226", flag: "🇧🇫", name: "Burkina Faso" },
  { code: "+257", flag: "🇧🇮", name: "Burundi" },
  { code: "+855", flag: "🇰🇭", name: "Cambodia" },
  { code: "+237", flag: "🇨🇲", name: "Cameroon" },
  { code: "+1", flag: "🇨🇦", name: "Canada" },
  { code: "+238", flag: "🇨🇻", name: "Cape Verde" },
  { code: "+1-345", flag: "🇰🇾", name: "Cayman Islands" },
  { code: "+236", flag: "🇨🇫", name: "Central African Republic" },
  { code: "+235", flag: "🇹🇩", name: "Chad" },
  { code: "+56", flag: "🇨🇱", name: "Chile" },
  { code: "+86", flag: "🇨🇳", name: "China" },
  { code: "+61", flag: "🇨🇽", name: "Christmas Island" },
  { code: "+61", flag: "🇨🇨", name: "Cocos Islands" },
  { code: "+57", flag: "🇨🇴", name: "Colombia" },
  { code: "+269", flag: "🇰🇲", name: "Comoros" },
  { code: "+682", flag: "🇨🇰", name: "Cook Islands" },
  { code: "+506", flag: "🇨🇷", name: "Costa Rica" },
  { code: "+385", flag: "🇭🇷", name: "Croatia" },
  { code: "+53", flag: "🇨🇺", name: "Cuba" },
  { code: "+599", flag: "🇨🇼", name: "Curacao" },
  { code: "+357", flag: "🇨🇾", name: "Cyprus" },
  { code: "+420", flag: "🇨🇿", name: "Czech Republic" },
  { code: "+243", flag: "🇨🇩", name: "Democratic Republic of the Congo" },
  { code: "+45", flag: "🇩🇰", name: "Denmark" },
  { code: "+253", flag: "🇩🇯", name: "Djibouti" },
  { code: "+1-767", flag: "🇩🇲", name: "Dominica" },
  { code: "+1-809", flag: "🇩🇴", name: "Dominican Republic" },
  { code: "+1-829", flag: "🇩🇴", name: "Dominican Republic" },
  { code: "+1-849", flag: "🇩🇴", name: "Dominican Republic" },
  { code: "+670", flag: "🇹🇱", name: "East Timor" },
  { code: "+593", flag: "🇪🇨", name: "Ecuador" },
  { code: "+20", flag: "🇪🇬", name: "Egypt" },
  { code: "+503", flag: "🇸🇻", name: "El Salvador" },
  { code: "+240", flag: "🇬🇶", name: "Equatorial Guinea" },
  { code: "+291", flag: "🇪🇷", name: "Eritrea" },
  { code: "+372", flag: "🇪🇪", name: "Estonia" },
  { code: "+251", flag: "🇪🇹", name: "Ethiopia" },
  { code: "+500", flag: "🇫🇰", name: "Falkland Islands" },
  { code: "+298", flag: "🇫🇴", name: "Faroe Islands" },
  { code: "+679", flag: "🇫🇯", name: "Fiji" },
  { code: "+358", flag: "🇫🇮", name: "Finland" },
  { code: "+33", flag: "🇫🇷", name: "France" },
  { code: "+594", flag: "🇬🇫", name: "French Guiana" },
  { code: "+689", flag: "🇵🇫", name: "French Polynesia" },
  { code: "+241", flag: "🇬🇦", name: "Gabon" },
  { code: "+220", flag: "🇬🇲", name: "Gambia" },
  { code: "+995", flag: "🇬🇪", name: "Georgia" },
  { code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "+233", flag: "🇬🇭", name: "Ghana" },
  { code: "+350", flag: "🇬🇮", name: "Gibraltar" },
  { code: "+30", flag: "🇬🇷", name: "Greece" },
  { code: "+299", flag: "🇬🇱", name: "Greenland" },
  { code: "+1-473", flag: "🇬🇩", name: "Grenada" },
  { code: "+590", flag: "🇬🇵", name: "Guadeloupe" },
  { code: "+1-671", flag: "🇬🇺", name: "Guam" },
  { code: "+502", flag: "🇬🇹", name: "Guatemala" },
  { code: "+44-1481", flag: "🇬🇬", name: "Guernsey" },
  { code: "+224", flag: "🇬🇳", name: "Guinea" },
  { code: "+245", flag: "🇬🇼", name: "Guinea-Bissau" },
  { code: "+592", flag: "🇬🇾", name: "Guyana" },
  { code: "+509", flag: "🇭🇹", name: "Haiti" },
  { code: "+504", flag: "🇭🇳", name: "Honduras" },
  { code: "+852", flag: "🇭🇰", name: "Hong Kong" },
  { code: "+36", flag: "🇭🇺", name: "Hungary" },
  { code: "+354", flag: "🇮🇸", name: "Iceland" },
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+62", flag: "🇮🇩", name: "Indonesia" },
  { code: "+98", flag: "🇮🇷", name: "Iran" },
  { code: "+964", flag: "🇮🇶", name: "Iraq" },
  { code: "+353", flag: "🇮🇪", name: "Ireland" },
  { code: "+44-1624", flag: "🇮🇲", name: "Isle of Man" },
  { code: "+39", flag: "🇮🇹", name: "Italy" },
  { code: "+225", flag: "🇨🇮", name: "Ivory Coast" },
  { code: "+1-876", flag: "🇯🇲", name: "Jamaica" },
  { code: "+81", flag: "🇯🇵", name: "Japan" },
  { code: "+44-1534", flag: "🇯🇪", name: "Jersey" },
  { code: "+962", flag: "🇯🇴", name: "Jordan" },
  { code: "+7", flag: "🇰🇿", name: "Kazakhstan" },
  { code: "+254", flag: "🇰🇪", name: "Kenya" },
  { code: "+686", flag: "🇰🇮", name: "Kiribati" },
  { code: "+383", flag: "🇽🇰", name: "Kosovo" },
  { code: "+965", flag: "🇰🇼", name: "Kuwait" },
  { code: "+996", flag: "🇰🇬", name: "Kyrgyzstan" },
  { code: "+856", flag: "🇱🇦", name: "Laos" },
  { code: "+371", flag: "🇱🇻", name: "Latvia" },
  { code: "+266", flag: "🇱🇸", name: "Lesotho" },
  { code: "+231", flag: "🇱🇷", name: "Liberia" },
  { code: "+218", flag: "🇱🇾", name: "Libya" },
  { code: "+423", flag: "🇱🇮", name: "Liechtenstein" },
  { code: "+370", flag: "🇱🇹", name: "Lithuania" },
  { code: "+352", flag: "🇱🇺", name: "Luxembourg" },
  { code: "+853", flag: "🇲🇴", name: "Macau" },
  { code: "+389", flag: "🇲🇰", name: "North Macedonia" },
  { code: "+261", flag: "🇲🇬", name: "Madagascar" },
  { code: "+265", flag: "🇲🇼", name: "Malawi" },
  { code: "+60", flag: "🇲🇾", name: "Malaysia" },
  { code: "+960", flag: "🇲🇻", name: "Maldives" },
  { code: "+223", flag: "🇲🇱", name: "Mali" },
  { code: "+356", flag: "🇲🇹", name: "Malta" },
  { code: "+692", flag: "🇲🇭", name: "Marshall Islands" },
  { code: "+596", flag: "🇲🇶", name: "Martinique" },
  { code: "+222", flag: "🇲🇷", name: "Mauritania" },
  { code: "+230", flag: "🇲🇺", name: "Mauritius" },
  { code: "+262", flag: "🇾🇹", name: "Mayotte" },
  { code: "+52", flag: "🇲🇽", name: "Mexico" },
  { code: "+691", flag: "🇫🇲", name: "Micronesia" },
  { code: "+373", flag: "🇲🇩", name: "Moldova" },
  { code: "+377", flag: "🇲🇨", name: "Monaco" },
  { code: "+976", flag: "🇲🇳", name: "Mongolia" },
  { code: "+382", flag: "🇲🇪", name: "Montenegro" },
  { code: "+1-664", flag: "🇲🇸", name: "Montserrat" },
  { code: "+212", flag: "🇲🇦", name: "Morocco" },
  { code: "+258", flag: "🇲🇿", name: "Mozambique" },
  { code: "+95", flag: "🇲🇲", name: "Myanmar" },
  { code: "+264", flag: "🇳🇦", name: "Namibia" },
  { code: "+674", flag: "🇳🇷", name: "Nauru" },
  { code: "+977", flag: "🇳🇵", name: "Nepal" },
  { code: "+31", flag: "🇳🇱", name: "Netherlands" },
  { code: "+687", flag: "🇳🇨", name: "New Caledonia" },
  { code: "+64", flag: "🇳🇿", name: "New Zealand" },
  { code: "+505", flag: "🇳🇮", name: "Nicaragua" },
  { code: "+227", flag: "🇳🇪", name: "Niger" },
  { code: "+234", flag: "🇳🇬", name: "Nigeria" },
  { code: "+683", flag: "🇳🇺", name: "Niue" },
  { code: "+672", flag: "🇳🇫", name: "Norfolk Island" },
  { code: "+850", flag: "🇰🇵", name: "North Korea" },
  { code: "+1-670", flag: "🇲🇵", name: "Northern Mariana Islands" },
  { code: "+47", flag: "🇳🇴", name: "Norway" },
  { code: "+968", flag: "🇴🇲", name: "Oman" },
  { code: "+92", flag: "🇵🇰", name: "Pakistan" },
  { code: "+680", flag: "🇵🇼", name: "Palau" },
  { code: "+970", flag: "🇵🇸", name: "Palestine" },
  { code: "+507", flag: "🇵🇦", name: "Panama" },
  { code: "+675", flag: "🇵🇬", name: "Papua New Guinea" },
  { code: "+595", flag: "🇵🇾", name: "Paraguay" },
  { code: "+51", flag: "🇵🇪", name: "Peru" },
  { code: "+63", flag: "🇵🇭", name: "Philippines" },
  { code: "+48", flag: "🇵🇱", name: "Poland" },
  { code: "+351", flag: "🇵🇹", name: "Portugal" },
  { code: "+1-787", flag: "🇵🇷", name: "Puerto Rico" },
  { code: "+1-939", flag: "🇵🇷", name: "Puerto Rico" },
  { code: "+974", flag: "🇶🇦", name: "Qatar" },
  { code: "+242", flag: "🇨🇬", name: "Republic of the Congo" },
  { code: "+262", flag: "🇷🇪", name: "Reunion" },
  { code: "+40", flag: "🇷🇴", name: "Romania" },
  { code: "+7", flag: "🇷🇺", name: "Russia" },
  { code: "+250", flag: "🇷🇼", name: "Rwanda" },
  { code: "+590", flag: "🇧🇱", name: "Saint Barthelemy" },
  { code: "+290", flag: "🇸🇭", name: "Saint Helena" },
  { code: "+1-869", flag: "🇰🇳", name: "Saint Kitts and Nevis" },
  { code: "+1-758", flag: "🇱🇨", name: "Saint Lucia" },
  { code: "+590", flag: "🇲🇫", name: "Saint Martin" },
  { code: "+508", flag: "🇵🇲", name: "Saint Pierre and Miquelon" },
  { code: "+1-784", flag: "🇻🇨", name: "Saint Vincent and the Grenadines" },
  { code: "+685", flag: "🇼🇸", name: "Samoa" },
  { code: "+378", flag: "🇸🇲", name: "San Marino" },
  { code: "+239", flag: "🇸🇹", name: "Sao Tome and Principe" },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+221", flag: "🇸🇳", name: "Senegal" },
  { code: "+381", flag: "🇷🇸", name: "Serbia" },
  { code: "+248", flag: "🇸🇨", name: "Seychelles" },
  { code: "+232", flag: "🇸🇱", name: "Sierra Leone" },
  { code: "+65", flag: "🇸🇬", name: "Singapore" },
  { code: "+1-721", flag: "🇸🇽", name: "Sint Maarten" },
  { code: "+421", flag: "🇸🇰", name: "Slovakia" },
  { code: "+386", flag: "🇸🇮", name: "Slovenia" },
  { code: "+677", flag: "🇸🇧", name: "Solomon Islands" },
  { code: "+252", flag: "🇸🇴", name: "Somalia" },
  { code: "+27", flag: "🇿🇦", name: "South Africa" },
  { code: "+82", flag: "🇰🇷", name: "South Korea" },
  { code: "+211", flag: "🇸🇸", name: "South Sudan" },
  { code: "+34", flag: "🇪🇸", name: "Spain" },
  { code: "+94", flag: "🇱🇰", name: "Sri Lanka" },
  { code: "+249", flag: "🇸🇩", name: "Sudan" },
  { code: "+597", flag: "🇸🇷", name: "Suriname" },
  { code: "+47", flag: "🇸🇯", name: "Svalbard and Jan Mayen" },
  { code: "+268", flag: "🇸🇿", name: "Eswatini" },
  { code: "+46", flag: "🇸🇪", name: "Sweden" },
  { code: "+41", flag: "🇨🇭", name: "Switzerland" },
  { code: "+963", flag: "🇸🇾", name: "Syria" },
  { code: "+886", flag: "🇹🇼", name: "Taiwan" },
  { code: "+992", flag: "🇹🇯", name: "Tajikistan" },
  { code: "+255", flag: "🇹🇿", name: "Tanzania" },
  { code: "+66", flag: "🇹🇭", name: "Thailand" },
  { code: "+228", flag: "🇹🇬", name: "Togo" },
  { code: "+690", flag: "🇹🇰", name: "Tokelau" },
  { code: "+676", flag: "🇹🇴", name: "Tonga" },
  { code: "+1-868", flag: "🇹🇹", name: "Trinidad and Tobago" },
  { code: "+216", flag: "🇹🇳", name: "Tunisia" },
  { code: "+90", flag: "🇹🇷", name: "Turkey" },
  { code: "+993", flag: "🇹🇲", name: "Turkmenistan" },
  { code: "+1-649", flag: "🇹🇨", name: "Turks and Caicos Islands" },
  { code: "+688", flag: "🇹🇻", name: "Tuvalu" },
  { code: "+1-340", flag: "🇻🇮", name: "U.S. Virgin Islands" },
  { code: "+256", flag: "🇺🇬", name: "Uganda" },
  { code: "+380", flag: "🇺🇦", name: "Ukraine" },
  { code: "+1", flag: "🇺🇸", name: "United States" },
  { code: "+971", flag: "🇦🇪", name: "United Arab Emirates" },
  { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+598", flag: "🇺🇾", name: "Uruguay" },
  { code: "+998", flag: "🇺🇿", name: "Uzbekistan" },
  { code: "+678", flag: "🇻🇺", name: "Vanuatu" },
  { code: "+379", flag: "🇻🇦", name: "Vatican City" },
  { code: "+58", flag: "🇻🇪", name: "Venezuela" },
  { code: "+84", flag: "🇻🇳", name: "Vietnam" },
  { code: "+681", flag: "🇼🇫", name: "Wallis and Futuna" },
  { code: "+212", flag: "🇪🇭", name: "Western Sahara" },
  { code: "+967", flag: "🇾🇪", name: "Yemen" },
  { code: "+260", flag: "🇿🇲", name: "Zambia" },
  { code: "+263", flag: "🇿🇼", name: "Zimbabwe" },
];

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

function getPasswordChecks(value) {
  return {
    length: value.length >= PASSWORD_MIN_LENGTH,
    uppercase: /[A-Z]/.test(value),
    lowercase: /[a-z]/.test(value),
    number: /\d/.test(value),
    max: value.length <= PASSWORD_MAX_LENGTH,
  };
}

function normalizePhoneDigits(value) {
  return String(value || "").replace(/[^\d]/g, "");
}

function isValidLebaneseSubscriberNumber(value) {
  const digits = normalizePhoneDigits(value);
  if (!digits) return true;
  if (!/^\d{7,8}$/.test(digits)) return false;
  return !digits.startsWith("0");
}

function isValidGenericSubscriberNumber(value) {
  const digits = normalizePhoneDigits(value);
  if (!digits) return true;
  return /^\d{6,15}$/.test(digits);
}

export default function RegistrationScreen({ navigation }) {
  const [step, setStep] = useState("personal");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);

  const [dateOfBirth, setDateOfBirth] = useState("");
  const [dobDate, setDobDate] = useState(new Date());
  const [dobOpen, setDobOpen] = useState(false);

  const [gender, setGender] = useState(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSecure, setPasswordSecure] = useState(true);
  const [confirmPasswordSecure, setConfirmPasswordSecure] = useState(true);

  const [hasAllergies, setHasAllergies] = useState(null);
  const [hasDiseases, setHasDiseases] = useState(null);
  const [isPregnant, setIsPregnant] = useState(null);

  const [allergies, setAllergies] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [selectedAllergyIds, setSelectedAllergyIds] = useState([]);
  const [selectedDiseaseIds, setSelectedDiseaseIds] = useState([]);
  const [allergySearch, setAllergySearch] = useState("");
  const [diseaseSearch, setDiseaseSearch] = useState("");
  const [allergyDropdownOpen, setAllergyDropdownOpen] = useState(false);
  const [diseaseDropdownOpen, setDiseaseDropdownOpen] = useState(false);

  const [loadingLists, setLoadingLists] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [personalErrors, setPersonalErrors] = useState({});
  const [healthErrors, setHealthErrors] = useState({});
  const [showPersonalAlert, setShowPersonalAlert] = useState(false);
  const [showHealthAlert, setShowHealthAlert] = useState(false);

  const passwordChecks = getPasswordChecks(password);
  const canSubmitHealth =
    hasAllergies !== null &&
    hasDiseases !== null &&
    (hasAllergies === false || selectedAllergyIds.length > 0) &&
    (hasDiseases === false || selectedDiseaseIds.length > 0) &&
    (gender !== 2 || isPregnant !== null) &&
    !submitting;
  const selectedAllergyOptions = selectedAllergyIds
    .map((id) => allergies.find((item) => item.id === id))
    .filter(Boolean);

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

  function getSearchRank(name, query) {
    const label = String(name || "").toLowerCase();
    const search = String(query || "").trim().toLowerCase();
    if (!search) return 0;
    if (label === search) return 0;
    if (label.startsWith(search)) return 1;
    if (label.includes(search)) return 2;
    return 3;
  }

  function getFilteredOptions(options, query) {
    const search = String(query || "").trim().toLowerCase();
    return [...options]
      .filter((item) => !search || String(item.name || "").toLowerCase().includes(search))
      .sort((a, b) => {
        const rankDiff = getSearchRank(a.name, search) - getSearchRank(b.name, search);
        if (rankDiff !== 0) return rankDiff;
        return String(a.name || "").localeCompare(String(b.name || ""));
      });
  }

  function validatePersonalFields() {
    const nextErrors = {};
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();

    if (!cleanEmail) nextErrors.email = "Email is required.";
    else if (cleanEmail.length > EMAIL_MAX_LENGTH)
      nextErrors.email = `Email cannot exceed ${EMAIL_MAX_LENGTH} characters.`;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail))
      nextErrors.email = "Enter a valid email address.";

    if (
      country.code === "+961" &&
      cleanPhone &&
      !isValidLebaneseSubscriberNumber(cleanPhone)
    ) {
      nextErrors.phone = "Enter a valid Lebanese number, e.g. 3 123 456 or 71 123 456.";
    } else if (
      country.code !== "+961" &&
      cleanPhone &&
      !isValidGenericSubscriberNumber(cleanPhone)
    ) {
      nextErrors.phone = "Enter a valid phone number.";
    }

    if (!dateOfBirth.trim()) nextErrors.dateOfBirth = "Date of birth is required.";
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth.trim()))
      nextErrors.dateOfBirth = "Use the YYYY-MM-DD format.";

    if (!gender) nextErrors.gender = "Please select your gender.";

    if (!password) nextErrors.password = "Password is required.";
    else if (password.length > PASSWORD_MAX_LENGTH)
      nextErrors.password = `Password cannot exceed ${PASSWORD_MAX_LENGTH} characters.`;
    else if (
      !passwordChecks.length ||
      !passwordChecks.uppercase ||
      !passwordChecks.lowercase ||
      !passwordChecks.number
    )
      nextErrors.password = "Password must meet all security requirements.";

    if (!confirmPassword) nextErrors.confirmPassword = "Confirm password is required.";
    else if (confirmPassword !== password)
      nextErrors.confirmPassword = "Passwords do not match.";

    return nextErrors;
  }

  function validateHealthFields() {
    const nextErrors = {};
    if (hasAllergies === null) nextErrors.hasAllergies = "Please answer this question.";
    else if (hasAllergies === true && selectedAllergyIds.length === 0)
      nextErrors.allergies = "Select at least one allergy.";
    if (hasDiseases === null) nextErrors.hasDiseases = "Please answer this question.";
    else if (hasDiseases === true && selectedDiseaseIds.length === 0)
      nextErrors.diseases = "Select at least one condition.";
    if (gender === 2 && isPregnant === null)
      nextErrors.isPregnant = "Please answer this question.";
    return nextErrors;
  }

  async function submitRegister() {
    const nextErrors = validateHealthFields();
    setHealthErrors(nextErrors);
    setShowHealthAlert(Object.keys(nextErrors).length > 0);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const fullPhone = phone.trim() ? `${country.code}${phone.trim()}` : "";
    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: fullPhone,
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
    style: styles.scrollView,
    keyboardShouldPersistTaps: "handled",
    keyboardDismissMode: Platform.OS === "ios" ? "interactive" : "on-drag",
    contentContainerStyle: styles.scroll,
  };

  function updateField(field, value, setter) {
    setter(value);
    setPersonalErrors((current) => ({ ...current, [field]: undefined }));
    setShowPersonalAlert(false);
  }

  function ErrorText({ message }) {
    if (!message) return null;
    return <Text style={styles.errorText}>{message}</Text>;
  }

  function PasswordRule({ met, label }) {
    return (
      <View style={styles.passwordRule}>
        <Icon
          name={met ? "circle-check" : "circle"}
          size={12}
          color={met ? "#1DB954" : "#6B7280"}
          solid
        />
        <Text style={[styles.passwordRuleText, met && styles.passwordRuleTextMet]}>
          {label}
        </Text>
      </View>
    );
  }

  function PersonalStep() {
    const openDobPicker = () => {
      if (Platform.OS === "android") {
        setDobOpen(true);
        DateTimePickerAndroid.open({
          value: dobDate,
          mode: "date",
          maximumDate: new Date(),
          onChange: (event, selectedDate) => {
            if (event.type !== "set" || !selectedDate) {
              setDobOpen(false);
              return;
            }
            setDobDate(selectedDate);
            const yyyy = selectedDate.getFullYear();
            const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
            const dd = String(selectedDate.getDate()).padStart(2, "0");
            setDateOfBirth(`${yyyy}-${mm}-${dd}`);
            setPersonalErrors((current) => ({ ...current, dateOfBirth: undefined }));
            setShowPersonalAlert(false);
            setDobOpen(false);
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
              maxLength={50}
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
              maxLength={50}
            />
          </View>
        </View>

        <Text style={styles.label}>Email Address *</Text>
        <TextInput
          value={email}
          onChangeText={(value) => updateField("email", value, setEmail)}
          style={[styles.input, personalErrors.email && styles.inputError]}
          placeholder="Enter your email address"
          placeholderTextColor="#6B7280"
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          maxLength={EMAIL_MAX_LENGTH}
        />
        <ErrorText message={personalErrors.email} />

        <Text style={styles.label}>Phone Number (Optional)</Text>
        <View style={[styles.phoneWrap, personalErrors.phone && styles.inputError]}>
          <Pressable
            style={styles.countryBtn}
            onPress={() => setCountryPickerOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Select country code"
          >
            <Text style={styles.countryFlag}>{country.flag}</Text>
            <Text style={styles.countryCode}>{country.code}</Text>
            <Icon name="chevron-down" size={12} color="#9CA3AF" solid />
          </Pressable>
          <TextInput
            value={phone}
            onChangeText={(value) =>
              updateField("phone", value.replace(/[^\d]/g, ""), setPhone)
            }
            style={styles.phoneInput}
            placeholder={country.code === "+961" ? "3 123 456" : "Phone number"}
            placeholderTextColor="#6B7280"
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            autoComplete="tel"
            maxLength={country.code === "+961" ? PHONE_MAX_LENGTH : 15}
          />
        </View>
        <ErrorText message={personalErrors.phone} />

        <Text style={styles.label}>Date of Birth *</Text>
        <Pressable
          style={[
            styles.inputBtn,
            dobOpen && styles.inputBtnFocused,
            personalErrors.dateOfBirth && styles.inputError,
          ]}
          onPress={openDobPicker}
          accessibilityRole="button"
          accessibilityLabel="Select date of birth"
        >
          <Text style={styles.inputBtnText} numberOfLines={1}>
            {dateOfBirth ? dateOfBirth : "Select your date of birth"}
          </Text>
          {dobOpen ? (
            <Pressable
              style={styles.dateDoneBtn}
              onPress={() => setDobOpen(false)}
              accessibilityRole="button"
              accessibilityLabel="Confirm date of birth"
            >
              <Text style={styles.dateDoneText}>Done</Text>
            </Pressable>
          ) : (
            <Icon name="calendar-days" size={17} color="#9CA3AF" solid />
          )}
        </Pressable>
        <ErrorText message={personalErrors.dateOfBirth} />

        {Platform.OS === "ios" && dobOpen && (
          <DateTimePicker
            value={dobDate}
            mode="date"
            display="spinner"
            textColor="#FFFFFF"
            themeVariant="dark"
            maximumDate={new Date()}
            onChange={(_, selectedDate) => {
          if (!selectedDate) return;
          setDobDate(selectedDate);
          const yyyy = selectedDate.getFullYear();
          const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
          const dd = String(selectedDate.getDate()).padStart(2, "0");
          setDateOfBirth(`${yyyy}-${mm}-${dd}`);
          setPersonalErrors((current) => ({ ...current, dateOfBirth: undefined }));
          setShowPersonalAlert(false);
        }}
      />
    )}

        <Text style={styles.label}>Gender *</Text>
        <View style={styles.genderRow}>
          <Pressable
            onPress={() => {
              setGender(1);
              setPersonalErrors((current) => ({ ...current, gender: undefined }));
              setShowPersonalAlert(false);
            }}
            style={[
              styles.genderCard,
              gender === 1 ? styles.genderCardOn : styles.genderCardOff,
              personalErrors.gender && styles.genderCardError,
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
            onPress={() => {
              setGender(2);
              setPersonalErrors((current) => ({ ...current, gender: undefined }));
              setShowPersonalAlert(false);
            }}
            style={[
              styles.genderCard,
              gender === 2 ? styles.genderCardOn : styles.genderCardOff,
              personalErrors.gender && styles.genderCardError,
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
        <ErrorText message={personalErrors.gender} />

        <Text style={styles.label}>Password *</Text>
        <View style={[styles.passwordWrap, personalErrors.password && styles.inputError]}>
          <TextInput
            value={password}
            onChangeText={(value) => updateField("password", value, setPassword)}
            style={styles.passwordInput}
            placeholder="Create a strong password"
            placeholderTextColor="#6B7280"
            secureTextEntry={passwordSecure}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="newPassword"
            autoComplete="new-password"
            passwordRules="minlength: 8; maxlength: 16; required: upper; required: lower; required: digit;"
            maxLength={PASSWORD_MAX_LENGTH}
          />
          <Pressable
            onPress={() => setPasswordSecure((value) => !value)}
            hitSlop={10}
            style={styles.eyeBtn}
            accessibilityRole="button"
            accessibilityLabel={passwordSecure ? "Show password" : "Hide password"}
          >
            <Icon
              name={passwordSecure ? "eye" : "eye-slash"}
              size={18}
              color="#9CA3AF"
              solid
            />
          </Pressable>
        </View>
        <View style={styles.passwordRules}>
          <PasswordRule met={passwordChecks.length} label="At least 8 characters" />
          <PasswordRule met={passwordChecks.uppercase} label="One uppercase letter" />
          <PasswordRule met={passwordChecks.lowercase} label="One lowercase letter" />
          <PasswordRule met={passwordChecks.number} label="One number" />
          <PasswordRule
            met={passwordChecks.max}
            label={`No more than ${PASSWORD_MAX_LENGTH} characters`}
          />
        </View>
        <ErrorText message={personalErrors.password} />

        <Text style={styles.label}>Confirm Password *</Text>
        <View
          style={[styles.passwordWrap, personalErrors.confirmPassword && styles.inputError]}
        >
          <TextInput
            value={confirmPassword}
            onChangeText={(value) =>
              updateField("confirmPassword", value, setConfirmPassword)
            }
            style={styles.passwordInput}
            placeholder="Confirm your password"
            placeholderTextColor="#6B7280"
            secureTextEntry={confirmPasswordSecure}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="newPassword"
            autoComplete="new-password"
            maxLength={PASSWORD_MAX_LENGTH}
          />
          <Pressable
            onPress={() => setConfirmPasswordSecure((value) => !value)}
            hitSlop={10}
            style={styles.eyeBtn}
            accessibilityRole="button"
            accessibilityLabel={
              confirmPasswordSecure ? "Show confirm password" : "Hide confirm password"
            }
          >
            <Icon
              name={confirmPasswordSecure ? "eye" : "eye-slash"}
              size={18}
              color="#9CA3AF"
              solid
            />
          </Pressable>
        </View>
        <ErrorText message={personalErrors.confirmPassword} />

        {showPersonalAlert && (
          <View style={styles.inlineAlert}>
            <Icon name="triangle-exclamation" size={14} color="#FCA5A5" solid />
            <Text style={styles.inlineAlertText}>
              Please correct the highlighted fields.
            </Text>
          </View>
        )}

        <Pressable
          onPress={() => {
            const nextErrors = validatePersonalFields();
            setPersonalErrors(nextErrors);
            setShowPersonalAlert(Object.keys(nextErrors).length > 0);
            if (Object.keys(nextErrors).length > 0) return;
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
          Your health information is kept confidential and used only to provide safe meal recommendations.
        </Text>

        <Text style={styles.q}>Do you have any food allergies?</Text>
        <YesNo
          value={hasAllergies}
          onChange={(v) => {
            setHasAllergies(v);
            setHealthErrors((current) => ({ ...current, hasAllergies: undefined }));
            setShowHealthAlert(false);
            setAllergyDropdownOpen(v === true);
            if (v === false) {
              setSelectedAllergyIds([]);
              setAllergySearch("");
            }
          }}
        />
        <ErrorText message={healthErrors.hasAllergies} />

        {hasAllergies === true && (
          <View
            style={[
              styles.allergyDropdown,
              !allergyDropdownOpen && styles.allergyDropdownClosed,
            ]}
          >
            <Pressable
              style={styles.allergyDropdownHeader}
              onPress={() => setAllergyDropdownOpen((open) => !open)}
            >
              <View style={styles.allergyDropdownTitleRow}>
                <Text style={styles.allergyDropdownTitle}>Select your allergies</Text>
                {selectedAllergyIds.length > 0 && (
                  <View style={styles.selectedCountPill}>
                    <Text style={styles.selectedCountText}>
                      {selectedAllergyIds.length} selected
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.allergyHeaderActions}>
                {selectedAllergyIds.length > 0 && (
                  <Pressable
                    style={styles.allergyClearBtn}
                    onPress={(event) => {
                      event.stopPropagation();
                      setSelectedAllergyIds([]);
                      setAllergySearch("");
                    }}
                  >
                    <Text style={styles.allergyClearText}>Clear all</Text>
                  </Pressable>
                )}
                {allergyDropdownOpen && (
                  <Pressable
                    style={styles.dateDoneBtn}
                    onPress={(event) => {
                      event.stopPropagation();
                      setAllergyDropdownOpen(false);
                    }}
                  >
                    <Text style={styles.dateDoneText}>Done</Text>
                  </Pressable>
                )}
              </View>
              <Icon
                name={allergyDropdownOpen ? "chevron-up" : "chevron-down"}
                size={12}
                color="#9CA3AF"
                solid
              />
            </Pressable>

            {allergyDropdownOpen && (
              <>
                {selectedAllergyOptions.length > 0 && (
                  <View style={styles.selectedAllergyChips}>
                    {selectedAllergyOptions.map((item) => (
                      <Pressable
                        key={`selected-allergy-${item.id}`}
                        style={styles.selectedAllergyChip}
                        onPress={() => toggleId(item.id, setSelectedAllergyIds)}
                      >
                        <Text style={styles.selectedAllergyChipText}>{item.name}</Text>
                        <Icon name="xmark" size={11} color="#0F8F4A" solid />
                      </Pressable>
                    ))}
                  </View>
                )}

                <View style={styles.allergySearchWrap}>
                  <Icon name="magnifying-glass" size={13} color="#6B7280" solid />
                  <TextInput
                    value={allergySearch}
                    onChangeText={setAllergySearch}
                    style={styles.allergySearchInput}
                    placeholder="Search allergies..."
                    placeholderTextColor="#6B7280"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {loadingLists ? (
                  <ActivityIndicator />
                ) : (
                  <ScrollView
                    style={styles.allergyBoxList}
                    contentContainerStyle={styles.oneCol}
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={false}
                  >
                    {getFilteredOptions(allergies, allergySearch).map((a) => (
                      <View key={a.id} style={styles.fullColItem}>
                        <CheckRow
                          label={a.name}
                          checked={selectedAllergyIds.includes(a.id)}
                          onPress={() => {
                            toggleId(a.id, setSelectedAllergyIds);
                            setHealthErrors((current) => ({ ...current, allergies: undefined }));
                            setShowHealthAlert(false);
                          }}
                        />
                      </View>
                    ))}
                    {getFilteredOptions(allergies, allergySearch).length === 0 && (
                      <Text style={styles.noResultsText}>No matching allergies found.</Text>
                    )}
                  </ScrollView>
                )}
              </>
            )}
            <ErrorText message={healthErrors.allergies} />
          </View>
        )}

        <Text style={[styles.q, styles.qSpaced]}>
          Do you suffer from any chronic food-related diseases?
        </Text>
        <YesNo
          value={hasDiseases}
          onChange={(v) => {
            setHasDiseases(v);
            setHealthErrors((current) => ({ ...current, hasDiseases: undefined }));
            setShowHealthAlert(false);
            setDiseaseDropdownOpen(v === true);
            if (v === false) {
              setSelectedDiseaseIds([]);
              setDiseaseSearch("");
            }
          }}
        />
        <ErrorText message={healthErrors.hasDiseases} />

        {hasDiseases === true && (
          <>
            <Pressable
              style={styles.dropdownSummary}
              onPress={() => setDiseaseDropdownOpen((open) => !open)}
            >
              <Text style={styles.dropdownSummaryText}>
                {selectedDiseaseIds.length > 0
                  ? `${selectedDiseaseIds.length} conditions selected`
                  : "Select your conditions"}
              </Text>
              <Icon
                name={diseaseDropdownOpen ? "chevron-up" : "chevron-down"}
                size={14}
                color="#9CA3AF"
                solid
              />
            </Pressable>

            {diseaseDropdownOpen && (
              <View style={styles.box}>
                <View style={styles.boxHeaderRow}>
                  <Text style={styles.boxTitle}>Select your conditions:</Text>
                  <View style={styles.dropdownActionRow}>
                    <Pressable
                      style={styles.clearAllBtn}
                      onPress={() => {
                        setSelectedDiseaseIds([]);
                        setDiseaseSearch("");
                      }}
                    >
                      <Text style={styles.clearAllText}>Clear all</Text>
                    </Pressable>
                    <Pressable
                      style={styles.dropdownDoneBtn}
                      onPress={() => setDiseaseDropdownOpen(false)}
                    >
                      <Text style={styles.dropdownDoneText}>Done</Text>
                    </Pressable>
                  </View>
                </View>
                <TextInput
                  value={diseaseSearch}
                  onChangeText={setDiseaseSearch}
                  style={styles.dropdownSearchInput}
                  placeholder="Search diseases or conditions"
                  placeholderTextColor="#6B7280"
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                {loadingLists ? (
                  <ActivityIndicator />
                ) : (
                  <ScrollView
                    style={styles.boxList}
                    contentContainerStyle={styles.twoCols}
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={false}
                  >
                    {getFilteredOptions(diseases, diseaseSearch).map((d) => (
                      <View key={d.id} style={styles.colItem}>
                        <CheckRow
                          label={d.name}
                          checked={selectedDiseaseIds.includes(d.id)}
                          onPress={() => {
                            toggleId(d.id, setSelectedDiseaseIds);
                            setHealthErrors((current) => ({ ...current, diseases: undefined }));
                            setShowHealthAlert(false);
                          }}
                        />
                      </View>
                    ))}
                    {getFilteredOptions(diseases, diseaseSearch).length === 0 && (
                      <Text style={styles.noResultsText}>No matching conditions found.</Text>
                    )}
                  </ScrollView>
                )}
                <ErrorText message={healthErrors.diseases} />
              </View>
            )}
          </>
        )}

        {gender === 2 && (
          <>
            <Text style={[styles.q, styles.qSpaced]}>
              Are you currently pregnant?
            </Text>
            <YesNo
              value={isPregnant}
              onChange={(value) => {
                setIsPregnant(value);
                setHealthErrors((current) => ({ ...current, isPregnant: undefined }));
                setShowHealthAlert(false);
              }}
            />
            <ErrorText message={healthErrors.isPregnant} />
          </>
        )}

        {showHealthAlert && (
          <View style={styles.inlineAlert}>
            <Icon name="triangle-exclamation" size={14} color="#FCA5A5" solid />
            <Text style={styles.inlineAlertText}>
              Please correct the highlighted fields.
            </Text>
          </View>
        )}

        <Pressable
          onPress={submitRegister}
          disabled={!canSubmitHealth}
          style={[styles.mainBtn, !canSubmitHealth && styles.mainBtnDisabled]}
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
      <Modal
        transparent
        visible={countryPickerOpen}
        animationType="fade"
        onRequestClose={() => setCountryPickerOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setCountryPickerOpen(false)}
        >
          <View style={styles.countrySheet}>
            <Text style={styles.countrySheetTitle}>Country code</Text>
            <ScrollView
              style={styles.countryList}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
            >
              {COUNTRIES.map((item) => (
                <Pressable
                  key={`${item.code}-${item.name}`}
                  style={[
                    styles.countryOption,
                    item.code === country.code && styles.countryOptionActive,
                  ]}
                  onPress={() => {
                    setCountry(item);
                    setCountryPickerOpen(false);
                  }}
                >
                  <Text style={styles.countryOptionFlag}>{item.flag}</Text>
                  <View style={styles.countryOptionTextWrap}>
                    <Text style={styles.countryOptionName}>{item.name}</Text>
                    <Text style={styles.countryOptionCode}>{item.code}</Text>
                  </View>
                  {item.code === country.code && (
                    <Icon name="check" size={14} color="#1DB954" solid />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  </SafeAreaView>
);

}
