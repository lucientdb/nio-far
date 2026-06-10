"use client";
import { useState } from "react";
import {
  Heart, Plus, Search, X, ChevronRight, Quote,
  MapPin, Briefcase, GraduationCap, Users, Filter,
  ArrowRight, Star, CheckCircle
} from "lucide-react";

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
};

// ---- Données ----
const temoignagesData: Temoignage[] = [
  {
    id: 1,
    initiales: "AM",
    nom: "Aminata M.",
    age: 28,
    ville: "Dakar",
    handicap: "Déficience visuelle",
    profession: "Ingénieure informatique",
    texte: "Grâce à cette plateforme, j'ai trouvé un emploi adapté et un réseau de soutien incroyable. Ma déficience visuelle n'est plus un frein — elle m'a appris à m'adapter, à innover, à voir le monde différemment. Je travaille aujourd'hui dans une startup tech à Dakar qui a aménagé mon poste avec des outils spécialisés. Je n'aurais jamais cru que c'était possible il y a deux ans.",
    texteCourt: "Grâce à cette plateforme, j'ai trouvé un emploi adapté et un réseau incroyable. Ma différence est devenue ma force.",
    tags: ["Emploi", "Technologie", "Inclusion"],
    avatarBg: "bg-emerald-100 text-emerald-800",
    liked: false,
    likes: 142,
    date: "2 mai 2025",
    verifie: true,
  },
  {
    id: 2,
    initiales: "MS",
    nom: "Moussa S.",
    age: 35,
    ville: "Saint-Louis",
    handicap: "Handicap moteur",
    profession: "Entrepreneur textile",
    texte: "J'ai lancé mon entreprise de textile malgré tous les obstacles. Le forum m'a mis en contact avec Maître Badji, un avocat spécialisé qui m'a accompagné gratuitement dans mes démarches. Aujourd'hui j'emploie 4 personnes dans mon atelier à Saint-Louis. L'accessibilité des locaux a été un défi, mais avec les aides de l'ANPPH et le soutien de la communauté, on a trouvé des solutions.",
    texteCourt: "Le forum m'a mis en contact avec un avocat spécialisé. Aujourd'hui j'emploie 4 personnes dans mon atelier.",
    tags: ["Entrepreneuriat", "Droits", "ANPPH"],
    avatarBg: "bg-blue-100 text-blue-800",
    liked: false,
    likes: 98,
    date: "18 avril 2025",
    verifie: true,
  },
  {
    id: 3,
    initiales: "KD",
    nom: "Khadija D.",
    age: 19,
    ville: "Thiès",
    handicap: "Déficience auditive",
    profession: "Étudiante en droit",
    texte: "Les ressources éducatives disponibles sur cette plateforme et le contact avec d'autres jeunes en situation de handicap m'ont donné une confiance que je n'avais pas. Je prépare le barreau avec l'objectif de défendre les droits des personnes comme moi. L'université m'a accordé des aménagements après que j'ai cité les textes de loi que j'ai trouvés ici. La connaissance, c'est le pouvoir.",
    texteCourt: "Les ressources et le contact avec d'autres jeunes handicapés m'ont donné confiance pour poursuivre mes études en droit.",
    tags: ["Éducation", "Jeunesse", "Droits"],
    avatarBg: "bg-violet-100 text-violet-800",
    liked: false,
    likes: 87,
    date: "5 avril 2025",
    verifie: true,
  },
  {
    id: 4,
    initiales: "IB",
    nom: "Ibrahima B.",
    age: 42,
    ville: "Ziguinchor",
    handicap: "Amputation membre inférieur",
    profession: "Enseignant",
    texte: "Après mon accident en 2019, je pensais que ma carrière d'enseignant était terminée. Grâce aux ressources sur les droits et aux contacts trouvés ici, j'ai pu reprendre mon poste avec les aménagements nécessaires. L'administration scolaire n'était pas au courant de ses obligations légales — maintenant elle l'est. J'enseigne les mathématiques à 180 élèves à Ziguinchor.",
    texteCourt: "Après mon accident, je pensais que ma carrière était terminée. Aujourd'hui j'enseigne les maths à 180 élèves.",
    tags: ["Éducation", "Droits", "Retour emploi"],
    avatarBg: "bg-amber-100 text-amber-800",
    liked: false,
    likes: 203,
    date: "22 mars 2025",
    verifie: true,
  },
  {
    id: 5,
    initiales: "FN",
    nom: "Fatou N.",
    age: 31,
    ville: "Dakar",
    handicap: "Sclérose en plaques",
    profession: "Comptable",
    texte: "Diagnostiquée à 27 ans, j'ai traversé une période très difficile. Le forum m'a aidée à ne pas me sentir seule. J'ai trouvé un groupe de soutien, un médecin spécialisé via l'annuaire des experts, et des informations sur les aides FAIS auxquelles j'avais droit. Le télétravail partiel que j'ai obtenu grâce aux textes de loi partagés ici a changé ma vie professionnelle.",
    texteCourt: "Le forum m'a aidée à ne pas me sentir seule. J'ai trouvé un groupe de soutien et des aides auxquelles j'avais droit.",
    tags: ["Santé", "Emploi", "FAIS"],
    avatarBg: "bg-rose-100 text-rose-800",
    liked: false,
    likes: 156,
    date: "8 mars 2025",
    verifie: false,
  },
  {
    id: 6,
    initiales: "OD",
    nom: "Omar D.",
    age: 24,
    ville: "Saint-Louis",
    handicap: "Handicap moteur",
    profession: "Développeur web",
    texte: "J'ai appris le développement web grâce aux ressources partagées sur la plateforme et aux conseils de la communauté. En tant que personne en fauteuil roulant, le numérique est pour moi la meilleure façon de travailler sans dépendre de l'accessibilité physique des locaux. Je travaille aujourd'hui en freelance pour des clients au Sénégal et en France.",
    texteCourt: "J'ai appris le développement web grâce à la communauté. Je travaille en freelance pour des clients au Sénégal et en France.",
    tags: ["Technologie", "Emploi", "Formation"],
    avatarBg: "bg-green-100 text-green-800",
    liked: false,
    likes: 74,
    date: "14 février 2025",
    verifie: true,
  },
];

