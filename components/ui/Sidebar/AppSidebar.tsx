"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  History,
  Settings,
  HelpCircle,
  LogOut,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import Image from "next/image";
import bulsu_logo from "@/assets/logo/bulsu_logo.png";
import { createClient } from "@/lib/supabase/client";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Facilities", href: "/facilities", icon: Building2 },
  {
    name: "My Reservations",
    href: "/reservations",
    icon: CalendarCheck,
    badge: "3",
  },
  { name: "Booking History", href: "/history", icon: History },
];

const secondaryNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Support & Help", href: "/help", icon: HelpCircle },
];

const supabase = createClient();

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  async function handleLogOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        console.error(error);
        return;
      }

      setUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <aside className="relative flex h-screen w-72 flex-col justify-between overflow-hidden border-r border-[#8F1728] bg-[#A6192E] p-5 select-none">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute -left-25 top-0 h-64 w-64 rounded-full bg-white/15 blur-[100px]" />

      {/* Top Section */}
      <div className="relative flex flex-col gap-8">
        {/* Brand / Logo Header */}
        <Link href="/dashboard" className="flex items-center gap-3 px-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl  p-1 shadow-sm">
            <Image
              src={bulsu_logo}
              loading="eager"
              alt="Bulacan State University Logo"
              className="w-10"
            />
          </div>

          <div className="flex flex-col">
            <span className="text-[15px] font-bold tracking-tight text-white">
              BulSU <span className="text-[#F4C430]">Main</span>
            </span>

            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/60">
              Facility Services
            </span>
          </div>
        </Link>

        {/* Main Navigation */}
        <nav className="flex flex-col gap-1.5">
          <span className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
            Main Menu
          </span>

          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative flex h-11 items-center justify-between rounded-[14px] px-3.5 text-[13px] font-semibold transition-all duration-200 active:scale-[0.98] ${
                  isActive
                    ? "bg-white text-[#A6192E] shadow-[0_8px_20px_rgba(0,0,0,0.10)]"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute left-0 top-2.5 h-6 w-1 rounded-r-full bg-[#F4C430]"
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 30,
                    }}
                  />
                )}

                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive
                        ? "text-[#A6192E]"
                        : "text-white/50 group-hover:text-white"
                    }`}
                  />

                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? "bg-[#A6192E] text-white"
                        : "bg-white/10 text-white/75 group-hover:bg-white/15"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* System & Support */}
        <nav className="flex flex-col gap-1.5">
          <span className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
            System
          </span>

          {secondaryNavigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative flex h-11 items-center gap-3 rounded-[14px] px-3.5 text-[13px] font-semibold transition-all duration-200 active:scale-[0.98] ${
                  isActive
                    ? "bg-white text-[#A6192E] shadow-[0_8px_20px_rgba(0,0,0,0.10)]"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-secondary-active-indicator"
                    className="absolute left-0 top-2.5 h-6 w-1 rounded-r-full bg-[#F4C430]"
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 30,
                    }}
                  />
                )}

                <Icon
                  className={`h-4 w-4 transition-colors ${
                    isActive
                      ? "text-[#A6192E]"
                      : "text-white/50 group-hover:text-white"
                  }`}
                />

                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile Card */}
      <div className="relative flex flex-col gap-3 border-t border-white/10 pt-4">
        <div className="flex items-center justify-between rounded-[18px] border border-white/10 bg-black/10 p-3">
          <div className="flex min-w-0 items-center gap-3">
            {/* User Avatar */}
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[11px] font-bold text-[#A6192E] shadow-sm">
              {user?.user_metadata?.first_name?.charAt(0)?.toUpperCase() +
                "" +
                user?.user_metadata?.last_name?.charAt(0)?.toUpperCase()}

              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#A6192E] bg-emerald-400" />
            </div>

            <div className="flex min-w-0 flex-col">
              <span className="truncate text-[13px] font-bold text-white">
                {user?.user_metadata?.full_name ?? "Student"}
              </span>

              <span className="flex min-w-0 items-center gap-1 text-[10px] font-medium text-white/55">
                <ShieldCheck className="h-3 w-3 shrink-0 text-[#F4C430]" />

                <span className="truncate">{user?.email ?? "No email"}</span>
              </span>
            </div>
          </div>

          <button
            onClick={handleLogOut}
            title="Log out"
            type="button"
            aria-label="Log out"
            className="shrink-0 rounded-xl p-2 text-white/50 transition-all hover:bg-white/10 hover:text-white active:scale-95"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
