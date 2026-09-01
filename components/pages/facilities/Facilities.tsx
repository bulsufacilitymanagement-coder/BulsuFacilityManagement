"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Info,
  CalendarCheck,
  Plus,
} from "lucide-react";

// Facility Mock Data
const categories = [
  "All Venues",
  "Auditoriums",
  "Laboratories",
  "Conference Rooms",
  "Sports & Grounds",
];

const facilitiesList = [
  {
    id: "fac-1",
    name: "Valencia Hall Grand Auditorium",
    category: "Auditoriums",
    campus: "Main Campus • Pimentel Hall",
    capacity: "500",
    availability: "Available",
    amenities: [
      "Air Conditioned",
      "Sound System",
      "Stage Lighting",
      "Projector",
    ],
    featured: true,
  },
  {
    id: "fac-2",
    name: "CICT Computer Laboratory 3",
    category: "Laboratories",
    campus: "Main Campus • Pimentel Hall",
    capacity: "45",
    availability: "Available",
    amenities: ["High-Spec PCs", "Gigabit LAN", "Smart TV", "Air Conditioned"],
    featured: false,
  },
  {
    id: "fac-3",
    name: "University Executive Conference Room",
    category: "Conference Rooms",
    campus: "Main Campus • Pimentel Hall",
    capacity: "30",
    availability: "Reserved Today",
    amenities: [
      "Video Conferencing",
      "Microphones",
      "Whiteboard",
      "Executive Seating",
    ],
    featured: false,
  },
  {
    id: "fac-4",
    name: "BulSU Activity Center & Gymnasium",
    category: "Sports & Grounds",
    campus: "Main Campus • Pimentel Hall",
    capacity: "600",
    availability: "Available",
    amenities: ["Hardwood Court", "PA System", "Bleachers", "Dressing Rooms"],
    featured: false,
  },
  {
    id: "fac-5",
    name: "College of Science Audio-Visual Room",
    category: "Auditoriums",
    campus: "Main Campus • 2nd Floor, CS Building",
    capacity: "120",
    availability: "Available",
    amenities: ["Acoustic Wall Paneling", "Dual Projectors", "Podium"],
    featured: false,
  },
  {
    id: "fac-6",
    name: "Engineering Hardware Innovation Lab",
    category: "Laboratories",
    campus: "Main Campus • Pimentel Hall",
    capacity: "35",
    availability: "Under Maintenance",
    amenities: ["3D Printers", "Soldering Stations", "Oscilloscopes"],
    featured: false,
  },
];

export default function Facilities() {
  const [selectedCategory, setSelectedCategory] = useState("All Venues");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFacilities = facilitiesList.filter((fac) => {
    const matchesCategory =
      selectedCategory === "All Venues" || fac.category === selectedCategory;
    const matchesSearch =
      fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.campus.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="relative min-h-screen bg-white p-6 sm:p-10">
      {/* Background ambient accents */}
      <div className="pointer-events-none absolute right-10 top-32 h-80 w-80 rounded-full bg-[#F4C430]/50 blur-[200px]" />
      <div className="pointer-events-none absolute -left-50 top-5 h-96 w-96 rounded-full bg-[#A6192E]/[0.15] blur-[100px]" />

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
              Browse <span className="text-[#A6192E]">Facilities</span>
            </h1>
            <p className="text-[15px] text-slate-500">
              Explore available university spaces and submit instant reservation
              requests.
            </p>
          </div>

          <button
            type="button"
            className="group cursor-pointer inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-[#A6192E] px-6 text-[14px] font-semibold text-white shadow-[0_10px_25px_rgba(166,25,46,0.20)] transition-all hover:bg-[#8F1728] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Add Facility
          </button>
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
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`h-9 rounded-full px-4 text-[13px] font-semibold transition-all duration-200 active:scale-95 ${
                    isActive
                      ? "bg-[#A6192E] text-white shadow-[0_6px_16px_rgba(166,25,46,0.25)]"
                      : "bg-[#FAFAF8] text-slate-600 hover:bg-slate-100"
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
              className="h-10 w-full rounded-full border border-slate-200/80 bg-[#FAFAF8] pl-10 pr-4 text-[13px] text-slate-900 placeholder:text-slate-400 transition-all focus:border-[#A6192E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A6192E]/10"
            />
          </div>
        </motion.div>

        {/* Facilities Grid */}
        <motion.div
          layout
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.14, ease: "easeOut" }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence>
            {filteredFacilities.map((fac) => {
              const isAvailable = fac.availability === "Available";
              const isReserved = fac.availability === "Reserved Today";

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
                      <span>{fac.capacity} Seats</span>
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
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
