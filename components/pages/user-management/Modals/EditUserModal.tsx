"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PencilLine, X } from "lucide-react";
import { sileo } from "sileo";
import { createClient } from "@/lib/supabase/client";
import { InputField } from "@/components/ui/Fields/InputField";
import { PrimaryButton } from "@/components/ui/Buttons/PrimaryButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { USER_ROLES, type ViewUser } from "../types/view-user";

const supabase = createClient();

export interface CollegeOption {
  id: string;
  name: string;
  code: string;
}

interface EditUserModalProps {
  user: ViewUser | null;
  colleges: CollegeOption[];
  onClose: () => void;
  onSaved: () => void;
}

export function EditUserModal({
  user,
  colleges,
  onClose,
  onSaved,
}: EditUserModalProps) {
  // Form state is fixed per mount; the parent remounts via key per user.
  const [initial] = useState(() => ({
    firstName: user?.first_name ?? "",
    lastName: user?.last_name ?? "",
    role: user?.role ?? "Student Org Admin",
    collegeId: user?.college_id ?? "",
  }));

  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [role, setRole] = useState(initial.role);
  const [collegeId, setCollegeId] = useState(initial.collegeId);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Close on Escape for keyboard users (disabled while confirming/saving).
  useEffect(() => {
    if (!user || showConfirm || isSaving) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [user, showConfirm, isSaving, onClose]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (firstName.trim().length < 2 || lastName.trim().length < 2) {
      setFormError("First and last names need at least 2 characters.");
      return;
    }

    if (!USER_ROLES.includes(role as (typeof USER_ROLES)[number])) {
      setFormError("Pick a valid role.");
      return;
    }

    // College Admins must belong to a college; other roles may leave it empty.
    if (role === "College Admin" && !collegeId) {
      setFormError("College Admins need an assigned college.");
      return;
    }

    setFormError(null);
    setShowConfirm(true);
  }

  async function handleConfirmSave() {
    if (!user) {
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          role,
          college_id: collegeId === "" ? null : collegeId,
        })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      sileo.success({
        title: "User Updated",
        description: (
          <span className="font-medium text-green-500/50!">
            <p className="text-center">
              {firstName.trim()} {lastName.trim()} was updated.
            </p>
          </span>
        ),
      });

      setShowConfirm(false);
      onSaved();
      onClose();
    } catch (error) {
      setShowConfirm(false);
      setFormError(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving. Try again."
      );
    } finally {
      setIsSaving(false);
    }
  }

  // ConfirmDialog manages its own AnimatePresence, so it stays a sibling here:
  // two keyless children inside one AnimatePresence share a key and crash.
  return (
    <>
      <AnimatePresence>
        {user && (
          <motion.div
            key="edit-user-dialog"
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
            aria-label={`Edit ${user.first_name} ${user.last_name}`}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[24px] border border-slate-200/70 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.15)] sm:p-7"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-bulsu/[0.07] text-bulsu">
                  <PencilLine className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-bulsu">
                    User Management
                  </p>

                  <h2 className="text-[18px] font-bold text-slate-950">
                    Edit User
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div
                role="alert"
                className="mt-5 rounded-[15px] border border-red-200 bg-red-50 px-4 py-3.5 text-[13px] leading-5 text-red-700"
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <InputField
                  label="First Name"
                  name="editFirstName"
                  value={firstName}
                  placeholder="Juan"
                  required
                  onChange={(value) => {
                    setFirstName(value);
                    setFormError(null);
                  }}
                />

                <InputField
                  label="Last Name"
                  name="editLastName"
                  value={lastName}
                  placeholder="Dela Cruz"
                  required
                  onChange={(value) => {
                    setLastName(value);
                    setFormError(null);
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="edit-role"
                  className="mb-2 block text-[13px] font-semibold text-slate-700"
                >
                  Role
                </label>

                <select
                  id="edit-role"
                  value={role}
                  onChange={(event) => {
                    setRole(event.target.value);
                    setFormError(null);
                  }}
                  className="h-[52px] w-full rounded-[15px] border border-slate-200 bg-white px-4 text-[15px] text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.03)] outline-none transition-all focus:border-bulsu focus:ring-4 focus:ring-bulsu/10"
                >
                  {USER_ROLES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="edit-college"
                  className="mb-2 block text-[13px] font-semibold text-slate-700"
                >
                  College
                </label>

                <select
                  id="edit-college"
                  value={collegeId}
                  onChange={(event) => {
                    setCollegeId(event.target.value);
                    setFormError(null);
                  }}
                  className="h-[52px] w-full rounded-[15px] border border-slate-200 bg-white px-4 text-[15px] text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.03)] outline-none transition-all focus:border-bulsu focus:ring-4 focus:ring-bulsu/10"
                >
                  <option value="">No college assigned</option>

                  {colleges.map((college) => (
                    <option key={college.id} value={college.id}>
                      {college.name} ({college.code})
                    </option>
                  ))}
                </select>

                <p className="mt-1.5 text-[11px] text-slate-400">
                  Required for College Admins so their inventory stays scoped.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-[52px] w-32 rounded-[15px] border border-slate-200 px-5 text-[14px] font-semibold text-slate-700 transition-all hover:bg-slate-50"
                >
                  Cancel
                </button>

                <div className="w-44">
                  <PrimaryButton
                    type="submit"
                    loading={isSaving}
                    loadingText="Saving…"
                  >
                    Save Changes
                  </PrimaryButton>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Role changes are state-changing admin actions, so they confirm first. */}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Save user changes?"
        description={`${firstName.trim()} ${lastName.trim()} will become ${role}${collegeId ? " with a new college assignment" : ""}.`}
        confirmLabel="Save Changes"
        loadingLabel="Saving…"
        loading={isSaving}
        onConfirm={handleConfirmSave}
        onClose={() => setShowConfirm(false)}
      />
    </>
  );
}
