"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TriangleAlert } from "lucide-react";

// Props for the shared confirmation dialog.
// Use this for every destructive or state-changing admin action
// (delete, approve/reject, revoke, sign out) — never single-click those.
export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  loadingLabel: string;
  cancelLabel?: string;
  tone?: "destructive" | "primary";
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  loadingLabel,
  cancelLabel = "Cancel",
  tone = "destructive",
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  // Element that opened the dialog, so focus can be returned on close.
  const openerRef = useRef<HTMLElement | null>(null);

  // Focus the confirm action on open; return focus to the opener on close.
  useEffect(() => {
    if (isOpen) {
      openerRef.current = document.activeElement as HTMLElement | null;
      confirmRef.current?.focus();
    } else if (openerRef.current) {
      openerRef.current.focus();
      openerRef.current = null;
    }
  }, [isOpen]);

  // Close on Escape (disabled while the confirm action is running).
  useEffect(() => {
    if (!isOpen || loading) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  const confirmStyles =
    tone === "destructive"
      ? "bg-bulsu hover:bg-bulsu-dark"
      : "bg-slate-900 hover:bg-slate-700";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (!loading) {
              onClose();
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
            className="w-full max-w-sm rounded-[24px] border border-slate-200/70 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.15)]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-bulsu/[0.07]">
              <TriangleAlert className="h-5 w-5 text-bulsu" />
            </div>

            <h2
              id="confirm-dialog-title"
              className="mt-4 text-[18px] font-bold tracking-[-0.3px] text-slate-950"
            >
              {title}
            </h2>

            <p
              id="confirm-dialog-description"
              className="mt-1.5 text-[13px] leading-5 text-slate-500"
            >
              {description}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={onClose}
                className="h-11 rounded-[14px] border border-slate-200 text-[13px] font-semibold text-slate-700 transition-all hover:bg-slate-50 active:scale-[0.98] disabled:opacity-60"
              >
                {cancelLabel}
              </button>

              <button
                ref={confirmRef}
                type="button"
                disabled={loading}
                onClick={onConfirm}
                className={`h-11 rounded-[14px] text-[13px] font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60 ${confirmStyles}`}
              >
                {loading ? loadingLabel : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
