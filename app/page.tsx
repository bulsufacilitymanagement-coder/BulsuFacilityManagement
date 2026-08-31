"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Menu,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

export default function Home() {
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
    <main className="min-h-screen overflow-hidden bg-[#FAFAF8] text-slate-950">
      {/* ================================================================ */}
      {/* NAVBAR                                                           */}
      {/* ================================================================ */}

      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/60 bg-[#FAFAF8]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-3"
            onClick={closeMobileMenu}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#A6192E] shadow-[0_6px_18px_rgba(166,25,46,0.18)]">
              <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white">
                <div className="h-1.5 w-1.5 rounded-full bg-[#F4C430]" />
              </div>
            </div>

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
            <a
              href="#facilities"
              className="text-[13px] font-medium text-slate-500 transition-colors hover:text-[#A6192E]"
            >
              Facilities
            </a>

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
              className="rounded-xl px-4 py-2.5 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
            >
              Sign In
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-[#A6192E] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_5px_16px_rgba(166,25,46,0.18)] transition-all hover:bg-[#8F1728] active:scale-[0.98]"
            >
              Get Started
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

              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="rounded-xl border border-slate-200 py-3 text-center text-[13px] font-semibold text-slate-700"
                >
                  Sign In
                </Link>

                <Link
                  href="/register"
                  onClick={closeMobileMenu}
                  className="rounded-xl bg-[#A6192E] py-3 text-center text-[13px] font-semibold text-white"
                >
                  Get Started
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </header>

      {/* ================================================================ */}
      {/* HERO                                                             */}
      {/* ================================================================ */}

      <section className="relative px-4 pb-20 pt-32 sm:px-6 sm:pb-28 sm:pt-40">
        {/* Background accents */}
        <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-[#A6192E]/[0.055] blur-3xl" />
        <div className="pointer-events-none absolute -right-40 top-32 h-96 w-96 rounded-full bg-[#F4C430]/[0.08] blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            {/* Hero copy */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#A6192E]/10 bg-[#A6192E]/[0.05] px-3.5 py-2">
                <Sparkles className="h-3.5 w-3.5 text-[#A6192E]" />

                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#A6192E]">
                  University Facility Portal
                </span>
              </div>

              <h1 className="max-w-[680px] text-[42px] font-bold leading-[1.05] tracking-[-1.8px] text-slate-950 sm:text-[56px] lg:text-[64px]">
                Reserve the spaces
                <span className="block text-[#A6192E]">you need.</span>
              </h1>

              <p className="mt-6 max-w-[570px] text-[16px] leading-7 text-slate-500 sm:text-[17px]">
                A centralized platform for Bulacan State University students and
                faculty to discover facilities, submit reservation requests, and
                keep track of their bookings.
              </p>

              {/* CTA */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-[#A6192E] px-6 text-[14px] font-semibold text-white shadow-[0_10px_25px_rgba(166,25,46,0.20)] transition-all hover:bg-[#8F1728] active:scale-[0.98]"
                >
                  Start a Reservation
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>

                <a
                  href="#how-it-works"
                  className="inline-flex h-12 items-center justify-center rounded-[14px] border border-slate-200 bg-white px-6 text-[14px] font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
                >
                  See How It Works
                </a>
              </div>

              {/* Trust */}
              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-[12px] text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#A6192E]" />
                  University-wide access
                </div>

                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#A6192E]" />
                  Secure accounts
                </div>
              </div>
            </motion.div>

            {/* Reservation preview */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12, ease: "easeOut" }}
              className="relative"
            >
              {/* Decorative yellow shape */}
              <div className="absolute -right-5 -top-5 h-20 w-20 rounded-[24px] bg-[#F4C430]/20 blur-sm" />

              <div className="relative rounded-[28px] border border-slate-200/70 bg-white p-4 shadow-[0_25px_70px_rgba(15,23,42,0.10)] sm:p-5">
                {/* Window header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Reservation
                    </p>

                    <p className="mt-1 text-[17px] font-bold text-slate-950">
                      Facility Overview
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#A6192E]/[0.07]">
                    <CalendarDays className="h-4 w-4 text-[#A6192E]" />
                  </div>
                </div>

                {/* Facility */}
                <div className="mt-5 rounded-[20px] bg-[#FAFAF8] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[12px] font-medium text-slate-400">
                        Selected facility
                      </p>

                      <p className="mt-1 text-[17px] font-bold text-slate-900">
                        University Conference Room
                      </p>

                      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                        <MapPin className="h-3.5 w-3.5" />
                        Main Campus
                      </div>
                    </div>

                    <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-700">
                      Available
                    </span>
                  </div>
                </div>

                {/* Date / time */}
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-[17px] border border-slate-100 p-3.5">
                    <div className="flex items-center gap-2 text-slate-400">
                      <CalendarDays className="h-3.5 w-3.5" />

                      <span className="text-[10px] font-semibold uppercase tracking-wider">
                        Date
                      </span>
                    </div>

                    <p className="mt-2 text-[13px] font-semibold text-slate-800">
                      March 18, 2026
                    </p>
                  </div>

                  <div className="rounded-[17px] border border-slate-100 p-3.5">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock3 className="h-3.5 w-3.5" />

                      <span className="text-[10px] font-semibold uppercase tracking-wider">
                        Time
                      </span>
                    </div>

                    <p className="mt-2 text-[13px] font-semibold text-slate-800">
                      9:00 AM – 12:00 PM
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="mt-4 flex items-center justify-between rounded-[17px] bg-[#A6192E] px-4 py-3.5 text-white">
                  <div>
                    <p className="text-[10px] font-medium text-white/60">
                      Request status
                    </p>

                    <p className="mt-0.5 text-[13px] font-semibold">
                      Pending approval
                    </p>
                  </div>

                  <Clock3 className="h-4 w-4 text-[#F4C430]" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* FEATURES                                                         */}
      {/* ================================================================ */}

      <section
        id="facilities"
        className="border-y border-slate-200/60 bg-white px-4 py-20 sm:px-6 sm:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="max-w-[600px]"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#A6192E]">
              Built for the university
            </p>

            <h2 className="mt-3 text-[30px] font-bold tracking-[-0.8px] text-slate-950 sm:text-[38px]">
              Everything you need to manage reservations.
            </h2>

            <p className="mt-4 text-[15px] leading-6 text-slate-500">
              A simpler way to find available spaces and keep your facility
              requests organized.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45 }}
              className="rounded-[22px] border border-slate-200/70 bg-[#FAFAF8] p-6"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#A6192E] text-white shadow-[0_7px_18px_rgba(166,25,46,0.16)]">
                <CalendarDays className="h-5 w-5" />
              </div>

              <h3 className="mt-6 text-[17px] font-bold text-slate-900">
                Easy Reservations
              </h3>

              <p className="mt-2 text-[13px] leading-5 text-slate-500">
                Submit facility requests through a simple and straightforward
                reservation experience.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="rounded-[22px] border border-slate-200/70 bg-[#FAFAF8] p-6"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#F4C430] text-[#6F5310] shadow-[0_7px_18px_rgba(244,196,48,0.16)]">
                <Clock3 className="h-5 w-5" />
              </div>

              <h3 className="mt-6 text-[17px] font-bold text-slate-900">
                Track Your Requests
              </h3>

              <p className="mt-2 text-[13px] leading-5 text-slate-500">
                See the current status of your reservation requests without
                needing to follow up manually.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: 0.16 }}
              className="rounded-[22px] border border-slate-200/70 bg-[#FAFAF8] p-6"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-slate-900 text-white shadow-[0_7px_18px_rgba(15,23,42,0.12)]">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <h3 className="mt-6 text-[17px] font-bold text-slate-900">
                Secure Access
              </h3>

              <p className="mt-2 text-[13px] leading-5 text-slate-500">
                Your university account provides secure access to your
                reservations and account information.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* HOW IT WORKS                                                     */}
      {/* ================================================================ */}

      <section id="how-it-works" className="px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#A6192E]">
              How it works
            </p>

            <h2 className="mt-3 text-[30px] font-bold tracking-[-0.8px] text-slate-950 sm:text-[38px]">
              Reserve in three simple steps.
            </h2>

            <p className="mx-auto mt-4 max-w-[500px] text-[15px] leading-6 text-slate-500">
              From finding a facility to receiving approval, everything stays in
              one place.
            </p>
          </div>

          <div className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {/* Connecting line */}
            <div className="absolute left-[16.66%] right-[16.66%] top-6 hidden h-px bg-slate-200 md:block" />

            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="relative text-center"
            >
              <div className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#A6192E] text-[14px] font-bold text-white ring-8 ring-[#FAFAF8]">
                01
              </div>

              <h3 className="mt-6 text-[16px] font-bold text-slate-900">
                Choose a facility
              </h3>

              <p className="mx-auto mt-2 max-w-[260px] text-[13px] leading-5 text-slate-500">
                Browse facilities and find a space that fits your activity.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="relative text-center"
            >
              <div className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F4C430] text-[14px] font-bold text-[#624B0E] ring-8 ring-[#FAFAF8]">
                02
              </div>

              <h3 className="mt-6 text-[16px] font-bold text-slate-900">
                Submit your request
              </h3>

              <p className="mx-auto mt-2 max-w-[260px] text-[13px] leading-5 text-slate-500">
                Select your date, time, purpose, and submit your reservation.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.16 }}
              className="relative text-center"
            >
              <div className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-[14px] font-bold text-white ring-8 ring-[#FAFAF8]">
                03
              </div>

              <h3 className="mt-6 text-[16px] font-bold text-slate-900">
                Get confirmation
              </h3>

              <p className="mx-auto mt-2 max-w-[260px] text-[13px] leading-5 text-slate-500">
                Track your request and receive confirmation once it is approved.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* ABOUT / COMMUNITY                                                */}
      {/* ================================================================ */}

      <section
        id="about"
        className="border-y border-slate-200/60 bg-white px-4 py-20 sm:px-6 sm:py-24"
      >
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#A6192E]">
              One centralized system
            </p>

            <h2 className="mt-3 text-[30px] font-bold tracking-[-0.8px] text-slate-950 sm:text-[38px]">
              Better access to university spaces.
            </h2>

            <p className="mt-5 max-w-[520px] text-[15px] leading-7 text-slate-500">
              The Centralized Facility Reservation System gives students and
              faculty a convenient way to request university facilities while
              helping administrators maintain an organized reservation workflow.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-[#FAFAF8] px-3.5 py-2.5 text-[12px] font-medium text-slate-600">
                <Users className="h-4 w-4 text-[#A6192E]" />
                Students & Faculty
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-[#FAFAF8] px-3.5 py-2.5 text-[12px] font-medium text-slate-600">
                <CalendarDays className="h-4 w-4 text-[#A6192E]" />
                Centralized Requests
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="rounded-[22px] bg-[#A6192E] p-6 text-white">
              <p className="text-[32px] font-bold tracking-tight">01</p>

              <p className="mt-2 text-[12px] leading-5 text-white/65">
                Centralized reservation platform
              </p>
            </div>

            <div className="rounded-[22px] bg-[#F4C430] p-6 text-[#5D470C]">
              <p className="text-[32px] font-bold tracking-tight">24/7</p>

              <p className="mt-2 text-[12px] leading-5 text-[#5D470C]/65">
                Access your requests online
              </p>
            </div>

            <div className="col-span-2 rounded-[22px] border border-slate-200 bg-[#FAFAF8] p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-slate-900 text-white">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-[15px] font-bold text-slate-900">
                    Designed around a simpler workflow
                  </p>

                  <p className="mt-1 text-[12px] leading-5 text-slate-500">
                    Find. Request. Track. Confirm.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* CTA                                                              */}
      {/* ================================================================ */}

      <section className="px-4 py-20 sm:px-6 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="relative mx-auto max-w-5xl overflow-hidden rounded-[28px] bg-[#A6192E] px-6 py-12 text-center shadow-[0_20px_60px_rgba(166,25,46,0.18)] sm:px-10 sm:py-16"
        >
          {/* Decorative shapes */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-white/[0.05]" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 h-56 w-56 rounded-full bg-[#F4C430]/10" />

          <div className="relative">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#F4C430]">
              Ready to get started?
            </p>

            <h2 className="mx-auto mt-3 max-w-[650px] text-[30px] font-bold tracking-[-0.8px] text-white sm:text-[40px]">
              Your next reservation starts here.
            </h2>

            <p className="mx-auto mt-4 max-w-[500px] text-[14px] leading-6 text-white/65">
              Create your account and start requesting university facilities
              through one centralized platform.
            </p>

            <div className="mt-7">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-white px-6 text-[14px] font-bold text-[#A6192E] shadow-lg transition-all hover:bg-[#FFFDF5] active:scale-[0.98]"
              >
                Create an Account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ================================================================ */}
      {/* FOOTER                                                           */}
      {/* ================================================================ */}

      <footer className="border-t border-slate-200/60 bg-white px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-[12px] font-bold text-slate-700">
              Bulacan State University
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              Centralized Facility Reservation System
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#A6192E]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#F4C430]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#A6192E]/30" />
          </div>

          <div>
            <p className="text-[10px] text-slate-400">
              © {new Date().getFullYear()} Bulacan State University
            </p>
            <a
              href="https://limuelcamangon.vercel.app/"
              target="_blank"
              className="text-[10px] text-slate-400"
            >
              Developed by Limuel Camangon
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
