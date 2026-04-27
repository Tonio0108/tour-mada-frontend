import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { 
  Send, 
  User, 
  Search, 
  ChevronLeft, 
  MoreVertical, 
  Paperclip, 
  Smile,
  MessageCircle,
  Clock,
  CheckCheck
} from "lucide-react";
import { cn } from "../lib/utils";

export default function ChatSidebar({ open, onOpenChange, user, isAdmin }) {
  const { t } = useTranslation();
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState("");

  // Mock data
  const contacts = isAdmin ? [
    { id: 1, name: "Jean Dupont", lastMsg: "Quels sont les documents ?", time: "10:30", unread: 2, online: true },
    { id: 2, name: "Marie Curie", lastMsg: "Paiement envoyé !", time: "Hier", unread: 0, online: false },
    { id: 3, name: "Lucas Bernard", lastMsg: "Merci pour le tour !", time: "25 Avr", unread: 0, online: false },
  ] : [
    { id: 1, name: "Support TOUR MADA", lastMsg: "Comment puis-je vous aider ?", time: "10:30", unread: 1, online: true },
  ];

  const handleBack = () => setActiveChat(null);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-md p-0 flex flex-col gap-0 border-l shadow-2xl transition-all duration-300"
      >
        {/* Header Dynamique */}
        <SheetHeader className={cn(
          "p-4 border-b flex-row items-center gap-3 space-y-0 shrink-0",
          activeChat ? "bg-background" : "bg-primary/5"
        )}>
          {!activeChat ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <SheetTitle className="text-lg font-bold leading-none">
                  {t("chat.discussion_center")}
                </SheetTitle>
                <SheetDescription className="text-[11px] mt-1 font-medium text-primary/70 uppercase tracking-wider">
                  {isAdmin ? "Espace Administration" : "Assistance Voyage"}
                </SheetDescription>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 w-full">
              <Button variant="ghost" size="icon" onClick={handleBack} className="h-9 w-9 rounded-full hover:bg-muted">
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <div className="flex-1 flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-background">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm truncate leading-none">
                    {contacts.find(c => c.id === activeChat)?.name}
                  </h3>
                  <p className="text-[10px] text-green-600 font-semibold mt-1">En ligne</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          )}
        </SheetHeader>

        {!activeChat ? (
          /* Liste des contacts - Style Hub */
          <div className="flex-1 flex flex-col overflow-hidden bg-background">
            <div className="p-4 bg-muted/30">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input 
                  className="pl-9 h-11 bg-background border-none shadow-sm ring-1 ring-border focus-visible:ring-2 focus-visible:ring-primary rounded-xl" 
                  placeholder="Rechercher une conversation..." 
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="px-2 py-2">
                {contacts.map((c) => (
                  <div 
                    key={c.id}
                    onClick={() => setActiveChat(c.id)}
                    className="group p-3 flex gap-3 cursor-pointer transition-all hover:bg-primary/5 rounded-2xl mb-1 active:scale-[0.98]"
                  >
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center transition-transform group-hover:scale-105">
                        <User className="w-7 h-7 text-primary/60" />
                      </div>
                      {c.online && <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-[15px] truncate text-foreground/90">{c.name}</span>
                        <span className="text-[11px] font-medium text-muted-foreground">{c.time}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className={cn(
                          "text-sm truncate leading-snug pr-2",
                          c.unread > 0 ? "text-foreground font-semibold" : "text-muted-foreground"
                        )}>
                          {c.lastMsg}
                        </p>
                        {c.unread > 0 && (
                          <span className="shrink-0 min-w-[20px] h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[10px] font-black px-1.5 shadow-lg shadow-primary/20">
                            {c.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Fenêtre de discussion - Style Moderne */
          <div className="flex-1 flex flex-col overflow-hidden bg-muted/20">
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
              <div className="flex justify-center my-4">
                <span className="px-3 py-1 rounded-full bg-background/50 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border shadow-sm">
                  Aujourd'hui
                </span>
              </div>

              {/* Message Reçu */}
              <div className="flex justify-start items-end gap-2 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mb-1">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-background border shadow-sm rounded-2xl rounded-bl-none p-3.5 relative group">
                  <p className="text-[14px] leading-relaxed text-foreground/90">
                    Bonjour ! Comment pouvons-nous vous aider aujourd'hui ?
                  </p>
                  <div className="flex items-center gap-1 mt-1.5 opacity-60">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px] font-medium">10:30</span>
                  </div>
                </div>
              </div>
              
              {/* Message Envoyé */}
              <div className="flex justify-end ml-auto max-w-[85%]">
                <div className="bg-primary text-primary-foreground shadow-lg shadow-primary/10 rounded-2xl rounded-br-none p-3.5 relative group">
                  <p className="text-[14px] leading-relaxed">
                    J'aimerais avoir plus d'informations sur la disponibilité du tour "Allée des Baobabs" pour le mois de Juin.
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-1.5 opacity-80">
                    <span className="text-[10px] font-medium">10:32</span>
                    <CheckCheck className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>

            {/* Input Moderne */}
            <div className="p-4 bg-background border-t shrink-0">
              <form 
                className="flex items-center gap-2 bg-muted/40 p-1.5 rounded-2xl ring-1 ring-border focus-within:ring-2 focus-within:ring-primary transition-all shadow-inner"
                onSubmit={(e) => { e.preventDefault(); setMessage(""); }}
              >
                <Button type="button" variant="ghost" size="icon" className="shrink-0 h-10 w-10 rounded-xl hover:bg-background shadow-sm transition-all active:scale-95">
                  <Paperclip className="w-5 h-5 text-muted-foreground" />
                </Button>
                <Input 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Écrivez votre message..." 
                  className="flex-1 h-10 bg-transparent border-none focus-visible:ring-0 text-sm placeholder:text-muted-foreground/60"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className={cn(
                    "shrink-0 h-10 w-10 rounded-xl transition-all shadow-lg active:scale-95",
                    message.trim() ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )} 
                  disabled={!message.trim()}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
              <p className="text-[9px] text-center text-muted-foreground mt-3 font-medium uppercase tracking-tighter opacity-50">
                Vos messages sont sécurisés et privés
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
