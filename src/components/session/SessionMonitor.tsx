"use client";

import { useSessionMonitor } from "@/src/hooks/useSessionMonitor";

export function SessionMonitor() {
  useSessionMonitor();
  return null;
}
