import { Platform } from "react-native";

const LOCAL_IP = "192.168.18.133"; // your Mac’s IP
const ANDROID_LOCALHOST = "10.0.2.2";
const DEFAULT_HOST = Platform.OS === "android" ? ANDROID_LOCALHOST : LOCAL_IP;

export const API_URL = process.env.EXPO_PUBLIC_API_URL || `http://${`10.0.2.2`}:5000`;