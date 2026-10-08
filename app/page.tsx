"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  HeartHandshake,
  Landmark,
  MapPin,
  Menu,
  Scale,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PublicNavbar from "@/components/ui/PublicNavbar/PublicNavbar";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const router = useRouter();

  // Accepts implicit-flow email links (Site URL + access_token in the hash
  // OR query string, with type=invite) that templates may still generate;
  // PKCE links use /auth/confirm instead. Tokens are cleared from the
  // address bar before anything else runs.
  useEffect(() => {
    const url = new URL(window.location.href);
    const hashParams = new URLSearchParams(window.location.hash.slice(1));

    const access_token =
      hashParams.get("access_token") ?? url.searchParams.get("access_token");
    const refresh_token =
      hashParams.get("refresh_token") ??
      url.searchParams.get("refresh_token");
    const linkType =
      hashParams.get("type") ?? url.searchParams.get("type");
    // Supabase appends ?error=… when its own verify step rejects the token.
    const urlError = url.searchParams.get("error");

    const hasTokens =
      hashParams.has("access_token") || url.searchParams.has("access_token");

    if (!hasTokens && !urlError) {
      return;
    }

    let cancelled = false;

    (async () => {
      window.history.replaceState(null, "", window.location.pathname);

      if (urlError || !access_token || !refresh_token) {
        router.replace("/login?error=link-expired");
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (cancelled) {
        return;
      }

      if (error) {
        router.replace("/login?error=link-expired");
        return;
      }

      router.replace(
        linkType === "invite" ? "/auth/set-password" : "/dashboard"
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-950">
      {/* ================================================================ */}
      {/* NAVBAR                                                           */}
      {/* ================================================================ */}
      <PublicNavbar />

      {/* ================================================================ */}
      {/* HERO                                                             */}
      {/* ================================================================ */}

      <section className="relative px-4 pb-20 pt-32 sm:px-6 sm:pb-28 sm:pt-40">
        {/* Background accents */}
        <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-bulsu/[0.055] blur-3xl" />
        <div className="pointer-events-none absolute -right-40 top-32 h-96 w-96 rounded-full bg-gold/[0.08] blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            {/* Hero copy */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            >
              <h1 className="max-w-[680px] text-[42px] font-bold leading-[1.05] tracking-[-1.8px] text-slate-950 sm:text-[56px] lg:text-[64px]">
                Reserve the spaces
                <span className="block text-bulsu">you need.</span>
              </h1>

              <p className="mt-6 max-w-[570px] text-[16px] leading-7 text-slate-500 sm:text-[17px]">
                A centralized platform for Bulacan State University students and
                faculty to discover facilities, submit reservation requests, and
                keep track of their bookings.
              </p>

              {/* CTA */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/bulsu-facilities"
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-bulsu px-6 text-[14px] font-semibold text-white shadow-[0_10px_25px_rgba(165,0,17,0.20)] transition-all hover:bg-bulsu-dark active:scale-[0.98]"
                >
                  Browse Facilities
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
                  <CheckCircle2 className="h-4 w-4 text-bulsu" />
                  University-wide access
                </div>

                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-bulsu" />
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
              <div className="absolute -right-5 -top-5 h-20 w-20 rounded-[24px] bg-gold/20 blur-sm" />

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

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-bulsu/[0.07]">
                    <CalendarDays className="h-4 w-4 text-bulsu" />
                  </div>
                </div>

                {/* Facility */}
                <div className="mt-5 rounded-[20px] bg-white p-4">
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
                <div className="mt-4 flex items-center justify-between rounded-[17px] bg-bulsu px-4 py-3.5 text-white">
                  <div>
                    <p className="text-[10px] font-medium text-white/60">
                      Request status
                    </p>

                    <p className="mt-0.5 text-[13px] font-semibold">
                      Pending approval
                    </p>
                  </div>

                  <Clock3 className="h-4 w-4 text-gold" />
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
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-bulsu">
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
              className="rounded-[22px] border border-slate-200/70 bg-white p-6"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-bulsu text-white shadow-[0_7px_18px_rgba(165,0,17,0.16)]">
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
              className="rounded-[22px] border border-slate-200/70 bg-white p-6"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-gold text-[#6F5310] shadow-[0_7px_18px_rgba(241,169,38,0.16)]">
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
              className="rounded-[22px] border border-slate-200/70 bg-white p-6"
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
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-bulsu">
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
              <div className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-bulsu text-[14px] font-bold text-white ring-8 ring-white">
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
              <div className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold text-[14px] font-bold text-[#624B0E] ring-8 ring-white">
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
              <div className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-[14px] font-bold text-white ring-8 ring-white">
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
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-bulsu">
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
              <div className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-[12px] font-medium text-slate-600">
                <Users className="h-4 w-4 text-bulsu" />
                Students & Faculty
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-[12px] font-medium text-slate-600">
                <CalendarDays className="h-4 w-4 text-bulsu" />
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
            <div className="rounded-[22px] bg-bulsu p-6 text-white">
              <p className="text-[32px] font-bold tracking-tight">01</p>

              <p className="mt-2 text-[12px] leading-5 text-white/65">
                Centralized reservation platform
              </p>
            </div>

            <div className="rounded-[22px] bg-gold p-6 text-[#5D470C]">
              <p className="text-[32px] font-bold tracking-tight">24/7</p>

              <p className="mt-2 text-[12px] leading-5 text-[#5D470C]/65">
                Access your requests online
              </p>
            </div>

            <div className="col-span-2 rounded-[22px] border border-slate-200 bg-white p-6">
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
          className="relative mx-auto max-w-5xl overflow-hidden rounded-[28px] bg-bulsu px-6 py-12 text-center shadow-[0_20px_60px_rgba(165,0,17,0.18)] sm:px-10 sm:py-16"
        >
          {/* Decorative shapes */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-white/[0.05]" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 h-56 w-56 rounded-full bg-gold/10" />

          <div className="relative">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold">
              Ready to get started?
            </p>

            <h2 className="mx-auto mt-3 max-w-[650px] text-[30px] font-bold tracking-[-0.8px] text-white sm:text-[40px]">
              Need to reserve a facility?
            </h2>

            <p className="mx-auto mt-4 max-w-[500px] text-[14px] leading-6 text-white/65">
              To make a reservation, contact the admin of the college or
              organization responsible for the facility you need. They’ll
              complete and submit the reservation form on your behalf.
            </p>

            <div className="mt-7">
              <Link
                href="/bulsu-facilities"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-white px-6 text-[14px] font-bold text-bulsu shadow-lg transition-all hover:bg-[#FFFDF5] active:scale-[0.98]"
              >
                Browse facilities and find admin
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ================================================================ */}
      {/* STUDENT RESOURCE HUB                                             */}
      {/* ================================================================ */}

      <section
        id="resources"
        className="border-t border-slate-200/60 bg-white px-4 py-20 sm:px-6 sm:py-24"
      >
        <div className="mx-auto max-w-6xl">
          {/* Section heading */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center"
          >
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[14px] bg-bulsu/[0.07]">
              <FileText className="h-5 w-5 text-bulsu" />
            </div>

            <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-bulsu">
              Student Resources
            </p>

            <h2 className="mt-3 text-[30px] font-bold tracking-[-0.8px] text-slate-950 sm:text-[38px]">
              Stay informed. Know your rights. Be heard.
            </h2>

            <p className="mt-5 text-[15px] leading-7 text-slate-500">
              BulSU is dedicated to promoting openness and active communication
              between the student council and the student body. Explore
              important documents, reports, directories, policies, and resources
              that help keep our school community informed.
            </p>
          </motion.div>

          {/* Resource groups */}
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {/* Student Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.45 }}
              className="rounded-[24px] border border-slate-200/70 bg-white p-6 sm:p-7"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-bulsu/[0.07]">
                  <HeartHandshake className="h-5 w-5 text-bulsu" />
                </div>

                <div>
                  <h3 className="text-[16px] font-bold text-slate-900">
                    Student Support
                  </h3>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Help, contacts, and student representatives
                  </p>
                </div>
              </div>

              <div className="mt-6 divide-y divide-slate-100">
                <a
                  href="https://findahelpline.com/countries/ph/topics/suicidal-thoughts"
                  className="group flex items-center justify-between py-3.5"
                >
                  <span className="text-[13px] font-medium text-slate-600 transition-colors group-hover:text-bulsu">
                    Crisis Hotlines
                  </span>

                  <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-bulsu" />
                </a>

                <a
                  href="https://www.facebook.com/share/p/1715Rtfvpj/"
                  className="group flex items-center justify-between py-3.5"
                >
                  <span className="text-[13px] font-medium text-slate-600 transition-colors group-hover:text-bulsu">
                    CSSP LSC Directory
                  </span>

                  <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-bulsu" />
                </a>

                <a
                  href="https://docs.google.com/spreadsheets/d/1iv6k2LRNHt1pJ5ODwIceRmgYrMawM-mA/edit?usp=drivesdk&ouid=107773750213416118125&rtpof=true&sd=true"
                  className="group flex items-center justify-between py-3.5"
                >
                  <span className="text-[13px] font-medium text-slate-600 transition-colors group-hover:text-bulsu">
                    Classroom Officers Directory
                  </span>

                  <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-bulsu" />
                </a>
              </div>
            </motion.div>

            {/* Council Governance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.45, delay: 0.06 }}
              className="rounded-[24px] border border-slate-200/70 bg-white p-6 sm:p-7"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-gold/20">
                  <Scale className="h-5 w-5 text-[#80620D]" />
                </div>

                <div>
                  <h3 className="text-[16px] font-bold text-slate-900">
                    Council Governance
                  </h3>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Policies, rights, and governing documents
                  </p>
                </div>
              </div>

              <div className="mt-6 divide-y divide-slate-100">
                <a
                  href="https://drive.google.com/file/d/1MPSAnh7GRifkgpGhtUmYWAsxLgwj6OV6/view?usp=sharing"
                  className="group flex items-center justify-between py-3.5"
                >
                  <span className="text-[13px] font-medium text-slate-600 transition-colors group-hover:text-bulsu">
                    SG Constitution &amp; By-Laws
                  </span>

                  <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-bulsu" />
                </a>

                <a
                  href="https://drive.google.com/file/d/1wpUSCBsGja3YFiwn-KmBh0ddJOlXplBb/view?usp=drive_link"
                  className="group flex items-center justify-between py-3.5"
                >
                  <span className="text-[13px] font-medium text-slate-600 transition-colors group-hover:text-bulsu">
                    CSSP LSC Code
                  </span>

                  <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-bulsu" />
                </a>

                <a
                  href="https://drive.google.com/file/d/1oNFcUmRBdIeCoKhiEXEy_1K8rhV6oQ-L/view?usp=sharing"
                  className="group flex items-center justify-between py-3.5"
                >
                  <span className="text-[13px] font-medium text-slate-600 transition-colors group-hover:text-bulsu">
                    BulSU Student Handbook
                  </span>

                  <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-bulsu" />
                </a>

                <a
                  href="https://drive.google.com/file/d/19XD4Er7i9VdZhrcDE3yduwpU12hVhTTW/view?usp=sharing"
                  className="group flex items-center justify-between py-3.5"
                >
                  <span className="text-[13px] font-medium text-slate-600 transition-colors group-hover:text-bulsu">
                    Magna Carta of Students (MCOS)
                  </span>

                  <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-bulsu" />
                </a>
              </div>
            </motion.div>

            {/* Council Documents */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.45, delay: 0.12 }}
              className="rounded-[24px] border border-slate-200/70 bg-white p-6 sm:p-7"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-slate-900 text-white">
                  <FileText className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-[16px] font-bold text-slate-900">
                    Council Documents
                  </h3>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Official records and council materials
                  </p>
                </div>
              </div>

              <div className="mt-6 divide-y divide-slate-100">
                <a
                  href="#"
                  className="group flex items-center justify-between py-3.5"
                >
                  <span className="text-[13px] font-medium text-slate-600 transition-colors group-hover:text-bulsu">
                    Resolutions &amp; Projects
                  </span>

                  <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-bulsu" />
                </a>

                <a
                  href="https://drive.google.com/drive/folders/1DzkBxrmJfIKxY1114CsZyCpphhNf-ZOq"
                  className="group flex items-center justify-between py-3.5"
                >
                  <span className="text-[13px] font-medium text-slate-600 transition-colors group-hover:text-bulsu">
                    Executive Documents
                  </span>

                  <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-bulsu" />
                </a>

                <a
                  href="https://drive.google.com/drive/folders/1o4EMzmKZiFA49XWsYIiUT4t0dNrSgJzx?usp=sharing"
                  className="group flex items-center justify-between py-3.5"
                >
                  <span className="text-[13px] font-medium text-slate-600 transition-colors group-hover:text-bulsu">
                    Legislative Documents
                  </span>

                  <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-bulsu" />
                </a>

                <a
                  href="https://drive.google.com/drive/folders/1nqOiRUTk0ci9okuOgIT_RzjLfbq2JNMp?usp=drive_link"
                  className="group flex items-center justify-between py-3.5"
                >
                  <span className="text-[13px] font-medium text-slate-600 transition-colors group-hover:text-bulsu">
                    Minutes of the Meeting
                  </span>

                  <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-bulsu" />
                </a>

                <a
                  href="https://docs.google.com/document/d/12KX3q1DOcgF_fF5qxo2I-TWkNT12Zgio1_RYcXGUAAo/edit?usp=sharing"
                  className="group flex items-center justify-between py-3.5"
                >
                  <span className="text-[13px] font-medium text-slate-600 transition-colors group-hover:text-bulsu">
                    Narrative Report Template
                  </span>

                  <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-bulsu" />
                </a>
              </div>
            </motion.div>

            {/* Transparency & Planning */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.45, delay: 0.18 }}
              className="rounded-[24px] border border-slate-200/70 bg-white p-6 sm:p-7"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-bulsu/[0.07]">
                  <Landmark className="h-5 w-5 text-bulsu" />
                </div>

                <div>
                  <h3 className="text-[16px] font-bold text-slate-900">
                    Transparency &amp; Planning
                  </h3>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Reports, schedules, and planning resources
                  </p>
                </div>
              </div>

              <div className="mt-6 divide-y divide-slate-100">
                <a
                  href="https://drive.google.com/drive/folders/1xFEU7vW2mLKqIZBvmvJrkRGLZu1WH5ea?usp=sharing"
                  className="group flex items-center justify-between py-3.5"
                >
                  <span className="text-[13px] font-medium text-slate-600 transition-colors group-hover:text-bulsu">
                    Financial Reports
                  </span>

                  <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-bulsu" />
                </a>

                <a
                  href="https://www.facebook.com/share/p/15vpVVmM76/?mibextid=wwXIfr"
                  className="group flex items-center justify-between py-3.5"
                >
                  <span className="text-[13px] font-medium text-slate-600 transition-colors group-hover:text-bulsu">
                    BulSU Academic Calendar
                  </span>

                  <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-bulsu" />
                </a>
              </div>

              {/* Small transparency callout */}
              <div className="mt-5 rounded-[16px] bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-bulsu">
                  Our commitment
                </p>

                <p className="mt-1.5 text-[12px] leading-5 text-slate-500">
                  These resources help promote transparency, accountability, and
                  meaningful student participation.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
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
            <span className="h-1.5 w-1.5 rounded-full bg-bulsu" />
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="h-1.5 w-1.5 rounded-full bg-bulsu/30" />
          </div>

          <div>
            <p className="text-[10px] text-slate-400">
              © {new Date().getFullYear()} Bulacan State University
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
