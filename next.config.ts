import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev only: lets a phone on the same Wi-Fi load the dev server through the
  // Mac's LAN address. Update it if `ipconfig getifaddr en0` changes.
  allowedDevOrigins: ["192.168.254.146"],
};

export default nextConfig;
