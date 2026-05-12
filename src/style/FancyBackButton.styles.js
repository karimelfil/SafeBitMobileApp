import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 8,
    paddingRight: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#101614",
    borderWidth: 1,
    borderColor: "rgba(29,185,84,0.22)",
    marginBottom: 16,
    position: "relative",
    overflow: "hidden",
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1DB954",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  label: {
    color: "#E8FFF0",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  glow: {
    position: "absolute",
    right: -10,
    top: -8,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(29,185,84,0.10)",
  },
});

export default styles;
