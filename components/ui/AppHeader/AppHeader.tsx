"use client";

import { useUser } from "@/app/providers/userProvider";
import { Bell, ChevronRight, CalendarDays, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
interface AppHeaderProps {
  onMobileMenuToggle?: () => void;
  isMobileOpen?: boolean;
}

export function AppHeader({
  onMobileMenuToggle,
  isMobileOpen,
}: AppHeaderProps) {
  const pathname = usePathname();

  const { user } = useUser();

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-6 backdrop-blur-md sm:px-10">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuToggle}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 lg:hidden"
          aria-label="Toggle navigation"
        >
          {isMobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

        {/* Breadcrumb Navigation */}
        <div className="hidden items-center gap-2 text-[13px] font-medium text-slate-400 sm:flex">
          <span className="text-slate-500">{user?.college.name}</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <span className="font-semibold text-slate-900 capitalize">
            {pathname.substring(1, pathname.length)}
          </span>
        </div>
      </div>

      {/* Right: Actions & User Meta */}
      <div className="flex items-center gap-3">
        {/* Today's Date Quick View */}
        <div className="hidden items-center gap-2 rounded-xl border border-slate-100 bg-[#FAFAF8] px-3 py-2 text-[12px] font-medium text-slate-600 xl:flex">
          <CalendarDays className="h-4 w-4 text-[#A6192E]" />
          <span>
            {new Date().toLocaleString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    </header>
  );
}
