"use client";

import { Loader2 } from "lucide-react";

type LoadingSpinnerProps = {
  message?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
};

export default function LoadingSpinner({
  message = "Chargement...",
  size = "md",
  fullScreen = false,
}: LoadingSpinnerProps) {
  const iconSizes = {
    sm: 20,
    md: 32,
    lg: 48,
  };

  const containerClass = fullScreen
    ? "min-h-screen flex items-center justify-center bg-gray-50"
    : "min-h-[40vh] flex items-center justify-center p-6";

  return (
    <div className={containerClass}>
      <div className="text-center">
        <Loader2
          size={iconSizes[size]}
          className="text-emerald-600 mx-auto mb-4 animate-spin"
        />
        <p className="text-base font-semibold text-gray-600">{message}</p>
      </div>
    </div>
  );
}
