import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import React, { useRef, useState } from "react";
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
import { API_URL } from "../constants/api";
import { useAuth } from "../contexts/AuthContext";
import { saveToken } from "../utils/authStorage";
import { FaceIdService } from "../utils/faceIdService";

const { height } = Dimensions.get("window");



export default function LoginScreen() {
  const router = useRouter();
  const { login, faceIdEnabled, faceIdAvailable, authenticateWithFaceId, setupFaceIdCredentials, hasFaceIdCredentials } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ identifier?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);
  const [faceIdLoading, setFaceIdLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);


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
    
    console.log("🔍 Login Debug Info:");
    console.log("📧 Email:", identifier.trim());
    console.log("🔑 Password length:", password.length);
    console.log("🌐 API URL:", API_URL);
    console.log("📡 Full URL:", `${API_URL}/api/auth/signin`);
    
    try {
      const response = await fetch(`${API_URL}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: identifier.trim(), password }),
      });  
      
      console.log("📊 Response Status:", response.status);
      console.log("✅ Response OK:", response.ok);
      console.log("📋 Response Headers:", response.headers);
      
      const data = await response.json().catch((parseError) => {
        console.error("❌ JSON Parse Error:", parseError);
        return { error: "Invalid JSON response" };
      });
      
      console.log("📦 Response Data:", data);
      
      if (!response.ok) {
        const message = data?.message || data?.error || "Invalid credentials";
        console.log("❌ Login failed:", message);
        setErrors((e) => ({ ...e, general: message }));
        return;
      }
      if (data?.token) { 
        console.log("✅ Login successful - Token received");
        await saveToken(String(data.token)); 
        console.log("💾 Token saved to storage");
        await login(String(data.token)); 
        console.log("🔐 Auth context updated");
        router.push("/company"); 
      } else {
        console.log("❌ No token in response");
        setErrors((e) => ({ ...e, general: "No authentication token received" }));
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      console.error('Error type:', (error as Error).name);
      console.error('Error message:', (error as Error).message);
      setErrors((e) => ({ ...e, general: `Network error: ${(error as Error).message}` }));
    } finally {
      setLoading(false);
    }
  }

  async function handleFaceIdLogin() {
    if (faceIdLoading) return;
    
    setFaceIdLoading(true);
    setErrors({});
    
    try {
      // Check if Face ID credentials are already set up
      const hasCredentials = await hasFaceIdCredentials();
      
      if (!hasCredentials) {
        // No credentials set up, ask user to enter them
        if (!identifier.trim() || !password) {
          setErrors((e) => ({ 
            ...e, 
            general: "Please enter your email and password to setup Face ID" 
          }));
          setFaceIdLoading(false);
          return;
        }
        
        // Setup Face ID credentials
        const setupSuccess = await setupFaceIdCredentials(identifier, password);
        
        if (!setupSuccess) {
          setErrors((e) => ({ 
            ...e, 
            general: "Invalid credentials. Please check your email and password." 
          }));
          setFaceIdLoading(false);
          return;
        }
        
        // Credentials saved successfully, now authenticate with Face ID
        const result = await authenticateWithFaceId();
        
        if (result.success) {
          console.log("Face ID setup and authentication successful, navigating to company");
          router.push("/company");
        } else {
          setErrors((e) => ({ 
            ...e, 
            general: FaceIdService.getErrorMessage(result.errorCode) 
          }));
        }
      } else {
        // Credentials already set up, just authenticate with Face ID
        const result = await authenticateWithFaceId();
        
        if (result.success) {
          console.log("Face ID authentication successful, navigating to company");
          router.push("/company");
        } else {
          setErrors((e) => ({ 
            ...e, 
            general: FaceIdService.getErrorMessage(result.errorCode) 
          }));
        }
      }
    } catch (error) {
      console.error('Face ID login error:', error);
      setErrors((e) => ({ 
        ...e, 
        general: "Face ID authentication failed. Please try again." 
      }));
    } finally {
      setFaceIdLoading(false);
    }
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
              placeholder="example@email.com"
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

          {/* Face ID Login Button */}
          {faceIdEnabled && faceIdAvailable && (
            <TouchableOpacity
              style={[styles.faceIdButton, faceIdLoading && styles.faceIdButtonDisabled]}
              onPress={handleFaceIdLogin}
              disabled={faceIdLoading}
            >
              {faceIdLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.faceIdButtonText}>Authenticating...</Text>
                </View>
              ) : (
                <>
                  <MaterialIcons name="face" size={20} color="#fff" />
                  <Text style={styles.faceIdButtonText}>Use Face ID</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Divider */}
          {faceIdEnabled && faceIdAvailable && (
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>
          )}

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, (loading || !identifier || !password) && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading || !identifier || !password}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#002147" size="small" />
                <Text style={styles.loadingText}>Signing in...</Text>
              </View>
            ) : (
              <Text style={styles.loginButtonText}>Login Now</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Sign Up */}
        <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don&apos;t have an account?</Text>
          <TouchableOpacity onPress={() => router.push("/signUp")}>
            <Text style={styles.signUpLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
        </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
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
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#002147",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  faceIdButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  faceIdButtonDisabled: {
    opacity: 0.7,
  },
  faceIdButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  dividerText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginHorizontal: 16,
    opacity: 0.8,
  },
  debugButton: {
    backgroundColor: "rgba(255, 0, 0, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 0, 0, 0.5)",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginVertical: 8,
    alignSelf: "center",
  },
  debugButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
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
});
