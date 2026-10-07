"use client";
import { useState, useRef, useEffect, useSyncExternalStore, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Camera, Edit3, CheckCircle, Upload, X, Mic,
  FileText, Image as ImageIcon, MapPin, Briefcase, Mail,
  Shield, Star, Heart, Eye,
  Plus, Clock, AlertCircle, ChevronRight,
  Lock, ArrowRight, BookOpen
} from "lucide-react";
import { getMyProfile, updateMyProfile, uploadAvatar, revokeVerification, changePassword, type UserProfile } from "@/services/users";
import { getMyPosts, createClassicPost, toggleLike } from "@/services/forums";
import { ROLE_LABELS, getToken } from "@/lib/auth";
import AuthPrompt from "@/components/AuthPrompt";
import { useClickOutside } from "@/hooks/useClickOutside";

// ---- Types ----
type Publication = {
  id: number;
  type: "podcast" | "texte";
  titre: string;
  contenu: string;
  date: string;
  likes: number;
  vues: number;
  liked: boolean;
  duree?: string;
  image?: string;
};

type OngletProfil = "publications" | "apropos" | "certification";

type ApiErrorLike = {
  response?: { data?: { detail?: string } };
  message?: string;
};

function getApiErrorDetail(err: unknown, fallback: string): string {
  const e = err as ApiErrorLike;
  return e?.response?.data?.detail || e?.message || fallback;
}

const emptySubscribe = () => () => {};

const CERTIFICATION_UNAVAILABLE_MSG =
  "Cette fonctionnalité n'est pas encore disponible. Vous serez informé une fois qu'elle l'est !";

