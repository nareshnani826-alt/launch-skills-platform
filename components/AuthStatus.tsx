import { Session } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default function AuthStatus({ session }: { session: Session }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className={`badge ${session.role === "ADMIN" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
        {session.username} · {session.role === "ADMIN" ? "Admin" : "Resource"}
      </span>
      <LogoutButton />
    </div>
  );
}