const allTags = ["Tous", "Emploi", "Éducation", "Entrepreneuriat", "Droits", "Santé", "Technologie", "FAIS", "ANPPH", "Jeunesse", "Formation"];

const villes = ["Toutes les villes", "Dakar", "Saint-Louis", "Thiès", "Ziguinchor"];

// ---- Modal partage témoignage ----
function ModalPartage({ onClose }: { onClose: () => void }) {
  const [etape, setEtape] = useState<1 | 2>(1);
  const [form, setForm] = useState({ nom: "", ville: "", handicap: "", profession: "", texte: "" });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b-2 border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-black text-gray-900">Partager mon témoignage</h2>
            <p className="text-sm font-semibold text-gray-400 mt-0.5">Étape {etape} sur 2</p>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Barre de progression */}
        <div className="h-1 bg-gray-100">
          <div className={`h-1 bg-gray-900 transition-all duration-500 ${etape === 1 ? "w-1/2" : "w-full"}`} />
        </div>

        <div className="px-7 py-6 flex flex-col gap-5">

          {etape === 1 ? (
            <>
              <p className="text-base font-bold text-gray-500 mb-2">Votre identité (anonymisée si vous le souhaitez)</p>
              {[
                { key: "nom", label: "Prénom ou pseudonyme", placeholder: "Ex. Aminata M." },
                { key: "ville", label: "Ville", placeholder: "Ex. Dakar" },
                { key: "handicap", label: "Type de handicap (optionnel)", placeholder: "Ex. Déficience visuelle" },
                { key: "profession", label: "Profession ou situation actuelle", placeholder: "Ex. Étudiante, Entrepreneur..." },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-sm font-black text-gray-700 mb-2 block">{f.label}</label>
                  <input
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full text-base border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-900 transition-all font-semibold"
                  />
                </div>
              ))}
              <button
                onClick={() => setEtape(2)}
                disabled={!form.nom.trim() || !form.ville.trim()}
                className="w-full bg-gray-900 text-white font-black text-base py-3.5 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                Continuer <ChevronRight size={18} />
              </button>
            </>
          ) : (
            <>
              <p className="text-base font-bold text-gray-500 mb-2">Votre histoire</p>
              <div>
                <label className="text-sm font-black text-gray-700 mb-2 block">
                  Racontez votre parcours
                </label>
                <textarea
                  value={form.texte}
                  onChange={(e) => setForm(p => ({ ...p, texte: e.target.value }))}
                  placeholder="Partagez votre expérience, les défis surmontés, ce qui vous a aidé... Votre témoignage peut inspirer d'autres personnes."
                  rows={6}
                  className="w-full text-base border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-900 transition-all resize-none font-semibold"
                />
                <p className="text-sm text-gray-400 mt-1.5 font-semibold">{form.texte.length} / 1000 caractères</p>
              </div>
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                <p className="text-sm font-black text-gray-700 mb-1">Votre témoignage sera :</p>
                {[
                  "Relu par notre équipe avant publication",
                  "Anonymisé si vous le souhaitez",
                  "Visible par toute la communauté",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 mt-1.5">
                    <CheckCircle size={14} className="text-emerald-600 flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setEtape(1)}
                  className="flex-1 border-2 border-gray-200 text-gray-600 font-black text-base py-3.5 rounded-xl hover:border-gray-400 transition-colors"
                >
                  Retour
                </button>
                <button
                  disabled={form.texte.trim().length < 50}
                  className="flex-2 bg-gray-900 text-white font-black text-base px-8 py-3.5 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <CheckCircle size={18} /> Soumettre
                </button>
              </div>
            </>
          )}
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
          className={`flex items-center gap-2 text-sm font-black transition-all ${t.liked ? "text-rose-600" : "text-gray-400 hover:text-rose-500"}`}
        >
          <Heart size={18} className={t.liked ? "fill-rose-500" : ""} />
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
  const [temoignages, setTemoignages] = useState<Temoignage[]>(temoignagesData);
  const [modal, setModal] = useState(false);
  const [recherche, setRecherche] = useState("");
  const [tagActif, setTagActif] = useState("Tous");
  const [villeActive, setVilleActive] = useState("Toutes les villes");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filtresOuverts, setFiltresOuverts] = useState(false);

  const handleLike = (id: number) => {
    setTemoignages(prev => prev.map(t => t.id === id ? { ...t, liked: !t.liked } : t));
  };

  const handleToggle = (id: number) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const filtres = temoignages
    .filter(t => tagActif === "Tous" || t.tags.includes(tagActif))
    .filter(t => villeActive === "Toutes les villes" || t.ville === villeActive)
    .filter(t => !recherche || t.nom.toLowerCase().includes(recherche.toLowerCase()) || t.texte.toLowerCase().includes(recherche.toLowerCase()) || t.tags.some(tag => tag.toLowerCase().includes(recherche.toLowerCase())));

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ===== EN-TÊTE ===== */}
      <div className="bg-white border-b-2 border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-sm font-black text-rose-600 uppercase tracking-widest mb-2">Communauté</p>
              <h1 className="text-4xl font-black text-gray-900 mb-3">Témoignages</h1>
              <p className="text-lg font-semibold text-gray-600 max-w-xl leading-relaxed">
                Des parcours réels, du courage, de l'espoir. Chaque histoire compte et peut en inspirer d'autres.
              </p>
            </div>
            <button
              onClick={() => setModal(true)}
              className="inline-flex items-center gap-2 bg-gray-900 text-white text-base font-black px-6 py-3.5 rounded-xl hover:bg-gray-700 transition-all hover:shadow-lg hover:-translate-y-0.5 flex-shrink-0"
            >
              <Plus size={20} /> Partager mon témoignage
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { n: "64", l: "Témoignages partagés", icon: Heart, color: "text-rose-600" },
              { n: "12", l: "Villes représentées", icon: MapPin, color: "text-violet-600" },
              { n: "4 800+", l: "Personnes aidées", icon: Users, color: "text-emerald-600" },
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
              {/* Tags */}
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Thèmes</p>
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
              {/* Villes */}
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Ville</p>
                <div className="flex flex-wrap gap-2">
                  {villes.map((v) => (
                    <button
                      key={v}
                      onClick={() => setVilleActive(v)}
                      className={`flex items-center gap-1.5 text-sm font-bold px-3.5 py-1.5 rounded-full border-2 transition-all ${villeActive === v ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-600 hover:border-gray-400"}`}
                    >
                      {v !== "Toutes les villes" && <MapPin size={12} />}
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===== RÉSULTATS ===== */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-base font-bold text-gray-500">
            <span className="font-black text-gray-900">{filtres.length}</span> témoignage{filtres.length > 1 ? "s" : ""}
            {tagActif !== "Tous" && <span className="text-violet-600"> · {tagActif}</span>}
            {villeActive !== "Toutes les villes" && <span className="text-violet-600"> · {villeActive}</span>}
          </p>
          {(tagActif !== "Tous" || villeActive !== "Toutes les villes" || recherche) && (
            <button
              onClick={() => { setTagActif("Tous"); setVilleActive("Toutes les villes"); setRecherche(""); }}
              className="text-sm font-black text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors"
            >
              <X size={14} /> Réinitialiser
            </button>
          )}
        </div>

        {/* ===== TÉMOIGNAGE MIS EN AVANT ===== */}
        {filtres.length > 0 && tagActif === "Tous" && !recherche && (
          <div className="bg-gray-900 text-white rounded-3xl p-7 mb-8 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-5 rounded-full pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white opacity-5 rounded-full pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Star size={16} className="text-amber-400 fill-amber-400" />
                <span className="text-sm font-black text-amber-400 uppercase tracking-widest">Témoignage du mois</span>
              </div>
              <div className="flex items-start gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-base font-black flex-shrink-0">
                  IB
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-white">Ibrahima B.</span>
                    <CheckCircle size={15} className="text-emerald-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-400">42 ans · Enseignant · Ziguinchor</p>
                </div>
              </div>
              <Quote size={32} className="text-white/10 mb-2" />
              <p className="text-lg font-semibold text-gray-200 leading-relaxed italic mb-6">
                Après mon accident en 2019, je pensais que ma carrière d'enseignant était terminée. Aujourd'hui j'enseigne les mathématiques à 180 élèves à Ziguinchor.
              </p>
              <button
                onClick={() => setExpandedId(4)}
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
            <p className="text-base font-semibold text-gray-400 mb-4">Essayez d'autres filtres ou mots-clés</p>
            <button
              onClick={() => { setTagActif("Tous"); setVilleActive("Toutes les villes"); setRecherche(""); }}
              className="text-base font-black text-violet-600 hover:underline"
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

        {/* CTA bas de page */}
        {filtres.length > 0 && (
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

      {modal && <ModalPartage onClose={() => setModal(false)} />}
    </div>
  );
}