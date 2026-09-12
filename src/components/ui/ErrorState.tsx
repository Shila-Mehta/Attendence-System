import { AlertTriangle, RefreshCw } from "lucide-react";

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this data. Please try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="h-12 w-12 rounded-full bg-danger-light text-danger grid place-items-center mb-3">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">
        {description}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 h-9 px-4 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition inline-flex items-center gap-2"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </button>
      )}
    </div>
  );
}