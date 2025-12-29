import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/navbar";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <>
      <Navbar user={user} />
      <main className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold">Welcome, {user.fullName}</h1>
      </main>
    </>
  );
}
