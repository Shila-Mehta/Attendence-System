"use client";

import { useMemo, useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Download,
  RotateCcw,
  PartyPopper,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  sampleFileName,
  sampleRows,
  validateRows,
  type CsvValidation,
} from "@/data/mock/csv";

type Step = "upload" | "validate" | "commit" | "done";

export default function CsvImportPage() {
  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState<string>("");

  const validations = useMemo<CsvValidation[]>(
    () => (fileName ? validateRows(sampleRows) : []),
    [fileName]
  );

  const summary = useMemo(() => {
    const valid = validations.filter((v) => v.errors.length === 0);
    const invalid = validations.filter((v) => v.errors.length > 0);
    return {
      total: validations.length,
      valid,
      invalid,
      withWarnings: validations.filter((v) => v.warnings.length > 0).length,
    };
  }, [validations]);

  const handleUpload = () => {
    setFileName(sampleFileName);
    setStep("validate");
  };

  const handleCommit = () => setStep("done");

  const reset = () => {
    setStep("upload");
    setFileName("");
  };

  return (
    <PageContainer
      title="CSV Roster Import"
      description="Upload, validate and commit student, class and contact data."
    >
      <Stepper step={step} />

      <div className="mt-6">
        {step === "upload" && <UploadStep onUpload={handleUpload} />}
        {step === "validate" && (
          <ValidateStep
            fileName={fileName}
            validations={validations}
            summary={summary}
            onBack={reset}
            onNext={() => setStep("commit")}
          />
        )}
        {step === "commit" && (
          <CommitStep
            summary={summary}
            onBack={() => setStep("validate")}
            onCommit={handleCommit}
          />
        )}
        {step === "done" && (
          <DoneStep summary={summary} onReset={reset} />
        )}
      </div>
    </PageContainer>
  );
}

/* ---------------- stepper ---------------- */

const STEPS: { key: Step; label: string }[] = [
  { key: "upload", label: "Upload" },
  { key: "validate", label: "Validate" },
  { key: "commit", label: "Commit" },
  { key: "done", label: "Done" },
];

