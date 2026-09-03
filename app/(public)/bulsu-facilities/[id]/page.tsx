"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock3,
  MapPin,
  SlidersHorizontal,
  X,
} from "lucide-react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import type {
  DateSelectArg,
  EventClickArg,
  EventInput,
} from "@fullcalendar/core";

import PublicNavbar from "@/components/ui/PublicNavbar/PublicNavbar";

/* ================================================================
   TYPES
   ================================================================ */

type DummyReservation = {
  id: number;
  purpose: string;
  status: "confirmed" | "pending" | "cancelled" | string;
  start_time: string;
  end_time: string;
  user_id: string;
  facility_id: string;
  created_at: string;

  facilities: {
    id: string;
    name: string;
    type: "Auditorium" | "Laboratory" | "Conference Room" | "Sports & Grounds";
  };
};

/* ================================================================
   FACILITY TYPES
   ================================================================ */

const FACILITY_TYPES = [
  "All Venues",
  "Auditorium",
  "Laboratory",
  "Conference Room",
  "Sports & Grounds",
];

/* ================================================================
   DUMMY RESERVATIONS
   ================================================================ */

const DUMMY_RESERVATIONS: DummyReservation[] = [
  {
    id: 1,
    purpose: "Engineering Orientation",
    status: "confirmed",
    start_time: "2026-09-04T08:00:00+08:00",
    end_time: "2026-09-04T11:00:00+08:00",
    user_id: "11111111-1111-1111-1111-111111111111",
    facility_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    created_at: "2026-08-25T10:00:00+08:00",

    facilities: {
      id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      name: "BulSU Auditorium",
      type: "Auditorium",
    },
  },

  {
    id: 2,
    purpose: "Faculty Meeting",
    status: "confirmed",
    start_time: "2026-09-05T13:00:00+08:00",
    end_time: "2026-09-05T15:00:00+08:00",
    user_id: "22222222-2222-2222-2222-222222222222",
    facility_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    created_at: "2026-08-27T09:30:00+08:00",

    facilities: {
      id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      name: "Conference Room A",
      type: "Conference Room",
    },
  },

  {
    id: 3,
    purpose: "Chemistry Laboratory Class",
    status: "confirmed",
    start_time: "2026-09-07T09:00:00+08:00",
    end_time: "2026-09-07T12:00:00+08:00",
    user_id: "33333333-3333-3333-3333-333333333333",
    facility_id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    created_at: "2026-08-28T14:20:00+08:00",

    facilities: {
      id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
      name: "Science Laboratory 2",
      type: "Laboratory",
    },
  },

  {
    id: 4,
    purpose: "Student Organization Fair",
    status: "confirmed",
    start_time: "2026-09-09T08:00:00+08:00",
    end_time: "2026-09-09T17:00:00+08:00",
    user_id: "44444444-4444-4444-4444-444444444444",
    facility_id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
    created_at: "2026-08-29T11:15:00+08:00",

    facilities: {
      id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
      name: "University Grounds",
      type: "Sports & Grounds",
    },
  },

  {
    id: 5,
    purpose: "Computer Science Seminar",
    status: "confirmed",
    start_time: "2026-09-12T10:00:00+08:00",
    end_time: "2026-09-12T13:00:00+08:00",
    user_id: "55555555-5555-5555-5555-555555555555",
    facility_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    created_at: "2026-08-30T08:45:00+08:00",

    facilities: {
      id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      name: "BulSU Auditorium",
      type: "Auditorium",
    },
  },

  {
    id: 6,
    purpose: "Research Presentation",
    status: "pending",
    start_time: "2026-09-15T14:00:00+08:00",
    end_time: "2026-09-15T17:00:00+08:00",
    user_id: "66666666-6666-6666-6666-666666666666",
    facility_id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
    created_at: "2026-09-01T13:00:00+08:00",

    facilities: {
      id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
      name: "Conference Room B",
      type: "Conference Room",
    },
  },

  {
    id: 7,
    purpose: "Physical Education Class",
    status: "confirmed",
    start_time: "2026-09-18T07:00:00+08:00",
    end_time: "2026-09-18T09:00:00+08:00",
    user_id: "77777777-7777-7777-7777-777777777777",
    facility_id: "ffffffff-ffff-ffff-ffff-ffffffffffff",
    created_at: "2026-09-01T15:30:00+08:00",

    facilities: {
      id: "ffffffff-ffff-ffff-ffff-ffffffffffff",
      name: "University Gymnasium",
      type: "Sports & Grounds",
    },
  },

  {
    id: 8,
    purpose: "College Assembly",
    status: "confirmed",
    start_time: "2026-09-21T08:00:00+08:00",
    end_time: "2026-09-21T12:00:00+08:00",
    user_id: "88888888-8888-8888-8888-888888888888",
    facility_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    created_at: "2026-09-02T09:00:00+08:00",

    facilities: {
      id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      name: "BulSU Auditorium",
      type: "Auditorium",
    },
  },

  {
    id: 9,
    purpose: "Thesis Defense",
    status: "pending",
    start_time: "2026-09-23T13:00:00+08:00",
    end_time: "2026-09-23T16:00:00+08:00",
    user_id: "99999999-9999-9999-9999-999999999999",
    facility_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    created_at: "2026-09-02T10:30:00+08:00",

    facilities: {
      id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      name: "Conference Room A",
      type: "Conference Room",
    },
  },

  {
    id: 10,
    purpose: "Basketball Training",
    status: "confirmed",
    start_time: "2026-09-25T16:00:00+08:00",
    end_time: "2026-09-25T19:00:00+08:00",
    user_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    facility_id: "ffffffff-ffff-ffff-ffff-ffffffffffff",
    created_at: "2026-09-02T14:00:00+08:00",

    facilities: {
      id: "ffffffff-ffff-ffff-ffff-ffffffffffff",
      name: "University Gymnasium",
      type: "Sports & Grounds",
    },
  },

  {
    id: 11,
    purpose: "Faculty Development Workshop",
    status: "confirmed",
    start_time: "2026-09-28T09:00:00+08:00",
    end_time: "2026-09-28T16:00:00+08:00",
    user_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    facility_id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
    created_at: "2026-09-02T16:00:00+08:00",

    facilities: {
      id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
      name: "Conference Room B",
      type: "Conference Room",
    },
  },

  {
    id: 12,
    purpose: "Physics Laboratory",
    status: "cancelled",
    start_time: "2026-09-30T09:00:00+08:00",
    end_time: "2026-09-30T12:00:00+08:00",
    user_id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    facility_id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    created_at: "2026-09-02T17:00:00+08:00",

    facilities: {
      id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
      name: "Science Laboratory 2",
      type: "Laboratory",
    },
  },
];

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

