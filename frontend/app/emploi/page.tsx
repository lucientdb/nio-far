"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { getJobs, type Job } from "@/services/jobs";
import { getStoredUser } from "@/lib/auth";
import { useClickOutside } from "@/hooks/useClickOutside";
import {
  Search, MapPin, Briefcase, Clock, ChevronRight, Filter,
  X, Building2, ArrowRight, CheckCircle, Star, Bookmark,
  BookmarkCheck, Share2, Users, Accessibility, Wifi,
  GraduationCap, Heart, SlidersHorizontal, ExternalLink
} from "lucide-react";

// ---- Types ----
type Offre = {
  id: number;
  sigle: string;
  entreprise: string;
  titre: string;
  ville: string;
  region: string;
  type: string;
  teletravail: boolean;
  handicaps: string[];
  secteur: string;
  salaire?: string;
  date: string;
  description: string;
  avantages: string[];
  nouveau: boolean;
  sauvegarde: boolean;
  verifie: boolean;
  avatarBg: string;
};

type Filtre = {
  recherche: string;
  ville: string;
  type: string;
  teletravail: boolean | null;
  handicap: string;
  secteur: string;
};

const AVATAR_BGS = [
  "bg-emerald-100 text-emerald-800",
  "bg-emerald-100 text-emerald-800",
  "bg-emerald-100 text-emerald-800",
  "bg-amber-100 text-amber-800",
  "bg-rose-100 text-rose-800",
  "bg-green-100 text-green-800",
];

function jobToOffre(j: Job, index: number): Offre {
  const lieu = j.lieu?.trim() || "Sénégal";
  const creeLe = new Date(j.cree_le);
  const isRecent = Date.now() - creeLe.getTime() < 7 * 24 * 60 * 60 * 1000;

  return {
    id: j.id,
    sigle: j.entreprise.slice(0, 3).toUpperCase(),
    entreprise: j.entreprise,
    titre: j.titre,
    ville: lieu,
    region: lieu,
    type: j.type_contrat?.trim() || "Non précisé",
    teletravail: false,
    handicaps: [],
    secteur: "Général",
    date: creeLe.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(",", " à"),
    description: j.description,
    avantages: [],
    nouveau: isRecent,
    sauvegarde: false,
    verifie: j.est_actif,
    avatarBg: AVATAR_BGS[index % AVATAR_BGS.length],
  };
}

