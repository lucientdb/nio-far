"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Mail, Lock, Eye, EyeOff, ArrowRight,
  CheckCircle, Accessibility, AlertCircle
} from "lucide-react";

const avantages = [
  "Forum communautaire actif",
  "180+ offres d'emploi adaptées",
  "Annuaire de 56 experts",
  "Ressources juridiques et sociales",
];

export default function ConnexionPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const setField = (key: keyof typeof form, val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setErreur("Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    setErreur("");
    // Simulation appel API
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setErreur("Email ou mot de passe incorrect. Veuillez réessayer.");
  };

  const handleForgot = async () => {
    if (!forgotEmail) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setForgotSent(true);
  };

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
            Bon retour parmi nous
          </h2>
          <p className="text-base font-semibold text-gray-400 leading-relaxed mb-10">
            Retrouvez votre communauté, vos offres sauvegardées et vos ressources.
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
            Pas encore membre ?{" "}
            <Link href="/inscription" className="text-white font-black hover:underline">
              Créer un compte →
            </Link>
          </p>
        </div>
      </div>

      {/* ===== PANNEAU DROIT ===== */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <Accessibility size={16} className="text-white" />
            </div>
            <span className="font-black text-gray-900">Inclusif Sénégal</span>
          </Link>

          {/* ===== MODE MOT DE PASSE OUBLIÉ ===== */}
          {forgotMode ? (
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-2xl font-black text-gray-900 mb-2">
                  {forgotSent ? "Email envoyé !" : "Mot de passe oublié"}
                </h1>
                <p className="text-base font-semibold text-gray-500 leading-relaxed">
                  {forgotSent
                    ? `Un lien de réinitialisation a été envoyé à ${forgotEmail}. Vérifiez votre boîte mail.`
                    : "Entrez votre adresse email et nous vous enverrons un lien de réinitialisation."}
                </p>
              </div>

              {forgotSent ? (
                <div className="flex flex-col gap-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                    <CheckCircle size={32} className="text-emerald-600" />
                  </div>
                  <button
                    onClick={() => { setForgotMode(false); setForgotSent(false); setForgotEmail(""); }}
                    className="w-full border-2 border-gray-200 text-gray-700 font-black text-base py-3.5 rounded-xl hover:border-gray-400 transition-colors"
                  >
                    Retour à la connexion
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-sm font-black text-gray-700 block mb-2">Adresse email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        placeholder="votre@email.com"
                        className="w-full pl-10 pr-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleForgot}
                    disabled={!forgotEmail || loading}
                    className="w-full bg-gray-900 text-white font-black text-base py-3.5 rounded-xl hover:bg-gray-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>Envoyer le lien <ArrowRight size={18} /></>
                    )}
                  </button>
                  <button
                    onClick={() => setForgotMode(false)}
                    className="text-sm font-black text-gray-400 hover:text-gray-700 transition-colors text-center"
                  >
                    ← Retour à la connexion
                  </button>
                </div>
              )}
            </div>

          ) : (
            /* ===== MODE CONNEXION ===== */
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-2xl font-black text-gray-900 mb-1">Se connecter</h1>
                <p className="text-base font-semibold text-gray-400">
                  Accédez à votre espace personnel
                </p>
              </div>

              {/* Message d'erreur */}
              {erreur && (
                <div className="flex items-start gap-3 bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-bold text-red-700">{erreur}</p>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="text-sm font-black text-gray-700 block mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => { setField("email", e.target.value); setErreur(""); }}
                    placeholder="votre@email.com"
                    autoComplete="email"
                    className={`w-full pl-10 pr-4 py-3.5 text-base border-2 rounded-xl focus:outline-none transition-all font-semibold ${erreur ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-gray-900"}`}
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-black text-gray-700">Mot de passe</label>
                  <button
                    onClick={() => setForgotMode(true)}
                    className="text-sm font-black text-gray-400 hover:text-gray-900 transition-colors"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={e => { setField("password", e.target.value); setErreur(""); }}
                    placeholder="Votre mot de passe"
                    autoComplete="current-password"
                    className={`w-full pl-10 pr-12 py-3.5 text-base border-2 rounded-xl focus:outline-none transition-all font-semibold ${erreur ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-gray-900"}`}
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
              </div>

              {/* Se souvenir de moi */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => setRemember(!remember)}
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${remember ? "bg-gray-900 border-gray-900" : "border-gray-300 group-hover:border-gray-500"}`}
                >
                  {remember && <CheckCircle size={14} className="text-white" />}
                </div>
                <span className="text-sm font-semibold text-gray-600">Se souvenir de moi</span>
              </label>

              {/* Bouton connexion */}
              <button
                onClick={handleSubmit}
                disabled={loading || !form.email || !form.password}
                className="w-full bg-gray-900 text-white font-black text-base py-4 rounded-xl hover:bg-gray-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Se connecter <ArrowRight size={18} /></>
                )}
              </button>

              {/* Séparateur */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-0.5 bg-gray-100" />
                <span className="text-sm font-bold text-gray-300">ou</span>
                <div className="flex-1 h-0.5 bg-gray-100" />
              </div>

              {/* Connexion Google */}
              <button className="w-full border-2 border-gray-200 text-gray-700 font-black text-base py-3.5 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuer avec Google
              </button>

              {/* Inscription */}
              <p className="text-center text-sm font-semibold text-gray-400">
                Pas encore membre ?{" "}
                <Link href="/inscription" className="text-gray-900 font-black hover:underline">
                  Créer un compte gratuitement →
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}