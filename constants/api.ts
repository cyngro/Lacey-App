import { Platform } from "react-native";

const LOCAL_IP = "http://localhost:5001"; // your Mac’s IP
// const ANDROID_LOCALHOST = "http://localhost:5001";
const ANDROID_LOCALHOST = "http://10.0.2.2:5001"; // Android emulator localhost
const DEFAULT_HOST = Platform.OS === "android" ? ANDROID_LOCALHOST : LOCAL_IP;
export const API_URL = `http://localhost:5001`;

// export const API_URL = process.env.EXPO_PUBLIC_API_URL || `http://${`localhost`}:5001`;

// const LOCAL_IP = "http://localhost:5001"; // your Mac's IP
// const ANDROID_LOCALHOST = "http://10.0.2.2:5001"; // Android emulator localhost
// const RAILWAY_URL = "https://lacey-backend-production.up.railway.app"; // Railway production URL
// const DEFAULT_HOST = Platform.OS === "android" ? ANDROID_LOCALHOST : LOCAL_IP;

export const API_URL = process.env.EXPO_PUBLIC_API_URL || RAILWAY_URL; 
