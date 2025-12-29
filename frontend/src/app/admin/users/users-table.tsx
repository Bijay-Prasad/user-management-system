"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function UsersTable() {
  const [users, setUsers] = useState<any[]>([]);

  const load = async () => {
    const res = await api.get("/api/users?page=1");
    setUsers(res.data);
  };

  const toggleStatus = async (id: string) => {
    await api.patch(`/api/users/${id}/status`);
    toast.success("User status updated");
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((u) => (
          <TableRow key={u._id}>
            <TableCell>{u.email}</TableCell>
            <TableCell>{u.fullName}</TableCell>
            <TableCell className="capitalize">{u.role}</TableCell>
            <TableCell>
              <Badge
                variant={u.status === "active" ? "default" : "destructive"}
              >
                {u.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Button
                size="sm"
                variant={u.status === "active" ? "destructive" : "default"}
                onClick={() => toggleStatus(u._id)}
              >
                {u.status === "active" ? "Deactivate" : "Activate"}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
