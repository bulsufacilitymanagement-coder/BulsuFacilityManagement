"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

import { InputField } from "../../ui/Fields/InputField";
import { EmailField } from "../../ui/Fields/EmailField";
import { PasswordField } from "../../ui/Fields/PasswordField";
import { PrimaryButton } from "../../ui/Buttons/PrimaryButton";

type UserRole = "student" | "faculty";

type FormErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;

export function Register() {
  const router = useRouter();
  const supabase = createClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  function validateForm(): boolean {
    const nextErrors: FormErrors = {};

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedFirstName) {
      nextErrors.firstName = "First name is required.";
    } else if (trimmedFirstName.length < 2) {
      nextErrors.firstName = "First name must be at least 2 characters.";
    } else if (!NAME_REGEX.test(trimmedFirstName)) {
      nextErrors.firstName =
        "First name can only contain letters, spaces, hyphens, or apostrophes.";
    }

    if (!trimmedLastName) {
      nextErrors.lastName = "Last name is required.";
    } else if (trimmedLastName.length < 2) {
      nextErrors.lastName = "Last name must be at least 2 characters.";
    } else if (!NAME_REGEX.test(trimmedLastName)) {
      nextErrors.lastName =
        "Last name can only contain letters, spaces, hyphens, or apostrophes.";
    }

    if (!trimmedEmail) {
      nextErrors.email = "Email address is required.";
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      nextErrors.email = "Please enter a valid institutional email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    } else if (!/[A-Z]/.test(password)) {
      nextErrors.password =
        "Password must contain at least one uppercase letter.";
    } else if (!/[a-z]/.test(password)) {
      nextErrors.password =
        "Password must contain at least one lowercase letter.";
    } else if (!/[0-9]/.test(password)) {
      nextErrors.password = "Password must contain at least one number.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    if (!role) {
      nextErrors.role = "Please select your account type.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    setLoading(true);

    try {
      const cleanFirstName = firstName.trim();
      const cleanLastName = lastName.trim();
      const cleanEmail = email.trim().toLowerCase();
      const fullName = `${cleanFirstName} ${cleanLastName}`;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            first_name: cleanFirstName,
            last_name: cleanLastName,
            full_name: fullName,
            role,
          },
        },
      });

      if (authError) {
        setErrorMsg(authError.message);
        return;
      }

      if (!authData.user) {
        setErrorMsg("Unable to create your account. Please try again.");
        return;
      }

      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        first_name: cleanFirstName,
        last_name: cleanLastName,
        full_name: fullName,
        email: cleanEmail,
        role,
      });

      if (profileError) {
        setErrorMsg(
          "Your account was created, but your profile could not be saved. Please contact the administrator."
        );
        return;
      }

      if (!authData.session) {
        setSuccessMsg(
          "Account created successfully. Please check your email to confirm your account."
        );
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function togglePassword() {
    setShowPassword((previousValue) => !previousValue);
  }

  function toggleConfirmPassword() {
    setShowConfirmPassword((previousValue) => !previousValue);
  }

  function selectRole(selectedRole: UserRole) {
    setRole(selectedRole);

    setErrors((previousErrors) => ({
      ...previousErrors,
      role: undefined,
    }));
  }

  function handleFirstNameChange(value: string) {
    setFirstName(value);

    setErrors((previousErrors) => ({
      ...previousErrors,
      firstName: undefined,
    }));
  }

  function handleLastNameChange(value: string) {
    setLastName(value);

    setErrors((previousErrors) => ({
      ...previousErrors,
      lastName: undefined,
    }));
  }

  function handleEmailChange(value: string) {
    setEmail(value);

    setErrors((previousErrors) => ({
      ...previousErrors,
      email: undefined,
    }));
  }

  function handlePasswordChange(value: string) {
    setPassword(value);

    setErrors((previousErrors) => ({
      ...previousErrors,
      password: undefined,
    }));
  }

  function handleConfirmPasswordChange(value: string) {
    setConfirmPassword(value);

    setErrors((previousErrors) => ({
      ...previousErrors,
      confirmPassword: undefined,
    }));
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FAFAF8] px-4 py-8 sm:px-6 sm:py-12">
      {/* Ambient background */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-72 w-72 rounded-full bg-[#A6192E]/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-[#F4C430]/[0.10] blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[460px] items-center justify-center">
        <section className="w-full">
          {/* Header */}
          <header className="mb-7 text-center">
            <div className="mx-auto mb-6 flex h-[68px] w-[68px] items-center justify-center rounded-[22px] bg-[#A6192E] shadow-[0_12px_30px_rgba(166,25,46,0.20)]">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-white/90">
                <div className="h-2.5 w-2.5 rounded-full bg-[#F4C430]" />
              </div>
            </div>

            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#A6192E]">
              Bulacan State University
            </p>

            <h1 className="text-[29px] font-bold tracking-[-0.8px] text-slate-950 sm:text-[31px]">
              Create your account
            </h1>

            <p className="mx-auto mt-2 max-w-[330px] text-[14px] leading-5 text-slate-500">
              Set up your account to request and manage facility reservations.
            </p>
          </header>

          {/* Card */}
          <div className="rounded-[26px] border border-slate-200/70 bg-white/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-7">
            {/* Error */}
            {errorMsg && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-[15px] border border-red-200 bg-red-50 px-4 py-3.5 text-[13px] leading-5 text-red-700"
              >
                <span className="mt-[5px] h-2 w-2 shrink-0 rounded-full bg-red-500" />
                <p>{errorMsg}</p>
              </div>
            )}

            {/* Success */}
            {successMsg && (
              <div
                role="status"
                className="mb-5 flex items-start gap-3 rounded-[15px] border border-yellow-300 bg-yellow-50 px-4 py-3.5 text-[13px] leading-5 text-yellow-900"
              >
                <span className="mt-[5px] h-2 w-2 shrink-0 rounded-full bg-[#F4C430]" />
                <p>{successMsg}</p>
              </div>
            )}

            <form onSubmit={handleRegister} noValidate className="space-y-5">
              {/* Account Type */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-[13px] font-semibold text-slate-700">
                    Account type
                  </label>

                  <span className="text-[11px] text-slate-400">Required</span>
                </div>

                <div
                  role="radiogroup"
                  aria-label="Account type"
                  className="grid grid-cols-2 gap-3"
                >
                  {/* Student */}
                  <button
                    type="button"
                    role="radio"
                    aria-checked={role === "student"}
                    onClick={function handleStudentClick() {
                      selectRole("student");
                    }}
                    className={`rounded-[17px] border p-4 text-left transition-all duration-200 active:scale-[0.985] ${
                      role === "student"
                        ? "border-[#A6192E] bg-[#A6192E]/[0.04] shadow-[0_4px_14px_rgba(166,25,46,0.08)] ring-2 ring-[#A6192E]/10"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl text-[13px] font-bold ${
                          role === "student"
                            ? "bg-[#A6192E] text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        S
                      </div>

                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                          role === "student"
                            ? "border-[#A6192E]"
                            : "border-slate-300"
                        }`}
                      >
                        {role === "student" && (
                          <div className="h-2.5 w-2.5 rounded-full bg-[#A6192E]" />
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-[14px] font-semibold text-slate-900">
                        Student
                      </p>

                      <p className="mt-1 text-[11px] leading-4 text-slate-500">
                        Reserve university facilities
                      </p>
                    </div>
                  </button>

                  {/* Faculty */}
                  <button
                    type="button"
                    role="radio"
                    aria-checked={role === "faculty"}
                    onClick={function handleFacultyClick() {
                      selectRole("faculty");
                    }}
                    className={`rounded-[17px] border p-4 text-left transition-all duration-200 active:scale-[0.985] ${
                      role === "faculty"
                        ? "border-[#A6192E] bg-[#A6192E]/[0.04] shadow-[0_4px_14px_rgba(166,25,46,0.08)] ring-2 ring-[#A6192E]/10"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl text-[13px] font-bold ${
                          role === "faculty"
                            ? "bg-[#A6192E] text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        F
                      </div>

                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                          role === "faculty"
                            ? "border-[#A6192E]"
                            : "border-slate-300"
                        }`}
                      >
                        {role === "faculty" && (
                          <div className="h-2.5 w-2.5 rounded-full bg-[#A6192E]" />
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-[14px] font-semibold text-slate-900">
                        Faculty
                      </p>

                      <p className="mt-1 text-[11px] leading-4 text-slate-500">
                        Reserve and manage facilities
                      </p>
                    </div>
                  </button>
                </div>

                {errors.role && (
                  <p className="mt-2 text-[12px] font-medium text-red-600">
                    {errors.role}
                  </p>
                )}
              </div>

              {/* First + Last Name */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <InputField
                    label="First Name"
                    name="firstName"
                    value={firstName}
                    placeholder="Juan"
                    autoComplete="given-name"
                    required
                    onChange={handleFirstNameChange}
                  />

                  {errors.firstName && (
                    <p className="mt-1.5 text-[12px] font-medium text-red-600">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <InputField
                    label="Last Name"
                    name="lastName"
                    value={lastName}
                    placeholder="Dela Cruz"
                    autoComplete="family-name"
                    required
                    onChange={handleLastNameChange}
                  />

                  {errors.lastName && (
                    <p className="mt-1.5 text-[12px] font-medium text-red-600">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <EmailField
                  label="Email"
                  name="email"
                  value={email}
                  placeholder="myemail@university.edu.ph"
                  autoComplete="email"
                  required
                  onChange={handleEmailChange}
                />

                {errors.email && (
                  <p className="mt-1.5 text-[12px] font-medium text-red-600">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <PasswordField
                  label="Password"
                  name="password"
                  value={password}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  required
                  showPassword={showPassword}
                  onTogglePassword={togglePassword}
                  onChange={handlePasswordChange}
                />

                {errors.password ? (
                  <p className="mt-1.5 text-[12px] font-medium text-red-600">
                    {errors.password}
                  </p>
                ) : (
                  <p className="mt-1.5 text-[11px] text-slate-400">
                    Use at least 8 characters with uppercase, lowercase, and a
                    number.
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <PasswordField
                  label="Confirm Password"
                  name="confirmPassword"
                  value={confirmPassword}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  required
                  showPassword={showConfirmPassword}
                  onTogglePassword={toggleConfirmPassword}
                  onChange={handleConfirmPasswordChange}
                />

                {errors.confirmPassword && (
                  <p className="mt-1.5 text-[12px] font-medium text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit */}
              <div className="pt-1">
                <PrimaryButton type="submit" loading={loading}>
                  Create Account
                </PrimaryButton>
              </div>
            </form>

            {/* Login */}
            <div className="mt-7 border-t border-slate-100 pt-5 text-center">
              <p className="text-[14px] text-slate-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[#A6192E] transition-colors hover:text-[#7D1223] hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
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
        </section>
      </div>
    </main>
  );
}
