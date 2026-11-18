import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";

import { useAuth } from "@/context/AuthContext";

export default function ProfileScreen() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A36D5D" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  const displayName = user?.name || "Customer";
  const initial = displayName.charAt(0).toUpperCase();

  function confirmLogout() {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            Alert.alert("Error", "Unable to sign out. Please try again.");
          }
        },
      },
    ]);
  }

  function MenuItem({
    icon,
    title,
    subtitle,
    onPress,
    danger = false,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
    onPress: () => void;
    danger?: boolean;
  }) {
    return (
      <Pressable style={styles.menuItem} onPress={onPress}>
        <View style={[styles.menuIcon, danger && styles.dangerIcon]}>
          <Ionicons
            name={icon}
            size={20}
            color={danger ? "#A34F43" : "#554B43"}
          />
        </View>

        <View style={styles.menuText}>
          <Text style={[styles.menuTitle, danger && styles.dangerText]}>
            {title}
          </Text>
          <Text style={styles.menuSubtitle}>{subtitle}</Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color="#A69B90" />
      </Pressable>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.brand}>SOZAN / NAZM</Text>
        <Text style={styles.headerLabel}>MY ACCOUNT</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.greeting}>WELCOME BACK</Text>
          <Text style={styles.name}>{displayName}</Text>
          {!!user?.email && <Text style={styles.email}>{user.email}</Text>}
        </View>
      </View>

      <Text style={styles.sectionTitle}>YOUR ACCOUNT</Text>

      <View style={styles.menuCard}>
        <MenuItem
          icon="receipt-outline"
          title="My Orders"
          subtitle="Track and view your purchases"
          onPress={() => router.push("/orders")}
        />

        <View style={styles.separator} />

        <MenuItem
          icon="heart-outline"
          title="My Wishlist"
          subtitle="Your saved pieces"
          onPress={() => router.push("/wishlist")}
        />

        <View style={styles.separator} />

        <MenuItem
          icon="bag-outline"
          title="Shopping Bag"
          subtitle="Continue where you left off"
          onPress={() => router.push("/cart")}
        />
      </View>

      <Text style={styles.sectionTitle}>ACCOUNT SETTINGS</Text>

      <View style={styles.menuCard}>
        <MenuItem
          icon="person-outline"
          title="Personal Details"
          subtitle="Your account information"
          onPress={() =>
            Alert.alert(
              "Personal Details",
              "Your account details are shown above.",
            )
          }
        />

        <View style={styles.separator} />

        <MenuItem
          icon="help-circle-outline"
          title="Help & Support"
          subtitle="Need help with an order?"
          onPress={() =>
            Alert.alert(
              "Help & Support",
              "For assistance, please contact the store.",
            )
          }
        />

        <View style={styles.separator} />

        <MenuItem
          icon="log-out-outline"
          title="Sign Out"
          subtitle="Sign out of your account"
          danger
          onPress={confirmLogout}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerBrand}>SOZAN / NAZM</Text>
        <Text style={styles.footerText}>
          Thoughtful pieces. Timeless expression.
        </Text>
        <Text style={styles.version}>MOBILE APP · V1.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F4EE",
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F7F4EE",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    marginBottom: 28,
  },
  brand: {
    fontSize: 19,
    letterSpacing: 3,
    fontWeight: "700",
    color: "#25221F",
  },
  headerLabel: {
    marginTop: 7,
    fontSize: 10,
    letterSpacing: 2,
    color: "#8A7C70",
  },
  profileCard: {
    backgroundColor: "#EEE8DE",
    borderRadius: 4,
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#A36D5D",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 17,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "500",
  },
  profileInfo: {
    flex: 1,
  },
  greeting: {
    color: "#8A7568",
    fontSize: 9,
    letterSpacing: 2,
    marginBottom: 5,
  },
  name: {
    color: "#25221F",
    fontSize: 21,
    fontWeight: "600",
  },
  email: {
    color: "#776C62",
    fontSize: 12,
    marginTop: 5,
  },
  sectionTitle: {
    color: "#8A7C70",
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "600",
    marginBottom: 13,
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  menuItem: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#F5F1EB",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },
  dangerIcon: {
    backgroundColor: "#F8ECE9",
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#302A26",
  },
  dangerText: {
    color: "#A34F43",
  },
  menuSubtitle: {
    fontSize: 11,
    color: "#8A8178",
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: "#F0ECE6",
    marginLeft: 53,
  },
  footer: {
    alignItems: "center",
    paddingTop: 8,
  },
  footerBrand: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 3,
    color: "#8B685B",
  },
  footerText: {
    color: "#8A8178",
    fontSize: 11,
    marginTop: 8,
  },
  version: {
    color: "#AAA096",
    fontSize: 9,
    letterSpacing: 1.5,
    marginTop: 17,
  },
});
