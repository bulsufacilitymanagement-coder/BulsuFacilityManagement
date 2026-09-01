"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
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

const pageVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.45,
      ease: "easeOut",
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 14,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.985,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

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

      // Create auth user
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

      // Create profile of user
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        first_name: cleanFirstName,
        last_name: cleanLastName,
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
    setShowPassword(function (previousValue) {
      return !previousValue;
    });
  }

  function toggleConfirmPassword() {
    setShowConfirmPassword(function (previousValue) {
      return !previousValue;
    });
  }

  function selectRole(selectedRole: UserRole) {
    setRole(selectedRole);

    setErrors(function (previousErrors) {
      return {
        ...previousErrors,
        role: undefined,
      };
    });
  }

  function handleFirstNameChange(value: string) {
    setFirstName(value);

    setErrors(function (previousErrors) {
      return {
        ...previousErrors,
        firstName: undefined,
      };
    });
  }

  function handleLastNameChange(value: string) {
    setLastName(value);

    setErrors(function (previousErrors) {
      return {
        ...previousErrors,
        lastName: undefined,
      };
    });
  }

  function handleEmailChange(value: string) {
    setEmail(value);

    setErrors(function (previousErrors) {
      return {
        ...previousErrors,
        email: undefined,
      };
    });
  }

  function handlePasswordChange(value: string) {
    setPassword(value);

    setErrors(function (previousErrors) {
      return {
        ...previousErrors,
        password: undefined,
      };
    });
  }

  function handleConfirmPasswordChange(value: string) {
    setConfirmPassword(value);

    setErrors(function (previousErrors) {
      return {
        ...previousErrors,
        confirmPassword: undefined,
      };
    });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FAFAF8] px-4 py-8 sm:px-6 sm:py-12">
      {/* Ambient background */}
      <motion.div
        className="pointer-events-none absolute -left-32 -top-32 h-72 w-72 rounded-full bg-[#A6192E]/[0.07] blur-3xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      <motion.div
        className="pointer-events-none absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-[#F4C430]/[0.10] blur-3xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 1.2,
          delay: 0.15,
          ease: "easeOut",
        }}
      />

      <motion.div
        className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[460px] items-center justify-center"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <section className="w-full">
          {/* Header */}
          <motion.header variants={itemVariants} className="mb-7 text-center">
            {/* University mark */}
            <motion.div
              className="mx-auto mb-6 flex h-[68px] w-[68px] items-center justify-center rounded-[22px] bg-[#A6192E] shadow-[0_12px_30px_rgba(166,25,46,0.20)]"
              initial={{ opacity: 0, scale: 0.8, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{
                duration: 0.55,
                ease: "easeOut",
              }}
              whileHover={{
                scale: 1.04,
              }}
              whileTap={{
                scale: 0.97,
              }}
            >
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-white/90">
                <motion.div
                  className="h-2.5 w-2.5 rounded-full bg-[#F4C430]"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.35,
                    ease: "easeOut",
                  }}
                />
              </div>
            </motion.div>

            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#A6192E]">
              Bulacan State University
            </p>

            <h1 className="text-[29px] font-bold tracking-[-0.8px] text-slate-950 sm:text-[31px]">
              Create your account
            </h1>

            <p className="mx-auto mt-2 max-w-[330px] text-[14px] leading-5 text-slate-500">
              Set up your account to request and manage facility reservations.
            </p>
          </motion.header>

          {/* Card */}
          <motion.div
            variants={cardVariants}
            className="rounded-[26px] border border-slate-200/70 bg-white/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-7"
          >
            {/* Error */}
            <AnimatePresence initial={false}>
              {errorMsg && (
                <motion.div
                  key="error"
                  role="alert"
                  initial={{
                    opacity: 0,
                    height: 0,
                    y: -8,
                    marginBottom: 0,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    y: 0,
                    marginBottom: 20,
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    y: -8,
                    marginBottom: 0,
                  }}
                  transition={{
                    duration: 0.25,
                    ease: "easeOut",
                  }}
                  className="flex items-start gap-3 overflow-hidden rounded-[15px] border border-red-200 bg-red-50 px-4 py-3.5 text-[13px] leading-5 text-red-700"
                >
                  <span className="mt-[5px] h-2 w-2 shrink-0 rounded-full bg-red-500" />

                  <p>{errorMsg}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success */}
            <AnimatePresence initial={false}>
              {successMsg && (
                <motion.div
                  key="success"
                  role="status"
                  initial={{
                    opacity: 0,
                    height: 0,
                    y: -8,
                    marginBottom: 0,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    y: 0,
                    marginBottom: 20,
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    y: -8,
                    marginBottom: 0,
                  }}
                  transition={{
                    duration: 0.25,
                    ease: "easeOut",
                  }}
                  className="flex items-start gap-3 overflow-hidden rounded-[15px] border border-yellow-300 bg-yellow-50 px-4 py-3.5 text-[13px] leading-5 text-yellow-900"
                >
                  <span className="mt-[5px] h-2 w-2 shrink-0 rounded-full bg-[#F4C430]" />

                  <p>{successMsg}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleRegister} noValidate className="space-y-5">
              {/* Account Type */}
              <motion.div variants={itemVariants}>
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
                  <motion.button
                    type="button"
                    role="radio"
                    aria-checked={role === "student"}
                    onClick={function handleStudentClick() {
                      selectRole("student");
                    }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.985 }}
                    transition={{
                      duration: 0.15,
                    }}
                    className={`rounded-[17px] border p-4 text-left transition-all duration-200 ${
                      role === "student"
                        ? "border-[#A6192E] bg-[#A6192E]/[0.04] shadow-[0_4px_14px_rgba(166,25,46,0.08)] ring-2 ring-[#A6192E]/10"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <motion.div
                        animate={{
                          scale: role === "student" ? 1 : 0.96,
                        }}
                        className={`flex h-9 w-9 items-center justify-center rounded-xl text-[13px] font-bold ${
                          role === "student"
                            ? "bg-[#A6192E] text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        S
                      </motion.div>

                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
                          role === "student"
                            ? "border-[#A6192E]"
                            : "border-slate-300"
                        }`}
                      >
                        <AnimatePresence>
                          {role === "student" && (
                            <motion.div
                              initial={{
                                opacity: 0,
                                scale: 0,
                              }}
                              animate={{
                                opacity: 1,
                                scale: 1,
                              }}
                              exit={{
                                opacity: 0,
                                scale: 0,
                              }}
                              transition={{
                                duration: 0.18,
                              }}
                              className="h-2.5 w-2.5 rounded-full bg-[#A6192E]"
                            />
                          )}
                        </AnimatePresence>
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
                  </motion.button>

                  {/* Faculty */}
                  <motion.button
                    type="button"
                    role="radio"
                    aria-checked={role === "faculty"}
                    onClick={function handleFacultyClick() {
                      selectRole("faculty");
                    }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.985 }}
                    transition={{
                      duration: 0.15,
                    }}
                    className={`rounded-[17px] border p-4 text-left transition-all duration-200 ${
                      role === "faculty"
                        ? "border-[#A6192E] bg-[#A6192E]/[0.04] shadow-[0_4px_14px_rgba(166,25,46,0.08)] ring-2 ring-[#A6192E]/10"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <motion.div
                        animate={{
                          scale: role === "faculty" ? 1 : 0.96,
                        }}
                        className={`flex h-9 w-9 items-center justify-center rounded-xl text-[13px] font-bold ${
                          role === "faculty"
                            ? "bg-[#A6192E] text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        F
                      </motion.div>

                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
                          role === "faculty"
                            ? "border-[#A6192E]"
                            : "border-slate-300"
                        }`}
                      >
                        <AnimatePresence>
                          {role === "faculty" && (
                            <motion.div
                              initial={{
                                opacity: 0,
                                scale: 0,
                              }}
                              animate={{
                                opacity: 1,
                                scale: 1,
                              }}
                              exit={{
                                opacity: 0,
                                scale: 0,
                              }}
                              transition={{
                                duration: 0.18,
                              }}
                              className="h-2.5 w-2.5 rounded-full bg-[#A6192E]"
                            />
                          )}
                        </AnimatePresence>
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
                  </motion.button>
                </div>

                <AnimatePresence initial={false}>
                  {errors.role && (
                    <motion.p
                      initial={{
                        opacity: 0,
                        y: -4,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: -4,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                      className="mt-2 text-[12px] font-medium text-red-600"
                    >
                      {errors.role}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* First + Last Name */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 gap-5 sm:grid-cols-2"
              >
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

                  <AnimatePresence initial={false}>
                    {errors.firstName && (
                      <motion.p
                        initial={{
                          opacity: 0,
                          y: -4,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          y: -4,
                        }}
                        className="mt-1.5 text-[12px] font-medium text-red-600"
                      >
                        {errors.firstName}
                      </motion.p>
                    )}
                  </AnimatePresence>
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

                  <AnimatePresence initial={false}>
                    {errors.lastName && (
                      <motion.p
                        initial={{
                          opacity: 0,
                          y: -4,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          y: -4,
                        }}
                        className="mt-1.5 text-[12px] font-medium text-red-600"
                      >
                        {errors.lastName}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Email */}
              <motion.div variants={itemVariants}>
                <EmailField
                  label="Email"
                  name="email"
                  value={email}
                  placeholder="myemail@university.edu.ph"
                  autoComplete="email"
                  required
                  onChange={handleEmailChange}
                />

                <AnimatePresence initial={false}>
                  {errors.email && (
                    <motion.p
                      initial={{
                        opacity: 0,
                        y: -4,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: -4,
                      }}
                      className="mt-1.5 text-[12px] font-medium text-red-600"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Password */}
              <motion.div variants={itemVariants}>
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

                <AnimatePresence mode="wait" initial={false}>
                  {errors.password ? (
                    <motion.p
                      key="password-error"
                      initial={{
                        opacity: 0,
                        y: -4,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: -4,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                      className="mt-1.5 text-[12px] font-medium text-red-600"
                    >
                      {errors.password}
                    </motion.p>
                  ) : (
                    <motion.p
                      key="password-help"
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: 1,
                      }}
                      exit={{
                        opacity: 0,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                      className="mt-1.5 text-[11px] text-slate-400"
                    >
                      Use at least 8 characters with uppercase, lowercase, and a
                      number.
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Confirm Password */}
              <motion.div variants={itemVariants}>
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

                <AnimatePresence initial={false}>
                  {errors.confirmPassword && (
                    <motion.p
                      initial={{
                        opacity: 0,
                        y: -4,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: -4,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                      className="mt-1.5 text-[12px] font-medium text-red-600"
                    >
                      {errors.confirmPassword}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Submit */}
              <motion.div
                variants={itemVariants}
                className="pt-1"
                whileTap={{
                  scale: 0.99,
                }}
              >
                <PrimaryButton type="submit" loading={loading}>
                  Create Account
                </PrimaryButton>
              </motion.div>
            </form>

            {/* Login */}
            <motion.div
              variants={itemVariants}
              className="mt-7 border-t border-slate-100 pt-5 text-center"
            >
              <p className="text-[14px] text-slate-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[#A6192E] transition-colors hover:text-[#7D1223] hover:underline focus:outline-none focus:ring-2 focus:ring-[#A6192E]/20"
                >
                  Sign in
                </Link>
              </p>
            </motion.div>
          </motion.div>

          {/* Footer */}
          <motion.div variants={itemVariants} className="mt-7 text-center">
            <div className="mb-2 flex items-center justify-center gap-2">
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-[#A6192E]"
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-[#F4C430]"
                animate={{
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              <span className="h-1.5 w-1.5 rounded-full bg-[#A6192E]/30" />
            </div>

            <p className="text-[11px] font-medium text-slate-400">
              Centralized Facility Reservation System
            </p>

            <p className="mt-1 text-[10px] text-slate-300">
              Bulacan State University
            </p>
          </motion.div>
        </section>
      </motion.div>
    </main>
  );
}
