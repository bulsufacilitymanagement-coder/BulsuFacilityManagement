"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarCheck, CheckCircle2, X } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TextAreaField } from "@/components/ui/Fields/TextAreaField";
import { PrimaryButton } from "@/components/ui/Buttons/PrimaryButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";

const supabase = createClient();

// Operating window mirrors the calendar's visible hours (06:00–22:00).
const OPEN_MINUTES = 6 * 60;
const CLOSE_MINUTES = 22 * 60;
const MIN_DURATION_MINUTES = 30;

// Non-cancelled booking used for overlap checks.
export interface ExistingBooking {
  start_time: string;
  end_time: string;
  status: string;
}

export interface ReservationFacility {
  id: string;
  name: string;
  type: string;
  location: string | null;
}

export interface CreatedReservation {
  id: number;
  purpose: string;
  status: string;
  start_time: string;
  end_time: string;
  facility_name: string;
}

export interface AddReservationSheetProps {
  facility: ReservationFacility | null;
  initialStart: Date | null;
  initialEnd: Date | null;
  existingBookings: ExistingBooking[];
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface ReservationErrors {
  purpose?: string;
  date?: string;
  time?: string;
}

// Local-date helpers keep form values independent of UTC shifts.
function toDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toTimeInput(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function combineDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatLongDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", { dateStyle: "medium" }).format(
    new Date(value)
  );
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

// True when two ranges share any moment (back-to-back edges are allowed).
function rangesOverlap(startA: Date, endA: Date, startB: Date, endB: Date) {
  return startA < endB && endA > startB;
}

export function AddReservationSheet({
  facility,
  initialStart,
  initialEnd,
  existingBookings,
  userId,
  isOpen,
  onClose,
  onCreated,
}: AddReservationSheetProps) {
  // Initial slot is fixed per mount; the parent remounts the sheet
  // (via key) on every open, so the form always starts fresh.
  const [slot] = useState(() => {
    const start = initialStart ?? new Date(Date.now() + 60 * 60 * 1000);
    const end = initialEnd ?? new Date(start.getTime() + 60 * 60 * 1000);
    return { start, end };
  });

  const [date, setDate] = useState(() => toDateInput(slot.start));
  const [startTime, setStartTime] = useState(() => toTimeInput(slot.start));
  const [endTime, setEndTime] = useState(() => toTimeInput(slot.end));
  const [purpose, setPurpose] = useState("");
  const [errors, setErrors] = useState<ReservationErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [created, setCreated] = useState<CreatedReservation | null>(null);

  function validate(): { start: Date; end: Date } | null {
    const next: ReservationErrors = {};
    const cleanPurpose = purpose.trim();

    if (!facility) {
      setSubmitError("No facility selected.");
      return null;
    }

    if (cleanPurpose.length < 5) {
      next.purpose = "Tell us the purpose (at least 5 characters).";
    }

    if (!date) {
      next.date = "Pick a date.";
    }

    if (!startTime || !endTime) {
      next.time = "Pick a start and end time.";
    }

    setErrors(next);

    if (Object.keys(next).length > 0 || !date || !startTime || !endTime) {
      return null;
    }

    const start = combineDateTime(date, startTime);
    const end = combineDateTime(date, endTime);
    const timeErrors: ReservationErrors = {};

    if (start.getTime() <= Date.now()) {
      timeErrors.time = "The slot must be in the future.";
    } else if (end <= start) {
      timeErrors.time = "End time must be after start time.";
    } else if ((end.getTime() - start.getTime()) / 60000 < MIN_DURATION_MINUTES) {
      timeErrors.time = "Minimum booking length is 30 minutes.";
    } else if (
      toMinutes(startTime) < OPEN_MINUTES ||
      toMinutes(endTime) > CLOSE_MINUTES
    ) {
      timeErrors.time = "Bookings are allowed between 6:00 AM and 10:00 PM.";
    } else {
      // Overlap check against currently loaded bookings (refreshed at submit).
      const clash = existingBookings.some(
        (booking) =>
          booking.status.toLowerCase() !== "cancelled" &&
          rangesOverlap(
            start,
            end,
            new Date(booking.start_time),
            new Date(booking.end_time)
          )
      );

      if (clash) {
        timeErrors.time = "That slot overlaps an existing booking.";
      }
    }

    if (Object.keys(timeErrors).length > 0) {
      setErrors((previous) => ({ ...previous, ...timeErrors }));
      return null;
    }

    return { start, end };
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitError(null);

    // Open the confirmation dialog only for a valid request.
    if (validate()) {
      setShowConfirm(true);
    }
  }

  async function handleConfirm() {
    if (!facility) {
      return;
    }

    const range = validate();

    if (!range) {
      setShowConfirm(false);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Re-check overlaps live so two users can't grab the same slot.
      const { data: clashes, error: clashError } = await supabase
        .from("reservations")
        .select("id")
        .eq("facility_id", facility.id)
        .neq("status", "cancelled")
        .lt("start_time", range.end.toISOString())
        .gt("end_time", range.start.toISOString())
        .limit(1);

      if (clashError) {
        throw clashError;
      }

      if (clashes && clashes.length > 0) {
        setShowConfirm(false);
        setErrors((previous) => ({
          ...previous,
          time: "Someone just booked that slot. Pick another time.",
        }));
        return;
      }

      const { data, error } = await supabase
        .from("reservations")
        .insert([
          {
            facility_id: facility.id,
            user_id: userId,
            purpose: purpose.trim(),
            start_time: range.start.toISOString(),
            end_time: range.end.toISOString(),
            status: "pending",
          },
        ])
        .select("id, purpose, status, start_time, end_time")
        .single();

      if (error) {
        throw error;
      }

      setShowConfirm(false);
      setCreated({ ...data, facility_name: facility.name });
      onCreated();
    } catch (error) {
      setShowConfirm(false);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Something went wrong while submitting. Try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDone() {
    setCreated(null);
    onClose();
  }

  const summaryLine =
    date && startTime && endTime
      ? `${formatLongDate(`${date}T00:00:00`)} · ${startTime} – ${endTime}`
      : "";

  // ConfirmDialog manages its own AnimatePresence, so it stays a sibling here:
  // two keyless children inside one AnimatePresence share a key and crash.
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div key="reservation-sheet" className="fixed inset-0 z-50 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
          />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="reservation-sheet-title"
              className="relative flex w-screen flex-col border-l border-slate-200/80 bg-white shadow-2xl sm:w-[50vw] sm:max-w-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 sm:px-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-bulsu/[0.07] text-bulsu">
                    <CalendarCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-bulsu">
                      {created ? "Reservation Receipt" : "New Reservation"}
                    </span>

                    <h2
                      id="reservation-sheet-title"
                      className="text-[20px] font-bold text-slate-950"
                    >
                      {created ? "Request Submitted" : facility?.name ?? "Reserve Facility"}
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:scale-95"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {created ? (
                // Receipt view confirms exactly what was booked.
                <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                  <div className="rounded-[20px] border border-emerald-200/60 bg-emerald-50/50 p-6 text-center">
                    <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />

                    <p className="mt-3 text-[17px] font-bold text-slate-900">
                      Reservation submitted for approval
                    </p>

                    <p className="mt-1 text-[13px] text-slate-500">
                      Reservation #{created.id} · Status:{" "}
                      <span className="font-bold capitalize text-amber-700">
                        {created.status}
                      </span>
                    </p>
                  </div>

                  <dl className="mt-6 space-y-4">
                    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                      <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Facility
                      </dt>

                      <dd className="text-right text-[13px] font-semibold text-slate-800">
                        {created.facility_name}
                      </dd>
                    </div>

                    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                      <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Date
                      </dt>

                      <dd className="text-right text-[13px] font-semibold text-slate-800">
                        {formatLongDate(created.start_time)}
                      </dd>
                    </div>

                    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                      <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Time
                      </dt>

                      <dd className="text-right text-[13px] font-semibold text-slate-800">
                        {formatTime(created.start_time)} –{" "}
                        {formatTime(created.end_time)}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Purpose
                      </dt>

                      <dd className="mt-2 rounded-xl bg-slate-50 p-3 text-[13px] leading-5 text-slate-600">
                        {created.purpose}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleDone}
                      className="h-[52px] flex-1 rounded-[15px] bg-bulsu text-[14px] font-semibold text-white transition-all hover:bg-bulsu-dark active:scale-[0.99]"
                    >
                      Done
                    </button>

                    <Link
                      href="/reservations"
                      className="flex h-[52px] flex-1 items-center justify-center rounded-[15px] border border-slate-200 text-[14px] font-semibold text-slate-700 transition-all hover:bg-slate-50"
                    >
                      View My Reservations
                    </Link>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="flex-1 space-y-6 overflow-y-auto p-6 sm:p-8"
                >
                  {submitError && (
                    <div
                      role="alert"
                      className="rounded-[15px] border border-red-200 bg-red-50 px-4 py-3.5 text-[13px] leading-5 text-red-700"
                    >
                      {submitError}
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="reservation-date"
                      className="mb-2 block text-[13px] font-semibold text-slate-700"
                    >
                      Date
                    </label>

                    <input
                      id="reservation-date"
                      type="date"
                      value={date}
                      min={toDateInput(new Date())}
                      onChange={(event) => {
                        setDate(event.target.value);
                        setErrors((previous) => ({ ...previous, date: undefined }));
                      }}
                      className="h-[52px] w-full rounded-[15px] border border-slate-200 bg-white px-4 text-[15px] text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.03)] outline-none transition-all focus:border-bulsu focus:ring-4 focus:ring-bulsu/10"
                    />

                    {errors.date && (
                      <p className="mt-1.5 text-[12px] font-medium text-red-600">
                        {errors.date}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="reservation-start"
                        className="mb-2 block text-[13px] font-semibold text-slate-700"
                      >
                        Start Time
                      </label>

                      <input
                        id="reservation-start"
                        type="time"
                        value={startTime}
                        onChange={(event) => {
                          setStartTime(event.target.value);
                          setErrors((previous) => ({ ...previous, time: undefined }));
                        }}
                        className="h-[52px] w-full rounded-[15px] border border-slate-200 bg-white px-4 text-[15px] text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.03)] outline-none transition-all focus:border-bulsu focus:ring-4 focus:ring-bulsu/10"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="reservation-end"
                        className="mb-2 block text-[13px] font-semibold text-slate-700"
                      >
                        End Time
                      </label>

                      <input
                        id="reservation-end"
                        type="time"
                        value={endTime}
                        onChange={(event) => {
                          setEndTime(event.target.value);
                          setErrors((previous) => ({ ...previous, time: undefined }));
                        }}
                        className="h-[52px] w-full rounded-[15px] border border-slate-200 bg-white px-4 text-[15px] text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.03)] outline-none transition-all focus:border-bulsu focus:ring-4 focus:ring-bulsu/10"
                      />
                    </div>
                  </div>

                  {errors.time && (
                    <p className="-mt-3 text-[12px] font-medium text-red-600">
                      {errors.time}
                    </p>
                  )}

                  <div>
                    <TextAreaField
                      label="Purpose"
                      name="purpose"
                      value={purpose}
                      placeholder="What is this reservation for?"
                      onChange={(value) => {
                        setPurpose(value);
                        setErrors((previous) => ({ ...previous, purpose: undefined }));
                      }}
                    />

                    {errors.purpose && (
                      <p className="mt-1.5 text-[12px] font-medium text-red-600">
                        {errors.purpose}
                      </p>
                    )}
                  </div>

                  <p className="-mt-2 text-[11px] leading-5 text-slate-400">
                    Bookings run 6:00 AM – 10:00 PM, minimum 30 minutes.
                    Overlapping requests are blocked automatically.
                  </p>

                  <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="h-[52px] w-32 rounded-[15px] border border-slate-200 px-5 text-[14px] font-semibold text-slate-700 transition-all hover:bg-slate-50"
                    >
                      Cancel
                    </button>

                    <div className="w-48">
                      <PrimaryButton
                        type="submit"
                        loading={isSubmitting}
                        loadingText="Checking…"
                      >
                        Review Request
                      </PrimaryButton>
                    </div>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      )}

      {/* Confirmation always precedes the write to reservations. */}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Submit reservation?"
        description={`${facility?.name ?? "Facility"} · ${summaryLine}. Your request will be sent for approval as pending.`}
        confirmLabel="Submit Request"
        loadingLabel="Submitting…"
        loading={isSubmitting}
        onConfirm={handleConfirm}
        onClose={() => setShowConfirm(false)}
      />
    </>
  );
}
