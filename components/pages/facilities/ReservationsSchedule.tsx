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

/* ================================================================
   TYPES
   ================================================================ */

type FacilityType =
  | "Auditorium"
  | "Laboratory"
  | "Conference Room"
  | "Sports & Grounds";

type ReservationStatus = "confirmed" | "pending" | "cancelled";

type DummyReservation = {
  id: number;
  purpose: string;
  status: ReservationStatus;
  start_time: string;
  end_time: string;
  user_id: string;
  facility_id: string;
  created_at: string;

  facilities: {
    id: string;
    name: string;
    type: FacilityType;
    college_id: string;
  };
};

/* ================================================================
   FILTERS
   ================================================================ */

const FACILITY_TYPES = [
  "All Venues",
  "Auditorium",
  "Laboratory",
  "Conference Room",
  "Sports & Grounds",
];

const STATUS_FILTERS = ["All Status", "confirmed", "pending", "cancelled"];

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
      college_id: "COE",
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
      college_id: "COE",
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
      college_id: "CAS",
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
      college_id: "STUDENT-AFFAIRS",
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
      college_id: "COE",
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
      college_id: "CAS",
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
      college_id: "COE",
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
      college_id: "COE",
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
      college_id: "COE",
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
      college_id: "COE",
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
      college_id: "CAS",
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
      college_id: "CAS",
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

