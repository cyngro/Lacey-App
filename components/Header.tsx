import React from "react";
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from "../contexts/AuthContext";
import { getCompanyInfo } from "../utils/companyLogos";

interface HeaderProps {
  title?: string;
  logo?: any;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightActions?: React.ReactNode;
  centerLogo?: boolean;
  rightLogo?: boolean;
}

export default function Header({ 
  title,
  logo,
  showBackButton = false,
  onBackPress,
  rightActions,
  centerLogo = false,
  rightLogo = false
}: HeaderProps) {
  const { selectedCompany } = useAuth();
  const companyInfo = getCompanyInfo(selectedCompany);

  return (
    <View style={[styles.header, centerLogo && styles.headerCenter, rightLogo && styles.headerRight]}>
      {showBackButton && (
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <MaterialIcons name="arrow-back" size={24} color="#00234C" />
        </TouchableOpacity>
      )}
      <View style={[styles.logoContainer, centerLogo && styles.logoContainerCenter, rightLogo && styles.logoContainerRight]}>
        {companyInfo ? (
          <View style={styles.companyInfo}>
            <Image 
              source={{ uri: companyInfo.logo }} 
              style={styles.companyLogo} 
              resizeMode="contain" 
            />
            <View style={styles.companyText}>
              <Text style={styles.companyName}>{companyInfo.name}</Text>
              <Text style={styles.companySubtitle}>{companyInfo.subtitle}</Text>
            </View>
          </View>
        ) : logo ? (
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
      {rightActions && (
        <View style={styles.rightActions}>
          {rightActions}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginLeft: 10,
    marginBottom: 20,
  },
  headerCenter: {
    justifyContent: "center",
  },
  headerRight: {
    justifyContent: "flex-start",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainerCenter: {
    flex: 1,
    justifyContent: "center",
  },
  logoContainerRight: {
    flex: 1,
    justifyContent: "flex-start",
  },
  logo: {
    width: 150,
    height: 50,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#00234C",
  },
  companyInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  companyLogo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  companyText: {
    flexDirection: "column",
  },
  companyName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#00234C",
    marginBottom: 2,
  },
  companySubtitle: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
});
