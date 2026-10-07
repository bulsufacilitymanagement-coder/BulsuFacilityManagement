import React from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock3,
  MapPin,
  ArrowRight,
  Sparkles,
  Building2,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Plus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Dashboard from "@/components/pages/dashboard/Dashboard";

const stats = [
  {
    label: "Active Bookings",
    value: "03",
    subtext: "2 Pending Approval",
    icon: CalendarDays,
    color: "text-bulsu",
    bg: "bg-bulsu/[0.07]",
  },
  {
    label: "Approved Requests",
    value: "12",
    subtext: "This semester",
    icon: CheckCircle2,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  {
    label: "Available Venues",
    value: "18",
    subtext: "Main & Annex",
    icon: Building2,
    color: "text-amber-600",
    bg: "bg-gold/20",
  },
];

const activeReservations = [
  {
    id: "RES-2026-089",
    facility: "University Conference Room",
    campus: "Main Campus • Valencia Hall",
    date: "March 18, 2026",
    time: "9:00 AM – 12:00 PM",
    status: "Pending Approval",
    statusTone: "amber",
  },
  {
    id: "RES-2026-074",
    facility: "CICT Computer Laboratory 3",
    campus: "Main Campus • College of ICT",
    date: "March 22, 2026",
    time: "1:00 PM – 4:00 PM",
    status: "Confirmed",
    statusTone: "emerald",
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <Dashboard user={user.user_metadata} />;
}
