"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/app/providers/userProvider";
import type { ViewReservation } from "./types/view-reservation";

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

function statusDot(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "confirmed" || normalized === "checked_in") {
    return "bg-bulsu";
  }

  if (normalized === "pending") {
    return "bg-gold";
  }

  return "bg-slate-300";
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function Reservations() {
  const router = useRouter();
  const { user } = useUser();

  const [reservations, setReservations] = useState<ViewReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selected, setSelected] = useState<ViewReservation | null>(null);

  // Close the details dialog with Escape for keyboard users.
  useEffect(() => {
    if (!selected) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelected(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected]);

  // Role-scoped fetch: college admins see their college's bookings, students
  // see their own, super admins see everything (newest first).
  useEffect(() => {
    async function loadReservations() {
      setLoading(true);

      const { data: facilities } = await supabase
        .from("facilities")
        .select("id, name, type, college_id");

      const facilityMap = new Map(
        (facilities ?? []).map((facility) => [facility.id, facility])
      );

      let query = supabase
        .from("reservations")
        .select(
          "id, purpose, status, start_time, end_time, user_id, facility_id, created_at"
        )
        .order("start_time", { ascending: false })
        .limit(500);

      if (user?.role === "College Admin" && user?.college?.id) {
        const ownIds = (facilities ?? [])
          .filter((facility) => facility.college_id === user.college?.id)
          .map((facility) => facility.id);

        query = query.in(
          "facility_id",
          ownIds.length > 0 ? ownIds : ["__none__"]
        );
      } else if (user?.role !== "Super Admin" && user?.id) {
        query = query.eq("user_id", user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching reservations:", error);
        setReservations([]);
        setLoading(false);
        return;
      }

      // Join facility names client-side (no FK-name dependency).
      setReservations(
        (data ?? []).map((row) => {
          const facility = facilityMap.get(row.facility_id);
          return {
            ...row,
            facility_name: facility?.name ?? "Unknown facility",
            facility_type: facility?.type ?? "—",
          };
        })
      );
      setLoading(false);
    }

    loadReservations();
  }, [user?.id, user?.role, user?.college?.id]);

  // Status pills derive from data so new workflow states appear automatically.
  const statusFilters = useMemo(() => {
    const unique = new Set(reservations.map((row) => row.status.toLowerCase()));
    return ["All Status", ...[...unique].sort()];
  }, [reservations]);

  const filtered = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return reservations.filter((row) => {
      if (
        selectedStatus !== "All Status" &&
        row.status.toLowerCase() !== selectedStatus
      ) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [row.purpose, row.facility_name, row.facility_type, String(row.id)]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [reservations, searchQuery, selectedStatus]);

  if (!user) {
    router.replace("/login");
    router.refresh();
    return null;
  }

  const titleSuffix =
    user.role === "College Admin" && user.college
      ? ` ${user.college.code}`
      : "";

  const isStudentOrgAdmin = user.role === "Student Org Admin";

  return (
    <div className="relative min-h-screen bg-white p-6 sm:p-10">
      <div className="pointer-events-none absolute right-10 top-32 h-80 w-80 rounded-full bg-gold/50 blur-[200px]" />
      <div className="pointer-events-none absolute -left-50 top-5 h-96 w-96 rounded-full bg-bulsu/[0.15] blur-[100px]" />

      <div className="relative mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-[32px] font-bold leading-tight tracking-[-1.2px] text-slate-950 sm:text-[40px]">
              {isStudentOrgAdmin ? "My" : "Manage"}{" "}
              <span className="text-bulsu">
                Reservations for<span className="text-gold">{titleSuffix}</span>
              </span>
            </h1>

            <p className="mt-1 text-[15px] text-slate-500">
              Track upcoming bookings, review history, and check approval
              status.
            </p>
          </div>

          <div className="rounded-[14px] border border-slate-200/70 bg-white px-5 py-3 shadow-[0_8px_25px_rgba(15,23,42,0.04)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Showing
            </p>

            <p className="mt-0.5 text-[20px] font-bold text-bulsu">
              {loading ? "…" : filtered.length}
            </p>
          </div>
        </motion.div>

        {/* Filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: "easeOut" }}
          className="rounded-[24px] border border-slate-200/70 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.03)]"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-bulsu" />

              <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Filter reservations
              </span>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                {statusFilters.map((status) => {
                  const active = selectedStatus === status;

                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setSelectedStatus(status)}
                      className={`rounded-full px-3 py-1.5 text-[11px] font-semibold capitalize transition-colors active:scale-95 ${
                        active
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>

              <div className="relative w-full lg:w-72">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search by purpose, facility, or ID…"
                  aria-label="Search reservations"
                  className="h-10 w-full rounded-full border border-slate-200/80 bg-white pl-10 pr-4 text-[13px] text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-bulsu focus:bg-white focus:ring-2 focus:ring-bulsu/10"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* One-liner list */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.14, ease: "easeOut" }}
          className="flex flex-col gap-3"
        >
          {loading &&
            Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-[64px] animate-pulse rounded-[18px] border border-slate-200/70 bg-white"
              />
            ))}

          {!loading && filtered.length === 0 && (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[15px] bg-bulsu/[0.07]">
                <CalendarDays className="h-5 w-5 text-bulsu" />
              </div>

              <h3 className="mt-5 text-[16px] font-bold text-slate-900">
                No reservations found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-[13px] leading-5 text-slate-500">
                Try a different search or status filter — or browse facilities
                to make your first booking.
              </p>
            </div>
          )}

          {!loading &&
            filtered.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => setSelected(row)}
                aria-label={`View reservation ${row.id}, ${row.purpose}`}
                className="group flex w-full items-center gap-3 rounded-[18px] border border-slate-200/70 bg-white px-4 py-3.5 text-left shadow-[0_8px_25px_rgba(15,23,42,0.03)] transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md active:scale-[0.995] sm:gap-4 sm:px-5"
              >
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${statusDot(
                    row.status
                  )}`}
                />

                <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-slate-900 sm:text-[14px]">
                  {row.purpose}
                  <span className="font-medium text-slate-400">
                    {" "}
                    · {row.facility_name}
                  </span>
                </span>

                <span className="hidden shrink-0 items-center gap-1.5 text-[12px] font-medium text-slate-500 md:flex">
                  <Clock3 className="h-3.5 w-3.5 text-bulsu" />
                  {formatDateTime(row.start_time)}
                </span>

                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold capitalize ${statusPill(
                    row.status
                  )}`}
                >
                  {row.status.replace("_", " ")}
                </span>
              </button>
            ))}
        </motion.div>
      </div>

      {/* Details modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 px-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={`Reservation ${selected.id} details`}
              className="w-full max-w-md overflow-hidden rounded-[24px] border border-slate-200/70 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.15)]"
            >
              <div className="border-b border-slate-100 px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div
                      className={`mb-3 inline-flex rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] ${statusPill(
                        selected.status
                      )}`}
                    >
                      {selected.status.replace("_", " ")}
                    </div>

                    <h2 className="text-[20px] font-bold leading-tight tracking-[-0.4px] text-slate-950">
                      {selected.purpose}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    aria-label="Close details"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-5 px-6 py-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-bulsu/[0.07]">
                    <MapPin className="h-4 w-4 text-bulsu" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      Facility
                    </p>

                    <p className="mt-1 text-[13px] font-semibold text-slate-800">
                      {selected.facility_name}
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {selected.facility_type}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-bulsu/[0.07]">
                    <Clock3 className="h-4 w-4 text-bulsu" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      Schedule
                    </p>

                    <p className="mt-1 text-[13px] font-semibold text-slate-800">
                      {formatDateTime(selected.start_time)}
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-400">
                      until {formatDateTime(selected.end_time)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                    Reservation ID
                  </span>

                  <span className="font-mono text-[11px] font-medium text-slate-500">
                    #{selected.id}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                    Requested
                  </span>

                  <span className="text-[11px] font-medium text-slate-500">
                    {formatDateTime(selected.created_at)}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="h-11 w-full rounded-xl bg-bulsu text-[13px] font-semibold text-white transition-colors hover:bg-bulsu-dark active:scale-[0.99]"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
