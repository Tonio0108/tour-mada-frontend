import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Separator } from "@/components/ui/separator";
import {
  Send, 
  ChevronLeft, 
  Paperclip, 
  MessageCircle,
  Clock,
  CheckCheck,
  FileIcon,
  Download,
  X,
  Play,
  Search,
  MoreVertical,
  Maximize2,
  Plus,
  Trash2,
  EyeOff,
  MailOpen
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "../../lib/utils";
import { getAuthToken } from "../../lib/api";
import { useNotifications } from "../context/NotificationContext";
import { getFileUrl } from "../utils/imageUrl";

export default function ChatInterface({ user, isAdmin, fullScreen = false }) {
  const { t } = useTranslation();
  const { markChatNotificationsAsRead, socket, onlineUsers } = useNotifications();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const activeChatRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageSearchQuery, setMessageSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showNewConvDialog, setShowNewConvDialog] = useState(false);
  const [clients, setClients] = useState([]);
  const [confirmDeleteConv, setConfirmDeleteConv] = useState(null);
  const [confirmDeleteMsg, setConfirmDeleteMsg] = useState(null);
  const [convMenuOpen, setConvMenuOpen] = useState(null);

  const filteredMessages = messages.filter(m => 
    m.contenu?.toLowerCase().includes(messageSearchQuery.toLowerCase()) ||
    m.nomFichier?.toLowerCase().includes(messageSearchQuery.toLowerCase())
  );



  const fetchConversations = useCallback(async () => {
    if (!user) return;
    const token = await getAuthToken();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setConversations(await res.json());
    } catch (e) { console.error(e); }
  }, [user]);

  useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);

  // Rejoindre la room active après reconnexion socket
  useEffect(() => {
    if (!socket) return;
    const handleReconnect = () => {
      fetchConversations();
      if (activeChatRef.current) {
        socket.emit("join_conversation", activeChatRef.current.id_conversation);
      }
    };
    socket.on("connect", handleReconnect);
    return () => socket.off("connect", handleReconnect);
  }, [socket, fetchConversations]);

  // Charger les conversations dès le début
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (socket) {
      if (activeChatRef.current) {
        socket.emit("join_conversation", activeChatRef.current.id_conversation);
      }

      const handleNewMessage = (msg) => {
        if (activeChatRef.current && msg.id_conversation === activeChatRef.current.id_conversation) {
          setMessages((prev) => {
            const exists = prev.findIndex(m => 
              (m.id_message === msg.id_message) || 
              (m.status === 'sending' && (m.contenu === msg.contenu || m.fichierUrl === msg.fichierUrl))
            );
            if (exists !== -1) {
              const newMessages = [...prev];
              newMessages[exists] = { ...msg, status: 'sent' };
              return newMessages;
            }
            return [...prev, { ...msg, status: 'sent' }];
          });
        }
        fetchConversations();
      };

      // Écouter le signal de mise à jour globale
      socket.on("update_conversations", fetchConversations);
      socket.on("new_message", handleNewMessage);

      socket.on("message_deleted", ({ messageId, conversationId: convId }) => {
        if (activeChatRef.current && activeChatRef.current.id_conversation === convId) {
          setMessages((prev) => prev.filter(m => m.id_message !== messageId));
        }
      });

      socket.on("conversation_deleted", ({ conversationId: convId }) => {
        setConversations((prev) => prev.filter(c => c.id_conversation !== convId));
        if (activeChatRef.current?.id_conversation === convId) {
          setActiveChat(null);
          setMessages([]);
        }
      });

      socket.on("messages_read", ({ conversationId: convId }) => {
        if (activeChatRef.current && activeChatRef.current.id_conversation === convId) {
          setMessages((prev) => prev.map(m => ({
            ...m,
            est_lu: String(m.id_expediteur) === String(user?.id_utilisateur) ? true : m.est_lu,
          })));
        }
      });

      return () => {
        socket.off("update_conversations", fetchConversations);
        socket.off("new_message", handleNewMessage);
        socket.off("message_deleted");
        socket.off("conversation_deleted");
        socket.off("messages_read");
      };
    }
  }, [socket, fetchConversations]);

  useEffect(() => {
    if (scrollRef.current && !messageSearchQuery) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, messageSearchQuery]);

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

  const startConversation = async (participantId) => {
    const token = await getAuthToken();
    try {
      const convRes = await fetch(`${import.meta.env.VITE_API_URL}/chat/conversation/find-or-create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ participantId })
      });
      if (convRes.ok) {
        const conv = await convRes.json();
        fetchConversations();
        fetchMessages(conv);
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

  const markMessagesAsRead = (conversationId) => {
    if (socket?.connected) {
      socket.emit("mark_read", conversationId);
    }
    fetchConversations();
  };

  const handleMarkAsUnread = async (convId) => {
    const token = await getAuthToken();
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/chat/conversations/${convId}/unread`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) { console.error(e); }
  };

  const handleDeleteConversation = async (conv) => {
    const token = await getAuthToken();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/chat/conversations/${conv.id_conversation}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const { participantIds } = await res.json();
        setConversations((prev) => prev.filter(c => c.id_conversation !== conv.id_conversation));
        if (activeChat?.id_conversation === conv.id_conversation) {
          setActiveChat(null);
          setMessages([]);
        }
        socket?.emit('delete_conversation', { conversationId: conv.id_conversation, participantIds });
      }
    } catch (e) { console.error(e); }
    setConfirmDeleteConv(null);
  };

  const handleDeleteMessage = async (msg) => {
    const token = await getAuthToken();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/chat/messages/${msg.id_message}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMessages((prev) => prev.filter(m => m.id_message !== msg.id_message));
        socket?.emit('delete_message', { messageId: msg.id_message, conversationId: msg.id_conversation });
      }
    } catch (e) { console.error(e); }
    setConfirmDeleteMsg(null);
  };

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!message.trim() && !selectedFile) || !socket || !activeChat) return;

    const messageContent = message.trim();
    const fileToUpload = selectedFile;
    
    setMessage("");
    setSelectedFile(null);
    if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }

    if (fileToUpload) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', fileToUpload);
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
          if (fileToUpload.type.startsWith('image/')) type = 'IMAGE';
          else if (fileToUpload.type.startsWith('video/')) type = 'VIDEO';
          socket.emit("send_message", {
            conversationId: activeChat.id_conversation,
            type,
            fichierUrl: data.url,
            nomFichier: data.originalname,
            contenu: messageContent
          });
        }
      } catch (e) { console.error(e); } finally { setIsUploading(false); }
    } else {
      socket.emit("send_message", {
        conversationId: activeChat.id_conversation,
        contenu: messageContent,
        type: 'TEXT'
      });
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        setPreviewUrl(URL.createObjectURL(file));
      } else setPreviewUrl(null);
    }
  };

  const cancelFile = () => {
    setSelectedFile(null);
    if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleBack = () => { setActiveChat(null); setMessages([]); };
  
  const getPartner = (conv) => conv?.participants?.find(p => String(p.id_utilisateur) !== String(user?.id_utilisateur));

  const getPartnerInfo = (p) => {
    if (!p) return { name: t("chat.user_default") || "Utilisateur", email: "", id: null };
    const details = p.type_utilisateur === 'ADMIN' ? p.Administrateur : p.Clients;
    const name = details ? `${details.prenom} ${details.nom}` : p.email.split('@')[0];
    return { name, email: p.email, id: String(p.id_utilisateur) };
  };

  const getMessagePreview = (msg) => {
    if (!msg) return t("chat.no_messages") || "Pas de messages";
    if (msg.type === 'TEXT') return msg.contenu;
    const isMe = msg.id_expediteur === user?.id_utilisateur;
    return isMe ? t("chat.file_sent") : t("chat.file_received");
  };

  const filteredConversations = conversations.filter(c => {
    const partner = getPartnerInfo(getPartner(c));
    return partner.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           partner.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const highlightText = (text, highlight) => {
    if (!highlight || !highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === highlight.toLowerCase() ? 
        <span key={i} className="bg-yellow-200 text-black dark:bg-yellow-500/50 dark:text-white rounded-sm px-0.5 font-bold">{part}</span> : 
        part
    );
  };

  const renderMessageContent = (m) => {
    if (m.type === 'IMAGE') {
      return (
        <div className="space-y-2 relative group">
          <div className="relative overflow-hidden rounded-lg">
            <img src={getFileUrl(m.fichierUrl)} alt={m.nomFichier} loading="lazy"
              className="max-w-full max-h-80 object-cover cursor-pointer hover:opacity-90 transition-opacity border border-border"
              onClick={() => setSelectedMedia(m)}
            />
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full" asChild>
                <a href={getFileUrl(m.fichierUrl)} download onClick={(e) => e.stopPropagation()}>
                  <Download className="w-4 h-4" />
                </a>
              </Button>
              <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full" onClick={() => setSelectedMedia(m)}>
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {m.contenu && <p className="text-sm mt-1.5 leading-relaxed">{highlightText(m.contenu, messageSearchQuery)}</p>}
        </div>
      );
    }
    if (m.type === 'VIDEO') {
      return (
        <div className="space-y-2 relative group">
          <div className="relative cursor-pointer w-full rounded-lg overflow-hidden" onClick={() => setSelectedMedia(m)}>
            <video src={getFileUrl(m.fichierUrl)} preload="metadata" className="w-full max-h-[250px] object-cover bg-black border border-border" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors">
                <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                  <Play className="w-6 h-6 text-white fill-current" />
                </div>
            </div>
          </div>
          {m.contenu && <p className="text-sm mt-1.5 leading-relaxed">{highlightText(m.contenu, messageSearchQuery)}</p>}
        </div>
      );
    }
    if (m.type === 'FILE') {
      return (
        <div className="space-y-2">
          <a href={getFileUrl(m.fichierUrl)} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg hover:bg-muted/60 transition-colors border border-border"
          >
            <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <FileIcon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold truncate max-w-[150px]">{highlightText(m.nomFichier, messageSearchQuery)}</span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Document</span>
            </div>
            <Download className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-auto" />
          </a>
          {m.contenu && <p className="text-sm mt-1.5">{highlightText(m.contenu, messageSearchQuery)}</p>}
        </div>
      );
    }
    return <p className="text-sm leading-relaxed whitespace-pre-wrap">{highlightText(m.contenu, messageSearchQuery)}</p>;
  };

  return (
    <div className={cn(
      "flex h-full w-full overflow-hidden bg-white",
      fullScreen ? "border-0" : "border border-border rounded-xl shadow-sm"
    )}>
      {/* Sidebar */}
      <div className={cn(
        "flex flex-col border-r border-border transition-all duration-300 relative",
        activeChat ? "hidden md:flex md:w-[300px]" : "w-full md:w-[300px]"
      )}>
        <div className="p-4 border-b border-border space-y-4">
          <div className="flex items-center gap-2">
            <Button size="sm" className="h-9 gap-1.5 rounded-full text-xs font-semibold shadow-sm"
              onClick={async () => {
                if (!isAdmin) {
                  const token = await getAuthToken();
                  try {
                    const adminRes = await fetch(`${import.meta.env.VITE_API_URL}/chat/admin`, {
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    if (adminRes.ok) {
                      const admin = await adminRes.json();
                      if (admin) startConversation(admin.id_utilisateur);
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
          </div>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("chat.search_placeholder") || "Filtrer..."}
              className="pl-9 bg-muted/40 border-none rounded-full h-9 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredConversations.map((c) => {
            const partner = getPartnerInfo(getPartner(c));
            const isPartnerOnline = !!onlineUsers[partner.id];
            const lastMessage = c.messages[0];
            const isUnread = lastMessage && !lastMessage.est_lu && lastMessage.id_expediteur !== user?.id_utilisateur;
            const isActive = activeChat?.id_conversation === c.id_conversation;
            
            return (
              <div 
                key={c.id_conversation}
                className={cn(
                  "flex items-center gap-3 p-3.5 cursor-pointer transition-all border-b border-border/50 relative group",
                  isActive ? "bg-primary/5 after:absolute after:right-0 after:top-2 after:bottom-2 after:w-1 after:bg-primary after:rounded-l-full" : "hover:bg-accent/30",
                  isUnread && "bg-primary/5"
                )}
              >
                <div className="flex-1 flex items-center gap-3 min-w-0" onClick={() => fetchMessages(c)}>
                  <div className="relative shrink-0">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                      isActive ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                    )}>
                      {partner.name[0]}
                    </div>
                    {isPartnerOnline && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white shadow-sm" />
                    )}
                    {isUnread && (
                      <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className={cn("text-sm font-semibold truncate", isActive ? "text-primary" : "text-foreground")}>{partner.name}</span>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {lastMessage ? new Date(lastMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""}
                      </span>
                    </div>
                    <p className={cn("text-xs truncate", isUnread ? "text-foreground font-medium" : "text-muted-foreground")}>
                      {getMessagePreview(lastMessage)}
                    </p>
                  </div>
                </div>
                <DropdownMenu open={convMenuOpen === c.id_conversation} onOpenChange={(open) => setConvMenuOpen(open ? c.id_conversation : null)}>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onClick={() => { handleMarkAsUnread(c.id_conversation); setConvMenuOpen(null); }}>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Marquer non lu
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setConfirmDeleteConv(c); setConvMenuOpen(null); }} className="text-destructive focus:text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer la discussion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Area */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 relative bg-background",
        !activeChat && "hidden md:flex items-center justify-center"
      )}>
        {activeChat ? (
          <>
            <div className="h-16 border-b border-border flex items-center justify-between px-4 bg-background shrink-0 z-10">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Button variant="ghost" size="icon" onClick={handleBack} className="md:hidden h-8 w-8 rounded-full">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                {showSearch ? (
                  <div className="flex-1 flex items-center gap-2 animate-in slide-in-from-right-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input 
                      autoFocus
                      placeholder={t("chat.search_messages") || "Rechercher dans la discussion..."}
                      className="h-9 border-none bg-muted/20 rounded-full text-sm"
                      value={messageSearchQuery}
                      onChange={(e) => setMessageSearchQuery(e.target.value)}
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => { setShowSearch(false); setMessageSearchQuery(""); }}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                      {getPartnerInfo(getPartner(activeChat)).name[0]}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold truncate leading-none mb-1">{getPartnerInfo(getPartner(activeChat)).name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={cn("h-1.5 w-1.5 rounded-full", onlineUsers[getPartnerInfo(getPartner(activeChat)).id] ? "bg-green-500" : "bg-gray-400")} />
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {onlineUsers[getPartnerInfo(getPartner(activeChat)).id] ? t("chat.online") || "En ligne" : t("chat.offline") || "Hors ligne"}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
              {!showSearch && (
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setShowSearch(true)}>
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              )}
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 bg-white custom-scrollbar">
              {filteredMessages.map((m, index) => {
                const isMe = String(m.id_expediteur) === String(user?.id_utilisateur);
                const showDate = index === 0 || new Date(filteredMessages[index-1].createdAt).toDateString() !== new Date(m.createdAt).toDateString();

                return (
                  <React.Fragment key={m.id_message}>
                    {showDate && (
                      <div className="flex justify-center my-6 relative">
                        <Separator className="absolute top-1/2 -translate-y-1/2 bg-border/50 w-full z-0" />
                        <span className="relative z-10 px-3 py-0.5 bg-background text-[10px] font-semibold text-muted-foreground border border-border/50 rounded-full">
                          {new Date(m.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    )}
                    <div className={cn("flex w-full group/message animate-in fade-in slide-in-from-bottom-1 duration-300", isMe ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "flex flex-col gap-1 max-w-[85%] md:max-w-[70%]",
                        isMe ? "items-end" : "items-start"
                      )}>
                        <div className={cn(
                          "px-3.5 py-2 text-sm shadow-sm transition-all font-medium tracking-tight relative",
                          isMe 
                            ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm" 
                            : "bg-white text-foreground rounded-2xl rounded-tl-sm border border-border"
                        )}>
                          {isMe && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background border border-border shadow-sm opacity-0 group-hover/message:opacity-100 transition-opacity">
                                  <MoreVertical className="h-3 w-3 text-muted-foreground" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => setConfirmDeleteMsg(m)} className="text-destructive focus:text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                          {renderMessageContent(m)}
                        </div>
                        <div className="flex items-center gap-1.5 px-1 opacity-50">
                          <span className="text-[9px] font-medium">
                            {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                          {isMe && (
                            m.status === 'sending' 
                              ? <Clock className="h-2.5 w-2.5 animate-pulse" /> 
                              : <CheckCheck className={cn("h-2.5 w-2.5", m.est_lu && "text-blue-500")} />
                          )}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            <div className="p-4 border-t border-border bg-background shrink-0 relative">
              {selectedFile && (
                <div className="absolute left-4 right-4 bottom-[calc(100%+1rem)] p-3 bg-card border border-border shadow-lg rounded-xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg border border-border shrink-0 flex items-center justify-center bg-muted">
                      {previewUrl ? (
                        <img src={previewUrl} className="h-full w-full object-cover rounded-lg" />
                      ) : (
                        <FileIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold truncate">{selectedFile.name}</span>
                      <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {t("chat.file_ready") || "Prêt"}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 hover:bg-destructive/10 rounded-full text-destructive" onClick={cancelFile}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <form className="flex items-end gap-2 max-w-4xl mx-auto" onSubmit={handleSendMessage}>
                <div className="flex-1 flex items-end bg-background border border-input rounded-xl focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 transition-all relative group">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="shrink-0 h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary transition-colors mb-0.5"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Paperclip className={cn("h-4 w-4", isUploading && "animate-spin")} />
                  </Button>
                  <input type="file" ref={fileInputRef} className="hidden" onChange={onFileChange} />
                  
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder={t("chat.placeholder") || "Votre message..."}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 px-1 resize-none max-h-32 min-h-[44px] custom-scrollbar placeholder:text-muted-foreground/50"
                    rows={1}
                    ref={(el) => {
                      if (el) {
                        el.style.height = 'auto';
                        el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
                      }
                    }}
                    disabled={isUploading}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  size="icon" 
                  className="h-10 w-10 shrink-0 rounded-full shadow-md" 
                  disabled={(!message.trim() && !selectedFile) || isUploading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-6 text-center px-10">
            <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center">
              <MessageCircle className="h-10 w-10 text-primary/20" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight">{t("chat.secure_messaging") || "Messagerie Sécurisée"}</h3>
              <p className="text-xs text-muted-foreground max-w-[240px] mx-auto leading-relaxed font-medium">
                {t("chat.select_conversation") || "Sélectionnez une conversation pour commencer à échanger avec notre équipe."}
              </p>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 0px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: hsl(var(--primary)); }
      `}} />

      <Dialog open={!!confirmDeleteConv} onOpenChange={() => setConfirmDeleteConv(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Supprimer la discussion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Êtes-vous sûr de vouloir supprimer cette discussion ? Cette action est irréversible.
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setConfirmDeleteConv(null)}>Annuler</Button>
            <Button variant="destructive" size="sm" onClick={() => handleDeleteConversation(confirmDeleteConv)}>Supprimer</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDeleteMsg} onOpenChange={() => setConfirmDeleteMsg(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Supprimer le message</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Êtes-vous sûr de vouloir supprimer ce message ? Cette action est irréversible.
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setConfirmDeleteMsg(null)}>Annuler</Button>
            <Button variant="destructive" size="sm" onClick={() => handleDeleteMessage(confirmDeleteMsg)}>Supprimer</Button>
          </div>
        </DialogContent>
      </Dialog>

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
                  onClick={() => {
                    startConversation(client.utilisateur.id_utilisateur);
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

      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95 border-none">
          <div className="relative w-full h-full flex items-center justify-center p-4 min-h-[50vh]">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 text-white hover:bg-white/10 rounded-full z-50"
              onClick={() => setSelectedMedia(null)}
            >
              <X className="w-5 h-5" />
            </Button>
            {selectedMedia?.type === 'IMAGE' && (
              <img 
                src={getFileUrl(selectedMedia.fichierUrl)} 
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300" 
                alt={selectedMedia.nomFichier}
              />
            )}
            {selectedMedia?.type === 'VIDEO' && (
              <video 
                src={getFileUrl(selectedMedia.fichierUrl)} 
                controls 
                autoPlay 
                className="max-w-full max-h-[85vh] rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
              />
            )}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
               <span className="text-xs text-white font-medium truncate max-w-[200px]">{selectedMedia?.nomFichier}</span>
               <Separator orientation="vertical" className="h-4 bg-white/20" />
               <a 
                href={getFileUrl(selectedMedia?.fichierUrl)} 
                download 
                className="text-white/80 hover:text-white transition-colors"
                onClick={(e) => e.stopPropagation()}
               >
                 <Download className="w-4 h-4" />
               </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
