"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Building2, Scale, Stethoscope, School, Wrench,
  CreditCard, Search, X, ChevronRight, ArrowRight,
  MapPin, Phone, Mail, ExternalLink, CheckCircle,
  Clock, Filter, AlertCircle, Heart, Loader2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getAnnuaireServices, type AnnuaireService } from "@/services/annuaire";
import { getPublicStats, type PublicStats } from "@/services/stats";
import { useClickOutside } from "@/hooks/useClickOutside";

// ---- Types ----
type Service = {
  id: number;
  nom: string;
  sigle: string;
  categorie: string;
  description: string;
  missions: string[];
  contact: {
    telephone?: string;
    email?: string;
    site?: string;
    adresse?: string;
  };
  villes: string[];
  horaires?: string;
  gratuit: boolean;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  nouveau?: boolean;
};

type Categorie = {
  label: string;
  value: string;
  icon: LucideIcon;
};

const categorieStyles: Record<string, { icon: LucideIcon; iconBg: string; iconColor: string }> = {
  institution: { icon: Building2, iconBg: "bg-emerald-100", iconColor: "text-emerald-700" },
  financier: { icon: CreditCard, iconBg: "bg-emerald-100", iconColor: "text-emerald-700" },
  sante: { icon: Stethoscope, iconBg: "bg-emerald-100", iconColor: "text-emerald-700" },
  education: { icon: School, iconBg: "bg-emerald-100", iconColor: "text-emerald-700" },
  droits: { icon: Scale, iconBg: "bg-emerald-100", iconColor: "text-emerald-700" },
  technique: { icon: Wrench, iconBg: "bg-emerald-100", iconColor: "text-emerald-700" },
};

const DEFAULT_CATEGORIE_STYLE = {
  icon: Building2,
  iconBg: "bg-gray-100",
  iconColor: "text-gray-700",
};

function mapAnnuaireToService(api: AnnuaireService): Service {
  const style = categorieStyles[api.categorie] ?? DEFAULT_CATEGORIE_STYLE;
  const isNew = Date.now() - new Date(api.cree_le).getTime() < 30 * 24 * 60 * 60 * 1000;
  return {
    id: api.id,
    nom: api.nom,
    sigle: api.sigle || api.nom.slice(0, 3).toUpperCase(),
    categorie: api.categorie,
    description: api.description,
    missions: api.missions,
    contact: api.contact,
    villes: api.villes,
    horaires: api.horaires,
    gratuit: api.gratuit,
    icon: style.icon,
    iconBg: style.iconBg,
    iconColor: style.iconColor,
    nouveau: isNew,
  };
}

// ---- Données ----
const categories: Categorie[] = [
  { label: "Tous", value: "tous", icon: Filter },
  { label: "Institutions", value: "institution", icon: Building2 },
  { label: "Aides financières", value: "financier", icon: CreditCard },
  { label: "Santé", value: "sante", icon: Stethoscope },
  { label: "Éducation", value: "education", icon: School },
  { label: "Droits", value: "droits", icon: Scale },
  { label: "Aides techniques", value: "technique", icon: Wrench },
];

function ServiceCardSkeleton() {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 animate-pulse flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-20 bg-gray-200 rounded" />
          <div className="h-4 w-full bg-gray-200 rounded" />
        </div>
      </div>
      <div className="h-4 w-full bg-gray-200 rounded" />
      <div className="h-4 w-5/6 bg-gray-200 rounded" />
      <div className="h-8 w-32 bg-gray-200 rounded-xl ml-auto" />
    </div>
  );
}

