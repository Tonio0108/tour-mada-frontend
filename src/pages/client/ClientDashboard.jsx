import { useState, useEffect } from "react";
import { 
  CalendarDays, 
  WalletCards, 
  MapPin, 
  Clock, 
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Package
} from "lucide-react";
import { getAuthToken, reservationAPI } from "../../../lib/api";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@src/hooks/useAuth";

export default function ClientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalReservations: 0,
    pendingPayments: 0,
    confirmedReservations: 0,
  });
  const [recentReservations, setRecentReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.Clients?.id_client) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const clientId = user.Clients.id_client;
      const data = await reservationAPI.getClientReservations(clientId);
      
      setStats({
        totalReservations: data.length,
        pendingPayments: data.filter(r => r.statut === "EN_ATTENTE").length,
        confirmedReservations: data.filter(r => r.statut === "CONFIRMER").length,
      });
      
      setRecentReservations(data.slice(0, 3));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, description, colorClass }) => (
    <Card className={'hover:border-primary transition-all'}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
          <div className={`p-3 rounded-full ${colorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard 
          title="Total Réservations" 
          value={stats.totalReservations} 
          icon={Package} 
          colorClass="bg-blue-500/10 text-blue-600"
        />
        <StatCard 
          title="En attente" 
          value={stats.pendingPayments} 
          icon={Clock} 
          description="Réservations à confirmer"
          colorClass="bg-yellow-500/10 text-yellow-600"
        />
        <StatCard 
          title="Confirmées" 
          value={stats.confirmedReservations} 
          icon={CheckCircle2} 
          colorClass="bg-green-500/10 text-green-600"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Réservations Récentes</CardTitle>
            <CardDescription>Vos dernières demandes de voyage.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReservations.length > 0 ? (
                recentReservations.map((res) => (
                  <div key={res.id_reservation} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-2 rounded">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{res.tour?.nom_tour || "Circuit Personnalisé"}</p>
                        <p className="text-xs text-muted-foreground">{new Date(res.date_tour_prevue).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={res.statut === "CONFIRMER" ? "default" : "secondary"}>
                        {res.statut}
                      </Badge>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to="/client/reservations">
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">Aucune réservation pour le moment.</p>
                  <Button variant="link" asChild>
                    <Link to="/tours">Découvrir nos circuits</Link>
                  </Button>
                </div>
              )}
            </div>
            {recentReservations.length > 0 && (
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link to="/client/reservations">Voir toutes mes réservations</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start gap-2" variant="outline" asChild>
              <Link to="/tours">
                <MapPin className="w-4 h-4" /> Réserver un nouveau tour
              </Link>
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" asChild>
              <Link to="/client/profile">
                <TrendingUp className="w-4 h-4" /> Mettre à jour mon profil
              </Link>
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" asChild>
              <Link to="/client/paiements">
                <WalletCards className="w-4 h-4" /> Historique des paiements
              </Link>
            </Button>
            
            <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
              <h4 className="text-sm font-bold flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-primary" /> Besoin d'aide ?
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Notre équipe est disponible 24/7 pour vous accompagner dans la préparation de votre voyage.
              </p>
              <Button variant="link" className="p-0 h-auto text-xs mt-2">Nous contacter</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
