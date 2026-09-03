"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import bulsu_logo from "@/assets/logo/bulsu_logo.png";

export default function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function toggleMobileMenu() {
    setMobileMenuOpen(function (previousValue) {
      return !previousValue;
    });
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/60 bg-[#FAFAF8]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-3"
          onClick={closeMobileMenu}
        >
          <Image src={bulsu_logo} width={40} alt="BulSU Logo" />

          <div className="hidden sm:block">
            <p className="text-[12px] font-bold leading-none tracking-tight text-[#A6192E]">
              BULACAN STATE UNIVERSITY
            </p>

            <p className="mt-1 text-[10px] font-medium text-slate-400">
              Facility Reservation System
            </p>
          </div>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/bulsu-facilities"
            className="text-[13px] font-medium text-slate-500 transition-colors hover:text-[#A6192E]"
          >
            Facilities
          </Link>

          <a
            href="#how-it-works"
            className="text-[13px] font-medium text-slate-500 transition-colors hover:text-[#A6192E]"
          >
            How It Works
          </a>

          <a
            href="#about"
            className="text-[13px] font-medium text-slate-500 transition-colors hover:text-[#A6192E]"
          >
            About
          </a>
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="rounded-xl bg-[#A6192E] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_5px_16px_rgba(166,25,46,0.18)] transition-all hover:bg-[#8F1728] active:scale-[0.98]"
          >
            Sign In
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          aria-label="Toggle navigation"
          onClick={toggleMobileMenu}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-slate-200/60 bg-white px-4 py-4 md:hidden"
        >
          <nav className="flex flex-col gap-1">
            <a
              href="#facilities"
              onClick={closeMobileMenu}
              className="rounded-xl px-4 py-3 text-[14px] font-medium text-slate-600 hover:bg-slate-50"
            >
              Facilities
            </a>

            <a
              href="#how-it-works"
              onClick={closeMobileMenu}
              className="rounded-xl px-4 py-3 text-[14px] font-medium text-slate-600 hover:bg-slate-50"
            >
              How It Works
            </a>

            <a
              href="#about"
              onClick={closeMobileMenu}
              className="rounded-xl px-4 py-3 text-[14px] font-medium text-slate-600 hover:bg-slate-50"
            >
              About
            </a>

            <Link
              href="/login"
              onClick={closeMobileMenu}
              className="w-full rounded-xl bg-[#A6192E] mt-4 py-3 text-center text-[13px] font-semibold text-white"
            >
              Sign In
            </Link>
          </nav>
        </motion.div>
      )}
    </header>
  );
}
