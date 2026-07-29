"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MessageSquare, Search, Plus, Heart, Share2, Eye, Clock, ChevronRight, Loader2
} from "lucide-react";
import { getForums, getForumPosts, createPost, toggleLike, sharePost, type Forum, type Post } from "@/services/forums";
import { searchUsers } from "@/services/users";
import { getStoredUser, isAuthenticated } from "@/lib/auth";
import { useRouter } from "next/navigation";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
}

export default function ForumPage() {
  const router = useRouter();
  const [forums, setForums] = useState<Forum[]>([]);
  const [selectedForum, setSelectedForum] = useState<number | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [sharePostId, setSharePostId] = useState<number | null>(null);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareType, setShareType] = useState<"internal" | "message" | "external">("external");
  const [shareReceiverId, setShareReceiverId] = useState<number | undefined>(undefined);
  const [shareUserSearch, setShareUserSearch] = useState("");
  const [shareSearchResults, setShareSearchResults] = useState<{id: number, nom: string, prenom: string, role: string}[]>([]);
  const [searchingUser, setSearchingUser] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [shareLoading, setShareLoading] = useState(false);
  const [shareFeedback, setShareFeedback] = useState("");

  useEffect(() => {
    getForums()
      .then((f) => {
        setForums(f);
        if (f.length > 0) setSelectedForum(f[0].id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedForum) return;
    getForumPosts(selectedForum).then(setPosts).catch(console.error);
  }, [selectedForum]);

  const filtered = posts.filter(
    (p) =>
      p.titre.toLowerCase().includes(search.toLowerCase()) ||
      p.contenu.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!isAuthenticated()) {
      router.push("/connexion");
      return;
    }
    if (!selectedForum || !titre || !contenu) return;
    setSubmitting(true);
    setMessage("");
    try {
      const result = await createPost(selectedForum, titre, contenu);
      setShowModal(false);
      setTitre("");
      setContenu("");
      if (result.statut === "en_attente") {
        setMessage("Votre post a été soumis et attend l'approbation de l'expert du forum.");
      } else {
        setMessage("Votre post a été publié !");
        getForumPosts(selectedForum).then(setPosts);
      }
    } catch {
      setMessage("Erreur lors de la publication.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId: number) => {
    if (!isAuthenticated()) { router.push("/connexion"); return; }
    const result = await toggleLike(postId);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, liked_by_me: result.liked, likes_count: result.likes_count }
          : p
      )
    );
  };

  const openShareModal = (postId: number) => {
    setSharePostId(postId);
    setShareType("external");
    setShareReceiverId(undefined);
    setShareUserSearch("");
    setShareSearchResults([]);
    setShareMessage("");
    setShareFeedback("");
    setShareModalVisible(true);
  };

  const closeShareModal = () => {
    setShareModalVisible(false);
    setShareLoading(false);
    setShareFeedback("");
  };

  const handleShareSubmit = async () => {
    if (!sharePostId) return;
    if (shareType === "message" && !shareReceiverId) {
      setShareFeedback("Veuillez sélectionner un destinataire.");
      return;
    }

    setShareLoading(true);
    setShareFeedback("");

    try {
      const result = await sharePost(sharePostId, {
        type: shareType,
        receiver_id: shareType === "message" ? shareReceiverId : undefined,
        message: shareMessage.trim() || undefined,
        confirmed: true,
      });

      setPosts((prev) =>
        prev.map((p) =>
          p.id === sharePostId ? { ...p, shares_count: result.shares_count } : p
        )
      );

      if (shareType === "message") {
        setShareFeedback("Message envoyé à l'utilisateur ✓");
      } else {
        setShareFeedback("Post enregistré sur votre compte ✓");
      }

      setTimeout(() => closeShareModal(), 1500);
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      setShareFeedback(detail || "Impossible de partager le post. Vérifiez les informations et réessayez.");
    } finally {
      setShareLoading(false);
    }
  };


  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Chargement du forum...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-emerald-800 text-white py-10">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-black">Forum communautaire</h1>
          <p className="text-emerald-100 mt-2">Échangez, partagez et trouvez du soutien.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sticky top-24">
            <h2 className="font-black text-gray-900 mb-3 flex items-center gap-2">
              <MessageSquare size={18} className="text-emerald-600" />
              Forums
            </h2>
            <div className="space-y-1">
              {forums.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedForum(f.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                    selectedForum === f.id ? "bg-emerald-50 text-emerald-800" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {f.titre}
                  <span className="block text-xs text-gray-400 font-normal">{f.posts_count} sujets</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1">
          {message && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-semibold text-sm">
              {message}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un sujet..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white"
              />
            </div>
            <button
              onClick={() => isAuthenticated() ? setShowModal(true) : router.push("/connexion")}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800"
            >
              <Plus size={18} />
              Nouveau sujet
            </button>
          </div>

          <div className="space-y-4">
            {filtered.map((post) => (
              <article key={post.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-emerald-200 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Link href={`/forum/post/${post.id}`} className="group">
                      <h3 className="text-lg font-black text-gray-900 group-hover:text-emerald-700 transition-colors">
                        {post.titre}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                      <span className="font-semibold">{post.auteur.prenom} {post.auteur.nom}</span>
                      <Clock size={12} />
                      {timeAgo(post.cree_le)}
                    </p>
                    <p className="text-gray-600 mt-2 line-clamp-2">{post.contenu}</p>
                  </div>
                  <Link href={`/forum/post/${post.id}`}>
                    <ChevronRight className="text-gray-300" size={20} />
                  </Link>
                </div>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 text-sm font-bold ${
                      post.liked_by_me ? "text-red-500" : "text-gray-500 hover:text-red-500"
                    }`}
                  >
                    <Heart size={16} fill={post.liked_by_me ? "currentColor" : "none"} />
                    {post.likes_count}
                  </button>
                  <button
                    onClick={() => openShareModal(post.id)}
                    className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-emerald-600"
                  >
                    <Share2 size={16} />
                    {post.shares_count}
                  </button>
                  <span className="flex items-center gap-1.5 text-sm text-gray-400">
                    <MessageSquare size={16} />
                    {post.commentaires.length}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-gray-400 ml-auto">
                    <Eye size={16} />
                    {post.vues}
                  </span>
                </div>
              </article>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-gray-500 py-12">Aucun sujet dans ce forum pour le moment.</p>
            )}
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h2 className="text-lg font-black mb-4">Nouveau sujet</h2>
            <p className="text-sm text-gray-500 mb-4">
              Forum : {forums.find((f) => f.id === selectedForum)?.titre}
              {getStoredUser()?.role === "user" || !getStoredUser() ? (
                <span className="block text-amber-600 font-semibold mt-1">
                  Votre post sera soumis à l&apos;approbation de l&apos;expert du forum.
                </span>
              ) : (
                <span className="block text-emerald-600 font-semibold mt-1">
                  Tout membre connecté peut publier un sujet.
                </span>
              )}
            </p>
            <input
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Titre du sujet"
              className="w-full px-4 py-2 border rounded-lg mb-3"
            />
            <textarea
              value={contenu}
              onChange={(e) => setContenu(e.target.value)}
              placeholder="Votre message..."
              rows={5}
              className="w-full px-4 py-2 border rounded-lg mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 font-bold">
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 bg-emerald-700 text-white rounded-lg font-bold disabled:opacity-50"
              >
                {submitting ? "Envoi..." : "Publier"}
              </button>
            </div>
          </div>
        </div>
      )}

      {shareModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-gray-900">Partager ce post</h2>
              <button type="button" onClick={closeShareModal} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <div className="space-y-5">
              {/* Onglets type de partage */}
              <div className="grid gap-2 grid-cols-3">
                {[
                  { value: "internal", label: "Mon compte", icon: "👤" },
                  { value: "message", label: "Message privé", icon: "✉️" },
                  { value: "external", label: "Externe", icon: "🌐" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setShareType(option.value as "internal" | "message" | "external")}
                    className={`flex flex-col items-center gap-1 rounded-2xl border-2 px-3 py-3 text-xs font-bold transition-all ${
                      shareType === option.value
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-xl">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>

              {/* Sélecteur d'utilisateur si message privé */}
              {shareType === "message" && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Destinataire</label>
                  {!shareReceiverId ? (
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="text"
                          value={shareUserSearch}
                          onChange={async (e) => {
                            const val = e.target.value;
                            setShareUserSearch(val);
                            if (val.trim().length > 1) {
                              setSearchingUser(true);
                              try {
                                const res = await searchUsers(val);
                                setShareSearchResults(res);
                              } catch { /* ignore */ }
                              setSearchingUser(false);
                            } else {
                              setShareSearchResults([]);
                            }
                          }}
                          placeholder="Rechercher par nom..."
                          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                        />
                        {searchingUser && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 animate-spin" />
                        )}
                      </div>
                      {shareSearchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                          {shareSearchResults.map(u => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => {
                                setShareReceiverId(u.id);
                                setShareUserSearch(`${u.prenom} ${u.nom}`);
                                setShareSearchResults([]);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-50 last:border-0"
                            >
                              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold">
                                {u.prenom[0]}{u.nom[0]}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-800">{u.prenom} {u.nom}</p>
                                <p className="text-xs text-emerald-600 font-semibold">{u.role}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between px-4 py-2.5 border border-emerald-200 bg-emerald-50 rounded-xl">
                      <span className="text-sm font-bold text-emerald-900">{shareUserSearch}</span>
                      <button
                        type="button"
                        onClick={() => { setShareReceiverId(undefined); setShareUserSearch(""); }}
                        className="text-xs font-bold text-emerald-600 hover:underline"
                      >
                        Changer
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Message personnalisé */}
              {shareType !== "external" && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Message {shareType === "message" ? "(optionnel)" : ""}
                  </label>
                  <textarea
                    value={shareMessage}
                    onChange={(e) => setShareMessage(e.target.value)}
                    placeholder="Message personnalisé (optionnel)"
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
              )}

              {/* Boutons de partage externe */}
              {shareType === "external" && (
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-3">Partager via :</p>
                  <div className="grid grid-cols-2 gap-3">
                    {/* WhatsApp */}
                    <button
                      type="button"
                      onClick={async () => {
                        if (!sharePostId) return;
                        const link = `${window.location.origin}/forum/post/${sharePostId}`;
                        const text = encodeURIComponent(`Découvrez ce post sur Nio Far : ${link}`);
                        window.open(`https://wa.me/?text=${text}`, "_blank");
                        // Enregistrer le partage
                        try {
                          const result = await sharePost(sharePostId, { type: "external", confirmed: true });
                          setPosts(prev => prev.map(p => p.id === sharePostId ? { ...p, shares_count: result.shares_count } : p));
                        } catch { /* ignore */ }
                        setShareFeedback("Partagé sur WhatsApp ✓");
                        setTimeout(() => closeShareModal(), 1500);
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.119.554 4.107 1.523 5.83L0 24l6.292-1.49A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.001-1.369l-.359-.213-3.728.883.882-3.63-.234-.374A9.818 9.818 0 0 1 2.182 12c0-5.42 4.398-9.818 9.818-9.818 5.42 0 9.818 4.398 9.818 9.818 0 5.42-4.398 9.818-9.818 9.818z"/></svg>
                      WhatsApp
                    </button>

                    {/* LinkedIn */}
                    <button
                      type="button"
                      onClick={async () => {
                        if (!sharePostId) return;
                        const link = encodeURIComponent(`${window.location.origin}/forum/post/${sharePostId}`);
                        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${link}`, "_blank");
                        try {
                          const result = await sharePost(sharePostId, { type: "external", confirmed: true });
                          setPosts(prev => prev.map(p => p.id === sharePostId ? { ...p, shares_count: result.shares_count } : p));
                        } catch { /* ignore */ }
                        setShareFeedback("Partagé sur LinkedIn ✓");
                        setTimeout(() => closeShareModal(), 1500);
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-[#0A66C2] text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      LinkedIn
                    </button>

                    {/* Copier le lien */}
                    <button
                      type="button"
                      onClick={async () => {
                        if (!sharePostId) return;
                        const link = `${window.location.origin}/forum/post/${sharePostId}`;
                        try {
                          await navigator.clipboard.writeText(link);
                          const result = await sharePost(sharePostId, { type: "external", confirmed: true });
                          setPosts(prev => prev.map(p => p.id === sharePostId ? { ...p, shares_count: result.shares_count } : p));
                          setShareFeedback("Lien copié dans le presse-papiers ✓");
                          setTimeout(() => closeShareModal(), 1500);
                        } catch {
                          setShareFeedback("Impossible de copier le lien.");
                        }
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                      Copier le lien
                    </button>

                    {/* Web Share API */}
                    {typeof window !== "undefined" && navigator.share && (
                      <button
                        type="button"
                        onClick={async () => {
                          if (!sharePostId) return;
                          const link = `${window.location.origin}/forum/post/${sharePostId}`;
                          try {
                            await navigator.share({ title: "Post Nio Far", text: "Découvrez ce post :", url: link });
                            const result = await sharePost(sharePostId, { type: "external", confirmed: true });
                            setPosts(prev => prev.map(p => p.id === sharePostId ? { ...p, shares_count: result.shares_count } : p));
                            setShareFeedback("Partagé avec succès ✓");
                            setTimeout(() => closeShareModal(), 1500);
                          } catch { /* user cancelled */ }
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-700 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
                        Partager
                      </button>
                    )}
                  </div>
                </div>
              )}

              {shareFeedback && (
                <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                  shareFeedback.includes("✓")
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}>
                  {shareFeedback}
                </div>
              )}
            </div>

            {/* Actions footer — seulement pour les modes non-externe */}
            {shareType !== "external" && (
              <div className="flex gap-3 justify-end mt-5 pt-4 border-t border-gray-100">
                <button type="button" onClick={closeShareModal} className="px-4 py-2.5 text-gray-600 font-bold text-sm hover:bg-gray-50 rounded-xl transition-colors">
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleShareSubmit}
                  disabled={shareLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 text-white rounded-xl font-bold text-sm hover:bg-emerald-800 transition-colors disabled:opacity-50"
                >
                  {shareLoading ? (
                    <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
                  )}
                  {shareLoading ? "Envoi..." : shareType === "internal" ? "Enregistrer" : "Envoyer"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

