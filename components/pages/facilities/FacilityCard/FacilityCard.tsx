import { CalendarCheck, MapPin, Users } from "lucide-react";
import { motion } from "framer-motion";
import { ViewFacility } from "../types/view-facility";

interface FacilityCardProps {
  fac: ViewFacility;
  isAvailable: boolean;
  isReserved: boolean;
  handleShowReservationSchedule: () => void;
}

export default function FacilityCard({
  fac,
  isAvailable,
  isReserved,
  handleShowReservationSchedule,
}: FacilityCardProps) {
  // description is a comma-separated list; drop blanks so no empty chip renders.
  const tags = (fac.description ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="
        group relative flex h-full w-full flex-col
        rounded-[28px] border border-slate-200/70 bg-white p-6
        shadow-[0_15px_40px_rgba(15,23,42,0.04)]
        transition-all duration-300
        hover:-translate-y-1
        hover:border-slate-300
        hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]
      "
    >
      {/* Top Meta Header */}
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {fac.type}
        </span>

        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
            isAvailable
              ? "border-emerald-200/60 bg-emerald-50 text-emerald-700"
              : isReserved
                ? "border-amber-200/60 bg-amber-50 text-amber-700"
                : "border-slate-200 bg-slate-100 text-slate-600"
          }`}
        >
          {fac.status}
        </span>
      </div>

      {/* Facility Title */}
      <h3 className="mt-3 break-words text-[19px] font-bold text-slate-950 transition-colors group-hover:text-bulsu">
        {fac.name}
      </h3>

      {/* Location */}
      <div className="mt-2 flex items-start gap-1.5 text-[12px] font-medium text-slate-500">
        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span className="break-words">{fac.location}</span>
      </div>

      {/* Capacity */}
      <div className="mt-3 flex items-center gap-1.5 text-[12px] font-semibold text-slate-700">
        <Users className="h-3.5 w-3.5 shrink-0 text-bulsu" />
        <span>{fac.capacity} Seats</span>
      </div>

      {/* Description */}
      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="rounded-lg bg-slate-100/70 px-2.5 py-1 text-[11px] font-medium text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Card Actions: mt-auto pins the button row to the card bottom so
          every card in a grid row lines up regardless of content height. */}
      <div className="mt-auto pt-6">
        <div className="border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={handleShowReservationSchedule}
            disabled={!isAvailable}
            className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-[12px] px-4 text-[13px] font-semibold transition-all active:scale-[0.98] ${
              isAvailable
                ? "bg-bulsu text-white shadow-[0_8px_20px_rgba(165,0,17,0.20)] hover:bg-bulsu-dark"
                : "cursor-not-allowed bg-slate-100 text-slate-400"
            }`}
          >
            <CalendarCheck className="h-4 w-4" />
            View Facility and Reservations
          </button>
        </div>
      </div>
    </motion.div>
  );
}
