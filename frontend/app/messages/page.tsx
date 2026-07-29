"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Send, Inbox, ArrowLeft, MessageSquare, User2, Clock,
  CheckCheck, Check, Plus, Search, X, Loader2
} from "lucide-react";
import { isAuthenticated } from "@/lib/auth";
import {
  getMyMessages, getSentMessages, sendMessage, markMessageRead, markAllMessagesRead,
  type Message
} from "@/services/messaging";
import { searchUsers } from "@/services/users";
import AuthPrompt from "@/components/AuthPrompt";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  }).replace(",", " à");
}

type Conversation = {
  userId: number;
  nom: string;
  prenom: string;
  avatar_url?: string | null;
  messages: Message[];
  lastMessage: Message;
  unread: number;
};

function groupByConversation(inbox: Message[], sent: Message[], myId: number): Conversation[] {
  const convMap = new Map<number, Message[]>();

  for (const msg of [...inbox, ...sent]) {
    const otherId = msg.sender.id === myId ? msg.receiver.id : msg.sender.id;
    if (!convMap.has(otherId)) convMap.set(otherId, []);
    convMap.get(otherId)!.push(msg);
  }

  const conversations: Conversation[] = [];
  convMap.forEach((msgs, userId) => {
    const sorted = msgs.sort((a, b) => new Date(b.cree_le).getTime() - new Date(a.cree_le).getTime());
    const other = sorted[0].sender.id === myId ? sorted[0].receiver : sorted[0].sender;
    const unread = sorted.filter(m => m.receiver.id === myId && !m.lu).length;
    conversations.push({
      userId,
      nom: other.nom,
      prenom: other.prenom,
      avatar_url: other.avatar_url,
      messages: sorted.reverse(),
      lastMessage: sorted[0],
      unread,
    });
  });

  return conversations.sort((a, b) =>
    new Date(b.lastMessage.cree_le).getTime() - new Date(a.lastMessage.cree_le).getTime()
  );
}

