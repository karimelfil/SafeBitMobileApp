import { StyleSheet } from "react-native";

const GREEN = "#1DB954";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#000000" },
  container: { flex: 1 },

  loaderWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: {
    marginTop: 12,
    color: "#9CA3AF",
    fontSize: 14,
  },

  header: {
    backgroundColor: "#0A0A0A",
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  backText: {
    color: GREEN,
    fontSize: 14,
    fontWeight: "600",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 120,
    gap: 16,
  },

  profileHeadCard: {
    backgroundColor: "#0D0D0D",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  // ✅ New: icon badge (replaces the old circle/photo look)
  profileBadge: {
    width: 54,
    height: 54,
    borderRadius: 18,
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  profileBadgeInner: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    backgroundColor: "#0B0B0B",
    borderWidth: 1,
    borderColor: "rgba(29,185,84,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },

  // (Kept for compatibility; you can delete if not used anywhere else)
  profileIconWrap: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  profileHeadTextWrap: {
    flex: 1,
  },
  profileName: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "700",
    marginBottom: 3,
  },
  profileSub: {
    color: "#9CA3AF",
    fontSize: 13,
  },

  card: {
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 16,
    padding: 14,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  cardTitleStandalone: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
    paddingVertical: 10,
  },
  infoRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  infoLabel: {
    color: "#9CA3AF",
    fontSize: 13,
  },
  infoValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 1,
    textAlign: "right",
  },

  actionBtn: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  actionBtnDanger: {
    backgroundColor: "rgba(239,68,68,0.12)",
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  actionTextDanger: {
    color: "#F87171",
    fontSize: 14,
    fontWeight: "600",
  },

  logoutBtn: {
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  inputLabel: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 4,
  },
  editHint: {
    color: "#9CA3AF",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#FFFFFF",
    fontSize: 14,
    marginBottom: 10,
  },
  inputError: {
    borderColor: "#F87171",
    backgroundColor: "rgba(248,113,113,0.08)",
    marginBottom: 6,
  },
  errorText: {
    color: "#FCA5A5",
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  inputDisabled: {
    opacity: 0.65,
  },

  segmentWrap: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 10,
    padding: 4,
    gap: 4,
    marginBottom: 10,
  },
  segmentBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: "rgba(29,185,84,0.16)",
  },
  segmentText: {
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "600",
  },
  segmentTextActive: {
    color: GREEN,
  },

  saveBtn: {
    backgroundColor: GREEN,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    marginTop: 6,
  },
  saveBtnText: {
    color: "#03150A",
    fontSize: 14,
    fontWeight: "700",
  },

  selectorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  selectorBtn: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectorText: {
    color: "#E5E7EB",
    fontSize: 13,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },

  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chipDanger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.4)",
    backgroundColor: "rgba(239,68,68,0.14)",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipWarn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "rgba(234,179,8,0.4)",
    backgroundColor: "rgba(234,179,8,0.14)",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipDangerText: {
    color: "#F87171",
    fontSize: 12,
    fontWeight: "600",
  },
  chipWarnText: {
    color: "#FACC15",
    fontSize: 12,
    fontWeight: "600",
  },
  healthLabel: {
    color: "#D1D5DB",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  healthLabelSecond: {
    marginTop: 12,
  },
  healthEmptyText: {
    color: "#6B7280",
    fontSize: 12,
    fontStyle: "italic",
  },
  healthDropdown: {
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 12,
    overflow: "hidden",
  },
  healthDropdownHeader: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  healthDropdownTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  },
  healthDropdownTitle: {
    flexShrink: 1,
    color: "#E5E7EB",
    fontSize: 14,
    fontWeight: "800",
  },
  selectedCountPill: {
    backgroundColor: "rgba(29,185,84,0.2)",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  selectedCountText: {
    color: "#7DE2A2",
    fontSize: 12,
    fontWeight: "800",
  },
  healthHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  clearAllBtn: {
    minHeight: 30,
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  clearAllText: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "700",
  },
  doneBtn: {
    backgroundColor: GREEN,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  doneBtnText: {
    color: "#03150A",
    fontSize: 12,
    fontWeight: "800",
  },
  selectedChipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
  },
  selectedHealthChip: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: "rgba(29,185,84,0.35)",
    backgroundColor: "rgba(29,185,84,0.13)",
    borderRadius: 999,
    paddingHorizontal: 11,
  },
  selectedHealthChipText: {
    color: "#7DE2A2",
    fontSize: 12,
    fontWeight: "800",
  },
  healthSearchWrap: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  healthSearchInput: {
    flex: 1,
    color: "#FFFFFF",
    paddingVertical: 9,
  },
  healthDropdownList: {
    maxHeight: 230,
    paddingHorizontal: 14,
  },
  healthOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
  },
  healthCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#4B5563",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  healthCheckboxOn: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  healthOptionText: {
    flex: 1,
    color: "#E5E7EB",
    fontSize: 13,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  selectModalCard: {
    backgroundColor: "#111111",
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 16,
    maxHeight: "70%",
    overflow: "hidden",
  },
  selectModalHeader: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectModalTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  modalSearchInput: {
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 10,
    color: "#FFFFFF",
    marginHorizontal: 10,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectList: {
    padding: 10,
  },
  modalNoResultsText: {
    color: "#9CA3AF",
    fontSize: 13,
    paddingVertical: 12,
    textAlign: "center",
  },
  selectItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 8,
  },
  selectItemActive: {
    borderColor: GREEN,
    backgroundColor: "rgba(29,185,84,0.12)",
  },
  selectItemText: {
    color: "#E5E7EB",
    fontSize: 14,
  },
  selectItemTextActive: {
    color: GREEN,
    fontWeight: "700",
  },

  deleteCard: {
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: "#4B1E1E",
    borderRadius: 16,
    padding: 14,
  },
  deleteTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  deleteBody: {
    color: "#9CA3AF",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },

  // ✅ New: strong inline text for DELETE word
  deleteInlineStrong: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.4)",
    backgroundColor: "rgba(239,68,68,0.12)",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  warningText: {
    flex: 1,
    color: "#FCA5A5",
    fontSize: 12,
    lineHeight: 16,
  },
  deleteInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  deleteInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    paddingVertical: 12,
  },
  deleteBtnRow: {
    flexDirection: "row",
    gap: 8,
  },
  deleteCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  deleteCancelText: {
    color: "#E5E7EB",
    fontSize: 13,
    fontWeight: "600",
  },
  deleteDangerBtn: {
    flex: 1,
    backgroundColor: "#DC2626",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },

  // ✅ New: disabled style for delete button until user types DELETE
  deleteDangerBtnDisabled: {
    opacity: 0.45,
  },

  deleteDangerText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#121212",
    borderTopWidth: 1,
    borderTopColor: "#1F2937",
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  navLabel: {
    color: "#9CA3AF",
    fontSize: 11,
  },
  navLabelActive: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "700",
  },
  navCenterWrap: {
    marginTop: -18,
  },
  navCenterBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },

  btnDisabled: {
    opacity: 0.6,
  },
});

export default styles;
