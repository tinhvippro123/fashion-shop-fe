import * as React from "react";
import { cn } from "@/shared/utils/utils";

export type StatusTone =
  | "neutral"
  | "dark"
  | "success"
  | "warning"
  | "danger"
  | "info";

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: StatusTone;
  dot?: boolean;
  size?: "sm" | "md";
}

const DOT_STYLES: Record<StatusTone, string> = {
  neutral: "bg-neutral-400 dark:bg-neutral-500",
  dark: "bg-neutral-900 dark:bg-neutral-100",
  success: "bg-emerald-600 dark:bg-emerald-500",
  warning: "bg-amber-600 dark:bg-amber-500",
  danger: "bg-[#b5121b] dark:bg-red-500",
  info: "bg-neutral-600 dark:bg-neutral-400",
};

const TEXT_STYLES: Record<StatusTone, string> = {
  neutral: "text-neutral-600 dark:text-neutral-400",
  dark: "text-neutral-900 dark:text-neutral-100",
  success: "text-neutral-800 dark:text-neutral-200",
  warning: "text-neutral-800 dark:text-neutral-200",
  danger: "text-[#9f121b] dark:text-red-400",
  info: "text-neutral-800 dark:text-neutral-200",
};

export function StatusBadge({
  tone = "neutral",
  dot = true,
  size = "md",
  className,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 font-medium whitespace-nowrap leading-none",
        size === "sm" ? "px-2 py-1 text-[11px]" : "px-2.5 py-1 text-xs",
        TEXT_STYLES[tone],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full shrink-0", DOT_STYLES[tone])}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  );
}
