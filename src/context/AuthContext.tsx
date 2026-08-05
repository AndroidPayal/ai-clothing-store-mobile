import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { getToken, removeToken, saveToken } from "@/storage/tokenStorage";

import { loginUser, getCurrentUser } from "@/api/authApi";

type User = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const [token, setToken] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    restoreAuth();
  }, []);
  async function restoreAuth() {
    try {
      console.log("RESTORING AUTH...");
      const storedToken = await getToken();

      console.log("STORED TOKEN:", storedToken ? "TOKEN FOUND" : "NO TOKEN");
      if (!storedToken) {
        return;
      }
      console.log("CALLING MOBILE-ME...");
      const response = await getCurrentUser(storedToken);

      console.log("MOBILE-ME RESPONSE:", response);
      setToken(storedToken);
      setUser(response.user);

      console.log("AUTH RESTORED:", response.user);
    } catch (error) {
      console.error("RESTORE AUTH ERROR:", error);

      await removeToken();

      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const response = await loginUser({
      email,
      password,
    });

    await saveToken(response.token);

    setToken(response.token);
    setUser(response.user);
  }

  async function logout() {
    try {
      await removeToken();

      setToken(null);
      setUser(null);

      console.log("LOGOUT SUCCESS");
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
