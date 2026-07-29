"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Heart, Plus, Search, X, ChevronRight, Quote,
  MapPin, Briefcase, GraduationCap, Users, Filter,
  ArrowRight, Star, CheckCircle, AlertCircle
} from "lucide-react";
import {
  getTemoignages, getTemoignageStats, getServices,
  createTemoignage, serviceLabel,
  type Temoignage as ApiTemoignage,
} from "@/services/temoignages";
import { isAuthenticated } from "@/lib/auth";

// ---- Types ----
type Temoignage = {
  id: number;
  initiales: string;
  nom: string;
  age: number;
  ville: string;
  handicap: string;
  profession: string;
  texte: string;
  texteCourt: string;
  tags: string[];
  avatarBg: string;
  liked: boolean;
  likes: number;
  date: string;
  verifie: boolean;
  note?: number;
  service?: string;
  titre?: string;
};

function apiToDisplay(t: ApiTemoignage): Temoignage {
  const initiales = `${t.auteur.prenom?.[0] ?? ""}${t.auteur.nom?.[0] ?? ""}`.toUpperCase();
  return {
    id: t.id,
    initiales,
    nom: `${t.auteur.prenom} ${t.auteur.nom?.[0]}.`,
    age: 0,
    ville: "",
    handicap: "",
    profession: serviceLabel(t.service),
    texte: t.contenu,
    texteCourt: t.contenu.slice(0, 120) + (t.contenu.length > 120 ? "..." : ""),
    tags: t.service ? [serviceLabel(t.service)] : [],
    avatarBg: "bg-emerald-100 text-emerald-800",
    liked: false,
    likes: t.note ?? 0,
    date: new Date(t.cree_le).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(",", " à"),
    verifie: true,
    note: t.note,
    service: t.service,
    titre: t.titre,
  };
}

