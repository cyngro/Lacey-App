import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ImageBackground,
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
import FaceRecognition from "../components/FaceRecognition";
import { API_URL } from "../constants/api";
import { useAuth } from "../contexts/AuthContext";
import { saveToken } from "../utils/authStorage";

const { height } = Dimensions.get("window");

type NavigationLike = { navigate: (route: string) => void } | undefined;


export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ identifier?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);
  const [showFaceRecognition, setShowFaceRecognition] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const isEmail = useMemo(() => /.+@.+\..+/.test(identifier.trim()), [identifier]);

  function scrollToEnd() {
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }, Platform.OS === "ios" ? 300 : 300);
  }

  function validateForm() {
    const nextErrors: { identifier?: string; password?: string } = {};
    const id = identifier.trim();
    if (!id) {
      nextErrors.identifier = "Username or email is required";
    } else {
      const looksLikeEmail = /.+@.+\..+/.test(id);
      if (!looksLikeEmail && id.length < 3) {
        nextErrors.identifier = "Username must be at least 3 characters";
      }
    }

    if (!password) {
      nextErrors.password = "Password is required";
    } else if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleLogin() {
    if (loading) return;
    setErrors({});
    const ok = validateForm();
    if (!ok) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: identifier.trim(), password }),
      });  
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = data?.message || "Invalid credentials";
        setErrors((e) => ({ ...e, general: message }));
        return;
      }
      if (data?.token) { 
        console.log("Login successful - Token received:", data.token ? "Token exists" : "No token");
        await saveToken(String(data.token)); 
        console.log("Login successful - Token saved to storage");
        await login(String(data.token)); 
        console.log("Login successful - Auth context updated");
        router.push("/company"); 
      }
    } catch (err) {
      setErrors((e) => ({ ...e, general: "Network error. Please try again." }));
    } finally {
      setLoading(false);
    }
  }

  function handleFaceRecognition() {
    setShowFaceRecognition(true);
  }

  function handleFaceDetected(faceData: any) {
    console.log("Face detected:", faceData);
    setShowFaceRecognition(false);
    Alert.alert("Face Recognition", "Face detected successfully! Please complete login with your credentials.");
  }

  function handleCloseFaceRecognition() {
    setShowFaceRecognition(false);
  }

  return (
    <ImageBackground
      source={require("../assets/images/background.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
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
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Welcome */}
        <View style={styles.textContainer}>
          <Text style={styles.welcomeTitle}>
          Lacey Business Suite
          </Text>
          <Text style={styles.subtitle}>
            Enter your credentials to continue
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.inputLabel}>Username/Email</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons
              name="person-outline"
              size={20}
              color="#fff"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Example@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#ddd"
              value={identifier}
              onChangeText={setIdentifier}
              returnKeyType="next"
            />
          </View>
          {!!errors.identifier && <Text style={styles.errorText}>{errors.identifier}</Text>}

          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons
              name="lock-outline"
              size={20}
              color="#fff"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="***********"
              secureTextEntry={!showPassword} // 👈 Toggle here
              placeholderTextColor="#ddd"
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              onFocus={() => scrollToEnd()}
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <MaterialIcons
                name={showPassword ? "visibility" : "visibility-off"}
                size={20}
                color="#fff"
                style={styles.visibilityIcon}
              />
            </TouchableOpacity>
          </View>
          {!!errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          {!!errors.general && (
            <View style={styles.errorBanner}>
              <MaterialIcons name="error-outline" size={18} color="#b00020" />
              <Text style={styles.errorBannerText}>{errors.general}</Text>
            </View>
          )}

          <TouchableOpacity onPress={() => Alert.alert("Forgot Password", "Feature coming soon!")}>
            <Text style={styles.forgotPassword}>Forgot Password</Text>
          </TouchableOpacity>

          {/* Face Recognition Button */}
          <TouchableOpacity 
            style={styles.faceRecognitionButton}
            onPress={handleFaceRecognition}
          >
            <MaterialIcons name="face" size={20} color="#fff" />
            <Text style={styles.faceRecognitionButtonText}>Face Recognition</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, (loading || !identifier || !password) && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading || !identifier || !password}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Login Now</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Sign Up */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.push("/signUp")}>
            <Text style={styles.signUpLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
        </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      
      {/* Face Recognition Modal */}
      {showFaceRecognition && (
        <View style={styles.faceRecognitionModal}>
          <FaceRecognition
            onFaceDetected={handleFaceDetected}
            onClose={handleCloseFaceRecognition}
          />
        </View>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.0)",
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  keyboardAvoidingView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: Platform.OS === "ios" ? 20 : 30 },
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: height * 0.1,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoImage: {
    width: 96,
    height: 96,
  },
  textContainer: {
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 10,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
  },
  form: {
    marginBottom: 20,
  },
  errorText: {
    color: "#b00020",
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fdecea",
    borderRadius: 8,
    marginBottom: 12,
  },
  errorBannerText: {
    color: "#b00020",
    marginLeft: 8,
    fontSize: 13,
  },
  inputLabel: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 8,
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
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
    color: "#fff",
    height: "100%",
  },
  visibilityIcon: {
    marginLeft: 10,
  },
  forgotPassword: {
    textAlign: "left",
    color: "#fff",
    fontWeight: "500",
    fontSize: 14,
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    height: 50,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "#002147",
    fontSize: 18,
    fontWeight: "600",
    paddingBottom: 0,
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: height * 0.15,
  },
  signUpText: {
    fontSize: 14,
    color: "#fff",
    marginRight: 5,
  },
  signUpLink: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "700",
  },
  faceRecognitionButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  faceRecognitionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  faceRecognitionModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
});
