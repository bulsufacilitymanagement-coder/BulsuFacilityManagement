"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Building2, Users, Plus, Check, Upload } from "lucide-react";
import { InputField } from "@/components/ui/Fields/InputField";
import { PrimaryButton } from "@/components/ui/Buttons/PrimaryButton";
import { TextAreaField } from "@/components/ui/Fields/TextAreaField";
import { sileo } from "sileo";
import { createClient } from "@/lib/supabase/client";

interface AddCollegeSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const supabase = createClient();

export function AddCollegeSheet({ isOpen, onClose }: AddCollegeSheetProps) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    location: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleInputChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    const { data, error } = await supabase
      .from("colleges")
      .insert([
        {
          name: formData.name,
          code: formData.code,
          description: formData.description,
          location: formData.location,
        },
      ])
      .select();

    if (error) {
      sileo.error({
        title: "Saving Failed",
        description: (
          <span className="text-red-500/50! font-medium!">
            <p className="text-center">
              Something went wrong while saving. Try again.
            </p>
          </span>
        ),
      });

      return;
    }

    sileo.success({
      title: "College Created Successfully",
      description: (
        <span className="text-green-500/50! font-medium!">
          <p className="text-center">New college has been added.</p>
        </span>
      ),
    });

    console.log("ako yon", data);

    setIsSubmitting(false);
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
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
              className="relative flex w-screen flex-col border-l border-slate-200/80 bg-white shadow-2xl sm:w-[50vw] sm:max-w-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 sm:px-8 shadow-[0_10px_400px_-20px_#A6192E]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#A6192E]/[0.07] text-[#A6192E]">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#A6192E]">
                      Facility Management
                    </span>
                    <h2 className="text-[20px] font-bold text-slate-950">
                      Add New Facility
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:scale-95"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6"
              >
                {/* College Name */}
                <InputField
                  label="College Name"
                  name="collegeName"
                  value={formData.name}
                  placeholder="e.g. College of Information and Communications Technology"
                  onChange={(val) => handleInputChange("name", val)}
                />

                {/* College Code */}
                <InputField
                  label="College Code"
                  name="CollegeCode"
                  value={formData.name}
                  placeholder="e.g. CICT, CSSP"
                  onChange={(val) => handleInputChange("code", val)}
                />

                {/* Campus Location */}
                <InputField
                  label="Location"
                  name="location"
                  value={formData.location}
                  placeholder="e.g. Pimentel Hall, Mendoza Hall"
                  onChange={(val) => handleInputChange("location", val)}
                />

                {/* Amenities Selection */}
                <TextAreaField
                  label="Description"
                  name="description"
                  value={formData.description}
                  placeholder="Describe the college..."
                  onChange={(val) => handleInputChange("description", val)}
                />

                {/* Actions Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-[54px] w-32 rounded-[15px] border border-slate-200 px-5 text-[15px] font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <div className="w-44">
                    <PrimaryButton
                      type="submit"
                      loading={isSubmitting}
                      loadingText="Saving..."
                    >
                      Save College
                    </PrimaryButton>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
