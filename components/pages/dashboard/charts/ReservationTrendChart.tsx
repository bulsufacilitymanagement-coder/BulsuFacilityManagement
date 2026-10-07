"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ReservationTrendPoint } from "../types/dashboard";
import { ChartEmpty } from "./FacilitiesByTypeChart";

interface ReservationTrendChartProps {
  data: ReservationTrendPoint[];
  loading?: boolean;
}

export function ReservationTrendChart({
  data,
  loading = false,
}: ReservationTrendChartProps) {
  const total = data.reduce((sum, row) => sum + row.bookings, 0);

  return (
    <div className="rounded-[24px] border border-slate-200/70 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.03)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Last 14 days
          </p>

          <h2 className="mt-1 text-[18px] font-bold text-slate-950">
            Booking Activity
          </h2>
        </div>

        <span className="rounded-full bg-bulsu/[0.07] px-3 py-1 text-[12px] font-bold text-bulsu">
          {loading ? "…" : `${total} bookings`}
        </span>
      </div>

      {loading ? (
        <div className="mt-6 h-[220px] animate-pulse rounded-2xl bg-slate-100" />
      ) : total === 0 ? (
        <ChartEmpty message="No booking activity in the last 14 days." />
      ) : (
        <div
          className="mt-4 h-[220px] w-full"
          role="img"
          aria-label={`Area chart of bookings per day for the last 14 days, ${total} total`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="bookingFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a50011" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#a50011" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />

              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                interval={2}
              />

              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                }}
              />

              <Area
                type="monotone"
                dataKey="bookings"
                name="Bookings"
                stroke="#a50011"
                strokeWidth={2.5}
                fill="url(#bookingFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
