"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { sileo } from "sileo";

import { createClient } from "@/lib/supabase/client";
import FacilityCard from "../facilities/FacilityCard/FacilityCard";
import PublicNavbar from "@/components/ui/PublicNavbar/PublicNavbar";
import CampusMap from "./CampusMap/CampusMap";
import {
  CAMPUS_BUILDINGS,
  isFacilityInBuilding,
} from "./CampusMap/campus-buildings";
import CollegePickerModal from "./Modals/CollegePickerModal";
import { BuildingCollegeOption, CampusBuilding } from "./types/campus-building";
import { ViewCatalogFacility } from "./types/view-catalog-facility";

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
  const [facilities, setFacilities] = useState<ViewCatalogFacility[]>([]);
  const [loading, setLoading] = useState(true);
  // Building whose college picker is open (not yet applied as a filter).
  const [pendingBuilding, setPendingBuilding] = useState<CampusBuilding | null>(
    null
  );
  const [selectedBuilding, setSelectedBuilding] =
    useState<CampusBuilding | null>(null);
  // null = every college inside the selected building.
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(
    null
  );
  const resultsRef = useRef<HTMLDivElement>(null);

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
        .select("*, college:colleges (id, name, code)")
        .order("name", { ascending: true })
        .overrideTypes<ViewCatalogFacility[], { merge: false }>();

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching facilities:", error);
        sileo.error({
          title: "Couldn't load facilities",
          description: "Please refresh the page to try again.",
        });
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
  // Map badges: how many facilities sit in each building.
  const facilityCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    for (const building of CAMPUS_BUILDINGS) {
      counts[building.id] = facilities.filter((facility) =>
        isFacilityInBuilding(facility.location, building)
      ).length;
    }

    return counts;
  }, [facilities]);

  // Colleges that own a facility in the building being picked, with counts.
  const pendingBuildingColleges = useMemo(() => {
    if (!pendingBuilding) {
      return [];
    }

    const options = new Map<string, BuildingCollegeOption>();

    for (const facility of facilities) {
      if (
        !facility.college ||
        !isFacilityInBuilding(facility.location, pendingBuilding)
      ) {
        continue;
      }

      const existing = options.get(facility.college.id);

      if (existing) {
        existing.facilityCount += 1;
      } else {
        options.set(facility.college.id, {
          ...facility.college,
          facilityCount: 1,
        });
      }
    }

    return [...options.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [facilities, pendingBuilding]);

  const selectedCollege = selectedCollegeId
    ? (facilities.find((facility) => facility.college?.id === selectedCollegeId)
        ?.college ?? null)
    : null;

  const hasActiveFilters =
    Boolean(searchQuery) || selectedCategory !== "All Venues";

  const filteredFacilities = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return facilities.filter((facility) => {
      const matchesType =
        selectedCategory === "All Venues" || facility.type === selectedCategory;

      // Map filter: building first, then the college chosen in the picker.
      const matchesBuilding =
        !selectedBuilding ||
        isFacilityInBuilding(facility.location, selectedBuilding);
      const matchesCollege =
        !selectedCollegeId || facility.college?.id === selectedCollegeId;

      const matchesCategory = matchesType && matchesBuilding && matchesCollege;

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
  }, [
    facilities,
    selectedCategory,
    searchQuery,
    selectedBuilding,
    selectedCollegeId,
  ]);

  function handleCollegeSelect(collegeId: string | null) {
    setSelectedBuilding(pendingBuilding);
    setSelectedCollegeId(collegeId);
    setPendingBuilding(null);

    // Bring the matching cards into view once the modal starts closing.
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function handleFiltersReset() {
    setSelectedCategory("All Venues");
    setSearchQuery("");
  }

  // Dropping the building hides the results again, so start filters fresh.
  function handleMapFilterClear() {
    setSelectedBuilding(null);
    setSelectedCollegeId(null);
    handleFiltersReset();
  }

  function handleShowReservationSchedule(
    facilityId: string,
    facilityName: string,
    facilityLocation: string
  ) {
    router.push(
      `/bulsu-facilities/${facilityId}?name=${facilityName}&location=${facilityLocation}`
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-slate-950">
      {/* ================================================================ */}
      {/* NAVBAR                                                           */}
      {/* ================================================================ */}
      <PublicNavbar />

      {/* ============================================================ */}
      {/* BACKGROUND ACCENTS                                           */}
      {/* ============================================================ */}

      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-bulsu/[0.055] blur-3xl" />

      <div className="pointer-events-none absolute -right-40 top-40 h-96 w-96 rounded-full bg-gold/[0.08] blur-3xl" />

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
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-bulsu/10 bg-bulsu/[0.05] px-3.5 py-2">
                <Building2 className="h-3.5 w-3.5 text-bulsu" />

                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-bulsu">
                  University Facilities
                </span>
              </div>

              <h1 className="text-[38px] font-bold leading-[1.05] tracking-[-1.5px] text-slate-950 sm:text-[48px]">
                Explore
                <span className="text-bulsu"> BulSU Facilities</span>
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
        {/* CAMPUS MAP                                                  */}
        {/* ========================================================== */}

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.55,
            delay: 0.05,
            ease: "easeOut",
          }}
          aria-label="Campus map"
          className="mt-10"
        >
          <CampusMap
            facilityCounts={facilityCounts}
            selectedBuildingId={selectedBuilding?.id ?? null}
            handleBuildingSelect={setPendingBuilding}
          />
        </motion.section>

        {/* Facilities stay hidden until a building + college is picked on the
            map; the wrapper is the scroll target once they appear. */}
        <div ref={resultsRef} className="scroll-mt-24">
          {selectedBuilding ? (
            <>
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
                className="mt-5 rounded-[24px] border border-slate-200/70 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
              >
                <div className="flex flex-col gap-4">
                  {/* Filter heading */}
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-bulsu" />

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
                                ? "bg-bulsu text-white shadow-[0_6px_16px_rgba(165,0,17,0.22)]"
                                : "bg-white text-slate-600 hover:bg-slate-100"
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
                        aria-label="Search facilities"
                        className="h-10 w-full rounded-full border border-slate-200/80 bg-white pl-10 pr-4 text-[13px] text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-bulsu focus:bg-white focus:ring-2 focus:ring-bulsu/10"
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
                className="mt-8 flex items-start justify-between gap-4"
              >
                <div role="status">
                  <p className="text-[13px] font-semibold text-slate-700">
                    {loading
                      ? "Loading facilities..."
                      : `${filteredFacilities.length} ${
                          filteredFacilities.length === 1
                            ? "facility"
                            : "facilities"
                        } found`}
                  </p>

                  {!loading && hasActiveFilters && (
                    <p className="mt-1 text-[12px] text-slate-500">
                      Showing filtered results
                    </p>
                  )}

                  {selectedBuilding && (
                    <div className="mt-3 inline-flex items-center gap-1 rounded-full border border-bulsu/15 bg-bulsu/[0.05] py-1 pl-3.5 pr-1">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-bulsu" />

                      <span className="text-[12px] font-semibold text-bulsu">
                        {selectedBuilding.name}
                        {" · "}
                        {selectedCollege
                          ? selectedCollege.code
                          : "All colleges"}
                      </span>

                      <button
                        type="button"
                        onClick={handleMapFilterClear}
                        aria-label={`Remove ${selectedBuilding.name} filter`}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-bulsu transition-colors hover:bg-bulsu/10"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleFiltersReset}
                    className="flex h-9 shrink-0 items-center text-[12px] font-semibold text-bulsu hover:underline"
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
                      onClick={handleFiltersReset}
                      className="mt-5 h-11 rounded-xl bg-bulsu px-5 text-[13px] font-semibold text-white transition-colors hover:bg-bulsu-dark active:scale-[0.98]"
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
                            className="h-full w-full"
                          >
                            <FacilityCard
                              handleShowReservationSchedule={() =>
                                handleShowReservationSchedule(
                                  facility.id,
                                  facility.name,
                                  facility.location
                                )
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
            </>
          ) : (
            <div
              role="status"
              className="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-12 text-center"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[15px] bg-bulsu/[0.07]">
                <MapPin className="h-5 w-5 text-bulsu" />
              </div>

              <h2 className="mt-5 text-[16px] font-bold text-slate-900">
                Pick a building to see its facilities
              </h2>

              <p className="mx-auto mt-2 max-w-md text-[13px] leading-5 text-slate-500">
                Choose a building on the campus map, then a college, and the
                rooms you can reserve there will appear here.
              </p>
            </div>
          )}
        </div>
      </div>

      <CollegePickerModal
        building={pendingBuilding}
        colleges={pendingBuildingColleges}
        totalFacilities={
          pendingBuilding ? (facilityCounts[pendingBuilding.id] ?? 0) : 0
        }
        handleCollegeSelect={handleCollegeSelect}
        onClose={() => setPendingBuilding(null)}
      />
    </main>
  );
}
