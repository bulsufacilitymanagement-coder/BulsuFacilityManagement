"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

import { EmailField } from "../../ui/Fields/EmailField";
import { PasswordField } from "../../ui/Fields/PasswordField";
import { PrimaryButton } from "../../ui/Buttons/PrimaryButton";

export function Login() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message === "Invalid login credentials") {
          setErrorMsg("Invalid email or password");
          return;
        }

        setErrorMsg(error.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  function togglePassword() {
    setShowPassword(function (previousValue) {
      return !previousValue;
    });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FAFAF8] px-4 py-8 sm:px-6">
      {/* Ambient background */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-72 w-72 rounded-full bg-[#A6192E]/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-[#F4C430]/[0.10] blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[430px] items-center justify-center">
        <motion.section
          className="w-full"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* -------------------------------------------------------------- */}
          {/* Header                                                          */}
          {/* -------------------------------------------------------------- */}

          <header className="mb-8 text-center">
            {/* University mark */}
            <motion.div
              className="mx-auto mb-6 flex h-[68px] w-[68px] items-center justify-center rounded-[22px] bg-[#A6192E] shadow-[0_12px_30px_rgba(166,25,46,0.20)]"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-white/90">
                <div className="h-2.5 w-2.5 rounded-full bg-[#F4C430]" />
              </div>
            </motion.div>

            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#A6192E]">
              Bulacan State University
            </p>

            <motion.h1
              className="text-[30px] font-bold tracking-[-0.8px] text-slate-950 sm:text-[32px]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              Welcome back
            </motion.h1>

            <motion.p
              className="mx-auto mt-2 max-w-[310px] text-[14px] leading-5 text-slate-500"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.22 }}
            >
              Sign in to your account and continue managing your facility
              reservations.
            </motion.p>
          </header>

          {/* -------------------------------------------------------------- */}
          {/* Login Surface                                                    */}
          {/* -------------------------------------------------------------- */}

          <motion.div
            className="rounded-[26px] border border-slate-200/70 bg-white/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-7"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18, ease: "easeOut" }}
          >
            {/* Error */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -5 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                transition={{ duration: 0.25 }}
                className="mb-5 flex items-start gap-3 overflow-hidden rounded-[15px] border border-red-200 bg-red-50 px-4 py-3.5 text-[13px] leading-5 text-red-700"
              >
                <span className="mt-[3px] h-2 w-2 shrink-0 rounded-full bg-red-500" />
                <p>{errorMsg}</p>
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <EmailField
                label="Email"
                name="email"
                value={email}
                placeholder="student@university.edu.ph"
                autoComplete="email"
                required
                onChange={setEmail}
              />

              {/* Password */}
              <PasswordField
                label="Password"
                name="password"
                value={password}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                showPassword={showPassword}
                onTogglePassword={togglePassword}
                onChange={setPassword}
              />

              {/* Forgot password */}
              <div className="flex justify-end pt-[-2px]">
                <Link
                  href="/forgot-password"
                  className="rounded-lg px-1 text-[13px] font-semibold text-[#A6192E] transition-colors hover:text-[#7D1223] hover:underline focus:outline-none focus:ring-2 focus:ring-[#A6192E]/20"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Button */}
              <div className="pt-1">
                <PrimaryButton type="submit" loading={loading}>
                  Sign In
                </PrimaryButton>
              </div>
            </form>

            {/* Divider */}
            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-300">
                or
              </span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            {/* Register */}
            <div className="text-center">
              <p className="text-[14px] text-slate-500">
                Don&apos;t have an account?
              </p>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex"
              >
                <Link
                  href="/register"
                  className="mt-1 inline-flex min-h-10 items-center justify-center rounded-xl px-3 text-[14px] font-semibold text-[#A6192E] transition-colors hover:bg-[#A6192E]/[0.05] hover:text-[#7D1223]"
                >
                  Create your account
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* -------------------------------------------------------------- */}
          {/* Trust / Footer                                                   */}
          {/* -------------------------------------------------------------- */}

          <div className="mt-7 text-center">
            <div className="mb-2 flex items-center justify-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#A6192E]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#F4C430]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#A6192E]/30" />
            </div>

            <p className="text-[11px] font-medium text-slate-400">
              Centralized Facility Reservation System
            </p>

            <p className="mt-1 text-[10px] text-slate-300">
              Bulacan State University
            </p>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
