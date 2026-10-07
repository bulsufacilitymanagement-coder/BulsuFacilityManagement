import { CalendarCheck, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { ViewCollege } from "../types/view-college";

interface CollegeCardProps {
  college: ViewCollege;
}

export default function CollegeCard({ college }: CollegeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="
        group relative flex w-[365px] shrink-0 self-start flex-col
        overflow-hidden
        rounded-[28px] border border-slate-200/70 bg-white p-6
        shadow-[0_15px_40px_rgba(15,23,42,0.04)]
        transition-all duration-300
        hover:-translate-y-1
        hover:border-slate-300
        hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]
      "
    >
      {/* Background Accent */}
      <div className="pointer-events-none absolute -left-10 -top-10 h-20 w-40 rounded-full bg-bulsu/[0.7] blur-[100px]" />

      <span className="min-w-0 truncate text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {college.code}
      </span>

      {/* Facility Title */}
      <h3 className="mt-3 break-words text-[19px] font-bold text-slate-950 transition-colors group-hover:text-bulsu">
        {college.name}
      </h3>

      {/* Location */}
      <div className="mt-2 flex items-start gap-1.5 text-[12px] font-medium text-slate-500">
        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span className="break-words">{college.location}</span>
      </div>

      {/* Description */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        <span className="rounded-lg bg-slate-100/70 px-2.5 py-1 text-[11px] font-medium text-slate-600">
          {college.description}
        </span>
      </div>

      {/* Card Actions */}
      <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          className="text-[12px] font-bold text-slate-400 transition-colors hover:text-slate-700"
        >
          View Specs
        </button>

        <button
          type="button"
          className={`inline-flex h-10 items-center justify-center gap-2 rounded-[12px] px-4 text-[13px] font-semibold transition-all active:scale-[0.98]
            bg-bulsu text-white shadow-[0_8px_20px_rgba(165,0,17,0.20)] hover:bg-bulsu-dark`}
        >
          <CalendarCheck className="h-4 w-4" />
          View Facilities
        </button>
      </div>
    </motion.div>
  );
}
