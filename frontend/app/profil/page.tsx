"use client";
import { useState, useRef } from "react";
import {
  Camera, Edit3, CheckCircle, Upload, X, Mic,
  FileText, Image, MapPin, Briefcase, Mail,
  Shield, Star, Heart, MessageSquare, Eye,
  Plus, Clock, AlertCircle, ChevronRight,
  Lock, ArrowRight
} from "lucide-react";

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

// ---- Données mock utilisateur ----
const utilisateur = {
  id: 1,
  prenom: "Aminata",
  nom: "Mbaye",
  email: "aminata@email.com",
  ville: "Dakar",
  profession: "Ingénieure informatique",
  typeHandicap: "Déficience visuelle",
  typeProfil: "personne",
  bio: "Ingénieure passionnée par le numérique inclusif. Je partage mon expérience pour inspirer d'autres personnes en situation de handicap à poursuivre leurs rêves dans la tech.",
  membre_depuis: "Janvier 2024",
  document_verified: false,
  avatar: null as string | null,
  stats: {
    publications: 4,
    likesRecus: 312,
    vues: 2840,
  },
};

const publicationsData: Publication[] = [
  {
    id: 1,
    type: "podcast",
    titre: "Mon parcours vers l'ingénierie avec une déficience visuelle",
    contenu: "Je raconte comment j'ai navigué le système éducatif sénégalais avec une déficience visuelle, les outils qui m'ont aidée et les obstacles surmontés.",
    date: "2 mai 2025",
    likes: 142,
    vues: 1240,
    liked: false,
    duree: "18 min",
  },
  {
    id: 2,
    type: "texte",
    titre: "5 outils numériques indispensables pour les malvoyants",
    contenu: "Voici une liste des outils qui ont transformé ma vie professionnelle : lecteurs d'écran, extensions de navigateur, applications mobiles... Tout ce que j'aurais voulu connaître plus tôt.",
    date: "15 avril 2025",
    likes: 98,
    vues: 870,
    liked: false,
  },
  {
    id: 3,
    type: "texte",
    titre: "Comment j'ai obtenu mes aménagements à l'UCAD",
    contenu: "Le processus n'est pas simple, mais c'est possible. Je détaille les démarches administratives, les textes de loi à citer et les personnes à contacter à l'Université Cheikh Anta Diop.",
    date: "28 mars 2025",
    likes: 54,
    vues: 620,
    liked: false,
  },
  {
    id: 4,
    type: "podcast",
    titre: "Interview — Travailler dans la tech au Sénégal avec un handicap",
    contenu: "Je discute avec deux autres développeurs handicapés de leurs expériences dans le secteur tech sénégalais, des entreprises inclusives et des défis du quotidien.",
    date: "10 mars 2025",
    likes: 18,
    vues: 110,
    liked: false,
    duree: "24 min",
  },
];

