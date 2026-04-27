import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Send, User, Search, MoreVertical, Paperclip, Smile } from "lucide-react";
import { cn } from "../../../lib/utils";

export default function Chat() {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  
  // Mock data pour l'interface
  const [activeChat, setActiveChat] = useState(1);
  const contacts = [
    { id: 1, name: "Support TOUR MADA", lastMsg: "Comment puis-je vous aider ?", time: "10:30", unread: 1, online: true },
  ];

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col md:flex-row gap-4">
      {/* Sidebar de discussion */}
      <Card className="w-full md:w-80 flex flex-col shrink-0 overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg mb-4">{t("chat.contacts")}</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9 h-9" placeholder="Rechercher..." />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {contacts.map((c) => (
            <div 
              key={c.id}
              onClick={() => setActiveChat(c.id)}
              className={cn(
                "p-4 flex gap-3 cursor-pointer transition-colors hover:bg-muted/50",
                activeChat === c.id && "bg-muted"
              )}
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                {c.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm truncate">{c.name}</span>
                  <span className="text-[10px] text-muted-foreground">{c.time}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{c.lastMsg}</p>
              </div>
              {c.unread > 0 && (
                <span className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[10px] font-bold">
                  {c.unread}
                </span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Zone de chat */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Header du Chat */}
        <div className="p-4 border-b flex items-center justify-between bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Support TOUR MADA</h3>
              <p className="text-[10px] text-green-500 font-medium">{t("chat.online")}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
        </div>

        {/* Liste des messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/5">
          <div className="flex justify-start">
            <div className="max-w-[80%] bg-card border rounded-2xl rounded-tl-none p-3 shadow-sm">
              <p className="text-sm">Bonjour ! Bienvenue chez TOUR MADA. Comment pouvons-nous vous aider aujourd'hui ?</p>
              <span className="text-[10px] text-muted-foreground mt-1 block">10:30</span>
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-card">
          <form 
            className="flex items-center gap-2"
            onSubmit={(e) => { e.preventDefault(); setMessage(""); }}
          >
            <Button type="button" variant="ghost" size="icon" className="shrink-0">
              <Paperclip className="w-4 h-4 text-muted-foreground" />
            </Button>
            <Input 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("chat.placeholder")} 
              className="flex-1 bg-muted/50 border-none focus-visible:ring-1"
            />
            <Button type="button" variant="ghost" size="icon" className="shrink-0">
              <Smile className="w-4 h-4 text-muted-foreground" />
            </Button>
            <Button type="submit" size="icon" className="shrink-0" disabled={!message.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
