"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus } from "lucide-react";
import { AddFacilitySheet } from "./Sheets/AddFacilitySheet";
import FacilityCard from "./FacilityCard/FacilityCard";
import { createClient } from "@/lib/supabase/client";
import { ViewFacility } from "./types/view-facility";
import { useUser } from "@/app/providers/userProvider";
import { useRouter } from "next/navigation";

// Facility Mock Data
const type = [
  "All Venues",
  "Auditorium",
  "Laboratory",
  "Conference Room",
  "Sports & Grounds",
];

const supabase = createClient();

export default function Facilities() {
  const router = useRouter();

  const { user } = useUser();

  const [selectedCategory, setSelectedCategory] = useState("All Venues");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddFacilitySheet, setShowAddFacilitySheet] = useState(false);
  const [facilities, setFacilities] = useState<ViewFacility[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getFacilities() {
      let query = supabase.from("facilities").select("*");

      if (isCollegeAdmin) {
        query = query.eq("college_id", user?.college?.id);
      }

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

  const filteredFacilities = facilities
    ? facilities.filter((fac) => {
        const matchesCategory =
          selectedCategory === "All Venues" || fac.type === selectedCategory;
        const matchesSearch =
          fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          fac.type.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
    : [];

  if (!user) {
    router.replace("/login");
    router.refresh();
    return;
  }

  const isCollegeAdmin = user.role === "College Admin";

  function handleShowReservationSchedule(facilityId: string) {
    router.push(`/facilities/${facilityId}`);
  }

  function resetFilters() {
    setSelectedCategory("All Venues");
    setSearchQuery("");
  }

  return (
    <div className="relative min-h-screen bg-white p-6 sm:p-10">
      {/* Background accents */}
      <div className="pointer-events-none absolute right-10 top-32 h-80 w-80 rounded-full bg-gold/50 blur-[200px]" />
      <div className="pointer-events-none absolute -left-50 top-5 h-96 w-96 rounded-full bg-bulsu/[0.15] blur-[100px]" />

      <div className="relative mx-auto max-w-6xl space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-[32px] font-bold leading-tight tracking-[-1.2px] text-slate-950 sm:text-[40px]">
              {isCollegeAdmin ? "Manage" : "Browse"}{" "}
              <span className="text-bulsu">
                Facilities {isCollegeAdmin && "for " + user.college.code}
              </span>
            </h1>
            <p className="text-[15px] text-slate-500">
              {isCollegeAdmin
                ? "Manage university facilities, review availability, and keep spaces ready for use."
                : "Find the right space for your next event, class, or activity and request a reservation in just a few clicks."}
            </p>
          </div>

          {isCollegeAdmin && (
            <button
              onClick={() => setShowAddFacilitySheet((prev) => !prev)}
              type="button"
              className="group cursor-pointer inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-bulsu px-6 text-[14px] font-semibold text-white shadow-[0_10px_25px_rgba(165,0,17,0.20)] transition-all hover:bg-bulsu-dark active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Add Facility
            </button>
          )}
        </motion.div>

        {/* Filter Controls Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: "easeOut" }}
          className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.03)] lg:flex-row lg:items-center lg:justify-between"
        >
          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {type.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`h-9 rounded-full px-4 text-[13px] font-semibold transition-all duration-200 active:scale-95 ${
                    isActive
                      ? "bg-bulsu text-white shadow-[0_6px_16px_rgba(165,0,17,0.25)]"
                      : "bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by venue or location..."
              aria-label="Search facilities"
              className="h-10 w-full rounded-full border border-slate-200/80 bg-white pl-10 pr-4 text-[13px] text-slate-900 placeholder:text-slate-400 transition-all focus:border-bulsu focus:bg-white focus:outline-none focus:ring-2 focus:ring-bulsu/10"
            />
          </div>
        </motion.div>

        {/* Facilities Grid */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.14, ease: "easeOut" }}
          className="flex flex-wrap items-start gap-6"
        >
          {/* Loading skeletons keep layout stable while fetching. */}
          {loading && (
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[260px] animate-pulse rounded-[24px] border border-slate-200/70 bg-white"
                />
              ))}
            </div>
          )}

          {/* Empty state with a one-tap reset. */}
          {!loading && filteredFacilities.length === 0 && (
            <div className="w-full rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[15px] bg-bulsu/[0.07]">
                <Search className="h-5 w-5 text-bulsu" />
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
                onClick={resetFilters}
                className="mt-5 h-11 rounded-xl bg-bulsu px-5 text-[13px] font-semibold text-white transition-colors hover:bg-bulsu-dark active:scale-[0.98]"
              >
                Reset filters
              </button>
            </div>
          )}

          <AnimatePresence>
            {!loading &&
              filteredFacilities.map((fac, index) => {
              const isAvailable = fac.status === "Available";
              const isReserved = fac.status === "Reserved Today";

              return (
                <FacilityCard
                  handleShowReservationSchedule={() =>
                    handleShowReservationSchedule(fac.id)
                  }
                  key={index}
                  fac={fac}
                  isAvailable={isAvailable}
                  isReserved={isReserved}
                />
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Facility Sheets */}
      {isCollegeAdmin && (
        <AddFacilitySheet
          collegeId={user.college.id}
          isOpen={showAddFacilitySheet}
          onClose={() => setShowAddFacilitySheet(false)}
        />
      )}
    </div>
  );
}
