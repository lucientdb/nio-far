"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Mic, Play, Pause, Clock, ChevronRight, X,
  Camera, Film, Download, Share2, Search, Filter, MoreHorizontal,
  Volume2, SkipBack, SkipForward, Repeat, Shuffle
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ---- Types ----
type Episode = {
  id: number;
  numero: number;
  titre: string;
  description: string;
  duree: string;
  date: string;
  serie: string;
  serieColor: string;
  progress?: number;
  nouveau?: boolean;
};


type Photo = {
  id: number;
  titre: string;
  lieu: string;
  bg: string;
  icon: LucideIcon;
};

// ---- Données ----
const series = [
  { label: "Tous", value: "tous" },
  { label: "Voix du Sénégal", value: "voix" },
  { label: "Regards inclusifs", value: "regards" },
  { label: "Experts & Savoirs", value: "experts" },
];

const episodes: Episode[] = [
  { id: 1, numero: 12, titre: "Vivre avec un handicap moteur à Dakar — le parcours de Moussa", description: "Moussa nous raconte comment il a surmonté les obstacles du quotidien, trouvé un emploi et lancé son entreprise malgré les barrières d'accessibilité dans la capitale sénégalaise.", duree: "28 min", date: "2 mai 2025", serie: "voix", serieColor: "bg-violet-100 text-violet-800", progress: 30, nouveau: true },
  { id: 2, numero: 11, titre: "Droits des personnes handicapées : ce que prévoit la Constitution", description: "Maître Badji, avocat spécialisé en droit social, décrypte la loi 2010-15 et ses applications concrètes pour les personnes en situation de handicap au Sénégal.", duree: "35 min", date: "18 avril 2025", serie: "experts", serieColor: "bg-blue-100 text-blue-800", nouveau: true },
  { id: 3, numero: 10, titre: "Réussir à l'école malgré le handicap visuel", description: "Aminata, ingénieure malvoyante, partage son parcours scolaire et universitaire, les aménagements qu'elle a obtenus et ses conseils pour les familles.", duree: "22 min", date: "4 avril 2025", serie: "voix", serieColor: "bg-violet-100 text-violet-800" },
  { id: 4, numero: 9, titre: "Entrepreneurs handicapés : leurs parcours inspirants", description: "Rencontre avec trois entrepreneurs sénégalais en situation de handicap qui ont créé leur propre entreprise. Comment ils ont surmonté les obstacles du financement et de l'accessibilité.", duree: "41 min", date: "21 mars 2025", serie: "regards", serieColor: "bg-emerald-100 text-emerald-800" },
  { id: 5, numero: 8, titre: "Dr. Sow — La réhabilitation médicale au Sénégal", description: "Le Dr. Sow, spécialiste en médecine physique et de réhabilitation, présente l'état des centres de soins disponibles et les avancées thérapeutiques accessibles.", duree: "18 min", date: "7 mars 2025", serie: "experts", serieColor: "bg-blue-100 text-blue-800" },
  { id: 6, numero: 7, titre: "Famille et handicap — briser les tabous", description: "Des parents témoignent sur leur quotidien, les ressources disponibles et l'importance du soutien communautaire pour élever un enfant en situation de handicap.", duree: "33 min", date: "21 février 2025", serie: "regards", serieColor: "bg-emerald-100 text-emerald-800" },
];

const photos: Photo[] = [
  { id: 1, titre: "Forum d'inclusion 2025", lieu: "Dakar", bg: "bg-violet-100", icon: Camera },
  { id: 2, titre: "Atelier accessibilité", lieu: "Thiès", bg: "bg-amber-100", icon: Camera },
  { id: 3, titre: "Rencontre communautaire", lieu: "Saint-Louis", bg: "bg-blue-100", icon: Film },
  { id: 4, titre: "Cérémonie ANPPH", lieu: "Dakar", bg: "bg-emerald-100", icon: Camera },
  { id: 5, titre: "Séance de formation", lieu: "Ziguinchor", bg: "bg-rose-100", icon: Film },
  { id: 6, titre: "Sport adapté", lieu: "Dakar", bg: "bg-orange-100", icon: Camera },
  { id: 7, titre: "Expo inclusive", lieu: "Mbour", bg: "bg-green-100", icon: Camera },
  { id: 8, titre: "Table ronde droits", lieu: "Dakar", bg: "bg-pink-100", icon: Film },
];

