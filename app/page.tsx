"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Dashboard } from "./dashboard";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      // No token exists, redirect to login
      router.replace("/auth");
      return;
    }

    // Check if token is expired
    try {
      // Decode the token to check expiration
      const tokenPayload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      // Check if token is expired (exp is in seconds)
      if (tokenPayload.exp && tokenPayload.exp < currentTime) {
        // Token is expired, clear it and redirect
        localStorage.removeItem("token");
        localStorage.removeItem("storeId");
        localStorage.removeItem("userName");
        router.replace("/auth");
        return;
      }
    } catch (error) {
      // Token is malformed or invalid, clear it and redirect
      console.error("Invalid token format:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("storeId");
      localStorage.removeItem("userName");
      router.replace("/auth");
      return;
    }
  }, [router]);

  return (
    <main>
      <Dashboard />
    </main>
  );
}
