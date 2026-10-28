"use client";

import { useRouter } from "next/navigation";
import { buttonVariants } from "@/shared/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/shared/utils/utils";

export function BackButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={cn(
        buttonVariants({ variant: "outline", size: "icon" }),
        "rounded-full cursor-pointer",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4" />
    </button>
  );
}

