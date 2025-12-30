"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/navbar";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // Hide navbar on auth pages if desired, mostly handled in Navbar itself but good to have wrapper control
    const isAuthPage = pathname === "/login" || pathname === "/signup";

    return (
        <div className="min-h-screen bg-background font-sans antialiased">
            <Navbar />
            <main className={cn("container mx-auto py-6 px-4 md:px-8", isAuthPage && "p-0 max-w-none flex items-center justify-center min-h-[calc(100vh-4rem)]")}>
                {children}
            </main>
        </div>
    );
}
