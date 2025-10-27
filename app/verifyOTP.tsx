import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_URL } from '../constants/api';

export default function VerifyOTPScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const validateOTP = (otp: string) => {
    return /^\d{6}$/.test(otp);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!otp.trim()) {
      newErrors.otp = 'OTP is required';
    } else if (!validateOTP(otp)) {
      newErrors.otp = 'Please enter a valid 6-digit OTP';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerifyOTP = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otp: otp.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Navigate to reset password screen with email and OTP
        router.push({
          pathname: '/resetPassword',
          params: { email: email, otp: otp.trim() }
        });
      } else {
        Alert.alert('Error', data.msg || 'Invalid or expired OTP');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      Alert.alert('Network Error', 'Unable to verify OTP. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setResendLoading(true);
      
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email
        })
      });

      const data = await response.json();

      if (response.ok) {
        setTimeLeft(120); // Reset timer to 2 minutes
        Alert.alert('Success', 'New OTP has been sent to your email');
      } else {
        Alert.alert('Error', data.msg || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      Alert.alert('Network Error', 'Unable to resend OTP. Please check your connection.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
            <Image source={require("../assets/images/signuplogo.png")} resizeMode="contain" />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#00234C" />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            We have sent a 6-digit OTP to {email}. Please enter the OTP below.
          </Text>


          {/* OTP Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Enter OTP</Text>
            <View style={[styles.inputWrapper, errors.otp && styles.inputError]}>
              <MaterialIcons name="security" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={otp}
                onChangeText={(text) => {
                  setOtp(text);
                  if (errors.otp) setErrors(prev => ({ ...prev, otp: '' }));
                }}
                placeholder="Enter 6-digit OTP"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={6}
                autoFocus
              />
            </View>
            {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}
          </View>

          {/* Verify OTP Button */}
          <TouchableOpacity 
            onPress={handleVerifyOTP} 
            disabled={loading || !otp.trim() || timeLeft === 0}
            style={[
              styles.button, 
              (loading || !otp.trim() || timeLeft === 0) && styles.buttonDisabled
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify OTP</Text>
            )}
          </TouchableOpacity>

          {/* Resend OTP */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn&apos;t receive the OTP?</Text>
            <TouchableOpacity 
              onPress={handleResendOTP}
              disabled={resendLoading || timeLeft > 0}
              style={[
                styles.resendButton,
                (resendLoading || timeLeft > 0) && styles.resendButtonDisabled
              ]}
            >
              {resendLoading ? (
                <ActivityIndicator size="small" color="#00234C" />
              ) : (
                <Text style={styles.resendButtonText}>
                  {timeLeft > 0 ? `Resend in ${formatTime(timeLeft)}` : 'Resend OTP'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Remember your password?</Text>
            <TouchableOpacity onPress={() => router.push('/')}>
              <Text style={styles.loginLink}>Login Now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Light grey background
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff', // White card background
    // margin: 10,
    // borderRadius: 10,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  logoContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    top: 0,
  },
  logo: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#00234C', // Dark blue
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00234C', // Dark blue
    marginBottom: 10,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666', // Grey
    marginBottom: 20,
    lineHeight: 22,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  timerText: {
    fontSize: 14,
    color: '#856404',
    marginLeft: 8,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#333', // Dark grey
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0', // Light grey input background
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    letterSpacing: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  button: {
    backgroundColor: '#00234C', // Dark blue
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resendText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  resendButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00234C',
  },
  resendButtonDisabled: {
    opacity: 0.6,
  },
  resendButtonText: {
    fontSize: 14,
    color: '#00234C',
    fontWeight: '600',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
    color: '#666', // Grey
    marginRight: 5,
  },
  loginLink: {
    fontSize: 14,
    color: '#00234C', // Dark blue
    fontWeight: '700',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
  },
});
