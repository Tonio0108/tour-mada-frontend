import React from 'react';
import { useNotifications } from "../../context/NotificationContext";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, Calendar, ArrowRight } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useNavigate } from "react-router";

export default function AdminNotifications() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("notifications.title")} (Admin)</h2>
          <p className="text-muted-foreground">
            Suivi en temps réel des activités système
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline" size="sm">
            <CheckCheck className="w-4 h-4 mr-2" />
            {t("notifications.mark_all_read")}
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((n) => (
                <div 
                  key={n.id_notification} 
                  className={cn(
                    "p-6 transition-all hover:bg-muted/50 flex gap-4",
                    !n.est_lu && "bg-primary/5 border-l-4 border-l-primary"
                  )}
                >
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                    !n.est_lu ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    <Bell className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={cn("font-semibold text-base", !n.est_lu && "text-primary")}>
                        {n.titre}
                      </h4>
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {n.message}
                    </p>
                    
                    <div className="pt-3 flex items-center gap-3">
                      {n.lien && (
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="h-8"
                          onClick={() => navigate(n.lien)}
                        >
                          Gérer
                          <ArrowRight className="w-3 h-3 ml-2" />
                        </Button>
                      )}
                      {!n.est_lu && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 text-xs"
                          onClick={() => markAsRead(n.id_notification)}
                        >
                          Marquer comme lu
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center px-4">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4 opacity-50">
                <Bell className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">Aucune nouvelle notification</h3>
              <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                Toutes les alertes système apparaîtront ici dès qu'une action client sera effectuée.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
