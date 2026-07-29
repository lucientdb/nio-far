"use client";

import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getStoredUser, ROLE_LABELS } from "@/lib/auth";
import {
  LayoutDashboard, MessageSquare, Briefcase, LogOut, Mic, User
} from "lucide-react";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

const navByRole: Record<string, { href: string; label: string; icon: typeof LayoutDashboard }[]> = {
  admin: [
    { href: "/dashboard/admin", label: "Gérer le contenu", icon: LayoutDashboard },
    { href: "/medias", label: "Podcasts & médias", icon: Mic },
    { href: "/forum", label: "Forum", icon: MessageSquare },
  ],
  expert: [
    { href: "/dashboard/expert", label: "Mes forums", icon: LayoutDashboard },
    { href: "/forum", label: "Forum public", icon: MessageSquare },
  ],
  entreprise: [
    { href: "/dashboard/recruteur", label: "Mes offres", icon: LayoutDashboard },
    { href: "/emploi", label: "Voir les offres", icon: Briefcase },
  ],
  ong: [
    { href: "/dashboard/recruteur", label: "Mes offres", icon: LayoutDashboard },
    { href: "/emploi", label: "Voir les offres", icon: Briefcase },
  ],
  user: [
    { href: "/dashboard", label: "Mon espace", icon: LayoutDashboard },
    { href: "/forum", label: "Forum", icon: MessageSquare },
    { href: "/emploi", label: "Emploi", icon: Briefcase },
  ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = getStoredUser();
  const role = user?.role ?? "user";
  const nav = navByRole[role] ?? navByRole.user;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-24">
              <div className="mb-6">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Dashboard</p>
                <p className="font-black text-gray-900 mt-1">
                  {user?.prenom} {user?.nom}
                </p>
                <p className="text-sm text-gray-500">{ROLE_LABELS[role]}</p>
              </div>
              <nav className="space-y-1">
                {nav.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                        active
                          ? "bg-emerald-50 text-emerald-800"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
                <Link
                  href="/profil"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                    pathname === "/profil"
                      ? "bg-emerald-50 text-emerald-800"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <User size={18} />
                  Mon profil
                </Link>

                {role === "admin" && (
                  <p className="mt-4 px-3 py-2 bg-amber-50 rounded-xl text-xs text-amber-800 font-semibold leading-relaxed">
                    Utilisez « Gérer le contenu » pour ajouter podcasts, guides, services et photos.
                  </p>
                )}
              </nav>
              <button
                onClick={handleLogout}
                className="mt-6 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} />
                Déconnexion
              </button>
            </div>
          </aside>
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
