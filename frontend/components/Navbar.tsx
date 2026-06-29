"use client";
import Link from "next/link";
import { Home, MessageCircle, Mic, Briefcase, BookOpen, ShieldCheck, User } from "lucide-react";

const links = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/forum", label: "Forum", icon: MessageCircle },
  { href: "/medias", label: "Médias", icon: Mic },
  { href: "/emploi", label: "Emploi", icon: Briefcase },
  { href: "/education", label: "Éducation", icon: BookOpen },
  { href: "/profil", label: "Profil", icon: User },
  { href: "/services", label: "Services", icon: ShieldCheck },
];

export default function Navbar() {
  return (
    <header className="border-b-2 border-emerald-700 bg-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group min-w-[280px]">
          <img src="/logo.png" alt="Inclusif Sénégal" className="h-[120px] w-auto max-w-[300px] object-contain" />
        </Link>

        {/* Liens desktop */}
        <nav className="hidden md:flex items-center gap-1"> 
                 {links.map((l) => {
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-2 text-base text-gray-800 px-4 py-2.5 rounded-lg hover:bg-emerald-100 hover:text-emerald-900 transition-all font-semibold"
              >
                <Icon className="h-5 w-5" />
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/connexion" className="text-base text-gray-800 px-4 py-2.5 border-2 border-gray-800 rounded-lg hover:bg-gray-100 font-bold transition-colors">
            Se connecter
          </Link>
          <Link href="/inscription" className="text-base text-white px-5 py-2.5 bg-emerald-700 rounded-lg hover:bg-emerald-800 font-bold transition-colors shadow-md hover:shadow-lg">
            S'inscrire
          </Link>
        </div>

      </div>

    </header>
  );
}