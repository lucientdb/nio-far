"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

type ErrorDisplayProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export default function ErrorDisplay({
  title = "Une erreur est survenue",
  message,
  onRetry,
  retryLabel = "Réessayer",
}: ErrorDisplayProps) {
  return (
    <div className="min-h-[40vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border-2 border-red-200 p-8 text-center">
        {/* Icône */}
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={28} className="text-red-500" />
        </div>

        {/* Titre */}
        <h2 className="text-xl font-black text-gray-900 mb-3">{title}</h2>

        {/* Message */}
        <p className="text-base font-semibold text-gray-600 leading-relaxed mb-6">
          {message}
        </p>

        {/* Bouton retry */}
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 bg-emerald-700 text-white font-bold text-base px-6 py-3 rounded-xl hover:bg-emerald-800 transition-all hover:shadow-lg"
          >
            <RefreshCw size={18} />
            {retryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
