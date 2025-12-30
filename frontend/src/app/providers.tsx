"use client";

import { Provider } from "react-redux";
import { persistor, store } from "@/store/store";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { PersistGate } from "redux-persist/integration/react";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <PersistGate loading={null} persistor={persistor}>
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </PersistGate>
  );
}
