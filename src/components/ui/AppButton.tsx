import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

type AppButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export default function AppButton({
  title,
  onPress,
  loading = false,
  disabled = false,
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={[styles.button, isDisabled && styles.disabledButton]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    backgroundColor: "#2563EB",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  disabledButton: {
    opacity: 0.6,
  },

  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
