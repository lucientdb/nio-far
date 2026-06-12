"use client";
import { useState } from "react";
import Link from "next/link";
import {
  User, Mail, Lock, Eye, EyeOff, CheckCircle,
  ArrowRight, ChevronRight, Accessibility,
  Briefcase, Heart, BookOpen, AlertCircle
} from "lucide-react";

// ---- Types ----
type Etape = 1 | 2 | 3;
type Profil = "personne" | "association" | "recruteur" | "expert" | "";

// ---- Données ----
const profils: {
  key: Profil;
  label: string;
  desc: string;
  icon: typeof User;
}[] = [
  {
    key: "personne",
    label: "Personne en situation de handicap",
    desc: "Accédez aux offres, forum, ressources et témoignages.",
    icon: Accessibility,
  },
  {
    key: "association",
    label: "Association ou ONG",
    desc: "Publiez des actualités, gérez votre page et vos événements.",
    icon: Heart,
  },
  {
    key: "recruteur",
    label: "Recruteur / Entreprise",
    desc: "Publiez des offres d'emploi adaptées et recrutez.",
    icon: Briefcase,
  },
  {
    key: "expert",
    label: "Expert ou professionnel",
    desc: "Rejoignez l'annuaire et proposez vos services.",
    icon: BookOpen,
  },
];

const avantages = [
  "Accès à 180+ offres d'emploi adaptées",
  "Forum communautaire actif",
  "Annuaire de 56 experts certifiés",
  "Ressources juridiques et sociales",
  "Témoignages et podcasts",
  "Alertes emploi personnalisées",
];

const villes = [
  "Dakar", "Saint-Louis", "Thiès", "Ziguinchor",
  "Kaolack", "Mbour", "Touba", "Rufisque", "Autre",
];

const typesHandicap = [
  { val: "Moteur", label: "Handicap moteur" },
  { val: "Visuel", label: "Déficience visuelle" },
  { val: "Auditif", label: "Déficience auditive" },
  { val: "Psychique", label: "Handicap psychique" },
  { val: "Cognitif", label: "Handicap cognitif" },
  { val: "Autre", label: "Autre" },
];

