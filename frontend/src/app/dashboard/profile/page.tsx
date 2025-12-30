"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useGetProfileQuery, useUpdateProfileMutation, useChangePasswordMutation } from "@/store/userApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const profileSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
});

const passwordSchema = z
    .object({
        oldPassword: z.string().min(1, "Current password is required"),
        newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Must contain an uppercase letter")
            .regex(/[a-z]/, "Must contain a lowercase letter")
            .regex(/[0-9]/, "Must contain a number")
            .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export default function ProfilePage() {
    const { data: userProfile, isLoading: isProfileLoading } = useGetProfileQuery({});
    const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
    const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

    const profileForm = useForm({
        resolver: zodResolver(profileSchema),
        values: {
            fullName: userProfile?.user?.fullName || "",
            email: userProfile?.user?.email || "",
        },
    });

    const passwordForm = useForm({
        resolver: zodResolver(passwordSchema),
    });

    const onProfileSubmit = async (data: { fullName: string; email?: string }) => {
        try {
            await updateProfile(data).unwrap();
            toast.success("Profile updated successfully");
        } catch (err: any) {
            toast.error("Failed to update profile", {
                description: err?.data?.message || "Something went wrong"
            });
        }
    };

    const onPasswordSubmit = async (data: { oldPassword: string; newPassword: string; confirmPassword: string }) => {
        try {
            await changePassword({
                oldPassword: data.oldPassword,
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword
            }).unwrap();
            toast.success("Password changed successfully");
            passwordForm.reset();
        } catch (err: any) {
            toast.error("Failed to change password", {
                description: err?.data?.message || "Something went wrong"
            });
        }
    };

    if (isProfileLoading) {
        return <div className="space-y-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-[400px] w-full" /></div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Profile Settings</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your account settings and change your password.
                </p>
            </div>
            <Tabs defaultValue="general" className="w-full">
                <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>
                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                            <CardDescription>
                                Make changes to your account here. Click save when you're done.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                                <div className="space-y-1">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" {...profileForm.register("fullName")} />
                                    {profileForm.formState.errors.fullName && (
                                        <p className="text-sm text-destructive">{String(profileForm.formState.errors.fullName.message)}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="email">Email</Label>
                                    {/* Email usually shouldn't be changeable simply or requires verification, keeping it editable for now based on brief */}
                                    <Input id="email" {...profileForm.register("email")} />
                                    {profileForm.formState.errors.email && (
                                        <p className="text-sm text-destructive">{String(profileForm.formState.errors.email.message)}</p>
                                    )}
                                </div>
                                <Button type="submit" loading={isUpdating}>Save changes</Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="password">
                    <Card>
                        <CardHeader>
                            <CardTitle>Password</CardTitle>
                            <CardDescription>
                                Change your password here. After saving, you'll be logged out.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                                <div className="space-y-1">
                                    <Label htmlFor="current">Current Password</Label>
                                    <Input id="current" type="password" {...passwordForm.register("oldPassword")} />
                                    {passwordForm.formState.errors.oldPassword && (
                                        <p className="text-sm text-destructive">{String(passwordForm.formState.errors.oldPassword.message)}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="new">New Password</Label>
                                    <Input id="new" type="password" {...passwordForm.register("newPassword")} />
                                    {passwordForm.formState.errors.newPassword && (
                                        <p className="text-sm text-destructive">{String(passwordForm.formState.errors.newPassword.message)}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="confirm">Confirm Password</Label>
                                    <Input id="confirm" type="password" {...passwordForm.register("confirmPassword")} />
                                    {passwordForm.formState.errors.confirmPassword && (
                                        <p className="text-sm text-destructive">{String(passwordForm.formState.errors.confirmPassword.message)}</p>
                                    )}
                                </div>
                                <Button type="submit" loading={isChangingPassword}>Change Password</Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
