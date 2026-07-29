"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getDashboardPath, getToken, getStoredUser } from "@/lib/auth";
import {
  Mail, Lock, Eye, EyeOff, ArrowRight,
  CheckCircle, AlertCircle,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

function parseDetail(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (detail && typeof detail === "object" && "message" in detail) {
    return String((detail as { message: string }).message);
  }
  return "Une erreur est survenue";
}

export default function ConnexionPage() {
  const [form, setForm] = useState({ email: "", mot_de_passe: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [stats, setStats] = useState<{ jobs_count?: number; experts_count?: number } | null>(null);
  const [needsOtp, setNeedsOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetch(`${API}/api/stats/public`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const token = getToken();
    const user = getStoredUser();
    if (token && user) {
      router.replace(getDashboardPath(user.role));
    }
  }, [router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((d) => d - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const setField = (key: keyof typeof form, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const finishLogin = (data: { access_token?: string; refresh_token?: string; user: { role: string } }) => {
    localStorage.setItem("token", data.access_token || "");
    localStorage.setItem("refresh_token", data.refresh_token || "");
    localStorage.setItem("user", JSON.stringify(data.user));
    window.dispatchEvent(new Event("auth-change"));
    window.location.href = getDashboardPath(data.user.role);
  };

  const handleSubmit = async () => {
    if (!form.email || !form.mot_de_passe) {
      setErreur("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    setErreur("");

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          mot_de_passe: form.mot_de_passe,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const detail = data.detail;
        if (
          res.status === 403 &&
          detail &&
          typeof detail === "object" &&
          detail.requires_verification
        ) {
          setNeedsOtp(true);
          setResendCooldown(60);
          setErreur(detail.message || "Un code de vérification vous a été envoyé.");
          return;
        }
        throw new Error(parseDetail(detail) || "Email ou mot de passe incorrect");
      }

      finishLogin(data);
    } catch (err: unknown) {
      setErreur(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length < 6) {
      setErreur("Saisissez le code à 6 chiffres.");
      return;
    }
    setLoading(true);
    setErreur("");
    try {
      const res = await fetch(`${API}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, code: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(parseDetail(data.detail));
      finishLogin(data);
    } catch (err: unknown) {
      setErreur(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setErreur("");
    try {
      const res = await fetch(`${API}/api/auth/resend-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(parseDetail(data.detail));
      setResendCooldown(60);
      setErreur("");
    } catch (err: unknown) {
      setErreur(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="hidden lg:flex w-96 flex-shrink-0 bg-gray-900 flex-col justify-between p-10">
        <div>
          <Link href="/" className="flex items-center gap-3 mb-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Logo Nio Far" className="h-20 w-auto object-contain bg-white rounded-xl p-2" />
            <span className="text-white font-black text-3xl">Nio Far</span>
          </Link>

          <h2 className="text-3xl font-black text-white mb-3">
            Bon retour parmi nous
          </h2>

          <div className="flex flex-col gap-4">
            {[
              "Forum communautaire actif",
              `${stats ? stats.jobs_count : "Plusieurs"} offres d'emploi adaptées`,
              `Annuaire de ${stats ? stats.experts_count : "nombreux"} experts`,
              "Ressources juridiques et sociales",
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle size={18} className="text-emerald-400" />
                <span className="text-gray-300 font-semibold">{a}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-black mb-6">
            {needsOtp ? "Vérifiez votre email" : "Se connecter"}
          </h1>

          {erreur && (
            <div className="bg-red-50 border-2 border-red-200 p-4 rounded-xl mb-4 flex gap-2">
              <AlertCircle className="text-red-500 flex-shrink-0" />
              <p className="text-red-700 font-bold text-sm">{erreur}</p>
            </div>
          )}

          {!needsOtp ? (
            <>
              <div className="relative mb-3">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  className="w-full pl-10 p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 font-semibold"
                  autoComplete="email"
                />
              </div>

              <div className="relative mb-4">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mot de passe"
                  value={form.mot_de_passe}
                  onChange={(e) => setField("mot_de_passe", e.target.value)}
                  className="w-full pl-10 pr-12 p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 font-semibold"
                  autoComplete="current-password"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Masquer" : "Afficher"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gray-900 text-white font-black p-3.5 rounded-xl hover:bg-gray-800 disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loading ? "Connexion…" : "Se connecter"}
                <ArrowRight size={18} />
              </button>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-gray-500 mb-4 leading-relaxed">
                Un code à 6 chiffres a été envoyé à{" "}
                <span className="font-black text-gray-900">{form.email}</span>.
              </p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="w-48 mx-auto mb-4 text-center tracking-[0.5em] text-2xl font-black px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 block"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
              />
              <button
                onClick={handleVerifyOtp}
                disabled={loading || otpCode.length < 6}
                className="w-full bg-gray-900 text-white font-black p-3.5 rounded-xl disabled:opacity-40 mb-3"
              >
                {loading ? "Vérification…" : "Valider et se connecter"}
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="w-full text-sm font-black text-gray-500 hover:text-gray-900 disabled:opacity-40 mb-2"
              >
                {resendCooldown > 0 ? `Renvoyer dans ${resendCooldown}s` : "Renvoyer le code"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setNeedsOtp(false);
                  setOtpCode("");
                  setErreur("");
                }}
                className="w-full text-sm font-black text-gray-400 hover:text-gray-700"
              >
                Retour
              </button>
            </>
          )}

          <p className="text-center mt-4 text-sm text-gray-600">
            Pas de compte ?{" "}
            <Link href="/inscription" className="text-emerald-700 font-bold hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
