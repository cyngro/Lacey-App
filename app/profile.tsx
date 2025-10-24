import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Header from '../components/Header';
import BottomNavbar from '../components/BottomNavbar';
import { useAuth } from '../contexts/AuthContext';
import { FaceIdService } from '../utils/faceIdService';

export default function ProfileScreen() {
  const router = useRouter();
  const { logout, faceIdEnabled, faceIdAvailable, toggleFaceId, setupFaceIdCredentials } = useAuth();
  const [isTogglingFaceId, setIsTogglingFaceId] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [credentialsLoading, setCredentialsLoading] = useState(false);

  const handleLogout = () => {
    console.log("Profile: Logout button pressed");
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            console.log("Profile: User confirmed logout");
            await logout();
            console.log("Profile: Logout completed");
            // Force navigation to login screen
            setTimeout(() => {
              console.log("Profile: Forcing navigation to login screen");
              router.replace('/');
            }, 200);
          }
        }
      ]
    );
  };

  const handleFaceIdToggle = async (enabled: boolean) => {
    if (isTogglingFaceId) return;
    
    setIsTogglingFaceId(true);
    
    try {
      if (enabled && !faceIdAvailable) {
        Alert.alert(
          'Face ID Not Available',
          'Face ID is not available on this device. Please ensure Face ID is set up in your device settings.',
          [{ text: 'OK' }]
        );
        return;
      }

      if (enabled) {
        // Show credentials modal for Face ID setup
        setShowCredentialsModal(true);
        setIsTogglingFaceId(false);
        return;
      }

      const success = await toggleFaceId(enabled);
      if (!success) {
        Alert.alert(
          'Error',
          'Failed to update Face ID settings. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error toggling Face ID:', error);
      Alert.alert(
        'Error',
        'An error occurred while updating Face ID settings.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsTogglingFaceId(false);
    }
  };

  const handleCredentialsSubmit = async () => {
    if (!credentials.email.trim() || !credentials.password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setCredentialsLoading(true);
    
    try {
      // First test Face ID authentication
      const faceIdResult = await FaceIdService.authenticate('Enable Face ID for quick access to your account');
      if (!faceIdResult.success) {
        Alert.alert(
          'Face ID Authentication Failed',
          FaceIdService.getErrorMessage(faceIdResult.errorCode),
          [{ text: 'OK' }]
        );
        return;
      }

      // Setup Face ID credentials
      const setupSuccess = await setupFaceIdCredentials(credentials.email, credentials.password);
      
      if (setupSuccess) {
        // Enable Face ID preference
        const toggleSuccess = await toggleFaceId(true);
        
        if (toggleSuccess) {
          Alert.alert(
            'Success',
            'Face ID has been enabled successfully! You can now use Face ID to login.',
            [{ text: 'OK' }]
          );
          setShowCredentialsModal(false);
          setCredentials({ email: '', password: '' });
        } else {
          Alert.alert(
            'Error',
            'Failed to enable Face ID. Please try again.',
            [{ text: 'OK' }]
          );
        }
      } else {
        Alert.alert(
          'Invalid Credentials',
          'The email and password you entered are incorrect. Please check your credentials and try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error setting up Face ID credentials:', error);
      Alert.alert(
        'Error',
        'An error occurred while setting up Face ID. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setCredentialsLoading(false);
    }
  };

  const handleCredentialsCancel = () => {
    setShowCredentialsModal(false);
    setCredentials({ email: '', password: '' });
    setShowPassword(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Title */}
        <View style={styles.profileTitleContainer}>
          <Text style={styles.profileTitle}>Profile</Text>
          <MaterialIcons name="person" size={24} color="#00234C" />
        </View>

        {/* Profile Options */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => router.push('/editProfile')}
          >
            <View style={styles.optionLeft}>
              <MaterialIcons name="person" size={24} color="#00234C" />
              <Text style={styles.optionTitle}>Edit Profile</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <MaterialIcons name="lock" size={24} color="#00234C" />
              <Text style={styles.optionTitle}>Change Password</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <MaterialIcons name="description" size={24} color="#00234C" />
              <Text style={styles.optionTitle}>Terms & Conditions</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <MaterialIcons name="description" size={24} color="#00234C" />
              <Text style={styles.optionTitle}>Privacy Policy</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => router.push('/company')}
          >
            <View style={styles.optionLeft}>
              <MaterialIcons name="business" size={24} color="#00234C" />
              <Text style={styles.optionTitle}>Switch Company</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Security Section */}
        <View style={styles.notificationsSection}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.notificationItem}>
            <View style={styles.optionLeft}>
              <MaterialIcons name="face" size={24} color="#00234C" />
              <View>
                <Text style={styles.optionTitle}>Face ID</Text>
                {!faceIdAvailable && (
                  <Text style={styles.optionSubtitle}>Not available on this device</Text>
                )}
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.toggle, faceIdEnabled && styles.toggleActive]}
              onPress={() => handleFaceIdToggle(!faceIdEnabled)}
              disabled={isTogglingFaceId || (!faceIdAvailable && !faceIdEnabled)}
            >
              <View style={[styles.toggleThumb, faceIdEnabled && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={24} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton}>
            <MaterialIcons name="delete" size={24} color="#fff" />
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNavbar
        activeTab="profile"
        onTabPress={(tab) => {
          if (tab === 'home') {
            router.push('/dashboard');
          } else if (tab === 'chat') {
            router.push('/chat');
          }
        }}
      />

      {/* Face ID Credentials Modal */}
      <Modal
        visible={showCredentialsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCredentialsCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Setup Face ID</Text>
              <TouchableOpacity onPress={handleCredentialsCancel}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalDescription}>
              Enter your email and password to enable Face ID authentication. Your credentials will be securely stored and used for Face ID login.
            </Text>

            <View style={styles.modalForm}>
              <Text style={styles.modalInputLabel}>Email</Text>
              <View style={styles.modalInputWrapper}>
                <MaterialIcons
                  name="mail-outline"
                  size={20}
                  color="#666"
                  style={styles.modalIcon}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={credentials.email}
                  onChangeText={(text) => setCredentials({ ...credentials, email: text })}
                  placeholderTextColor="#999"
                />
              </View>

              <Text style={styles.modalInputLabel}>Password</Text>
              <View style={styles.modalInputWrapper}>
                <MaterialIcons
                  name="lock-outline"
                  size={20}
                  color="#666"
                  style={styles.modalIcon}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  value={credentials.password}
                  onChangeText={(text) => setCredentials({ ...credentials, password: text })}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialIcons
                    name={showPassword ? "visibility" : "visibility-off"}
                    size={20}
                    color="#666"
                    style={styles.modalVisibilityIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={handleCredentialsCancel}
                disabled={credentialsLoading}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalSubmitButton, credentialsLoading && styles.modalSubmitButtonDisabled]}
                onPress={handleCredentialsSubmit}
                disabled={credentialsLoading || !credentials.email.trim() || !credentials.password}
              >
                {credentialsLoading ? (
                  <Text style={styles.modalSubmitText}>Setting up...</Text>
                ) : (
                  <Text style={styles.modalSubmitText}>Enable Face ID</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  profileTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00234C',
  },
  optionsContainer: {
    marginBottom: 32,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    color: '#00234C',
    marginLeft: 16,
    fontWeight: '500',
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginLeft: 16,
    marginTop: 2,
  },
  optionRight: {
    marginLeft: 16,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#00234C',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  notificationsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00234C',
    marginBottom: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  actionButtonsContainer: {
    gap: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00234C',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 12,
  },
  deleteText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00234C',
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalForm: {
    marginBottom: 24,
  },
  modalInputLabel: {
    fontSize: 14,
    color: '#00234C',
    marginBottom: 8,
    fontWeight: '500',
  },
  modalInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 16,
    height: 50,
    paddingHorizontal: 15,
  },
  modalIcon: {
    marginRight: 10,
  },
  modalInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    height: '100%',
  },
  modalVisibilityIcon: {
    marginLeft: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  modalSubmitButton: {
    flex: 1,
    backgroundColor: '#00234C',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSubmitButtonDisabled: {
    opacity: 0.6,
  },
  modalSubmitText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
