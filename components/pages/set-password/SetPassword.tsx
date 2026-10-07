"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { PasswordField } from "@/components/ui/Fields/PasswordField";
import { PrimaryButton } from "@/components/ui/Buttons/PrimaryButton";
import bulsu_logo from "@/assets/logo/bulsu_logo.png";

// First-run password form for invited users (they arrive with a session
// from /auth/confirm but no password yet).
export function SetPassword() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setErrorMsg(null);

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-white px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute -left-32 -top-32 h-72 w-72 rounded-full bg-bulsu/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-gold/[0.10] blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[430px] items-center justify-center">
        <motion.section
          className="w-full"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <header className="mb-8 text-center">
            <div className="mx-auto mb-6 flex w-[100px] items-center justify-center">
              <Image src={bulsu_logo} width={100} alt="BulSU Logo" />
            </div>

            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-bulsu">
              Bulacan State University
            </p>

            <h1 className="text-[30px] font-bold tracking-[-0.8px] text-slate-950 sm:text-[32px]">
              Set your password
            </h1>

            <p className="mx-auto mt-2 max-w-[310px] text-[14px] leading-5 text-slate-500">
              Your invite was accepted. Create a password to finish setting up
              your account.
            </p>
          </header>

          <div className="rounded-[26px] border border-slate-200/70 bg-white/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-7">
            <AnimatePresence initial={false}>
              {errorMsg && (
                <motion.div
                  key="error"
                  role="alert"
                  initial={{ opacity: 0, height: 0, y: -8, marginBottom: 0 }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    y: 0,
                    marginBottom: 20,
                  }}
                  exit={{ opacity: 0, height: 0, y: -8, marginBottom: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-start gap-3 overflow-hidden rounded-[15px] border border-red-200 bg-red-50 px-4 py-3.5 text-[13px] leading-5 text-red-700"
                >
                  <span className="mt-[3px] h-2 w-2 shrink-0 rounded-full bg-red-500" />
                  <p>{errorMsg}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              <PasswordField
                label="New Password"
                name="newPassword"
                value={password}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                required
                showPassword={showPassword}
                onTogglePassword={() =>
                  setShowPassword((previous) => !previous)
                }
                onChange={setPassword}
              />

              <PasswordField
                label="Confirm Password"
                name="confirmPassword"
                value={confirmPassword}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                required
                showPassword={showConfirmPassword}
                onTogglePassword={() =>
                  setShowConfirmPassword((previous) => !previous)
                }
                onChange={setConfirmPassword}
              />

              <div className="pt-1">
                <PrimaryButton type="submit" loading={loading}>
                  Save Password
                </PrimaryButton>
              </div>
            </form>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
