"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDashboard, type DashboardData } from "@/services/dashboard";
import { getMyPosts } from "@/services/forums";
import type { Post } from "@/services/forums";
import { MessageSquare, Clock, CheckCircle, AlertCircle } from "lucide-react";

export default function UserDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    getDashboard().then(setDashboard).catch(console.error);
    getMyPosts().then(setPosts).catch(console.error);
  }, []);

  const pending = posts.filter((p) => p.statut === "en_attente");
  const approved = posts.filter((p) => p.statut === "approuve");

  return (
    <div>
      <h1 className="text-2xl font-black text-gray-900 mb-2">Mon espace</h1>
      <p className="text-gray-500 mb-8">Suivez vos publications et demandes d&apos;approbation.</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Mes posts", value: dashboard?.stats.my_posts_count ?? 0, icon: MessageSquare, color: "emerald" },
          { label: "En attente", value: dashboard?.stats.posts_pending ?? 0, icon: Clock, color: "amber" },
          { label: "Approuvés", value: dashboard?.stats.posts_approved ?? 0, icon: CheckCircle, color: "green" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-${s.color}-50 flex items-center justify-center`}>
                  <Icon className={`text-${s.color}-600`} size={20} />
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900">{s.value}</p>
                  <p className="text-sm text-gray-500 font-semibold">{s.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {pending.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="text-amber-500" size={20} />
            En attente d&apos;approbation
          </h2>
          <div className="space-y-3">
            {pending.map((p) => (
              <div key={p.id} className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="font-bold text-gray-900">{p.titre}</p>
                <p className="text-sm text-gray-500">Forum : {p.forum_titre}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-gray-900">Mes publications</h2>
          <Link href="/forum" className="text-sm font-bold text-emerald-700 hover:underline">
            Aller au forum →
          </Link>
        </div>
        <div className="space-y-3">
          {approved.length === 0 && pending.length === 0 && (
            <p className="text-gray-500">Aucune publication pour le moment.</p>
          )}
          {[...approved, ...pending].map((p) => (
            <Link
              key={p.id}
              href={`/forum/post/${p.id}`}
              className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-emerald-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <p className="font-bold text-gray-900">{p.titre}</p>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  p.statut === "approuve" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                }`}>
                  {p.statut === "approuve" ? "Publié" : "En attente"}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1 line-clamp-1">{p.contenu}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
