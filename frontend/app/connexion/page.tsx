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
  const [form, setForm] = useState({ email: "",mot_de_passe: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const setField = (key: keyof typeof form, val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  // ✅ CORRECTION ICI (API réelle + mot_de_passe)
  const handleSubmit = async () => {
    if (!form.email || !form.mot_de_passe) {
      setErreur("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    setErreur("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          mot_de_passe: form.mot_de_passe, // 🔥 IMPORTANT: correction ici
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Email ou mot de passe incorrect");
      }

      console.log("LOGIN SUCCESS:", data);

    } catch (err: any) {
      setErreur(err.message);
    } finally {
      setLoading(false);
    }
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

          <h2 className="text-3xl font-black text-white mb-3">
            Bon retour parmi nous
          </h2>

          <div className="flex flex-col gap-4">
            {avantages.map((a, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle size={18} className="text-emerald-400" />
                <span className="text-gray-300 font-semibold">{a}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== PANNEAU DROIT ===== */}
      <div className="flex-1 flex items-center justify-center p-6">

        <div className="w-full max-w-md">

          <h1 className="text-2xl font-black mb-6">Se connecter</h1>

          {erreur && (
            <div className="bg-red-50 border-2 border-red-200 p-4 rounded-xl mb-4 flex gap-2">
              <AlertCircle className="text-red-500" />
              <p className="text-red-700 font-bold">{erreur}</p>
            </div>
          )}

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            className="w-full p-3 border rounded-xl mb-3"
          />

          {/* PASSWORD */}
          <div className="relative mb-4">
            <input
            type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={form.mot_de_passe}
              onChange={(e) => setField("mot_de_passe", e.target.value)}
              className="w-full p-3 border rounded-xl"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-500"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {/* BUTTON */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-black text-white p-3 rounded-xl"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          <p className="text-center mt-4 text-sm">
            Pas de compte ? <Link href="/inscription">Créer un compte</Link>
          </p>

        </div>
      </div>
    </div>
  );
}