// ---- STATE CONNECTÉ BACKEND (REMPLACE MOCK) ----
//const [user, setUser] = useState<any>(null);
//const [publications, setPublications] = useState<Publication[]>([]);
// ---- Modal publication ----
function ModalPublication({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [type, setType] = useState<"texte" | "podcast">("texte");
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [etape, setEtape] = useState<1 | 2>(1);
  const imageRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);
  
  const modalRef = useClickOutside<HTMLDivElement>(handleClose);

  const canSubmit = titre.trim().length >= 5 && contenu.trim().length >= 20;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await createClassicPost(titre, contenu);
      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la publication");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div ref={modalRef} className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-7 py-5 border-b-2 border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900">Nouvelle publication</h2>
            <p className="text-sm font-semibold text-gray-400 mt-0.5">
              Étape {etape} / 2
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Barre progression */}
        <div className="h-1.5 bg-gray-100">
          <div
            className="h-1.5 bg-gray-900 transition-all duration-500"
            style={{ width: etape === 1 ? "50%" : "100%" }}
          />
        </div>

        <div className="px-7 py-6 flex flex-col gap-5">

          {etape === 1 && (
            <>
              {/* Type de publication */}
              <div>
                <p className="text-sm font-black text-gray-700 mb-3">
                  Type de publication
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { key: "texte", label: "Article / Texte", desc: "Partagez un article, un conseil ou votre expérience.", icon: FileText },
                    { key: "podcast", label: "Podcast audio", desc: "Publiez un épisode audio avec titre et description.", icon: Mic },
                  ] as const).map(t => (
                    <button
                      key={t.key}
                      onClick={() => setType(t.key)}
                      className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 text-center transition-all ${type === t.key
                          ? "border-gray-900 bg-gray-50 shadow-md"
                          : "border-gray-200 hover:border-gray-400"
                        }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${type === t.key ? "bg-gray-900" : "bg-gray-100"
                        }`}>
                        <t.icon size={22} className={type === t.key ? "text-white" : "text-gray-500"} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900">{t.label}</p>
                        <p className="text-xs font-semibold text-gray-400 mt-1 leading-relaxed">{t.desc}</p>
                      </div>
                      {type === t.key && (
                        <CheckCircle size={16} className="text-emerald-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Titre */}
              <div>
                <label className="text-sm font-black text-gray-700 block mb-2">
                  Titre *
                </label>
                <input
                  value={titre}
                  onChange={e => setTitre(e.target.value)}
                  placeholder={
                    type === "texte"
                      ? "Ex. Mon expérience avec l'inclusion scolaire..."
                      : "Ex. Vivre avec un handicap moteur à Dakar..."
                  }
                  className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold"
                />
                <p className="text-xs font-semibold text-gray-400 mt-1">
                  {titre.length} / 100 caractères
                </p>
              </div>

              {/* Contenu */}
              <div>
                <label className="text-sm font-black text-gray-700 block mb-2">
                  {type === "texte" ? "Contenu *" : "Description *"}
                </label>
                <textarea
                  value={contenu}
                  onChange={e => setContenu(e.target.value)}
                  placeholder={
                    type === "texte"
                      ? "Rédigez votre article, conseil ou témoignage..."
                      : "Décrivez le contenu de votre épisode..."
                  }
                  rows={5}
                  className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold resize-none"
                />
                <p className="text-xs font-semibold text-gray-400 mt-1">
                  {contenu.length} caractères · minimum 20
                </p>
              </div>

              <button
                onClick={() => setEtape(2)}
                disabled={!canSubmit}
                className="w-full bg-gray-900 text-white font-black text-base py-4 rounded-xl hover:bg-gray-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continuer <ChevronRight size={18} />
              </button>
            </>
          )}

          {etape === 2 && (
            <>
              {/* Upload image */}
              <div>
                <label className="text-sm font-black text-gray-700 block mb-2">
                  Image d&apos;illustration{" "}
                  <span className="text-gray-400 font-semibold">(optionnel)</span>
                </label>
                <input
                  ref={imageRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => setImageFile(e.target.files?.[0] ?? null)}
                />
                {imageFile ? (
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
                    <ImageIcon size={20} className="text-emerald-600 flex-shrink-0" aria-hidden />
                    <span className="text-sm font-black text-emerald-800 flex-1 truncate">
                      {imageFile.name}
                    </span>
                    <button
                      onClick={() => setImageFile(null)}
                      className="text-emerald-600 hover:text-emerald-800"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => imageRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-gray-500 hover:bg-gray-50 transition-all"
                  >
                    <Upload size={24} className="text-gray-400" />
                    <p className="text-sm font-black text-gray-500">
                      Cliquez pour importer une image
                    </p>
                    <p className="text-xs font-semibold text-gray-400">
                      PNG, JPG · Max 5MB
                    </p>
                  </button>
                )}
              </div>

              {/* Upload audio si podcast */}
              {type === "podcast" && (
                <div>
                  <label className="text-sm font-black text-gray-700 block mb-2">
                    Fichier audio *
                  </label>
                  <input
                    ref={audioRef}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={e => setAudioFile(e.target.files?.[0] ?? null)}
                  />
                  {audioFile ? (
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
                      <Mic size={20} className="text-emerald-600 flex-shrink-0" />
                      <span className="text-sm font-black text-emerald-800 flex-1 truncate">
                        {audioFile.name}
                      </span>
                      <button
                        onClick={() => setAudioFile(null)}
                        className="text-emerald-600 hover:text-emerald-800"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => audioRef.current?.click()}
                      className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-gray-500 hover:bg-gray-50 transition-all"
                    >
                      <Mic size={24} className="text-gray-400" />
                      <p className="text-sm font-black text-gray-500">
                        Importer votre fichier audio
                      </p>
                      <p className="text-xs font-semibold text-gray-400">
                        MP3, WAV · Max 100MB
                      </p>
                    </button>
                  )}
                </div>
              )}

              {/* Récap */}
              <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                  Récapitulatif
                </p>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-gray-400">Type</span>
                    <span className="font-black text-gray-900 capitalize">{type}</span>
                  </div>
                  <div className="flex justify-between text-sm gap-4">
                    <span className="font-bold text-gray-400 flex-shrink-0">Titre</span>
                    <span className="font-black text-gray-900 text-right truncate">{titre}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setEtape(1)}
                  className="flex-1 border-2 border-gray-200 text-gray-600 font-black text-base py-3.5 rounded-xl hover:border-gray-400 transition-colors"
                >
                  Retour
                </button>
                <button
                  disabled={(type === "podcast" && !audioFile) || loading}
                  onClick={handleSubmit}
                  className="flex-1 bg-gray-900 text-white font-black text-base py-3.5 rounded-xl hover:bg-gray-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Upload size={18} /> {loading ? "Publication..." : "Publier"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Modal certification ----
// ---- Carte publication ----
function PublicationCard({
  pub,
  onLike,
}: {
  pub: Publication;
  onLike: (id: number) => void;
}) {
  return (
    <article className="group bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-gray-900 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${pub.type === "podcast" ? "bg-emerald-100" : "bg-emerald-100"
          }`}>
          {pub.type === "podcast"
            ? <Mic size={18} className="text-emerald-600" />
            : <FileText size={18} className="text-emerald-600" />
          }
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${pub.type === "podcast"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-emerald-100 text-emerald-800"
              }`}>
              {pub.type === "podcast" ? "Podcast" : "Article"}
            </span>
            {pub.duree && (
              <span className="flex items-center gap-1 text-xs font-semibold text-gray-400">
                <Clock size={11} /> {pub.duree}
              </span>
            )}
            <span className="text-xs font-semibold text-gray-300 ml-auto">{pub.date}</span>
          </div>
          <h3 className="text-base font-black text-gray-900 leading-snug group-hover:text-emerald-700 transition-colors">
            {pub.titre}
          </h3>
        </div>
      </div>

      <p className="text-sm font-semibold text-gray-500 leading-relaxed mb-4 line-clamp-2">
        {pub.contenu}
      </p>

      <div className="flex items-center gap-4 pt-3 border-t-2 border-gray-100">
        <button
          onClick={() => onLike(pub.id)}
          aria-label={pub.liked ? "Retirer le j'aime" : "J'aime"}
          className={`flex items-center gap-1.5 text-sm font-black transition-all ${pub.liked ? "text-emerald-500" : "text-gray-400 hover:text-emerald-500"
            }`}
        >
          <Heart size={15} className={pub.liked ? "fill-emerald-500" : ""} />
          {pub.likes}
        </button>
        <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-300">
          <Eye size={15} /> {pub.vues.toLocaleString()}
        </span>
        <button className="ml-auto flex items-center gap-1 text-sm font-black text-gray-400 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-all">
          Lire <ChevronRight size={14} />
        </button>
      </div>
    </article>
  );
}

export default function ProfilPage() {
  const router = useRouter();
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);

  const [bio, setBio] = useState<string>("");

  const [onglet, setOnglet] = useState<OngletProfil>("publications");
  const [modalPublication, setModalPublication] = useState(false);
  const [modalCertificationUnavailable, setModalCertificationUnavailable] = useState(false);
  const [editBio, setEditBio] = useState(false);
  const [avatar_url, setAvatarUrl] = useState<string | null>(null);

  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<Partial<UserProfile>>({ email: "" });
  const [profileError, setProfileError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const avatarRef = useRef<HTMLInputElement>(null);
  
  const handleCertificationModalClose = useCallback(() => {
    setModalCertificationUnavailable(false);
  }, []);
  
  const certificationModalRef = useClickOutside<HTMLDivElement>(handleCertificationModalClose);

  useEffect(() => {
    if (!getToken()) {
      return; // Ne pas rediriger
    }
    Promise.all([getMyProfile(), getMyPosts()])
      .then(([profile, posts]) => {
        setUser(profile);
        setBio(profile.bio ?? "");
        setAvatarUrl(profile.avatar_url ?? null);
        setProfileForm({
          nom: profile.nom,
          prenom: profile.prenom,
          username: profile.username,
          email: profile.email,
          ville: profile.ville,
          entreprise_nom: profile.entreprise_nom,
          contact: profile.contact,
          domaine_intervention: profile.domaine_intervention,
          specialite: profile.specialite,
          type_handicap: profile.type_handicap,
          bio: profile.bio,
        });
        localStorage.setItem("user", JSON.stringify({
          id: profile.id,
          nom: profile.nom,
          prenom: profile.prenom,
          username: profile.username,
          email: profile.email,
          role: profile.role,
          avatar_url: profile.avatar_url,
        }));
        window.dispatchEvent(new Event("auth-change"));
        setPublications(
          posts.map((p) => ({
            id: p.id,
            type: "texte" as const,
            titre: p.titre,
            contenu: p.contenu,
            date: new Date(p.cree_le).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(",", " à"),
            likes: p.likes_count,
            vues: p.vues,
            liked: p.liked_by_me,
          }))
        );
      })
      .catch((err) => {
        console.error("Erreur chargement profil:", err);
      })
      .finally(() => setLoading(false));
  }, [router]);

  const saveBio = async () => {
    if (!user) return;
    const updated = await updateMyProfile({ bio });
    setUser(updated);
    setEditBio(false);
  };

  const saveProfile = async () => {
    if (!user) return;
    setProfileError("");
    setSavingProfile(true);
    try {
      const payload: Partial<UserProfile> = { ...profileForm };
      // Org profiles hide nom/prenom — fill from entreprise_nom so NOT NULL cols stay valid
      if (user.role === "entreprise" || user.role === "ong") {
        const org = (payload.entreprise_nom || user.entreprise_nom || "").trim();
        if (!(payload.nom || "").trim()) payload.nom = org;
        if (!(payload.prenom || "").trim()) payload.prenom = org;
      }
      const updated = await updateMyProfile(payload);
      setUser(updated);
      setBio(updated.bio ?? "");
      setProfileForm({
        nom: updated.nom,
        prenom: updated.prenom,
        username: updated.username,
        email: updated.email,
        ville: updated.ville,
        entreprise_nom: updated.entreprise_nom,
        contact: updated.contact,
        domaine_intervention: updated.domaine_intervention,
        specialite: updated.specialite,
        type_handicap: updated.type_handicap,
        bio: updated.bio,
      });
      const storedRaw = localStorage.getItem("user");
      const storedUser = storedRaw ? JSON.parse(storedRaw) as Record<string, unknown> : {};
      localStorage.setItem("user", JSON.stringify({
        ...storedUser,
        nom: updated.nom,
        prenom: updated.prenom,
        username: updated.username,
        email: updated.email,
        avatar_url: updated.avatar_url,
      }));
      window.dispatchEvent(new Event("auth-change"));
      setEditProfile(false);
    } catch (err: unknown) {
      console.error(err);
      let message = "Erreur lors de la sauvegarde du profil";
      if (err && typeof err === "object" && "response" in err) {
        const detail = (err as { response?: { data?: { detail?: unknown } } }).response?.data?.detail;
        if (typeof detail === "string") message = detail;
      }
      setProfileError(message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const { avatar_url } = await uploadAvatar(file);
        setAvatarUrl(avatar_url);
      } catch (err) {
        console.error(err);
        alert("Erreur lors de l'upload de la photo");
      }
    }
  };

  const savePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError("Veuillez remplir tous les champs du mot de passe.");
      setPasswordSuccess("");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("Les nouveaux mots de passe ne correspondent pas.");
      setPasswordSuccess("");
      return;
    }
    setChangingPassword(true);
    setPasswordError("");
    setPasswordSuccess("");
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess("Mot de passe mis à jour avec succès.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: unknown) {
      setPasswordError(getApiErrorDetail(err, "Erreur lors du changement de mot de passe."));
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLike = async (id: number) => {
    try {
      await toggleLike(id);
      setPublications(prev =>
        prev.map(p =>
          p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
        )
      );
    } catch (e) {
      console.error(e);
    }
  };

  const getProfileFields = () => {
    if (!user) return [];
    const fields = [
      { label: "Email", val: user.email, icon: Mail },
      { label: "Ville", val: user.ville ?? "—", icon: MapPin },
      { label: "Type de profil", val: ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] ?? user.role, icon: Shield },
      { label: "Membre depuis", val: user.cree_le ? new Date(user.cree_le).toLocaleDateString("fr-FR") : "—", icon: Clock },
    ];

    if (user.username) {
      fields.unshift({ label: "Nom d'utilisateur", val: user.username, icon: Star });
    }

    if (user.role === "user") {
      fields.unshift({ label: "Prénom", val: user.prenom, icon: Star });
      fields.unshift({ label: "Nom", val: user.nom, icon: Star });
      fields.splice(4, 0, { label: "Type de handicap", val: user.type_handicap ?? "—", icon: CheckCircle });
      return fields;
    }

    if (user.role === "expert") {
      fields.unshift({ label: "Prénom", val: user.prenom, icon: Star });
      fields.unshift({ label: "Nom", val: user.nom, icon: Star });
      fields.splice(4, 0, { label: "Spécialité", val: user.specialite ?? "—", icon: BookOpen });
      fields.splice(5, 0, { label: "Contact", val: user.contact ?? "—", icon: Mail });
      return fields;
    }

    if (user.role === "entreprise" || user.role === "ong") {
      fields.unshift({ label: "Nom de l'entreprise / ONG", val: user.entreprise_nom ?? "—", icon: Briefcase });
      fields.splice(4, 0, { label: "Contact", val: user.contact ?? "—", icon: Mail });
      fields.splice(5, 0, { label: "Domaine d'intervention", val: user.domaine_intervention ?? "—", icon: MapPin });
      return fields;
    }

    return fields;
  };

  if (!isMounted) {
    return <div className="p-6 text-gray-500">Chargement...</div>;
  }

  // Afficher AuthPrompt si non authentifié
  if (!getToken()) {
    return (
      <AuthPrompt
        title="Mon profil"
        message="Inscrivez-vous pour créer et gérer votre profil personnalisé."
        feature="Gérez vos informations, vos publications et votre badge de certification."
      />
    );
  }

  if (loading || !user) {
    return <div className="p-6 text-gray-500">Chargement du profil...</div>;
  }
  return (

    <div className="min-h-screen bg-gray-50">

      {/* ===== BANNIÈRE PROFIL ===== */}
      <div className="bg-gray-900 h-40 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-violet-900 opacity-80" />
      </div>

      <div className="max-w-5xl mx-auto px-6">

        {/* ===== HEADER PROFIL ===== */}
        <div className="relative -mt-16 mb-6">
          <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row gap-6 items-start">

              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-emerald-100 flex items-center justify-center">
                  {avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element -- URL dynamique backend
                    <img src={avatar_url} alt="Photo de profil" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-black text-emerald-800">
                      {user?.prenom?.[0] ?? ""}
                      {user?.nom?.[0] ?? ""}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => avatarRef.current?.click()}
                  aria-label="Changer la photo de profil"
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white hover:bg-gray-700 transition-colors shadow-md"
                >
                  <Camera size={14} />
                </button>
                <input
                  ref={avatarRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatar}
                />
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl font-black text-gray-900">
                        {user?.username || `${user?.prenom ?? ""} ${user?.nom ?? ""}`}
                      </h1>
                      {user?.username && (
                        <p className="text-sm font-semibold text-gray-500 mt-1">
                          {(`${user?.prenom ?? ""} ${user?.nom ?? ""}`.trim() || ROLE_LABELS[user.role as keyof typeof ROLE_LABELS]) ?? user.role}
                        </p>
                      )}
                      {user?.is_verified ? (
                        user.verification_type === "email_pro" ? (
                          <span className="flex items-center gap-1.5 text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle size={13} className="text-emerald-600" />
                            ✉ Pro Vérifié {user.pro_email ? `(${user.pro_email.split('@')[1]})` : ""}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs font-black px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                            <Shield size={13} className="text-blue-600" />
                            🛡 Identité Vérifiée
                          </span>
                        )
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-black px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                          <AlertCircle size={13} /> Non vérifié
                        </span>
                      )}
                    </div>
                    <p className="text-base font-semibold text-gray-500 mt-1">
                      {user.specialite || user.domaine_intervention || user.entreprise_nom || ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}
                    </p>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-400">
                        <MapPin size={13} /> {user.ville || "Ville non renseignée"}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-400">
                        <Mail size={13} /> {user.email}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-400">
                        <Clock size={13} /> Membre depuis {user.cree_le ? new Date(user.cree_le).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {!user.is_verified && (
                      <button
                        onClick={() => setModalCertificationUnavailable(true)}
                        className="flex items-center gap-2 bg-amber-500 text-white font-black text-sm px-4 py-2.5 rounded-xl hover:bg-amber-600 transition-all hover:shadow-md"
                      >
                        <Shield size={16} /> Certifier mon compte
                      </button>
                    )}
                    <button
                      onClick={() => setModalPublication(true)}
                      className="flex items-center gap-2 bg-gray-900 text-white font-black text-sm px-4 py-2.5 rounded-xl hover:bg-gray-700 transition-all hover:shadow-md"
                    >
                      <Plus size={16} /> Publier
                    </button>
                    <button
                      onClick={() => {
                        setEditProfile(true);
                        setShowPasswordForm(false); // Fermer le formulaire de mot de passe
                      }}
                      className="flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-700 font-black text-sm px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all"
                    >
                      <Edit3 size={16} /> Modifier le profil
                    </button>
                    <button
                      onClick={() => {
                        setShowPasswordForm(prev => !prev);
                        setEditProfile(false); // Fermer le formulaire de profil
                        setPasswordError("");
                        setPasswordSuccess("");
                      }}
                      className="flex items-center gap-2 bg-gray-900 text-white font-black text-sm px-4 py-2.5 rounded-xl hover:bg-gray-700 transition-all"
                    >
                      <Lock size={16} /> Modifier le mot de passe
                    </button>
                  </div>
                </div>

                {/* Bio */}
                {showPasswordForm && (
                  <div className="mt-4 p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl">
                    <h3 className="text-base font-black text-gray-900 mb-4">Changer le mot de passe</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-black text-gray-700 block mb-2">Mot de passe actuel</label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={e => setCurrentPassword(e.target.value)}
                          placeholder="Mot de passe actuel"
                          className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-black text-gray-700 block mb-2">Nouveau mot de passe</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="Nouveau mot de passe"
                          className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-black text-gray-700 block mb-2">Confirmer le nouveau mot de passe</label>
                        <input
                          type="password"
                          value={confirmNewPassword}
                          onChange={e => setConfirmNewPassword(e.target.value)}
                          placeholder="Confirmer le nouveau mot de passe"
                          className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                        />
                      </div>
                    </div>
                    {passwordError && <p className="text-sm text-red-500 mt-3">{passwordError}</p>}
                    {passwordSuccess && <p className="text-sm text-emerald-600 mt-3">{passwordSuccess}</p>}
                    <div className="flex gap-2 mt-4">
                      <button
                        type="button"
                        onClick={savePassword}
                        disabled={changingPassword}
                        className="flex items-center gap-2 bg-gray-900 text-white font-black text-sm px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50"
                      >
                        <Lock size={14} /> Enregistrer le mot de passe
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPasswordForm(false)}
                        className="text-sm font-black text-gray-400 hover:text-gray-700 transition-colors px-3"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
                <div className="mt-4 pt-4 border-t-2 border-gray-100">
                  {editBio ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={saveBio}
                          className="flex items-center gap-1.5 bg-gray-900 text-white font-black text-sm px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors"
                        >
                          <CheckCircle size={14} /> Enregistrer
                        </button>
                        <button
                          onClick={() => { setBio(user.bio ?? ""); setEditBio(false); }}
                          className="text-sm font-black text-gray-400 hover:text-gray-700 transition-colors px-3"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <p className="text-base font-semibold text-gray-600 leading-relaxed flex-1">
                        {bio}
                      </p>
                      <button
                        onClick={() => setEditBio(true)}
                        aria-label="Modifier la bio"
                        className="flex-shrink-0 w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        <Edit3 size={15} />
                      </button>
                    </div>
                  )}
                </div>
                {editProfile && (
                  <div className="mt-4 p-4 bg-white border-2 border-gray-100 rounded-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(user?.role === "user" || user?.role === "expert") && (
                        <>
                          <div>
                            <label className="text-sm font-black text-gray-700 block mb-2">Nom</label>
                            <input
                              value={profileForm.nom ?? ""}
                              onChange={e => setProfileForm({ ...profileForm, nom: e.target.value })}
                              placeholder="Nom"
                              className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-black text-gray-700 block mb-2">Prénom</label>
                            <input
                              value={profileForm.prenom ?? ""}
                              onChange={e => setProfileForm({ ...profileForm, prenom: e.target.value })}
                              placeholder="Prénom"
                              className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                            />
                          </div>
                        </>
                      )}

                      <div>
                        <label className="text-sm font-black text-gray-700 block mb-2">Nom d&apos;utilisateur</label>
                        <input
                          value={profileForm.username ?? ""}
                          onChange={e => setProfileForm({ ...profileForm, username: e.target.value })}
                          placeholder="Nom d'utilisateur"
                          className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-black text-gray-700 block mb-2">Email</label>
                        <input
                          type="email"
                          value={profileForm.email ?? ""}
                          onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                          placeholder="Adresse email"
                          className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-black text-gray-700 block mb-2">Ville</label>
                        <input
                          value={profileForm.ville ?? ""}
                          onChange={e => setProfileForm({ ...profileForm, ville: e.target.value })}
                          placeholder="Ville"
                          className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                        />
                      </div>

                      {(user?.role === "entreprise" || user?.role === "ong") && (
                        <>
                          <div>
                            <label className="text-sm font-black text-gray-700 block mb-2">Nom de l&apos;entreprise / ONG</label>
                            <input
                              value={profileForm.entreprise_nom ?? ""}
                              onChange={e => setProfileForm({ ...profileForm, entreprise_nom: e.target.value })}
                              placeholder="Nom de l'entreprise / ONG"
                              className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-black text-gray-700 block mb-2">Contact</label>
                            <input
                              value={profileForm.contact ?? ""}
                              onChange={e => setProfileForm({ ...profileForm, contact: e.target.value })}
                              placeholder="Contact (téléphone)"
                              className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-black text-gray-700 block mb-2">Domaine d&apos;intervention</label>
                            <input
                              value={profileForm.domaine_intervention ?? ""}
                              onChange={e => setProfileForm({ ...profileForm, domaine_intervention: e.target.value })}
                              placeholder="Domaine d'intervention"
                              className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                            />
                          </div>
                        </>
                      )}

                      {user?.role === "expert" && (
                        <>
                          <div>
                            <label className="text-sm font-black text-gray-700 block mb-2">Spécialité</label>
                            <input
                              value={profileForm.specialite ?? ""}
                              onChange={e => setProfileForm({ ...profileForm, specialite: e.target.value })}
                              placeholder="Spécialité"
                              className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-black text-gray-700 block mb-2">Contact</label>
                            <input
                              value={profileForm.contact ?? ""}
                              onChange={e => setProfileForm({ ...profileForm, contact: e.target.value })}
                              placeholder="Contact (téléphone)"
                              className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                            />
                          </div>
                        </>
                      )}

                      {user?.role === "user" && (
                        <div>
                          <label className="text-sm font-black text-gray-700 block mb-2">Type de handicap</label>
                          <input
                            value={profileForm.type_handicap ?? ""}
                            onChange={e => setProfileForm({ ...profileForm, type_handicap: e.target.value })}
                            placeholder="Type de handicap"
                            className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                          />
                        </div>
                      )}

                      <div className="md:col-span-2">
                        <label className="text-sm font-black text-gray-700 block mb-2">Bio</label>
                        <textarea
                          value={profileForm.bio ?? ""}
                          onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                          placeholder="Bio"
                          rows={3}
                          className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 resize-none"
                        />
                      </div>
                    </div>
                    {profileError && (
                      <p className="mt-3 text-sm font-semibold text-red-600" role="alert">
                        {profileError}
                      </p>
                    )}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={saveProfile}
                        disabled={savingProfile}
                        className="flex items-center gap-1.5 bg-gray-900 text-white font-black text-sm px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-60"
                      >
                        <CheckCircle size={14} /> {savingProfile ? "Enregistrement…" : "Enregistrer"}
                      </button>
                      <button
                        onClick={() => {
                          setProfileError("");
                          setProfileForm({
                            nom: user.nom,
                            prenom: user.prenom,
                            username: user.username,
                            email: user.email,
                            ville: user.ville,
                            entreprise_nom: user.entreprise_nom,
                            contact: user.contact,
                            domaine_intervention: user.domaine_intervention,
                            specialite: user.specialite,
                            type_handicap: user.type_handicap,
                            bio: user.bio,
                          });
                          setEditProfile(false);
                        }}
                        className="text-sm font-black text-gray-400 hover:text-gray-700 transition-colors px-3"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t-2 border-gray-100">
              {[
                { n: user?.stats?.publications ?? 0, l: "Publications", icon: FileText },
                { n: user?.stats?.likesRecus ?? 0, l: "J'aime reçus", icon: Heart },
                { n: user?.stats?.vues?.toLocaleString?.() ?? "0", l: "Vues totales", icon: Eye },
              ].map(s => (
                <div key={s.l} className="text-center">
                  <div className="text-2xl font-black text-gray-900">{s.n}</div>
                  <div className="text-sm font-semibold text-gray-400 mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== ONGLETS ===== */}
        <div className="flex gap-1 bg-white border-2 border-gray-200 p-1 rounded-2xl mb-6 w-fit">
          {([
            { key: "publications", label: "Publications", icon: FileText },
            { key: "apropos", label: "À propos", icon: Briefcase },
            { key: "certification", label: "Certification", icon: Shield },
          ] as const).map(o => (
            <button
              key={o.key}
              onClick={() => setOnglet(o.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-base font-black transition-all ${onglet === o.key
                  ? "bg-gray-900 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
            >
              <o.icon size={16} />
              {o.label}
            </button>
          ))}
        </div>

        {/* ===== PUBLICATIONS ===== */}
        {onglet === "publications" && (
          <div className="pb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-gray-900">
                Mes publications
              </h2>
              <button
                onClick={() => setModalPublication(true)}
                className="flex items-center gap-2 bg-gray-900 text-white font-black text-sm px-4 py-2.5 rounded-xl hover:bg-gray-700 transition-all"
              >
                <Plus size={16} /> Nouvelle publication
              </button>
            </div>

            {publications.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-14 text-center">
                <FileText size={36} className="text-gray-200 mx-auto mb-4" />
                <p className="text-lg font-black text-gray-500 mb-2">
                  Aucune publication pour l&apos;instant
                </p>
                <button
                  onClick={() => setModalPublication(true)}
                  className="inline-flex items-center gap-2 bg-gray-900 text-white font-black text-base px-5 py-3 rounded-xl hover:bg-gray-700 transition-colors mt-3"
                >
                  <Plus size={18} /> Créer ma première publication
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {publications.map(pub => (
                  <PublicationCard key={pub.id} pub={pub} onLike={handleLike} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== À PROPOS ===== */}
        {onglet === "apropos" && (
          <div className="pb-12">
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 flex flex-col gap-6">
              <h2 className="text-xl font-black text-gray-900">
                Informations personnelles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getProfileFields().map(item => (
                  <div key={item.label} className="bg-gray-50 border-2 border-gray-100 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 text-xs font-black text-gray-400 uppercase tracking-wide mb-1.5">
                      <item.icon size={12} /> {item.label}
                    </div>
                    <p className="text-base font-black text-gray-900">{item.val}</p>
                  </div>
                ))}
              </div>

              {/* Type de handicap — déclaratif */}
              <div className="flex items-start gap-3 bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-black text-amber-800 mb-0.5">
                    Compte non certifié
                  </p>
                  <p className="text-sm font-semibold text-amber-700 leading-relaxed">
                    Vos informations sont déclaratives. Certifiez votre compte
                    pour accéder à toutes les fonctionnalités et renforcer votre crédibilité.
                  </p>
                  <button
                    onClick={() => setModalCertificationUnavailable(true)}
                    className="flex items-center gap-1.5 text-sm font-black text-amber-800 hover:underline mt-2"
                  >
                    Certifier maintenant <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== CERTIFICATION ===== */}
        {onglet === "certification" && (
          <div className="pb-12">
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-900">
                  Statut de certification
                </h2>
                <span className={`flex items-center gap-2 text-sm font-black px-3 py-1.5 rounded-full ${user.is_verified
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-gray-100 text-gray-500"
                  }`}>
                  {user.is_verified
                    ? <><CheckCircle size={14} /> Compte certifié</>
                    : <><AlertCircle size={14} /> Non certifié</>
                  }
                </span>
              </div>

              {!user.is_verified && (
                <>
                  {/* Étapes visuelles */}
                  <div className="flex flex-col gap-4">
                    {[
                      { n: 1, label: "Partenariat Persona en cours de finalisation", done: false },
                      { n: 2, label: "Scan document à puce NFC + selfie (chez Persona)", done: false },
                      { n: 3, label: "Badge « identité vérifiée » sur votre profil", done: false },
                    ].map(step => (
                      <div key={step.n} className="flex items-center gap-4">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${step.done
                            ? "bg-emerald-600 text-white"
                            : "bg-gray-100 text-gray-400"
                          }`}>
                          {step.done ? <CheckCircle size={16} /> : step.n}
                        </div>
                        <span className={`text-base font-semibold ${step.done ? "text-emerald-700 line-through" : "text-gray-700"
                          }`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setModalCertificationUnavailable(true)}
                    className="w-full bg-amber-500 text-white font-black text-base py-4 rounded-xl hover:bg-amber-600 transition-all flex items-center justify-center gap-2 hover:shadow-lg"
                  >
                    <Shield size={20} /> Lancer la certification
                  </button>
                </>
              )}

              {user.is_verified && (
                <div className="flex flex-col gap-6 py-4">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200">
                      <CheckCircle size={32} className="text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900">
                        Votre compte est certifié
                      </h3>
                      <p className="text-sm font-semibold text-gray-400 mt-1 max-w-md">
                        Le badge de vérification est affiché à côté de votre nom sur toute la plateforme.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 border-2 border-gray-100 rounded-2xl p-6">
                    <div>
                      <span className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-1">Méthode de certification</span>
                      <span className="text-base font-black text-gray-900">
                        {user.verification_type === "email_pro"
                          ? "Email Professionnel"
                          : "Identité vérifiée (document à puce)"}
                      </span>
                    </div>
                    {user.pro_email && (
                      <div>
                        <span className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-1">Email certifié</span>
                        <span className="text-base font-black text-gray-900">{user.pro_email}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-1">Date de certification</span>
                      <span className="text-base font-black text-gray-900">
                        {user.verified_at ? new Date(user.verified_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <h4 className="text-base font-black text-red-600 mb-2">Zone sensible</h4>
                    <p className="text-sm font-semibold text-gray-400 mb-4 leading-relaxed">
                      Si vous révoquez votre certification, votre badge sera définitivement retiré et toutes vos informations de certification seront effacées.
                    </p>
                    <button
                      onClick={async () => {
                        if (confirm("Êtes-vous sûr de vouloir révoquer votre certification ? Cette action est irréversible.")) {
                          try {
                            await revokeVerification();
                            alert("Votre certification a été révoquée avec succès.");
                            window.location.reload();
                          } catch {
                            alert("Erreur lors de la révocation.");
                          }
                        }
                      }}
                      className="border-2 border-red-200 text-red-600 hover:bg-red-50 font-black text-sm px-5 py-3 rounded-xl transition-all"
                    >
                      Révoquer ma certification
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===== MODALS ===== */}
      {modalPublication && (
        <ModalPublication
          onClose={() => setModalPublication(false)}
          onSuccess={() => {
            getMyPosts().then(posts => setPublications(posts.map(p => ({
              id: p.id, type: "texte", titre: p.titre, contenu: p.contenu, date: new Date(p.cree_le).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(",", " à"), likes: p.likes_count, vues: p.vues, liked: p.liked_by_me
            }))));
          }}
        />
      )}
      {modalCertificationUnavailable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div ref={certificationModalRef} className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4">
              <Shield size={28} className="text-amber-600" />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-3">Certification</h2>
            <p className="text-base font-semibold text-gray-600 leading-relaxed mb-6">
              {CERTIFICATION_UNAVAILABLE_MSG}
            </p>
            <button
              onClick={() => setModalCertificationUnavailable(false)}
              className="w-full bg-gray-900 text-white font-black text-base py-3.5 rounded-xl hover:bg-gray-800 transition-colors"
            >
              Compris
            </button>
          </div>
        </div>
      )}
    </div>
  );
}