// ---- Composant Player global ----
function PlayerBar({ episode, playing, onToggle, onClose }: {
  episode: Episode;
  playing: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-6">
        {/* Info épisode */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
            <Mic size={18} className="text-violet-600" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">{episode.titre}</div>
            <div className="text-xs text-gray-500">Épisode {episode.numero} · {episode.duree}</div>
          </div>
        </div>

        {/* Contrôles */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button aria-label="Répéter" className="text-gray-300 hover:text-gray-700 transition-colors hidden sm:block focus-visible:ring-2 focus-visible:ring-emerald-300 focus:outline-none">
            <Repeat size={16} />
          </button>
          <button aria-label="Reculer 15s" className="text-gray-500 hover:text-gray-900 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-300 focus:outline-none">
            <SkipBack size={20} />
          </button>
          <button
            onClick={onToggle}
            aria-label={playing ? "Mettre en pause" : "Reprendre"}
            className="w-11 h-11 rounded-full bg-gray-900 flex items-center justify-center text-white hover:bg-gray-700 transition-all hover:scale-105 focus-visible:ring-2 focus-visible:ring-emerald-300 focus:outline-none"
          >
            {playing ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button aria-label="Avancer 15s" className="text-gray-500 hover:text-gray-900 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-300 focus:outline-none">
            <SkipForward size={20} />
          </button>
          <button aria-label="Aléatoire" className="text-gray-300 hover:text-gray-700 transition-colors hidden sm:block focus-visible:ring-2 focus-visible:ring-emerald-300 focus:outline-none">
            <Shuffle size={16} />
          </button>
        </div>

        {/* Barre de progression */}
        <div className="flex-1 hidden md:block">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden cursor-pointer group">
            <div className="h-2 bg-gray-900 rounded-full w-[30%] group-hover:bg-violet-600 transition-colors" />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>8:24</span><span>{episode.duree}</span>
          </div>
        </div>

        {/* Volume + fermer */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Volume2 size={18} className="text-gray-400 hidden sm:block" />
          <button
            onClick={onClose}
            aria-label="Fermer le lecteur"
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors text-sm font-medium focus-visible:ring-2 focus-visible:ring-emerald-300 focus:outline-none"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Carte épisode ----
function EpisodeCard({
  episode,
  onPlay,
  isPlaying,
  isActive,
}: {
  episode: Episode;
  onPlay: (ep: Episode) => void;
  isPlaying: boolean;
  isActive: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <article className={`group bg-white border rounded-2xl p-5 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 ${isActive ? "border-gray-900 shadow" : "border-gray-200 hover:border-gray-400"}`}>
      <div className="flex items-start gap-4">
        {/* Numéro + bouton play */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onPlay(episode)}
            aria-label={isPlaying && isActive ? `Mettre en pause l'épisode ${episode.numero}` : `Écouter l'épisode ${episode.numero}`}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 ${isActive ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-900 hover:text-white"}`}
          >
            {isPlaying && isActive ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <span className="text-xs font-bold text-gray-300">#{episode.numero}</span>
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${episode.serieColor}`}>
              {series.find(s => s.value === episode.serie)?.label}
            </span>
            {episode.nouveau && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                Nouveau
              </span>
            )}
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-2 leading-snug group-hover:text-violet-700 transition-colors">
            {episode.titre}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed mb-3 line-clamp-2">
            {episode.description}
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-500">
              <Clock size={14} /> {episode.duree}
            </span>
            <span className="text-sm text-gray-300">{episode.date}</span>
            <div className="ml-auto relative">
              <button aria-haspopup="true" aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-300 focus:outline-none">
                <MoreHorizontal size={16} />
              </button>
              {menuOpen && (
                <div role="menu" className="absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-md p-1 z-20">
                  <button role="menuitem" onClick={() => { setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <Download size={14} /> Télécharger
                  </button>
                  <button role="menuitem" onClick={() => { setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <Share2 size={14} /> Partager
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Barre de progression si en cours */}
          {isActive && episode.progress && (
            <div className="mt-3">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-1.5 bg-gray-900 rounded-full transition-all"
                  style={{ width: `${episode.progress}%` }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-1">En cours · 8:24 / {episode.duree}</div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

// ---- Page principale ----
export default function MediasPage() {
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(episodes[0]);
  const [playing, setPlaying] = useState(false);
  const [serie, setSerie] = useState("tous");
  const [recherche, setRecherche] = useState("");
  const [onglet, setOnglet] = useState<"podcasts" | "galerie">("podcasts");

  const handlePlay = (ep: Episode) => {
    if (activeEpisode?.id === ep.id) {
      setPlaying(!playing);
    } else {
      setActiveEpisode(ep);
      setPlaying(true);
    }
  };

  const episodesFiltres = episodes
    .filter(e => serie === "tous" || e.serie === serie)
    .filter(e => !recherche || e.titre.toLowerCase().includes(recherche.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingBottom: activeEpisode ? "80px" : "0" }}>

      {/* ===== EN-TÊTE ===== */}
      <div className="bg-white border-b-2 border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <p className="text-sm font-black text-violet-600 uppercase tracking-widest mb-2">Médias</p>
          <h1 className="text-4xl font-black text-gray-900 mb-3">Podcasts & Galerie</h1>
          <p className="text-lg text-gray-600 font-semibold max-w-xl leading-relaxed">
            Écoutez des voix inspirantes, découvrez des parcours et explorez nos reportages photo.
          </p>

          {/* Onglets */}
          <div className="flex gap-1 mt-8 bg-gray-100 p-1 rounded-xl w-fit">
            {([
              { key: "podcasts", label: "Podcasts", icon: Mic },
              { key: "galerie", label: "Galerie photo", icon: Camera },
            ] as const).map((o) => (
              <button
                key={o.key}
                onClick={() => setOnglet(o.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-base font-bold transition-all ${onglet === o.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"} focus-visible:ring-2 focus-visible:ring-emerald-300 focus:outline-none`}
              >
                <o.icon size={18} />
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== CONTENU PODCASTS ===== */}
      {onglet === "podcasts" && (
        <div className="max-w-6xl mx-auto px-6 py-10">

          {/* Épisode vedette */}
          <div className="bg-white border border-gray-900 rounded-3xl p-7 mb-10 shadow-sm">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-20 h-20 rounded-2xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                <Mic size={36} className="text-violet-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-sm font-black px-3 py-1 rounded-full bg-violet-100 text-violet-800">Épisode 12</span>
                  <span className="text-sm font-black px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">Nouveau</span>
                  <span className="text-sm font-black px-3 py-1 rounded-full bg-gray-100 text-gray-700">Voix du Sénégal</span>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3 leading-snug">
                  Vivre avec un handicap moteur à Dakar — le parcours de Moussa
                </h2>
                <p className="text-base text-gray-600 leading-relaxed mb-5 font-semibold">
                  Moussa nous raconte comment il a surmonté les obstacles du quotidien, trouvé un emploi et lancé son entreprise malgré les barrières d'accessibilité dans la capitale sénégalaise.
                </p>
                <div className="flex items-center gap-4 flex-wrap">
                  <button
                    onClick={() => handlePlay(episodes[0])}
                    aria-label={playing && activeEpisode?.id === 1 ? "Mettre en pause" : "Écouter l'épisode vedette"}
                    className="flex items-center gap-3 bg-gray-900 text-white font-black text-base px-6 py-3 rounded-xl hover:bg-gray-700 transition-all hover:shadow-lg hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-emerald-300 focus:outline-none"
                  >
                    {playing && activeEpisode?.id === 1 ? <Pause size={20} /> : <Play size={20} />}
                    {playing && activeEpisode?.id === 1 ? "En pause" : "Écouter maintenant"}
                  </button>
                  <span className="flex items-center gap-2 text-base font-semibold text-gray-500">
                    <Clock size={16} /> 28 min · 2 mai 2025
                  </span>
                  <button aria-label="Partager cet épisode" className="flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors text-sm font-semibold ml-auto">
                    <Share2 size={16} /> Partager
                  </button>
                </div>

                {/* Barre de progression vedette */}
                <div className="mt-5">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden cursor-pointer">
                    <div className="h-2 bg-gray-900 rounded-full w-[30%]" />
                  </div>
                  <div className="flex justify-between text-sm text-gray-300 mt-1.5">
                    <span>8:24</span><span>28:00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filtres + recherche */}
          <div className="flex flex-col sm:flex-row gap-4 mb-7">
            <div className="relative flex-1">
              <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher un épisode..."
                aria-label="Rechercher un épisode"
                className="w-full pl-11 pr-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all bg-white font-semibold"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {series.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSerie(s.value)}
                  className={`flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl border-2 transition-all ${serie === s.value ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"}`}
                >
                  {s.value !== "tous" && <Filter size={13} />}
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Résultats */}
          <p className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wide">
            {episodesFiltres.length} épisode{episodesFiltres.length > 1 ? "s" : ""}
          </p>

          {/* Liste épisodes */}
          <div className="flex flex-col gap-4">
            {episodesFiltres.length === 0 ? (
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-14 text-center">
                <Search size={36} className="text-gray-200 mx-auto mb-4" />
                <p className="text-lg font-black text-gray-600 mb-2">Aucun épisode trouvé</p>
                <button onClick={() => { setRecherche(""); setSerie("tous"); }} className="text-base text-violet-600 font-bold hover:underline mt-2">
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              episodesFiltres.map((ep) => (
                <EpisodeCard
                  key={ep.id}
                  episode={ep}
                  onPlay={handlePlay}
                  isPlaying={playing}
                  isActive={activeEpisode?.id === ep.id}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* ===== GALERIE PHOTO ===== */}
      {onglet === "galerie" && (
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Nos reportages photo</h2>
              <p className="text-base font-semibold text-gray-500 mt-1">48 photos · Événements et rencontres communautaires</p>
            </div>
            <button className="flex items-center gap-2 text-base font-bold text-gray-600 border-2 border-gray-200 px-4 py-2.5 rounded-xl hover:border-gray-400 transition-colors">
              <Filter size={16} /> Filtrer
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative rounded-2xl overflow-hidden border-2 border-gray-200 hover:border-gray-900 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className={`${photo.bg} h-44 flex items-center justify-center`}>
                  <photo.icon size={36} className="text-gray-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="p-3 bg-white">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">{photo.titre}</p>
                  <p className="text-xs font-semibold text-gray-400 mt-0.5">{photo.lieu}</p>
                </div>
                <div className="absolute inset-0 bg-gray-900/0 group-hover:bg-gray-900/10 transition-all rounded-2xl" />
              </div>
            ))}
          </div>

          {/* Charger plus */}
          <div className="flex justify-center mt-10">
            <button className="flex items-center gap-2 bg-white border-2 border-gray-900 text-gray-900 font-black text-base px-7 py-3.5 rounded-xl hover:bg-gray-900 hover:text-white transition-all">
              Charger plus de photos <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ===== PLAYER GLOBAL ===== */}
      {activeEpisode && (
        <PlayerBar
          episode={activeEpisode}
          playing={playing}
          onToggle={() => setPlaying(!playing)}
          onClose={() => { setActiveEpisode(null); setPlaying(false); }}
        />
      )}
    </div>
  );
}