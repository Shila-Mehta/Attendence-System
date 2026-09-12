"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  remember: z.boolean().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function StaffLoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = async (values: FormValues) => {
    await new Promise((r) => setTimeout(r, 800));
    console.log("STAFF LOGIN (mock):", values);
    alert("Mock login — backend not connected yet.");
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left: brand panel */}
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

      {/* Right: form */}
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

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
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
                <p className="mt-1.5 text-xs text-danger">{errors.email.message}</p>
              )}
            </div>

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
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-danger">
                  {errors.password.message}
                </p>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm select-none">
              <input
                type="checkbox"
                {...register("remember")}
                className="h-4 w-4 rounded border-input accent-blue"
              />
              Remember me on this device
            </label>

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