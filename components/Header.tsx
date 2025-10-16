import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";

interface HeaderProps {
  onMenuPress?: () => void;
  showMenu?: boolean;
  showLogout?: boolean;
  title?: string;
  logo?: any;
  isBackButton?: boolean;
  rightActions?: React.ReactNode;
}

export default function Header({ 
  onMenuPress, 
  showMenu = true, 
  showLogout = true, 
  title,
  logo,
  isBackButton = false,
  rightActions
}: HeaderProps) {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: async () => {
            await logout();
            router.push("/login");
          }
        }
      ]
    );
  };

  return (
    <View style={styles.header}>
      {showMenu ? (
        <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
          <MaterialIcons 
            name={isBackButton ? "arrow-back" : "menu"} 
            size={24} 
            color="#00234C" 
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.menuButton} />
      )}
      
      <View style={styles.logoContainer}>
        {logo ? (
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        ) : title ? (
          <Text style={styles.title}>{title}</Text>
        ) : (
          <Image 
            source={require("../assets/images/dashbord.png")} 
            style={styles.logo} 
            resizeMode="contain" 
          />
        )}
      </View>
      
      {rightActions ? (
        <View style={styles.rightActions}>
          {rightActions}
        </View>
      ) : showLogout ? (
        <TouchableOpacity style={styles.menuButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="#00234C" />
        </TouchableOpacity>
      ) : (
        <View style={styles.menuButton} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 60,
    marginBottom: 20,
  },
  menuButton: {
    padding: 8,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  logo: {
    width: 200,
    height: 50,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#00234C",
  },
  rightActions: {
    flexDirection: "row",
    gap: 8,
  },
});
