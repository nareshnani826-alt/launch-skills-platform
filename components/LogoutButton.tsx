"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/pipeline");
    router.refresh();
  }

  return (
    <button onClick={onLogout} className="text-neutral-500 hover:text-neutral-800">
      Logout
    </button>
  );
}