// ---- Modal publication ----
function ModalPublication({
  onClose,
}: {
  onClose: () => void;
}) {
  const [type, setType] = useState<"texte" | "podcast">("texte");
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [etape, setEtape] = useState<1 | 2>(1);
  const imageRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);

  const canSubmit = titre.trim().length >= 5 && contenu.trim().length >= 20;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">

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
                      className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 text-center transition-all ${
                        type === t.key
                          ? "border-gray-900 bg-gray-50 shadow-md"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        type === t.key ? "bg-gray-900" : "bg-gray-100"
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
                  Image d'illustration{" "}
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
                    <Image size={20} className="text-emerald-600 flex-shrink-0" />
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
                    <div className="flex items-center gap-3 p-4 bg-violet-50 border-2 border-violet-200 rounded-xl">
                      <Mic size={20} className="text-violet-600 flex-shrink-0" />
                      <span className="text-sm font-black text-violet-800 flex-1 truncate">
                        {audioFile.name}
                      </span>
                      <button
                        onClick={() => setAudioFile(null)}
                        className="text-violet-600 hover:text-violet-800"
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
                  disabled={type === "podcast" && !audioFile}
                  onClick={onClose}
                  className="flex-1 bg-gray-900 text-white font-black text-base py-3.5 rounded-xl hover:bg-gray-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Upload size={18} /> Publier
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
function ModalCertification({ onClose }: { onClose: () => void }) {
  const [etape, setEtape] = useState<1 | 2 | 3>(1);
  const [typeDoc, setTypeDoc] = useState("");
  const [fichier, setFichier] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const docs = [
    { val: "carte_invalidite", label: "Carte nationale d'invalidité ANPPH", desc: "Document officiel délivré par l'ANPPH" },
    { val: "certificat_medical", label: "Certificat médical d'un médecin agréé", desc: "Établi par un médecin reconnu par l'État" },
    { val: "attestation_css", label: "Attestation de la CSS", desc: "Caisse de Sécurité Sociale — branche invalidité" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        <div className="sticky top-0 bg-white z-10 px-7 py-5 border-b-2 border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900">Certifier mon compte</h2>
            <p className="text-sm font-semibold text-gray-400 mt-0.5">
              Étape {etape} / 3
            </p>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="h-1.5 bg-gray-100">
          <div className="h-1.5 bg-gray-900 transition-all duration-500" style={{ width: `${(etape / 3) * 100}%` }} />
        </div>

        <div className="px-7 py-6 flex flex-col gap-5">

          {etape === 1 && (
            <>
              {/* Explication */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <Shield size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-black text-blue-800 mb-1">
                      Pourquoi certifier mon compte ?
                    </p>
                    <p className="text-sm font-semibold text-blue-700 leading-relaxed">
                      Le badge de certification indique aux recruteurs et à la communauté
                      que votre situation de handicap a été vérifiée. Cela renforce
                      la confiance et donne accès à des offres réservées aux profils certifiés.
                    </p>
                  </div>
                </div>
              </div>

              {/* Avantages */}
              <div>
                <p className="text-sm font-black text-gray-700 mb-3">
                  Avantages du compte certifié
                </p>
                {[
                  "Badge ✓ Vérifié visible sur votre profil",
                  "Accès aux offres réservées aux profils certifiés",
                  "Témoignage mis en avant dans la communauté",
                  "Crédibilité renforcée auprès des recruteurs",
                ].map((a, i) => (
                  <div key={i} className="flex items-center gap-3 mb-2.5">
                    <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
                    <span className="text-base font-semibold text-gray-700">{a}</span>
                  </div>
                ))}
              </div>

              {/* Confidentialité */}
              <div className="flex items-start gap-3 bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                <Lock size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-semibold text-amber-700 leading-relaxed">
                  Vos documents sont traités de manière strictement confidentielle
                  et supprimés après vérification. Ils ne sont jamais partagés.
                </p>
              </div>

              <button
                onClick={() => setEtape(2)}
                className="w-full bg-gray-900 text-white font-black text-base py-4 rounded-xl hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
              >
                Commencer la certification <ChevronRight size={18} />
              </button>
            </>
          )}

          {etape === 2 && (
            <>
              <p className="text-base font-bold text-gray-500">
                Sélectionnez le type de document que vous souhaitez soumettre.
              </p>

              <div className="flex flex-col gap-3">
                {docs.map(d => (
                  <button
                    key={d.val}
                    onClick={() => setTypeDoc(d.val)}
                    className={`flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                      typeDoc === d.val
                        ? "border-gray-900 bg-gray-50 shadow-md"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      typeDoc === d.val ? "bg-gray-900" : "bg-gray-100"
                    }`}>
                      <Shield size={18} className={typeDoc === d.val ? "text-white" : "text-gray-500"} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-base font-black text-gray-900">{d.label}</p>
                        {typeDoc === d.val && <CheckCircle size={16} className="text-emerald-600" />}
                      </div>
                      <p className="text-sm font-semibold text-gray-400 mt-0.5">{d.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setEtape(1)} className="flex-1 border-2 border-gray-200 text-gray-600 font-black text-base py-3.5 rounded-xl hover:border-gray-400 transition-colors">
                  Retour
                </button>
                <button
                  onClick={() => setEtape(3)}
                  disabled={!typeDoc}
                  className="flex-1 bg-gray-900 text-white font-black text-base py-3.5 rounded-xl hover:bg-gray-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Continuer <ChevronRight size={18} />
                </button>
              </div>
            </>
          )}

          {etape === 3 && (
            <>
              <div>
                <p className="text-sm font-black text-gray-700 mb-1">
                  Importer votre document
                </p>
                <p className="text-sm font-semibold text-gray-400 mb-4">
                  {docs.find(d => d.val === typeDoc)?.label}
                </p>

                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={e => setFichier(e.target.files?.[0] ?? null)}
                />

                {fichier ? (
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl mb-4">
                    <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
                    <span className="text-sm font-black text-emerald-800 flex-1 truncate">
                      {fichier.name}
                    </span>
                    <button onClick={() => setFichier(null)} className="text-emerald-600 hover:text-emerald-800">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center gap-3 hover:border-gray-900 hover:bg-gray-50 transition-all mb-4"
                  >
                    <Upload size={32} className="text-gray-400" />
                    <div className="text-center">
                      <p className="text-base font-black text-gray-600">
                        Cliquez pour importer
                      </p>
                      <p className="text-sm font-semibold text-gray-400 mt-1">
                        PDF, JPG, PNG · Max 10MB
                      </p>
                    </div>
                  </button>
                )}
              </div>

              {/* Info délai */}
              <div className="flex items-start gap-3 bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                <Clock size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-semibold text-gray-600 leading-relaxed">
                  Votre document sera vérifié par notre équipe dans un délai de
                  <span className="font-black"> 48 à 72 heures</span>. Vous recevrez
                  une notification par email.
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setEtape(2)} className="flex-1 border-2 border-gray-200 text-gray-600 font-black text-base py-3.5 rounded-xl hover:border-gray-400 transition-colors">
                  Retour
                </button>
                <button
                  disabled={!fichier}
                  onClick={onClose}
                  className="flex-1 bg-gray-900 text-white font-black text-base py-3.5 rounded-xl hover:bg-gray-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Upload size={18} /> Soumettre
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

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
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          pub.type === "podcast" ? "bg-violet-100" : "bg-blue-100"
        }`}>
          {pub.type === "podcast"
            ? <Mic size={18} className="text-violet-600" />
            : <FileText size={18} className="text-blue-600" />
          }
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
              pub.type === "podcast"
                ? "bg-violet-100 text-violet-800"
                : "bg-blue-100 text-blue-800"
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
          <h3 className="text-base font-black text-gray-900 leading-snug group-hover:text-violet-700 transition-colors">
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
          className={`flex items-center gap-1.5 text-sm font-black transition-all ${
            pub.liked ? "text-rose-500" : "text-gray-400 hover:text-rose-400"
          }`}
        >
          <Heart size={15} className={pub.liked ? "fill-rose-500" : ""} />
          {pub.likes + (pub.liked ? 1 : 0)}
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

// ---- Page principale ----
export default function ProfilPage() {
  const [user] = useState(utilisateur);
  const [publications, setPublications] = useState<Publication[]>(publicationsData);
  const [onglet, setOnglet] = useState<OngletProfil>("publications");
  const [modalPublication, setModalPublication] = useState(false);
  const [modalCertification, setModalCertification] = useState(false);
  const [editBio, setEditBio] = useState(false);
  const [bio, setBio] = useState(user.bio);
  const [avatar, setAvatar] = useState<string | null>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatar(url);
    }
  };

  const handleLike = (id: number) => {
    setPublications(prev =>
      prev.map(p => p.id === id ? { ...p, liked: !p.liked } : p)
    );
  };

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
                  {avatar ? (
                    <img src={avatar} alt="Photo de profil" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-black text-emerald-800">
                      {user.prenom[0]}{user.nom[0]}
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
                        {user.prenom} {user.nom}
                      </h1>
                      {user.document_verified ? (
                        <span className="flex items-center gap-1.5 text-sm font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                          <CheckCircle size={13} /> Vérifié
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-sm font-black px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                          <AlertCircle size={13} /> Non vérifié
                        </span>
                      )}
                    </div>
                    <p className="text-base font-semibold text-gray-500 mt-1">
                      {user.profession}
                    </p>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-400">
                        <MapPin size={13} /> {user.ville}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-400">
                        <Mail size={13} /> {user.email}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-400">
                        <Clock size={13} /> Membre depuis {user.membre_depuis}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {!user.document_verified && (
                      <button
                        onClick={() => setModalCertification(true)}
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
                  </div>
                </div>

                {/* Bio */}
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
                          onClick={() => setEditBio(false)}
                          className="flex items-center gap-1.5 bg-gray-900 text-white font-black text-sm px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors"
                        >
                          <CheckCircle size={14} /> Enregistrer
                        </button>
                        <button
                          onClick={() => { setBio(user.bio); setEditBio(false); }}
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
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t-2 border-gray-100">
              {[
                { n: user.stats.publications, l: "Publications", icon: FileText },
                { n: user.stats.likesRecus, l: "J'aime reçus", icon: Heart },
                { n: user.stats.vues.toLocaleString(), l: "Vues totales", icon: Eye },
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
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-base font-black transition-all ${
                onglet === o.key
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
                  Aucune publication pour l'instant
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
                {[
                  { label: "Prénom", val: user.prenom, icon: Star },
                  { label: "Nom", val: user.nom, icon: Star },
                  { label: "Email", val: user.email, icon: Mail },
                  { label: "Ville", val: user.ville, icon: MapPin },
                  { label: "Profession", val: user.profession, icon: Briefcase },
                  { label: "Type de profil", val: "Personne en situation de handicap", icon: Shield },
                  { label: "Type de handicap", val: user.typeHandicap, icon: CheckCircle },
                  { label: "Membre depuis", val: user.membre_depuis, icon: Clock },
                ].map(item => (
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
                    onClick={() => setModalCertification(true)}
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
                <span className={`flex items-center gap-2 text-sm font-black px-3 py-1.5 rounded-full ${
                  user.document_verified
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  {user.document_verified
                    ? <><CheckCircle size={14} /> Compte certifié</>
                    : <><AlertCircle size={14} /> Non certifié</>
                  }
                </span>
              </div>

              {!user.document_verified && (
                <>
                  {/* Étapes visuelles */}
                  <div className="flex flex-col gap-4">
                    {[
                      { n: 1, label: "Choisir votre document", done: false },
                      { n: 2, label: "Soumettre le document", done: false },
                      { n: 3, label: "Vérification par l'équipe (48-72h)", done: false },
                      { n: 4, label: "Badge Vérifié sur votre profil", done: false },
                    ].map(step => (
                      <div key={step.n} className="flex items-center gap-4">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${
                          step.done
                            ? "bg-emerald-600 text-white"
                            : "bg-gray-100 text-gray-400"
                        }`}>
                          {step.done ? <CheckCircle size={16} /> : step.n}
                        </div>
                        <span className={`text-base font-semibold ${
                          step.done ? "text-emerald-700 line-through" : "text-gray-700"
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setModalCertification(true)}
                    className="w-full bg-amber-500 text-white font-black text-base py-4 rounded-xl hover:bg-amber-600 transition-all flex items-center justify-center gap-2 hover:shadow-lg"
                  >
                    <Shield size={20} /> Lancer la certification
                  </button>
                </>
              )}

              {user.document_verified && (
                <div className="flex flex-col items-center text-center gap-4 py-6">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle size={40} className="text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 mb-1">
                      Compte certifié
                    </h3>
                    <p className="text-base font-semibold text-gray-500">
                      Votre situation de handicap a été vérifiée par notre équipe.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===== MODALS ===== */}
      {modalPublication && (
        <ModalPublication onClose={() => setModalPublication(false)} />
      )}
      {modalCertification && (
        <ModalCertification onClose={() => setModalCertification(false)} />
      )}
    </div>
  );
}