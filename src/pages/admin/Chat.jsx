import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Send, User, Search, MoreVertical, Paperclip, Smile } from "lucide-react";
import { cn } from "../../../lib/utils";

export default function AdminChat() {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  
  const [activeChat, setActiveChat] = useState(1);
  const clients = [
    { id: 1, name: "Jean Dupont", lastMsg: "Quels sont les documents ?", time: "10:30", unread: 2, online: true },
    { id: 2, name: "Marie Curie", lastMsg: "Paiement envoyé !", time: "Hier", unread: 0, online: false },
  ];

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col md:flex-row gap-4">
      {/* Sidebar des Clients */}
      <Card className="w-full md:w-80 flex flex-col shrink-0 overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg mb-4">Clients</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9 h-9" placeholder="Rechercher un client..." />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {clients.map((c) => (
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
        {activeChat ? (
          <>
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{clients.find(c => c.id === activeChat)?.name}</h3>
                  <p className="text-[10px] text-muted-foreground">Client</p>
                </div>
              </div>
              <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/5">
               <div className="flex justify-start">
                <div className="max-w-[80%] bg-card border rounded-2xl rounded-tl-none p-3 shadow-sm">
                  <p className="text-sm">Bonjour, quels sont les documents nécessaires pour mon visa ?</p>
                  <span className="text-[10px] text-muted-foreground mt-1 block">10:30</span>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="max-w-[80%] bg-primary text-primary-foreground rounded-2xl rounded-tr-none p-3 shadow-sm">
                  <p className="text-sm">Bonjour ! Il nous faut votre passeport scanné et une photo d'identité.</p>
                  <span className="text-[10px] text-primary-foreground/70 mt-1 block">10:32</span>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-card">
              <form className="flex items-center gap-2" onSubmit={(e) => e.preventDefault()}>
                <Button type="button" variant="ghost" size="icon" className="shrink-0"><Paperclip className="w-4 h-4" /></Button>
                <Input 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Répondre au client..." 
                  className="flex-1 bg-muted/50 border-none" 
                />
                <Button type="submit" size="icon" disabled={!message.trim()}><Send className="w-4 h-4" /></Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Sélectionnez une discussion</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
              Choisissez un client dans la liste de gauche pour commencer à discuter.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
