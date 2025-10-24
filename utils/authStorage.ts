// Lightweight, safe wrappers around token storage.
// Uses expo-secure-store if available; otherwise falls back to in-memory storage.

let secureStore: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  secureStore = require("expo-secure-store");
} catch (_err) {
  // Module not installed; fall back to in-memory storage
  secureStore = null;
}

const TOKEN_KEY = "auth_token";
const FACE_ID_ENABLED_KEY = "face_id_enabled";
const FACE_ID_CREDENTIALS_KEY = "face_id_credentials";

// In-memory storage fallback
let memoryToken: string | null = null;
let memoryFaceIdEnabled: boolean | null = null;
let memoryFaceIdCredentials: string | null = null;

export async function saveToken(token: string): Promise<void> {
  if (secureStore && typeof secureStore.setItemAsync === "function") {
    try {
      await secureStore.setItemAsync(TOKEN_KEY, token);
      console.log("Token saved to secure store");
    } catch (_e) {
      console.log("Secure store failed, using in-memory storage");
      memoryToken = token;
    }
  } else {
    console.log("Secure store not available, using in-memory storage");
    memoryToken = token;
  }
}

export async function getToken(): Promise<string | null> {
  if (secureStore && typeof secureStore.getItemAsync === "function") {
    try {
      const token = await secureStore.getItemAsync(TOKEN_KEY);
      console.log("Token retrieved from secure store:", token ? "exists" : "null");
      return token;
    } catch (_e) {
      console.log("Secure store failed, using in-memory storage");
      console.log("Token retrieved from memory:", memoryToken ? "exists" : "null");
      return memoryToken;
    }
  } else {
    console.log("Secure store not available, using in-memory storage");
    console.log("Token retrieved from memory:", memoryToken ? "exists" : "null");
    return memoryToken;
  }
}

export async function clearToken(): Promise<void> {
  console.log("AuthStorage: Starting token clear process");
  console.log("AuthStorage: Secure store available:", secureStore ? "yes" : "no");
  console.log("AuthStorage: Current memory token:", memoryToken ? "exists" : "null");
  
  if (secureStore && typeof secureStore.deleteItemAsync === "function") {
    try {
      await secureStore.deleteItemAsync(TOKEN_KEY);
      console.log("AuthStorage: Token cleared from secure store");
    } catch (_e) {
      console.log("AuthStorage: Secure store failed, clearing from memory");
      memoryToken = null;
    }
  } else {
    console.log("AuthStorage: Secure store not available, clearing from memory");
    memoryToken = null;
  }
  
  console.log("AuthStorage: Token clear process completed");
  console.log("AuthStorage: Final memory token:", memoryToken ? "exists" : "null");
}

// Face ID preference storage functions
export async function saveFaceIdPreference(enabled: boolean): Promise<void> {
  const value = enabled.toString();
  if (secureStore && typeof secureStore.setItemAsync === "function") {
    try {
      await secureStore.setItemAsync(FACE_ID_ENABLED_KEY, value);
      console.log("Face ID preference saved to secure store:", enabled);
    } catch (_e) {
      console.log("Secure store failed, using in-memory storage for Face ID preference");
      memoryFaceIdEnabled = enabled;
    }
  } else {
    console.log("Secure store not available, using in-memory storage for Face ID preference");
    memoryFaceIdEnabled = enabled;
  }
}

export async function getFaceIdPreference(): Promise<boolean> {
  if (secureStore && typeof secureStore.getItemAsync === "function") {
    try {
      const value = await secureStore.getItemAsync(FACE_ID_ENABLED_KEY);
      const enabled = value === "true";
      console.log("Face ID preference retrieved from secure store:", enabled);
      return enabled;
    } catch (_e) {
      console.log("Secure store failed, using in-memory storage for Face ID preference");
      console.log("Face ID preference retrieved from memory:", memoryFaceIdEnabled);
      return memoryFaceIdEnabled || false;
    }
  } else {
    console.log("Secure store not available, using in-memory storage for Face ID preference");
    console.log("Face ID preference retrieved from memory:", memoryFaceIdEnabled);
    return memoryFaceIdEnabled || false;
  }
}

export async function clearFaceIdPreference(): Promise<void> {
  console.log("AuthStorage: Starting Face ID preference clear process");
  
  if (secureStore && typeof secureStore.deleteItemAsync === "function") {
    try {
      await secureStore.deleteItemAsync(FACE_ID_ENABLED_KEY);
      console.log("AuthStorage: Face ID preference cleared from secure store");
    } catch (_e) {
      console.log("AuthStorage: Secure store failed, clearing Face ID preference from memory");
      memoryFaceIdEnabled = null;
    }
  } else {
    console.log("AuthStorage: Secure store not available, clearing Face ID preference from memory");
    memoryFaceIdEnabled = null;
  }
  
  console.log("AuthStorage: Face ID preference clear process completed");
}

// Face ID credentials storage functions
export async function saveFaceIdCredentials(credentials: { email: string; password: string }): Promise<void> {
  console.log("Saving Face ID credentials for email:", credentials.email);
  
  const credentialsData = JSON.stringify(credentials);
  
  if (secureStore && typeof secureStore.setItemAsync === "function") {
    try {
      await secureStore.setItemAsync(FACE_ID_CREDENTIALS_KEY, credentialsData);
      console.log("Face ID credentials saved to secure store successfully");
    } catch (error) {
      console.log("Secure store failed, using in-memory storage for Face ID credentials:", error);
      memoryFaceIdCredentials = credentialsData;
    }
  } else {
    console.log("Secure store not available, using in-memory storage for Face ID credentials");
    memoryFaceIdCredentials = credentialsData;
  }
}

export async function getFaceIdCredentials(): Promise<{ email: string; password: string } | null> {
  console.log("Retrieving Face ID credentials...");
  
  if (secureStore && typeof secureStore.getItemAsync === "function") {
    try {
      const credentials = await secureStore.getItemAsync(FACE_ID_CREDENTIALS_KEY);
      console.log("Face ID credentials retrieved from secure store:", credentials ? "exists" : "null");
      return credentials ? JSON.parse(credentials) : null;
    } catch (error) {
      console.log("Secure store failed, using in-memory storage for Face ID credentials:", error);
      console.log("Face ID credentials retrieved from memory:", memoryFaceIdCredentials ? "exists" : "null");
      return memoryFaceIdCredentials ? JSON.parse(memoryFaceIdCredentials) : null;
    }
  } else {
    console.log("Secure store not available, using in-memory storage for Face ID credentials");
    console.log("Face ID credentials retrieved from memory:", memoryFaceIdCredentials ? "exists" : "null");
    return memoryFaceIdCredentials ? JSON.parse(memoryFaceIdCredentials) : null;
  }
}

export async function clearFaceIdCredentials(): Promise<void> {
  console.log("AuthStorage: Starting Face ID credentials clear process");
  
  if (secureStore && typeof secureStore.deleteItemAsync === "function") {
    try {
      await secureStore.deleteItemAsync(FACE_ID_CREDENTIALS_KEY);
      console.log("AuthStorage: Face ID credentials cleared from secure store");
    } catch (_e) {
      console.log("AuthStorage: Secure store failed, clearing Face ID credentials from memory");
      memoryFaceIdCredentials = null;
    }
  } else {
    console.log("AuthStorage: Secure store not available, clearing Face ID credentials from memory");
    memoryFaceIdCredentials = null;
  }
  
  console.log("AuthStorage: Face ID credentials clear process completed");
}


