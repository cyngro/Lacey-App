import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { API_URL } from "../constants/api";
import { useAuth } from "../contexts/AuthContext";
import { saveToken } from "../utils/authStorage";

const { height } = Dimensions.get("window");

export default function SignUpScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const scrollViewRef = useRef<ScrollView>(null);

  const emailValid = useMemo(() => /.+@.+\..+/.test(email.trim()), [email]);

  function scrollToInput(inputName: string) {
    setTimeout(() => {
      if (scrollViewRef.current) {
        const inputPositions: Record<string, number> = {
          fullName: 0,
          email: 150,
          phone: 300,
          password: 450,
          confirmPassword: 600,
        };
        scrollViewRef.current.scrollTo({
          y: inputPositions[inputName] || 0,
          animated: true,
        });
      }
    }, Platform.OS === "ios" ? 300 : 300);
  }

  function scrollToEnd() {
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }, Platform.OS === "ios" ? 300 : 300);
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = "Full name is required";
    if (!emailValid) next.email = "Enter a valid email";
    if (!phone.trim()) next.phone = "Phone is required";
    if (password.length < 6) next.password = "Password must be at least 6 characters";
    if (confirmPassword !== password) next.confirmPassword = "Passwords do not match";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSignUp() {
    if (loading) return;
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        Alert.alert("Sign up failed", data?.msg || data?.message || "Please check your details and try again.");
        return;
      }
      
      // Auto-login after successful signup
      if (data.token) {
        console.log("Signup - Token received:", data.token ? "Token exists" : "No token");
        await saveToken(data.token);
        console.log("Signup - Token saved to storage");
        await login(data.token);
        console.log("Signup - User logged in via context");
        
        // Wait a bit for the auth context to update
        setTimeout(() => {
          Alert.alert("Success", data?.msg || "Account created successfully!", [
            { text: "OK", onPress: () => {
              console.log("Signup - Redirecting to company selection");
              // Force navigation to company page
              router.replace("/company");
            }}
          ]);
        }, 500);
      } else {
        console.log("Signup - No token received, redirecting to login");
        Alert.alert("Success", data?.msg || "Account created successfully!", [
          { text: "OK", onPress: () => router.push("/") }
        ]);
      }
    } catch (e) {
      Alert.alert("Network error", "Unable to connect to server. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.keyboardAvoidingView} 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
          <ScrollView 
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent} 
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.container}>

            <View style={styles.logoContainer}>
              <Image source={require("../assets/images/signuplogo.png")} style={styles.logo} resizeMode="contain" />
            </View>
            {/* <TouchableOpacity
              accessibilityRole="button"
              onPress={() => router.push("/")}
              style={styles.backButton}
            >
              <MaterialIcons name="arrow-back" size={22} color="#00234C" />
            </TouchableOpacity> */}
            <Text style={styles.title}>Create Account</Text>

            {/* Full Name */}
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="person-outline" size={20} color="#00234C" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Your full name"
                placeholderTextColor="#00234C"
                autoCapitalize="words"
                value={fullName}
                onChangeText={setFullName}
                onFocus={() => scrollToInput("fullName")}
                returnKeyType="next"
              />
            </View>
            {!!errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}

            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="mail-outline" size={20} color="#00234C" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="name@email.com"
                placeholderTextColor="#00234C"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                onFocus={() => scrollToInput("email")}
                returnKeyType="next"
              />
            </View>
            {!!errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            {/* Phone */}
            <Text style={styles.label}>Phone</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="phone-iphone" size={20} color="#00234C" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="111 222 3344"
                placeholderTextColor="#00234C"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                onFocus={() => scrollToInput("phone")}
                returnKeyType="next"
              />
            </View>
            {!!errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock-outline" size={20} color="#00234C" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="********"
                placeholderTextColor="#00234C"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                onFocus={() => scrollToEnd()}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color="#00234C" style={styles.visibilityIcon} />
              </TouchableOpacity>
            </View>
            {!!errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            {/* Confirm Password */}
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock-outline" size={20} color="#00234C" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="********"
                placeholderTextColor="#00234C"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => scrollToEnd()}
                onSubmitEditing={handleSignUp}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <MaterialIcons name={showConfirmPassword ? "visibility" : "visibility-off"} size={20} color="#00234C" style={styles.visibilityIcon} />
              </TouchableOpacity>
            </View>
            {!!errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

            {/* Submit */}
            <TouchableOpacity
              style={[styles.signupButton, (loading || !fullName || !email || !phone || !password || !confirmPassword) && styles.signupButtonDisabled]}
              onPress={handleSignUp}
              disabled={loading || !fullName || !email || !phone || !password || !confirmPassword}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#00234C" size="small" />
                  <Text style={styles.loadingText}>Creating account...</Text>
                </View>
              ) : (
                <Text style={styles.signupButtonText}>Sign up</Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.push("/")}>
                <Text style={styles.loginLink}>Login Now</Text>
              </TouchableOpacity>
            </View>
          </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  keyboardAvoidingView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: Platform.OS === "ios" ? 20 : 30 },
  container: { flex: 1, paddingHorizontal: 30, paddingTop: height * 0.08 },
  backButton: { alignSelf: "flex-start", paddingVertical: 6 },
  logoContainer: { marginBottom: 40 },
  logo: { width: 36, height: 35 },
  title: { fontSize: 28, fontWeight: "600", color: "#00234C", marginBottom: 30 },
  label: { fontSize: 14, color: "#00234C", marginBottom: 8, fontWeight: "500" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EBEBEB",
    borderRadius: 8,
    marginBottom: 18,
    height: 50,
    paddingHorizontal: 15,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: "#00234C", height: "100%" },
  visibilityIcon: { marginLeft: 10 },
  errorText: { color: "#b00020", fontSize: 12, marginTop: -10, marginBottom: 12 },
  signupButton: {
    backgroundColor: "#fff",
    height: 50,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    marginTop: 10,
  },
  signupButtonDisabled: { opacity: 0.7 },
  signupButtonText: { color: "#00234C", fontSize: 18, fontWeight: "600" },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#00234C",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  loginRow: { flexDirection: "row", justifyContent: "center", marginTop: height * 0.04 },
  loginText: { color: "#00234C", fontSize: 14, marginRight: 6 },
  loginLink: { color: "#00234C", fontSize: 14, fontWeight: "700" },
});