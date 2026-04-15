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
  Loader2,
  WalletCards,
  ChevronRight,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  ChevronDown
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
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState({
    stats: {
      totalRevenue: 0,
      totalReservations: 0,
      totalTours: 0,
      pendingPayments: 0
    },
    revenueByMonth: [],
    popularTours: []
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
      const [analyticsRes, reservsRes] = await Promise.all([
        fetch(`${url}/analytics/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${url}/reservation`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const [analyticsData, reservations] = await Promise.all([
        analyticsRes.json(),
        reservsRes.json()
      ]);

      setAnalytics(analyticsData);
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
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
          title="Revenu Total" 
          value={analytics.stats.totalRevenue} 
          icon={WalletCards} 
          formatter={v => `${parseInt(v).toLocaleString()} Ar`}
          variant="primary"
        />
        <StatCard 
          title="Réservations" 
          value={analytics.stats.totalReservations} 
          icon={Calendar} 
        />
        <StatCard 
          title="Circuits" 
          value={analytics.stats.totalTours} 
          icon={MapPin} 
        />
        <StatCard 
          title="Paiements en attente" 
          value={analytics.stats.pendingPayments} 
          icon={DollarSign} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border shadow-none bg-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <CardTitle className="text-lg font-bold">Revenus par mois</CardTitle>
            </div>
            <CardDescription>Visualisation des revenus validés sur les 6 derniers mois</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[...analytics.revenueByMonth].reverse()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000000}M`} />
                <Tooltip 
                  formatter={(value) => [`${parseInt(value).toLocaleString()} Ar`, 'Revenu']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border shadow-none bg-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-primary" />
              <CardTitle className="text-lg font-bold">Destinations populaires</CardTitle>
            </div>
            <CardDescription>Répartition des réservations par circuit</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.popularTours}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {analytics.popularTours.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {analytics.popularTours.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-xs font-medium">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
                <TableHeader>
                <TableRow>
                  <TableHead className="px-6 py-3 font-bold text-[10px] uppercase">Client</TableHead>
                  <TableHead className="px-6 py-3 font-bold text-[10px] uppercase">Circuit</TableHead>
                  <TableHead className="px-6 py-3 font-bold text-[10px] uppercase text-right">Prix</TableHead>
                  <TableHead className="px-6 py-3 font-bold text-[10px] uppercase text-center">Facture</TableHead>
                  <TableHead className="px-6 py-3 font-bold text-[10px] uppercase text-center">Statut</TableHead>
                </TableRow>
              </TableHeader>
              </TableHeader>
              <TableBody>
                {recentReservations.map((r) => (
                  <TableRow key={r.id_reservation} className="border-border">
                    <TableCell className="px-6 py-4 font-bold text-sm">{r.nom_complet}</TableCell>
                    <TableCell className="px-6 py-4 text-xs text-muted-foreground">{r.tour?.nom_tour || "Sur mesure"}</TableCell>
                    <TableCell className="px-6 py-4 text-right font-bold text-primary">{parseInt(r.montant_total)?.toLocaleString()} Ar</TableCell>
                    <TableCell className="px-6 py-4 text-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={async () => {
                          const token = await getAuthToken();
                          const response = await fetch(`${url}/documents/invoice/${r.id_reservation}`, {
                            headers: { Authorization: `Bearer ${token}` }
                          });
                          const blob = await response.blob();
                          const downloadUrl = window.URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = downloadUrl;
                          link.setAttribute('download', `facture_${r.id_reservation}.pdf`);
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                        }}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center">{getStatusBadge(r.statut)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="bg-white border-none shadow-sm">
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

          <Card className="bg-primary/5 border-none text-primary">
            <CardContent className="p-6">
              <p className="text-xs font-bold uppercase mb-2">Gestion des stocks</p>
              <p className="text-sm mb-4">La capacité maximale des circuits est désormais active pour éviter les sur-réservations.</p>
              <Button variant="outline" className="w-full font-bold" asChild>
                <Link to="/admin/tours">Gérer les circuits</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

