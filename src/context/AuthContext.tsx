import React, { createContext, useContext, useEffect, useState } from "react";
import { API_BASE_URL } from "../config";

export type Candidate = {
  _id?: string;
  id?: string;
  name: string;
  phone: string;
  email?: string;
  district: string;
  skills: string[];
  aadharNumber?: string;
  aadharVerified?: boolean;
  deviceId: string;
};

type LoginData = {
  phone: string;
  aadharNumber: string;
};

type AuthContextType = {
  candidate: Candidate | null;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<Candidate>;
  logout: () => void;
  register: (candidate: Candidate) => Promise<Candidate>;
  updateCandidate: (candidate: Candidate) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeCandidate = (user: any): Candidate => ({
  id: user.id,
  _id: user._id,
  name: user.name || "Candidate",
  phone: user.phone || "",
  email: user.email || "",
  district: user.district || "",
  skills: user.skills || [],
  aadharNumber: user.aadharNumber || "",
  aadharVerified: user.aadharVerified || false,
  deviceId:
    user.deviceId ||
    window.localStorage.getItem("hireSmartDeviceId") ||
    crypto.randomUUID(),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("candidateData");

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCandidate(parsed);
        setIsAuthenticated(true);
      } catch {
        window.localStorage.removeItem("candidateData");
      }
    }
  }, []);

  const saveCandidate = (cand: Candidate, token?: string) => {
    setCandidate(cand);
    setIsAuthenticated(true);
    window.localStorage.setItem("candidateData", JSON.stringify(cand));

    if (token) {
      window.localStorage.setItem("token", token);
    }
  };

  const login = async (data: LoginData): Promise<Candidate> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.message || "Login failed");
    }

    const loggedInCandidate = normalizeCandidate(result.user || result.candidate);
    saveCandidate(loggedInCandidate, result.token);

    return loggedInCandidate;
  };

  const register = async (cand: Candidate): Promise<Candidate> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...cand,
        deviceId:
          cand.deviceId ||
          window.localStorage.getItem("hireSmartDeviceId") ||
          crypto.randomUUID(),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.message || "Registration failed");
    }

    const registeredCandidate = normalizeCandidate(result.user || result.candidate);
    saveCandidate(registeredCandidate, result.token);

    return registeredCandidate;
  };

  const logout = () => {
    setCandidate(null);
    setIsAuthenticated(false);
    window.localStorage.removeItem("candidateData");
    window.localStorage.removeItem("token");
  };

  const updateCandidate = (cand: Candidate) => {
    setCandidate(cand);
    setIsAuthenticated(true);
    window.localStorage.setItem("candidateData", JSON.stringify(cand));
  };

  return (
    <AuthContext.Provider
      value={{
        candidate,
        isAuthenticated,
        login,
        logout,
        register,
        updateCandidate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};