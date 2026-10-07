"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getDashboardPath, getToken, getStoredUser } from "@/lib/auth";
import { getApiBaseUrl } from "@/lib/config";
import {
  User, Mail, Lock, Eye, EyeOff, CheckCircle,
  ArrowRight, ArrowLeft, ChevronRight, Accessibility,
  Briefcase, Heart, BookOpen, AlertCircle
} from "lucide-react";

// ---- Types ----
type Etape = 1 | 2 | 3 | 4;
type Profil = "personne" | "organisation" | "expert" | "";

// ---- Données ----
const profils: {
  key: Profil;
  label: string;
  desc: string;
  icon: typeof User;
}[] = [
  {
    key: "personne",
    label: "Utilisateur / Personne en situation de handicap",
    desc: "Accédez aux offres, forum, ressources et témoignages.",
    icon: Accessibility,
  },
  {
    key: "organisation",
    label: "Organisation (Entreprise, ONG, Association)",
    desc: "Publiez des offres d'emploi, gérez vos événements et actualités.",
    icon: Briefcase,
  },
  {
    key: "expert",
    label: "Expert ou professionnel",
    desc: "Rejoignez l'annuaire et proposez vos services.",
    icon: BookOpen,
  },
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
  { val: "Neant", label: "Aucun handicap" },
  { val: "Autre", label: "Autre" },
];