export default function MessagesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [myId, setMyId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeUserId, setComposeUserId] = useState<number | null>(null);
  const [composeUserSearch, setComposeUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<{id: number, nom: string, prenom: string, role: string}[]>([]);
  const [searching, setSearching] = useState(false);
  const [composeText, setComposeText] = useState("");
  const [composeSending, setComposeSending] = useState(false);
  const [composeFeedback, setComposeFeedback] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      return; // Ne pas rediriger, afficher AuthPrompt
    }
    const stored = localStorage.getItem("user");
    if (stored) {
      try { setMyId(JSON.parse(stored).id); } catch { /* ignore */ }
    }
    loadMessages();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConv]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const stored = localStorage.getItem("user");
      let id = myId;
      if (!id && stored) {
        try { id = JSON.parse(stored).id; } catch { /* ignore */ }
      }
      const [inbox, sent] = await Promise.all([getMyMessages(), getSentMessages()]);
      if (id) {
        const convs = groupByConversation(inbox, sent, id);
        setConversations(convs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openConversation = async (conv: Conversation) => {
    setSelectedConv(conv);
    setReplyText("");
    // Marquer les non lus comme lus
    const unreadIds = conv.messages
      .filter(m => m.receiver.id === myId && !m.lu)
      .map(m => m.id);
    for (const id of unreadIds) {
      try { await markMessageRead(id); } catch { /* ignore */ }
    }
    // Mettre à jour localement
    setConversations(prev =>
      prev.map(c =>
        c.userId === conv.userId
          ? { ...c, unread: 0, messages: c.messages.map(m => ({ ...m, lu: true })) }
          : c
      )
    );
  };

  const handleSendReply = async () => {
    if (!selectedConv || !replyText.trim()) return;
    setReplySending(true);
    try {
      await sendMessage(selectedConv.userId, replyText.trim());
      setReplyText("");
      loadMessages();
    } catch (e) {
      console.error(e);
    } finally {
      setReplySending(false);
    }
  };

  const handleComposeSend = async () => {
    if (!composeUserId || !composeText.trim()) {
      setComposeFeedback("Veuillez sélectionner un destinataire et écrire un message.");
      return;
    }
    setComposeSending(true);
    setComposeFeedback("");
    try {
      await sendMessage(composeUserId, composeText.trim());
      setComposeFeedback("Message envoyé !");
      setComposeText("");
      setTimeout(() => {
        setComposeOpen(false);
        setComposeFeedback("");
        loadMessages();
      }, 1500);
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      setComposeFeedback(detail || "Impossible d'envoyer le message.");
    } finally {
      setComposeSending(false);
    }
  };


  const filteredConvs = conversations.filter(c =>
    `${c.prenom} ${c.nom}`.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  // Afficher AuthPrompt si non authentifié
  if (!isAuthenticated()) {
    return (
      <AuthPrompt
        title="Messagerie privée"
        message="Inscrivez-vous pour échanger en privé avec les membres de la communauté."
        feature="Envoyez et recevez des messages privés, contactez des experts et recruteurs."
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-gray-500 font-semibold">Chargement des messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl font-black text-gray-900">Messagerie</h1>
            {totalUnread > 0 && (
              <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {totalUnread} non lu{totalUnread > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <button
            onClick={() => { setComposeOpen(true); setComposeUserId(null); setComposeUserSearch(""); setSearchResults([]); setComposeText(""); setComposeFeedback(""); }}
            className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-800 transition-colors"
          >
            <Plus size={16} /> Nouveau message
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[70vh]">

          {/* Sidebar conversations */}
          <div className={`md:col-span-1 flex flex-col gap-3 ${selectedConv ? "hidden md:flex" : "flex"}`}>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher une conversation..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:border-emerald-400"
              />
            </div>

            {/* Liste conversations */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex-1">
              {filteredConvs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-emerald-400" />
                  </div>
                  <p className="font-bold text-gray-700 mb-1">Aucune conversation</p>
                  <p className="text-sm text-gray-400">Commencez en envoyant votre premier message</p>
                  <button
                    onClick={() => { setComposeOpen(true); setComposeUserId(null); setComposeUserSearch(""); setSearchResults([]); setComposeText(""); setComposeFeedback(""); }}
                    className="mt-4 text-sm text-emerald-600 font-bold hover:underline"
                  >
                    Écrire un message →
                  </button>
                </div>
              ) : (
                filteredConvs.map((conv) => (
                  <button
                    key={conv.userId}
                    onClick={() => openConversation(conv)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-3.5 border-b border-gray-100 last:border-b-0 transition-colors hover:bg-gray-50 ${
                      selectedConv?.userId === conv.userId ? "bg-emerald-50 hover:bg-emerald-50" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-black flex-shrink-0">
                      {conv.prenom[0]?.toUpperCase()}{conv.nom[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className={`text-sm truncate ${conv.unread > 0 ? "font-black text-gray-900" : "font-semibold text-gray-700"}`}>
                          {conv.prenom} {conv.nom}
                        </span>
                        <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(conv.lastMessage.cree_le)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs truncate ${conv.unread > 0 ? "text-gray-700 font-semibold" : "text-gray-400"}`}>
                          {conv.lastMessage.sender.id === myId ? "Vous : " : ""}{conv.lastMessage.contenu}
                        </p>
                        {conv.unread > 0 && (
                          <span className="bg-emerald-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Zone conversation */}
          <div className={`md:col-span-2 flex flex-col ${!selectedConv ? "hidden md:flex" : "flex"}`}>
            {selectedConv ? (
              <div className="bg-white rounded-2xl border border-gray-200 flex flex-col flex-1" style={{ minHeight: "60vh" }}>
                {/* Header conversation */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                  <button
                    onClick={() => setSelectedConv(null)}
                    className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft size={18} className="text-gray-600" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-black">
                    {selectedConv.prenom[0]?.toUpperCase()}{selectedConv.nom[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-black text-gray-900">{selectedConv.prenom} {selectedConv.nom}</p>
                    <p className="text-xs text-gray-400">{selectedConv.messages.length} message{selectedConv.messages.length > 1 ? "s" : ""}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3" style={{ maxHeight: "50vh" }}>
                  {selectedConv.messages.map((msg) => {
                    const isMe = msg.sender.id === myId;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] group`}>
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              isMe
                                ? "bg-emerald-700 text-white rounded-br-sm"
                                : "bg-gray-100 text-gray-800 rounded-bl-sm"
                            }`}
                          >
                            {msg.post_id && (
                              <a
                                href={`/forum/post/${msg.post_id}`}
                                className={`block text-xs mb-1 underline ${isMe ? "text-emerald-200" : "text-emerald-600"}`}
                              >
                                📎 Voir le post partagé
                              </a>
                            )}
                            {msg.contenu}
                          </div>
                          <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                            <span className="text-[10px] text-gray-400">{formatDate(msg.cree_le)}</span>
                            {isMe && (
                              msg.lu
                                ? <CheckCheck size={12} className="text-emerald-500" />
                                : <Check size={12} className="text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply box */}
                <div className="border-t border-gray-100 px-5 py-4">
                  <div className="flex items-end gap-3">
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder={`Répondre à ${selectedConv.prenom}...`}
                      rows={2}
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-emerald-400"
                      onKeyDown={e => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply();
                        }
                      }}
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={!replyText.trim() || replySending}
                      className="p-2.5 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-colors disabled:opacity-40"
                    >
                      {replySending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Entrée pour envoyer · Shift+Entrée pour saut de ligne</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 flex-1 flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                  <MessageSquare className="w-10 h-10 text-emerald-400" />
                </div>
                <h2 className="text-xl font-black text-gray-800 mb-2">Vos messages</h2>
                <p className="text-gray-400 text-sm max-w-xs">
                  Sélectionnez une conversation ou commencez-en une nouvelle
                </p>
                <button
                  onClick={() => { setComposeOpen(true); setComposeUserId(null); setComposeUserSearch(""); setSearchResults([]); setComposeText(""); setComposeFeedback(""); }}
                  className="mt-6 flex items-center gap-2 bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-800 transition-colors"
                >
                  <Plus size={16} /> Nouveau message
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Compose */}
      {composeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-black text-gray-900">Nouveau message</h2>
              <button
                onClick={() => { setComposeOpen(false); setComposeFeedback(""); }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Destinataire
                </label>
                {!composeUserId ? (
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        value={composeUserSearch}
                        onChange={async (e) => {
                          const val = e.target.value;
                          setComposeUserSearch(val);
                          if (val.trim().length > 1) {
                            setSearching(true);
                            try {
                              const res = await searchUsers(val);
                              setSearchResults(res);
                            } catch { /* ignore */ }
                            setSearching(false);
                          } else {
                            setSearchResults([]);
                          }
                        }}
                        placeholder="Rechercher par nom..."
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                        autoFocus
                      />
                      {searching && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 animate-spin" />
                      )}
                    </div>
                    {searchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {searchResults.map(u => (
                          <button
                            key={u.id}
                            onClick={() => {
                              setComposeUserId(u.id);
                              setComposeUserSearch(`${u.prenom} ${u.nom}`);
                              setSearchResults([]);
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
                    <span className="text-sm font-bold text-emerald-900">{composeUserSearch}</span>
                    <button
                      onClick={() => { setComposeUserId(null); setComposeUserSearch(""); }}
                      className="text-xs font-bold text-emerald-600 hover:underline"
                    >
                      Changer
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Message
                </label>
                <textarea
                  value={composeText}
                  onChange={e => setComposeText(e.target.value)}
                  placeholder="Écrivez votre message..."
                  rows={5}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              {composeFeedback && (
                <div className={`px-4 py-3 rounded-xl text-sm font-semibold ${
                  composeFeedback.includes("envoyé")
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {composeFeedback}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
              <button
                onClick={() => { setComposeOpen(false); setComposeFeedback(""); }}
                className="px-4 py-2.5 text-gray-600 font-bold text-sm hover:bg-gray-50 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleComposeSend}
                disabled={composeSending || !composeUserId || !composeText.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 text-white rounded-xl font-bold text-sm hover:bg-emerald-800 transition-colors disabled:opacity-50"
              >
                {composeSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {composeSending ? "Envoi..." : "Envoyer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
