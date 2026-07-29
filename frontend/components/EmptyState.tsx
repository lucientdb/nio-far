"use client";

import { LucideIcon, Inbox } from "lucide-react";
import Link from "next/link";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
};

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  message,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-14 text-center">
      {/* Icône */}
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Icon size={32} className="text-gray-300" />
      </div>

      {/* Titre */}
      <h3 className="text-lg font-black text-gray-900 mb-2">{title}</h3>

      {/* Message */}
      <p className="text-base font-semibold text-gray-500 mb-6 max-w-md mx-auto">
        {message}
      </p>

      {/* Action (optionnelle) */}
      {(actionLabel && (actionHref || onAction)) && (
        <>
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-2 bg-emerald-700 text-white font-bold text-base px-6 py-3 rounded-xl hover:bg-emerald-800 transition-all hover:shadow-lg"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 bg-emerald-700 text-white font-bold text-base px-6 py-3 rounded-xl hover:bg-emerald-800 transition-all hover:shadow-lg"
            >
              {actionLabel}
            </button>
          )}
        </>
      )}
    </div>
  );
}