export default function InscriptionPage() {
  const [etape, setEtape] = useState<Etape>(1);
  const [profil, setProfil] = useState<Profil>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const router = useRouter();

  // Auto-avancer à l'étape 2 quand un profil est sélectionné
  useEffect(() => {
    if (profil && etape === 1) {
      // Petit délai pour l'animation visuelle
      const timer = setTimeout(() => {
        setEtape(2);
        // Scroll vers le haut de la zone de formulaire
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [profil, etape]);

  useEffect(() => {
    fetch(`${getApiBaseUrl()}/api/stats/public`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const token = getToken();
    const user = getStoredUser();
    if (token && user) {
      router.replace(getDashboardPath(user.role));
    }
  }, [router]);

  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    username: "",
    email: "",
    mot_de_passe: "",
    confirm: "",
    ville: "",
    ville_autre: "", // Pour saisie libre quand "Autre" est sélectionné
    type_handicap: "",
    type_organisation: "", // "entreprise", "ong", "association"
    entreprise_nom: "",
    contact: "",
    domaine_intervention: "",
    specialite: "",
    cgu: false,
  });

  const setField = (key: keyof typeof form, val: string | boolean) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const [loadingCreate, setLoadingCreate] = useState(false);
  const [erreurCreate, setErreurCreate] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const API = getApiBaseUrl();

  const createAccount = async () => {
    if (!etape2Ok) return;
    setLoadingCreate(true);
    setErreurCreate("");
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: form.nom,
          prenom: form.prenom,
          username: form.username,
          email: form.email,
          mot_de_passe: form.mot_de_passe,
          profil: profil === "organisation" ? (form.type_organisation === "entreprise" ? "recruteur" : "association") : (profil || "personne"),
          type_handicap: form.type_handicap,
          ville: form.ville === "Autre" ? form.ville_autre : form.ville,
          bio: "",
          entreprise_nom: form.entreprise_nom,
          contact: form.contact,
          domaine_intervention: form.domaine_intervention,
          specialite: form.specialite,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const detail = typeof data.detail === "string" ? data.detail : data.detail?.message || "Erreur lors de l'inscription";
        throw new Error(detail);
      }

      // Pas de token tant que l'email n'est pas vérifié
      setOtpCode("");
      setEtape(3);
      setResendCooldown(60);
    } catch (err: unknown) {
      setErreurCreate(err instanceof Error ? err.message : String(err));
    } finally {
      setLoadingCreate(false);
    }
  };

  const verifyOtp = async () => {
    if (otpCode.length < 6) {
      setErreurCreate("Saisissez le code à 6 chiffres reçu par email.");
      return;
    }
    setLoadingOtp(true);
    setErreurCreate("");
    try {
      const res = await fetch(`${API}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, code: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        const detail = typeof data.detail === "string" ? data.detail : "Code incorrect";
        throw new Error(detail);
      }
      localStorage.setItem("token", data.access_token || "");
      localStorage.setItem("refresh_token", data.refresh_token || "");
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("auth-change"));
      setEtape(4);
    } catch (err: unknown) {
      setErreurCreate(err instanceof Error ? err.message : String(err));
    } finally {
      setLoadingOtp(false);
    }
  };

  const resendOtp = async () => {
    if (resendCooldown > 0) return;
    setErreurCreate("");
    try {
      const res = await fetch(`${API}/api/auth/resend-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data.detail === "string" ? data.detail : "Impossible de renvoyer le code");
      setResendCooldown(60);
    } catch (err: unknown) {
      setErreurCreate(err instanceof Error ? err.message : String(err));
    }
  };

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((d) => d - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // ---- Validation mot de passe ----
  const pwRules = [
    { label: "8 caractères minimum", ok: form.mot_de_passe.length >= 8 },
    { label: "Une lettre majuscule", ok: /[A-Z]/.test(form.mot_de_passe) },
    { label: "Un chiffre", ok: /[0-9]/.test(form.mot_de_passe) },
  ];
  const pwOk = pwRules.every(r => r.ok);
  const confirmOk = form.mot_de_passe === form.confirm && form.confirm !== "";

  const etape1Ok = profil !== "";
  const etape2Ok = (() => {
    if (profil === "organisation") {
      return (
        form.username.trim() !== "" &&
        form.type_organisation.trim() !== "" &&
        form.entreprise_nom.trim() !== "" &&
        form.contact.trim() !== "" &&
        form.email.trim() !== "" &&
        pwOk &&
        confirmOk &&
        form.cgu
      );
    }
    if (profil === "expert") {
      return (
        form.username.trim() !== "" &&
        form.nom.trim() !== "" &&
        form.prenom.trim() !== "" &&
        form.specialite.trim() !== "" &&
        form.contact.trim() !== "" &&
        form.email.trim() !== "" &&
        pwOk &&
        confirmOk &&
        form.cgu
      );
    }
    return (
      form.username.trim() !== "" &&
      form.prenom.trim() !== "" &&
      form.nom.trim() !== "" &&
      form.email.trim() !== "" &&
      pwOk &&
      confirmOk &&
      form.cgu
    );
  })();

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ===== PANNEAU GAUCHE ===== */}
      <div className="hidden lg:flex w-96 flex-shrink-0 bg-gray-900 flex-col justify-between p-10">
        <div>
          <Link href="/" className="flex items-center gap-3 mb-12">
            <img src="/logo.png" alt="Logo Nio Far" className="h-20 w-auto object-contain bg-white rounded-xl p-2" />
            <span className="text-white font-black text-3xl">Nio Far</span>
          </Link>
          <h2 className="text-3xl font-black text-white leading-tight mb-3">
            Rejoignez une communauté qui vous ressemble
          </h2>
          <p className="text-base font-semibold text-gray-400 leading-relaxed mb-10">
            Gratuit, accessible, pensé pour vous. Inscription en moins de 2 minutes.
          </p>
          <div className="flex flex-col gap-4">
            {[
              `Accès à ${stats ? stats.jobs_count : "de nombreuses"} offres d'emploi adaptées`,
              "Forum communautaire actif",
              `Annuaire de ${stats ? stats.experts_count : "plusieurs"} experts certifiés`,
              "Ressources juridiques et sociales",
              "Témoignages et podcasts",
              "Alertes emploi personnalisées",
            ].map((a, i) => (
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
            <Link href="/connexion" className="text-emerald-400 font-black hover:underline">
              Se connecter →
            </Link>
          </p>
        </div>
      </div>

      {/* ===== PANNEAU DROIT - LAYOUT FIXE ===== */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER FIXE */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-6">
          <div className="max-w-lg mx-auto">
            {/* Logo mobile */}
            <Link href="/" className="flex items-center gap-3 mb-6 lg:hidden">
              <img src="/logo.png" alt="Logo Nio Far" className="h-12 w-auto object-contain bg-white rounded-xl p-1 border border-gray-200" />
              <span className="font-black text-gray-900 text-2xl">Nio Far</span>
            </Link>

            {/* Barre de progression */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-2xl font-black text-gray-900">Créer mon compte</h1>
                <span className="text-sm font-bold text-gray-400">Étape {Math.min(etape, 3)} / 3</span>
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
          </div>
        </div>

        {/* ZONE SCROLLABLE */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-lg mx-auto">

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
            </div>
          )}

          {/* ===== ÉTAPE 2 : Informations ===== */}
          {etape === 2 && (
            <div className="flex flex-col gap-5">
              <p className="text-base font-bold text-gray-500 mb-1">Vos informations personnelles</p>

              {/* ORGANISATION (ENTREPRISE / ONG / ASSOCIATION) */}
              {profil === "organisation" && (
                <>
                  <div>
                    <label className="text-sm font-black text-gray-700 block mb-2">Type d'organisation *</label>
                    <select
                      value={form.type_organisation}
                      onChange={e => setField("type_organisation", e.target.value)}
                      className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold bg-white appearance-none cursor-pointer"
                    >
                      <option value="">Sélectionner le type</option>
                      <option value="entreprise">Entreprise / Recruteur</option>
                      <option value="ong">ONG</option>
                      <option value="association">Association</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-black text-gray-700 block mb-2">Nom d'utilisateur *</label>
                    <input
                      value={form.username}
                      onChange={e => setField("username", e.target.value)}
                      placeholder="Nom d'utilisateur"
                      className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-black text-gray-700 block mb-2">
                      Nom de l'organisation *
                    </label>
                    <input
                      value={form.entreprise_nom}
                      onChange={e => setField("entreprise_nom", e.target.value)}
                      placeholder={
                        form.type_organisation === "entreprise" 
                          ? "Nom de l'entreprise" 
                          : form.type_organisation === "ong"
                          ? "Nom de l'ONG"
                          : form.type_organisation === "association"
                          ? "Nom de l'association"
                          : "Nom de l'organisation"
                      }
                      className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-black text-gray-700 block mb-2">Contact (téléphone) *</label>
                    <input
                      value={form.contact}
                      onChange={e => setField("contact", e.target.value)}
                      placeholder="+221 77 123 45 67"
                      className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-black text-gray-700 block mb-2">Adresse email *</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setField("email", e.target.value)}
                        placeholder="contact@organisation.com"
                        className="w-full pl-10 pr-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-black text-gray-700 block mb-2">Ville</label>
                    <select
                      value={form.ville}
                      onChange={e => setField("ville", e.target.value)}
                      className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold bg-white appearance-none cursor-pointer"
                    >
                      <option value="">Sélectionner la ville</option>
                      {villes.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                    {form.ville === "Autre" && (
                      <input
                        value={form.ville_autre}
                        onChange={e => setField("ville_autre", e.target.value)}
                        placeholder="Saisissez votre ville"
                        className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold mt-3"
                      />
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-black text-gray-700 block mb-2">Domaine d'intervention</label>
                    <input
                      value={form.domaine_intervention}
                      onChange={e => setField("domaine_intervention", e.target.value)}
                      placeholder="Ex: Inclusion en entreprise, Formation, Aide sociale"
                      className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold"
                    />
                  </div>
                </>
              )}

              {/* EXPERT */}
              {profil === "expert" && (
                <>
                  <div>
                    <label className="text-sm font-black text-gray-700 block mb-2">Nom d'utilisateur *</label>
                    <input
                      value={form.username}
                      onChange={e => setField("username", e.target.value)}
                      placeholder="Nom d'utilisateur"
                      className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-black text-gray-700 block mb-2">Prénom *</label>
                      <input
                        value={form.prenom}
                        onChange={e => setField("prenom", e.target.value)}
                        placeholder="Aminata"
                        className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-black text-gray-700 block mb-2">Nom *</label>
                      <input
                        value={form.nom}
                        onChange={e => setField("nom", e.target.value)}
                        placeholder="Mbaye"
                        className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-black text-gray-700 block mb-2">Spécialité *</label>
                    <input
                      value={form.specialite}
                      onChange={e => setField("specialite", e.target.value)}
                      placeholder="Ex: Ergothérapeute, Avocat"
                      className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-black text-gray-700 block mb-2">Contact (téléphone)</label>
                    <input
                      value={form.contact}
                      onChange={e => setField("contact", e.target.value)}
                      placeholder="+221 77 123 45 67"
                      className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-black text-gray-700 block mb-2">Adresse email *</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setField("email", e.target.value)}
                        placeholder="expert@email.com"
                        className="w-full pl-10 pr-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-black text-gray-700 block mb-2">Ville</label>
                    <select
                      value={form.ville}
                      onChange={e => setField("ville", e.target.value)}
                      className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold bg-white appearance-none cursor-pointer"
                    >
                      <option value="">Sélectionner la ville</option>
                      {villes.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                    {form.ville === "Autre" && (
                      <input
                        value={form.ville_autre}
                        onChange={e => setField("ville_autre", e.target.value)}
                        placeholder="Saisissez votre ville"
                        className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold mt-3"
                      />
                    )}
                  </div>
                </>
              )}

              {/* PERSONNE (par défaut) */}
              {profil === "personne" && (
                <>
                  <div>
                    <label className="text-sm font-black text-gray-700 block mb-2">Nom d'utilisateur *</label>
                    <input
                      value={form.username}
                      onChange={e => setField("username", e.target.value)}
                      placeholder="Nom d'utilisateur"
                      className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-black text-gray-700 block mb-2">Prénom *</label>
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
                      <label className="text-sm font-black text-gray-700 block mb-2">Nom *</label>
                      <input
                        value={form.nom}
                        onChange={e => setField("nom", e.target.value)}
                        placeholder="Mbaye"
                        autoComplete="family-name"
                        className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-black text-gray-700 block mb-2">Adresse email *</label>
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

                  <div>
                    <label className="text-sm font-black text-gray-700 block mb-2">Ville</label>
                    <select
                      value={form.ville}
                      onChange={e => setField("ville", e.target.value)}
                      className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold bg-white appearance-none cursor-pointer"
                    >
                      <option value="">Sélectionner votre ville</option>
                      {villes.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                    {form.ville === "Autre" && (
                      <input
                        value={form.ville_autre}
                        onChange={e => setField("ville_autre", e.target.value)}
                        placeholder="Saisissez votre ville"
                        className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold mt-3"
                      />
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-black text-gray-700 block mb-2">Type de handicap <span className="text-gray-400 font-semibold">(optionnel)</span></label>
                    <select
                      value={form.type_handicap}
                      onChange={e => setField("type_handicap", e.target.value)}
                      className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold bg-white appearance-none cursor-pointer"
                    >
                      <option value="">Préférer ne pas préciser</option>
                      {typesHandicap.map(h => (
                        <option key={h.val} value={h.val}>{h.label}</option>
                      ))}
                    </select>
                    <div className="flex items-start gap-1.5 mt-2">
                      <AlertCircle size={13} className="text-gray-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs font-semibold text-gray-400 leading-relaxed">Information confidentielle. Sert uniquement à personnaliser votre expérience et à vous proposer des offres adaptées.</p>
                    </div>
                  </div>
                </>
              )}

              {/* Mot de passe commun */}
              <div>
                <label className="text-sm font-black text-gray-700 block mb-2">Mot de passe *</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.mot_de_passe}
                    onChange={e => setField("mot_de_passe", e.target.value)}
                    placeholder="Minimum 8 caractères"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-12 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {form.mot_de_passe && (
                  <div className="mt-3 flex flex-col gap-2">
                    {pwRules.map(r => (
                      <div key={r.label} className="flex items-center gap-2">
                        <CheckCircle size={14} className={r.ok ? "text-emerald-600" : "text-gray-200"} />
                        <span className={`text-sm font-semibold transition-colors ${r.ok ? "text-emerald-700" : "text-gray-400"}`}>{r.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirmation */}
              <div>
                <label className="text-sm font-black text-gray-700 block mb-2">Confirmer le mot de passe *</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input type={showConfirm ? "text" : "password"} value={form.confirm} onChange={e => setField("confirm", e.target.value)} placeholder="Répétez votre mot de passe" autoComplete="new-password" className={`w-full pl-10 pr-12 py-3.5 text-base border-2 rounded-xl focus:outline-none transition-all font-semibold ${form.confirm ? confirmOk ? "border-emerald-400 focus:border-emerald-500" : "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-gray-900"}`} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} aria-label={showConfirm ? "Masquer" : "Afficher"} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors">
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {form.confirm && !confirmOk && (<p className="text-sm font-bold text-red-500 mt-1.5 flex items-center gap-1.5"><AlertCircle size={13} /> Les mots de passe ne correspondent pas</p>)}
                {form.confirm && confirmOk && (<p className="text-sm font-bold text-emerald-600 mt-1.5 flex items-center gap-1.5"><CheckCircle size={13} /> Mots de passe identiques</p>)}
              </div>

              {/* CGU */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div role="checkbox" aria-checked={form.cgu} onClick={() => setField("cgu", !form.cgu)} className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all cursor-pointer ${form.cgu ? "bg-gray-900 border-gray-900" : "border-gray-300 group-hover:border-gray-500"}`}>
                  {form.cgu && <CheckCircle size={14} className="text-white" />}
                </div>
                <span className="text-sm font-semibold text-gray-600 leading-relaxed">
                  J&apos;accepte les{" "}
                  <Link href="/conditions" className="text-emerald-700 hover:underline font-bold" onClick={(e) => e.stopPropagation()}>
                    conditions d&apos;utilisation
                  </Link>
                  {" "}et la{" "}
                  <Link href="/confidentialite" className="text-emerald-700 hover:underline font-bold" onClick={(e) => e.stopPropagation()}>
                    politique de confidentialité
                  </Link>.
                </span>
              </label>
            </div>
          )}

          {etape === 3 && (
            <div className="flex flex-col gap-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="text-center">
                <div className="mx-auto mb-5 h-16 w-16 rounded-3xl bg-emerald-100 flex items-center justify-center">
                  <Mail size={28} className="text-emerald-600" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">
                  Vérifiez votre email
                </h2>
                <p className="text-sm font-semibold text-gray-500 leading-relaxed">
                  Un code à 6 chiffres a été envoyé à{" "}
                  <span className="text-gray-900 font-black">{form.email}</span>.
                  Saisissez-le ci-dessous pour activer votre compte.
                </p>
              </div>

              <div>
                <label className="text-sm font-black text-gray-700 block mb-2 text-center">
                  Code de vérification
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="w-48 mx-auto text-center tracking-[0.5em] text-2xl font-black px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 block"
                  autoFocus
                />
              </div>

              {erreurCreate && (
                <div className="bg-red-50 border-2 border-red-200 p-3 rounded-xl">
                  <p className="text-red-700 font-bold text-sm">{erreurCreate}</p>
                </div>
              )}

              <button
                onClick={verifyOtp}
                disabled={loadingOtp || otpCode.length < 6}
                className="w-full bg-gray-900 text-white font-black text-base py-4 rounded-xl hover:bg-gray-700 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loadingOtp ? "Vérification…" : "Valider mon email"}
                <CheckCircle size={18} />
              </button>

              <button
                type="button"
                onClick={resendOtp}
                disabled={resendCooldown > 0}
                className="text-sm font-black text-gray-500 hover:text-gray-900 disabled:opacity-40"
              >
                {resendCooldown > 0
                  ? `Renvoyer le code dans ${resendCooldown}s`
                  : "Renvoyer le code"}
              </button>
            </div>
          )}

          {etape === 4 && (
            <div className="flex flex-col gap-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="text-center">
                <div className="mx-auto mb-5 h-16 w-16 rounded-3xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle size={28} className="text-emerald-600" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">
                  Compte activé
                </h2>
                <p className="text-sm font-semibold text-gray-500 leading-relaxed">
                  Votre email a été vérifié. Bienvenue sur Nio-Far !
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
                href="/profil"
                className="w-full bg-gray-900 text-white font-black text-base py-4 rounded-xl hover:bg-gray-700 transition-all text-center"
              >
                Accéder à mon profil
              </Link>
            </div>
          )}

          </div>
        </div>

        {/* FOOTER FIXE - Boutons de navigation */}
        {(etape === 1 || etape === 2) && (
          <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4">
            <div className="max-w-lg mx-auto flex items-center gap-3">
              {etape === 1 ? (
                <>
                  <button type="button" disabled className="p-3 rounded-lg bg-gray-100 text-gray-300">
                    <ArrowLeft />
                  </button>
                  <p className="text-center text-sm font-semibold text-gray-400 flex-1">
                    Déjà membre ?{" "}
                    <Link href="/connexion" className="text-emerald-700 font-black hover:underline">
                      Se connecter
                    </Link>
                  </p>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => { setEtape(1); setProfil(""); }} 
                    className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  >
                    <ArrowLeft />
                  </button>
                  {erreurCreate && (
                    <div className="flex-1 bg-red-50 border border-red-200 p-3 rounded-xl">
                      <p className="text-red-700 font-bold text-sm">{erreurCreate}</p>
                    </div>
                  )}
                  <button 
                    onClick={createAccount} 
                    disabled={!etape2Ok || loadingCreate} 
                    className="ml-auto bg-gray-900 text-white font-black text-base py-3 px-6 rounded-xl hover:bg-gray-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loadingCreate ? "Création..." : "Créer mon compte"} <ArrowRight size={18} />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
