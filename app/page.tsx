import { redirect } from "next/navigation";
import { getSession, isAdmin } from "@/lib/auth";

export default function Home() {
  const session = getSession();
  if (!session) redirect("/login");
  redirect(isAdmin(session) ? "/pipeline" : "/my-certifications");
}