// ---- Modal partage témoignage ----
function ModalPartage({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const router = useRouter();
  const [services, setServices] = useState<{ id: string; label: string }[]>([]);
  const [form, setForm] = useState({
    titre: "",
    contenu: "",
    service: "forum",
    note: 5,
  });
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    getServices().then(setServices).catch(console.error);
  }, []);

  const handleSubmit = async () => {
    if (!isAuthenticated()) {
      router.push("/connexion");
      return;
    }
    if (form.contenu.trim().length < 20) {
      setErreur("Votre témoignage doit contenir au moins 20 caractères.");
      return;
    }
    setLoading(true);
    setErreur("");
    try {
      await createTemoignage({
        titre: form.titre || `Avis sur ${serviceLabel(form.service)}`,
        contenu: form.contenu,
        note: form.note,
        service: form.service,
      });
      onSuccess();
      onClose();
    } catch {
      setErreur("Erreur lors de l'envoi. Vérifiez que vous êtes connecté.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-7 py-5 border-b-2 border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-black text-gray-900">Noter un service & témoigner</h2>
            <p className="text-sm font-semibold text-gray-400 mt-0.5">Partagez votre expérience sur la plateforme</p>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="px-7 py-6 flex flex-col gap-5">
          {erreur && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold">
              <AlertCircle size={16} /> {erreur}
            </div>
          )}

          <div>
            <label className="text-sm font-black text-gray-700 mb-2 block">Service évalué</label>
            <select
              value={form.service}
              onChange={(e) => setForm((p) => ({ ...p, service: e.target.value }))}
              className="w-full text-base border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-900 font-semibold"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-black text-gray-700 mb-2 block">Votre note</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, note: n }))}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={n <= form.note ? "text-amber-400 fill-amber-400" : "text-gray-200"}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1 font-semibold">{form.note}/5 étoiles</p>
          </div>

          <div>
            <label className="text-sm font-black text-gray-700 mb-2 block">Titre (optionnel)</label>
            <input
              value={form.titre}
              onChange={(e) => setForm((p) => ({ ...p, titre: e.target.value }))}
              placeholder="Ex. Une plateforme qui m'a vraiment aidé"
              className="w-full text-base border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-900 font-semibold"
            />
          </div>

          <div>
            <label className="text-sm font-black text-gray-700 mb-2 block">Votre témoignage</label>
            <textarea
              value={form.contenu}
              onChange={(e) => setForm((p) => ({ ...p, contenu: e.target.value }))}
              placeholder="Décrivez comment ce service vous a aidé, ce que vous en pensez..."
              rows={5}
              className="w-full text-base border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-900 resize-none font-semibold"
            />
            <p className="text-sm text-gray-400 mt-1 font-semibold">{form.contenu.length} caractères (min. 20)</p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || form.contenu.trim().length < 20}
            className="w-full bg-gray-900 text-white font-black text-base py-3.5 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <CheckCircle size={18} />
            {loading ? "Envoi..." : "Publier mon témoignage"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Carte témoignage ----
function TemoignageCard({
  t,
  onLike,
  expanded,
  onToggle,
}: {
  t: Temoignage;
  onLike: (id: number) => void;
  expanded: boolean;
  onToggle: (id: number) => void;
}) {
  return (
    <article className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-gray-400 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-base font-black flex-shrink-0 ${t.avatarBg}`}>
          {t.initiales}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-black text-gray-900">{t.nom}</span>
            {t.note && (
              <span className="flex items-center gap-0.5 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                {Array.from({ length: t.note }).map((_, i) => (
                  <Star key={i} size={10} className="fill-amber-400 text-amber-400" />
                ))}
              </span>
            )}
            {t.verifie && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircle size={11} /> Vérifié
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-sm font-semibold text-gray-500">
              <MapPin size={13} /> {t.ville}
            </span>
            <span className="text-gray-300">·</span>
            <span className="flex items-center gap-1 text-sm font-semibold text-gray-500">
              <Briefcase size={13} /> {t.profession}
            </span>
          </div>
          <p className="text-sm font-bold text-gray-400 mt-0.5">{t.handicap} · {t.age} ans</p>
        </div>
        <span className="text-xs font-bold text-gray-300 flex-shrink-0">{t.date}</span>
      </div>

      {/* Citation */}
      <div className="relative">
        <Quote size={28} className="text-gray-100 absolute -top-2 -left-1" />
        <p className="text-base font-semibold text-gray-700 leading-relaxed pl-6 italic">
          {expanded ? t.texte : t.texteCourt}
        </p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {t.tags.map((tag) => (
          <span key={tag} className="text-sm font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-600">
            {tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t-2 border-gray-100">
        <button
          onClick={() => onLike(t.id)}
          aria-label={t.liked ? "Retirer le j'aime" : "J'aime ce témoignage"}
          className={`flex items-center gap-2 text-sm font-black transition-all ${t.liked ? "text-emerald-600" : "text-gray-400 hover:text-emerald-600"}`}
        >
          <Heart size={18} className={t.liked ? "fill-emerald-500" : ""} />
          {t.likes + (t.liked ? 1 : 0)} personnes aidées
        </button>
        <button
          onClick={() => onToggle(t.id)}
          className="flex items-center gap-1.5 text-sm font-black text-gray-500 hover:text-gray-900 transition-colors"
        >
          {expanded ? "Réduire" : "Lire tout"}
          <ChevronRight size={15} className={`transition-transform ${expanded ? "rotate-90" : ""}`} />
        </button>
      </div>
    </article>
  );
}

// ---- Page principale ----
export default function TemoignagesPage() {
  const router = useRouter();
  const [temoignages, setTemoignages] = useState<Temoignage[]>([]);
  const [stats, setStats] = useState<{ count: number; moyenne: number; servicesCount: number }>({
    count: 0,
    moyenne: 0,
    servicesCount: 0,
  });
  const [modal, setModal] = useState(false);
  const [recherche, setRecherche] = useState("");
  const [tagActif, setTagActif] = useState("Tous");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getTemoignages()
      .then((data) => setTemoignages(data.map(apiToDisplay)))
      .catch(() => setTemoignages([]))
      .finally(() => setLoading(false));
    getTemoignageStats()
      .then((s) => {
        const total = s.par_service.reduce((a, b) => a + b.count, 0);
        const avg = s.par_service.length
          ? s.par_service.reduce((a, b) => a + b.moyenne * b.count, 0) / total
          : 0;
        setStats({
          count: total,
          moyenne: Math.round(avg * 10) / 10,
          servicesCount: s.par_service.length,
        });
      })
      .catch(console.error);
  };

  useEffect(() => { load(); }, []);

  const allTags = ["Tous", "Forum", "Emploi", "Éducation", "Médias", "Services"];

  const handleLike = (id: number) => {
    setTemoignages(prev => prev.map(t => t.id === id ? { ...t, liked: !t.liked } : t));
  };

  const handleToggle = (id: number) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const filtres = temoignages
    .filter(t => tagActif === "Tous" || t.tags.includes(tagActif))
    .filter(t => !recherche || t.nom.toLowerCase().includes(recherche.toLowerCase()) || t.texte.toLowerCase().includes(recherche.toLowerCase()) || t.tags.some(tag => tag.toLowerCase().includes(recherche.toLowerCase())));

  const featured = tagActif === "Tous" && !recherche ? temoignages[0] : undefined;
  const featuredMeta = featured ? [featured.profession, featured.ville].filter(Boolean).join(" · ") : "";

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ===== EN-TÊTE ===== */}
      <div className="bg-white border-b-2 border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-sm font-black text-emerald-600 uppercase tracking-widest mb-2">Communauté</p>
              <h1 className="text-4xl font-black text-gray-900 mb-3">Témoignages</h1>
              <p className="text-lg font-semibold text-gray-600 max-w-xl leading-relaxed">
                Des parcours réels, du courage, de l'espoir. Chaque histoire compte et peut en inspirer d'autres.
              </p>
            </div>
            <button
              onClick={() => isAuthenticated() ? setModal(true) : router.push("/connexion")}
              className="inline-flex items-center gap-2 bg-gray-900 text-white text-base font-black px-6 py-3.5 rounded-xl hover:bg-gray-700 transition-all hover:shadow-lg hover:-translate-y-0.5 flex-shrink-0"
            >
              <Plus size={20} /> Noter un service
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { n: String(stats.count || temoignages.length), l: "Témoignages partagés", icon: Heart, color: "text-emerald-600" },
              { n: stats.moyenne ? `${stats.moyenne}/5` : "—", l: "Note moyenne", icon: Star, color: "text-amber-500" },
              { n: stats.servicesCount ? String(stats.servicesCount) : "—", l: "Services évalués", icon: Users, color: "text-emerald-600" },
            ].map((s) => (
              <div key={s.l} className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 flex items-center gap-3">
                <s.icon size={22} className={s.color} />
                <div>
                  <div className="text-xl font-black text-gray-900">{s.n}</div>
                  <div className="text-sm font-semibold text-gray-500">{s.l}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* ===== FILTRES ===== */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 mb-8">

          {/* Recherche */}
          <div className="relative mb-4">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher par nom, thème, ville..."
              aria-label="Rechercher un témoignage"
              className="w-full pl-12 pr-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold"
            />
            {recherche && (
              <button onClick={() => setRecherche("")} aria-label="Effacer" className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Toggle filtres */}
          <button
            onClick={() => setFiltresOuverts(!filtresOuverts)}
            className="flex items-center gap-2 text-sm font-black text-gray-500 hover:text-gray-900 transition-colors mb-3"
          >
            <Filter size={16} />
            {filtresOuverts ? "Masquer les filtres" : "Afficher les filtres"}
            <ChevronRight size={15} className={`transition-transform ${filtresOuverts ? "rotate-90" : ""}`} />
          </button>

          {filtresOuverts && (
            <div className="flex flex-col gap-4 pt-3 border-t-2 border-gray-100">
              {/* Tags = services */}
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Services</p>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setTagActif(tag)}
                      className={`text-sm font-bold px-3.5 py-1.5 rounded-full border-2 transition-all ${tagActif === tag ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-600 hover:border-gray-400"}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===== RÉSULTATS ===== */}
        {loading ? (
          <p className="text-gray-500 text-center py-12 font-semibold">Chargement des témoignages...</p>
        ) : temoignages.length === 0 ? (
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-14 text-center">
            <Heart size={36} className="text-gray-200 mx-auto mb-4" />
            <p className="text-lg font-black text-gray-600 mb-2">Aucun témoignage pour le moment</p>
            <p className="text-base font-semibold text-gray-400 mb-6 max-w-md mx-auto">
              Soyez le premier à partager votre expérience et à aider d&apos;autres membres de la communauté.
            </p>
            <button
              onClick={() => isAuthenticated() ? setModal(true) : router.push("/connexion")}
              className="inline-flex items-center gap-2 bg-gray-900 text-white font-black text-base px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors"
            >
              <Plus size={18} /> Partager mon témoignage
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-base font-bold text-gray-500">
                <span className="font-black text-gray-900">{filtres.length}</span> témoignage{filtres.length > 1 ? "s" : ""}
                {tagActif !== "Tous" && <span className="text-emerald-600"> · {tagActif}</span>}
              </p>
              {(tagActif !== "Tous" || recherche) && (
                <button
                  onClick={() => { setTagActif("Tous"); setRecherche(""); }}
                  className="text-sm font-black text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors"
                >
                  <X size={14} /> Réinitialiser
                </button>
              )}
            </div>

            {/* ===== TÉMOIGNAGE MIS EN AVANT ===== */}
            {featured && (
              <div className="bg-gray-900 text-white rounded-3xl p-7 mb-8 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-5 rounded-full pointer-events-none" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white opacity-5 rounded-full pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <Star size={16} className="text-amber-400 fill-amber-400" />
                    <span className="text-sm font-black text-amber-400 uppercase tracking-widest">Témoignage du mois</span>
                  </div>
                  <div className="flex items-start gap-4 mb-5">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-base font-black flex-shrink-0 ${featured.avatarBg}`}>
                      {featured.initiales}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-white">{featured.nom}</span>
                        {featured.verifie && <CheckCircle size={15} className="text-emerald-400" />}
                      </div>
                      {featuredMeta && <p className="text-sm font-semibold text-gray-400">{featuredMeta}</p>}
                    </div>
                  </div>
                  <Quote size={32} className="text-white/10 mb-2" />
                  <p className="text-lg font-semibold text-gray-200 leading-relaxed italic mb-6">
                    {featured.texteCourt}
                  </p>
                  <button
                    onClick={() => setExpandedId(featured.id)}
                    className="flex items-center gap-2 bg-white text-gray-900 font-black text-sm px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    Lire son histoire complète <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* ===== LISTE ===== */}
            {filtres.length === 0 ? (
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-14 text-center">
                <Search size={36} className="text-gray-200 mx-auto mb-4" />
                <p className="text-lg font-black text-gray-600 mb-2">Aucun témoignage trouvé</p>
                <p className="text-base font-semibold text-gray-400 mb-4">Essayez d&apos;autres filtres ou mots-clés</p>
                <button
                  onClick={() => { setTagActif("Tous"); setRecherche(""); }}
                  className="text-base font-black text-emerald-600 hover:underline"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filtres.map(t => (
                  <TemoignageCard
                    key={t.id}
                    t={t}
                    onLike={handleLike}
                    expanded={expandedId === t.id}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* CTA bas de page */}
        {!loading && filtres.length > 0 && (
          <div className="mt-12 text-center border-t-2 border-gray-200 pt-10">
            <GraduationCap size={36} className="text-gray-200 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-gray-900 mb-2">Votre histoire peut tout changer</h3>
            <p className="text-base font-semibold text-gray-500 mb-6 max-w-md mx-auto leading-relaxed">
              Chaque témoignage partagé aide d'autres personnes à se sentir moins seules et à trouver des solutions.
            </p>
            <button
              onClick={() => setModal(true)}
              className="inline-flex items-center gap-2 bg-gray-900 text-white font-black text-base px-7 py-3.5 rounded-xl hover:bg-gray-700 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <Plus size={20} /> Partager mon témoignage
            </button>
          </div>
        )}
      </div>

      {modal && <ModalPartage onClose={() => setModal(false)} onSuccess={load} />}
    </div>
  );
}