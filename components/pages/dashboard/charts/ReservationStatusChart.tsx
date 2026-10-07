"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { ReservationStatusCount } from "../types/dashboard";
import { ChartEmpty } from "./FacilitiesByTypeChart";

// Donut colors follow the app status language (see AGENTS.md §5).
const STATUS_COLORS: Record<string, string> = {
  confirmed: "#a50011",
  pending: "#f1a926",
  checked_in: "#059669",
  cancelled: "#94a3b8",
  no_show: "#dc2626",
  rejected: "#475569",
};

function statusColor(status: string) {
  return STATUS_COLORS[status.toLowerCase()] ?? "#64748b";
}

interface ReservationStatusChartProps {
  data: ReservationStatusCount[];
  loading?: boolean;
}

export function ReservationStatusChart({
  data,
  loading = false,
}: ReservationStatusChartProps) {
  const total = data.reduce((sum, row) => sum + row.count, 0);

  return (
    <div className="rounded-[24px] border border-slate-200/70 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.03)]">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Demand
        </p>

        <h2 className="mt-1 text-[18px] font-bold text-slate-950">
          Reservations by Status
        </h2>
      </div>

      {loading ? (
        <div className="mt-4 h-[260px] animate-pulse rounded-2xl bg-slate-100" />
      ) : data.length === 0 ? (
        <ChartEmpty message="No reservations yet. New requests will appear here by status." />
      ) : (
        <>
          <div
            className="relative mx-auto mt-2 h-[220px] w-full max-w-[300px]"
            role="img"
            aria-label={`Donut chart of reservations by status, ${total} total`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />

                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={64}
                  outerRadius={88}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {data.map((row) => (
                    <Cell key={row.status} fill={statusColor(row.status)} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center total keeps the headline number readable at a glance. */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[32px] font-bold tracking-tight text-slate-950">
                {total}
              </span>

              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                bookings
              </span>
            </div>
          </div>

          {/* Text legend (never color-only for WCAG). */}
          <div className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-2">
            {data.map((row) => (
              <div key={row.status} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: statusColor(row.status) }}
                />

                <span className="text-[12px] font-medium capitalize text-slate-500">
                  {row.status} · {row.count}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
