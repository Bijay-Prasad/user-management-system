"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProfileForm({ user }: any) {
  const [name, setName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");

  const saveProfile = async () => {
    await api.put("/api/users/me", { fullName: name, email });
    toast.success("Profile updated");
  };

  const changePassword = async () => {
    if (!password) return;
    await api.put("/api/users/me/password", { password });
    toast.success("Password changed");
    setPassword("");
  };

  return (
    <Card>
      <CardHeader className="font-semibold">Profile Settings</CardHeader>
      <CardContent className="space-y-4">
        <Input value={name} onChange={(e) => setName(e.target.value)} />
        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button onClick={saveProfile}>Save Changes</Button>

        <hr />

        <Input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button variant="outline" onClick={changePassword}>
          Change Password
        </Button>
      </CardContent>
    </Card>
  );
}
