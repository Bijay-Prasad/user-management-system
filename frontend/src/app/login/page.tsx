"use client";

import { useState } from "react";
import { api } from "./../../lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { BlurFade } from "./../../components/ui/blur-fade";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
  try {
    await api.post("/api/auth/login", { email, password });
    toast.success("Login successful");
    router.push("/dashboard");
  } catch (err: any) {
    toast.error(err.response?.data?.message || "Login failed");
  }
};

  return (
    <BlurFade>
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-[380px]">
          <CardHeader className="text-center text-xl font-bold">
            Login
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button className="w-full" onClick={submit}>
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    </BlurFade>
  );
}
