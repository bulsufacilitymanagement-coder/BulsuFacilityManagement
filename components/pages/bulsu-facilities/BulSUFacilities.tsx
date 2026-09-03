"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, Plus, Search, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/app/providers/userProvider";
import { ViewFacility } from "../facilities/types/view-facility";
import FacilityCard from "../facilities/FacilityCard/FacilityCard";
import PublicNavbar from "@/components/ui/PublicNavbar/PublicNavbar";

const FACILITY_TYPES = [
  "All Venues",
  "Auditorium",
  "Laboratory",
  "Conference Room",
  "Sports & Grounds",
];

const supabase = createClient();

export default function BulSUFacilities() {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState("All Venues");
  const [searchQuery, setSearchQuery] = useState("");
  const [facilities, setFacilities] = useState<ViewFacility[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * ------------------------------------------------------------------
   * Fetch facilities
   * ------------------------------------------------------------------
   */
  useEffect(() => {
    async function getFacilities() {
      setLoading(true);

      const query = supabase
        .from("facilities")
        .select("*")
        .order("name", { ascending: true });

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching facilities:", error);
        setFacilities([]);
        setLoading(false);
        return;
      }

      setFacilities(data ?? []);
      setLoading(false);
    }

    getFacilities();
  }, []);

  /**
   * ------------------------------------------------------------------
   * Search + category filtering
   * ------------------------------------------------------------------
   */
  const filteredFacilities = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return facilities.filter((facility) => {
      const matchesCategory =
        selectedCategory === "All Venues" || facility.type === selectedCategory;

      if (!normalizedSearch) {
        return matchesCategory;
      }

      const searchableText = [
        facility.name,
        facility.type,
        // Keep these optional in case your ViewFacility type contains them.
        "location" in facility ? String(facility.location ?? "") : "",
        "description" in facility ? String(facility.description ?? "") : "",
      ]
        .join(" ")
        .toLowerCase();

      return matchesCategory && searchableText.includes(normalizedSearch);
    });
  }, [facilities, selectedCategory, searchQuery]);

  function handleShowReservationSchedule(facilityId: string) {
    router.push(`/bulsu-facilities/${facilityId}`);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FAFAF8] text-slate-950">
      {/* ================================================================ */}
      {/* NAVBAR                                                           */}
      {/* ================================================================ */}
      <PublicNavbar />

      {/* ============================================================ */}
      {/* BACKGROUND ACCENTS                                           */}
      {/* ============================================================ */}

      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-[#A6192E]/[0.055] blur-3xl" />

      <div className="pointer-events-none absolute -right-40 top-40 h-96 w-96 rounded-full bg-[#F4C430]/[0.08] blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* ========================================================== */}
        {/* HEADER                                                      */}
        {/* ========================================================== */}

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.55,
            ease: "easeOut",
          }}
          className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between mt-10"
        >
          {/* ========================================================== */}
          {/* HEADER                                                      */}
          {/* ========================================================== */}

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.55,
              ease: "easeOut",
            }}
            className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#A6192E]/10 bg-[#A6192E]/[0.05] px-3.5 py-2">
                <Building2 className="h-3.5 w-3.5 text-[#A6192E]" />

                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#A6192E]">
                  University Facilities
                </span>
              </div>

              <h1 className="text-[38px] font-bold leading-[1.05] tracking-[-1.5px] text-slate-950 sm:text-[48px]">
                Explore
                <span className="text-[#A6192E]"> BulSU Facilities</span>
              </h1>

              <p className="mt-4 max-w-[650px] text-[15px] leading-6 text-slate-500">
                Browse available facilities across Bulacan State University.
                Find the right space for your event, class, meeting, or
                university activity.
              </p>
            </div>
          </motion.section>
        </motion.section>

        {/* ========================================================== */}
        {/* FILTER BAR                                                  */}
        {/* ========================================================== */}

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
                Find a facility
              </span>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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

              {/* Search */}
              <div className="relative w-full lg:w-[300px]">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search facilities..."
                  className="h-10 w-full rounded-full border border-slate-200/80 bg-[#FAFAF8] pl-10 pr-4 text-[13px] text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#A6192E] focus:bg-white focus:ring-2 focus:ring-[#A6192E]/10"
                />
              </div>
            </div>
          </div>
        </motion.section>

        {/* ========================================================== */}
        {/* RESULTS SUMMARY                                             */}
        {/* ========================================================== */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.4,
            delay: 0.15,
          }}
          className="mt-8 flex items-center justify-between"
        >
          <div>
            <p className="text-[13px] font-semibold text-slate-700">
              {loading
                ? "Loading facilities..."
                : `${filteredFacilities.length} ${
                    filteredFacilities.length === 1 ? "facility" : "facilities"
                  } found`}
            </p>

            {!loading && (searchQuery || selectedCategory !== "All Venues") && (
              <p className="mt-1 text-[11px] text-slate-400">
                Showing filtered results
              </p>
            )}
          </div>

          {selectedCategory !== "All Venues" && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("All Venues");
                setSearchQuery("");
              }}
              className="text-[12px] font-semibold text-[#A6192E] hover:underline"
            >
              Clear filters
            </button>
          )}
        </motion.div>

        {/* ========================================================== */}
        {/* FACILITY GRID                                               */}
        {/* ========================================================== */}

        <motion.section
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.14,
            ease: "easeOut",
          }}
          className="mt-5"
        >
          {/* Loading */}
          {loading && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[260px] animate-pulse rounded-[24px] border border-slate-200/70 bg-white"
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filteredFacilities.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[15px] bg-[#A6192E]/[0.07]">
                <Search className="h-5 w-5 text-[#A6192E]" />
              </div>

              <h3 className="mt-5 text-[16px] font-bold text-slate-900">
                No facilities found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-[13px] leading-5 text-slate-500">
                Try changing your search or selecting a different facility
                category.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All Venues");
                }}
                className="mt-5 rounded-xl bg-[#A6192E] px-4 py-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#8F1728]"
              >
                Reset filters
              </button>
            </motion.div>
          )}

          {/* Facilities */}
          {!loading && filteredFacilities.length > 0 && (
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filteredFacilities.map((facility, index) => {
                  const isAvailable = facility.status === "Available";
                  const isReserved = facility.status === "Reserved Today";

                  return (
                    <motion.div
                      key={facility.id ?? `${facility.name}-${index}`}
                      layout
                      initial={{
                        opacity: 0,
                        y: 18,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.96,
                      }}
                      transition={{
                        duration: 0.3,
                        delay: Math.min(index * 0.04, 0.2),
                      }}
                      className="w-full"
                    >
                      <FacilityCard
                        handleShowReservationSchedule={() =>
                          handleShowReservationSchedule(facility.id)
                        }
                        fac={facility}
                        isAvailable={isAvailable}
                        isReserved={isReserved}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.section>
      </div>
    </main>
  );
}