export default function InscriptionPage() {
  const [etape, setEtape] = useState<Etape>(1);
  const [profil, setProfil] = useState<Profil>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    password: "",
    confirm: "",
    ville: "",
    handicap: "",
    cgu: false,
  });

  const setField = (key: keyof typeof form, val: string | boolean) =>
    setForm(prev => ({ ...prev, [key]: val }));

  // ---- Validation mot de passe ----
  const pwRules = [
    { label: "8 caractères minimum", ok: form.password.length >= 8 },
    { label: "Une lettre majuscule", ok: /[A-Z]/.test(form.password) },
    { label: "Un chiffre", ok: /[0-9]/.test(form.password) },
  ];
  const pwOk = pwRules.every(r => r.ok);
  const confirmOk = form.password === form.confirm && form.confirm !== "";

  const etape1Ok = profil !== "";
  const etape2Ok =
    form.prenom.trim() !== "" &&
    form.nom.trim() !== "" &&
    form.email.trim() !== "" &&
    pwOk &&
    confirmOk &&
    form.cgu;

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ===== PANNEAU GAUCHE ===== */}
      <div className="hidden lg:flex w-96 flex-shrink-0 bg-gray-900 flex-col justify-between p-10">
        <div>
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center">
              <Accessibility size={20} className="text-gray-900" />
            </div>
            <span className="text-white font-black text-lg">Inclusif Sénégal</span>
          </Link>
          <h2 className="text-3xl font-black text-white leading-tight mb-3">
            Rejoignez une communauté qui vous ressemble
          </h2>
          <p className="text-base font-semibold text-gray-400 leading-relaxed mb-10">
            Gratuit, accessible, pensé pour vous. Inscription en moins de 2 minutes.
          </p>
          <div className="flex flex-col gap-4">
            {avantages.map((a, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
                <span className="text-base font-semibold text-gray-300">{a}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t-2 border-gray-800 pt-6">
          <p className="text-sm font-semibold text-gray-500">
            Déjà membre ?{" "}
            <Link href="/connexion" className="text-white font-black hover:underline">
              Se connecter →
            </Link>
          </p>
        </div>
      </div>

      {/* ===== PANNEAU DROIT ===== */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 py-12 overflow-y-auto">
        <div className="w-full max-w-lg">

          {/* Logo mobile */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <Accessibility size={16} className="text-white" />
            </div>
            <span className="font-black text-gray-900">Inclusif Sénégal</span>
          </Link>

          {/* Barre de progression */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-2xl font-black text-gray-900">Créer mon compte</h1>
              <span className="text-sm font-bold text-gray-400">Étape {etape} / 3</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-2 bg-gray-900 rounded-full transition-all duration-500"
                style={{ width: `${(etape / 3) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              {["Votre profil", "Vos infos", "Confirmation"].map((label, i) => (
                <span
                  key={label}
                  className={`text-xs font-bold transition-colors ${
                    etape > i ? "text-gray-900" : "text-gray-300"
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* ===== ÉTAPE 1 : Choix du profil ===== */}
          {etape === 1 && (
            <div className="flex flex-col gap-4">
              <p className="text-base font-bold text-gray-500 mb-2">
                Quel type de compte souhaitez-vous créer ?
              </p>
              {profils.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setProfil(p.key)}
                  className={`flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all ${
                    profil === p.key
                      ? "border-gray-900 bg-gray-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-gray-400 hover:shadow-sm"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    profil === p.key ? "bg-gray-900" : "bg-gray-100"
                  }`}>
                    <p.icon size={22} className={profil === p.key ? "text-white" : "text-gray-500"} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-base font-black text-gray-900">{p.label}</span>
                      {profil === p.key && (
                        <CheckCircle size={18} className="text-emerald-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-500 mt-1 leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                </button>
              ))}

              <button
                onClick={() => setEtape(2)}
                disabled={!etape1Ok}
                className="w-full bg-gray-900 text-white font-black text-base py-4 rounded-xl hover:bg-gray-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 hover:shadow-lg"
              >
                Continuer <ChevronRight size={18} />
              </button>

              <p className="text-center text-sm font-semibold text-gray-400 mt-2">
                Déjà membre ?{" "}
                <Link href="/connexion" className="text-gray-900 font-black hover:underline">
                  Se connecter →
                </Link>
              </p>
            </div>
          )}

          {/* ===== ÉTAPE 2 : Informations ===== */}
          {etape === 2 && (
            <div className="flex flex-col gap-5">
              <p className="text-base font-bold text-gray-500 mb-1">
                Vos informations personnelles
              </p>

              {/* Prénom + Nom */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-black text-gray-700 block mb-2">
                    Prénom *
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      value={form.prenom}
                      onChange={e => setField("prenom", e.target.value)}
                      placeholder="Aminata"
                      autoComplete="given-name"
                      className="w-full pl-10 pr-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-black text-gray-700 block mb-2">
                    Nom *
                  </label>
                  <input
                    value={form.nom}
                    onChange={e => setField("nom", e.target.value)}
                    placeholder="Mbaye"
                    autoComplete="family-name"
                    className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-black text-gray-700 block mb-2">
                  Adresse email *
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setField("email", e.target.value)}
                    placeholder="aminata@email.com"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Ville */}
              <div>
                <label className="text-sm font-black text-gray-700 block mb-2">
                  Ville
                </label>
                <select
                  value={form.ville}
                  onChange={e => setField("ville", e.target.value)}
                  className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold bg-white appearance-none cursor-pointer"
                >
                  <option value="">Sélectionner votre ville</option>
                  {villes.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              {/* Type de handicap — uniquement pour "personne" */}
              {profil === "personne" && (
                <div>
                  <label className="text-sm font-black text-gray-700 block mb-2">
                    Type de handicap{" "}
                    <span className="text-gray-400 font-semibold">(optionnel)</span>
                  </label>
                  <select
                    value={form.handicap}
                    onChange={e => setField("handicap", e.target.value)}
                    className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold bg-white appearance-none cursor-pointer"
                  >
                    <option value="">Préférer ne pas préciser</option>
                    {typesHandicap.map(h => (
                      <option key={h.val} value={h.val}>{h.label}</option>
                    ))}
                  </select>
                  <div className="flex items-start gap-1.5 mt-2">
                    <AlertCircle size={13} className="text-gray-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold text-gray-400 leading-relaxed">
                      Information confidentielle. Sert uniquement à personnaliser
                      votre expérience et à vous proposer des offres adaptées.
                    </p>
                  </div>
                </div>
              )}

              {/* Mot de passe */}
              <div>
                <label className="text-sm font-black text-gray-700 block mb-2">
                  Mot de passe *
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={e => setField("password", e.target.value)}
                    placeholder="Minimum 8 caractères"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-12 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Règles */}
                {form.password && (
                  <div className="mt-3 flex flex-col gap-2">
                    {pwRules.map(r => (
                      <div key={r.label} className="flex items-center gap-2">
                        <CheckCircle
                          size={14}
                          className={r.ok ? "text-emerald-600" : "text-gray-200"}
                        />
                        <span className={`text-sm font-semibold transition-colors ${
                          r.ok ? "text-emerald-700" : "text-gray-400"
                        }`}>
                          {r.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirmation mot de passe */}
              <div>
                <label className="text-sm font-black text-gray-700 block mb-2">
                  Confirmer le mot de passe *
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={form.confirm}
                    onChange={e => setField("confirm", e.target.value)}
                    placeholder="Répétez votre mot de passe"
                    autoComplete="new-password"
                    className={`w-full pl-10 pr-12 py-3.5 text-base border-2 rounded-xl focus:outline-none transition-all font-semibold ${
                      form.confirm
                        ? confirmOk
                          ? "border-emerald-400 focus:border-emerald-500"
                          : "border-red-300 focus:border-red-400"
                        : "border-gray-200 focus:border-gray-900"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={showConfirm ? "Masquer" : "Afficher"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {form.confirm && !confirmOk && (
                  <p className="text-sm font-bold text-red-500 mt-1.5 flex items-center gap-1.5">
                    <AlertCircle size={13} /> Les mots de passe ne correspondent pas
                  </p>
                )}
                {form.confirm && confirmOk && (
                  <p className="text-sm font-bold text-emerald-600 mt-1.5 flex items-center gap-1.5">
                    <CheckCircle size={13} /> Mots de passe identiques
                  </p>
                )}
              </div>

              {/* CGU */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div
                  role="checkbox"
                  aria-checked={form.cgu}
                  onClick={() => setField("cgu", !form.cgu)}
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all cursor-pointer ${
                    form.cgu
                      ? "bg-gray-900 border-gray-900"
                      : "border-gray-300 group-hover:border-gray-500"
                  }`}
                >
                  {form.cgu && <CheckCircle size={14} className="text-white" />}
                </div>
                <span className="text-sm font-semibold text-gray-600 leading-relaxed">
                  J'accepte les conditions d'utilisation et la politique de confidentialité.
                </span>
              </label>

              <button
                onClick={() => setEtape(3)}
                disabled={!etape2Ok}
                className="w-full bg-gray-900 text-white font-black text-base py-4 rounded-xl hover:bg-gray-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
              >
                Créer mon compte <ArrowRight size={18} />
              </button>
            </div>
          )}

          {etape === 3 && (
            <div className="flex flex-col gap-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="text-center">
                <div className="mx-auto mb-5 h-16 w-16 rounded-3xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle size={28} className="text-emerald-600" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">
                  Inscription terminée
                </h2>
                <p className="text-sm font-semibold text-gray-500 leading-relaxed">
                  Votre compte a bien été créé. Nous vous avons envoyé un email de confirmation.
                </p>
              </div>
              <div className="grid gap-3">
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs uppercase font-black text-gray-400 mb-1">Profil</p>
                  <p className="text-base font-semibold text-gray-900">{profils.find(p => p.key === profil)?.label}</p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs uppercase font-black text-gray-400 mb-1">Email</p>
                  <p className="text-base font-semibold text-gray-900">{form.email}</p>
                </div>
              </div>
              <Link
                href="/connexion"
                className="w-full bg-gray-900 text-white font-black text-base py-4 rounded-xl hover:bg-gray-700 transition-all text-center"
              >
                Aller à la connexion
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
