import { StyleSheet } from "react-native";

const GREEN = "#1DB954";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#000" },
  scroll: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 28 },

  backRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 14 },
  backArrow: { color: GREEN, fontSize: 22, marginTop: -2 },
  backText: { color: GREEN, fontSize: 14, fontWeight: "600" },

  header: { alignItems: "center", marginTop: 6, marginBottom: 16 },
  logo: { width: 54, height: 54, marginBottom: 8 },
  brand: { color: GREEN, fontWeight: "700", fontSize: 16 },

  title: { color: "#fff", fontSize: 18, fontWeight: "800", marginTop: 14 },
  desc: { color: "#9CA3AF", marginTop: 10, lineHeight: 18, fontSize: 13 },

  form: { marginTop: 20 },
  label: { color: "#D1D5DB", fontSize: 12, marginBottom: 8 },
  labelSpaced: { marginTop: 16 },

  passwordWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B1220",
    borderWidth: 1,
    borderColor: "#2B3445",
    borderRadius: 8,
  },
  passwordInput: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, color: "#fff" },
  eyeBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  eyeText: { color: "#9CA3AF", fontSize: 16 },

  btn: {
    marginTop: 18,
    backgroundColor: GREEN,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { color: "#000", fontSize: 14, fontWeight: "800" },

  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
});

export default styles;
