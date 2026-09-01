import { CalendarCheck, MapPin, Users } from "lucide-react";
import React from "react";
import { motion } from "framer-motion";

export default function FacilityCard() {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      key={fac.id}
      className="group relative flex flex-col justify-between rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_15px_40px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
    >
      <div>
        {/* Top Meta Header */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {fac.category}
          </span>

          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
              isAvailable
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                : isReserved
                ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                : "bg-slate-100 text-slate-600 border border-slate-200"
            }`}
          >
            {fac.availability}
          </span>
        </div>

        {/* Facility Title */}
        <h3 className="mt-3 text-[19px] font-bold text-slate-950 transition-colors group-hover:text-[#A6192E]">
          {fac.name}
        </h3>

        {/* Campus Location */}
        <div className="mt-2 flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
          <MapPin className="h-3.5 w-3.5 text-slate-400" />
          {fac.campus}
        </div>

        {/* Capacity Badge */}
        <div className="mt-4 flex items-center gap-1.5 rounded-[14px] bg-[#FAFAF8] px-3 py-2 text-[12px] font-semibold text-slate-700">
          <Users className="h-4 w-4 text-[#A6192E]" />
          <span>{fac.capacity}</span>
        </div>

        {/* Amenity Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {fac.amenities.map((amenity, idx) => (
            <span
              key={idx}
              className="rounded-lg bg-slate-100/70 px-2.5 py-1 text-[11px] font-medium text-slate-600"
            >
              {amenity}
            </span>
          ))}
        </div>
      </div>

      {/* Card Actions */}
      <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
        <button className="text-[12px] font-bold text-slate-400 hover:text-slate-700">
          View Specs
        </button>

        <button
          disabled={!isAvailable}
          className={`inline-flex h-10 items-center justify-center gap-2 rounded-[12px] px-4 text-[13px] font-semibold transition-all active:scale-[0.98] ${
            isAvailable
              ? "bg-[#A6192E] text-white shadow-[0_8px_20px_rgba(166,25,46,0.20)] hover:bg-[#8F1728]"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          <CalendarCheck className="h-4 w-4" />
          Book Facility
        </button>
      </div>
    </motion.div>
  );
}
