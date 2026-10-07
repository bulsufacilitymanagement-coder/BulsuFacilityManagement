"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import type {
  DateSelectArg,
  EventClickArg,
  EventInput,
} from "@fullcalendar/core";

import { useUser } from "@/app/providers/userProvider";
import { createClient } from "@/lib/supabase/client";
import { canReserveFacility } from "@/lib/auth/permissions";
import {
  AddReservationSheet,
  type ExistingBooking,
} from "./Sheets/AddReservationSheet";

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
  capacity: number | null;
}

interface ReservationRow {
  id: number;
  purpose: string;
  status: string;
  start_time: string;
  end_time: string;
  user_id: string;
  created_at: string;
}

const STATUS_FILTERS = ["All Status", "pending", "confirmed", "cancelled"];

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

  if (normalized === "cancelled") {
    return {
      backgroundColor: "#CBD5E1",
      borderColor: "#94A3B8",
      textColor: "#475569",
    };
  }

  return {
    backgroundColor: "#a50011",
    borderColor: "#a50011",
    textColor: "#FFFFFF",
  };
}

/* ================================================================
   PAGE — single facility schedule with booking
   ================================================================ */

export default function ReservationsSchedule() {
  const router = useRouter();
  const params = useParams();
  const facilityId = typeof params.id === "string" ? params.id : "";

  const { user } = useUser();

  const [facility, setFacility] = useState<FacilityDetails | null>(null);
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedEvent, setSelectedEvent] = useState<
    EventClickArg["event"] | null
  >(null);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [slotStart, setSlotStart] = useState<Date | null>(null);
  const [slotEnd, setSlotEnd] = useState<Date | null>(null);
  // Bumped on every open so the sheet remounts with fresh form state.
  const [sheetSession, setSheetSession] = useState(0);

  // Only College Admins and Student Org Admins may book, and only when
  // the facility itself is accepting reservations.
  const canBook = canReserveFacility(user?.role) && facility?.status === "Available";

  // Pure fetch (no state writes) shared by the initial load and refreshes.
  const fetchSchedule = useCallback(async () => {
    if (!facilityId) {
      return { facility: null, reservations: [] as ReservationRow[] };
    }

    const [facilityRes, reservationRes] = await Promise.all([
      supabase
        .from("facilities")
        .select("id, name, type, location, status, capacity")
        .eq("id", facilityId)
        .single(),
      supabase
        .from("reservations")
        .select("id, purpose, status, start_time, end_time, user_id, created_at")
        .eq("facility_id", facilityId)
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

  // Silent refresh after a booking is created.
  const refreshSchedule = useCallback(() => {
    fetchSchedule().then((result) => {
      applySchedule(result);
    });
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
     FILTER RESERVATIONS
     ================================================================ */

  const filteredReservations = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return reservations.filter((reservation) => {
      if (
        selectedStatus !== "All Status" &&
        reservation.status.toLowerCase() !== selectedStatus
      ) {
        return false;
      }

      if (normalizedSearch) {
        const searchableText = [
          reservation.purpose,
          reservation.status,
          String(reservation.id),
        ]
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(normalizedSearch)) {
          return false;
        }
      }

      return true;
    });
  }, [reservations, searchQuery, selectedStatus]);

  /* ================================================================
     FULLCALENDAR EVENTS
     ================================================================ */

  const calendarEvents = useMemo<EventInput[]>(() => {
    return filteredReservations.map((reservation) => {
      const colors = eventColors(reservation.status);

      return {
        id: String(reservation.id),
        title: reservation.purpose,
        start: reservation.start_time,
        end: reservation.end_time,
        ...colors,
        classNames: ["reservation-event"],
        extendedProps: {
          purpose: reservation.purpose,
          status: reservation.status,
          userId: reservation.user_id,
          createdAt: reservation.created_at,
        },
      };
    });
  }, [filteredReservations]);

  // Non-cancelled bookings feed the overlap guard in the booking sheet.
  const existingBookings: ExistingBooking[] = useMemo(() => {
    return reservations
      .filter((row) => row.status.toLowerCase() !== "cancelled")
      .map((row) => ({
        start_time: row.start_time,
        end_time: row.end_time,
        status: row.status,
      }));
  }, [reservations]);

  // Auth guard sits after every hook so hook order never changes per render.
  if (!user) {
    router.replace("/login");

    return null;
  }

  /* ================================================================
     HANDLERS
     ================================================================ */

  function handleEventClick(clickInfo: EventClickArg) {
    setSelectedEvent(clickInfo.event);
  }

  // Dragging across open time prefills the booking sheet (eligible roles only).
  function handleDateSelect(selectInfo: DateSelectArg) {
    if (!canBook) {
      return;
    }

    setSlotStart(selectInfo.start);
    setSlotEnd(selectInfo.end);
    setSheetSession((session) => session + 1);
    setSheetOpen(true);
  }

  function handleReserveClick() {
    setSlotStart(null);
    setSlotEnd(null);
    setSheetSession((session) => session + 1);
    setSheetOpen(true);
  }

  function clearFilters() {
    setSelectedStatus("All Status");
    setSearchQuery("");
  }

  const hasFilters =
    selectedStatus !== "All Status" || searchQuery.trim() !== "";

  /* ================================================================
     NOT FOUND
     ================================================================ */

  if (!loading && (notFound || !facility)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-6">
        <div className="w-full max-w-md rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <h2 className="text-[20px] font-bold text-slate-950">
            Facility not found
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-5 text-slate-500">
            This facility may have been removed. Pick another space to view
            its schedule.
          </p>

          <button
            type="button"
            onClick={() => router.push("/facilities")}
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-bulsu px-5 text-[13px] font-semibold text-white transition-colors hover:bg-bulsu-dark active:scale-[0.98]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Facilities
          </button>
        </div>
      </div>
    );
  }

  /* ================================================================
     RENDER
     ================================================================ */

  return (
    <div className="relative min-h-screen bg-white p-6 sm:p-10">
      {/* Background accents */}
      <div className="pointer-events-none absolute right-10 top-32 h-80 w-80 rounded-full bg-gold/50 blur-[200px]" />
      <div className="pointer-events-none absolute -left-50 top-5 h-96 w-96 rounded-full bg-bulsu/[0.15] blur-[100px]" />

      <div className="relative mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-bulsu/10 bg-bulsu/[0.05] px-3.5 py-2">
              <CalendarDays className="h-3.5 w-3.5 text-bulsu" />

              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-bulsu">
                {loading ? "Loading…" : facility?.type ?? "Facility Schedule"}
              </span>
            </div>

            <h1 className="text-[32px] font-bold leading-tight tracking-[-1.2px] text-slate-950 sm:text-[40px]">
              {loading ? "Loading schedule…" : facility?.name}
            </h1>

            {!loading && facility && (
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-slate-500">
                {facility.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {facility.location}
                  </span>
                )}

                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                    facility.status === "Available"
                      ? "border-emerald-200/60 bg-emerald-50 text-emerald-700"
                      : "border-amber-200/60 bg-amber-50 text-amber-700"
                  }`}
                >
                  {facility.status}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-[14px] border border-slate-200/70 bg-white px-5 py-3 shadow-[0_8px_25px_rgba(15,23,42,0.04)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                Showing
              </p>

              <p className="mt-0.5 text-[20px] font-bold text-bulsu">
                {calendarEvents.length}
              </p>
            </div>

            {canBook && (
              <button
                type="button"
                onClick={handleReserveClick}
                className="inline-flex h-[52px] items-center gap-2 rounded-[14px] bg-bulsu px-6 text-[14px] font-semibold text-white shadow-[0_10px_25px_rgba(165,0,17,0.20)] transition-all hover:bg-bulsu-dark active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" />
                Reserve Facility
              </button>
            )}
          </div>
        </motion.div>

        {/* Unavailable notice for bookable roles */}
        {!loading && facility && facility.status !== "Available" && canReserveFacility(user?.role) && (
          <div className="rounded-[18px] border border-amber-200/60 bg-amber-50 px-5 py-4 text-[13px] leading-5 text-amber-800">
            <span className="font-bold">Not accepting reservations</span> — this
            facility is currently marked as {facility.status}. Existing bookings
            are still shown below.
          </div>
        )}

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
                {STATUS_FILTERS.map((status) => {
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

                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="ml-auto text-[11px] font-semibold text-bulsu hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              <div className="relative w-full lg:w-72">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search reservation..."
                  aria-label="Search reservations"
                  className="h-10 w-full rounded-full border border-slate-200/80 bg-white pl-10 pr-4 text-[13px] text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-bulsu focus:bg-white focus:ring-2 focus:ring-bulsu/10"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.14, ease: "easeOut" }}
          className="rounded-[24px] border border-slate-200/70 bg-white p-3 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-5"
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
                selectable={canBook}
                selectMirror
                dayMaxEvents={3}
                weekends
                height="auto"
                contentHeight="auto"
                eventDisplay="block"
                select={handleDateSelect}
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
        </motion.div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-1">
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

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />

            <span className="text-[12px] font-medium text-slate-500">
              Cancelled
            </span>
          </div>
        </div>
      </div>

      {/* Booking sheet + receipt */}
      {facility && (
        <AddReservationSheet
          key={sheetSession}
          facility={{
            id: facility.id,
            name: facility.name,
            type: facility.type,
            location: facility.location,
          }}
          initialStart={slotStart}
          initialEnd={slotEnd}
          existingBookings={existingBookings}
          userId={user.id}
          isOpen={sheetOpen}
          onClose={() => setSheetOpen(false)}
          onCreated={refreshSchedule}
        />
      )}

      {/* Event details modal */}
      <AnimatePresence>
        {selectedEvent && facility && (
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
                      {facility.name}
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {facility.type}
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

              <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="h-11 w-full rounded-xl bg-bulsu text-[13px] font-semibold text-white transition-colors hover:bg-bulsu-dark"
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
