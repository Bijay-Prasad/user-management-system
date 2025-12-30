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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function UsersTable() {
  const [users, setUsers] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  const load = async () => {
    const res = await api.get("/api/users?page=1");
    setUsers(res.data);
  };

  const confirmToggle = async () => {
    await api.patch(`/api/users/${selected._id}/status`);
    toast.success(
      selected.status === "active" ? "User deactivated" : "User activated"
    );
    setSelected(null);
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
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
                  onClick={() => setSelected(u)}
                >
                  {u.status === "active" ? "Deactivate" : "Activate"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* CONFIRMATION DIALOG */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selected?.status === "active"
                ? "Deactivate User?"
                : "Activate User?"}
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Are you sure you want to{" "}
            {selected?.status === "active" ? "deactivate" : "activate"}{" "}
            <strong>{selected?.email}</strong>?
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Cancel
            </Button>
            <Button
              variant={
                selected?.status === "active" ? "destructive" : "default"
              }
              onClick={confirmToggle}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
