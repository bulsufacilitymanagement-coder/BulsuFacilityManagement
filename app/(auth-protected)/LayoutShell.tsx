"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/ui/AppSidebar/AppSidebar";
import { AppHeader } from "@/components/ui/AppHeader/AppHeader";
import { AnimatePresence, motion } from "framer-motion";

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50/50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:flex-shrink-0">
        <AppSidebar />
      </div>

      {/* Mobile Sidebar */}

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

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppHeader
          onMobileMenuToggle={() => setIsMobileOpen((prev) => !prev)}
          isMobileOpen={isMobileOpen}
        />

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
