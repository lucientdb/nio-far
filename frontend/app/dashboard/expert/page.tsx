"use client";

import AuthGuard from "@/components/AuthGuard";
import { useEffect, useState } from "react";
import {
  getMyForums, createForum, getPendingPosts,
  approvePost, rejectPost, type Forum, type Post
} from "@/services/forums";
import { getDashboard, type DashboardData } from "@/services/dashboard";
import { Plus, Check, X, MessageSquare } from "lucide-react";

export default function ExpertDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [forums, setForums] = useState<Forum[]>([]);
  const [pending, setPending] = useState<Post[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");

  const load = async () => {
    getDashboard().then(setDashboard).catch(console.error);
    const f = await getMyForums();
    setForums(f);
    const allPending: Post[] = [];
    for (const forum of f) {
      const posts = await getPendingPosts(forum.id);
      allPending.push(...posts);
    }
    setPending(allPending);
  };

  useEffect(() => { load(); }, []);

  const handleCreateForum = async (e: React.FormEvent) => {
    e.preventDefault();
    await createForum(titre, description);
    setShowForm(false);
    setTitre("");
    setDescription("");
    load();
  };

  return (
    <AuthGuard allowedRoles={["expert"]}>
      <div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Espace Expert</h1>
        <p className="text-gray-500 mb-8">Gérez vos forums et approuvez les publications des membres.</p>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Mes forums", value: dashboard?.stats.forums_count ?? 0 },
            { label: "En attente", value: dashboard?.stats.posts_pending ?? 0 },
            { label: "Mes posts", value: dashboard?.stats.my_posts_count ?? 0 },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-sm text-gray-500 font-semibold">{s.label}</p>
            </div>
          ))}
        </div>

        {pending.length > 0 && (
          <section className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <h2 className="text-lg font-black mb-4">Demandes d&apos;approbation ({pending.length})</h2>
            <div className="space-y-4">
              {pending.map((p) => (
                <div key={p.id} className="bg-white rounded-xl p-4 border">
                  <p className="font-bold">{p.titre}</p>
                  <p className="text-sm text-gray-500 mb-2">
                    Par {p.auteur.prenom} {p.auteur.nom} · {p.forum_titre}
                  </p>
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">{p.contenu}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => approvePost(p.id).then(load)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-bold"
                    >
                      <Check size={14} /> Approuver
                    </button>
                    <button
                      onClick={() => rejectPost(p.id).then(load)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-bold"
                    >
                      <X size={14} /> Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black flex items-center gap-2">
              <MessageSquare size={20} className="text-emerald-600" />
              Mes forums
            </h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-xl font-bold text-sm"
            >
              <Plus size={16} />
              Créer un forum
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleCreateForum} className="mb-6 p-4 bg-gray-50 rounded-xl space-y-3">
              <input
                required
                placeholder="Titre du forum"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <button type="submit" className="px-6 py-2 bg-emerald-700 text-white rounded-lg font-bold">
                Créer
              </button>
            </form>
          )}

          <div className="space-y-3">
            {forums.map((f) => (
              <div key={f.id} className="p-4 border rounded-xl">
                <p className="font-bold">{f.titre}</p>
                <p className="text-sm text-gray-500">{f.description}</p>
                <p className="text-xs text-amber-600 font-bold mt-2">
                  {f.pending_count ?? 0} en attente · {f.posts_count} posts
                </p>
              </div>
            ))}
            {forums.length === 0 && <p className="text-gray-500">Créez votre premier forum.</p>}
          </div>
        </section>
      </div>
    </AuthGuard>
  );
}
