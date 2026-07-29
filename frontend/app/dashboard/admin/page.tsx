"use client";

import AuthGuard from "@/components/AuthGuard";
import AdminField, { inputClass, selectClass, textareaClass } from "@/components/admin/AdminField";
import { useEffect, useState } from "react";
import { getDashboard, type DashboardData } from "@/services/dashboard";
import { getAllPodcasts, createPodcast, deletePodcast, type Podcast } from "@/services/podcasts";
import { getRessources, createRessource, deleteRessource, type Ressource } from "@/services/ressources";
import { getAnnuaireServices, createAnnuaireService, deleteAnnuaireService, type AnnuaireService } from "@/services/annuaire";
import { getPhotos, createPhoto, deletePhoto, type Photo } from "@/services/photos";
import { getExperts, createExpert, deleteExpert, type Expert } from "@/services/experts";
import {
  Users, MessageSquare, Mic, Briefcase, Plus, Trash2,
  BookOpen, Building2, Camera, GraduationCap, CheckCircle, HelpCircle
} from "lucide-react";

type Tab = "podcasts" | "guides" | "services" | "photos" | "experts";

const TABS: { id: Tab; label: string; icon: typeof Mic; desc: string; tip: string }[] = [
  { id: "podcasts", label: "Podcasts & vidéos", icon: Mic, desc: "Publier des épisodes audio ou vidéo", tip: "🎧 Ajoutez ici les enregistrements audio ou vidéo de vos émissions. Ils seront visibles sur la page Médias du site." },
  { id: "guides", label: "Guides éducatifs", icon: BookOpen, desc: "Articles et ressources pour la page Éducation", tip: "📚 Ajoutez des guides, brochures ou articles sur le handicap. Ils apparaissent dans la section Éducation." },
  { id: "services", label: "Annuaire services", icon: Building2, desc: "ANPPH, FAIS, centres de santé...", tip: "🏢 Référencez les organismes utiles aux personnes handicapées : institutions, centres de santé, aides juridiques..." },
  { id: "photos", label: "Galerie photos", icon: Camera, desc: "Images pour la page Médias", tip: "📸 Ajoutez des photos d’événements ou d’activités. Elles s’afficheront dans la galerie de la page Médias." },
  { id: "experts", label: "Experts", icon: GraduationCap, desc: "Médecins, avocats, spécialistes...", tip: "👨‍⚕️ Ajoutez les coordonnées d’experts (médecins, avocats, éducateurs). Ils seront visibles dans l’annuaire." },
];

const CATEGORIES_GUIDES = [
  { value: "accessibilite", label: "Accessibilité" },
  { value: "droits", label: "Droits & lois" },
  { value: "scolarisation", label: "Scolarisation" },
  { value: "donnees", label: "Données & statistiques" },
  { value: "sante", label: "Santé" },
];

const CATEGORIES_SERVICES = [
  { value: "institution", label: "Institution publique" },
  { value: "financier", label: "Aide financière" },
  { value: "sante", label: "Santé & réhabilitation" },
  { value: "education", label: "Éducation" },
  { value: "droits", label: "Aide juridique" },
  { value: "technique", label: "Aides techniques" },
];

function Message({ type, text }: { type: "ok" | "err"; text: string }) {
  return (
    <div className={`flex items-center gap-2 p-4 rounded-xl text-sm font-semibold ${
      type === "ok" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"
    }`}>
      {type === "ok" ? <CheckCircle size={18} /> : <HelpCircle size={18} />}
      {text}
    </div>
  );
}

