"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X } from "lucide-react";
import type { ViewUser } from "../types/view-user";

// Pill colors distinguish roles at a glance (never color-only: label included).
function rolePill(role: string) {
  if (role === "Super Admin") {
    return "bg-bulsu/[0.07] text-bulsu";
  }

  if (role === "College Admin") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-emerald-50 text-emerald-700";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", { dateStyle: "medium" }).format(
    new Date(value)
  );
}

interface UserDetailsModalProps {
  user: ViewUser | null;
  onClose: () => void;
}

export function UserDetailsModal({ user, onClose }: UserDetailsModalProps) {
  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!user) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [user, onClose]);

  const initials = user
    ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
    : "";

  return (
    <AnimatePresence>
      {user && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 px-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`${user.first_name} ${user.last_name} details`}
            className="w-full max-w-md overflow-hidden rounded-[24px] border border-slate-200/70 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.15)]"
          >
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-bulsu text-[14px] font-bold text-white">
                    {initials}
                  </div>

                  <div>
                    <h2 className="text-[18px] font-bold tracking-[-0.3px] text-slate-950">
                      {user.first_name} {user.last_name}
                    </h2>

                    <p className="mt-0.5 text-[12px] text-slate-500">
                      {user.email}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close details"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Role
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-bold ${rolePill(user.role)}`}
                >
                  {user.role}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  College
                </span>

                <span className="text-[13px] font-semibold text-slate-700">
                  {user.college
                    ? `${user.college.name} (${user.college.code})`
                    : "No college assigned"}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Member since
                </span>

                <span className="text-[13px] font-semibold text-slate-700">
                  {formatDate(user.created_at)}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  User ID
                </span>

                <span className="max-w-[220px] truncate font-mono text-[11px] text-slate-500">
                  {user.id}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="h-11 w-full rounded-xl bg-bulsu text-[13px] font-semibold text-white transition-colors hover:bg-bulsu-dark active:scale-[0.99]"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
