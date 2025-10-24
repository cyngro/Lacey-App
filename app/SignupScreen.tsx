import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  SafeAreaView,
  TextInput,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

const { height } = Dimensions.get("window");

const COLORS = {
  NAVY_BLUE: "#002147",
  LIGHT_GRAY: "#EBEBEB",
  TEXT_GRAY: "#666",
  WHITE: "#fff",
};

export default function SignupScreen() {
  // 👇 states for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.container}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <FontAwesome5 name="mountain" size={48} color={COLORS.NAVY_BLUE} />
          </View>

          <Text style={styles.title}>Create Account</Text>

          <View style={styles.form}>
            {/* Full Name */}
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons
                name="person-outline"
                size={20}
                color={COLORS.TEXT_GRAY}
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Muhammad Umair"
                autoCapitalize="words"
                placeholderTextColor={COLORS.TEXT_GRAY}
              />
            </View>

            {/* Email */}
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons
                name="mail-outline"
                size={20}
                color={COLORS.TEXT_GRAY}
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="example@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={COLORS.TEXT_GRAY}
              />
            </View>

            {/* Phone */}
            <Text style={styles.inputLabel}>Phone</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons
                name="phone-iphone"
                size={20}
                color={COLORS.TEXT_GRAY}
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="111 222 3344"
                keyboardType="phone-pad"
                placeholderTextColor={COLORS.TEXT_GRAY}
              />
            </View>

            {/* Password */}
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons
                name="lock-outline"
                size={20}
                color={COLORS.TEXT_GRAY}
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="***********"
                secureTextEntry={!showPassword}
                placeholderTextColor={COLORS.TEXT_GRAY}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialIcons
                  name={showPassword ? "visibility" : "visibility-off"}
                  size={20}
                  color={COLORS.TEXT_GRAY}
                  style={styles.visibilityIcon}
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons
                name="lock-outline"
                size={20}
                color={COLORS.TEXT_GRAY}
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="***********"
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor={COLORS.TEXT_GRAY}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <MaterialIcons
                  name={showConfirmPassword ? "visibility" : "visibility-off"}
                  size={20}
                  color={COLORS.TEXT_GRAY}
                  style={styles.visibilityIcon}
                />
              </TouchableOpacity>
            </View>

            {/* Sign up Button */}
            <TouchableOpacity style={styles.signupButton}>
              <Text style={styles.signupButtonText}>Sign up</Text>
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity>
              <Text style={styles.loginLink}>Login Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 40,
    paddingTop: height * 0.05,
  },
  container: {
    paddingHorizontal: 30,
  },
  logoContainer: {
    marginBottom: 40,
    alignSelf: "flex-start",
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: COLORS.NAVY_BLUE,
    marginBottom: 40,
  },
  form: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.NAVY_BLUE,
    marginBottom: 8,
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
    marginBottom: 20,
    height: 50,
    paddingHorizontal: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    height: "100%",
  },
  visibilityIcon: {
    marginLeft: 10,
  },
  signupButton: {
    backgroundColor: COLORS.NAVY_BLUE,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
    height: 50,
    justifyContent: "center",
  },
  signupButtonText: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 40,
  },
  loginText: {
    fontSize: 14,
    color: "#444",
    marginRight: 5,
  },
  loginLink: {
    fontSize: 14,
    color: COLORS.NAVY_BLUE,
    fontWeight: "700",
  },
});