function DeleteBtn({ onDelete, nom }: { onDelete: () => void; nom: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (window.confirm(`Voulez-vous vraiment supprimer « ${nom} » ?\n\nCette action est définitive.`)) {
          onDelete();
        }
      }}
      className="flex items-center gap-1.5 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold"
      title="Supprimer"
    >
      <Trash2 size={16} />
      Supprimer
    </button>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("podcasts");
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [ressources, setRessources] = useState<Ressource[]>([]);
  const [services, setServices] = useState<AnnuaireService[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Formulaires
  const [podcastForm, setPodcastForm] = useState({ titre: "", description: "", format: "audio" as "audio" | "video", media_url: "", couverture_url: "" });
  const [guideForm, setGuideForm] = useState({ titre: "", description: "", categorie: "droits", duree: "", niveau: "Tous niveaux", lien: "" });
  const [serviceForm, setServiceForm] = useState({ nom: "", sigle: "", categorie: "institution", description: "", missions: "", telephone: "", email: "", site: "", adresse: "", villes: "", horaires: "", gratuit: true });
  const [photoForm, setPhotoForm] = useState({ titre: "", lieu: "", image_url: "" });
  const [expertForm, setExpertForm] = useState({ nom: "", specialite: "", organisation: "", email: "", telephone: "", ville: "", photo_url: "" });

  const notify = (type: "ok" | "err", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const load = async () => {
    try {
      const [dash, pods, res, svc, pho, exp] = await Promise.all([
        getDashboard(),
        getAllPodcasts(),
        getRessources(),
        getAnnuaireServices(),
        getPhotos(),
        getExperts(),
      ]);
      setDashboard(dash);
      setPodcasts(pods);
      setRessources(res);
      setServices(svc);
      setPhotos(pho);
      setExperts(exp);
    } catch {
      notify("err", "Impossible de charger les données. Vérifiez que le serveur est démarré.");
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (fn: () => Promise<void>, successMsg: string) => {
    setSaving(true);
    try {
      await fn();
      setShowForm(false);
      notify("ok", successMsg);
      await load();
    } catch {
      notify("err", "Une erreur est survenue. Vérifiez que tous les champs obligatoires sont remplis.");
    } finally {
      setSaving(false);
    }
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    setShowForm(false);
    setMessage(null);
  };

  return (
    <AuthGuard allowedRoles={["admin"]}>
      <div className="max-w-4xl">
        <h1 className="text-2xl font-black text-gray-900 mb-1">Espace administrateur</h1>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Bienvenue ! Ici vous pouvez ajouter du contenu sur le site. Pas besoin de connaissances techniques —
          remplissez simplement les formulaires ci-dessous.
        </p>

        {/* Aide rapide */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-6 flex gap-3">
          <HelpCircle className="text-emerald-600 flex-shrink-0 mt-0.5" size={22} />
          <div className="text-sm text-emerald-900">
            <p className="font-bold mb-1">Besoin d&apos;aide pour un lien de fichier ?</p>
            <p className="leading-relaxed">
              Pour les podcasts, photos ou vidéos, demandez à votre équipe technique de mettre le fichier en ligne
              et de vous donner le <strong>lien (URL)</strong>. Collez ensuite ce lien dans le champ prévu.
            </p>
          </div>
        </div>

        {message && <div className="mb-6"><Message {...message} /></div>}

        {/* Statistiques */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Membres", value: dashboard?.stats.users_count, icon: Users },
            { label: "Forums", value: dashboard?.stats.forums_count, icon: MessageSquare },
            { label: "Offres", value: dashboard?.stats.jobs_count, icon: Briefcase },
            { label: "En attente", value: dashboard?.stats.posts_pending, icon: MessageSquare },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <Icon className="text-emerald-600 mx-auto mb-1" size={20} />
                <p className="text-xl font-black">{s.value ?? "—"}</p>
                <p className="text-xs text-gray-500 font-semibold">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Onglets */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => switchTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                  tab === t.id ? "bg-emerald-700 text-white shadow-md" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
        </div>

        <p className="text-sm text-gray-500 mb-2 font-semibold">
          {TABS.find((t) => t.id === tab)?.desc}
        </p>
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-6 leading-relaxed">
          {TABS.find((t) => t.id === tab)?.tip}
        </p>

        {/* ===== PODCASTS ===== */}
        {tab === "podcasts" && (
          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black">Podcasts & vidéos publiés ({podcasts.length})</h2>
              <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 text-white rounded-xl font-bold text-sm hover:bg-emerald-800">
                <Plus size={18} /> Ajouter un épisode
              </button>
            </div>

            {showForm && (
              <form onSubmit={(e) => { e.preventDefault(); handleSave(async () => { await createPodcast(podcastForm); setPodcastForm({ titre: "", description: "", format: "audio", media_url: "", couverture_url: "" }); }, "Épisode publié ! Il est visible sur la page Médias."); }} className="mb-6 p-5 bg-gray-50 rounded-2xl space-y-4 border border-gray-200">
                <AdminField label="Titre de l'épisode" required help="Exemple : « Vivre avec un handicap moteur à Dakar »">
                  <input required className={inputClass} value={podcastForm.titre} onChange={(e) => setPodcastForm({ ...podcastForm, titre: e.target.value })} placeholder="Donnez un titre clair" />
                </AdminField>
                <AdminField label="Description" help="Quelques phrases pour présenter l'épisode aux visiteurs.">
                  <textarea className={textareaClass} rows={3} value={podcastForm.description} onChange={(e) => setPodcastForm({ ...podcastForm, description: e.target.value })} placeholder="De quoi parle cet épisode ?" />
                </AdminField>
                <AdminField label="Type de média" required>
                  <select className={selectClass} value={podcastForm.format} onChange={(e) => setPodcastForm({ ...podcastForm, format: e.target.value as "audio" | "video" })}>
                    <option value="audio">🎙️ Audio (podcast)</option>
                    <option value="video">🎬 Vidéo</option>
                  </select>
                </AdminField>
                <AdminField label="Lien du fichier audio ou vidéo" required help="Collez ici le lien fourni par votre équipe technique après avoir mis le fichier en ligne.">
                  <input required className={inputClass} value={podcastForm.media_url} onChange={(e) => setPodcastForm({ ...podcastForm, media_url: e.target.value })} placeholder="https://..." />
                </AdminField>
                <AdminField label="Image de couverture (facultatif)" help="Une image qui s'affichera à côté de l'épisode.">
                  <input className={inputClass} value={podcastForm.couverture_url} onChange={(e) => setPodcastForm({ ...podcastForm, couverture_url: e.target.value })} placeholder="https://... (lien de l'image)" />
                </AdminField>
                <button type="submit" disabled={saving} className="w-full py-3.5 bg-emerald-700 text-white rounded-xl font-black text-base hover:bg-emerald-800 disabled:opacity-50">
                  {saving ? "Publication en cours..." : "✓ Publier sur le site"}
                </button>
              </form>
            )}

            <div className="space-y-3">
              {podcasts.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50">
                  <div>
                    <p className="font-bold">{p.titre}</p>
                    <p className="text-sm text-gray-500">{p.format === "video" ? "Vidéo" : "Audio"} · {new Date(p.cree_le).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(",", " à")}</p>
                  </div>
                  <DeleteBtn nom={p.titre} onDelete={() => deletePodcast(p.id).then(() => { notify("ok", "Épisode supprimé."); load(); })} />
                </div>
              ))}
              {podcasts.length === 0 && <p className="text-gray-500 text-center py-8">Aucun épisode pour le moment. Cliquez sur « Ajouter un épisode » pour commencer.</p>}
            </div>
          </section>
        )}

        {/* ===== GUIDES ===== */}
        {tab === "guides" && (
          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black">Guides éducatifs ({ressources.length})</h2>
              <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 text-white rounded-xl font-bold text-sm hover:bg-emerald-800">
                <Plus size={18} /> Ajouter un guide
              </button>
            </div>

            {showForm && (
              <form onSubmit={(e) => { e.preventDefault(); handleSave(async () => { await createRessource(guideForm); setGuideForm({ titre: "", description: "", categorie: "droits", duree: "", niveau: "Tous niveaux", lien: "" }); }, "Guide ajouté ! Visible sur la page Éducation."); }} className="mb-6 p-5 bg-gray-50 rounded-2xl space-y-4 border border-gray-200">
                <AdminField label="Titre du guide" required help="Exemple : « Guide pour obtenir la carte d'invalidité »">
                  <input required className={inputClass} value={guideForm.titre} onChange={(e) => setGuideForm({ ...guideForm, titre: e.target.value })} />
                </AdminField>
                <AdminField label="Résumé" required help="Décrivez en quelques phrases le contenu du guide.">
                  <textarea required className={textareaClass} rows={4} value={guideForm.description} onChange={(e) => setGuideForm({ ...guideForm, description: e.target.value })} />
                </AdminField>
                <AdminField label="Catégorie" required>
                  <select className={selectClass} value={guideForm.categorie} onChange={(e) => setGuideForm({ ...guideForm, categorie: e.target.value })}>
                    {CATEGORIES_GUIDES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </AdminField>
                <div className="grid sm:grid-cols-2 gap-4">
                  <AdminField label="Durée de lecture" help="Exemple : « 15 min »">
                    <input className={inputClass} value={guideForm.duree} onChange={(e) => setGuideForm({ ...guideForm, duree: e.target.value })} placeholder="15 min de lecture" />
                  </AdminField>
                  <AdminField label="Niveau">
                    <select className={selectClass} value={guideForm.niveau} onChange={(e) => setGuideForm({ ...guideForm, niveau: e.target.value })}>
                      <option>Tous niveaux</option>
                      <option>Débutant</option>
                      <option>Intermédiaire</option>
                      <option>Avancé</option>
                    </select>
                  </AdminField>
                </div>
                <AdminField label="Lien vers le document (facultatif)" help="Si le guide est un PDF ou une page web externe, collez le lien ici.">
                  <input className={inputClass} value={guideForm.lien} onChange={(e) => setGuideForm({ ...guideForm, lien: e.target.value })} placeholder="https://..." />
                </AdminField>
                <button type="submit" disabled={saving} className="w-full py-3.5 bg-emerald-700 text-white rounded-xl font-black disabled:opacity-50">
                  {saving ? "Enregistrement..." : "✓ Ajouter le guide"}
                </button>
              </form>
            )}

            <div className="space-y-3">
              {ressources.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-4 border rounded-xl">
                  <div>
                    <p className="font-bold">{r.titre}</p>
                    <p className="text-sm text-gray-500">{CATEGORIES_GUIDES.find((c) => c.value === r.categorie)?.label ?? r.categorie}</p>
                  </div>
                  <DeleteBtn nom={r.titre} onDelete={() => deleteRessource(r.id).then(() => { notify("ok", "Guide supprimé."); load(); })} />
                </div>
              ))}
              {ressources.length === 0 && <p className="text-gray-500 text-center py-8">Aucun guide. Ajoutez votre premier guide éducatif.</p>}
            </div>
          </section>
        )}

        {/* ===== SERVICES ===== */}
        {tab === "services" && (
          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black">Services référencés ({services.length})</h2>
              <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 text-white rounded-xl font-bold text-sm hover:bg-emerald-800">
                <Plus size={18} /> Ajouter un service
              </button>
            </div>

            {showForm && (
              <form onSubmit={(e) => { e.preventDefault(); handleSave(async () => { await createAnnuaireService(serviceForm); setServiceForm({ nom: "", sigle: "", categorie: "institution", description: "", missions: "", telephone: "", email: "", site: "", adresse: "", villes: "", horaires: "", gratuit: true }); }, "Service ajouté ! Visible sur la page Services."); }} className="mb-6 p-5 bg-gray-50 rounded-2xl space-y-4 border border-gray-200">
                <AdminField label="Nom complet du service" required help="Exemple : Agence Nationale pour la Promotion des Personnes Handicapées">
                  <input required className={inputClass} value={serviceForm.nom} onChange={(e) => setServiceForm({ ...serviceForm, nom: e.target.value })} />
                </AdminField>
                <div className="grid sm:grid-cols-2 gap-4">
                  <AdminField label="Sigle / Abréviation" help="Exemple : ANPPH">
                    <input className={inputClass} value={serviceForm.sigle} onChange={(e) => setServiceForm({ ...serviceForm, sigle: e.target.value })} />
                  </AdminField>
                  <AdminField label="Type de service" required>
                    <select className={selectClass} value={serviceForm.categorie} onChange={(e) => setServiceForm({ ...serviceForm, categorie: e.target.value })}>
                      {CATEGORIES_SERVICES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </AdminField>
                </div>
                <AdminField label="Description" required>
                  <textarea required className={textareaClass} rows={3} value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} />
                </AdminField>
                <AdminField label="Missions (une par ligne)" help="Écrivez chaque mission sur une ligne séparée.">
                  <textarea className={textareaClass} rows={4} value={serviceForm.missions} onChange={(e) => setServiceForm({ ...serviceForm, missions: e.target.value })} placeholder={"Délivrance de la carte d'invalidité\nCoordination des politiques d'inclusion"} />
                </AdminField>
                <div className="grid sm:grid-cols-2 gap-4">
                  <AdminField label="Téléphone"><input className={inputClass} value={serviceForm.telephone} onChange={(e) => setServiceForm({ ...serviceForm, telephone: e.target.value })} placeholder="+221 33 ..." /></AdminField>
                  <AdminField label="Email"><input type="email" className={inputClass} value={serviceForm.email} onChange={(e) => setServiceForm({ ...serviceForm, email: e.target.value })} /></AdminField>
                  <AdminField label="Site web"><input className={inputClass} value={serviceForm.site} onChange={(e) => setServiceForm({ ...serviceForm, site: e.target.value })} placeholder="https://..." /></AdminField>
                  <AdminField label="Adresse"><input className={inputClass} value={serviceForm.adresse} onChange={(e) => setServiceForm({ ...serviceForm, adresse: e.target.value })} /></AdminField>
                  <AdminField label="Villes (séparées par des virgules)" help="Exemple : Dakar, Thiès, Saint-Louis"><input className={inputClass} value={serviceForm.villes} onChange={(e) => setServiceForm({ ...serviceForm, villes: e.target.value })} /></AdminField>
                  <AdminField label="Horaires d'ouverture"><input className={inputClass} value={serviceForm.horaires} onChange={(e) => setServiceForm({ ...serviceForm, horaires: e.target.value })} placeholder="Lun–Ven · 8h–17h" /></AdminField>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={serviceForm.gratuit} onChange={(e) => setServiceForm({ ...serviceForm, gratuit: e.target.checked })} className="w-5 h-5 rounded" />
                  <span className="text-sm font-bold text-gray-700">Ce service est gratuit</span>
                </label>
                <button type="submit" disabled={saving} className="w-full py-3.5 bg-emerald-700 text-white rounded-xl font-black disabled:opacity-50">
                  {saving ? "Enregistrement..." : "✓ Ajouter le service"}
                </button>
              </form>
            )}

            <div className="space-y-3">
              {services.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-4 border rounded-xl">
                  <div>
                    <p className="font-bold">{s.sigle ? `${s.sigle} — ` : ""}{s.nom}</p>
                    <p className="text-sm text-gray-500">{CATEGORIES_SERVICES.find((c) => c.value === s.categorie)?.label ?? s.categorie}</p>
                  </div>
                  <DeleteBtn nom={s.nom} onDelete={() => deleteAnnuaireService(s.id).then(() => { notify("ok", "Service supprimé."); load(); })} />
                </div>
              ))}
              {services.length === 0 && <p className="text-gray-500 text-center py-8">Aucun service. Ajoutez l&apos;ANPPH, le FAIS ou d&apos;autres organismes.</p>}
            </div>
          </section>
        )}

        {/* ===== PHOTOS ===== */}
        {tab === "photos" && (
          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black">Photos de la galerie ({photos.length})</h2>
              <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 text-white rounded-xl font-bold text-sm hover:bg-emerald-800">
                <Plus size={18} /> Ajouter une photo
              </button>
            </div>

            {showForm && (
              <form onSubmit={(e) => { e.preventDefault(); handleSave(async () => { await createPhoto(photoForm); setPhotoForm({ titre: "", lieu: "", image_url: "" }); }, "Photo ajoutée ! Visible dans la galerie Médias."); }} className="mb-6 p-5 bg-gray-50 rounded-2xl space-y-4 border border-gray-200">
                <AdminField label="Titre de la photo" required help="Exemple : « Forum d'inclusion 2025 »">
                  <input required className={inputClass} value={photoForm.titre} onChange={(e) => setPhotoForm({ ...photoForm, titre: e.target.value })} />
                </AdminField>
                <AdminField label="Lieu" help="Exemple : Dakar, Thiès...">
                  <input className={inputClass} value={photoForm.lieu} onChange={(e) => setPhotoForm({ ...photoForm, lieu: e.target.value })} />
                </AdminField>
                <AdminField label="Lien de l'image" required help="Collez le lien de la photo fourni par votre équipe technique.">
                  <input required className={inputClass} value={photoForm.image_url} onChange={(e) => setPhotoForm({ ...photoForm, image_url: e.target.value })} placeholder="https://..." />
                </AdminField>
                {photoForm.image_url && (
                  <div className="rounded-xl overflow-hidden border max-w-xs">
                    <img src={photoForm.image_url} alt="Aperçu" className="w-full h-40 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <p className="text-xs text-gray-500 p-2">Aperçu de l&apos;image</p>
                  </div>
                )}
                <button type="submit" disabled={saving} className="w-full py-3.5 bg-emerald-700 text-white rounded-xl font-black disabled:opacity-50">
                  {saving ? "Enregistrement..." : "✓ Ajouter la photo"}
                </button>
              </form>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
              {photos.map((p) => (
                <div key={p.id} className="border rounded-xl overflow-hidden">
                  <img src={p.image_url} alt={p.titre} className="w-full h-32 object-cover" />
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">{p.titre}</p>
                      {p.lieu && <p className="text-xs text-gray-500">{p.lieu}</p>}
                    </div>
                    <DeleteBtn nom={p.titre} onDelete={() => deletePhoto(p.id).then(() => { notify("ok", "Photo supprimée."); load(); })} />
                  </div>
                </div>
              ))}
            </div>
            {photos.length === 0 && <p className="text-gray-500 text-center py-8">Galerie vide. Ajoutez des photos d&apos;événements ou d&apos;activités.</p>}
          </section>
        )}

        {/* ===== EXPERTS ===== */}
        {tab === "experts" && (
          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black">Experts référencés ({experts.length})</h2>
              <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 text-white rounded-xl font-bold text-sm hover:bg-emerald-800">
                <Plus size={18} /> Ajouter un expert
              </button>
            </div>

            {showForm && (
              <form onSubmit={(e) => { e.preventDefault(); handleSave(async () => { await createExpert(expertForm); setExpertForm({ nom: "", specialite: "", organisation: "", email: "", telephone: "", ville: "", photo_url: "" }); }, "Expert ajouté ! Visible dans l'annuaire Éducation."); }} className="mb-6 p-5 bg-gray-50 rounded-2xl space-y-4 border border-gray-200">
                <AdminField label="Nom complet" required help="Exemple : Dr. Kébé Ibrahima">
                  <input required className={inputClass} value={expertForm.nom} onChange={(e) => setExpertForm({ ...expertForm, nom: e.target.value })} />
                </AdminField>
                <AdminField label="Spécialité" required help="Exemple : Médecin en réhabilitation, Avocat droit du handicap...">
                  <input required className={inputClass} value={expertForm.specialite} onChange={(e) => setExpertForm({ ...expertForm, specialite: e.target.value })} />
                </AdminField>
                <div className="grid sm:grid-cols-2 gap-4">
                  <AdminField label="Organisation"><input className={inputClass} value={expertForm.organisation} onChange={(e) => setExpertForm({ ...expertForm, organisation: e.target.value })} /></AdminField>
                  <AdminField label="Ville"><input className={inputClass} value={expertForm.ville} onChange={(e) => setExpertForm({ ...expertForm, ville: e.target.value })} placeholder="Dakar" /></AdminField>
                  <AdminField label="Email de contact"><input type="email" className={inputClass} value={expertForm.email} onChange={(e) => setExpertForm({ ...expertForm, email: e.target.value })} /></AdminField>
                  <AdminField label="Téléphone"><input className={inputClass} value={expertForm.telephone} onChange={(e) => setExpertForm({ ...expertForm, telephone: e.target.value })} placeholder="+221 77 ..." /></AdminField>
                </div>
                <AdminField label="Photo (lien, facultatif)"><input className={inputClass} value={expertForm.photo_url} onChange={(e) => setExpertForm({ ...expertForm, photo_url: e.target.value })} placeholder="https://..." /></AdminField>
                <button type="submit" disabled={saving} className="w-full py-3.5 bg-emerald-700 text-white rounded-xl font-black disabled:opacity-50">
                  {saving ? "Enregistrement..." : "✓ Ajouter l'expert"}
                </button>
              </form>
            )}

            <div className="space-y-3">
              {experts.map((ex) => (
                <div key={ex.id} className="flex items-center justify-between p-4 border rounded-xl">
                  <div>
                    <p className="font-bold">{ex.nom}</p>
                    <p className="text-sm text-gray-500">{ex.specialite}{ex.ville ? ` · ${ex.ville}` : ""}</p>
                  </div>
                  <DeleteBtn nom={ex.nom} onDelete={() => deleteExpert(ex.id).then(() => { notify("ok", "Expert supprimé."); load(); })} />
                </div>
              ))}
              {experts.length === 0 && <p className="text-gray-500 text-center py-8">Aucun expert. Ajoutez des spécialistes à l&apos;annuaire.</p>}
            </div>
          </section>
        )}
      </div>
    </AuthGuard>
  );
}
