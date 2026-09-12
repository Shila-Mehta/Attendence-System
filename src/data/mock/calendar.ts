export type DayType = "Teaching" | "Holiday" | "Non-Teaching";

export type DayOverride = {
  date: string;   // YYYY-MM-DD
  type: DayType;
  label?: string;
};

/**
 * Base rule (no override needed):
 *   Mon–Fri → Teaching
 *   Sat, Sun → Non-Teaching
 *
 * Overrides let Admin flip any day's type and attach a label.
 */
export const overrides: DayOverride[] = [
  { date: "2026-09-14", type: "Holiday",     label: "Public Holiday" },
  { date: "2026-09-23", type: "Non-Teaching", label: "Staff Training Day" },
  { date: "2026-10-05", type: "Holiday",     label: "Founder's Day" },
];