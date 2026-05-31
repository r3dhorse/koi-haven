import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { listKoi, getSettings } from "@/lib/store";
import { AdminLogin } from "./AdminLogin";
import { AdminDashboard } from "./AdminDashboard";

export const metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) {
    return <AdminLogin />;
  }
  const koi = await listKoi();
  const settings = await getSettings();
  const { adminPassword: _ignored, ...safeSettings } = settings;
  return <AdminDashboard initialKoi={koi} initialSettings={safeSettings} />;
}
