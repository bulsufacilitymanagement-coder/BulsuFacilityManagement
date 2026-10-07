"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  School,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/app/providers/userProvider";
import { StatCard } from "./cards/StatCard";
import { QuickActions } from "./QuickActions";
import { FacilitiesByTypeChart } from "./charts/FacilitiesByTypeChart";
import { ReservationStatusChart } from "./charts/ReservationStatusChart";
import { ReservationTrendChart } from "./charts/ReservationTrendChart";
import type {
  DashboardStat,
  FacilitySummary,
  FacilityTypeCount,
  QuickAction,
  ReservationStatusCount,
  ReservationSummary,
  ReservationTrendPoint,
} from "./types/dashboard";

const supabase = createClient();

// Pill colors reuse the app status language (see AGENTS.md §5).
function statusPill(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "confirmed" || normalized === "checked_in") {
    return "border-emerald-200/60 bg-emerald-50 text-emerald-700";
  }

  if (normalized === "pending") {
    return "border-amber-200/60 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-slate-100 text-slate-600";
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default function Dashboard() {
  const { user } = useUser();

  const [facilities, setFacilities] = useState<FacilitySummary[]>([]);
  const [reservations, setReservations] = useState<ReservationSummary[]>([]);
  const [collegeCount, setCollegeCount] = useState<number | null>(null);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = user?.role === "Super Admin";
  const isCollegeAdmin = user?.role === "College Admin";

  // One parallel fetch for every dashboard source. Counts are best-effort:
  // RLS may hide colleges/profiles from non-admins, so null hides the card.
  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);

      let facilityQuery = supabase
        .from("facilities")
        .select("id, name, type, status, college_id");

      // College Admins only ever see their own college's inventory.
      if (isCollegeAdmin && user?.college?.id) {
        facilityQuery = facilityQuery.eq("college_id", user.college.id);
      }

      const [facilityRes, reservationRes, collegeRes, userRes] =
        await Promise.all([
          facilityQuery,
          supabase
            .from("reservations")
            .select("id, purpose, status, start_time, end_time, user_id, facility_id")
            .order("start_time", { ascending: false })
            .limit(200),
          supabase.from("colleges").select("id", { count: "exact", head: true }),
          supabase.from("profiles").select("id", { count: "exact", head: true }),
        ]);

      if (!facilityRes.error) {
        setFacilities(facilityRes.data ?? []);
      }

      if (!reservationRes.error) {
        setReservations(reservationRes.data ?? []);
      }

      if (!collegeRes.error) {
        setCollegeCount(collegeRes.count ?? 0);
      }

      if (!userRes.error) {
        setUserCount(userRes.count ?? 0);
      }

      setLoading(false);
    }

    loadDashboard();
  }, [isCollegeAdmin, user?.college?.id]);

  // Facility id -> college map, so reservations can be scoped without
  // relying on an embedded join (FK name varies per project).
  const facilityCollege = useMemo(() => {
    const map = new Map<string, string | null>();
    for (const facility of facilities) {
      map.set(facility.id, facility.college_id);
    }
    return map;
  }, [facilities]);

  // Role-scoped reservations: college admins see their college's bookings,
  // students see their own, super admins see everything loaded.
  const visibleReservations = useMemo(() => {
    if (isCollegeAdmin) {
      if (!user?.college?.id) {
        return reservations;
      }
      return reservations.filter(
        (row) => facilityCollege.get(row.facility_id) === user.college?.id
      );
    }

    if (!isSuperAdmin && user?.id) {
      return reservations.filter((row) => row.user_id === user.id);
    }

    return reservations;
  }, [reservations, isCollegeAdmin, isSuperAdmin, user, facilityCollege]);

  const stats: DashboardStat[] = useMemo(() => {
    const now = new Date();
    const available = facilities.filter((f) => f.status === "Available").length;
    const pending = visibleReservations.filter(
      (row) => row.status.toLowerCase() === "pending"
    ).length;

    if (isSuperAdmin) {
      return [
        {
          label: "Total Facilities",
          value: String(facilities.length),
          subtext: `${collegeCount ?? "–"} colleges`,
          icon: Building2,
          tone: "bulsu",
        },
        {
          label: "Registered Users",
          value: userCount === null ? "–" : String(userCount),
          subtext: "all roles",
          icon: Users,
          tone: "gold",
        },
        {
          label: "Total Reservations",
          value: String(visibleReservations.length),
          subtext: `${pending} pending`,
          icon: CalendarCheck,
          tone: "green",
        },
        {
          label: "Colleges",
          value: collegeCount === null ? "–" : String(collegeCount),
          subtext: "managed units",
          icon: School,
          tone: "slate",
        },
      ];
    }

    if (isCollegeAdmin) {
      return [
        {
          label: "My Facilities",
          value: String(facilities.length),
          subtext: user?.college ? user.college.code : "my college",
          icon: Building2,
          tone: "bulsu",
        },
        {
          label: "Available Now",
          value: String(available),
          subtext: "ready to book",
          icon: CheckCircle2,
          tone: "green",
        },
        {
          label: "College Bookings",
          value: String(visibleReservations.length),
          subtext: `${pending} pending review`,
          icon: CalendarCheck,
          tone: "gold",
        },
        {
          label: "Pending Review",
          value: String(pending),
          subtext: "needs action",
          icon: Clock3,
          tone: "slate",
        },
      ];
    }

    const myUpcoming = visibleReservations.filter(
      (row) => new Date(row.end_time) >= now
    ).length;
    const myDone = visibleReservations.filter(
      (row) =>
        new Date(row.end_time) < now &&
        ["confirmed", "checked_in"].includes(row.status.toLowerCase())
    ).length;

    return [
      {
        label: "Available Facilities",
        value: String(available),
        subtext: "ready to book",
        icon: Building2,
        tone: "bulsu",
      },
      {
        label: "My Upcoming",
        value: String(myUpcoming),
        subtext: "active bookings",
        icon: CalendarCheck,
        tone: "green",
      },
      {
        label: "My Pending",
        value: String(pending),
        subtext: "awaiting approval",
        icon: Clock3,
        tone: "gold",
      },
      {
        label: "Completed",
        value: String(myDone),
        subtext: "past bookings",
        icon: CheckCircle2,
        tone: "slate",
      },
    ];
  }, [facilities, visibleReservations, isSuperAdmin, isCollegeAdmin, user, collegeCount, userCount]);

  // Bar chart source: live facility inventory grouped by type.
  const facilitiesByType: FacilityTypeCount[] = useMemo(() => {
    const counts = new Map<string, number>();
    for (const facility of facilities) {
      counts.set(facility.type, (counts.get(facility.type) ?? 0) + 1);
    }
    return [...counts.entries()].map(([type, count]) => ({ type, count }));
  }, [facilities]);

  // Donut source: visible reservations grouped by status.
  const reservationsByStatus: ReservationStatusCount[] = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of visibleReservations) {
      const key = row.status.toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()].map(([status, count]) => ({ status, count }));
  }, [visibleReservations]);

  // Trend source: bookings per day for the last 14 days (local dates).
  const bookingTrend: ReservationTrendPoint[] = useMemo(() => {
    const days: ReservationTrendPoint[] = [];
    const buckets = new Map<string, number>();

    for (let offset = 13; offset >= 0; offset--) {
      const date = new Date();
      date.setDate(date.getDate() - offset);
      const key = date.toDateString();
      buckets.set(key, 0);
      days.push({ day: formatShortDate(date.toISOString()), bookings: 0 });
    }

    for (const row of visibleReservations) {
      const key = new Date(row.start_time).toDateString();
      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) ?? 0) + 1);
      }
    }

    // Buckets and day labels share insertion order, so index-align them.
    const counts = [...buckets.values()];
    return days.map((day, index) => ({ ...day, bookings: counts[index] ?? 0 }));
  }, [visibleReservations]);

  const recentReservations = useMemo(
    () => visibleReservations.slice(0, 5),
    [visibleReservations]
  );

  const facilityName = useMemo(() => {
    const map = new Map<string, string>();
    for (const facility of facilities) {
      map.set(facility.id, facility.name);
    }
    return map;
  }, [facilities]);

  // Quick actions only link to routes that exist today.
  const quickActions: QuickAction[] = useMemo(() => {
    const base: QuickAction[] = isCollegeAdmin
      ? [
          {
            label: "Manage Facilities",
            description: "Inventory for your college",
            href: "/facilities",
            icon: Building2,
            tone: "bulsu",
          },
          {
            label: "Public Schedule",
            description: "See what students see",
            href: "/bulsu-facilities",
            icon: CalendarDays,
            tone: "dark",
          },
        ]
      : [
          {
            label: "Browse Facilities",
            description: "Find a space to book",
            href: "/facilities",
            icon: Building2,
            tone: "bulsu",
          },
          {
            label: "Check Availability",
            description: "Live public schedules",
            href: "/bulsu-facilities",
            icon: CalendarDays,
            tone: "dark",
          },
        ];

    if (isSuperAdmin) {
      base.push(
        {
          label: "Manage Colleges",
          description: "Colleges and units",
          href: "/colleges",
          icon: School,
          tone: "gold",
        },
        {
          label: "Manage Users",
          description: "Accounts and roles",
          href: "/user-management",
          icon: Users,
          tone: "dark",
        }
      );
    }

    return base;
  }, [isCollegeAdmin, isSuperAdmin]);

  const firstName = user?.first_name ?? "there";
  const contextLine = isCollegeAdmin && user?.college
    ? `Here's what's happening in ${user.college.name} today.`
    : "Here's what's happening across campus today.";

  return (
    <div className="relative min-h-screen overflow-hidden bg-white p-6 sm:p-10">
      {/* Background ambient accents */}
      <div className="pointer-events-none absolute right-10 top-32 h-80 w-80 rounded-full bg-gold/50 blur-[200px]" />
      <div className="pointer-events-none absolute -left-50 top-5 h-96 w-96 rounded-full bg-bulsu/[0.15] blur-[100px]" />

      <div className="relative mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <h1 className="text-[32px] font-bold leading-tight tracking-[-1.2px] text-slate-950 sm:text-[40px]">
            Welcome back, <span className="text-bulsu">{firstName}</span>
          </h1>

          <p className="mt-1 text-[15px] text-slate-500">{contextLine}</p>
        </motion.div>

        {/* Summary cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: "easeOut" }}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4"
        >
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} loading={loading} />
          ))}
        </motion.div>

        {/* Charts row 1 */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.14, ease: "easeOut" }}
          className="grid grid-cols-1 gap-5 lg:grid-cols-5"
        >
          <div className="lg:col-span-3">
            <FacilitiesByTypeChart data={facilitiesByType} loading={loading} />
          </div>

          <div className="lg:col-span-2">
            <ReservationStatusChart data={reservationsByStatus} loading={loading} />
          </div>
        </motion.div>

        {/* Trend + latest bookings */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="grid grid-cols-1 gap-5 lg:grid-cols-5"
        >
          <div className="lg:col-span-3">
            <ReservationTrendChart data={bookingTrend} loading={loading} />
          </div>

          <div className="rounded-[24px] border border-slate-200/70 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.03)] lg:col-span-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Latest
            </p>

            <h2 className="mt-1 text-[18px] font-bold text-slate-950">
              Recent Bookings
            </h2>

            <div className="mt-4 flex flex-col gap-3">
              {loading &&
                Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[68px] animate-pulse rounded-2xl bg-slate-100"
                  />
                ))}

              {!loading && recentReservations.length === 0 && (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center text-[13px] text-slate-500">
                  No bookings to show yet.
                </p>
              )}

              {!loading &&
                recentReservations.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[13px] font-bold leading-5 text-slate-900">
                        {row.purpose}
                      </p>

                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold capitalize ${statusPill(row.status)}`}
                      >
                        {row.status.replace("_", " ")}
                      </span>
                    </div>

                    <p className="mt-1 text-[12px] text-slate-500">
                      {facilityName.get(row.facility_id) ?? "Unknown facility"} ·{" "}
                      {formatShortDate(row.start_time)}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.26, ease: "easeOut" }}
        >
          <h2 className="mb-4 text-[18px] font-bold text-slate-950">
            Quick Actions
          </h2>

          <QuickActions actions={quickActions} />
        </motion.div>
      </div>
    </div>
  );
}
