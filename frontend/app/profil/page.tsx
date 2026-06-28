"use client";
import { useEffect, useState, useRef } from "react";
import {
  Camera, Edit3, CheckCircle, Upload, X, Mic,
  FileText, Image, MapPin, Briefcase, Mail,
  Shield, Star, Heart, MessageSquare, Eye,
  Plus, Clock, AlertCircle, ChevronRight,
  Lock, ArrowRight
} from "lucide-react";

// ---- TYPES ----
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

// ---- MOCK PUBLICATIONS (inchangé) ----
const publicationsData: Publication[] = [
  {
    id: 1,
    type: "podcast",
    titre: "Mon parcours vers l'ingénierie",
    contenu: "Je raconte mon expérience...",
    date: "2 mai 2025",
    likes: 142,
    vues: 1240,
    liked: false,
    duree: "18 min",
  },
];

// ---- PAGE ----
export default function ProfilPage() {
  const [user, setUser] = useState<any>(null);

  const [publications, setPublications] = useState(publicationsData);
  const [onglet, setOnglet] = useState<OngletProfil>("publications");

  const [modalPublication, setModalPublication] = useState(false);
  const [modalCertification, setModalCertification] = useState(false);

  const [editBio, setEditBio] = useState(false);
  const [bio, setBio] = useState("");

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  // 🔥 récupération user connecté
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setBio(parsed.bio || "");
      setAvatarUrl(parsed.avatar_url || null);
    }
  }, []);

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const handleLike = (id: number) => {
    setPublications(prev =>
      prev.map(p => p.id === id ? { ...p, liked: !p.liked } : p)
    );
  };

  // 🔥 loading safe
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Chargement...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ===== HEADER ===== */}
      <div className="bg-gray-900 h-40 relative" />

      <div className="max-w-5xl mx-auto px-6">

        <div className="relative -mt-16">
          <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">

            {/* AVATAR */}
            <div className="flex gap-6">

              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-emerald-100 flex items-center justify-center">
                  {avatarUrl ? (
                    <img src={avatarUrl} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-black">
                      {user.prenom?.[0]}{user.nom?.[0]}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => avatarRef.current?.click()}
                  className="absolute -bottom-1 -right-1 bg-black text-white p-2 rounded-full"
                >
                  <Camera size={14} />
                </button>

                <input
                  ref={avatarRef}
                  type="file"
                  className="hidden"
                  onChange={handleAvatar}
                />
              </div>

              {/* INFOS */}
              <div>
                <h1 className="text-2xl font-black">
                  {user.prenom} {user.nom}
                </h1>

                <p className="text-gray-500">{user.profession}</p>
                <p className="text-gray-400">{user.email}</p>
              </div>

            </div>

          </div>
        </div>

        {/* CONTENU */}
        {onglet === "publications" && (
          <div className="mt-6">
            {publications.map(pub => (
              <div key={pub.id} className="border p-4 mb-3 rounded-xl">
                <h3 className="font-black">{pub.titre}</h3>
                <p>{pub.contenu}</p>

                <button onClick={() => handleLike(pub.id)}>
                  ❤️ {pub.likes}
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}