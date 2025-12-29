import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/navbar";
import { redirect } from "next/navigation";
import ProfileForm from "./profile-form";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <>
      <Navbar user={user} />
      <main className="max-w-xl mx-auto p-6">
        <ProfileForm user={user} />
      </main>
    </>
  );
}
