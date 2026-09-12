"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  remember: z.boolean().optional(),
});
type FormValues = z.infer<typeof schema>;

/* =========================================================
   Demo roles — one-click login for sharing/demo purposes
   ========================================================= */

const DEMO_ROLES = [
  {
    label: "Admin",
    email: "admin@school.edu",
    destination: "/admin",
    description: "Roster, staff, classes, calendar",
  },
  {
    label: "Office",
    email: "office@school.edu",
    destination: "/office/live-attendance",
    description: "Live attendance, corrections, front desk",
  },
  {
    label: "Principal",
    email: "principal@school.edu",
    destination: "/principal/dashboard",
    description: "School-wide KPIs and drill-down",
  },
  {
    label: "Teacher",
    email: "teacher@school.edu",
    destination: "/attendance/roll-call",
    description: "Morning roll call and review",
  },
] as const;

export default function StaffLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    await new Promise((r) => setTimeout(r, 700));

    const email = values.email.toLowerCase();
    let destination = "/admin";
    if (email.includes("office")) destination = "/office/live-attendance";
    else if (email.includes("principal")) destination = "/principal/dashboard";
    else if (email.includes("teacher")) destination = "/attendance/roll-call";

    console.log("STAFF LOGIN (mock):", { ...values, destination });
    router.push(destination);
  };

  /* One-click demo login */
  const demoLogin = async (role: (typeof DEMO_ROLES)[number]) => {
    setDemoLoading(role.label);
    setValue("email", role.email);
    setValue("password", "password");
    await new Promise((r) => setTimeout(r, 400));
    router.push(role.destination);
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* ================= Left: brand panel ================= */}
      <aside className="hidden lg:flex flex-col justify-between bg-navy text-white p-10">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-white/10 grid place-items-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">AttendEase</span>
        </div>

        <div className="max-w-md">
          <h1 className="text-3xl font-semibold leading-tight">
            Attendance, without the paperwork.
          </h1>
          <p className="mt-3 text-sm text-white/70">
            Mark roll call, review submissions, and keep every parent informed —
            all from one dashboard.
          </p>

          <ul className="mt-8 space-y-3 text-sm text-white/80">
            {[
              "Morning roll call in under a minute",
              "Live attendance board for the office",
              "Automatic parent alerts for unexplained absence",
            ].map((line) => (
              <li key={line} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue" />
                {line}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-white/40">
          © {new Date().getFullYear()} AttendEase. All rights reserved.
        </p>
      </aside>

      {/* ================= Right: form + demo ================= */}
      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-navy text-white grid place-items-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">AttendEase</span>
          </div>

          <h1 className="text-2xl font-semibold">Staff Login</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in with your school email address.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@school.edu"
                {...register("email")}
                className="w-full h-10 rounded-md border border-input bg-surface px-3 text-sm outline-none transition
                           focus:border-blue focus:ring-2 focus:ring-blue/20"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-danger">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <Link href="#" className="text-xs text-blue hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="w-full h-10 rounded-md border border-input bg-surface px-3 pr-10 text-sm outline-none transition
                             focus:border-blue focus:ring-2 focus:ring-blue/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-danger">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember */}
            <label className="flex items-center gap-2 text-sm select-none">
              <input
                type="checkbox"
                {...register("remember")}
                className="h-4 w-4 rounded border-input accent-blue"
              />
              Remember me on this device
            </label>

            {serverError && (
              <div className="rounded-md border border-danger/30 bg-danger-light text-danger px-3 py-2 text-xs">
                {serverError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 rounded-md bg-blue text-white text-sm font-medium
                         hover:bg-navy transition disabled:opacity-60 disabled:cursor-not-allowed
                         inline-flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Signing in…" : "Login"}
            </button>
          </form>

          {/* ================= One-click demo ================= */}
          <div className="mt-6 rounded-lg border border-dashed border-border bg-muted/20 p-4">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3">
              Demo — tap a role to sign in instantly
            </div>

            <div className="space-y-2">
              {DEMO_ROLES.map((role) => (
                <button
                  key={role.label}
                  type="button"
                  disabled={demoLoading !== null}
                  onClick={() => demoLogin(role)}
                  className="group w-full flex items-center gap-3 rounded-md border border-border bg-surface px-3 py-2.5 text-left transition
                             hover:border-blue/40 hover:bg-blue-light/40
                             disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="h-8 w-8 rounded-md bg-navy text-white grid place-items-center text-[11px] font-semibold shrink-0">
                    {role.label[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">
                      {role.label}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {role.description}
                    </div>
                  </div>
                  {demoLoading === role.label ? (
                    <Loader2 className="h-4 w-4 animate-spin text-blue shrink-0" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-blue group-hover:translate-x-0.5 transition-all shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <div className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
              These buttons are for demo only. Real authentication will replace
              them.
            </div>
          </div>

          <p className="mt-6 text-xs text-muted-foreground text-center">
            Are you a parent?{" "}
            <Link href="/parent-login" className="text-blue hover:underline">
              Use the parent login
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}