import { Platform } from "react-native";

const LOCAL_IP = "http://localhost:5001"; // your Mac’s IP
const ANDROID_LOCALHOST = "http://localhost:5001";
const DEFAULT_HOST = Platform.OS === "android" ? ANDROID_LOCALHOST : LOCAL_IP;

export const API_URL = process.env.EXPO_PUBLIC_API_URL || `http://${`localhost`}:5001`;