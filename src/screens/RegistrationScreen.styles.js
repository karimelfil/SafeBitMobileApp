import { StyleSheet } from "react-native";

const GREEN = "#1DB954";
const BG = "#000000";
const CARD = "#121212";
const BORDER = "#2A2A2A";
const MUTED = "#9CA3AF";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { flex: 1, backgroundColor: BG },

  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 26 },

  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  backArrow: { color: GREEN, fontSize: 26, marginTop: -2 },
  backText: { color: GREEN, fontSize: 14, fontWeight: "700" },

  logoWrap: { alignItems: "center", marginTop: 6, marginBottom: 8 },
  logo: { width: 72, height: 72 },

  progressWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    marginBottom: 14,
  },
  progressItem: { alignItems: "center" },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  circleOn: { backgroundColor: GREEN },
  circleOff: { backgroundColor: "#2F2F2F" },
  circleTxtOn: { color: "#000", fontWeight: "900" },
  circleTxtOff: { color: "#9AA0A6", fontWeight: "900" },
  progressLine: {
    width: 70,
    height: 4,
    backgroundColor: "#2F2F2F",
    marginHorizontal: 12,
  },
  progressLineOn: { backgroundColor: GREEN },
  progressLabelOn: {
    color: "#fff",
    fontSize: 12,
    marginTop: 6,
    fontWeight: "700",
  },
  progressLabelOff: {
    color: "#9AA0A6",
    fontSize: 12,
    marginTop: 6,
    fontWeight: "700",
  },

  h1: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 6,
  },
  sub: { color: MUTED, textAlign: "center", marginTop: 6, marginBottom: 12 },
  sub2: { color: MUTED, textAlign: "center", marginTop: 6, marginBottom: 18 },

  label: {
    color: "#D1D5DB",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#fff",
  },

  inputBtn: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: "center",
  },
  inputBtnText: { color: "#fff" },

  row2: { flexDirection: "row", gap: 12 },

  genderRow: { flexDirection: "row", gap: 12, marginTop: 6 },
  genderCard: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CARD,
  },
  genderCardOff: { borderColor: BORDER },
  genderCardOn: {
    borderColor: GREEN,
    backgroundColor: "rgba(29,185,84,0.12)",
  },
  genderIcon: { color: "#9AA0A6", fontSize: 26, marginBottom: 6 },
  genderIconOn: { color: GREEN },
  genderText: { color: "#9AA0A6", fontWeight: "800" },
  genderTextOn: { color: GREEN },

  mainBtn: {
    backgroundColor: GREEN,
    borderRadius: 10,
    marginTop: 18,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  mainBtnTxt: { color: "#000", fontWeight: "900", fontSize: 14 },

  bottomText: {
    color: MUTED,
    textAlign: "center",
    marginTop: 14,
    fontSize: 12,
  },
  bottomTextGreen: { color: GREEN, fontWeight: "900" },

  q: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 14,
    marginBottom: 10,
  },

  yesNoRow: { flexDirection: "row", gap: 12 },
  yesNoBtn: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  yesNoBtnOn: { backgroundColor: GREEN, borderColor: GREEN },
  yesNoBtnOff: { backgroundColor: "#FFFFFF", borderColor: "#FFFFFF" },
  yesNoTxt: { fontWeight: "900" },
  yesNoTxtOn: { color: "#000" },

  box: {
    marginTop: 12,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 14,
    maxHeight: 290,
    overflow: "hidden",
  },
  boxTitle: { color: "#D1D5DB", fontWeight: "800", marginBottom: 10 },
  boxList: { maxHeight: 230 },

  twoCols: { flexDirection: "row", flexWrap: "wrap" },
  colItem: { width: "50%", paddingRight: 8 },

  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 10,
  },
  checkBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#C7C7C7",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkBoxOn: { backgroundColor: GREEN, borderColor: GREEN },
  checkMark: { color: "#000", fontWeight: "900", fontSize: 12 },
  checkLabel: { color: "#E5E7EB", fontSize: 13, flex: 1 },
});

export default styles;
