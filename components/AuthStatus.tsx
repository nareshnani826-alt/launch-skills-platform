import Link from "next/link";
import { isAdminSession } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default function AuthStatus() {
  const isAdmin = isAdminSession();

  if (isAdmin) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="badge bg-emerald-100 text-emerald-700">Admin</span>
        <LogoutButton />
      </div>
    );
  }

  return (
    <Link href="/login" className="text-sm font-medium text-accent hover:opacity-80">
      Admin login
    </Link>
  );
}
