'use client'

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Dashboard } from "./dashboard";

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <main>
      <Dashboard />
    </main>
  )
}
