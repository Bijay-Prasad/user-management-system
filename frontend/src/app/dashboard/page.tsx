"use client";
// import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/navbar";
// import { redirect } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";

export default function Dashboard() {
  const user = useSelector((s: RootState) => s.auth.user);
  // const user = await getCurrentUser();
  // console.log("Current User:", user);
  // if (!user) redirect("/login");

  return (
    <>
      <ProtectedRoute>
        <Navbar user={user} />
        <main className="max-w-6xl mx-auto p-6">
          <h1 className="text-2xl font-bold">Welcome, {user?.fullName}</h1>
        </main>
      </ProtectedRoute>
    </>
  );
}
