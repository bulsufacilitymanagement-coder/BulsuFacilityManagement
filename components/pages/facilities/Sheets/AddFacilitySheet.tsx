"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Building2, Users, Plus, Check, Upload } from "lucide-react";
import { InputField } from "@/components/ui/Fields/InputField";
import { PrimaryButton } from "@/components/ui/Buttons/PrimaryButton";
import { TextAreaField } from "@/components/ui/Fields/TextAreaField";
import { sileo } from "sileo";
import { createClient } from "@/lib/supabase/client";

interface AddFacilitySheetProps {
  collegeId: string;
  isOpen: boolean;
  onClose: () => void;
}

const supabase = createClient();

export function AddFacilitySheet({
  collegeId,
  isOpen,
  onClose,
}: AddFacilitySheetProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    capacity: "",
    location: "",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleInputChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    const { data, error } = await supabase
      .from("facilities")
      .insert([
        {
          college_id: collegeId,
          name: formData.name,
          type: formData.type,
          capacity: formData.capacity,
          location: formData.location,
          description: formData.description,
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
      title: "Facility Created Successfully",
      description: (
        <span className="text-green-500/50! font-medium!">
          <p className="text-center">New facility has been added.</p>
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
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 sm:px-8 shadow-[0_10px_400px_-20px_var(--color-bulsu)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-bulsu/[0.07] text-bulsu">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-bulsu">
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
                  aria-label="Close dialog"
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
                {/* Facility Name */}
                <InputField
                  label="Facility Name"
                  name="facilityName"
                  value={formData.name}
                  placeholder="e.g. CICT Multimedia Laboratory"
                  onChange={(val) => handleInputChange("name", val)}
                />

                {/* Category & Capacity (2 Columns on Desktop) */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="w-full">
                    <label
                      htmlFor="type"
                      className="mb-2 block text-[13px] font-semibold text-slate-700"
                    >
                      Type
                    </label>
                    <select
                      id="category"
                      value={formData.type}
                      onChange={(e) =>
                        handleInputChange("type", e.target.value)
                      }
                      className="
                        h-[52px]
                        w-full
                        rounded-[15px]
                        border
                        border-slate-200
                        bg-white
                        px-4
                        text-[16px]
                        text-slate-900
                        outline-none
                        shadow-[0_1px_2px_rgba(0,0,0,0.03)]
                        transition-all
                        duration-200
                        focus:border-bulsu
                        focus:ring-4
                        focus:ring-bulsu/10
                      "
                    >
                      <option value="">Select Type</option>
                      <option value="Auditorium">Auditorium</option>
                      <option value="Laboratoriy">Laboratory</option>
                      <option value="Conference Room">Conference Room</option>
                      <option value="Sports & Grounds">Sports & Grounds</option>
                    </select>
                  </div>

                  <InputField
                    label="Seating Capacity"
                    name="capacity"
                    value={formData.capacity}
                    placeholder="e.g. 50"
                    onChange={(val) => handleInputChange("capacity", val)}
                  />
                </div>

                {/* Campus Location */}
                <InputField
                  label="Location & Floor"
                  name="location"
                  value={formData.location}
                  placeholder="e.g. Pimentel Hall - 4th Floor"
                  onChange={(val) => handleInputChange("location", val)}
                />

                {/* Amenities Selection */}
                <TextAreaField
                  label="Description"
                  name="description"
                  value={formData.description}
                  placeholder="Describe the facility, its purpose, amenities, and any important details..."
                  onChange={(val) => handleInputChange("description", val)}
                />

                {/* Photo Upload Box */}
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-semibold text-slate-700">
                    Facility Preview Image
                  </label>
                  <div className="flex flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-slate-200 bg-white p-6 text-center transition-colors hover:border-bulsu/50 hover:bg-bulsu/[0.02]">
                    <Upload className="h-8 w-8 text-slate-400" />
                    <p className="mt-2 text-[13px] font-semibold text-slate-700">
                      Click to upload or drag image here
                    </p>
                    <p className="text-[11px] text-slate-400">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                </div>

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
                      Save Facility
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
