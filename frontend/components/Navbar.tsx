"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home, MessageCircle, Mic, Briefcase, BookOpen,
  ShieldCheck, User, LogOut, ChevronDown, Heart, Menu, X, Bell, MessageSquare
} from "lucide-react";

const links = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/forum", label: "Forum", icon: MessageCircle },
  { href: "/medias", label: "Médias", icon: Mic },
  { href: "/emploi", label: "Emploi", icon: Briefcase },
  { href: "/education", label: "Éducation", icon: BookOpen },
  { href: "/services", label: "Services", icon: ShieldCheck },
  { href: "/temoignages", label: "Témoignages", icon: Heart },
];

import { getDashboardPath, ROLE_LABELS, type UserInfo } from "@/lib/auth";

export default function Navbar() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const mobileNotifRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const loadUser = () => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
      setNotifications([]);
      setUnreadMessages(0);
    }
  };

  const loadNotifications = async () => {
    try {
      if (!localStorage.getItem("token")) {
        setNotifications([]);
        return;
      }
      const mod = await import("@/services/notifications");
      const data = await mod.getMyNotifications();
      setNotifications(data || []);
    } catch (e) {
      console.debug("Could not load notifications", e);
      setNotifications([]);
    }
  };

  const loadUnreadMessages = async () => {
    try {
      if (!localStorage.getItem("token")) {
        setUnreadMessages(0);
        return;
      }
      const mod = await import("@/services/messaging");
      const count = await mod.getUnreadMessagesCount();
      setUnreadMessages(count || 0);
    } catch (e) {
      console.debug("Could not load unread messages", e);
      setUnreadMessages(0);
    }
  };

  useEffect(() => {
    loadUser();
    loadNotifications();
    loadUnreadMessages();

    window.addEventListener("auth-change", loadUser);
    window.addEventListener("storage", loadUser);

    // Polling toutes les 30s pour notifications + messages non lus
    const interval = setInterval(() => {
      if (localStorage.getItem("token")) {
        loadNotifications();
        loadUnreadMessages();
      }
    }, 30000);

    return () => {
      window.removeEventListener("auth-change", loadUser);
      window.removeEventListener("storage", loadUser);
      clearInterval(interval);
    };
  }, []);

  // Fermer les menus si clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
      if (
        (notifRef.current && !notifRef.current.contains(event.target as Node)) &&
        (!mobileNotifRef.current || !mobileNotifRef.current.contains(event.target as Node))
      ) {
        setNotificationsOpen(false);
      }
      if (
        mobileRef.current &&
        !mobileRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('button[aria-label="Ouvrir le menu"]') &&
        !(event.target as Element).closest('button[aria-label="Fermer le menu"]')
      ) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setMenuOpen(false);
    window.dispatchEvent(new Event("auth-change"));
    router.push("/");
  };

  const handleNotificationClick = async (n: any) => {
    // Marquer comme lu
    try {
      const mod = await import("@/services/notifications");
      await mod.markNotificationRead(n.id);
      setNotifications(prev => prev.map(notif => notif.id === n.id ? { ...notif, read: true } : notif));
    } catch { /* ignore */ }
    // Rediriger si data présent
    if (n.data) {
      setNotificationsOpen(false);
      router.push(n.data);
    }
  };

  const unreadNotifs = notifications.filter(n => !n.read).length;

  return (
    <header className="relative border-b-2 border-emerald-700 bg-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group md:min-w-[280px]">
          <img src="/logo.png" alt="Nio Far" className="md:h-[120px] h-10 w-auto max-w-[300px] object-contain" />
        </Link>

        {/* Mobile icons & hamburger button */}
        <div className="md:hidden flex items-center gap-1 ml-2">
          {user && (
            <div className="flex items-center">
              <Link
                href="/messages"
                className="relative p-2 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Messages"
              >
                <MessageSquare className="w-5 h-5 text-gray-600" />
                {unreadMessages > 0 && (
                  <span className="absolute 1 top-0 right-0 bg-blue-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                )}
              </Link>

              <div className="relative" ref={mobileNotifRef}>
                <button
                  onClick={async () => {
                    const next = !notificationsOpen;
                    setNotificationsOpen(next);
                    if (next) await loadNotifications();
                  }}
                  aria-label="Notifications"
                  className="relative p-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {unreadNotifs > 0 && (
                    <span className="absolute 1 top-0 right-0 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {unreadNotifs > 9 ? "9+" : unreadNotifs}
                    </span>
                  )}
                </button>
                {/* Mobile notifications dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-[85vw] max-w-sm bg-white border border-gray-200 rounded-2xl shadow-2xl py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                      <p className="text-sm font-black text-gray-900">Notifications</p>
                      {unreadNotifs > 0 && (
                        <button
                          onClick={async () => {
                            try {
                              const mod = await import("@/services/notifications");
                              await mod.markAllNotificationsRead();
                              await loadNotifications();
                            } catch (e) { console.debug(e); }
                          }}
                          className="text-xs text-emerald-600 font-bold hover:underline"
                        >
                          Tout lu
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-400">Aucune notification</p>
                        </div>
                      ) : (
                        notifications.slice(0, 15).map((n) => (
                          <button
                            key={n.id}
                            onClick={() => { handleNotificationClick(n); setNotificationsOpen(false); }}
                            className={`w-full text-left px-4 py-3 border-b border-gray-50 last:border-b-0 transition-colors hover:bg-gray-50 ${n.read ? "opacity-60" : ""}`}
                          >
                            <div className="flex items-start gap-2">
                              {!n.read && <span className="mt-1.5 w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0" />}
                              <div className={!n.read ? "" : "pl-4"}>
                                <p className="text-sm font-bold text-gray-900">{n.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{n.content}</p>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors ml-1"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Liens desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-2 text-base text-gray-800 px-4 py-2.5 rounded-lg hover:bg-emerald-100 hover:text-emerald-900 transition-all font-semibold"
              >
                <Icon className="h-5 w-5" />
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions — conditionnelles selon l'auth */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            /* ===== UTILISATEUR CONNECTÉ ===== */
            <>

              {/* Menu utilisateur */}
              <div className="relative" ref={menuRef}>
                <div className="flex flex-col items-center gap-1">
                  {/* Ligne 1 : avatar + nom + chevron */}
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                    aria-label="Menu utilisateur"
                  >
                    <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-black text-sm">
                      {user.username?.[0]?.toUpperCase() ?? user.prenom?.[0]?.toUpperCase() ?? ""}
                    </div>
                    <span className="text-sm font-bold text-gray-800 max-w-[120px] truncate">
                      {user.username || `${user.prenom} ${user.nom}`}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-gray-400 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Ligne 2 : icônes message + notif */}
                  <div className="flex items-center justify-center gap-3 pb-1">
                    {/* Messages */}
                    <Link
                      href="/messages"
                      className="relative p-1.5 rounded-lg hover:bg-gray-100 transition-colors group"
                      aria-label="Messages"
                    >
                      <MessageSquare className="w-[18px] h-[18px] text-gray-400 group-hover:text-emerald-600 transition-colors" />
                      {unreadMessages > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 bg-blue-500 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                          {unreadMessages > 9 ? "9+" : unreadMessages}
                        </span>
                      )}
                    </Link>

                    {/* Notifications */}
                    <div className="relative" ref={notifRef}>
                      <button
                        onClick={async () => {
                          const next = !notificationsOpen;
                          setNotificationsOpen(next);
                          if (next) await loadNotifications();
                        }}
                        aria-label="Notifications"
                        className="relative p-1.5 rounded-lg hover:bg-gray-100 transition-colors group"
                      >
                        <Bell className="w-[18px] h-[18px] text-gray-400 group-hover:text-emerald-600 transition-colors" />
                        {unreadNotifs > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                            {unreadNotifs > 9 ? "9+" : unreadNotifs}
                          </span>
                        )}
                      </button>

                      {/* Notifications dropdown */}
                      {notificationsOpen && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl py-2 z-50">
                          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                            <p className="text-sm font-black text-gray-900">Notifications</p>
                            {unreadNotifs > 0 && (
                              <button
                                onClick={async () => {
                                  try {
                                    const mod = await import("@/services/notifications");
                                    await mod.markAllNotificationsRead();
                                    await loadNotifications();
                                  } catch (e) { console.debug(e); }
                                }}
                                className="text-xs text-emerald-600 font-bold hover:underline"
                              >
                                Tout marquer lu
                              </button>
                            )}
                          </div>
                          <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                              <div className="px-4 py-8 text-center">
                                <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">Aucune notification</p>
                              </div>
                            ) : (
                              notifications.slice(0, 15).map((n) => (
                                <button
                                  key={n.id}
                                  onClick={() => { handleNotificationClick(n); setNotificationsOpen(false); }}
                                  className={`w-full text-left px-4 py-3 border-b border-gray-50 last:border-b-0 transition-colors hover:bg-gray-50 ${n.read ? "opacity-60" : ""}`}
                                >
                                  <div className="flex items-start gap-2">
                                    {!n.read && <span className="mt-1.5 w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0" />}
                                    <div className={!n.read ? "" : "pl-4"}>
                                      <p className="text-sm font-bold text-gray-900">{n.title}</p>
                                      <p className="text-xs text-gray-500 mt-0.5">{n.content}</p>
                                      <p className="text-[10px] text-gray-400 mt-1">
                                        {new Date(n.cree_le).toLocaleString("fr-FR", {
                                          day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                          {notifications.length > 0 && (
                            <div className="px-4 py-2 border-t border-gray-100">
                              <Link
                                href="/messages"
                                onClick={() => setNotificationsOpen(false)}
                                className="block text-center text-xs text-emerald-600 font-bold hover:underline"
                              >
                                Voir tous les messages →
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border-2 border-gray-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-black text-gray-900 truncate">
                        {user.username || `${user.prenom} ${user.nom}`}
                      </p>
                      {user.username && (
                        <p className="text-xs font-semibold text-gray-400 truncate">
                          {`${user.prenom} ${user.nom}`}
                        </p>
                      )}
                      <p className="text-xs font-semibold text-gray-400 truncate">{user.email}</p>
                      <p className="text-xs font-semibold text-emerald-600 truncate">
                        {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] ?? user.role}
                      </p>
                    </div>
                    <Link
                      href={getDashboardPath(user.role)}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User size={16} className="text-emerald-500" />
                      Mon dashboard
                    </Link>
                    <Link
                      href="/profil"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User size={16} className="text-gray-400" />
                      Mon profil
                    </Link>
                    <Link
                      href="/messages"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <MessageSquare size={16} className="text-emerald-600" />
                      Messagerie
                      {unreadMessages > 0 && (
                        <span className="ml-auto bg-emerald-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                          {unreadMessages}
                        </span>
                      )}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* ===== UTILISATEUR NON CONNECTÉ ===== */
            <Link
              href="/connexion"
              className="text-base text-white px-5 py-2.5 bg-emerald-700 rounded-lg hover:bg-emerald-800 font-bold transition-colors shadow-md hover:shadow-lg"
            >
              Se connecter
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div ref={mobileRef} className="md:hidden bg-white border-t border-gray-100 shadow-md">
          <nav className="flex flex-col px-4 py-3 gap-1">
            {links.map((l) => {
              const Icon = l.icon;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 text-base text-gray-800 px-3 py-2 rounded-md hover:bg-emerald-50 transition-colors font-semibold"
                >
                  <Icon className="h-5 w-5" />
                  {l.label}
                </Link>
              );
            })}

            <div className="mt-2 pt-2 border-t border-gray-100">
              {user ? (
                <div className="flex flex-col gap-1">
                  <Link
                    href={getDashboardPath(user.role)}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-bold text-gray-700 hover:bg-gray-50"
                  >
                    <User size={16} className="text-emerald-500" />
                    Mon dashboard
                  </Link>
                  <Link
                    href="/profil"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-bold text-gray-700 hover:bg-gray-50"
                  >
                    <User size={16} className="text-gray-400" />
                    Mon profil
                  </Link>
                  <Link
                    href="/messages"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-bold text-gray-700 hover:bg-gray-50"
                  >
                    <MessageSquare size={16} className="text-emerald-600" />
                    Messagerie
                    {unreadMessages > 0 && (
                      <span className="ml-auto bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {unreadMessages}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileOpen(false);
                    }}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm font-bold text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Se déconnecter
                  </button>
                </div>
              ) : (
                <Link
                  href="/connexion"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center text-white px-4 py-2 bg-emerald-700 rounded-md font-bold"
                >
                  Se connecter
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}