import { StyleSheet } from "react-native";

const GREEN = "#1DB954";

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#000000",
  },
  container: {
    flex: 1,
    backgroundColor: "#000000",
    paddingHorizontal: 32,
    paddingVertical: 24,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    maxWidth: 420,
    alignSelf: "center",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 24,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    color: "#9CA3AF",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 40,
    maxWidth: 320,
  },
  buttons: {
    width: "100%",
    gap: 16,
  },
  primaryBtn: {
    width: "100%",
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "700",
  },
  outlineBtn: {
    width: "100%",
    borderWidth: 1,
    borderColor: GREEN,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  outlineBtnText: {
    color: GREEN,
    fontSize: 16,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  footer: {
    color: "#4B5563",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 8,
  },
});

export default styles;
