"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirm: "",
  });

  const submit = async () => {
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await api.post("/api/auth/signup", form);
      toast.success("Account created");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-[420px]">
        <CardHeader className="text-xl font-bold text-center">
          Create Account
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Full Name"
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          <Input
            placeholder="Email"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            type="password"
            placeholder="Password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Input
            type="password"
            placeholder="Confirm Password"
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          />
          <Button className="w-full" onClick={submit}>
            Sign Up
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
