"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Play, Pause, Clock, X, Camera, Search, Volume2, Video } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getPodcasts, type Podcast } from "@/services/podcasts";
import { getPhotos, type Photo as ApiPhoto } from "@/services/photos";

function formatDuration(seconds?: number) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  return `${m} min`;
}

function getYoutubeId(url: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Suppression de PlayerBar car on utilise les lecteurs natifs
export default function MediasPage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [photos, setPhotos] = useState<ApiPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [photosLoading, setPhotosLoading] = useState(true);
  const [format, setFormat] = useState<"all" | "audio" | "video">("all");
  const [recherche, setRecherche] = useState("");
  const [onglet, setOnglet] = useState<"podcasts" | "galerie">("podcasts");

  useEffect(() => {
    getPodcasts()
      .then((data) => {
        setPodcasts(data);
      })
      .catch(() => setPodcasts([]))
      .finally(() => setLoading(false));

    getPhotos()
      .then(setPhotos)
      .catch(() => setPhotos([]))
      .finally(() => setPhotosLoading(false));
  }, []);

  const filtered = podcasts
    .filter((p) => format === "all" || p.format === format)
    .filter((p) => !recherche || p.titre.toLowerCase().includes(recherche.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b-2 border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <p className="text-sm font-black text-emerald-600 uppercase tracking-widest mb-2">Médias</p>
          <h1 className="text-4xl font-black text-gray-900 mb-3">Podcasts & Galerie</h1>
          <p className="text-lg text-gray-600 font-semibold max-w-xl">
            Écoutez et regardez les contenus publiés par notre équipe.
          </p>

          <div className="flex gap-1 mt-8 bg-gray-100 p-1 rounded-xl w-fit">
            {([
              { key: "podcasts" as const, label: "Podcasts", icon: Mic },
              { key: "galerie" as const, label: "Galerie photo", icon: Camera },
            ]).map((o) => (
              <button
                key={o.key}
                onClick={() => setOnglet(o.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-base font-bold transition-all ${
                  onglet === o.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                }`}
              >
                <o.icon size={18} />
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {onglet === "podcasts" ? (
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher un épisode..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "audio", "video"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`px-4 py-2 rounded-xl font-bold text-sm ${
                    format === f ? "bg-emerald-700 text-white" : "bg-white border text-gray-600"
                  }`}
                >
                  {f === "all" ? "Tous" : f === "audio" ? "Audio" : "Vidéo"}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="text-gray-500 text-center py-12">Chargement des podcasts...</p>
          ) : filtered.length === 0 ? (
            <p className="text-gray-500 text-center py-12">Aucun podcast disponible pour le moment.</p>
          ) : (
            <div className="space-y-4">
              {filtered.map((p) => (
                <article
                  key={p.id}
                  className="bg-white border border-gray-200 rounded-2xl p-5 transition-all hover:shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      {p.format === "video" ? <Video size={24} /> : <Mic size={24} />}
                    </div>
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          p.format === "video" ? "bg-emerald-100 text-emerald-800" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {p.format === "video" ? "Vidéo" : "Audio"}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-2">{p.titre}</h3>
                      {p.description && (
                        <p className="text-sm text-gray-500 mb-3">{p.description}</p>
                      )}
                      <span className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
                        <Clock size={14} />
                        {formatDuration(p.duree_secondes)} · {new Date(p.cree_le).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(",", " à")}
                      </span>
                      
                      <div className="w-full">
                        {(() => {
                          const ytId = getYoutubeId(p.media_url);
                          if (ytId) {
                            return (
                              <iframe
                                className="w-full rounded-xl aspect-video shadow-sm"
                                src={`https://www.youtube.com/embed/${ytId}`}
                                title={p.titre}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            );
                          }
                          return p.format === "video" ? (
                            <video controls src={p.media_url} className="w-full rounded-xl aspect-video bg-black outline-none shadow-sm" />
                          ) : (
                            <audio controls src={p.media_url} className="w-full outline-none" />
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-6 py-10">
          {photosLoading ? (
            <p className="text-center text-gray-500 py-12">Chargement de la galerie...</p>
          ) : photos.length === 0 ? (
            <p className="text-center text-gray-500 py-12">Aucune photo dans la galerie pour le moment.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {photos.map((ph) => (
                <div key={ph.id} className="rounded-2xl overflow-hidden border border-gray-200 aspect-square relative group">
                  <img src={ph.image_url} alt={ph.titre} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                    <p className="font-bold text-white">{ph.titre}</p>
                    {ph.lieu && <p className="text-sm text-gray-200">{ph.lieu}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


    </div>
  );
}
