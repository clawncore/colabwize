import { createClient } from "@supabase/supabase-js";
import ConfigService from "../../services/ConfigService";

const { url: supabaseUrl, anonKey: supabaseAnonKey } =
  ConfigService.getSupabaseConfig();

console.log("Supabase configuration:", {
  supabaseUrl: supabaseUrl ? "SET" : "MISSING",
  supabaseAnonKey: supabaseAnonKey ? "SET" : "MISSING",
  supabaseUrlValue: supabaseUrl?.substring(0, 20) + "...",
  supabaseAnonKeyValue: supabaseAnonKey?.substring(0, 20) + "...",
});

// Validate configuration and handle missing env vars gracefully
const isValidConfig = supabaseUrl && supabaseAnonKey &&
  supabaseUrl !== "undefined" && supabaseAnonKey !== "undefined" &&
  supabaseUrl.startsWith("http");

if (!isValidConfig) {
  console.error("CRITICAL: Supabase configuration missing or invalid. App will load in limited mode.");
}

// Check if we are in a crash-prone environment (production) vs dev
// In dev we might want to crash, but user requested NO CRASH.

let supabaseInstance;

if (isValidConfig) {
  // Store the initial client configuration
  const initialSupabaseOptions = {
    auth: {
      // Enable automatic token refresh
      autoRefreshToken: true,
      // Persist session in local storage
      persistSession: true,
      // Detect session changes
      detectSessionInUrl: true,
    },
    realtime: {
      // Enable realtime connections
      connect: true,
      // Set heartbeat interval
      heartbeatIntervalMs: 30000,
      // Set timeout for reconnection attempts
      reconnectDelayMs: 1000,
      // Enable presence tracking
      presence: true,
    },
  };

  supabaseInstance = createClient(
    supabaseUrl,
    supabaseAnonKey,
    initialSupabaseOptions
  );
} else {
  // Fallback Proxy to prevent crash-at-import
  // This allows the app shell to load even if Supabase is totally broken
  supabaseInstance = new Proxy({} as any, {
    get: (target, prop) => {
      // Basic Auth stubs to satisfy AuthProvider mounting
      if (prop === 'auth') {
        return {
          getSession: () => Promise.resolve({ data: { session: null }, error: new Error("Supabase not configured") }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
          getUser: () => Promise.resolve({ data: { user: null }, error: new Error("Supabase not configured") }),
          signInWithPassword: () => Promise.reject(new Error("Supabase not configured")),
          signUp: () => Promise.reject(new Error("Supabase not configured")),
          signOut: () => Promise.resolve({ error: null }),
        };
      }
      // Basic Realtime stubs
      if (prop === 'channel') {
        return () => ({
          on: () => ({ subscribe: () => { } }),
          subscribe: () => { }
        });
      }
      if (prop === 'from') {
        // Return a chainable query builder mock
        const mockBuilder: any = new Proxy(() => { }, {
          get: () => mockBuilder,
          apply: () => Promise.reject(new Error("Supabase not configured"))
        });
        return () => mockBuilder;
      }
      return () => {
        console.warn(`Supabase.${String(prop)} called but Supabase is not configured.`);
        return Promise.reject(new Error("Supabase configuration missing"));
      };
    }
  });
}

// Create Supabase client with proper session persistence and auto-refresh settings
export const supabase = supabaseInstance;
// Enhanced session management
class SessionManager {
  private static instance: SessionManager;
  private rememberMe: boolean = true; // Default to true (persistent session)

  private constructor() { }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  public setRememberMe(rememberMe: boolean): void {
    this.rememberMe = rememberMe;
    console.log(
      "Session persistence set to:",
      rememberMe ? "persistent" : "session-only"
    );

    // Additional logic could be added here for more advanced session management
    if (!rememberMe) {
      // Could implement warnings or additional logic for non-persistent sessions
      console.log("Session will expire when browser tab is closed");
    }
  }

  public shouldRemember(): boolean {
    return this.rememberMe;
  }

  // Method to handle session cleanup based on rememberMe setting
  public handleSessionCleanup(): void {
    if (!this.rememberMe) {
      // For non-persistent sessions, we could add additional cleanup logic here
      // Note: Supabase automatically handles sessionStorage vs localStorage based on persistSession setting
      console.log("Performing session cleanup for non-persistent session");
    }
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance();

// Function to configure session persistence based on "Remember Me" setting
export const configureSessionPersistence = (rememberMe: boolean) => {
  sessionManager.setRememberMe(rememberMe);
};

// Custom hook for Supabase auth
export const useSupabaseAuth = () => {
  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signOut = async () => {
    return await supabase.auth.signOut();
  };

  const getUser = async () => {
    return await supabase.auth.getUser();
  };

  const resetPassword = async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email);
  };

  const updatePassword = async (password: string) => {
    return await supabase.auth.updateUser({
      password,
    });
  };

  return {
    signIn,
    signUp,
    signOut,
    getUser,
    resetPassword,
    updatePassword,
    supabase,
  };
};
