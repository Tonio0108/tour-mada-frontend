import React, { useState, useEffect, useRef } from 'react';
import { 
  Sheet, 
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Search, 
  ChevronLeft, 
  Send, 
  Paperclip, 
  X,
  MessageCircle,
  FileIcon,
  CheckCheck,
  Plus
} from "lucide-react";
import { getAuthToken } from "../lib/api";
import { cn } from "../lib/utils";
import { useTranslation } from "react-i18next";
import { useNotifications } from "../src/context/NotificationContext";
import { getFileUrl } from "../src/utils/imageUrl";

export function ChatSidebar({ open, onOpenChange, user, isAdmin }) {
  const { t } = useTranslation();
  const { markChatNotificationsAsRead, socket } = useNotifications();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messageSearchQuery, setMessageSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showNewConvDialog, setShowNewConvDialog] = useState(false);
  const [clients, setClients] = useState([]);
  
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const activeChatRef = useRef(null);

  useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);

  const filteredMessages = messages.filter(m => 
    m.contenu?.toLowerCase().includes(messageSearchQuery.toLowerCase()) ||
    m.nomFichier?.toLowerCase().includes(messageSearchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!open || !socket || !user) return;
    fetchConversations();

    const handleNewMessage = (msg) => {
      if (activeChatRef.current && msg.id_conversation === activeChatRef.current.id_conversation) {
        setMessages(prev => [...prev, msg]);
        markMessagesAsRead(msg.id_conversation);
      }
      fetchConversations();
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [open, socket, user]);

  useEffect(() => {
    if (scrollRef.current && !messageSearchQuery) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeChat, messageSearchQuery]);

  const fetchConversations = async () => {
    const token = await getAuthToken();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setConversations(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchMessages = async (conv) => {
    const token = await getAuthToken();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/chat/messages/${conv.id_conversation}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMessages(await res.json());
        setActiveChat(conv);
        socket?.emit("join_conversation", conv.id_conversation);
        markMessagesAsRead(conv.id_conversation);
        markChatNotificationsAsRead();
      }
    } catch (e) { console.error(e); }
  };

  const fetchClients = async () => {
    const token = await getAuthToken();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/client/with-reservations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setClients(await res.json());
    } catch (e) { console.error(e); }
  };

  const markMessagesAsRead = async (conversationId) => {
    const token = await getAuthToken();
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/chat/messages/${conversationId}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) { console.error(e); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!message.trim() && !selectedFile) || !socket?.connected || !activeChat) return;

    const content = message.trim();
    const file = selectedFile;
    setMessage("");
    setSelectedFile(null);

    if (file) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const token = await getAuthToken();
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/chat/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          let type = 'FILE';
          if (file.type.startsWith('image/')) type = 'IMAGE';
          else if (file.type.startsWith('video/')) type = 'VIDEO';
          socket.emit("send_message", {
            conversationId: activeChat.id_conversation,
            type,
            fichierUrl: data.url,
            nomFichier: data.originalname,
            contenu: content
          });
        }
      } catch (e) { console.error(e); } finally { setIsUploading(false); }
    } else {
      socket.emit("send_message", {
        conversationId: activeChat.id_conversation,
        contenu: content,
        type: 'TEXT'
      });
    }
  };

  const getPartnerInfo = (conv) => {
    const p = conv?.participants?.find(p => p.id_utilisateur !== user?.id_utilisateur);
    if (!p) return { name: t("chat.user_default") || "Utilisateur", email: "" };
    const details = p.type_utilisateur === 'ADMIN' ? p.Administrateur : p.Clients;
    return { 
      name: details ? `${details.prenom} ${details.nom}` : p.email.split('@')[0],
      email: p.email 
    };
  };

  const highlightText = (text, highlight) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === highlight.toLowerCase() ? 
        <span key={i} className="bg-yellow-200 text-black dark:bg-yellow-500/50 dark:text-white rounded-sm px-0.5 font-bold">{part}</span> : 
        part
    );
  };

  const filteredConversations = conversations.filter(c => {
    const info = getPartnerInfo(c);
    return info.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           info.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[400px] p-0 flex flex-col gap-0 border-l shadow-2xl bg-background">
        {!activeChat ? (
          <>
            <SheetHeader className="p-4 border-b shrink-0 bg-card/50">
              <SheetTitle className="flex items-center gap-2 text-lg font-bold">
                <MessageCircle className="w-5 h-5 text-primary" />
                {t("chat.title") || "Messages"}
              </SheetTitle>
              <Button size="sm" className="w-full mt-3 gap-1.5 rounded-full text-xs font-semibold shadow-sm"
                onClick={async () => {
                  if (!isAdmin) {
                    const token = await getAuthToken();
                    try {
                      const adminRes = await fetch(`${import.meta.env.VITE_API_URL}/chat/admin`, {
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      if (adminRes.ok) {
                        const admin = await adminRes.json();
                        if (admin) {
                          const convRes = await fetch(`${import.meta.env.VITE_API_URL}/chat/conversation/find-or-create`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ participantId: admin.id_utilisateur })
                          });
                          if (convRes.ok) {
                            const conv = await convRes.json();
                            fetchMessages(conv);
                          }
                        }
                      }
                    } catch (e) { console.error(e); }
                  } else {
                    fetchClients();
                    setShowNewConvDialog(true);
                  }
                }}
              >
                <Plus className="w-4 h-4" />
                {t("chat.new_discussion") || "Nouvelle discussion"}
              </Button>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder={t("chat.search_discussion") || "Rechercher une discussion..."}
                  className="pl-9 h-10 bg-background border-none rounded-full shadow-inner"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto bg-background">
              <div className="flex flex-col">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((c) => {
                    const info = getPartnerInfo(c);
                    const lastMsg = c.messages[0];
                    const unread = lastMsg && !lastMsg.est_lu && lastMsg.id_expediteur !== user?.id_utilisateur;
                    
                    return (
                      <button
                        key={c.id_conversation}
                        onClick={() => fetchMessages(c)}
                        className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-all text-left border-b border-border/40 relative group"
                      >
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 group-hover:scale-105 transition-transform">
                            {info.name[0]}
                          </div>
                          {unread && <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-primary rounded-full border-2 border-background shadow-sm" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-0.5">
                            <span className={cn("text-sm font-bold truncate", unread ? "text-primary" : "text-foreground")}>{info.name}</span>
                            <span className="text-[10px] text-muted-foreground font-medium">
                              {lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""}
                            </span>
                          </div>
                          <p className={cn("text-xs truncate leading-relaxed", unread ? "text-foreground font-semibold" : "text-muted-foreground")}>
                            {lastMsg ? (lastMsg.type === 'TEXT' ? lastMsg.contenu : t("chat.file_sent")) : t("chat.no_messages")}
                          </p>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-12 text-center opacity-40">
                    <Search className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-xs font-bold uppercase tracking-widest">{t("chat.no_results") || "Aucun résultat"}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="p-3 border-b flex items-center justify-between bg-card/50 sticky top-0 z-10 shrink-0">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Button variant="ghost" size="icon" onClick={() => { setActiveChat(null); setShowSearch(false); setMessageSearchQuery(""); }} className="rounded-full h-8 w-8 hover:bg-background shrink-0">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                {showSearch ? (
                  <div className="flex-1 flex items-center gap-2 animate-in slide-in-from-right-2">
                    <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                    <Input 
                      autoFocus
                      placeholder={t("chat.search_placeholder") || "Rechercher..."}
                      className="h-8 border-none bg-background/50 rounded-full text-xs flex-1"
                      value={messageSearchQuery}
                      onChange={(e) => setMessageSearchQuery(e.target.value)}
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full shrink-0" onClick={() => { setShowSearch(false); setMessageSearchQuery(""); }}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold border border-primary/20 shrink-0">
                      {getPartnerInfo(activeChat).name[0]}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold truncate leading-none mb-1">{getPartnerInfo(activeChat).name}</span>
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] text-muted-foreground font-medium">{t("chat.active_session") || "Session Active"}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
              {!showSearch && (
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full ml-2" onClick={() => setShowSearch(true)}>
                  <Search className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
            </div>
            
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 bg-background scroll-smooth">
              <div className="flex flex-col gap-4">
                {filteredMessages.map((m, i) => {
                  const isMe = m.id_expediteur === user?.id_utilisateur;
                  return (
                    <div key={m.id_message} className={cn("flex flex-col max-w-[85%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}>
                      <div className={cn(
                        "px-3 py-2 text-sm shadow-sm",
                        isMe ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm" : "bg-muted rounded-2xl rounded-tl-sm"
                      )}>
                        {m.type === 'IMAGE' ? (
                          <img src={getFileUrl(m.fichierUrl)} className="rounded-lg max-w-full" alt="" />
                        ) : m.type === 'FILE' ? (
                          <a href={getFileUrl(m.fichierUrl)} target="_blank" className="flex items-center gap-2 underline">
                            <FileIcon className="w-4 h-4" /> {highlightText(m.nomFichier, messageSearchQuery)}
                          </a>
                        ) : (
                          <p className="whitespace-pre-wrap leading-relaxed">{highlightText(m.contenu, messageSearchQuery)}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1 px-1 opacity-50">
                        <span className="text-[9px] font-medium">
                          {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        {isMe && (m.est_lu ? <CheckCheck className="w-3 h-3 text-blue-500" /> : <CheckCheck className="w-3 h-3" />)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3 border-t bg-card/30 shrink-0">
              {selectedFile && (
                <div className="mb-2 p-2 bg-muted rounded-lg flex items-center justify-between text-xs">
                  <span className="truncate flex-1">{selectedFile.name}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedFile(null)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
              <form className="flex items-center gap-2" onSubmit={handleSendMessage}>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full h-10 w-10 shrink-0 hover:bg-background"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setSelectedFile(e.target.files[0])} />
                <Input 
                  placeholder={t("chat.placeholder") || "Écrivez un message..."}
                  className="flex-1 h-10 rounded-full bg-background border-none shadow-inner"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="rounded-full h-10 w-10 shrink-0 shadow-md" 
                  disabled={!message.trim() && !selectedFile}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        )}
        <Dialog open={showNewConvDialog} onOpenChange={(open) => { setShowNewConvDialog(open); if (!open) setClients([]); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("chat.select_client") || "Sélectionner un client"}</DialogTitle>
            </DialogHeader>
            <div className="max-h-80 overflow-y-auto space-y-1 -mx-6 -mb-6 px-6 pb-6 pt-2">
              {clients.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {t("chat.no_clients") || "Aucun client disponible"}
                </div>
              ) : (
                clients.map((client) => (
                  <button
                    key={client.id_client}
                    onClick={async () => {
                      const token = await getAuthToken();
                      try {
                        const convRes = await fetch(`${import.meta.env.VITE_API_URL}/chat/conversation/find-or-create`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                          body: JSON.stringify({ participantId: client.utilisateur.id_utilisateur })
                        });
                        if (convRes.ok) {
                          const conv = await convRes.json();
                          fetchMessages(conv);
                        }
                      } catch (e) { console.error(e); }
                      setShowNewConvDialog(false);
                      setClients([]);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                      {client.prenom[0]}{client.nom[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{client.prenom} {client.nom}</div>
                      <div className="text-xs text-muted-foreground truncate">{client.utilisateur.email}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
}

export default ChatSidebar;
