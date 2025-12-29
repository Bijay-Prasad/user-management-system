"use client";

import Link from "next/link";
import { LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar({ user }: any) {
  return (
    <nav className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex gap-4 items-center">
          <Shield className="w-5 h-5 text-primary" />
          <Link href="/dashboard" className="font-semibold">
            Dashboard
          </Link>
          <Link href="/profile">Profile</Link>
          {user?.role === "admin" && <Link href="/admin/users">Users</Link>}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {user?.fullName} ({user?.role})
          </span>
          <Button size="sm" variant="outline">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
