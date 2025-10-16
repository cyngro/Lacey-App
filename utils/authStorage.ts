// Lightweight, safe wrappers around token storage.
// Uses expo-secure-store if available; otherwise no-ops (so code compiles without the package installed).

let secureStore: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  secureStore = require("expo-secure-store");
} catch (_err) {
  // Module not installed; fall back to no-op implementations
  secureStore = null;
}

const TOKEN_KEY = "auth_token";

export async function saveToken(token: string): Promise<void> {
  if (secureStore && typeof secureStore.setItemAsync === "function") {
    try {
      await secureStore.setItemAsync(TOKEN_KEY, token);
    } catch (_e) {}
  }
}

export async function getToken(): Promise<string | null> {
  if (secureStore && typeof secureStore.getItemAsync === "function") {
    try {
      return await secureStore.getItemAsync(TOKEN_KEY);
    } catch (_e) {
      return null;
    }
  }
  return null;
}

export async function clearToken(): Promise<void> {
  if (secureStore && typeof secureStore.deleteItemAsync === "function") {
    try {
      await secureStore.deleteItemAsync(TOKEN_KEY);
    } catch (_e) {}
  }
}


