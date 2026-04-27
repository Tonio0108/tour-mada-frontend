import { getAuthToken } from "../../../lib/api";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { 
  MapPin, 
  DollarSign, 
  Calendar, 
  Package,
  Plus,
  Loader2,
  WalletCards,
  ChevronRight,
  BarChart3,
  PieChart as PieChartIcon,
  Eye,
  Clock
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
  const { t } = useTranslation();
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
  const [mounted, setMounted] = useState(false);
  const url = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchDashboardData();
    // Utiliser un micro-délai pour laisser le layout se stabiliser
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
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
    if (s === "CONFIRMER") return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none text-[10px]">{t('reservations.status.confirmed')}</Badge>;
    if (s === "ANNULER") return <Badge variant="destructive" className="text-[10px]">{t('reservations.status.cancelled')}</Badge>;
    return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none text-[10px]">{t('reservations.status.pending')}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    });
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
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('admin_common.loading')}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-left">{t('admin_dashboard.title')}</h2>
        <div className="h-1 w-12 bg-primary mt-2"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title={t('admin_dashboard.stats.total_revenue')}
          value={analytics.stats.totalRevenue} 
          icon={WalletCards} 
          formatter={v => `${parseInt(v).toLocaleString()} ${t('admin_common.currency')}`}
          variant="primary"
        />
        <StatCard 
          title={t('admin_dashboard.stats.reservations')}
          value={analytics.stats.totalReservations} 
          icon={Calendar} 
        />
        <StatCard 
          title={t('admin_dashboard.stats.tours')}
          value={analytics.stats.totalTours} 
          icon={MapPin} 
        />
        <StatCard 
          title={t('admin_dashboard.stats.pending_payments')}
          value={analytics.stats.pendingPayments} 
          icon={DollarSign} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border shadow-none bg-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <CardTitle className="text-lg font-bold">{t('admin_dashboard.charts.revenue_monthly')}</CardTitle>
            </div>
            <CardDescription className="text-left">{t('admin_dashboard.charts.revenue_desc')}</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] min-h-[300px] w-full" style={{ minWidth: 0 }}>
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={[...analytics.revenueByMonth].reverse()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000000}M`} />
                  <Tooltip 
                    formatter={(value) => [`${parseInt(value).toLocaleString()} ${t('admin_common.currency')}`, 'Revenu']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border shadow-none bg-card flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-primary" />
              <CardTitle className="text-lg font-bold">{t('admin_dashboard.charts.popular_destinations')}</CardTitle>
            </div>
            <CardDescription className="text-left text-xs">{t('admin_dashboard.charts.popular_desc')}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col pt-0" style={{ minWidth: 0 }}>
            <div className="h-[200px] w-full" style={{ minWidth: 0 }}>
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                    <Pie
                      data={analytics.popularTours}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {analytics.popularTours.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                   <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 px-2">
              {analytics.popularTours.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2 overflow-hidden">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-[10px] font-medium truncate whitespace-nowrap" title={entry.name}>
                    {entry.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-auto tabular-nums font-bold">
                    {entry.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border shadow-none bg-card">
          <CardHeader className="border-b border-border/50 flex flex-row items-center justify-between space-y-0 py-4 px-6">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <CardTitle className="text-lg font-bold">{t('admin_dashboard.recent_activities.title')}</CardTitle>
            </div>
            <Button variant="ghost" size="sm" className="text-xs font-bold uppercase tracking-tighter" asChild>
              <Link to="/admin/reservations">{t('admin_dashboard.recent_activities.view_all')} <ChevronRight className="ml-1 w-3 h-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0 text-left">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="px-6 py-3 font-bold text-[10px] uppercase">{t('admin_common.date')}</TableHead>
                    <TableHead className="px-6 py-3 font-bold text-[10px] uppercase">{t('admin_common.client')}</TableHead>
                    <TableHead className="px-6 py-3 font-bold text-[10px] uppercase">{t('admin_payments.table.circuit')}</TableHead>
                    <TableHead className="px-6 py-3 font-bold text-[10px] uppercase text-right">{t('admin_common.amount')}</TableHead>
                    <TableHead className="px-6 py-3 font-bold text-[10px] uppercase text-center">{t('admin_common.actions')}</TableHead>
                    <TableHead className="px-6 py-3 font-bold text-[10px] uppercase text-center">{t('admin_common.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentReservations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic text-sm">
                        {t('admin_dashboard.recent_activities.no_activity')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentReservations.map((r) => (
                      <TableRow key={r.id_reservation} className="border-border hover:bg-muted/20 transition-colors">
                        <TableCell className="px-6 py-4 text-xs font-medium text-muted-foreground whitespace-nowrap">
                          {formatDate(r.createdAt)}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm leading-tight">{r.nom_complet}</span>
                            <span className="text-[10px] text-muted-foreground">{r.num_tel}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className="text-xs font-medium block max-w-[150px] truncate">
                            {r.tour?.nom_tour || r.tour_personnalise?.interets || "Sur mesure"}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <span className="font-bold text-sm text-primary tabular-nums">
                            {parseInt(r.montant_total)?.toLocaleString()} {t('admin_common.currency')}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 gap-1 text-xs font-bold g hover:text-primary"
                            asChild
                          >
                            <Link to="/admin/reservations">
                              <Eye className="w-3.5 h-3.5" /> {t('admin_common.details')}
                            </Link>
                          </Button>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          {getStatusBadge(r.statut)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="bg-white border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-left">{t('admin_dashboard.quick_actions.title')}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button variant="secondary" className="w-full justify-start font-bold" asChild>
                <Link to="/admin/tours/new"><Plus className="w-4 h-4 mr-2" /> {t('admin_dashboard.quick_actions.new_tour')}</Link>
              </Button>
              <Button variant="secondary" className="w-full justify-start font-bold" asChild>
                <Link to="/admin/paiements"><DollarSign className="w-4 h-4 mr-2" /> {t('admin_dashboard.quick_actions.view_payments')}</Link>
              </Button>
              <Button variant="secondary" className="w-full justify-start font-bold" asChild>
                <Link to="/admin/tours/propositions"><Package className="w-4 h-4 mr-2" /> {t('admin_dashboard.quick_actions.propositions')}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-none text-primary">
            <CardContent className="p-6 text-left">
              <p className="text-xs font-bold uppercase mb-2">{t('admin_dashboard.stock.title')}</p>
              <p className="text-sm mb-4">{t('admin_dashboard.stock.desc')}</p>
              <Button variant="outline" className="w-full font-bold" asChild>
                <Link to="/admin/tours">{t('admin_dashboard.stock.manage_tours')}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
