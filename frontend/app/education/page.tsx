"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  BookOpen, Search, ChevronRight, ArrowRight,
  GraduationCap, Scale, Accessibility, BarChart3,
  School, Star, MapPin, Mail, Phone, CheckCircle,
  Filter, X, ExternalLink, Clock, Users
} from "lucide-react";
import { getRessources, type Ressource as ApiRessource } from "@/services/ressources";
import { getExperts, type Expert as ApiExpert } from "@/services/experts";
import { getPublicStats, type PublicStats } from "@/services/stats";
import { useClickOutside } from "@/hooks/useClickOutside";

// ---- Types ----
type Ressource = {
  id: number;
  titre: string;
  description: string;
  categorie: string;
  categorieColor: string;
  icon: typeof BookOpen;
  duree: string;
  niveau: string;
  lien?: string;
  nouveau?: boolean;
};

type Expert = {
  id: number;
  initiales: string;
  nom: string;
  specialite: string;
  ville: string;
  disponible: boolean;
  enLigne: boolean;
  note: number;
  consultations: number;
  avatarBg: string;
  tags: string[];
  email: string;
  telephone?: string;
  verifie: boolean;
};

// ---- Données ----
const categoriesRessources = [
  { label: "Toutes", value: "toutes" },
  { label: "Accessibilité", value: "accessibilite" },
  { label: "Droits & lois", value: "droits" },
  { label: "Scolarisation", value: "scolarisation" },
  { label: "Données", value: "donnees" },
  { label: "Santé", value: "sante" },
];

const CATEGORIE_META: Record<string, { color: string; icon: typeof BookOpen }> = {
  accessibilite: { color: "bg-emerald-100 text-emerald-800", icon: Accessibility },
  droits: { color: "bg-emerald-100 text-emerald-800", icon: Scale },
  scolarisation: { color: "bg-emerald-100 text-emerald-800", icon: School },
  donnees: { color: "bg-amber-100 text-amber-800", icon: BarChart3 },
  sante: { color: "bg-rose-100 text-rose-800", icon: GraduationCap },
};

const DEFAULT_CATEGORIE_META = { color: "bg-gray-100 text-gray-800", icon: BookOpen };

const AVATAR_BGS = [
  "bg-emerald-100 text-emerald-800",
  "bg-emerald-100 text-emerald-800",
  "bg-emerald-100 text-emerald-800",
  "bg-amber-100 text-amber-800",
  "bg-rose-100 text-rose-800",
  "bg-green-100 text-green-800",
];

function formatNum(n: number) {
  return n.toLocaleString("fr-FR");
}

function getInitiales(nom: string): string {
  const skip = new Set(["dr", "dr.", "maître", "prof.", "prof", "sœur", "soeur", "mr", "mme"]);
  const parts = nom.trim().split(/\s+/).filter(p => !skip.has(p.toLowerCase()));
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return "?";
}

function getTagsFromSpecialite(specialite: string): string[] {
  return specialite
    .split(/\s*[,&—-]\s*/)
    .map(t => t.trim())
    .filter(Boolean)
    .slice(0, 4);
}

function ressourceToDisplay(r: ApiRessource): Ressource {
  const meta = CATEGORIE_META[r.categorie.toLowerCase()] ?? DEFAULT_CATEGORIE_META;
  const isRecent = Date.now() - new Date(r.cree_le).getTime() < 7 * 24 * 60 * 60 * 1000;
  return {
    id: r.id,
    titre: r.titre,
    description: r.description,
    categorie: r.categorie,
    categorieColor: meta.color,
    icon: meta.icon,
    duree: r.duree || "Durée non précisée",
    niveau: r.niveau || "Tous niveaux",
    lien: r.lien,
    nouveau: isRecent,
  };
}

function expertToDisplay(e: ApiExpert, index: number): Expert {
  return {
    id: e.id,
    initiales: getInitiales(e.nom),
    nom: e.nom,
    specialite: e.specialite,
    ville: e.ville?.trim() || "Sénégal",
    disponible: e.est_actif,
    enLigne: false,
    note: 0,
    consultations: 0,
    avatarBg: AVATAR_BGS[index % AVATAR_BGS.length],
    tags: getTagsFromSpecialite(e.specialite),
    email: e.email || "",
    telephone: e.telephone,
    verifie: true,
  };
}

