"use client";

import AuthGuard from "@/components/AuthGuard";
import { useEffect, useState } from "react";
import { getMyJobs, createJob, deleteJob, type Job } from "@/services/jobs";
import { getDashboard, type DashboardData } from "@/services/dashboard";
import { Plus, Trash2, Briefcase } from "lucide-react";

export default function RecruteurDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    titre: "",
    entreprise: "",
    description: "",
    lieu: "",
    type_contrat: "CDI",
  });

  const load = () => {
    getDashboard().then(setDashboard).catch(console.error);
    getMyJobs().then(setJobs).catch(console.error);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createJob(form);
    setShowForm(false);
    setForm({ titre: "", entreprise: "", description: "", lieu: "", type_contrat: "CDI" });
    load();
  };

  return (
    <AuthGuard allowedRoles={["entreprise", "ong"]}>
      <div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Espace Recruteur</h1>
        <p className="text-gray-500 mb-8">Publiez et gérez vos offres d&apos;emploi.</p>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <Briefcase className="text-emerald-600 mb-2" size={22} />
            <p className="text-2xl font-black">{dashboard?.stats.jobs_active ?? 0}</p>
            <p className="text-sm text-gray-500 font-semibold">Offres actives</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-2xl font-black">{dashboard?.stats.jobs_total ?? 0}</p>
            <p className="text-sm text-gray-500 font-semibold">Total publiées</p>
          </div>
        </div>

        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black">Mes offres</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-xl font-bold text-sm"
            >
              <Plus size={16} />
              Publier une offre
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleCreate} className="mb-6 p-4 bg-gray-50 rounded-xl space-y-3">
              <input required placeholder="Titre du poste" value={form.titre}
                onChange={(e) => setForm({ ...form, titre: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg" />
              <input required placeholder="Entreprise / Organisation" value={form.entreprise}
                onChange={(e) => setForm({ ...form, entreprise: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg" />
              <textarea required placeholder="Description" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg" rows={4} />
              <input placeholder="Lieu" value={form.lieu}
                onChange={(e) => setForm({ ...form, lieu: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg" />
              <select value={form.type_contrat}
                onChange={(e) => setForm({ ...form, type_contrat: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg">
                <option>CDI</option><option>CDD</option><option>Stage</option><option>Bénévolat</option>
              </select>
              <button type="submit" className="px-6 py-2 bg-emerald-700 text-white rounded-lg font-bold">
                Publier
              </button>
            </form>
          )}

          <div className="space-y-3">
            {jobs.map((j) => (
              <div key={j.id} className="flex items-center justify-between p-4 border rounded-xl">
                <div>
                  <p className="font-bold">{j.titre}</p>
                  <p className="text-sm text-gray-500">{j.entreprise} · {j.lieu} · {j.type_contrat}</p>
                  <span className={`text-xs font-bold ${j.est_actif ? "text-green-600" : "text-gray-400"}`}>
                    {j.est_actif ? "Active" : "Inactive"}
                  </span>
                </div>
                <button onClick={() => deleteJob(j.id).then(load)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {jobs.length === 0 && <p className="text-gray-500">Aucune offre publiée.</p>}
          </div>
        </section>
      </div>
    </AuthGuard>
  );
}
