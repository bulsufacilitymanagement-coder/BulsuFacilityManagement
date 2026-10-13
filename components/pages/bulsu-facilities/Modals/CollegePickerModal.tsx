"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, ChevronRight, X } from "lucide-react";

import {
  BuildingCollegeOption,
  CampusBuilding,
} from "../types/campus-building";

export interface CollegePickerModalProps {
  // Building whose colleges are being picked; null keeps the modal closed.
  building: CampusBuilding | null;
  colleges: BuildingCollegeOption[];
  totalFacilities: number;
  // collegeId null means "every college in this building".
  handleCollegeSelect: (collegeId: string | null) => void;
  onClose: () => void;
}

function getFacilityCountText(count: number) {
  return `${count} ${count === 1 ? "facility" : "facilities"}`;
}

const OPTION_STYLES =
  "flex min-h-12 w-full items-center gap-3 rounded-[15px] border border-slate-200/70 bg-white px-4 py-3 text-left transition-all hover:border-bulsu/40 hover:bg-bulsu/[0.04] active:scale-[0.99]";

export default function CollegePickerModal({
  building,
  colleges,
  totalFacilities,
  handleCollegeSelect,
  onClose,
}: CollegePickerModalProps) {
  const isOpen = building !== null;
  const dialogRef = useRef<HTMLDivElement>(null);
  // Element that opened the modal, so focus can be returned on close.
  const openerRef = useRef<HTMLElement | null>(null);

  // Focus the dialog on open; return focus to the opener on close without
  // scrolling back to it (the page scrolls to the results instead).
  useEffect(() => {
    if (isOpen) {
      openerRef.current = document.activeElement as HTMLElement | null;
      dialogRef.current?.focus();
    } else if (openerRef.current) {
      openerRef.current.focus({ preventScroll: true });
      openerRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {building && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
        >
          <motion.div
            ref={dialogRef}
            tabIndex={-1}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="college-picker-title"
            aria-describedby="college-picker-description"
            className="flex max-h-[85vh] w-full max-w-md flex-col rounded-[24px] border border-slate-200/70 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.15)] outline-none"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-bulsu/[0.07]">
                <Building2 className="h-5 w-5 text-bulsu" />
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close college picker"
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h2
              id="college-picker-title"
              className="mt-4 text-[20px] font-bold tracking-[-0.3px] text-slate-950"
            >
              {building.name}
            </h2>

            <p
              id="college-picker-description"
              className="mt-1.5 text-[13px] leading-5 text-slate-500"
            >
              {colleges.length > 0
                ? "Which college are you looking for in this building?"
                : "No reservable facilities are listed in this building yet."}
            </p>

            {colleges.length > 0 ? (
              <ul className="mt-5 space-y-2 overflow-y-auto">
                {colleges.map((college) => (
                  <li key={college.id}>
                    <button
                      type="button"
                      onClick={() => handleCollegeSelect(college.id)}
                      className={OPTION_STYLES}
                    >
                      <span className="shrink-0 rounded-[10px] bg-bulsu/[0.07] px-2.5 py-1.5 text-[11px] font-bold text-bulsu">
                        {college.code}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-semibold leading-5 text-slate-900">
                          {college.name}
                        </span>

                        <span className="block text-[12px] text-slate-500">
                          {getFacilityCountText(college.facilityCount)}
                        </span>
                      </span>

                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                    </button>
                  </li>
                ))}

                {colleges.length > 1 && (
                  <li>
                    <button
                      type="button"
                      onClick={() => handleCollegeSelect(null)}
                      className={OPTION_STYLES}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-semibold leading-5 text-slate-900">
                          All colleges in this building
                        </span>

                        <span className="block text-[12px] text-slate-500">
                          {getFacilityCountText(totalFacilities)}
                        </span>
                      </span>

                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                    </button>
                  </li>
                )}
              </ul>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="mt-6 h-11 rounded-[14px] border border-slate-200 text-[13px] font-semibold text-slate-700 transition-all hover:bg-slate-50 active:scale-[0.98]"
              >
                Close
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
