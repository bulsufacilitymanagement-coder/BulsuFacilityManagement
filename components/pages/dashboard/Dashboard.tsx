"use client";

import { UserMetadata } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Plus,
  Sparkles,
} from "lucide-react";

const stats = [
  {
    label: "Active Reservations",
    value: "3",
    subtext: "Currently active",
    icon: CalendarDays,
    bg: "bg-[#A6192E]/[0.07]",
    color: "text-[#A6192E]",
  },
  {
    label: "Pending Requests",
    value: "2",
    subtext: "Awaiting approval",
    icon: Clock3,
    bg: "bg-amber-50",
    color: "text-amber-600",
  },
  {
    label: "Completed",
    value: "12",
    subtext: "This semester",
    icon: Sparkles,
    bg: "bg-emerald-50",
    color: "text-emerald-600",
  },
];

const activeReservations = [
  {
    id: "RES-2026-001",
    facility: "University Gymnasium",
    campus: "Main Campus",
    status: "Approved",
    statusTone: "green",
    date: "September 5, 2026",
    time: "8:00 AM – 12:00 PM",
  },
  {
    id: "RES-2026-002",
    facility: "Audio Visual Room",
    campus: "Main Campus",
    status: "Pending",
    statusTone: "amber",
    date: "September 8, 2026",
    time: "1:00 PM – 4:00 PM",
  },
  {
    id: "RES-2026-003",
    facility: "Conference Hall",
    campus: "Satellite Campus",
    status: "Approved",
    statusTone: "green",
    date: "September 12, 2026",
    time: "9:00 AM – 3:00 PM",
  },
];

interface DashboardProps {
  user: UserMetadata;
}

export default function Dashboard({ user }: DashboardProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white p-6 sm:p-10">
      {/* Background ambient accents */}
      <div className="pointer-events-none absolute right-10 top-32 h-80 w-80 rounded-full bg-[#F4C430]/50 blur-[200px]" />
      <div className="pointer-events-none absolute -left-50 top-5 h-96 w-96 rounded-full bg-[#A6192E]/[0.15] blur-[100px]" />

      <div className="relative mx-auto max-w-6xl space-y-10">
        {/* Header / Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-[32px] font-bold leading-tight -tracking-[2px] text-slate-950 sm:text-[40px]">
              Welcome back,{" "}
              <span className="text-[#A6192E]">{user.full_name}</span>
            </h1>

            <p className="text-[15px] text-slate-500">
              Manage your university facility bookings and check application
              statuses.
            </p>
          </div>

          <button
            type="button"
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-[#A6192E] px-6 text-[14px] font-semibold text-white shadow-[0_10px_25px_rgba(166,25,46,0.20)] transition-all hover:bg-[#8F1728] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            New Reservation
          </button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.55,
            delay: 0.08,
            ease: "easeOut",
          }}
          className="grid gap-5 sm:grid-cols-3"
        >
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="relative overflow-hidden rounded-[24px] border border-slate-200/70 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.03)]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">
                    {stat.label}
                  </span>

                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl ${stat.bg}`}
                  >
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>

                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-[36px] font-bold tracking-tight text-slate-950">
                    {stat.value}
                  </span>

                  <span className="text-[12px] font-semibold text-slate-500">
                    {stat.subtext}
                  </span>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Active Reservations & Preview */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.14,
            ease: "easeOut",
          }}
          className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]"
        >
          {/* Main List */}
          <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_25px_70px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Live Status
                </p>

                <h2 className="text-[20px] font-bold text-slate-950">
                  Active Reservations
                </h2>
              </div>

              <button
                type="button"
                className="text-[13px] font-semibold text-[#A6192E] hover:underline"
              >
                View All
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-4">
              {activeReservations.map((item) => (
                <div
                  key={item.id}
                  className="group rounded-[20px] border border-slate-100 bg-[#FAFAF8] p-5 transition-all hover:border-slate-200 hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {item.id}
                      </span>

                      <h3 className="mt-0.5 text-[17px] font-bold text-slate-900">
                        {item.facility}
                      </h3>

                      <div className="mt-1 flex items-center gap-1.5 text-[12px] text-slate-500">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {item.campus}
                      </div>
                    </div>

                    <span
                      className={`rounded-full border px-3 py-1 text-[11px] font-bold ${
                        item.statusTone === "amber"
                          ? "border-amber-200/60 bg-amber-50 text-amber-700"
                          : "border-emerald-200/60 bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-200/50 pt-3.5 text-[12px] font-medium text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-[#A6192E]" />
                      {item.date}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock3 className="h-3.5 w-3.5 text-[#A6192E]" />
                      {item.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side Feature / Announcement Card */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-slate-200/70 bg-[#A6192E] p-7 text-white shadow-[0_25px_70px_rgba(166,25,46,0.25)]">
            {/* Gold Accent */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#F4C430]/30 blur-2xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#F4C430] backdrop-blur-md">
                <Sparkles className="h-3 w-3" />
                University Policy Reminder
              </div>

              <h3 className="mt-5 text-[24px] font-bold leading-snug tracking-tight">
                Reservation guidelines for end of semester usage.
              </h3>

              <p className="mt-3 text-[14px] leading-relaxed text-white/80">
                All requests require at least 3 working days prior notice for
                approval by the Dean&apos;s Office and General Services.
              </p>
            </div>

            <div className="relative mt-8 flex items-center justify-between border-t border-white/15 pt-6">
              <span className="text-[12px] font-semibold text-white/70">
                BulSU Facilities Office
              </span>

              <a
                href="#guidelines"
                className="group inline-flex items-center gap-1.5 text-[13px] font-bold text-[#F4C430] hover:underline"
              >
                Read Policy
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
