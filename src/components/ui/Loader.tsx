"use client";

import { Loader2 } from "lucide-react";

/* =========================================================
   Loader — matches AttendEase theme
   ---------------------------------------------------------
   <Loader />                       inline spinner
   <Loader size="sm" />             small (16px)
   <Loader size="lg" />             large (32px)
   <Loader label="Loading…" />      spinner + label
   <LoaderButton />                 full-width button loading state
   <FullPageLoader />               overlay for page transitions
   <SkeletonRows rows={5} />        placeholder rows for tables
   ========================================================= */

export function Loader({
  size = "md",
  tone = "blue",
  label,
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  tone?: "blue" | "white" | "muted" | "navy";
  label?: string;
  className?: string;
}) {
  const sizeCls =
    size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-8 w-8" : "h-5 w-5";

  const toneCls =
    tone === "white"
      ? "text-white"
      : tone === "muted"
      ? "text-muted-foreground"
      : tone === "navy"
      ? "text-navy"
      : "text-blue";

  return (
    <span
      className={`inline-flex items-center gap-2 ${toneCls} ${className}`}
      role="status"
      aria-live="polite"
    >
      <Loader2 className={`${sizeCls} animate-spin`} />
      {label && <span className="text-sm">{label}</span>}
    </span>
  );
}

/* =========================================================
   Full-page loader — for page transitions / data fetches
   ========================================================= */

export function FullPageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm">
      <div className="h-12 w-12 rounded-full bg-blue-light text-blue border border-blue/20 grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

/* =========================================================
   Skeleton placeholders — for tables and lists
   ========================================================= */

export function SkeletonRow({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-muted/60 h-4 ${className}`} />
  );
}

export function SkeletonRows({
  rows = 5,
  className = "",
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} className="h-10" />
      ))}
    </div>
  );
}

/* =========================================================
   Card skeleton — for KPI card placeholders
   ========================================================= */

export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="animate-pulse h-3 w-16 rounded bg-muted/60" />
      <div className="animate-pulse mt-2 h-6 w-12 rounded bg-muted/60" />
      <div className="animate-pulse mt-2 h-2 w-20 rounded bg-muted/60" />
    </div>
  );
}

export function SkeletonCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}