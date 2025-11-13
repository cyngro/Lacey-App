import { Platform } from "react-native";

// const ANDROID_LOCALHOST = "http://localhost:5001";

// const LOCAL_IP = "http://localhost:5001"; // your Mac's IP
// const ANDROID_LOCALHOST = "http://10.0.2.2:5001"; // Android emulator localhost
// const DEFAULT_HOST = Platform.OS === "android" ? ANDROID_LOCALHOST : LOCAL_IP;
// export const API_URL = `http://localhost:5001`;

// export const API_URL = process.env.EXPO_PUBLIC_API_URL || `http://${`localhost`}:5001`;

const LOCAL_IP = "http://localhost:5001"; // Local development
const ANDROID_LOCALHOST = "http://10.0.2.2:5001"; // Android emulator localhost
const PRODUCTION_URL = "https://api.solidrockstonework.com"; // Production backend URL
const DEFAULT_HOST = Platform.OS === "android" ? ANDROID_LOCALHOST : LOCAL_IP;

// For web platform, use relative path to leverage Vercel rewrites (no CORS issues)
// For mobile platforms, use the full production URL
// Environment variable EXPO_PUBLIC_API_URL can override this
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 
  (Platform.OS === 'web' ? '' : PRODUCTION_URL);

