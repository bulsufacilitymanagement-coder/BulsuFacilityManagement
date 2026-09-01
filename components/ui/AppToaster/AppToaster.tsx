"use client";

import { Toaster } from "sileo";

export default function AppToaster() {
  return (
    <div className="absolute top-0 z-100">
      <Toaster
        offset={{ top: 10 }}
        position="top-center"
        options={{ fill: "#171717" }}
      />
    </div>
  );
}
