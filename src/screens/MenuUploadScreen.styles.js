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
  },

  header: {
    backgroundColor: "#121212",
    borderBottomWidth: 1,
    borderBottomColor: "#262626",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 18,
  },

  backRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 16,
  },

  backText: {
    color: GREEN,
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 6,
  },

  headerSubtitle: {
    color: "#9CA3AF",
    fontSize: 14,
    lineHeight: 20,
  },

  highlightText: {
    color: GREEN,
    fontWeight: "700",
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 120,
  },

  fieldBlock: {
    marginBottom: 18,
  },

  label: {
    color: "#D1D5DB",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: "#FFFFFF",
    fontSize: 15,
  },

  textarea: {
    minHeight: 160,
    textAlignVertical: "top",
  },

  uploadCard: {
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 18,
    padding: 22,
    marginBottom: 14,
  },

  uploadCardActive: {
    borderColor: GREEN,
  },

  uploadCardDashed: {
    borderStyle: "dashed",
  },

  uploadCenter: {
    alignItems: "center",
  },

  uploadIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(29,185,84,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  uploadTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },

  uploadSub: {
    color: "#9CA3AF",
    fontSize: 13,
    textAlign: "center",
  },

  uploadTiny: {
    color: "#6B7280",
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#1F2937",
  },

  dividerText: {
    color: "#6B7280",
    fontSize: 12,
    marginHorizontal: 10,
  },

  actionRowCard: {
    backgroundColor: "#101514",
    borderWidth: 1,
    borderColor: "#22322A",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  actionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(29,185,84,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  actionBody: {
    flex: 1,
  },

  actionTitle: {
    color: "#F3F4F6",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },

  actionSub: {
    color: "#98B5A5",
    fontSize: 13,
  },

  selectedFileCard: {
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  selectedFileBody: {
    flex: 1,
    marginLeft: 14,
  },

  selectedFileName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },

  selectedFileMeta: {
    color: "#9CA3AF",
    fontSize: 13,
  },

  removeFileBtn: {
    padding: 6,
  },

  primaryBtn: {
    backgroundColor: GREEN,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    marginBottom: 18,
  },

  primaryBtnDisabled: {
    opacity: 0.5,
  },

  primaryBtnText: {
    color: "#03150A",
    fontSize: 16,
    fontWeight: "800",
  },

  infoCard: {
    backgroundColor: "rgba(29,185,84,0.10)",
    borderWidth: 1,
    borderColor: "rgba(29,185,84,0.28)",
    borderRadius: 16,
    padding: 14,
  },

  infoTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  infoTitle: {
    color: GREEN,
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 8,
  },

  infoBody: {
    color: "#A3A3A3",
    fontSize: 13,
    lineHeight: 19,
  },

  resultsHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  resultsHeaderBody: {
    flex: 1,
    paddingRight: 14,
  },

  resultsTitle: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 6,
  },

  resultsSubtitle: {
    color: "#9CA3AF",
    fontSize: 14,
    lineHeight: 20,
  },

  shieldBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },

  heroCard: {
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
  },

  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  heroContent: {
    flex: 1,
    paddingRight: 14,
  },

  heroEyebrow: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },

  heroHeadline: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
  },

  heroSubtext: {
    color: "#A3A3A3",
    fontSize: 14,
    lineHeight: 21,
  },

  scoreRing: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 4,
    borderColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(29,185,84,0.08)",
  },

  scoreValue: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },

  scoreLabel: {
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },

  insightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  insightPill: {
    flex: 1,
    backgroundColor: "#0F0F0F",
    borderWidth: 1,
    borderColor: "#242424",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginRight: 10,
  },

  insightPillLast: {
    marginRight: 0,
  },

  insightValueSafe: {
    color: "#22C55E",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
    textAlign: "center",
  },

  insightValueWarning: {
    color: "#FACC15",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
    textAlign: "center",
  },

  insightValueUnsafe: {
    color: "#F87171",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
    textAlign: "center",
  },

  insightText: {
    color: "#9CA3AF",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },

  safetyCard: {
    backgroundColor: "rgba(0,59,28,0.45)",
    borderWidth: 1.4,
    borderColor: "rgba(29,185,84,0.32)",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  safetyIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  safetyTextWrap: {
    flex: 1,
  },

  safetyTitle: {
    color: GREEN,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },

  safetyDescription: {
    color: "#D1D5DB",
    fontSize: 13,
    lineHeight: 18,
  },

  sectionGroup: {
    marginTop: 26,
  },

  sectionGroupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  sectionGroupTitle: {
    color: "#F9FAFB",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  sectionGroupCount: {
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "600",
  },

  dishCard: {
    borderWidth: 1.4,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    marginBottom: 12,
    backgroundColor: "#101010",
    overflow: "hidden",
  },

  dishCardSafe: {
    borderColor: "#1F9D55",
    backgroundColor: "#081B12",
  },

  dishCardWarning: {
    borderColor: "#D7A31A",
    backgroundColor: "#1C1507",
  },

  dishCardUnsafe: {
    borderColor: "#E05757",
    backgroundColor: "#1D0A0D",
  },

  dishTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  dishTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 8,
    flex: 1,
  },

  dishStatusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
  },

  dishStatusBadgeSafe: {
    backgroundColor: "#10311F",
    borderWidth: 1,
    borderColor: "#245A3A",
  },

  dishStatusBadgeWarning: {
    backgroundColor: "#332707",
    borderWidth: 1,
    borderColor: "#6D5310",
  },

  dishStatusBadgeUnsafe: {
    backgroundColor: "#351114",
    borderWidth: 1,
    borderColor: "#6B232A",
  },

  dishStatusBadgeTextSafe: {
    color: "#22C55E",
    fontSize: 12,
    fontWeight: "800",
  },

  dishStatusBadgeTextWarning: {
    color: "#FACC15",
    fontSize: 12,
    fontWeight: "800",
  },

  dishStatusBadgeTextUnsafe: {
    color: "#F87171",
    fontSize: 12,
    fontWeight: "800",
  },

  dishDescription: {
    color: "#D1D5DB",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },

  recommendationBox: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  recommendationBoxSafe: {
    backgroundColor: "#0D2418",
    borderWidth: 1,
    borderColor: "#214C34",
  },
  recommendationBoxRisky: {
    backgroundColor: "#241B08",
    borderWidth: 1,
    borderColor: "#695116",
  },
  recommendationBoxUnsafe: {
    backgroundColor: "#260E11",
    borderWidth: 1,
    borderColor: "#6E2931",
  },

  recommendationText: {
    color: "#E5E7EB",
    fontSize: 13,
    lineHeight: 19,
  },
  recommendationTextSafe: {
    color: "#DCFCE7",
  },
  recommendationTextRisky: {
    color: "#FEF3C7",
  },
  recommendationTextUnsafe: {
    color: "#FEE2E2",
  },

  categoryChip: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },

  categoryChipText: {
    color: "#E5E7EB",
    fontSize: 11,
    fontWeight: "600",
  },

  blockTitle: {
    color: "#D1D5DB",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
  },

  warningTitle: {
    color: "#FACC15",
  },

  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },

  allergenChip: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },

  allergenChipText: {
    fontSize: 11,
    fontWeight: "700",
  },

  allergenChipSafe: {
    backgroundColor: "#102A1D",
    borderColor: "#245A3A",
  },

  allergenChipRisky: {
    backgroundColor: "#2B2109",
    borderColor: "#7A5B14",
  },

  allergenChipUnsafe: {
    backgroundColor: "#341215",
    borderColor: "#7E2C35",
  },

  allergenChipTextSafe: {
    color: "#A7F3D0",
  },

  allergenChipTextRisky: {
    color: "#FDE68A",
  },

  allergenChipTextUnsafe: {
    color: "#FECACA",
  },

  diseaseChip: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },

  diseaseChipText: {
    fontSize: 11,
    fontWeight: "700",
  },

  diseaseChipSafe: {
    backgroundColor: "#0F2B24",
    borderColor: "#245A4A",
  },

  diseaseChipRisky: {
    backgroundColor: "#28200D",
    borderColor: "#75611D",
  },

  diseaseChipUnsafe: {
    backgroundColor: "#2A1318",
    borderColor: "#70404B",
  },

  diseaseChipTextSafe: {
    color: "#99F6E4",
  },

  diseaseChipTextRisky: {
    color: "#FDE68A",
  },

  diseaseChipTextUnsafe: {
    color: "#FBCFE8",
  },

  warningChip: {
    backgroundColor: "rgba(234,179,8,0.18)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    marginBottom: 8,
  },

  warningChipText: {
    color: "#FACC15",
    fontSize: 11,
    fontWeight: "700",
  },
  warningChipSafe: {
    backgroundColor: "rgba(34,197,94,0.16)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.26)",
  },
  warningChipRisky: {
    backgroundColor: "rgba(250,204,21,0.16)",
    borderWidth: 1,
    borderColor: "rgba(250,204,21,0.26)",
  },
  warningChipUnsafe: {
    backgroundColor: "rgba(248,113,113,0.16)",
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.26)",
  },
  warningChipTextSafe: {
    color: "#86EFAC",
  },
  warningChipTextRisky: {
    color: "#FACC15",
  },
  warningChipTextUnsafe: {
    color: "#FCA5A5",
  },

  reportWrap: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    marginTop: 2,
    paddingTop: 14,
  },

  reportLink: {
    fontSize: 14,
    fontWeight: "600",
  },
  reportLinkSafe: {
    color: "#22C55E",
  },
  reportLinkRisky: {
    color: "#FACC15",
  },
  reportLinkUnsafe: {
    color: "#F87171",
  },

  emptyStateCard: {
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderRadius: 18,
    padding: 18,
    marginTop: 8,
  },

  emptyStateText: {
    color: "#9CA3AF",
    fontSize: 14,
    lineHeight: 21,
  },

  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#121212",
    borderTopWidth: 1,
    borderTopColor: "#1F2937",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 10,
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 64,
  },

  navLabel: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 5,
  },

  navLabelActive: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 5,
  },

  navCenterWrap: {
    marginTop: -26,
  },

  navCenterBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#121212",
  },
});

export default styles;
