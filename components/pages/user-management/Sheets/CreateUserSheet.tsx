"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, UserPlus, X } from "lucide-react";
import { sileo } from "sileo";
import { InputField } from "@/components/ui/Fields/InputField";
import { EmailField } from "@/components/ui/Fields/EmailField";
import { PrimaryButton } from "@/components/ui/Buttons/PrimaryButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { createUserAsAdmin } from "@/app/(auth-protected)/(super-admin)/user-management/actions";
import { USER_ROLES } from "../types/view-user";
import type { CollegeOption } from "../Modals/EditUserModal";

interface CreateUserSheetProps {
  isOpen: boolean;
  colleges: CollegeOption[];
  onClose: () => void;
  onCreated: () => void;
}

export function CreateUserSheet({
  isOpen,
  colleges,
  onClose,
  onCreated,
}: CreateUserSheetProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Student Org Admin");
  const [collegeId, setCollegeId] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (firstName.trim().length < 2 || lastName.trim().length < 2) {
      setFormError("First and last names need at least 2 characters.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setFormError("Enter a valid email address.");
      return;
    }

    if (role === "College Admin" && !collegeId) {
      setFormError("College Admins need an assigned college.");
      return;
    }

    setFormError(null);
    setShowConfirm(true);
  }

  async function handleConfirmCreate() {
    setIsSaving(true);
    setFormError(null);

    try {
      await createUserAsAdmin({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        role: role as (typeof USER_ROLES)[number],
        collegeId: collegeId === "" ? null : collegeId,
      });

      sileo.success({
        title: "Invite Sent",
        description: (
          <span className="font-medium text-green-500/50!">
            <p className="text-center">
              {email.trim()} will receive an invite email.
            </p>
          </span>
        ),
      });

      setShowConfirm(false);
      setInvitedEmail(email.trim());
      onCreated();
    } catch (error) {
      setShowConfirm(false);
      setFormError(
        error instanceof Error
          ? error.message
          : "Something went wrong while inviting the user. Try again."
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleDone() {
    setInvitedEmail(null);
    onClose();
  }

  // ConfirmDialog manages its own AnimatePresence, so it stays a sibling here:
  // two keyless children inside one AnimatePresence share a key and crash.
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div
            key="create-user-sheet"
            className="fixed inset-0 z-50 overflow-hidden"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
            />

            <div className="fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10">
              {/* Sheet Panel: Fullscreen on mobile, 50% width on Desktop */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                role="dialog"
                aria-modal="true"
                aria-label={invitedEmail ? "Invite sent" : "Add new user"}
                className="relative flex w-screen flex-col border-l border-slate-200/80 bg-white shadow-2xl sm:w-[50vw] sm:max-w-2xl"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 shadow-[0_10px_400px_-20px_var(--color-bulsu)] sm:px-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-bulsu/[0.07] text-bulsu">
                      <UserPlus className="h-5 w-5" />
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-bulsu">
                        User Management
                      </span>

                      <h2 className="text-[20px] font-bold text-slate-950">
                        {invitedEmail ? "Invite Sent" : "Add New User"}
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

                {invitedEmail ? (
                  // Success view confirms the invite went out.
                  <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                    <div className="rounded-[20px] border border-emerald-200/60 bg-emerald-50/50 p-6 text-center">
                      <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />

                      <p className="mt-3 text-[17px] font-bold text-slate-900">
                        Invite sent successfully
                      </p>

                      <p className="mt-1 text-[13px] leading-5 text-slate-500">
                        <span className="font-mono font-semibold">
                          {invitedEmail}
                        </span>{" "}
                        will receive an email to accept the invite and set
                        their own password.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleDone}
                      className="mt-6 h-[54px] w-full rounded-[15px] bg-bulsu text-[15px] font-semibold text-white transition-all hover:bg-bulsu-dark active:scale-[0.99]"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  /* Scrollable Form Body */
                  <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="flex-1 space-y-6 overflow-y-auto p-6 sm:p-8"
                  >
                    {formError && (
                      <div
                        role="alert"
                        className="rounded-[15px] border border-red-200 bg-red-50 px-4 py-3.5 text-[13px] leading-5 text-red-700"
                      >
                        {formError}
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <InputField
                        label="First Name"
                        name="createFirstName"
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
                        name="createLastName"
                        value={lastName}
                        placeholder="Dela Cruz"
                        required
                        onChange={(value) => {
                          setLastName(value);
                          setFormError(null);
                        }}
                      />
                    </div>

                    <EmailField
                      label="Email"
                      name="createEmail"
                      value={email}
                      placeholder="user@bulsu.edu.ph"
                      required
                      onChange={(value) => {
                        setEmail(value);
                        setFormError(null);
                      }}
                    />

                    <div>
                      <label
                        htmlFor="create-role"
                        className="mb-2 block text-[13px] font-semibold text-slate-700"
                      >
                        Role
                      </label>

                      <select
                        id="create-role"
                        value={role}
                        onChange={(event) => {
                          setRole(event.target.value);
                          setFormError(null);
                        }}
                        className="h-[52px] w-full rounded-[15px] border border-slate-200 bg-white px-4 text-[16px] text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.03)] outline-none transition-all duration-200 focus:border-bulsu focus:ring-4 focus:ring-bulsu/10"
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
                        htmlFor="create-college"
                        className="mb-2 block text-[13px] font-semibold text-slate-700"
                      >
                        College
                      </label>

                      <select
                        id="create-college"
                        value={collegeId}
                        onChange={(event) => {
                          setCollegeId(event.target.value);
                          setFormError(null);
                        }}
                        className="h-[52px] w-full rounded-[15px] border border-slate-200 bg-white px-4 text-[16px] text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.03)] outline-none transition-all duration-200 focus:border-bulsu focus:ring-4 focus:ring-bulsu/10"
                      >
                        <option value="">No college assigned</option>

                        {colleges.map((college) => (
                          <option key={college.id} value={college.id}>
                            {college.name} ({college.code})
                          </option>
                        ))}
                      </select>

                      <p className="mt-1.5 text-[11px] text-slate-400">
                        Required for College Admins so their inventory stays
                        scoped.
                      </p>
                    </div>

                    <p className="-mt-2 text-[11px] leading-5 text-slate-400">
                      The new user gets an invite email and sets their own
                      password — no passwords to share.
                    </p>

                    {/* Actions Footer */}
                    <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="h-[54px] w-32 rounded-[15px] border border-slate-200 px-5 text-[15px] font-semibold text-slate-700 transition-all hover:bg-slate-50"
                      >
                        Cancel
                      </button>

                      <div className="w-44">
                        <PrimaryButton
                          type="submit"
                          loading={isSaving}
                          loadingText="Sending…"
                        >
                          Send Invite
                        </PrimaryButton>
                      </div>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Inviting accounts is state-changing, so it confirms first. */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Send invite?"
        description={`${email.trim()} will be registered as ${role} and receive an email to set their password.`}
        confirmLabel="Send Invite"
        loadingLabel="Sending…"
        loading={isSaving}
        onConfirm={handleConfirmCreate}
        onClose={() => setShowConfirm(false)}
      />
    </>
  );
}