// ---- Composant carte ressource ----
function RessourceCard({ r }: { r: Ressource }) {
  return (
    <article className="group bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-gray-900 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
      <div className="p-5 flex flex-col gap-4 h-full">
        <div className="flex items-start justify-between gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${r.categorieColor.replace("text-", "bg-").split(" ")[0]}30`}>
            <r.icon size={22} className={r.categorieColor.split(" ")[1]} />
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className={`text-xs font-black px-2.5 py-1 rounded-full ${r.categorieColor}`}>
              {categoriesRessources.find(c => c.value === r.categorie)?.label ?? r.categorie}
            </span>
            {r.nouveau && (
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                Nouveau
              </span>
            )}
          </div>
        </div>
        <div>
          <h3 className="text-base font-black text-gray-900 mb-2 leading-snug group-hover:text-emerald-700 transition-colors">
            {r.titre}
          </h3>
          <p className="text-sm font-semibold text-gray-500 leading-relaxed">
            {r.description}
          </p>
        </div>
        <div className="mt-auto flex items-center justify-between pt-3 border-t-2 border-gray-100">
          <div className="flex items-center gap-3 text-sm font-semibold text-gray-400">
            <span className="flex items-center gap-1">
              <Clock size={13} /> {r.duree}
            </span>
            <span className="text-gray-200">·</span>
            <span>{r.niveau}</span>
          </div>
          {r.lien ? (
            <a
              href={r.lien}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Accéder à la ressource : ${r.titre}`}
              className="flex items-center gap-1.5 text-sm font-black text-gray-900 hover:text-emerald-700 transition-colors"
            >
              Accéder <ExternalLink size={14} />
            </a>
          ) : (
            <button
              aria-label={`Lire la ressource : ${r.titre}`}
              className="flex items-center gap-1.5 text-sm font-black text-gray-900 hover:text-emerald-700 transition-colors"
            >
              Lire <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

// ---- Composant carte expert ----
function ExpertCard({
  expert,
  onContact,
}: {
  expert: Expert;
  onContact: (e: Expert) => void;
}) {
  return (
    <article className="group bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-gray-900 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="relative">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-base font-black flex-shrink-0 ${expert.avatarBg}`}>
            {expert.initiales}
          </div>
          {expert.disponible && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-black text-gray-900">{expert.nom}</span>
            {expert.verifie && (
              <CheckCircle size={15} className="text-emerald-600 flex-shrink-0" />
            )}
          </div>
          <p className="text-sm font-semibold text-gray-500 mt-0.5">{expert.specialite}</p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-sm font-semibold text-gray-400">
              <MapPin size={12} /> {expert.ville}
            </span>
            {expert.enLigne && (
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                En ligne
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Note + consultations */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Star size={15} className="text-amber-500 fill-amber-500" />
          <span className="text-sm font-black text-gray-900">{expert.note}</span>
          <span className="text-sm font-semibold text-gray-400">/ 5</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-400">
          <Users size={13} />
          {expert.consultations} consultations
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {expert.tags.map(tag => (
          <span key={tag} className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
            {tag}
          </span>
        ))}
      </div>

      {/* Disponibilité */}
      <div className={`flex items-center gap-2 text-sm font-bold px-3 py-2 rounded-xl ${
        expert.disponible
          ? "bg-emerald-50 text-emerald-700"
          : "bg-gray-50 text-gray-500"
      }`}>
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
          expert.disponible ? "bg-emerald-500" : "bg-gray-300"
        }`} />
        {expert.disponible ? "Disponible pour consultation" : "Indisponible actuellement"}
      </div>

      {/* Action */}
      <button
        onClick={() => onContact(expert)}
        disabled={!expert.disponible}
        aria-label={`Contacter ${expert.nom}`}
        className="w-full bg-gray-900 text-white font-black text-base py-3 rounded-xl hover:bg-gray-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-md"
      >
        <Mail size={16} /> Contacter
      </button>
    </article>
  );
}

// ---- Modal contact expert ----
function ModalContact({
  expert,
  onClose,
}: {
  expert: Expert;
  onClose: () => void;
}) {
  const [message, setMessage] = useState("");
  const [sujet, setSujet] = useState("");
  const [envoye, setEnvoye] = useState(false);
  
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);
  
  const modalRef = useClickOutside<HTMLDivElement>(handleClose);

  const handleEnvoi = async () => {
    if (!message.trim() || !sujet.trim()) return;
    await new Promise(r => setTimeout(r, 800));
    setEnvoye(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div ref={modalRef} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        <div className="sticky top-0 bg-white z-10 px-7 py-5 border-b-2 border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black ${expert.avatarBg}`}>
              {expert.initiales}
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900">{expert.nom}</h2>
              <p className="text-sm font-semibold text-gray-400">{expert.specialite}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-7 py-6">
          {envoye ? (
            <div className="flex flex-col items-center text-center gap-5 py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle size={32} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Message envoyé !</h3>
                <p className="text-base font-semibold text-gray-500 leading-relaxed">
                  {expert.nom} vous répondra dans les 24-48h sur votre adresse email.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-gray-900 text-white font-black text-base py-3.5 rounded-xl hover:bg-gray-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">

              {/* Coordonnées */}
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 flex flex-col gap-2">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                  Coordonnées directes
                </p>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Mail size={14} className="text-gray-400" />
                  {expert.email}
                </div>
                {expert.telephone && (
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Phone size={14} className="text-gray-400" />
                    {expert.telephone}
                  </div>
                )}
              </div>

              {/* Formulaire */}
              <div>
                <label className="text-sm font-black text-gray-700 block mb-2">
                  Sujet de la consultation *
                </label>
                <input
                  value={sujet}
                  onChange={e => setSujet(e.target.value)}
                  placeholder="Ex. Demande d'aménagement de poste..."
                  className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold"
                />
              </div>
              <div>
                <label className="text-sm font-black text-gray-700 block mb-2">
                  Votre message *
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Décrivez votre situation et ce dont vous avez besoin..."
                  rows={4}
                  className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 border-2 border-gray-200 text-gray-600 font-black text-base py-3.5 rounded-xl hover:border-gray-400 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleEnvoi}
                  disabled={!message.trim() || !sujet.trim()}
                  className="flex-1 bg-gray-900 text-white font-black text-base py-3.5 rounded-xl hover:bg-gray-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Mail size={16} /> Envoyer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Page principale ----
export default function EducationPage() {
  const [onglet, setOnglet] = useState<"ressources" | "experts">("ressources");
  const [recherche, setRecherche] = useState("");
  const [categorieActive, setCategorieActive] = useState("toutes");
  const [disponiblesOnly, setDisponiblesOnly] = useState(false);
  const [expertSelectionne, setExpertSelectionne] = useState<Expert | null>(null);
  const [villeExperte, setVilleExperte] = useState("Toutes");

  const [ressources, setRessources] = useState<Ressource[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [publicStats, setPublicStats] = useState<PublicStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingRessources, setLoadingRessources] = useState(true);
  const [loadingExperts, setLoadingExperts] = useState(true);

  useEffect(() => {
    getPublicStats()
      .then(setPublicStats)
      .catch(() => setPublicStats(null))
      .finally(() => setLoadingStats(false));
  }, []);

  useEffect(() => {
    setLoadingRessources(true);
    getRessources()
      .then(data => setRessources(data.map(ressourceToDisplay)))
      .catch(() => setRessources([]))
      .finally(() => setLoadingRessources(false));
  }, []);

  useEffect(() => {
    setLoadingExperts(true);
    getExperts()
      .then(data => setExperts(data.map(expertToDisplay)))
      .catch(() => setExperts([]))
      .finally(() => setLoadingExperts(false));
  }, []);

  const villesExperts = useMemo(() => {
    const villes = [...new Set(experts.map(e => e.ville).filter(v => v && v !== "Sénégal"))].sort();
    return ["Toutes", ...villes];
  }, [experts]);

  const ressourcesFiltrees = useMemo(() =>
    ressources
      .filter(r => categorieActive === "toutes" || r.categorie === categorieActive)
      .filter(r => !recherche ||
        r.titre.toLowerCase().includes(recherche.toLowerCase()) ||
        r.description.toLowerCase().includes(recherche.toLowerCase())
      ),
    [ressources, categorieActive, recherche]
  );

  const expertsFiltres = useMemo(() =>
    experts
      .filter(e => !disponiblesOnly || e.disponible)
      .filter(e => villeExperte === "Toutes" || e.ville === villeExperte)
      .filter(e => !recherche ||
        e.nom.toLowerCase().includes(recherche.toLowerCase()) ||
        e.specialite.toLowerCase().includes(recherche.toLowerCase()) ||
        e.tags.some(t => t.toLowerCase().includes(recherche.toLowerCase()))
      ),
    [experts, disponiblesOnly, villeExperte, recherche]
  );

  const headerStats = [
    {
      n: loadingStats ? "…" : formatNum(publicStats?.ressources_count ?? 0),
      l: "Guides disponibles",
      icon: BookOpen,
      color: "text-emerald-600",
    },
    {
      n: loadingStats ? "…" : formatNum(publicStats?.experts_count ?? 0),
      l: "Experts référencés",
      icon: GraduationCap,
      color: "text-emerald-600",
    },
    {
      n: loadingExperts ? "…" : formatNum(experts.filter(e => e.disponible).length),
      l: "Experts disponibles",
      icon: CheckCircle,
      color: "text-emerald-600",
    },
    {
      n: loadingStats ? "…" : formatNum(publicStats?.forums_count ?? 0),
      l: "Forums actifs",
      icon: Star,
      color: "text-amber-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ===== EN-TÊTE ===== */}
      <div className="bg-white border-b-2 border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <p className="text-sm font-black text-emerald-600 uppercase tracking-widest mb-2">
            Éducation & Experts
          </p>
          <h1 className="text-4xl font-black text-gray-900 mb-3">
            Ressources & Annuaire
          </h1>
          <p className="text-lg font-semibold text-gray-600 max-w-xl leading-relaxed mb-8">
            Guides pratiques, ressources juridiques et spécialistes disponibles
            pour vous accompagner au Sénégal.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {headerStats.map(s => (
              <div key={s.l} className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 flex items-center gap-3">
                <s.icon size={22} className={s.color} />
                <div>
                  <div className="text-xl font-black text-gray-900">{s.n}</div>
                  <div className="text-sm font-semibold text-gray-500">{s.l}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Onglets */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
            {([
              { key: "ressources", label: "Ressources éducatives", icon: BookOpen },
              { key: "experts", label: "Annuaire des experts", icon: GraduationCap },
            ] as const).map(o => (
              <button
                key={o.key}
                onClick={() => { setOnglet(o.key); setRecherche(""); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-base font-black transition-all ${
                  onglet === o.key
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <o.icon size={18} />
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* ===== BARRE RECHERCHE + FILTRES ===== */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              value={recherche}
              onChange={e => setRecherche(e.target.value)}
              placeholder={
                onglet === "ressources"
                  ? "Rechercher une ressource..."
                  : "Rechercher un expert, une spécialité..."
              }
              aria-label="Rechercher"
              className="w-full pl-12 pr-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold bg-white"
            />
            {recherche && (
              <button
                onClick={() => setRecherche("")}
                aria-label="Effacer"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filtres ressources */}
          {onglet === "ressources" && (
            <div className="flex gap-2 flex-wrap">
              {categoriesRessources.map(c => (
                <button
                  key={c.value}
                  onClick={() => setCategorieActive(c.value)}
                  className={`flex items-center gap-1.5 text-sm font-black px-4 py-2.5 rounded-xl border-2 transition-all ${
                    categorieActive === c.value
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {c.value !== "toutes" && <Filter size={12} />}
                  {c.label}
                </button>
              ))}
            </div>
          )}

          {/* Filtres experts */}
          {onglet === "experts" && (
            <div className="flex gap-2 flex-wrap items-center">
              <select
                value={villeExperte}
                onChange={e => setVilleExperte(e.target.value)}
                aria-label="Filtrer par ville"
                className="px-4 py-2.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 font-semibold bg-white appearance-none cursor-pointer"
              >
                {villesExperts.map(v => (
                  <option key={v}>{v}</option>
                ))}
              </select>
              <button
                onClick={() => setDisponiblesOnly(!disponiblesOnly)}
                className={`flex items-center gap-2 text-sm font-black px-4 py-2.5 rounded-xl border-2 transition-all ${
                  disponiblesOnly
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
                }`}
              >
                <CheckCircle size={15} />
                Disponibles uniquement
              </button>
            </div>
          )}
        </div>

        {/* ===== RÉSULTATS ===== */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-base font-bold text-gray-500">
            <span className="font-black text-gray-900">
              {onglet === "ressources" ? ressourcesFiltrees.length : expertsFiltres.length}
            </span>{" "}
            {onglet === "ressources" ? "ressource" : "expert"}
            {(onglet === "ressources" ? ressourcesFiltrees.length : expertsFiltres.length) > 1 ? "s" : ""}
          </p>
          {(recherche || categorieActive !== "toutes" || disponiblesOnly || villeExperte !== "Toutes") && (
            <button
              onClick={() => {
                setRecherche("");
                setCategorieActive("toutes");
                setDisponiblesOnly(false);
                setVilleExperte("Toutes");
              }}
              className="flex items-center gap-1.5 text-sm font-black text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X size={14} /> Réinitialiser
            </button>
          )}
        </div>

        {/* ===== CONTENU RESSOURCES ===== */}
        {onglet === "ressources" && (
          <>
            {loadingRessources ? (
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-14 text-center">
                <p className="text-lg font-black text-gray-600">Chargement des ressources…</p>
              </div>
            ) : ressourcesFiltrees.length === 0 ? (
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-14 text-center">
                <Search size={36} className="text-gray-200 mx-auto mb-4" />
                <p className="text-lg font-black text-gray-600 mb-2">Aucune ressource trouvée</p>
                <button
                  onClick={() => { setRecherche(""); setCategorieActive("toutes"); }}
                  className="text-base font-black text-emerald-600 hover:underline mt-2"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {ressourcesFiltrees.map(r => <RessourceCard key={r.id} r={r} />)}
              </div>
            )}

            {/* CTA proposer une ressource */}
            <div className="mt-10 bg-white border-2 border-gray-200 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <BookOpen size={24} className="text-emerald-600" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-black text-gray-900 mb-1">
                  Vous avez une ressource à partager ?
                </h3>
                <p className="text-base font-semibold text-gray-500">
                  Proposez un guide, un article ou un document utile à la communauté.
                </p>
              </div>
              <Link href="/contact" className="flex items-center gap-2 bg-gray-900 text-white font-black text-base px-6 py-3.5 rounded-xl hover:bg-gray-700 transition-all flex-shrink-0">
                Proposer <ArrowRight size={18} />
              </Link>
            </div>
          </>
        )}

        {/* ===== CONTENU EXPERTS ===== */}
        {onglet === "experts" && (
          <>
            {loadingExperts ? (
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-14 text-center">
                <p className="text-lg font-black text-gray-600">Chargement des experts…</p>
              </div>
            ) : expertsFiltres.length === 0 ? (
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-14 text-center">
                <Search size={36} className="text-gray-200 mx-auto mb-4" />
                <p className="text-lg font-black text-gray-600 mb-2">Aucun expert trouvé</p>
                <button
                  onClick={() => { setRecherche(""); setDisponiblesOnly(false); setVilleExperte("Toutes"); }}
                  className="text-base font-black text-emerald-600 hover:underline mt-2"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {expertsFiltres.map(e => (
                  <ExpertCard
                    key={e.id}
                    expert={e}
                    onContact={setExpertSelectionne}
                  />
                ))}
              </div>
            )}

            {/* CTA rejoindre annuaire */}
            <div className="mt-10 bg-gray-900 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <GraduationCap size={24} className="text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-black text-white mb-1">
                  Vous êtes un professionnel ?
                </h3>
                <p className="text-base font-semibold text-gray-400">
                  Rejoignez l'annuaire et proposez vos services à notre communauté.
                </p>
              </div>
              <button className="flex items-center gap-2 bg-white text-gray-900 font-black text-base px-6 py-3.5 rounded-xl hover:bg-gray-100 transition-all flex-shrink-0">
                Rejoindre l'annuaire <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* ===== MODAL CONTACT EXPERT ===== */}
      {expertSelectionne && (
        <ModalContact
          expert={expertSelectionne}
          onClose={() => setExpertSelectionne(null)}
        />
      )}
    </div>
  );
}