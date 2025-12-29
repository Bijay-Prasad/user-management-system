import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/navbar";
import { redirect } from "next/navigation";
import UsersTable from "./users-table";

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  return (
    <>
      <Navbar user={user} />
      <main className="max-w-6xl mx-auto p-6">
        <UsersTable />
      </main>
    </>
  );
}
