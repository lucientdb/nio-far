"use client";

import Link from "next/link";
import { UserPlus, LogIn, Lock } from "lucide-react";

type AuthPromptProps = {
  title?: string;
  message?: string;
  feature?: string;
};

export default function AuthPrompt({
  title = "Connexion requise",
  message = "Vous devez être connecté pour accéder à cette fonctionnalité.",
  feature,
}: AuthPromptProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border-2 border-gray-200 p-8 text-center shadow-lg">
        {/* Icône */}
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock size={28} className="text-emerald-700" />
        </div>

        {/* Titre */}
        <h2 className="text-2xl font-black text-gray-900 mb-3">{title}</h2>

        {/* Message */}
        <p className="text-base font-semibold text-gray-600 leading-relaxed mb-2">
          {message}
        </p>

        {feature && (
          <p className="text-sm font-semibold text-gray-500 mb-6">
            {feature}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <Link
            href="/inscription"
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-700 text-white font-bold text-base px-6 py-3.5 rounded-xl hover:bg-emerald-800 transition-all hover:shadow-lg"
          >
            <UserPlus size={18} />
            Créer un compte
          </Link>
          <Link
            href="/connexion"
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-900 font-bold text-base px-6 py-3.5 rounded-xl hover:bg-gray-200 transition-all"
          >
            <LogIn size={18} />
            Se connecter
          </Link>
        </div>

        {/* Avantages */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Pourquoi s&apos;inscrire ?
          </p>
          <ul className="text-sm font-semibold text-gray-600 space-y-2 text-left">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full flex-shrink-0"></span>
              Accès à toutes les fonctionnalités
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full flex-shrink-0"></span>
              Participer au forum et aux discussions
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full flex-shrink-0"></span>
              Postuler aux offres d&apos;emploi
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full flex-shrink-0"></span>
              Contacter les experts
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