function Stepper({ step }: { step: Step }) {
  const currentIdx = STEPS.findIndex((s) => s.key === step);
  return (
    <ol className="flex items-center gap-3 flex-wrap">
      {STEPS.map((s, i) => {
        const state =
          i < currentIdx ? "done" : i === currentIdx ? "active" : "pending";
        return (
          <li key={s.key} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`h-7 w-7 rounded-full grid place-items-center text-xs font-semibold ${
                  state === "done"
                    ? "bg-success text-white"
                    : state === "active"
                    ? "bg-blue text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {state === "done" ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={`text-sm ${
                  state === "pending" ? "text-muted-foreground" : "font-medium"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span className="text-muted-foreground/40">—</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ---------------- Step 1: upload ---------------- */

function UploadStep({ onUpload }: { onUpload: () => void }) {
  const [dragging, setDragging] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-surface p-6 sm:p-10">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          onUpload();
        }}
        className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-12 text-center transition ${
          dragging
            ? "border-blue bg-blue-light"
            : "border-border bg-muted/20"
        }`}
      >
        <div className="h-12 w-12 rounded-full bg-blue-light text-blue grid place-items-center">
          <Upload className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-medium">
            Drop your CSV file here
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            or use the button below · .csv only · max 5 MB
          </div>
        </div>
        <button
          onClick={onUpload}
          className="mt-2 h-9 px-4 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition inline-flex items-center gap-2"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Choose file
        </button>
        <div className="text-[11px] text-muted-foreground mt-2">
          (Mock — will use a sample file when you click)
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-md border border-border bg-muted/20 p-4">
        <Download className="h-4 w-4 text-muted-foreground mt-0.5" />
        <div className="text-sm">
          <div className="font-medium">Need a template?</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Download the roster CSV template to see the required columns:
            <span className="font-mono">
              {" "}
              student_id, student_name, grade, class, guardian_name, guardian_phone,
              guardian_email
            </span>
          </div>
          <button className="mt-2 text-xs text-blue hover:underline">
            Download template.csv
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Step 2: validate ---------------- */

function ValidateStep({
  fileName,
  validations,
  summary,
  onBack,
  onNext,
}: {
  fileName: string;
  validations: CsvValidation[];
  summary: {
    total: number;
    valid: CsvValidation[];
    invalid: CsvValidation[];
    withWarnings: number;
  };
  onBack: () => void;
  onNext: () => void;
}) {
  const [filter, setFilter] = useState<"all" | "valid" | "invalid">("all");

  const rows = validations.filter((v) => {
    if (filter === "valid") return v.errors.length === 0;
    if (filter === "invalid") return v.errors.length > 0;
    return true;
  });

  return (
    <div>
      {/* File header */}
      <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 mb-4">
        <FileSpreadsheet className="h-4 w-4 text-blue" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{fileName}</div>
          <div className="text-xs text-muted-foreground">
            {summary.total} rows detected
          </div>
        </div>
        <button
          onClick={onBack}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Change file
        </button>
      </div>

      {/* Summary chips */}
      <div className="grid gap-3 sm:grid-cols-3 mb-4">
        <SummaryChip
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Ready to import"
          value={summary.valid.length}
        />
        <SummaryChip
          tone="danger"
          icon={<XCircle className="h-4 w-4" />}
          label="With errors"
          value={summary.invalid.length}
        />
        <SummaryChip
          tone="warning"
          icon={<AlertTriangle className="h-4 w-4" />}
          label="With warnings"
          value={summary.withWarnings}
        />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-3">
        <FilterTab active={filter === "all"} onClick={() => setFilter("all")}>
          All ({validations.length})
        </FilterTab>
        <FilterTab active={filter === "valid"} onClick={() => setFilter("valid")}>
          Valid ({summary.valid.length})
        </FilterTab>
        <FilterTab active={filter === "invalid"} onClick={() => setFilter("invalid")}>
          Errors ({summary.invalid.length})
        </FilterTab>
      </div>

      {/* Preview table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium w-12">Row</th>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Grade</th>
              <th className="px-4 py-3 font-medium">Class</th>
              <th className="px-4 py-3 font-medium">Guardian</th>
              <th className="px-4 py-3 font-medium">Issues</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No rows to display.
                </td>
              </tr>
            ) : (
              rows.map((v) => {
                const hasErrors = v.errors.length > 0;
                return (
                  <tr
                    key={v.row.rowNumber}
                    className={`border-t border-border ${
                      hasErrors ? "bg-danger-light/30" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {v.row.rowNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="leading-tight">
                        <div className="font-medium">
                          {v.row.studentName || (
                            <span className="text-danger italic">missing</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {v.row.studentId || (
                            <span className="text-danger italic">no id</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          v.errors.some((e) => e.startsWith("Unknown grade"))
                            ? "text-danger"
                            : ""
                        }
                      >
                        {v.row.grade || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          v.errors.some((e) => e.startsWith("Unknown class"))
                            ? "text-danger"
                            : ""
                        }
                      >
                        {v.row.className || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="leading-tight">
                        <div>{v.row.guardianName || "—"}</div>
                        <div className="text-xs text-muted-foreground">
                          {v.row.guardianPhone || "—"}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <IssueList errors={v.errors} warnings={v.warnings} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="h-9 px-3 rounded-md border border-border text-sm hover:bg-muted inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex items-center gap-3">
          {summary.invalid.length > 0 && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {summary.invalid.length} rows with errors will be skipped.
            </span>
          )}
          <button
            onClick={onNext}
            disabled={summary.valid.length === 0}
            className="h-9 px-4 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryChip({
  tone,
  icon,
  label,
  value,
}: {
  tone: "success" | "danger" | "warning";
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  const cls =
    tone === "success"
      ? "border-success/30 bg-success-light text-success"
      : tone === "danger"
      ? "border-danger/30 bg-danger-light text-danger"
      : "border-warning/30 bg-warning-light text-warning";

  return (
    <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${cls}`}>
      <span className="shrink-0">{icon}</span>
      <div>
        <div className="text-lg font-semibold leading-none">{value}</div>
        <div className="text-xs mt-0.5">{label}</div>
      </div>
    </div>
  );
}

function FilterTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-8 px-3 rounded-md text-xs font-medium transition ${
        active ? "bg-navy text-white" : "text-muted-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

function IssueList({
  errors,
  warnings,
}: {
  errors: string[];
  warnings: string[];
}) {
  if (errors.length === 0 && warnings.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-success">
        <CheckCircle2 className="h-3.5 w-3.5" />
        OK
      </span>
    );
  }
  return (
    <ul className="space-y-0.5 text-xs">
      {errors.map((e) => (
        <li key={e} className="flex items-start gap-1 text-danger">
          <XCircle className="h-3 w-3 mt-0.5 shrink-0" />
          {e}
        </li>
      ))}
      {warnings.map((w) => (
        <li key={w} className="flex items-start gap-1 text-warning">
          <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
          {w}
        </li>
      ))}
    </ul>
  );
}

/* ---------------- Step 3: commit ---------------- */

function CommitStep({
  summary,
  onBack,
  onCommit,
}: {
  summary: {
    total: number;
    valid: CsvValidation[];
    invalid: CsvValidation[];
  };
  onBack: () => void;
  onCommit: () => void;
}) {
  const newStudents = summary.valid.filter(
    (v) => !["ST001", "ST002", "ST003"].includes(v.row.studentId)
  ).length;

  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <h2 className="text-base font-semibold">Ready to commit</h2>
      <p className="text-sm text-muted-foreground mt-1">
        Review the summary below. Once committed, these changes cannot be undone
        in this mock.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <SummaryRow
          label="Students to import"
          value={summary.valid.length}
          tone="success"
        />
        <SummaryRow
          label="New student records"
          value={newStudents}
          tone="success"
        />
        <SummaryRow
          label="Skipped (with errors)"
          value={summary.invalid.length}
          tone="danger"
        />
        <SummaryRow
          label="Contacts to create"
          value={summary.valid.length}
          tone="default"
        />
      </div>

      <div className="mt-5 rounded-md border border-warning/30 bg-warning-light text-warning px-4 py-3 text-xs">
        <div className="flex items-center gap-2 font-medium">
          <AlertTriangle className="h-3.5 w-3.5" />
          Heads up
        </div>
        <div className="mt-1 text-warning/90">
          Rows with errors will be skipped. Fix them in your CSV and re-import
          those rows later. This is a mock — nothing is actually saved.
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="h-9 px-3 rounded-md border border-border text-sm hover:bg-muted inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={onCommit}
          className="h-9 px-4 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition inline-flex items-center gap-2"
        >
          <CheckCircle2 className="h-4 w-4" />
          Commit import
        </button>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "danger" | "default";
}) {
  const valueCls =
    tone === "success"
      ? "text-success"
      : tone === "danger"
      ? "text-danger"
      : "text-foreground";
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-background px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-lg font-semibold ${valueCls}`}>{value}</span>
    </div>
  );
}

/* ---------------- Step 4: done ---------------- */

function DoneStep({
  summary,
  onReset,
}: {
  summary: {
    valid: CsvValidation[];
    invalid: CsvValidation[];
  };
  onReset: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-10 text-center">
      <div className="mx-auto h-14 w-14 rounded-full bg-success-light text-success grid place-items-center">
        <PartyPopper className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">Import complete</h2>
      <p className="text-sm text-muted-foreground mt-1">
        Successfully imported{" "}
        <strong className="text-foreground">{summary.valid.length}</strong>{" "}
        student{summary.valid.length === 1 ? "" : "s"}.
        {summary.invalid.length > 0 && (
          <>
            {" "}
            <strong className="text-danger">
              {summary.invalid.length}
            </strong>{" "}
            row{summary.invalid.length === 1 ? " was" : "s were"} skipped due to
            errors.
          </>
        )}
      </p>
      <div className="mt-6 flex items-center justify-center gap-2">
        <button
          onClick={onReset}
          className="h-9 px-4 rounded-md border border-border text-sm hover:bg-muted inline-flex items-center gap-1.5"
        >
          <RotateCcw className="h-4 w-4" />
          Import another file
        </button>
      </div>
    </div>
  );
}