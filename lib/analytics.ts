"use client";

import { track } from "@vercel/analytics";

export const TRACKED_EVENTS = [
  "homepage_viewed",
  "operations_page_viewed",
  "demo_login",
  "demo_dashboard_viewed",
  "settlement_created",
  "approval_action",
  "policy_page_viewed",
  "fireblocks_status_checked",
] as const;

export type ProductEventName = (typeof TRACKED_EVENTS)[number];

const LOCAL_EVENT_LOG_KEY = "tcc_analytics_events";
const LOCAL_EVENT_LOG_LIMIT = 100;

const BLOCKED_PROPERTY_KEYS =
  /api[_-]?key|secret|token|password|prompt|question|transaction|wallet|address|payload|private|credential|amount|destination|email|user_id/i;

const SAFE_METADATA_KEYS = new Set([
  "page",
  "role",
  "action",
  "workflow_type",
  "connected",
  "status",
  "source",
  "step",
  "tab",
  "path",
]);

export interface LocalAnalyticsEvent {
  event: ProductEventName;
  timestamp: string;
  page?: string;
  role?: string;
  action?: string;
  workflow_type?: string;
  connected?: boolean;
  status?: string;
  step?: string;
  path?: string;
}

function sanitizeProperties(
  properties: Record<string, unknown>,
): Record<string, string | number | boolean> {
  const safe: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (BLOCKED_PROPERTY_KEYS.test(key)) continue;
    if (!SAFE_METADATA_KEYS.has(key)) continue;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      safe[key] = value;
    }
  }
  return safe;
}

function readLocalEvents(): LocalAnalyticsEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(LOCAL_EVENT_LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalAnalyticsEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function appendLocalEvent(event: LocalAnalyticsEvent) {
  if (typeof window === "undefined") return;
  const next = [event, ...readLocalEvents()].slice(0, LOCAL_EVENT_LOG_LIMIT);
  try {
    window.sessionStorage.setItem(LOCAL_EVENT_LOG_KEY, JSON.stringify(next));
  } catch {
    // Ignore quota errors.
  }
}

export function trackProductEvent(
  event: ProductEventName,
  properties?: Record<string, unknown>,
) {
  const timestamp = new Date().toISOString();
  const safeProps = sanitizeProperties(properties ?? {});
  appendLocalEvent({ event, timestamp, ...safeProps } as LocalAnalyticsEvent);

  if (process.env.NODE_ENV === "production") {
    track(event, safeProps);
  }
}

export function getLocalEventLog(): LocalAnalyticsEvent[] {
  return readLocalEvents();
}
