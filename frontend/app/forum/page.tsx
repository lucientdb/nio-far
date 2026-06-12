"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Accessibility,
  AlertCircle,
  Briefcase,
  BookOpen,
  Clock,
  TrendingUp,
  Gavel,
  Heart,
  Home,
  MessageSquare,
  Search,
  ChevronRight,
  Stethoscope,
  Users,
  Wrench,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ---- Types ----
type Post = {
  id: number;
  auteur: string;
  initiales: string;
  avatarColor: string;
  temps: string;
  categorie: string;
  categorieColor: string;
  titre: string;
  extrait: string;
  reponses: number;
  likes: number;
  vues: number;
  liked: boolean;
  epingle?: boolean;
};

// ---- Données mock ----
const categoriesList: Array<{
  label: string;
  icon: LucideIcon;
  value: string;
}> = [
  { label: "Tous les sujets", icon: MessageSquare, value: "tous" },
  { label: "Accessibilité", icon: Accessibility, value: "accessibilite" },
  { label: "Emploi", icon: Briefcase, value: "emploi" },
  { label: "Éducation", icon: BookOpen, value: "education" },
  { label: "Santé", icon: Stethoscope, value: "sante" },
  { label: "Famille", icon: Users, value: "famille" },
  { label: "Droits & lois", icon: Gavel, value: "droits" },
  { label: "Aides techniques", icon: Wrench, value: "aides" },
];

const catColors: Record<string, string> = {
  accessibilite: "bg-emerald-50 text-emerald-700",
  emploi: "bg-amber-50 text-amber-700",
  education: "bg-blue-50 text-blue-700",
  sante: "bg-green-50 text-green-700",
  famille: "bg-pink-50 text-pink-700",
  droits: "bg-purple-50 text-purple-700",
  aides: "bg-orange-50 text-orange-700",
};

const avColors: Record<string, string> = {
  AM: "bg-emerald-100 text-emerald-800",
  OD: "bg-blue-100 text-blue-800",
  FN: "bg-purple-100 text-purple-800",
  MS: "bg-amber-100 text-amber-800",
  KD: "bg-rose-100 text-rose-800",
  IB: "bg-green-100 text-green-800",
  SD: "bg-orange-100 text-orange-800",
};

const postsData: Post[] = [
  { id: 1, auteur: "Aminata M.", initiales: "AM", avatarColor: avColors.AM, temps: "Il y a 2h", categorie: "emploi", categorieColor: catColors.emploi, titre: "Comment trouver un emploi adapté à Dakar ?", extrait: "Je cherche des conseils pour naviguer le marché du travail. Avez-vous des entreprises inclusives à recommander dans la région dakaroise ?", reponses: 14, likes: 32, vues: 218, liked: false, epingle: true },
  { id: 2, auteur: "Omar D.", initiales: "OD", avatarColor: avColors.OD, temps: "Hier", categorie: "accessibilite", categorieColor: catColors.accessibilite, titre: "Trottoirs inaccessibles à Saint-Louis — que faire ?", extrait: "La situation des trottoirs dans mon quartier est catastrophique pour les personnes en fauteuil. Quelles démarches possibles auprès des mairies ?", reponses: 27, likes: 61, vues: 540, liked: false, epingle: true },
  { id: 3, auteur: "Fatou N.", initiales: "FN", avatarColor: avColors.FN, temps: "3 mai", categorie: "droits", categorieColor: catColors.droits, titre: "Allocations FAIS : démarches et documents requis", extrait: "Je partage un guide pratique compilé après mes propres démarches. Voici les documents à préparer pour accélérer le traitement du dossier.", reponses: 9, likes: 88, vues: 1200, liked: false },
  { id: 4, auteur: "Moussa S.", initiales: "MS", avatarColor: avColors.MS, temps: "1 mai", categorie: "sante", categorieColor: catColors.sante, titre: "Centres de réhabilitation à Thiès — retours d'expérience", extrait: "Quels sont vos avis sur les structures disponibles dans la région de Thiès ? Je recherche un centre pour rééducation motrice.", reponses: 5, likes: 19, vues: 340, liked: false },
  { id: 5, auteur: "Khadija D.", initiales: "KD", avatarColor: avColors.KD, temps: "29 avril", categorie: "education", categorieColor: catColors.education, titre: "Université inclusive : mon expérience à l'UCAD", extrait: "Je voulais partager mon parcours à l'Université Cheikh Anta Diop en tant qu'étudiante avec une déficience auditive. Les aménagements mis en place.", reponses: 18, likes: 74, vues: 890, liked: false },
  { id: 6, auteur: "Ibou B.", initiales: "IB", avatarColor: avColors.IB, temps: "28 avril", categorie: "aides", categorieColor: catColors.aides, titre: "Fauteuil roulant électrique : financement possible ?", extrait: "Existe-t-il des aides pour financer un fauteuil roulant électrique au Sénégal ? J'ai entendu parler d'un programme de l'ANPPH.", reponses: 11, likes: 43, vues: 620, liked: false },
  { id: 7, auteur: "Seydou D.", initiales: "SD", avatarColor: avColors.SD, temps: "26 avril", categorie: "famille", categorieColor: catColors.famille, titre: "Élever un enfant trisomique — ressources disponibles", extrait: "Mon fils de 6 ans est atteint de trisomie 21. Quelles structures d'accompagnement existent au Sénégal pour les familles ?", reponses: 22, likes: 95, vues: 1450, liked: false },
];

