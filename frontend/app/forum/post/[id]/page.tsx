"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart, Share2, Send, Search, Loader2 } from "lucide-react";
import { getPost, toggleLike, sharePost, addComment, type Post } from "@/services/forums";
import { searchUsers } from "@/services/users";
import { isAuthenticated } from "@/lib/auth";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = Number(params.id);
  const [post, setPost] = useState<Post | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareType, setShareType] = useState<"internal" | "message" | "external">("internal");
  const [shareReceiverId, setShareReceiverId] = useState<number | undefined>(undefined);
  const [shareUserSearch, setShareUserSearch] = useState("");
  const [shareSearchResults, setShareSearchResults] = useState<{id: number, nom: string, prenom: string, role: string}[]>([]);
  const [searchingUser, setSearchingUser] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [shareLoading, setShareLoading] = useState(false);
  const [shareFeedback, setShareFeedback] = useState("");

  const load = useCallback(
    () => getPost(postId).then(setPost).catch(() => router.push("/forum")),
    [postId, router]
  );

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const handleComment = async () => {
    if (!isAuthenticated()) { router.push("/connexion"); return; }
    if (!comment.trim()) return;
    await addComment(postId, comment);
    setComment("");
    load();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (!post) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-6">
        <Link href="/forum" className="inline-flex items-center gap-2 text-emerald-700 font-bold mb-6 hover:underline">
          <ArrowLeft size={18} />
          Retour au forum
        </Link>

        <article className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
          <p className="text-sm text-emerald-600 font-bold mb-2">{post.forum_titre}</p>
          <h1 className="text-2xl font-black text-gray-900 mb-4">{post.titre}</h1>
          <p className="text-sm text-gray-500 mb-6">
            Par {post.auteur.prenom} {post.auteur.nom} · {new Date(post.cree_le).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(",", " à")}
          </p>
          <div className="prose text-gray-700 whitespace-pre-wrap">{post.contenu}</div>

          <div className="flex items-center gap-4 mt-8 pt-6 border-t">
            <button
              onClick={async () => {
                if (!isAuthenticated()) { router.push("/connexion"); return; }
                const r = await toggleLike(postId);
                setPost({ ...post, liked_by_me: r.liked, likes_count: r.likes_count });
              }}
              className={`flex items-center gap-2 font-bold ${post.liked_by_me ? "text-red-500" : "text-gray-500"}`}
            >
              <Heart size={18} fill={post.liked_by_me ? "currentColor" : "none"} />
              {post.likes_count}
            </button>
            <button
              onClick={() => {
                setShareType("internal");
                setShareReceiverId(undefined);
                setShareUserSearch("");
                setShareSearchResults([]);
                setShareMessage("");
                setShareFeedback("");
                setShareModalVisible(true);
              }}
              className="flex items-center gap-2 font-bold text-gray-500"
            >
              <Share2 size={18} />
              {post.shares_count}
            </button>
          </div>
        </article>

        {shareModalVisible && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
              <h2 className="text-lg font-black mb-4">Partager ce post</h2>
              <div className="space-y-4 mb-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { value: "internal", label: "Vers mon compte" },
                    { value: "message", label: "Envoyer à un utilisateur" },
                    { value: "external", label: "Partager ailleurs" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setShareType(option.value as "internal" | "message" | "external")}
                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                        shareType === option.value
                          ? "border-emerald-700 bg-emerald-50 text-emerald-900"
                          : "border-gray-200 bg-white text-gray-700 hover:border-emerald-200"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

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
                            className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
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
                      <div className="flex items-center justify-between px-4 py-2 border border-emerald-200 bg-emerald-50 rounded-xl">
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

                <textarea
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  placeholder="Message personnalisé (optionnel)"
                  rows={4}
                  className="w-full px-4 py-2 border rounded-xl"
                />

                {shareFeedback && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    {shareFeedback}
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShareModalVisible(false);
                    setShareReceiverId(undefined);
                    setShareUserSearch("");
                    setShareSearchResults([]);
                    setShareMessage("");
                    setShareFeedback("");
                  }}
                  className="px-4 py-2 text-gray-600 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!post) return;
                    if (!isAuthenticated()) { router.push("/connexion"); return; }
                    if (shareType === "message" && !shareReceiverId) {
                      setShareFeedback("Veuillez sélectionner un destinataire.");
                      return;
                    }

                    setShareLoading(true);
                    setShareFeedback("");

                    try {
                      const result = await sharePost(postId, {
                        type: shareType,
                        receiver_id: shareType === "message" ? shareReceiverId : undefined,
                        message: shareMessage.trim() || undefined,
                      });

                      setPost({ ...post, shares_count: result.shares_count });

                      if (shareType === "external") {
                        const link = `${window.location.origin}/forum/post/${postId}`;
                        if (navigator.share) {
                          try {
                            await navigator.share({
                              title: "Partager un post",
                              text: shareMessage || "Découvrez ce post sur le forum.",
                              url: link,
                            });
                          } catch {
                            await navigator.clipboard.writeText(link);
                            setShareFeedback("Lien copié dans le presse-papiers.");
                          }
                        } else {
                          await navigator.clipboard.writeText(link);
                          setShareFeedback("Lien copié dans le presse-papiers.");
                        }
                      } else if (shareType === "message") {
                        setShareFeedback("Message envoyé à l'utilisateur.");
                      } else {
                        setShareFeedback("Partage enregistré sur votre compte.");
                      }

                      setShareModalVisible(false);
                    } catch {
                      setShareFeedback("Impossible de partager le post. Vérifiez les informations et réessayez.");
                    } finally {
                      setShareLoading(false);
                    }
                  }}
                  disabled={shareLoading}
                  className="px-6 py-2 bg-emerald-700 text-white rounded-lg font-bold disabled:opacity-50"
                >
                  {shareLoading ? "Partage..." : "Partager"}
                </button>
              </div>
            </div>
          </div>
        )}

        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-black text-gray-900 mb-4">
            Commentaires ({post.commentaires.length})
          </h2>

          <div className="space-y-4 mb-6">
            {post.commentaires.map((c) => (
              <div key={c.id} className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-bold text-gray-900">
                  {c.auteur.prenom} {c.auteur.nom}
                  <span className="text-gray-400 text-xs font-normal ml-2">
                    {new Date(c.cree_le).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(",", " à")}
                  </span>
                </p>
                <p className="text-gray-700 mt-1">{c.contenu}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ajouter un commentaire..."
              className="flex-1 px-4 py-2 border rounded-xl"
              onKeyDown={(e) => e.key === "Enter" && handleComment()}
            />
            <button
              onClick={handleComment}
              className="px-4 py-2 bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2"
            >
              <Send size={16} />
              Envoyer
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
