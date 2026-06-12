"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Clock,
  Heart,
  MapPin,
  MessageCircle,
  Mic,
  Play,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const rubriques: Array<{
  href: string;
  icon: LucideIcon;
  label: string;
  desc: string;
  count: string;
  color: string;
}> = [
  { href: "/forum", icon: MessageCircle, label: "Forum & communauté", desc: "Échanges, questions, soutien entre membres.", count: "342 discussions", color: "emerald" },
  { href: "/medias", icon: Mic, label: "Médias & podcasts", desc: "Épisodes audio, galerie photo et vidéo.", count: "12 épisodes", color: "purple" },
  { href: "/emploi", icon: Briefcase, label: "Emploi & opportunités", desc: "Offres adaptées, stages, bénévolat.", count: "180 offres", color: "amber" },
  { href: "/temoignages", icon: Heart, label: "Témoignages", desc: "Parcours réels et histoires inspirantes.", count: "64 histoires", color: "rose" },
  { href: "/education", icon: BookOpen, label: "Éducation & experts", desc: "Guides, ressources et annuaire.", count: "56 experts", color: "blue" },
  { href: "/profil", icon: Users, label: "Mon profil", desc: "Accédez à votre profil, publications et informations personnelles.", count: "Profil", color: "emerald" },
  { href: "/services", icon: ShieldCheck, label: "Services & droits", desc: "ANPPH, FAIS, aide juridique, santé.", count: "18 services", color: "green" },
];

const colorMap: Record<string, { bg: string; text: string; border: string; pill: string }> = {
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "hover:border-emerald-300", pill: "bg-emerald-100 text-emerald-700" },
  purple: { bg: "bg-purple-50", text: "text-purple-700", border: "hover:border-purple-300", pill: "bg-purple-100 text-purple-700" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", border: "hover:border-amber-300", pill: "bg-amber-100 text-amber-700" },
  rose: { bg: "bg-rose-50", text: "text-rose-700", border: "hover:border-rose-300", pill: "bg-rose-100 text-rose-700" },
  blue: { bg: "bg-blue-50", text: "text-blue-700", border: "hover:border-blue-300", pill: "bg-blue-100 text-blue-700" },
  green: { bg: "bg-green-50", text: "text-green-700", border: "hover:border-green-300", pill: "bg-green-100 text-green-700" },
};

const stats = [
  { n: "2 400+", l: "Membres inscrits", icon: Users },
  { n: "180+", l: "Offres d'emploi", icon: Briefcase },
  { n: "56", l: "Experts référencés", icon: BookOpen },
  { n: "12", l: "Épisodes podcast", icon: Mic },
];

const offres = [
  { sigle: "ONG", bg: "bg-emerald-100 text-emerald-800", titre: "Chargé(e) de communication inclusive", co: "ONG Inclusion Sénégal · Dakar", tags: ["CDI", "Télétravail"], nouveau: true },
  { sigle: "BNQ", bg: "bg-blue-100 text-blue-800", titre: "Assistant(e) ressources humaines", co: "Banque de l'Habitat · Saint-Louis", tags: ["CDD 12 mois", "PMR bienvenu"], nouveau: true },
  { sigle: "STA", bg: "bg-purple-100 text-purple-800", titre: "Stagiaire développeur web", co: "StartupTech SN · Thiès", tags: ["Stage 6 mois", "Accessible PMR"], nouveau: false },
];

const temoignages = [
  { initiales: "AM", nom: "Aminata M., 28 ans", sub: "Malvoyante · Ingénieure · Dakar", texte: "Grâce à cette plateforme, j'ai trouvé un emploi adapté et un réseau incroyable. Ma différence est devenue ma force.", bg: "bg-emerald-100 text-emerald-800" },
  { initiales: "MS", nom: "Moussa S., 35 ans", sub: "Handicap moteur · Entrepreneur · Saint-Louis", texte: "Le forum m'a mis en contact avec un avocat spécialisé. Aujourd'hui j'emploie 4 personnes dans mon entreprise textile.", bg: "bg-blue-100 text-blue-800" },
  { initiales: "KD", nom: "Khadija D., 19 ans", sub: "Déficience auditive · Étudiante · Thiès", texte: "Les ressources et le contact avec d'autres jeunes handicapés m'ont donné confiance pour poursuivre mes études en droit.", bg: "bg-purple-100 text-purple-800" },
];

