"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Lock, Phone, ShieldCheck } from "lucide-react";

const schema = z.object({
  phone: z
    .string()
    .min(10, "Enter a valid phone number.")
    .max(15, "Enter a valid phone number.")
    .regex(/^[0-9+\-\s]+$/, "Only digits, spaces, + and - are allowed."),
  pin: z
    .string()
    .length(4, "PIN must be exactly 4 digits.")
    .regex(/^\d+$/, "PIN must contain digits only."),
});
type FormValues = z.infer<typeof schema>;

export default function ParentLoginPage() {
  const [showPin, setShowPin] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phone: "", pin: "" },
  });

  const onSubmit = async (values: FormValues) => {
    await new Promise((r) => setTimeout(r, 800));
    console.log("PARENT LOGIN (mock):", values);
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
            Stay close to your child&apos;s day.
          </h1>
          <p className="mt-3 text-sm text-white/70">
            See attendance, report absence, and get notified the moment your
            child is marked unexplained absent.
          </p>

          <ul className="mt-8 space-y-3 text-sm text-white/80">
            {[
              "View daily attendance at a glance",
              "Report sickness or appointments in seconds",
              "Instant alerts for unexplained absence",
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

          <h1 className="text-2xl font-semibold">Parent Login</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Use the phone number registered with the school.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
                Phone number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+92 300 1234567"
                  {...register("phone")}
                  className="w-full h-10 rounded-md border border-input bg-surface pl-9 pr-3 text-sm outline-none transition
                             focus:border-blue focus:ring-2 focus:ring-blue/20"
                />
              </div>
              {errors.phone && (
                <p className="mt-1.5 text-xs text-danger">{errors.phone.message}</p>
              )}
            </div>

            {/* PIN */}
            <div>
              <label htmlFor="pin" className="block text-sm font-medium mb-1.5">
                4-digit PIN
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="pin"
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={4}
                  placeholder="••••"
                  {...register("pin")}
                  className="w-full h-10 rounded-md border border-input bg-surface pl-9 pr-10 text-sm tracking-widest outline-none transition
                             focus:border-blue focus:ring-2 focus:ring-blue/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPin((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  {showPin ? "Hide" : "Show"}
                </button>
              </div>
              {errors.pin && (
                <p className="mt-1.5 text-xs text-danger">{errors.pin.message}</p>
              )}
            </div>

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

            <Link
              href="/staff-login"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              I&apos;m a staff member
            </Link>
          </form>
        </div>
      </section>
    </main>
  );
}