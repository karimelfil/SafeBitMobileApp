import React from "react";
import { Pressable, Text, View } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import styles from "./FancyBackButton.styles";

export default function FancyBackButton({ label = "Back", onPress, style }) {
  return (
    <Pressable onPress={onPress} style={[styles.wrap, style]}>
      <View style={styles.iconWrap}>
        <FontAwesome6 name="arrow-left" size={12} color="#03150A" solid />
      </View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.glow} />
    </Pressable>
  );
}
