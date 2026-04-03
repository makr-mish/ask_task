"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const tgUser = localStorage.getItem("tg_user");
    const userId = localStorage.getItem("user_id");

    if (tgUser || userId) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return null;
}