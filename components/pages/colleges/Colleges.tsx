"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus } from "lucide-react";
import CollegeCard from "./CollegeCard/CollegeCard";
import { createClient } from "@/lib/supabase/client";
import { ViewCollege } from "./types/view-college";
import { useUser } from "@/app/providers/userProvider";
import { useRouter } from "next/navigation";
import { AddCollegeSheet } from "./Sheets/AddCollegeSheet";

const supabase = createClient();

export default function Colleges() {
  const router = useRouter();

  const { user } = useUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [showAddCollegeSheet, setShowAddCollegeSheet] = useState(false);
  const [colleges, setColleges] = useState<ViewCollege[] | null>(null);

  useEffect(() => {
    async function getColleges() {
      const query = supabase.from("colleges").select("*");

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching colleges:", error);
        return;
      }

      setColleges(data ?? []);
    }

    getColleges();
  }, []);

  function checkMatch(field: string) {
    return field.toLowerCase().includes(searchQuery.toLowerCase());
  }

  const filteredColleges = colleges
    ? colleges.filter((college) => {
        const matchesSearch =
          checkMatch(college.code) ||
          checkMatch(college.location) ||
          checkMatch(college.name);

        return matchesSearch;
      })
    : [];

  if (!user) {
    router.replace("/login");
    router.refresh();
    return;
  }

  const isSuperAdmin = user.role === "Super Admin";

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
              Manage <span className="text-bulsu">Colleges</span>
            </h1>
            <p className="text-[15px] text-slate-500">
              Manage colleges, oversee their facilities, and keep university
              spaces organized and ready for use.
            </p>
          </div>

          {isSuperAdmin && (
            <button
              onClick={() => setShowAddCollegeSheet((prev) => !prev)}
              type="button"
              className="group cursor-pointer inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-bulsu px-6 text-[14px] font-semibold text-white shadow-[0_10px_25px_rgba(165,0,17,0.20)] transition-all hover:bg-bulsu-dark active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Add College
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
          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by college..."
              aria-label="Search colleges"
              className="h-10 w-full rounded-full border border-slate-200/80 bg-white pl-10 pr-4 text-[13px] text-slate-900 placeholder:text-slate-400 transition-all focus:border-bulsu focus:bg-white focus:outline-none focus:ring-2 focus:ring-bulsu/10"
            />
          </div>
        </motion.div>

        {/* Colleges Grid */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.14, ease: "easeOut" }}
          className="flex flex-wrap items-start gap-6"
        >
          <AnimatePresence>
            {filteredColleges.map((college, index) => {
              return <CollegeCard key={index} college={college} />;
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* College Sheets */}
      {isSuperAdmin && (
        <AddCollegeSheet
          isOpen={showAddCollegeSheet}
          onClose={() => setShowAddCollegeSheet(false)}
        />
      )}
    </div>
  );
}