// ---- Composant Modal nouveau post ----
function NouveauPostModal({ onClose }: { onClose: () => void }) {
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [cat, setCat] = useState("emploi");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
      <div ref={ref} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Nouveau sujet</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"><X className="h-5 w-5" /></button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-2 block">Catégorie</label>
            <div className="flex flex-wrap gap-2">
              {categoriesList.slice(1).map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCat(c.value)}
                  className={`text-sm px-3 py-2 rounded-lg border flex items-center gap-2 transition-all ${cat === c.value ? "bg-emerald-600 text-white border-emerald-600" : "border-gray-200 text-gray-600 hover:border-emerald-300"}`}
                >
                  <c.icon className="h-4 w-4" />
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-2 block">Titre du sujet</label>
            <input
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Posez votre question clairement..."
              className="w-full text-base border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-2 block">Contenu</label>
            <textarea
              value={contenu}
              onChange={(e) => setContenu(e.target.value)}
              placeholder="Décrivez votre situation ou question en détail..."
              rows={4}
              className="w-full text-base border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all resize-none"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-400">Votre post sera visible par toute la communauté</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="text-base text-gray-500 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors font-medium">Annuler</button>
            <button
              disabled={!titre.trim()}
              className="text-sm bg-emerald-600 text-white px-5 py-2 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Publier →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Composant carte post ----
function PostCard({ post, onLike }: { post: Post; onLike: (id: number) => void }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`bg-white border rounded-2xl p-5 transition-all duration-200 ${hover ? "border-emerald-200 shadow-md -translate-y-0.5" : "border-gray-100 shadow-sm"} ${post.epingle ? "ring-1 ring-emerald-100" : ""}`}
    >
      {post.epingle && (
        <div className="flex items-center gap-1.5 text-sm text-emerald-600 font-semibold mb-3">
          <AlertCircle className="h-4 w-4" /> Épinglé
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${post.avatarColor}`}>
          {post.initiales}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900">{post.auteur}</span>
            <span className="text-sm text-gray-300">·</span>
            <span className="text-sm text-gray-400">{post.temps}</span>
            {categoriesList.find(c => c.value === post.categorie) && (
              <span className={`text-sm font-semibold px-3 py-1 rounded-lg ml-auto flex items-center gap-1.5 ${post.categorieColor}`}>
                {(() => {
                  const cat = categoriesList.find(c => c.value === post.categorie);
                  return cat ? <cat.icon className="h-4 w-4" /> : null;
                })()}
                {categoriesList.find(c => c.value === post.categorie)?.label}
              </span>
            )}
          </div>
          <Link href={`/forum/${post.id}`}>
            <h3 className="text-base font-semibold text-gray-900 mb-1.5 hover:text-emerald-700 transition-colors leading-snug">
              {post.titre}
            </h3>
          </Link>
          <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">{post.extrait}</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onLike(post.id)}
              className={`flex items-center gap-1.5 text-xs transition-all ${post.liked ? "text-rose-500 scale-110" : "text-gray-400 hover:text-rose-400"}`}
            >
              <span className="text-base">{post.liked ? "❤️" : "🤍"}</span>
              {post.likes + (post.liked ? 1 : 0)}
            </button>
            <Link href={`/forum/${post.id}`} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-emerald-600 transition-colors">
              <span>💬</span> {post.reponses} réponses
            </Link>
            <span className="flex items-center gap-1.5 text-xs text-gray-300">
              <span>👁</span> {post.vues.toLocaleString()}
            </span>
            <Link
              href={`/forum/${post.id}`}
              className={`ml-auto text-xs font-medium text-emerald-600 transition-all ${hover ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}
            >
              Lire la discussion →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Page principale ----
export default function ForumPage() {
  const [posts, setPosts] = useState<Post[]>(postsData);
  const [categorie, setCategorie] = useState("tous");
  const [recherche, setRecherche] = useState("");
  const [rechercheActive, setRechercheActive] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [tri, setTri] = useState<"recent" | "populaire">("recent");

  const handleLike = (id: number) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: !p.liked } : p));
  };

  const postsFiltres = posts
    .filter(p => categorie === "tous" || p.categorie === categorie)
    .filter(p => recherche === "" || p.titre.toLowerCase().includes(recherche.toLowerCase()) || p.extrait.toLowerCase().includes(recherche.toLowerCase()))
    .sort((a, b) => tri === "populaire" ? (b.likes + b.vues) - (a.likes + a.vues) : 0);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ===== EN-TÊTE PAGE ===== */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-widest mb-2">Communauté</p>
              <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-2">Forum</h1>
              <p className="text-base text-gray-500 max-w-md">
                Posez vos questions, partagez vos expériences et trouvez du soutien auprès de notre communauté.
              </p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white text-base font-semibold px-6 py-3 rounded-xl hover:bg-emerald-700 transition-all hover:shadow-md hover:-translate-y-0.5 flex-shrink-0"
            >
              Nouveau sujet
            </button>
          </div>

          {/* Barre de recherche */}
          <div className={`relative mt-8 transition-all duration-200 ${rechercheActive ? "max-w-full" : "max-w-lg"}`}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
            <input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              onFocus={() => setRechercheActive(true)}
              onBlur={() => setRechercheActive(false)}
              placeholder="Rechercher un sujet, une question..."
              className={`w-full pl-10 pr-4 py-3 text-sm border rounded-xl transition-all duration-200 focus:outline-none ${rechercheActive ? "border-emerald-400 ring-2 ring-emerald-100 shadow-sm" : "border-gray-200"} bg-white`}
            />
            {recherche && (
              <button
                onClick={() => setRecherche("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 text-xs transition-colors"
              ><X className="h-3 w-3" /></button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 flex gap-7">

        {/* ===== SIDEBAR ===== */}
        <aside className="w-56 flex-shrink-0 hidden lg:block">
          <div className="bg-white border border-gray-100 rounded-2xl p-4 sticky top-24">
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-widest mb-3 px-2">Catégories</p>
            {categoriesList.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategorie(c.value)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-base transition-all mb-1 text-left ${categorie === c.value ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"}`}
              >
                <c.icon className="h-5 w-5 flex-shrink-0" />
                <span className="flex-1 truncate">{c.label}</span>
                {categorie === c.value && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                )}
              </button>
            ))}

            {/* Stats sidebar */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex flex-col gap-3 px-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Discussions</span>
                  <span className="font-semibold text-gray-800">342</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Membres actifs</span>
                  <span className="font-medium text-gray-700">128</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Réponses</span>
                  <span className="font-medium text-gray-700">1 847</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ===== LISTE DES POSTS ===== */}
        <main className="flex-1 min-w-0">

          {/* Barre tri + résultats */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-gray-400">
              {postsFiltres.length} sujet{postsFiltres.length > 1 ? "s" : ""}
              {categorie !== "tous" && <span className="text-emerald-600 font-medium"> · {categoriesList.find(c => c.value === categorie)?.label}</span>}
              {recherche && <span className="text-emerald-600"> · "{recherche}"</span>}
            </p>
            <div className="flex bg-white border border-gray-100 rounded-xl overflow-hidden">
              {(["recent", "populaire"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTri(t)}
                  className={`text-xs px-4 py-2 transition-colors ${tri === t ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-gray-600"}`}
                >
                  {t === "recent" ? (
                    <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4 text-current" />Récent</span>
                  ) : (
                    <span className="inline-flex items-center gap-2"><TrendingUp className="h-4 w-4 text-current" />Populaire</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Posts */}
          <div className="flex flex-col gap-3">
            {postsFiltres.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
                <p className="text-4xl mb-3">
                  <Search className="h-16 w-16 text-gray-300 mx-auto" />
                </p>
                <p className="text-sm font-medium text-gray-600 mb-1">Aucun résultat trouvé</p>
                <p className="text-xs text-gray-400">Essayez d'autres mots-clés ou changez de catégorie</p>
                <button onClick={() => { setRecherche(""); setCategorie("tous"); }} className="mt-4 text-xs text-emerald-600 hover:underline">
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              postsFiltres.map((post) => (
                <PostCard key={post.id} post={post} onLike={handleLike} />
              ))
            )}
          </div>

          {/* Pagination */}
          {postsFiltres.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {[1, 2, 3].map((p) => (
                <button
                  key={p}
                  className={`w-9 h-9 rounded-xl text-sm transition-all ${p === 1 ? "bg-emerald-600 text-white shadow-sm" : "bg-white border border-gray-100 text-gray-400 hover:border-emerald-300 hover:text-emerald-600"}`}
                >
                  {p}
                </button>
              ))}
              <button className="w-9 h-9 rounded-xl text-sm bg-white border border-gray-100 text-gray-400 hover:border-emerald-300 hover:text-emerald-600 transition-all">
                <ChevronRight className="h-4 w-4 mx-auto" />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* ===== MODAL ===== */}
      {modalOpen && <NouveauPostModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}