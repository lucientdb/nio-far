"use client";

/**
 * Modal certification identité via Persona (Hosted Flow).
 * Non branché tant que la feature n'est pas publique — voir /personna.md
 *
 * Usage futur (dans profil/page.tsx) :
 *   <IdentityVerificationModal onClose={...} onSuccess={...} />
 */
import { useEffect, useState, useCallback } from "react";
import { AlertCircle, ArrowRight, ExternalLink, Shield, X } from "lucide-react";
import { getKycStatus, initiateKyc } from "@/services/users";
import { useClickOutside } from "@/hooks/useClickOutside";

type ApiErrorLike = {
  response?: { data?: { detail?: string } };
  message?: string;
};

function getApiErrorDetail(err: unknown, fallback: string): string {
  const e = err as ApiErrorLike;
  return e?.response?.data?.detail || e?.message || fallback;
}

export default function IdentityVerificationModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hostedUrl, setHostedUrl] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);
  
  const modalRef = useClickOutside<HTMLDivElement>(handleClose);

  const startPersona = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await initiateKyc();
      setSessionId(res.session_id);
      setHostedUrl(res.url);
      window.open(res.url, "_blank", "noopener,noreferrer");
      setPolling(true);
    } catch (e: unknown) {
      setError(
        getApiErrorDetail(
          e,
          "Cette fonctionnalité n'est pas encore disponible. Vous serez informé une fois qu'elle l'est !",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!polling || !sessionId) return;
    const id = setInterval(async () => {
      try {
        const status = await getKycStatus(sessionId);
        if (status.status === "completed") {
          clearInterval(id);
          setPolling(false);
          onSuccess();
          onClose();
        } else if (status.status === "failed") {
          clearInterval(id);
          setPolling(false);
          setError("La vérification Persona a échoué. Réessayez plus tard.");
        }
      } catch {
        // ignore poll errors
      }
    }, 3000);
    return () => clearInterval(id);
  }, [polling, sessionId, onClose, onSuccess]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div ref={modalRef} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-gray-100">
        <div className="px-7 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Shield size={22} /> Vérification d&apos;identité
            </h2>
            <p className="text-sm font-semibold text-gray-400 mt-1">Propulsé par Persona</p>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="px-7 py-6 flex flex-col gap-5">
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl p-4 text-red-700">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <p className="text-sm font-semibold text-gray-600 leading-relaxed">
            Vous allez être redirigé vers Persona pour photographier votre document à puce NFC,
            lire la puce, puis prendre un selfie. Nio-Far ne reçoit que le résultat (pas vos photos).
          </p>

          {!hostedUrl ? (
            <button
              onClick={startPersona}
              disabled={loading}
              className="w-full bg-gray-900 text-white font-black py-4 rounded-xl disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loading ? "Préparation…" : "Continuer avec Persona"}
              <ArrowRight size={18} />
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <a
                href={hostedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gray-900 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2"
              >
                Rouvrir Persona <ExternalLink size={18} />
              </a>
              {polling && (
                <p className="text-xs font-bold text-gray-500 text-center animate-pulse">
                  En attente de la confirmation Persona…
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
