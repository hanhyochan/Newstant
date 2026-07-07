"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { getNewsrollPortalRoot } from "@/features/shared/newsroll-portal-root";

export function ClientPortal({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return createPortal(children, getNewsrollPortalRoot() ?? document.body);
}
