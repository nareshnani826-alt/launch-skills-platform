import { Session } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import SettingsMenu from "@/components/SettingsMenu";

export default function AuthStatus({ session }: { session: Session }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      {session.role === "ADMIN" && <SettingsMenu />}
      <span className="badge border border-white/15 bg-navy text-white capitalize">
        {session.username}
      </span>
      <LogoutButton />
    </div>
  );
}
