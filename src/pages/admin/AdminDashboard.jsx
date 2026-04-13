import { getAuthToken } from "../../../lib/api";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { 
  MapPin, 
  DollarSign, 
  Calendar, 
  Package,
  Plus,
  ArrowRight,
  Loader,
  WalletCards,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalTours: 0,
    totalReservations: 0,
    totalRevenue: 0,
    pendingPropositions: 0
  });

  const [recentReservations, setRecentReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const url = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const token = await getAuthToken();
    try {
      const [toursRes, propsRes, reservsRes, paymentsRes] = await Promise.all([
        fetch(`${url}/tours-standards`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${url}/tours-personnalises`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${url}/reservation`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${url}/paiements`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const [tours, propositions, reservations, paiements] = await Promise.all([
        toursRes.json(),
        propsRes.json(),
        reservsRes.json(),
        paymentsRes.json()
      ]);

      const totalRevenue = paiements.reduce((sum, p) => sum + parseFloat(p.montant || 0), 0);
      const pendingPropositions = propositions.filter(p => p.statut === 'EN_ATTENTE' || !p.statut).length;

      setStats({
        totalTours: tours.length,
        totalReservations: reservations.length,
        totalRevenue,
        pendingPropositions
      });

      setRecentReservations(reservations.slice(0, 5));
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = status?.toUpperCase();
    if (s === "CONFIRMER") return <Badge className="bg-primary text-primary-foreground border-none">Confirmé</Badge>;
    if (s === "ANNULER") return <Badge variant="destructive">Annulé</Badge>;
    return <Badge variant="secondary">En attente</Badge>;
  };

  const StatCard = ({ title, value, icon: Icon, formatter, variant = "default" }) => (
    <Card className={cn(
      "border-border shadow-none hover:shadow transition-all hover:border-primary",
      variant === "primary" ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground border border-border"
    )}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-3 rounded-lg",
            variant === "primary" ? "bg-primary-foreground/10 text-primary-foreground" : "bg-primary/10 text-primary"
          )}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className={cn(
              "text-xs font-bold uppercase tracking-wider",
              variant === "primary" ? "text-primary-foreground/70" : "text-muted-foreground"
            )}>{title}</p>
            <h3 className="text-2xl font-bold mt-1 tabular-nums">
              {formatter ? formatter(value) : value}
            </h3>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
      <Loader className="h-8 w-8 animate-spin text-primary" />
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Chargement</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Tableau de bord</h2>
        <div className="h-1 w-12 bg-primary mt-2"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Revenu" 
          value={stats.totalRevenue} 
          icon={WalletCards} 
          formatter={v => `${parseInt(v).toLocaleString()} Ar`}
          variant="primary"
        />
        <StatCard 
          title="Réservations" 
          value={stats.totalReservations} 
          icon={Calendar} 
        />
        <StatCard 
          title="Circuits" 
          value={stats.totalTours} 
          icon={MapPin} 
        />
        <StatCard 
          title="Demandes" 
          value={stats.pendingPropositions} 
          icon={Package} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border shadow-none bg-card">
          <CardHeader className="border-b border-border/50 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg font-bold">Activités Récentes</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs font-bold uppercase tracking-tighter" asChild>
              <Link to="/admin/reservations">Voir tout <ChevronRight className="ml-1 w-3 h-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6 py-3 font-bold text-[10px] uppercase">Client</TableHead>
                  <TableHead className="px-6 py-3 font-bold text-[10px] uppercase">Circuit</TableHead>
                  <TableHead className="px-6 py-3 font-bold text-[10px] uppercase text-right">Prix</TableHead>
                  <TableHead className="px-6 py-3 font-bold text-[10px] uppercase text-center">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentReservations.map((r) => (
                  <TableRow key={r.id_reservation} className="border-border">
                    <TableCell className="px-6 py-4 font-bold text-sm">{r.nom_complet}</TableCell>
                    <TableCell className="px-6 py-4 text-xs text-muted-foreground">{r.tour?.nom_tour || "Sur mesure"}</TableCell>
                    <TableCell className="px-6 py-4 text-right font-bold text-primary">{parseInt(r.montant_total)?.toLocaleString()} Ar</TableCell>
                    <TableCell className="px-6 py-4 text-center">{getStatusBadge(r.statut)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="bg-white border-none">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button variant="secondary" className="w-full justify-start font-bold" asChild>
                <Link to="/admin/tours/new"><Plus className="w-4 h-4 mr-2" /> Nouveau Circuit</Link>
              </Button>
              <Button variant="secondary" className="w-full justify-start font-bold" asChild>
                <Link to="/admin/paiements"><DollarSign className="w-4 h-4 mr-2" /> Voir les paiements</Link>
              </Button>
              <Button variant="secondary" className="w-full justify-start font-bold" asChild>
                <Link to="/admin/tours/propositions"><Package className="w-4 h-4 mr-2" /> Propositions</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-muted border-none text-muted-foreground">
            <CardContent className="p-6">
              <p className="text-xs font-bold uppercase mb-2">Besoin d'assistance ?</p>
              <Button variant="link" className="p-0 h-auto text-foreground font-bold" asChild>
                <Link to="/admin/docs">Consulter la documentation <ArrowRight className="ml-2 w-3 h-3" /></Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