// ---- Modal détail offre ----
function ModalOffre({ offre, onClose }: { offre: Offre; onClose: () => void }) {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);
  
  const modalRef = useClickOutside<HTMLDivElement>(handleClose);
  
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-offre-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div ref={modalRef} className="bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-7 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-base font-semibold flex-shrink-0 ${offre.avatarBg}`}>
              {offre.sigle}
            </div>
            <div>
              <h2 id="modal-offre-title" className="text-xl font-semibold text-gray-900 leading-tight">{offre.titre}</h2>
              <p className="text-base font-semibold text-gray-500 mt-0.5">{offre.entreprise} · {offre.ville}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-7 py-6 flex flex-col gap-6">

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-semibold px-3 py-1.5 rounded-full bg-gray-900 text-white">{offre.type}</span>
            {offre.teletravail && (
              <span className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800">
                <Wifi size={13} /> Télétravail possible
              </span>
            )}
            {offre.verifie && (
              <span className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800">
                <CheckCircle size={13} /> Offre vérifiée
              </span>
            )}
            {offre.nouveau && (
              <span className="text-sm font-semibold px-3 py-1.5 rounded-full bg-amber-100 text-amber-800">Nouveau</span>
            )}
          </div>

          {/* Infos clés */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: MapPin, label: "Localisation", val: offre.ville },
              { icon: Clock, label: "Publié", val: offre.date },
              { icon: Briefcase, label: "Secteur", val: offre.secteur },
              { icon: Building2, label: "Salaire", val: offre.salaire ?? "Non précisé" },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  <item.icon size={12} /> {item.label}
                </div>
                <div className="text-base font-semibold text-gray-900">{item.val}</div>
              </div>
            ))}
          </div>

          {/* Handicaps acceptés */}
          <div>
            <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-2">
              <Accessibility size={16} /> Handicaps acceptés
            </p>
            <div className="flex flex-wrap gap-2">
              {offre.handicaps.map(h => (
                <span key={h} className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle size={12} /> {h}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Description du poste</p>
            <p className="text-base font-semibold text-gray-600 leading-relaxed">{offre.description}</p>
          </div>

          {/* Avantages */}
          <div>
            <p className="text-sm font-black text-gray-700 uppercase tracking-wide mb-3">Avantages & aménagements</p>
            <div className="grid grid-cols-2 gap-2">
              {offre.avantages.map(a => (
                <div key={a} className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                  <CheckCircle size={15} className="text-emerald-600 flex-shrink-0" /> {a}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button className="flex-1 bg-gray-900 text-white font-semibold text-base py-3.5 rounded-xl hover:bg-gray-700 transition-all flex items-center justify-center gap-2">
              <ExternalLink size={18} /> Postuler maintenant
            </button>
            <button aria-label="Partager cette offre" className="w-12 h-12 border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:border-gray-400 transition-colors">
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Carte offre ----
function OffreCard({
  offre,
  onSelect,
  onSave,
}: {
  offre: Offre;
  onSelect: (o: Offre) => void;
  onSave: (id: number) => void;
}) {
  return (
    <article className="group bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-900 hover:shadow-sm transition-all duration-200 hover:-translate-y-0.5 flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 ${offre.avatarBg}`}>
          {offre.sigle}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <button
              type="button"
              onClick={() => onSelect(offre)}
              className="text-left text-base font-semibold text-gray-900 leading-snug hover:text-emerald-700 transition-colors cursor-pointer"
            >
              {offre.titre}
            </button>
            <button
              onClick={() => onSave(offre.id)}
              aria-label={offre.sauvegarde ? "Retirer des sauvegardes" : "Sauvegarder cette offre"}
              className="flex-shrink-0 text-gray-300 hover:text-gray-700 transition-colors"
            >
              {offre.sauvegarde
                ? <BookmarkCheck size={20} className="text-emerald-600" />
                : <Bookmark size={20} />
              }
            </button>
          </div>
          <p className="text-sm font-semibold text-gray-500 mt-0.5">{offre.entreprise}</p>
        </div>
      </div>

      {/* Infos */}
      <div className="flex flex-wrap gap-3 text-sm font-semibold text-gray-500">
        <span className="flex items-center gap-1.5"><MapPin size={13} /> {offre.ville}</span>
        <span className="flex items-center gap-1.5"><Clock size={13} /> {offre.date}</span>
        {offre.teletravail && <span className="flex items-center gap-1.5 text-emerald-600"><Wifi size={13} /> Télétravail</span>}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-semibold px-3 py-1 rounded-full bg-gray-900 text-white">{offre.type}</span>
        {offre.nouveau && <span className="text-sm font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800">Nouveau</span>}
        {offre.verifie && (
          <span className="flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
            <CheckCircle size={11} /> Vérifié
          </span>
        )}
      </div>

      {/* Handicaps */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
          <Accessibility size={11} /> Handicaps acceptés
        </p>
        <div className="flex flex-wrap gap-1.5">
          {offre.handicaps.map(h => (
            <span key={h} className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800">
              {h}
            </span>
          ))}
        </div>
      </div>

      {/* Salaire + action */}
      <div className="flex items-center justify-between pt-3 border-t-2 border-gray-100">
        <div>
          {offre.salaire
            ? <span className="text-sm font-semibold text-gray-900">{offre.salaire}</span>
            : <span className="text-sm font-semibold text-gray-400">Salaire non précisé</span>
          }
        </div>
        <button
          onClick={() => onSelect(offre)}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 border border-gray-900 px-4 py-2 rounded-xl hover:bg-gray-900 hover:text-white transition-all group-hover:bg-gray-900 group-hover:text-white"
        >
          Voir l'offre <ChevronRight size={15} />
        </button>
      </div>
    </article>
  );
}

// ---- Page principale ----
export default function EmploiPage() {
  const [offres, setOffres] = useState<Offre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offreSelectionnee, setOffreSelectionnee] = useState<Offre | null>(null);
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [filtres, setFiltres] = useState<Filtre>({
    recherche: "",
    ville: "Toutes",
    type: "Tous",
    teletravail: null,
    handicap: "Tous",
    secteur: "Tous",
  });

  useEffect(() => {
    setLoading(true);
    setError(null);
    getJobs()
      .then((jobs) => {
        setOffres(jobs.map(jobToOffre));
      })
      .catch((err) => {
        console.error(err);
        const errorMsg = err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')
          ? "Le chargement prend plus de temps que prévu. Veuillez réessayer dans quelques instants."
          : "Impossible de charger les offres d'emploi. Veuillez réessayer plus tard.";
        setError(errorMsg);
        setOffres([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const villes = useMemo(
    () => ["Toutes", ...Array.from(new Set(offres.map((o) => o.ville))).sort()],
    [offres],
  );
  const typesContrat = useMemo(
    () => ["Tous", ...Array.from(new Set(offres.map((o) => o.type))).sort()],
    [offres],
  );
  const secteurs = useMemo(
    () => ["Tous", ...Array.from(new Set(offres.map((o) => o.secteur))).sort()],
    [offres],
  );
  const handicaps = useMemo(
    () => ["Tous", ...Array.from(new Set(offres.flatMap((o) => o.handicaps))).sort()],
    [offres],
  );

  const setFiltre = (key: keyof Filtre, val: string | boolean | null) => {
    setFiltres(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = (id: number) => {
    setOffres(prev => prev.map(o => o.id === id ? { ...o, sauvegarde: !o.sauvegarde } : o));
  };

  const offresFiltrees = offres
    .filter(o => filtres.type === "Tous" || o.type === filtres.type)
    .filter(o => filtres.ville === "Toutes" || o.ville === filtres.ville)
    .filter(o => filtres.handicap === "Tous" || o.handicaps.includes(filtres.handicap))
    .filter(o => filtres.secteur === "Tous" || o.secteur === filtres.secteur)
    .filter(o => filtres.teletravail === null || o.teletravail === filtres.teletravail)
    .filter(o => !filtres.recherche || o.titre.toLowerCase().includes(filtres.recherche.toLowerCase()) || o.entreprise.toLowerCase().includes(filtres.recherche.toLowerCase()));

  const filtresActifs = Object.entries(filtres).filter(([k, v]) =>
    v !== "" && v !== "Tous" && v !== "Toutes" && v !== null
  ).length;

  const resetFiltres = () => setFiltres({ recherche: "", ville: "Toutes", type: "Tous", teletravail: null, handicap: "Tous", secteur: "Tous" });

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ===== EN-TÊTE ===== */}
      <div className="bg-white border-b-2 border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <p className="text-sm font-black text-amber-600 uppercase tracking-widest mb-2">Emploi & Opportunités</p>
          <h1 className="text-4xl font-black text-gray-900 mb-3">Offres adaptées</h1>
          <p className="text-lg font-semibold text-gray-600 max-w-xl leading-relaxed mb-8">
            Toutes les offres sont sélectionnées pour leur accessibilité et leur ouverture aux personnes en situation de handicap.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { n: String(offres.length), l: "Offres actives", icon: Briefcase, color: "text-amber-600" },
              { n: String(new Set(offres.map(o => o.entreprise)).size), l: "Entreprises", icon: Building2, color: "text-emerald-600" },
              { n: String(offres.filter(o => o.teletravail).length), l: "Télétravail", icon: Wifi, color: "text-emerald-600" },
              { n: String(offres.length), l: "Total publiées", icon: CheckCircle, color: "text-emerald-600" },
            ].map((s) => (
              <div key={s.l} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
                <s.icon size={22} className={s.color} />
                <div>
                  <div className="text-xl font-semibold text-gray-900">{s.n}</div>
                  <div className="text-sm font-semibold text-gray-500">{s.l}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Barre de recherche principale */}
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                value={filtres.recherche}
                onChange={(e) => setFiltre("recherche", e.target.value)}
                placeholder="Titre du poste, entreprise..."
                aria-label="Rechercher une offre d'emploi"
                className="w-full pl-12 pr-4 py-4 text-base border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold bg-white"
              />
              {filtres.recherche && (
                <button onClick={() => setFiltre("recherche", "")} aria-label="Effacer" className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors">
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="relative">
              <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              <select
                value={filtres.ville}
                onChange={(e) => setFiltre("ville", e.target.value)}
                aria-label="Filtrer par ville"
                className="pl-11 pr-10 py-4 text-base border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold bg-white appearance-none cursor-pointer min-w-[160px]"
              >
                {villes.map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
            <button
              onClick={() => setFiltresOuverts(!filtresOuverts)}
              className={`flex items-center gap-2 px-5 py-4 rounded-xl border font-semibold text-base transition-all ${filtresOuverts || filtresActifs > 0 ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"}`}
            >
              <SlidersHorizontal size={18} />
              Filtres
              {filtresActifs > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-gray-900 text-xs font-semibold flex items-center justify-center">
                  {filtresActifs}
                </span>
              )}
            </button>
          </div>

          {/* Filtres avancés */}
          {filtresOuverts && (
<div className="mt-4 p-5 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col gap-5">

              {/* Type de contrat */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Type de contrat</p>
                <div className="flex flex-wrap gap-2">
                  {typesContrat.map(t => (
                    <button key={t} onClick={() => setFiltre("type", t)} className={`text-sm font-bold px-4 py-2 rounded-full border-2 transition-all ${filtres.type === t ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Télétravail */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Modalité de travail</p>
                <div className="flex gap-2">
                  {[
                    { label: "Tous", val: null },
                    { label: "Télétravail possible", val: true },
                    { label: "Présentiel uniquement", val: false },
                  ].map(o => (
                    <button key={o.label} onClick={() => setFiltre("teletravail", o.val)} className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full border transition-all ${filtres.teletravail === o.val ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"}`}>
                      {o.val === true && <Wifi size={13} />}
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type de handicap */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Accessibility size={12} /> Type de handicap accepté
                </p>
                <div className="flex flex-wrap gap-2">
                  {handicaps.map(h => (
                    <button key={h} onClick={() => setFiltre("handicap", h)} className={`text-sm font-semibold px-4 py-2 rounded-full border transition-all ${filtres.handicap === h ? "bg-violet-600 text-white border-violet-600" : "bg-white border-gray-200 text-gray-600 hover:border-violet-300"}`}>
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Secteur */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Secteur d'activité</p>
                <div className="flex flex-wrap gap-2">
                  {secteurs.map(s => (
                    <button key={s} onClick={() => setFiltre("secteur", s)} className={`text-sm font-semibold px-4 py-2 rounded-full border transition-all ${filtres.secteur === s ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {filtresActifs > 0 && (
                <button onClick={resetFiltres} className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-700 transition-colors self-start">
                  <X size={14} /> Réinitialiser tous les filtres
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===== RÉSULTATS ===== */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <p className="text-base font-bold text-gray-500">
            <span className="font-black text-gray-900">{offresFiltrees.length}</span> offre{offresFiltrees.length > 1 ? "s" : ""}
            {filtres.type !== "Tous" && <span className="text-amber-600"> · {filtres.type}</span>}
            {filtres.handicap !== "Tous" && <span className="text-emerald-600"> · Handicap {filtres.handicap}</span>}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-400">Trier par</span>
            <select className="text-sm font-black border-2 border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-gray-900 bg-white">
              <option>Plus récentes</option>
              <option>Salaire croissant</option>
              <option>Salaire décroissant</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-14 text-center">
            <Briefcase size={36} className="text-gray-200 mx-auto mb-4 animate-pulse" />
            <p className="text-lg font-black text-gray-600">Chargement des offres…</p>
          </div>
        ) : error ? (
          <div className="bg-white border-2 border-red-200 rounded-2xl p-14 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={36} className="text-red-400" />
            </div>
            <p className="text-lg font-black text-gray-900 mb-2">Erreur de chargement</p>
            <p className="text-base font-semibold text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-800 transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : offres.length === 0 ? (
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-14 text-center">
            <Briefcase size={36} className="text-gray-200 mx-auto mb-4" />
            <p className="text-lg font-black text-gray-600 mb-2">Aucune offre disponible</p>
            <p className="text-base font-semibold text-gray-400">Revenez bientôt pour découvrir de nouvelles opportunités.</p>
          </div>
        ) : offresFiltrees.length === 0 ? (
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-14 text-center">
            <Search size={36} className="text-gray-200 mx-auto mb-4" />
            <p className="text-lg font-black text-gray-600 mb-2">Aucune offre trouvée</p>
            <p className="text-base font-semibold text-gray-400 mb-4">Modifiez vos critères de recherche</p>
            <button onClick={resetFiltres} className="text-base font-black text-emerald-600 hover:underline">
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {offresFiltrees.map(o => (
              <OffreCard key={o.id} offre={o} onSelect={setOffreSelectionnee} onSave={handleSave} />
            ))}
          </div>
        )}

        {/* Alerte emploi */}
        {offresFiltrees.length > 0 && (
          <div className="mt-10 bg-white border-2 border-gray-200 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Star size={24} className="text-amber-600" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-black text-gray-900 mb-1">Créer une alerte emploi</h3>
              <p className="text-base font-semibold text-gray-500">Recevez les nouvelles offres adaptées à votre profil directement par email.</p>
            </div>
            <button className="flex items-center gap-2 bg-gray-900 text-white font-black text-base px-6 py-3.5 rounded-xl hover:bg-gray-700 transition-all flex-shrink-0">
              <Heart size={18} /> Créer mon alerte
            </button>
          </div>
        )}

        {/* CTA recruteur - Personnalisé selon le type d'utilisateur - Uniquement pour non-authentifiés */}
        {!getStoredUser() && (
          <div className="mt-6 bg-gray-900 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Users size={24} className="text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-black text-white mb-1">Vous recrutez ?</h3>
              <p className="text-base font-semibold text-gray-400">
                Publiez vos offres gratuitement et touchez des candidats qualifiés en situation de handicap.
              </p>
            </div>
            <Link
              href="/inscription"
              className="flex items-center gap-2 bg-white text-gray-900 font-black text-base px-6 py-3.5 rounded-xl hover:bg-gray-100 transition-all flex-shrink-0"
            >
              Publier une offre <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </div>

      {/* ===== MODAL DÉTAIL ===== */}
      {offreSelectionnee && (
        <ModalOffre offre={offreSelectionnee} onClose={() => setOffreSelectionnee(null)} />
      )}
    </div>
  );
}