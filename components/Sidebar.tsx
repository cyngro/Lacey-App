import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Animated,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";

const { width, height } = Dimensions.get("window");

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

export default function Sidebar({ visible, onClose }: SidebarProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [faceLockEnabled, setFaceLockEnabled] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
    onClose();
  };

  const menuItems = [
    {
      id: "edit-profile",
      title: "Edit Profile",
      icon: "person-outline",
      onPress: () => {
        // Navigate to edit profile screen
        onClose();
      },
    },
    {
      id: "change-password",
      title: "Change Password",
      icon: "lock-outline",
      onPress: () => {
        // Navigate to change password screen
        onClose();
      },
    },
    {
      id: "terms",
      title: "Terms & Conditions",
      icon: "description",
      onPress: () => {
        // Navigate to terms screen
        onClose();
      },
    },
    {
      id: "privacy",
      title: "Privacy Policy",
      icon: "privacy-tip-outline",
      onPress: () => {
        // Navigate to privacy policy screen
        onClose();
      },
    },
  ];

  const navigationItems = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: "dashboard",
      onPress: () => {
        router.push("/dashboard");
        onClose();
      },
    },
    {
      id: "proposals",
      title: "Proposals",
      icon: "description",
      onPress: () => {
        router.push("/proposalsList");
        onClose();
      },
    },
    {
      id: "invoices",
      title: "Invoices",
      icon: "receipt",
      onPress: () => {
        router.push("/viewInvoice");
        onClose();
      },
    },
    {
      id: "create-proposal",
      title: "Create Proposal",
      icon: "add",
      onPress: () => {
        router.push("/proposal");
        onClose();
      },
    },
  ];

  if (!visible) return null;

  return (
    <>
      {/* Overlay */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />
      
      {/* Sidebar */}
      <Animated.View style={styles.sidebar}>
        <View style={styles.sidebarContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../assets/images/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.appName}>Lacey Business Suite</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#00234C" />
            </TouchableOpacity>
          </View>

          {/* Navigation Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Navigation</Text>
            {navigationItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <MaterialIcons name={item.icon as any} size={20} color="#00234C" />
                <Text style={styles.menuItemText}>{item.title}</Text>
                <MaterialIcons name="chevron-right" size={16} color="#666" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Account Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Setting</Text>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <MaterialIcons name={item.icon as any} size={20} color="#00234C" />
                <Text style={styles.menuItemText}>{item.title}</Text>
                <MaterialIcons name="chevron-right" size={16} color="#666" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Notifications Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => setFaceLockEnabled(!faceLockEnabled)}
            >
              <MaterialIcons name="face" size={20} color="#00234C" />
              <Text style={styles.menuItemText}>Face lock</Text>
              <TouchableOpacity 
                style={styles.toggleContainer}
                onPress={() => setFaceLockEnabled(!faceLockEnabled)}
              >
                <View style={[
                  styles.toggleTrack,
                  faceLockEnabled && styles.toggleTrackActive
                ]}>
                  <View style={[
                    styles.toggleThumb,
                    faceLockEnabled && styles.toggleThumbActive
                  ]} />
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <MaterialIcons name="logout" size={20} color="#fff" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.deleteButton}>
              <MaterialIcons name="delete-outline" size={20} color="#fff" />
              <Text style={styles.deleteButtonText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 998,
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width * 0.85,
    height: height,
    backgroundColor: "#fff",
    zIndex: 999,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: -2, height: 0 },
    elevation: 10,
  },
  sidebarContent: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  appName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#00234C",
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#00234C",
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  menuItemText: {
    fontSize: 16,
    color: "#00234C",
    marginLeft: 12,
    flex: 1,
  },
  toggleContainer: {
    marginLeft: 12,
  },
  toggleTrack: {
    width: 44,
    height: 24,
    backgroundColor: "#E0E0E0",
    borderRadius: 12,
    position: "relative",
    justifyContent: "center",
  },
  toggleTrackActive: {
    backgroundColor: "#4CAF50",
  },
  toggleThumb: {
    width: 20,
    height: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    position: "absolute",
    left: 2,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  toggleThumbActive: {
    left: 22,
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: "auto",
    marginBottom: 40,
  },
  logoutButton: {
    backgroundColor: "#00234C",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: "#2196F3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
