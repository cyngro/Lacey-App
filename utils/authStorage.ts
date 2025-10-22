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

// In-memory storage fallback
let memoryToken: string | null = null;

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


