"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import type { EventClickArg, EventInput } from "@fullcalendar/core";

import PublicNavbar from "@/components/ui/PublicNavbar/PublicNavbar";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

/* ================================================================
   TYPES
   ================================================================ */

interface FacilityDetails {
  id: string;
  name: string;
  type: string;
  location: string | null;
  status: string;
}

interface ReservationRow {
  id: number;
  purpose: string;
  status: string;
  start_time: string;
  end_time: string;
}

/* ================================================================
   HELPERS
   ================================================================ */

function formatDateTime(date: Date | null) {
  if (!date) {
    return "Not specified";
  }

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

// Event colors follow the app status language (see AGENTS.md §5).
function eventColors(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "pending") {
    return {
      backgroundColor: "#f1a926",
      borderColor: "#d49521",
      textColor: "#5F4900",
    };
  }

  return {
    backgroundColor: "#a50011",
    borderColor: "#a50011",
    textColor: "#FFFFFF",
  };
}

/* ================================================================
   PAGE — public read-only facility schedule
   ================================================================ */

export default function BulSUCalendarPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const facilityId = typeof params.id === "string" ? params.id : "";
  // Query params remain as a header fallback for shared links.
  const fallbackName = searchParams.get("name");
  const fallbackLocation = searchParams.get("location");

  const [facility, setFacility] = useState<FacilityDetails | null>(null);
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState<
    EventClickArg["event"] | null
  >(null);

  // Pure fetch (no state writes) for the public read-only schedule.
  const fetchSchedule = useCallback(async () => {
    if (!facilityId) {
      return { facility: null, reservations: [] as ReservationRow[] };
    }

    const [facilityRes, reservationRes] = await Promise.all([
      supabase
        .from("facilities")
        .select("id, name, type, location, status")
        .eq("id", facilityId)
        .single(),
      supabase
        .from("reservations")
        .select("id, purpose, status, start_time, end_time")
        .eq("facility_id", facilityId)
        .neq("status", "cancelled")
        .order("start_time", { ascending: true }),
    ]);

    if (facilityRes.error) {
      console.error("Error fetching facility:", facilityRes.error);
    }

    if (reservationRes.error) {
      console.error("Error fetching reservations:", reservationRes.error);
    }

    return {
      facility:
        facilityRes.error || !facilityRes.data
          ? null
          : (facilityRes.data as FacilityDetails),
      reservations: (reservationRes.error
        ? []
        : (reservationRes.data ?? [])) as ReservationRow[],
    };
  }, [facilityId]);

  // Applies fetch results to state; invoked from async continuations only.
  const applySchedule = useCallback(
    (result: Awaited<ReturnType<typeof fetchSchedule>>) => {
      if (!result.facility) {
        setNotFound(true);
      } else {
        setFacility(result.facility);
      }

      setReservations(result.reservations);
      setLoading(false);
    },
    []
  );

  // Public view shows live bookings; cancelled ones stay hidden.
  // Initial load (loading starts true via useState).
  useEffect(() => {
    let ignore = false;

    fetchSchedule().then((result) => {
      if (!ignore) {
        applySchedule(result);
      }
    });

    return () => {
      ignore = true;
    };
  }, [fetchSchedule, applySchedule]);

  // Close the event details dialog with Escape for keyboard users.
  useEffect(() => {
    if (!selectedEvent) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedEvent(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedEvent]);

  /* ================================================================
     CALENDAR EVENTS (live data only)
     ================================================================ */

  const calendarEvents = useMemo<EventInput[]>(() => {
    return reservations.map((reservation) => ({
      id: String(reservation.id),
      title: reservation.purpose,
      start: reservation.start_time,
      end: reservation.end_time,
      ...eventColors(reservation.status),
      extendedProps: {
        purpose: reservation.purpose,
        status: reservation.status,
      },
    }));
  }, [reservations]);

  function handleEventClick(clickInfo: EventClickArg) {
    setSelectedEvent(clickInfo.event);
  }

  /* ================================================================
     RENDER
     ================================================================ */

  if (!loading && (notFound || !facility)) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-white text-slate-950">
        <PublicNavbar />

        <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">
          <h1 className="text-[24px] font-bold text-slate-950">
            Facility not found
          </h1>

          <p className="mt-2 text-[14px] text-slate-500">
            This schedule link may be outdated. Browse all facilities instead.
          </p>

          <button
            type="button"
            onClick={() => router.push("/bulsu-facilities")}
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-bulsu px-5 text-[13px] font-semibold text-white transition-colors hover:bg-bulsu-dark"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse Facilities
          </button>
        </div>
      </main>
    );
  }

  const displayName = facility?.name ?? fallbackName ?? "Facility Schedule";
  const displayLocation = facility?.location ?? fallbackLocation ?? "";

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-slate-950">
      <PublicNavbar />

      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-bulsu/[0.055] blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-40 h-96 w-96 rounded-full bg-gold/[0.08] blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Header */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-bulsu/10 bg-bulsu/[0.05] px-3.5 py-2">
              <CalendarDays className="h-3.5 w-3.5 text-bulsu" />

              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-bulsu">
                Facility Schedule
              </span>
            </div>

            <div>
              <h1 className="text-[38px] font-bold leading-[1.05] tracking-[-1.5px] text-slate-950 sm:text-[48px]">
                {loading ? "Loading…" : displayName}
              </h1>

              {displayLocation !== "" && (
                <span className="text-2xl font-semibold text-bulsu">
                  {displayLocation}
                </span>
              )}
            </div>

            <p className="mt-4 max-w-[650px] text-[15px] leading-6 text-slate-500">
              View live reservations for this facility. Sign in to request a
              booking.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-xl border border-slate-200/70 bg-white px-4 py-2.5 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                Reservations
              </p>

              <p className="mt-0.5 text-[16px] font-bold text-slate-900">
                {loading ? "…" : calendarEvents.length}
              </p>
            </div>

            <Link
              href="/login"
              className="inline-flex h-[52px] items-center rounded-xl bg-bulsu px-5 text-[13px] font-semibold text-white shadow-[0_10px_25px_rgba(165,0,17,0.20)] transition-all hover:bg-bulsu-dark active:scale-[0.98]"
            >
              Sign In to Reserve
            </Link>
          </div>
        </motion.section>

        {/* Calendar */}
        <motion.section
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.14, ease: "easeOut" }}
          className="mt-10 rounded-[24px] border border-slate-200/70 bg-white p-3 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-5"
        >
          {loading ? (
            <div className="h-[480px] animate-pulse rounded-2xl bg-slate-100" />
          ) : (
            <div className="bulSU-calendar">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
                }}
                events={calendarEvents}
                selectable={false}
                dayMaxEvents={3}
                weekends
                height="auto"
                contentHeight="auto"
                eventDisplay="block"
                eventClick={handleEventClick}
                nowIndicator
                buttonText={{
                  today: "Today",
                  month: "Month",
                  week: "Week",
                  day: "Day",
                  list: "Agenda",
                }}
                slotMinTime="06:00:00"
                slotMaxTime="22:00:00"
                allDayText="All day"
                eventTimeFormat={{
                  hour: "numeric",
                  minute: "2-digit",
                  meridiem: "short",
                }}
              />
            </div>
          )}
        </motion.section>

        {/* Legend */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 px-1"
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Status
          </span>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-bulsu" />

            <span className="text-[12px] font-medium text-slate-500">
              Confirmed
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-gold" />

            <span className="text-[12px] font-medium text-slate-500">
              Pending
            </span>
          </div>
        </motion.section>

        {/* Filter context note */}
        <div className="mt-5 flex items-center gap-2 px-1 text-[12px] text-slate-400">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Showing live bookings for this facility only.
        </div>
      </div>

      {/* Event details modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 px-4 backdrop-blur-sm"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={`${selectedEvent.title} details`}
              className="w-full max-w-md overflow-hidden rounded-[24px] border border-slate-200/70 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.15)]"
            >
              <div className="border-b border-slate-100 px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-3 inline-flex rounded-full bg-bulsu/[0.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-bulsu">
                      {String(selectedEvent.extendedProps.status ?? "")}
                    </div>

                    <h2 className="text-[20px] font-bold leading-tight tracking-[-0.4px] text-slate-950">
                      {selectedEvent.title}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedEvent(null)}
                    aria-label="Close"
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
                      {displayName}
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
                      {formatDateTime(selectedEvent.start)}
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-400">
                      until {formatDateTime(selectedEvent.end)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                    Purpose
                  </p>

                  <div className="mt-2 rounded-xl bg-slate-50 p-3">
                    <p className="text-[13px] leading-5 text-slate-600">
                      {String(selectedEvent.extendedProps.purpose ?? "")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                    Reservation ID
                  </span>

                  <span className="font-mono text-[11px] font-medium text-slate-500">
                    #{selectedEvent.id}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="h-11 flex-1 rounded-xl border border-slate-200 bg-white text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                >
                  Close
                </button>

                <Link
                  href="/login"
                  className="flex h-11 flex-1 items-center justify-center rounded-xl bg-bulsu text-[12px] font-semibold text-white transition-colors hover:bg-bulsu-dark"
                >
                  Sign In to Reserve
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