/* ================================================================
   PAGE
   ================================================================ */

export default function BulSUCalendarPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Venues");

  const [selectedEvent, setSelectedEvent] = useState<
    EventClickArg["event"] | null
  >(null);

  /* ================================================================
     FILTER + TRANSFORM RESERVATIONS
     ================================================================ */

  const calendarEvents = useMemo<EventInput[]>(() => {
    return DUMMY_RESERVATIONS.filter((reservation) => {
      // Don't display cancelled reservations.
      return reservation.status !== "cancelled";
    })
      .filter((reservation) => {
        // Facility category filter.
        if (selectedCategory === "All Venues") {
          return true;
        }

        return reservation.facilities.type === selectedCategory;
      })
      .map((reservation) => {
        const isPending = reservation.status === "pending";

        return {
          id: String(reservation.id),

          title: reservation.purpose,

          start: reservation.start_time,

          end: reservation.end_time,

          backgroundColor: isPending ? "#F4C430" : "#A6192E",

          borderColor: isPending ? "#D9A900" : "#A6192E",

          textColor: isPending ? "#5F4900" : "#FFFFFF",

          extendedProps: {
            purpose: reservation.purpose,

            status: reservation.status,

            facilityId: reservation.facility_id,

            facilityName: reservation.facilities.name,

            facilityType: reservation.facilities.type,

            userId: reservation.user_id,

            createdAt: reservation.created_at,
          },
        };
      });
  }, [selectedCategory]);

  /* ================================================================
     EVENT CLICK
     ================================================================ */

  function handleEventClick(clickInfo: EventClickArg) {
    setSelectedEvent(clickInfo.event);
  }

  /* ================================================================
     DATE SELECT
     ================================================================ */

  function handleDateSelect(selectInfo: DateSelectArg) {
    console.log("Selected date/time:", {
      start: selectInfo.start,
      end: selectInfo.end,
    });

    /*
     * Later, this is where you can open your
     * reservation form/modal.
     */
  }

  /* ================================================================
     RENDER
     ================================================================ */

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FAFAF8] text-slate-950">
      {/* ========================================================== */}
      {/* NAVBAR                                                     */}
      {/* ========================================================== */}

      <PublicNavbar />

      {/* ========================================================== */}
      {/* BACKGROUND ACCENTS                                          */}
      {/* ========================================================== */}

      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-[#A6192E]/[0.055] blur-3xl" />

      <div className="pointer-events-none absolute -right-40 top-40 h-96 w-96 rounded-full bg-[#F4C430]/[0.08] blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* ======================================================== */}
        {/* HEADER                                                     */}
        {/* ======================================================== */}

        <motion.section
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.55,
            ease: "easeOut",
          }}
          className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#A6192E]/10 bg-[#A6192E]/[0.05] px-3.5 py-2">
              <CalendarDays className="h-3.5 w-3.5 text-[#A6192E]" />

              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#A6192E]">
                Facility Schedule
              </span>
            </div>

            <h1 className="text-[38px] font-bold leading-[1.05] tracking-[-1.5px] text-slate-950 sm:text-[48px]">
              University
              <span className="text-[#A6192E]"> Calendar</span>
            </h1>

            <p className="mt-4 max-w-[650px] text-[15px] leading-6 text-slate-500">
              View facility reservations and university activities across
              Bulacan State University.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-xl border border-slate-200/70 bg-white px-4 py-2.5 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                Reservations
              </p>

              <p className="mt-0.5 text-[16px] font-bold text-slate-900">
                {calendarEvents.length}
              </p>
            </div>
          </div>
        </motion.section>

        {/* ======================================================== */}
        {/* FILTER BAR                                                 */}
        {/* ======================================================== */}

        <motion.section
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.55,
            delay: 0.08,
            ease: "easeOut",
          }}
          className="mt-10 rounded-[24px] border border-slate-200/70 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
        >
          <div className="flex flex-col gap-4">
            {/* Filter heading */}

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-[#A6192E]" />

              <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Filter reservations
              </span>
            </div>

            {/* Categories */}

            <div className="flex flex-wrap gap-2">
              {FACILITY_TYPES.map((category) => {
                const active = selectedCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`h-9 rounded-full px-4 text-[13px] font-semibold transition-all duration-200 active:scale-95 ${
                      active
                        ? "bg-[#A6192E] text-white shadow-[0_6px_16px_rgba(166,25,46,0.22)]"
                        : "bg-[#FAFAF8] text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* ======================================================== */}
        {/* CALENDAR                                                   */}
        {/* ======================================================== */}

        <motion.section
          initial={{
            opacity: 0,
            y: 22,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
            delay: 0.14,
            ease: "easeOut",
          }}
          className="mt-5 rounded-[24px] border border-slate-200/70 bg-white p-3 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-5"
        >
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
              selectable
              selectMirror
              dayMaxEvents={3}
              weekends
              height="auto"
              contentHeight="auto"
              eventDisplay="block"
              select={handleDateSelect}
              eventClick={handleEventClick}
              nowIndicator
              navLinkDayClick
              navLinkWeekClick
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
        </motion.section>

        {/* ======================================================== */}
        {/* LEGEND                                                     */}
        {/* ======================================================== */}

        <motion.section
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.4,
            delay: 0.25,
          }}
          className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 px-1"
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Status
          </span>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#A6192E]" />

            <span className="text-[12px] font-medium text-slate-500">
              Confirmed
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#F4C430]" />

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
        </motion.section>
      </div>

      {/* ========================================================== */}
      {/* EVENT DETAILS MODAL                                        */}
      {/* ========================================================== */}

      {selectedEvent && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 px-4 backdrop-blur-sm"
          onClick={() => setSelectedEvent(null)}
        >
          <motion.div
            initial={{
              opacity: 0,
              y: 18,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.2,
            }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-[24px] border border-slate-200/70 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.15)]"
          >
            {/* Modal header */}

            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div
                    className={`mb-3 inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] ${
                      selectedEvent.extendedProps.status === "pending"
                        ? "bg-[#F4C430]/20 text-[#806500]"
                        : "bg-[#A6192E]/[0.07] text-[#A6192E]"
                    }`}
                  >
                    {selectedEvent.extendedProps.status}
                  </div>

                  <h2 className="text-[20px] font-bold leading-tight tracking-[-0.4px] text-slate-950">
                    {selectedEvent.title}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal body */}

            <div className="space-y-5 px-6 py-5">
              {/* Facility */}

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#A6192E]/[0.07]">
                  <MapPin className="h-4 w-4 text-[#A6192E]" />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                    Facility
                  </p>

                  <p className="mt-1 text-[13px] font-semibold text-slate-800">
                    {selectedEvent.extendedProps.facilityName}
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {selectedEvent.extendedProps.facilityType}
                  </p>
                </div>
              </div>

              {/* Schedule */}

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#A6192E]/[0.07]">
                  <Clock3 className="h-4 w-4 text-[#A6192E]" />
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

              {/* Purpose */}

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  Purpose
                </p>

                <div className="mt-2 rounded-xl bg-[#FAFAF8] p-3">
                  <p className="text-[13px] leading-5 text-slate-600">
                    {selectedEvent.extendedProps.purpose}
                  </p>
                </div>
              </div>

              {/* Reservation ID */}

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  Reservation ID
                </span>

                <span className="font-mono text-[11px] font-medium text-slate-500">
                  #{selectedEvent.id}
                </span>
              </div>
            </div>

            {/* Modal footer */}

            <div className="flex gap-2 border-t border-slate-100 bg-[#FAFAF8] px-6 py-4">
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="flex-1 rounded-xl bg-[#A6192E] px-4 py-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#8F1728]"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </main>
  );
}
