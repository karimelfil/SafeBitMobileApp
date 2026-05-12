import { StyleSheet } from "react-native";

const GREEN = "#1DB954";

export default StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#000" },

  scrollView: {
    flex: 1,
    backgroundColor: "#000",
  },
  scroll: {
    flexGrow: 1,
    minHeight: "100%",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
  },

  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  backArrow: {
    color: GREEN,
    fontSize: 22,
    marginTop: -2,
  },
  backText: {
    color: GREEN,
    fontSize: 14,
    fontWeight: "600",
  },

  header: {
    alignItems: "center",
    marginTop: 0,
    marginBottom: 22,
  },

  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },

  welcome: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  desc: {
    color: "#9CA3AF",
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },

  form: {
    width: "100%",
    marginTop: 6,
  },
  label: {
    color: "#D1D5DB",
    fontSize: 12,
    marginBottom: 8,
  },
  passwordLabel: {
    color: "#D1D5DB",
    fontSize: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    width: "100%",
    backgroundColor: "#2A2A2A",
    borderWidth: 1,
    borderColor: "#4B5563",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#fff",
  },
  inputError: {
    borderColor: "#F87171",
    backgroundColor: "rgba(248,113,113,0.08)",
  },
  errorText: {
    color: "#FCA5A5",
    fontSize: 12,
    lineHeight: 16,
    marginTop: 6,
  },

  passwordWrap: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    borderWidth: 1,
    borderColor: "#4B5563",
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#fff",
  },
  eyeBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  forgotText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 16,
  },

  primaryBtn: {
    backgroundColor: GREEN,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "800",
  },

  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },

  bottomLink: {
    marginTop: 18,
    color: "#9CA3AF",
    textAlign: "center",
    fontSize: 12,
  },
  bottomLinkStrong: {
    color: GREEN,
    fontWeight: "800",
  },
});
