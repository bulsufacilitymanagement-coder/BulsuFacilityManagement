import type { LucideIcon } from "lucide-react";

// Slim row shapes used only for dashboard aggregation (not full entities).
export interface FacilitySummary {
  id: string;
  name: string;
  type: string;
  status: string;
  college_id: string | null;
}

export interface ReservationSummary {
  id: number;
  purpose: string;
  status: string;
  start_time: string;
  end_time: string;
  user_id: string;
  facility_id: string;
}

// One summary card in the stats grid.
export interface DashboardStat {
  label: string;
  value: string;
  subtext: string;
  icon: LucideIcon;
  tone: "bulsu" | "gold" | "green" | "slate";
}

// Bars for the facilities-by-type chart.
export interface FacilityTypeCount {
  type: string;
  count: number;
}

// Slices for the reservation-status donut.
export interface ReservationStatusCount {
  status: string;
  count: number;
}

// One point of the 14-day booking trend.
export interface ReservationTrendPoint {
  day: string;
  bookings: number;
}

// A single quick-action tile linking to an existing route.
export interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tone: "bulsu" | "gold" | "dark";
}
