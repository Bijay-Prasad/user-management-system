"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLogoutMutation } from "@/store/authApi";
import { logout } from "@/store/authSlice";
import { LayoutDashboard, LogOut, User } from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

interface RootState {
  auth: {
    isAuthenticated: boolean;
    user: {
      fullName: string;
      email: string;
      role: string;
    } | null;
  };
}

export function Navbar() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [logoutApi] = useLogoutMutation();
  const dispatch = useDispatch();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutApi({}).unwrap();
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      dispatch(logout());
      // Force hard redirect to home to prevent AuthGuard race conditions
      window.location.href = "/";
    }
  };

  if (pathname === "/login" || pathname === "/signup") return null;

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            U
          </div>
          <span>UserSys</span>
        </Link>

        <div className="flex items-center gap-4">
          <AnimatedThemeToggler className="mr-2" />
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              {user?.role === 'admin' && (
                <Button variant="ghost" asChild>
                  <Link href="/admin/users">Admin</Link>
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar>
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                      />
                      <AvatarFallback>
                        {user?.fullName?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.fullName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
