import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/auth";
import ManageUsersPanel from "@/components/ManageUsersPanel";
import AddEmployeeForm from "@/components/AddEmployeeForm";

export const dynamic = "force-dynamic";

export default async function ManageUsersPage() {
  requireAdminPage();

  const employees = await prisma.employee.findMany({
    include: { user: true },
    orderBy: { name: "asc" },
  });

  const rows = employees.map((e) => ({
    employeeId: e.id,
    employeeName: e.name,
    employeeRole: e.role,
    employeeLocation: e.location,
    employeeAvailabilityPct: e.availabilityPct,
    userId: e.user?.id ?? null,
    username: e.user?.username ?? null,
    locked: !!e.user?.lockedAt,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Manage Users</h2>
        <p className="text-sm text-neutral-500">
          Create a login for an employee so they can sign in and update their own certification stages.
        </p>
      </div>
      <AddEmployeeForm />
      <ManageUsersPanel rows={rows} />
    </div>
  );
}