// ---- Composant carte service ----
function ServiceCard({
  service,
  onSelect,
}: {
  service: Service;
  onSelect: (s: Service) => void;
}) {
  return (
    <article className="group bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-gray-900 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${service.iconBg}`}>
          <service.icon size={22} className={service.iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <span className="text-lg font-black text-gray-900">{service.sigle}</span>
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {service.gratuit && (
                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  Gratuit
                </span>
              )}
              {service.nouveau && (
                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  Nouveau
                </span>
              )}
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-500 leading-tight mt-0.5 line-clamp-1">
            {service.nom}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm font-semibold text-gray-600 leading-relaxed line-clamp-2">
        {service.description}
      </p>

      {/* Missions courtes */}
      <div className="flex flex-col gap-1.5">
        {service.missions.slice(0, 2).map((m, i) => (
          <div key={i} className="flex items-start gap-2">
            <CheckCircle size={13} className={`${service.iconColor} flex-shrink-0 mt-0.5`} />
            <span className="text-sm font-semibold text-gray-500 leading-snug">{m}</span>
          </div>
        ))}
        {service.missions.length > 2 && (
          <span className="text-sm font-bold text-gray-400 ml-5">
            +{service.missions.length - 2} autres missions
          </span>
        )}
      </div>

      {/* Villes */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <MapPin size={13} className="text-gray-400 flex-shrink-0" />
        {service.villes.map(v => (
          <span key={v} className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {v}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t-2 border-gray-100">
        {service.horaires && (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-400">
            <Clock size={13} /> {service.horaires}
          </span>
        )}
        <button
          onClick={() => onSelect(service)}
          aria-label={`Voir les détails de ${service.sigle}`}
          className="flex items-center gap-1.5 text-sm font-black text-gray-900 border-2 border-gray-900 px-4 py-2 rounded-xl hover:bg-gray-900 hover:text-white transition-all ml-auto group-hover:bg-gray-900 group-hover:text-white"
        >
          Voir les détails <ChevronRight size={14} />
        </button>
      </div>
    </article>
  );
}

// ---- Modal détail service ----
function ModalService({
  service,
  onClose,
}: {
  service: Service;
  onClose: () => void;
}) {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);
  
  const modalRef = useClickOutside<HTMLDivElement>(handleClose);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div ref={modalRef} className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">

        {/* Header sticky */}
        <div className="sticky top-0 bg-white z-10 px-7 py-5 border-b-2 border-gray-100 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${service.iconBg}`}>
              <service.icon size={26} className={service.iconColor} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">{service.sigle}</h2>
              <p className="text-sm font-semibold text-gray-400 leading-snug mt-0.5">
                {service.nom}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-7 py-6 flex flex-col gap-6">

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {service.gratuit && (
              <span className="text-sm font-black px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800">
                Gratuit
              </span>
            )}
            <span className="text-sm font-black px-3 py-1.5 rounded-full bg-gray-100 text-gray-700">
              {categories.find(c => c.value === service.categorie)?.label}
            </span>
            {service.nouveau && (
              <span className="text-sm font-black px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800">
                Nouveau
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
              Description
            </p>
            <p className="text-base font-semibold text-gray-600 leading-relaxed">
              {service.description}
            </p>
          </div>

          {/* Missions */}
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
              Missions & services proposés
            </p>
            <div className="flex flex-col gap-2.5">
              {service.missions.map((m, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle size={16} className={`${service.iconColor} flex-shrink-0 mt-0.5`} />
                  <span className="text-base font-semibold text-gray-700 leading-snug">{m}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Infos pratiques */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-5">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
              Informations pratiques
            </p>
            <div className="flex flex-col gap-3">
              {service.contact.adresse && (
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-base font-semibold text-gray-700">
                    {service.contact.adresse}
                  </span>
                </div>
              )}
              {service.horaires && (
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-gray-400 flex-shrink-0" />
                  <span className="text-base font-semibold text-gray-700">
                    {service.horaires}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <MapPin size={13} className="text-gray-400" />
                <span className="text-sm font-black text-gray-500">Disponible à :</span>
                {service.villes.map(v => (
                  <span key={v} className="text-sm font-bold px-2.5 py-0.5 rounded-full bg-white border-2 border-gray-200 text-gray-700">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Contacts */}
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
              Contacts
            </p>
            <div className="flex flex-col gap-3">
              {service.contact.telephone && (
                <a
                  href={`tel:${service.contact.telephone}`}
                  className="flex items-center gap-3 p-3.5 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-900 transition-colors group"
                >
                  <Phone size={18} className="text-gray-400 group-hover:text-gray-900 flex-shrink-0" />
                  <span className="text-base font-black text-gray-700 group-hover:text-gray-900">
                    {service.contact.telephone}
                  </span>
                  <ChevronRight size={15} className="text-gray-300 ml-auto group-hover:text-gray-700" />
                </a>
              )}
              {service.contact.email && (
                <a
                  href={`mailto:${service.contact.email}`}
                  className="flex items-center gap-3 p-3.5 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-900 transition-colors group"
                >
                  <Mail size={18} className="text-gray-400 group-hover:text-gray-900 flex-shrink-0" />
                  <span className="text-base font-black text-gray-700 group-hover:text-gray-900">
                    {service.contact.email}
                  </span>
                  <ChevronRight size={15} className="text-gray-300 ml-auto group-hover:text-gray-700" />
                </a>
              )}
              {service.contact.site && (
                <a
                  href={service.contact.site}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3.5 bg-gray-900 rounded-xl hover:bg-gray-700 transition-colors group"
                >
                  <ExternalLink size={18} className="text-white flex-shrink-0" />
                  <span className="text-base font-black text-white">
                    Visiter le site officiel
                  </span>
                  <ChevronRight size={15} className="text-gray-400 ml-auto group-hover:text-white" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Page principale ----
export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [serviceSelectionne, setServiceSelectionne] = useState<Service | null>(null);
  const [categorieActive, setCategorieActive] = useState("tous");
  const [recherche, setRecherche] = useState("");
  const [gratuitsOnly, setGratuitsOnly] = useState(false);
  const [villeActive, setVilleActive] = useState("Toutes");

  useEffect(() => {
    getAnnuaireServices()
      .then((data) => {
        setServices(data.map(mapAnnuaireToService));
        setLoadError(false);
      })
      .catch(() => {
        setServices([]);
        setLoadError(true);
      })
      .finally(() => setLoadingServices(false));
  }, []);

  useEffect(() => {
    getPublicStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoadingStats(false));
  }, []);

  const villesDisponibles = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => s.villes.forEach((v) => set.add(v)));
    return ["Toutes", ...Array.from(set).sort((a, b) => a.localeCompare(b, "fr"))];
  }, [services]);

  const servicesFiltres = services
    .filter(s => categorieActive === "tous" || s.categorie === categorieActive)
    .filter(s => !gratuitsOnly || s.gratuit)
    .filter(s => villeActive === "Toutes" || s.villes.includes(villeActive))
    .filter(s =>
      !recherche ||
      s.nom.toLowerCase().includes(recherche.toLowerCase()) ||
      s.sigle.toLowerCase().includes(recherche.toLowerCase()) ||
      s.description.toLowerCase().includes(recherche.toLowerCase())
    );

  const gratuitsCount = services.filter((s) => s.gratuit).length;
  const regionsCount = new Set(services.flatMap((s) => s.villes)).size;

  const headerStats = [
    {
      n: loadingStats ? "…" : String(stats?.services_count ?? services.length),
      l: "Services répertoriés",
      icon: Building2,
      color: "text-emerald-600",
    },
    {
      n: loadingServices ? "…" : String(gratuitsCount),
      l: "Services gratuits",
      icon: Heart,
      color: "text-emerald-600",
    },
    {
      n: loadingServices ? "…" : String(regionsCount),
      l: "Régions couvertes",
      icon: MapPin,
      color: "text-blue-600",
    },
    {
      n: "100%",
      l: "Informations vérifiées",
      icon: CheckCircle,
      color: "text-violet-600",
    },
  ];

  const resetFiltres = () => {
    setRecherche("");
    setCategorieActive("tous");
    setGratuitsOnly(false);
    setVilleActive("Toutes");
  };

  const filtresActifs =
    categorieActive !== "tous" ||
    gratuitsOnly ||
    villeActive !== "Toutes" ||
    recherche !== "";

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ===== EN-TÊTE ===== */}
      <div className="bg-white border-b-2 border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <p className="text-sm font-black text-emerald-600 uppercase tracking-widest mb-2">
            Services & Ressources
          </p>
          <h1 className="text-4xl font-black text-gray-900 mb-3">
            Aides, droits et accompagnement
          </h1>
          <p className="text-lg font-semibold text-gray-600 max-w-xl leading-relaxed mb-8">
            Toutes les structures officielles, programmes gouvernementaux et
            associations disponibles au Sénégal pour vous accompagner.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {headerStats.map(s => (
              <div key={s.l} className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 flex items-center gap-3">
                <s.icon size={22} className={s.color} />
                <div>
                  <div className="text-xl font-black text-gray-900">{s.n}</div>
                  <div className="text-sm font-semibold text-gray-500">{s.l}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Alerte info */}
          <div className="flex items-start gap-3 bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4">
            <AlertCircle size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-black text-emerald-800">Informations à vérifier</p>
              <p className="text-sm font-semibold text-emerald-700 mt-0.5 leading-relaxed">
                Les horaires et contacts peuvent évoluer. Nous recommandons de vérifier
                directement auprès des structures avant tout déplacement.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* ===== FILTRES ===== */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 mb-8 flex flex-col gap-5">

          {/* Recherche */}
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              value={recherche}
              onChange={e => setRecherche(e.target.value)}
              placeholder="Rechercher un service, une aide..."
              aria-label="Rechercher un service"
              className="w-full pl-12 pr-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-all font-semibold"
            />
            {recherche && (
              <button
                onClick={() => setRecherche("")}
                aria-label="Effacer"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Catégories */}
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
              Catégorie
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map(c => (
                <button
                  key={c.value}
                  onClick={() => setCategorieActive(c.value)}
                  className={`flex items-center gap-1.5 text-sm font-black px-4 py-2 rounded-full border-2 transition-all ${
                    categorieActive === c.value
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  <c.icon size={13} />
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filtres secondaires */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t-2 border-gray-100">
            <select
              value={villeActive}
              onChange={e => setVilleActive(e.target.value)}
              aria-label="Filtrer par ville"
              className="px-4 py-2.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 font-semibold bg-white appearance-none cursor-pointer"
            >
              {villesDisponibles.map(v => (
                <option key={v}>{v}</option>
              ))}
            </select>
            <button
              onClick={() => setGratuitsOnly(!gratuitsOnly)}
              className={`flex items-center gap-2 text-sm font-black px-4 py-2.5 rounded-xl border-2 transition-all ${
                gratuitsOnly
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
              }`}
            >
              <Heart size={15} />
              Gratuits uniquement
            </button>
            {filtresActifs && (
              <button
                onClick={resetFiltres}
                className="flex items-center gap-1.5 text-sm font-black text-gray-400 hover:text-gray-700 transition-colors ml-auto"
              >
                <X size={14} /> Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* ===== RÉSULTATS ===== */}
        {loadingServices ? (
          <>
            <div className="flex items-center gap-2 mb-6 text-gray-500">
              <Loader2 size={18} className="animate-spin" />
              <p className="text-base font-semibold">Chargement des services…</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <ServiceCardSkeleton key={i} />
              ))}
            </div>
          </>
        ) : loadError ? (
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-14 text-center">
            <AlertCircle size={36} className="text-rose-300 mx-auto mb-4" />
            <p className="text-lg font-black text-gray-600 mb-2">Impossible de charger les services</p>
            <p className="text-base font-semibold text-gray-400">
              Vérifiez votre connexion et réessayez plus tard.
            </p>
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-14 text-center">
            <Building2 size={36} className="text-gray-200 mx-auto mb-4" />
            <p className="text-lg font-black text-gray-600 mb-2">Aucun service disponible</p>
            <p className="text-base font-semibold text-gray-400">
              L&apos;annuaire sera bientôt alimenté avec de nouvelles structures.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-base font-bold text-gray-500">
                <span className="font-black text-gray-900">{servicesFiltres.length}</span>{" "}
                service{servicesFiltres.length > 1 ? "s" : ""} trouvé{servicesFiltres.length > 1 ? "s" : ""}
                {categorieActive !== "tous" && (
                  <span className="text-emerald-600">
                    {" "}· {categories.find(c => c.value === categorieActive)?.label}
                  </span>
                )}
                {villeActive !== "Toutes" && (
                  <span className="text-emerald-600"> · {villeActive}</span>
                )}
              </p>
            </div>

            {servicesFiltres.length === 0 ? (
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-14 text-center">
                <Search size={36} className="text-gray-200 mx-auto mb-4" />
                <p className="text-lg font-black text-gray-600 mb-2">Aucun service trouvé</p>
                <p className="text-base font-semibold text-gray-400 mb-4">
                  Modifiez vos critères de recherche
                </p>
                <button
                  onClick={resetFiltres}
                  className="text-base font-black text-emerald-600 hover:underline"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {servicesFiltres.map(s => (
                  <ServiceCard
                    key={s.id}
                    service={s}
                    onSelect={setServiceSelectionne}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ===== CTA SIGNALER ===== */}
        <div className="mt-10 bg-white border-2 border-gray-200 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle size={24} className="text-emerald-600" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg font-black text-gray-900 mb-1">
              Une information incorrecte ?
            </h3>
            <p className="text-base font-semibold text-gray-500">
              Signalez-nous toute erreur ou changement de coordonnées pour que nous mettions à jour notre base.
            </p>
          </div>
          <button className="flex items-center gap-2 border-2 border-gray-900 text-gray-900 font-black text-base px-6 py-3.5 rounded-xl hover:bg-gray-900 hover:text-white transition-all flex-shrink-0">
            Signaler <ArrowRight size={18} />
          </button>
        </div>

        {/* ===== CTA AJOUTER SERVICE ===== */}
        <div className="mt-5 bg-gray-900 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <Building2 size={24} className="text-white" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg font-black text-white mb-1">
              Vous représentez une structure ?
            </h3>
            <p className="text-base font-semibold text-gray-400">
              Faites référencer votre organisation ou programme sur notre plateforme gratuitement.
            </p>
          </div>
          <button className="flex items-center gap-2 bg-white text-gray-900 font-black text-base px-6 py-3.5 rounded-xl hover:bg-gray-100 transition-all flex-shrink-0">
            Référencer ma structure <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* ===== MODAL ===== */}
      {serviceSelectionne && (
        <ModalService
          service={serviceSelectionne}
          onClose={() => setServiceSelectionne(null)}
        />
      )}
    </div>
  );
}