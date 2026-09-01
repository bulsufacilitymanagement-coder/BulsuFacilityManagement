"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppSidebar } from "@/components/ui/Sidebar/AppSidebar";
import { AppHeader } from "@/components/ui/AppHeader/AppHeader";
import { createClient } from "@/lib/supabase/client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50/50">
      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:block lg:flex-shrink-0">
        <AppSidebar />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
            >
              <AppSidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area Shell */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader
          onMobileMenuToggle={() => setIsMobileOpen(!isMobileOpen)}
          isMobileOpen={isMobileOpen}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
