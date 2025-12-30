"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useSelector } from "react-redux";

// Define a minimal state interface since we can't easily import RootState here without cycles or extra files
interface RootState {
  auth: {
    isAuthenticated: boolean;
  };
}

export default function Home() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4 max-w-3xl"
      >
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight lg:text-7xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Modern User Management
          <br />
          Simplified.
        </h1>
        <p className="text-xl text-muted-foreground max-w-[42rem] mx-auto">
          A full-stack solution featuring secure authentication, role-based
          access control, and a beautiful responsive interface built with the
          latest tech stack.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        {isAuthenticated ? (
          <Button size="lg" className="h-12 px-8 text-lg" asChild>
            <Link href="/dashboard">
              Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        ) : (
          <>
            <Button size="lg" className="h-12 px-8 text-lg" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-8 text-lg"
              asChild
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </>
        )}
      </motion.div>

      {/* Magic UI - Grid Pattern or similar effect could go here */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 mix-blend-multiply pointer-events-none" />
    </div>
  );
}
