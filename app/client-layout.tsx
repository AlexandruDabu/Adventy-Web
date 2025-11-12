"use client";

import type React from "react";

import { Analytics } from "@vercel/analytics/next";
import SnowEffect from "@/components/snow-effect";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SnowEffect />
      {children}
      <Analytics />
    </>
  );
}