export default function ReservationsSchedule() {
  const router = useRouter();

  const { user } = useUser();

  const [selectedCategory, setSelectedCategory] = useState("All Venues");

  const [selectedStatus, setSelectedStatus] = useState("All Status");

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedEvent, setSelectedEvent] = useState<
    EventClickArg["event"] | null
  >(null);

  /* ================================================================
     AUTHENTICATION (guard runs after hooks — see below)
     ================================================================ */

  const isCollegeAdmin = user?.role === "College Admin";

  /* ================================================================
     FILTER RESERVATIONS
     ================================================================ */

  const filteredReservations = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return DUMMY_RESERVATIONS.filter((reservation) => {
      /* ----------------------------------------------------------
           College Admin
           ----------------------------------------------------------

           College admins only see reservations belonging
           to facilities under their college.

           Regular users can see all reservations.
        ---------------------------------------------------------- */

      if (isCollegeAdmin) {
        if (reservation.facilities.college_id !== user?.college?.id) {
          return false;
        }
      }

      /* ----------------------------------------------------------
           Facility category
        ---------------------------------------------------------- */

      if (
        selectedCategory !== "All Venues" &&
        reservation.facilities.type !== selectedCategory
      ) {
        return false;
      }

      /* ----------------------------------------------------------
           Status
        ---------------------------------------------------------- */

      if (
        selectedStatus !== "All Status" &&
        reservation.status !== selectedStatus
      ) {
        return false;
      }

      /* ----------------------------------------------------------
           Search
        ---------------------------------------------------------- */

      if (normalizedSearch) {
        const searchableText = [
          reservation.purpose,
          reservation.facilities.name,
          reservation.facilities.type,
          reservation.status,
        ]
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(normalizedSearch)) {
          return false;
        }
      }

      return true;
    });
  }, [isCollegeAdmin, searchQuery, selectedCategory, selectedStatus, user]);

  /* ================================================================
     FULLCALENDAR EVENTS
     ================================================================ */

  const calendarEvents = useMemo<EventInput[]>(() => {
    return filteredReservations.map((reservation) => {
      const isPending = reservation.status === "pending";

      const isCancelled = reservation.status === "cancelled";

      return {
        id: String(reservation.id),

        title: reservation.purpose,

        start: reservation.start_time,

        end: reservation.end_time,

        backgroundColor: isCancelled
          ? "#CBD5E1"
          : isPending
          ? "#f1a926"
          : "#a50011",

        borderColor: isCancelled
          ? "#94A3B8"
          : isPending
          ? "#d49521"
          : "#a50011",

        textColor: isCancelled ? "#475569" : isPending ? "#5F4900" : "#FFFFFF",

        classNames: ["reservation-event", `reservation-${reservation.status}`],

        extendedProps: {
          purpose: reservation.purpose,

          status: reservation.status,

          facilityId: reservation.facility_id,

          facilityName: reservation.facilities.name,

          facilityType: reservation.facilities.type,

          collegeId: reservation.facilities.college_id,

          userId: reservation.user_id,

          createdAt: reservation.created_at,
        },
      };
    });
  }, [filteredReservations]);

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

  // Auth guard sits after every hook so hook order never changes per render.
  if (!user) {
    router.replace("/login");

    return null;
  }

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
    /*
     * Later you can replace this with:
     *
     * setShowReservationSheet(true)
     *
     * and pass:
     *
     * selectInfo.start
     * selectInfo.end
     */

    console.log("Selected schedule:", {
      start: selectInfo.start,
      end: selectInfo.end,
    });
  }

  /* ================================================================
     CLEAR FILTERS
     ================================================================ */

  function clearFilters() {
    setSelectedCategory("All Venues");
    setSelectedStatus("All Status");
    setSearchQuery("");
  }

  const hasFilters =
    selectedCategory !== "All Venues" ||
    selectedStatus !== "All Status" ||
    searchQuery.trim() !== "";

  /* ================================================================
     RENDER
     ================================================================ */

  return (
    <div className="relative min-h-screen bg-white p-6 sm:p-10">
      {/* ========================================================== */}
      {/* BACKGROUND ACCENTS                                          */}
      {/* ========================================================== */}

      <div className="pointer-events-none absolute right-10 top-32 h-80 w-80 rounded-full bg-gold/50 blur-[200px]" />

      <div className="pointer-events-none absolute -left-50 top-5 h-96 w-96 rounded-full bg-bulsu/[0.15] blur-[100px]" />

      <div className="relative mx-auto max-w-7xl space-y-8">
        {/* ======================================================== */}
        {/* HEADER                                                     */}
        {/* ======================================================== */}

        <motion.div
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
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-bulsu/10 bg-bulsu/[0.05] px-3.5 py-2">
              <CalendarDays className="h-3.5 w-3.5 text-bulsu" />

              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-bulsu">
                Reservation Schedule
              </span>
            </div>

            <h1 className="text-[32px] font-bold leading-tight tracking-[-1.2px] text-slate-950 sm:text-[40px]">
              {isCollegeAdmin ? "Manage" : "Browse"}{" "}
              <span className="text-bulsu">
                Reservations
                {isCollegeAdmin &&
                  user.college?.code &&
                  ` for ${user.college.code}`}
              </span>
            </h1>

            <p className="mt-1 text-[15px] text-slate-500">
              {isCollegeAdmin
                ? "Review and manage facility reservations for your college."
                : "View facility schedules and find an available space for your next activity."}
            </p>
          </div>

          {/* Reservation count */}

          <div className="flex items-center gap-2">
            <div className="rounded-[14px] border border-slate-200/70 bg-white px-5 py-3 shadow-[0_8px_25px_rgba(15,23,42,0.04)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                Showing
              </p>

              <p className="mt-0.5 text-[20px] font-bold text-bulsu">
                {calendarEvents.length}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ======================================================== */}
        {/* FILTER BAR                                                 */}
        {/* ======================================================== */}

        <motion.div
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
          className="rounded-[24px] border border-slate-200/70 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.03)]"
        >
          <div className="flex flex-col gap-4">
            {/* Filter heading */}

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-bulsu" />

              <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Filter reservations
              </span>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Facility categories */}

              <div className="flex flex-wrap items-center gap-2">
                {FACILITY_TYPES.map((category) => {
                  const active = selectedCategory === category;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`h-9 rounded-full px-4 text-[13px] font-semibold transition-all duration-200 active:scale-95 ${
                        active
                          ? "bg-bulsu text-white shadow-[0_6px_16px_rgba(165,0,17,0.25)]"
                          : "bg-white text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>

              {/* Search */}

              <div className="relative w-full lg:w-72">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search reservation..."
                  aria-label="Search reservations"
                  className="h-10 w-full rounded-full border border-slate-200/80 bg-white pl-10 pr-4 text-[13px] text-slate-900 placeholder:text-slate-400 transition-all focus:border-bulsu focus:bg-white focus:outline-none focus:ring-2 focus:ring-bulsu/10"
                />
              </div>
            </div>

            {/* Status filters */}

            <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
              <span className="mr-1 text-[11px] font-semibold text-slate-400">
                Status:
              </span>

              {STATUS_FILTERS.map((status) => {
                const active = selectedStatus === status;

                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setSelectedStatus(status)}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold capitalize transition-colors ${
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
          </div>
        </motion.div>

        {/* ======================================================== */}
        {/* CALENDAR                                                   */}
        {/* ======================================================== */}

        <motion.div
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
          className="rounded-[24px] border border-slate-200/70 bg-white p-3 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-5"
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
        </motion.div>

        {/* ======================================================== */}
        {/* LEGEND                                                     */}
        {/* ======================================================== */}

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

      {/* ========================================================== */}
      {/* EVENT DETAILS MODAL                                         */}
      {/* ========================================================== */}

      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
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
              exit={{
                opacity: 0,
                y: 10,
                scale: 0.98,
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
                          ? "bg-gold/20 text-[#806500]"
                          : selectedEvent.extendedProps.status === "cancelled"
                          ? "bg-slate-100 text-slate-500"
                          : "bg-bulsu/[0.07] text-bulsu"
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
                    aria-label="Close details"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Modal body */}

              <div className="space-y-5 px-6 py-5">
                {/* Facility */}

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-bulsu/[0.07]">
                    <MapPin className="h-4 w-4 text-bulsu" />
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

                {/* Purpose */}

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                    Purpose
                  </p>

                  <div className="mt-2 rounded-xl bg-white p-3">
                    <p className="text-[13px] leading-5 text-slate-600">
                      {selectedEvent.extendedProps.purpose}
                    </p>
                  </div>
                </div>

                {/* College */}

                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                    College
                  </span>

                  <span className="text-[11px] font-semibold text-slate-500">
                    {selectedEvent.extendedProps.collegeId}
                  </span>
                </div>

                {/* Reservation ID */}

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                    Reservation ID
                  </span>

                  <span className="font-mono text-[11px] font-medium text-slate-500">
                    #{selectedEvent.id}
                  </span>
                </div>
              </div>

              {/* Footer */}

              <div className="border-t border-slate-100 bg-white px-6 py-4">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="w-full rounded-xl bg-bulsu px-4 py-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-bulsu-dark"
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