export default function HomePage() {
  const [temoignageIdx, setTemoignageIdx] = useState(0);
  const t = temoignages[temoignageIdx];

  return (
    <div className="min-h-screen bg-white">

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden border-b border-gray-100">
        {/* Fond décoratif */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-blue-50 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100 rounded-full opacity-20 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100 rounded-full opacity-20 translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 bg-white border-2 border-emerald-700 text-emerald-800 text-sm font-bold px-3 py-1.5 rounded-full mb-5 shadow-md">
              <span className="w-2 h-2 bg-emerald-700 rounded-full animate-pulse" />
              <MapPin className="h-4 w-4" /> Sénégal · Plateforme citoyenne
            </span>
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight mb-4">
              Ensemble,{" "}
              <span className="text-emerald-700 relative">
                bâtissons
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-emerald-700 rounded-full" />
              </span>{" "}
              une société inclusive
            </h1>
            <p className="text-lg md:text-xl text-gray-800 leading-relaxed mb-8 max-w-xl font-semibold">
              Ressources, communauté, emploi et droits pour les personnes en situation de handicap au Sénégal. Gratuit, accessible, pensé pour vous.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/inscription"
                className="inline-flex items-center gap-2 bg-emerald-700 text-white text-lg font-black px-7 py-4 rounded-2xl hover:bg-emerald-800 transition-all hover:shadow-xl hover:-translate-y-1 border-2 border-emerald-900"
              >
                <Users className="h-6 w-6" /> Rejoindre la communauté
              </Link>
            </div>

            {/* Mini stats sous le CTA */}
            <div className="flex flex-wrap items-center gap-4 mt-8 pt-6 border-t border-gray-100">
              {stats.map((s) => (
                <div key={s.l} className="flex items-center gap-2 min-w-[150px]">
                  <s.icon className="h-5 w-5 text-emerald-600" />
                  <div>
                    <div className="text-base font-semibold text-gray-900">{s.n}</div>
                    <div className="text-sm text-gray-400">{s.l}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Illustration droite */}
          <div className="hidden md:flex items-center justify-center">
            <div className="relative">
              <div className="w-64 h-64 rounded-full bg-emerald-700 flex items-center justify-center shadow-xl border-4 border-emerald-900">
                <Users className="h-32 w-32 text-white" />
              </div>
              {/* Bulles flottantes */}
              <div className="absolute -top-4 -right-4 bg-white border-2 border-emerald-700 rounded-2xl px-4 py-3 shadow-lg text-base flex items-center gap-3 font-bold text-gray-900">
                <Briefcase className="h-5 w-5 text-emerald-700" />
                <span>180 offres</span>
              </div>
              <div className="absolute -bottom-4 -left-6 bg-white border-2 border-emerald-700 rounded-2xl px-4 py-3 shadow-lg text-base flex items-center gap-3 font-bold text-gray-900">
                <MessageCircle className="h-5 w-5 text-emerald-700" />
                <span>342 discussions</span>
              </div>
              <div className="absolute top-1/2 -right-10 bg-emerald-700 text-white rounded-2xl px-4 py-3 shadow-lg text-base flex items-center gap-3 font-bold border-2 border-emerald-900">
                <BookOpen className="h-5 w-5" />
                <span>56 experts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== RUBRIQUES ===== */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-sm font-black text-emerald-800 uppercase tracking-widest mb-2">La plateforme</p>
            <h2 className="text-4xl font-black text-gray-900">Tout ce dont vous avez besoin</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rubriques.map((r) => {
            const c = colorMap[r.color];
            return (
              <Link
                key={r.href}
                href={r.href}
                className={`group border-2 border-gray-400 ${c.border} rounded-2xl p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 flex flex-col gap-4 bg-white hover:border-emerald-700`}
              >
                <div className={`w-14 h-14 ${c.bg} rounded-xl flex items-center justify-center`}>
                  <r.icon className="h-8 w-8 text-current font-bold" />
                </div>
                <div>
                  <h3 className={`text-lg font-black text-gray-900 mb-2 group-hover:${c.text} transition-colors`}>
                    {r.label}
                  </h3>
                  <p className="text-base text-gray-800 leading-relaxed font-semibold">{r.desc}</p>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <span className={`text-sm font-black px-3 py-1.5 rounded-lg border border-current ${c.pill}`}>{r.count}</span>
                  <span className={`text-base ${c.text} opacity-0 group-hover:opacity-100 transition-opacity font-black`}>Voir →</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ===== PODCAST + TÉMOIGNAGE ===== */}
      <section className="bg-gray-50 border-y border-gray-100 py-14">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-8">

          {/* Podcast */}
          <div>
            <p className="text-sm font-semibold text-purple-600 uppercase tracking-widest mb-1">Médias</p>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-5">Podcast à la une</h2>
            <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Mic className="h-8 w-8 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="inline-block text-xs font-medium bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full mb-2">
                    Épisode 12
                  </span>
                  <h3 className="text-base font-semibold text-gray-900 leading-snug mb-1">
                    Vivre avec un handicap moteur à Dakar — le parcours de Moussa
                  </h3>
                  <p className="text-sm text-gray-400 flex items-center gap-1.5"><Clock className="h-4 w-4" /> 28 min · 2 mai 2025</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button
                  aria-label="Écouter"
                  className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white hover:bg-emerald-700 transition-colors flex-shrink-0 hover:scale-105"
                >
                  <Play className="h-4 w-4" />
                </button>
                <div className="flex-1">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-1.5 bg-emerald-500 rounded-full w-[30%]" />
                  </div>
                  <div className="flex justify-between text-xs text-gray-300 mt-1">
                    <span>8:24</span><span>28:00</span>
                  </div>
                </div>
              </div>
              <Link href="/medias" className="mt-4 flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-purple-600 transition-colors border-t border-gray-100 pt-3">
                Voir tous les épisodes →
              </Link>
            </div>
          </div>

          {/* Témoignage interactif */}
          <div>
            <p className="text-sm font-semibold text-rose-600 uppercase tracking-widest mb-1">Communauté</p>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-5">Ils témoignent</h2>
            <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
              <p className="text-4xl text-emerald-200 font-serif leading-none mb-3">"</p>
              <p className="text-base text-gray-600 leading-relaxed italic font-serif mb-5 min-h-[88px]">
                {t.texte}
              </p>
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${t.bg}`}>
                    {t.initiales}
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-900">{t.nom}</div>
                    <div className="text-xs text-gray-400">{t.sub}</div>
                  </div>
                </div>
                {/* Navigation entre témoignages */}
                <div className="flex items-center gap-1.5">
                  {temoignages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setTemoignageIdx(i)}
                      aria-label={`Témoignage ${i + 1}`}
                      className={`w-2 h-2 rounded-full transition-all ${i === temoignageIdx ? "bg-emerald-600 w-4" : "bg-gray-200 hover:bg-gray-300"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== OFFRES D'EMPLOI ===== */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-medium text-amber-600 uppercase tracking-widest mb-1">Emploi</p>
            <h2 className="text-3xl font-semibold text-gray-900">Offres récentes</h2>
          </div>
          <Link href="/emploi" className="text-sm text-emerald-600 hover:underline">Voir toutes les offres →</Link>
        </div>
        <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-400">3 nouvelles offres aujourd'hui</span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">180 actives</span>
          </div>
          {offres.map((o, i) => (
            <Link
              key={i}
              href="/emploi"
              className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-medium flex-shrink-0 ${o.bg}`}>
                {o.sigle}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 group-hover:text-emerald-700 transition-colors truncate">
                  {o.titre}
                </div>
                <div className="text-xs text-gray-400 mb-1.5">{o.co}</div>
                <div className="flex gap-1.5 flex-wrap">
                  {o.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {o.nouveau && (
                  <span className="text-xs bg-emerald-50 text-emerald-700 font-medium px-2.5 py-1 rounded-full">
                    Nouveau
                  </span>
                )}
                <span className="text-gray-300 group-hover:text-emerald-500 transition-colors text-lg">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="relative overflow-hidden bg-emerald-600 rounded-3xl px-8 py-12 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-700 pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative">
            <p className="text-emerald-200 text-sm mb-3">Rejoignez 2 400+ membres</p>
            <h2 className="text-3xl font-medium text-white mb-4">
              Prêt à rejoindre la communauté ?
            </h2>
            <p className="text-emerald-100 text-sm mb-8 max-w-md mx-auto">
              Inscription gratuite, accès immédiat à toutes les ressources, forum, offres d'emploi et experts.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/inscription"
                className="inline-flex items-center gap-2 bg-white text-emerald-700 font-semibold text-base px-6 py-3 rounded-xl hover:bg-emerald-50 transition-all hover:shadow-md"
              >
                <Sparkles className="h-4 w-4" /> Créer mon compte gratuitement
              </Link>
              <Link
                href="/forum"
                className="inline-flex items-center gap-2 border border-emerald-400 text-white text-base px-6 py-3 rounded-xl hover:bg-emerald-500 transition-all"
              >
                Explorer le forum <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}