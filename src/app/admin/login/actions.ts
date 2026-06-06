"use server";

import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

const SECRET_KEY = process.env.JWT_SECRET || "fallback_secret_key_for_development";

export async function handleLogin(formData: FormData) {
  const username = formData.get("username")?.toString();
  const password = formData.get("password")?.toString();

  if (!username || !password) {
    return { success: false, error: "Username and password are required" };
  }

  try {
    const { data: user, error } = await supabase
      .from("admin")
      .select("username, password")
      .eq("username", username)
      .single();

    if (error || !user) {
      return { success: false, error: "Invalid username or password" };
    }

    // Convert PHP $2y$ hash to $2a$ so bcryptjs can verify it
    const compatibleHash = user.password.replace(/^\$2y\$/, '$2a$');
    const isValid = await bcrypt.compare(password, compatibleHash);

    if (!isValid) {
      return { success: false, error: "Invalid username or password" };
    }

    // Generate JWT
    const secret = new TextEncoder().encode(SECRET_KEY);
    const token = await new SignJWT({ username: user.username })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secret);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
