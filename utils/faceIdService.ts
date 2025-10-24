import * as LocalAuthentication from 'expo-local-authentication';

export interface FaceIdResult {
  success: boolean;
  error?: string;
  errorCode?: string;
}

export class FaceIdService {
  /**
   * Check if Face ID/Touch ID is available on the device
   */
  static async isAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Error checking Face ID availability:', error);
      return false;
    }
  }

  /**
   * Get the type of biometric authentication available
   */
  static async getBiometryType(): Promise<LocalAuthentication.AuthenticationType | null> {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION;
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return LocalAuthentication.AuthenticationType.FINGERPRINT;
      }
      return null;
    } catch (error) {
      console.error('Error getting biometry type:', error);
      return null;
    }
  }

  /**
   * Authenticate using Face ID/Touch ID
   */
  static async authenticate(reason: string = 'Authenticate to access your account'): Promise<FaceIdResult> {
    try {
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        return {
          success: false,
          error: 'Face ID is not available on this device',
          errorCode: 'NOT_AVAILABLE'
        };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        fallbackLabel: 'Use Password',
        disableDeviceFallback: false,
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        return { success: true };
      } else {
        // Handle specific error cases
        let errorCode = result.error || 'AUTHENTICATION_FAILED';
        let errorMessage = 'Authentication failed';
        
        if (result.error === 'user_cancel') {
          errorCode = 'user_cancel';
          errorMessage = 'Authentication was cancelled';
        } else if (result.error === 'system_cancel') {
          errorCode = 'system_cancel';
          errorMessage = 'Authentication was cancelled by the system';
        } else if (result.error === 'user_fallback') {
          errorCode = 'user_fallback';
          errorMessage = 'User chose to use password instead';
        }
        
        return {
          success: false,
          error: errorMessage,
          errorCode: errorCode
        };
      }
    } catch (error) {
      console.error('Face ID authentication error:', error);
      return {
        success: false,
        error: 'An error occurred during authentication',
        errorCode: 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * Get user-friendly error message for Face ID errors
   */
  static getErrorMessage(errorCode?: string): string {
    switch (errorCode) {
      case 'NOT_AVAILABLE':
        return 'Face ID is not available on this device';
      case 'AUTHENTICATION_FAILED':
        return 'Authentication failed. Please try again';
      case 'USER_CANCEL':
        return 'Authentication was cancelled';
      case 'SYSTEM_CANCEL':
        return 'Authentication was cancelled by the system';
      case 'USER_FALLBACK':
        return 'User chose to use password instead';
      case 'BIOMETRIC_NOT_ENROLLED':
        return 'No Face ID is enrolled on this device';
      case 'BIOMETRIC_NOT_AVAILABLE':
        return 'Face ID is not available';
      case 'BIOMETRIC_NOT_SUPPORTED':
        return 'Face ID is not supported on this device';
      case 'BIOMETRIC_LOCKOUT':
        return 'Face ID is temporarily locked. Please try again later';
      case 'BIOMETRIC_LOCKOUT_PERMANENT':
        return 'Face ID is permanently locked. Please use your password';
      case 'NO_CREDENTIALS':
        return 'Please setup Face ID credentials first';
      case 'LOGIN_FAILED':
        return 'Login failed with saved credentials';
      case 'NO_TOKEN':
        return 'No authentication token received';
      case 'NETWORK_ERROR':
        return 'Network error during Face ID login';
      default:
        return 'Authentication failed. Please try again';
    }
  }
}
