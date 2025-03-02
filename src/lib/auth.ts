import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Database } from "../types/supabase";
import { supabase } from "./supabase";

export type User = Database["public"]["Tables"]["users"]["Row"];

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: any } | { user: User }>;
  signUp: (
    email: string,
    username: string,
    password: string,
  ) => Promise<{ error: any } | { user: User }>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export async function signIn(username: string, password: string) {
  try {
    // First, get the user by username
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (userError) {
      console.error("User fetch error:", userError);
      return { error: "User not found" };
    }

    // In a real app, you would verify the password hash here
    // For this demo, we'll just check if the password matches directly
    // WARNING: This is NOT secure for a real application
    if (userData.password_hash !== password) {
      return { error: "Invalid password" };
    }

    // Update last login time
    const { error: updateError } = await supabase
      .from("users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", userData.id);

    if (updateError) {
      console.error("Error updating last login:", updateError);
    }

    // Set session in localStorage
    localStorage.setItem("auradex_user", JSON.stringify(userData));

    return { user: userData };
  } catch (error) {
    console.error("Error during sign in:", error);
    return { error: "An unexpected error occurred" };
  }
}

export async function signUp(
  email: string | undefined,
  username: string,
  password: string,
) {
  try {
    // Check if username already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("username")
      .eq("username", username)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing user:", checkError);
      return { error: "Error checking username availability" };
    }

    if (existingUser) {
      return { error: "Username already taken" };
    }

    // In a real app, you would hash the password here
    // For this demo, we'll store it directly (NOT secure)
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert([
        {
          username,
          email: email || null, // Make email optional
          password_hash: password, // In a real app, this would be hashed
          aura_balance: 1000, // Starting balance
          created_at: new Date().toISOString(),
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
          is_banned: false,
        },
      ])
      .select()
      .single();

    if (createError) {
      console.error("Error creating user:", createError);
      return { error: createError.message || "Failed to create account" };
    }

    // Set session in localStorage
    localStorage.setItem("auradex_user", JSON.stringify(newUser));

    return { user: newUser };
  } catch (error) {
    console.error("Error during sign up:", error);
    return { error: "An unexpected error occurred" };
  }
}

export async function signOut() {
  localStorage.removeItem("auradex_user");
}

export async function updateUserData(userId: string, updates: Partial<User>) {
  try {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user:", error);
      throw error;
    }

    // Update local storage
    const storedUser = localStorage.getItem("auradex_user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      localStorage.setItem(
        "auradex_user",
        JSON.stringify({ ...parsedUser, ...updates }),
      );
    }

    return data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

import React from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for user in localStorage
    const storedUser = localStorage.getItem("auradex_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (
      !loading &&
      !user &&
      window.location.pathname !== "/login" &&
      !window.location.pathname.includes("/tempobook/")
    ) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const value = {
    user,
    loading,
    signIn: async (username: string, password: string) => {
      console.log("AuthContext signIn called with:", username);
      try {
        const result = await signIn(username, password);
        console.log("AuthContext signIn result:", result);
        if ("user" in result) {
          setUser(result.user);
          // Force navigation after state update
          setTimeout(() => navigate("/"), 100);
        }
        return result;
      } catch (error) {
        console.error("AuthContext signIn error:", error);
        return { error: "An unexpected error occurred" };
      }
    },
    signUp: async (email: string, username: string, password: string) => {
      console.log("AuthContext signUp called with:", username);
      try {
        const result = await signUp(email, username, password);
        console.log("AuthContext signUp result:", result);
        if ("user" in result) {
          setUser(result.user);
          // Force navigation after state update
          setTimeout(() => navigate("/"), 100);
        }
        return result;
      } catch (error) {
        console.error("AuthContext signUp error:", error);
        return { error: "An unexpected error occurred" };
      }
    },
    signOut: async () => {
      await signOut();
      setUser(null);
      navigate("/login");
    },
    updateUser: async (updates: Partial<User>) => {
      if (!user) return;
      const updatedUser = await updateUserData(user.id, updates);
      setUser(updatedUser);
    },
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}
