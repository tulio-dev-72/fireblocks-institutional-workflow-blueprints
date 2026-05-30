"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackProductEvent, type ProductEventName } from "@/lib/analytics";

const PAGE_EVENTS: Record<string, ProductEventName> = {
  "/": "homepage_viewed",
  "/operations": "operations_page_viewed",
  "/demo": "demo_dashboard_viewed",
  "/demo/policy": "policy_page_viewed",
};

export function PageViewTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastTracked.current === pathname) return;
    const event = PAGE_EVENTS[pathname];
    if (!event) return;
    lastTracked.current = pathname;
    trackProductEvent(event, { page: pathname, path: pathname });
  }, [pathname]);

  return null;
}
