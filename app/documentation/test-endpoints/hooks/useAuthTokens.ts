import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { AuthToken } from "../types";

export function useAuthTokens() {
  const [authTokens, setAuthTokens] = useState<AuthToken[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<string>("");

  // Load tokens from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("api-auth-tokens");
    if (stored) {
      try {
        const tokens = JSON.parse(stored);
        setAuthTokens(tokens);
      } catch {
        // Invalid storage, reset
        localStorage.removeItem("api-auth-tokens");
      }
    }
  }, []);

  // Save tokens to localStorage
  const saveTokens = (tokens: AuthToken[]) => {
    localStorage.setItem("api-auth-tokens", JSON.stringify(tokens));
    setAuthTokens(tokens);
  };

  const addToken = (token: Omit<AuthToken, "id" | "createdAt">) => {
    if (!token.name.trim() || !token.token.trim()) {
      toast.error("Please fill in all required fields");
      return false;
    }

    const newToken: AuthToken = {
      ...token,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    const updatedTokens = [...authTokens, newToken];
    saveTokens(updatedTokens);

    toast.success("Token added successfully");
    return true;
  };

  const deleteToken = (id: string) => {
    const updatedTokens = authTokens.filter((token) => token.id !== id);
    saveTokens(updatedTokens);
    if (selectedTokenId === id) {
      setSelectedTokenId("");
    }
    toast.success("Token deleted successfully");
  };

  const getSelectedToken = (): AuthToken | null => {
    return authTokens.find((token) => token.id === selectedTokenId) || null;
  };

  return {
    authTokens,
    selectedTokenId,
    setSelectedTokenId,
    addToken,
    deleteToken,
    getSelectedToken,
  };
}
