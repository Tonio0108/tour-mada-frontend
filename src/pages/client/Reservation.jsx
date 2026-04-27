import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { reservationAPI, MailApi } from "../../../lib/api";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
  MoreVertical,
  ChevronDown,
  Mail,
  Phone,
  User,
  Trash2,
} from "lucide-react";
import { useTranslation, Trans } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export const Reservations = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelMessage, setCancelMessage] = useState("");
  const [reservationToCancel, setReservationToCancel] = useState(null);

  const fetchReservations = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const clientId = user.Clients.id_client;
      const data = await reservationAPI.getClientReservations(clientId);
      setReservations(data);
      setFilteredData(data);
    } catch (err) {
      console.error("Erreur lors du chargement des réservations:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  useEffect(() => {
    const filtered = reservations.filter(item => {
      const tourName = item.tour?.nom_tour || item.tour_personnalise?.interets || "";
      return (
        tourName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.id_reservation.toString().includes(searchText) ||
        item.statut.toLowerCase().includes(searchText.toLowerCase())
      );
    });
    setFilteredData(filtered);
  }, [searchText, reservations]);

  const handleCancel = (res) => {
    setReservationToCancel(res);
    setCancelMessage("");
    setIsCancelDialogOpen(true);
  };

  const submitCancel = async () => {
    if (!reservationToCancel) return;

    try {
      setLoading(true);
      await reservationAPI.cancelReservation(reservationToCancel.id_reservation);
      
      const tourName = reservationToCancel.tour?.nom_tour || reservationToCancel.tour_personnalise?.interets || "Circuit";
      await MailApi.notifyCancellation({
        nomClient: reservationToCancel.nom_complet,
        nomTour: tourName,
        message: cancelMessage
      });

      toast.success(t('client_reservations.toast.cancel_success'));
      setIsCancelDialogOpen(false);
      setReservationToCancel(null);
      fetchReservations();
    } catch (err) {
      console.error(err);
      toast.error(t('client_reservations.toast.cancel_error'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (statut) => {
    switch (statut) {
      case "CONFIRMER":
        return <Badge className="bg-green-500 hover:bg-green-600 text-white border-none">{t('reservations.status.confirmed')}</Badge>;
      case "EN_ATTENTE":
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-200/50">{t('reservations.status.pending')}</Badge>;
      case "ANNULER":
        return <Badge variant="destructive">{t('reservations.status.cancelled')}</Badge>;
      default:
        return <Badge variant="outline">{statut}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-left">
          <h2 className="text-2xl font-bold text-foreground">{t('reservations.title')}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t('client_reservations.subtitle')}</p>
        </div>
        <Button asChild>
          <a href="/tours"><Plus className="w-4 h-4 mr-2" /> {t('client_reservations.new_trip')}</a>
        </Button>
      </div>

      <div className="bg-white rounded border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={t('client_reservations.search_placeholder')}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-3 font-medium">{t('client_reservations.table.destination')}</TableHead>
                <TableHead className="px-4 py-3 font-medium">{t('client_reservations.table.date')}</TableHead>
                <TableHead className="px-4 py-3 font-medium">{t('client_reservations.table.people')}</TableHead>
                <TableHead className="px-4 py-3 font-medium text-right">{t('client_reservations.table.amount')}</TableHead>
                <TableHead className="px-4 py-3 font-medium text-center">{t('client_reservations.table.status')}</TableHead>
                <TableHead className="w-12 px-4 py-3 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({length: 3}).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6} className="h-16 bg-muted/5 animate-pulse" />
                  </TableRow>
                ))
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    {searchText ? t('admin_common.no_data') : t('reservations.no_reservations')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((res) => (
                  <TableRow key={res.id_reservation} className="border-border group">
                    <TableCell className="px-4 py-4">
                      <div className="flex flex-col text-left">
                        <span className="font-semibold text-gray-900">
                          {res.tour?.nom_tour || res.tour_personnalise?.interets || t('tour.custom_tour')}
                        </span>
                        <span className="text-xs text-muted-foreground">{t('client_reservations.details.id')}: #{res.id_reservation}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-left">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        {formatDate(res.date_tour_prevue)}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-left">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        {res.nombre_pers} {t('client_reservations.details.persons')}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-right font-medium text-primary">
                      {formatCurrency(res.montant_total)}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-center">
                      {getStatusBadge(res.statut)}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setSelectedReservation(res); setIsDetailsOpen(true); }}>
                            <Eye className="w-4 h-4 mr-2" /> {t('client_reservations.actions.view_details')}
                          </DropdownMenuItem>
                          {res.statut === "CONFIRMER" && (
                            <DropdownMenuItem asChild>
                              <a href="/client/paiements">{t('client_reservations.actions.pay')}</a>
                            </DropdownMenuItem>
                          )}
                          {res.statut !== "ANNULER" && (
                            <DropdownMenuItem 
                              onClick={() => handleCancel(res)}
                              className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> {t('client_reservations.actions.cancel')}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('client_reservations.details.title')} #{selectedReservation?.id_reservation}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto pr-4">
            {selectedReservation && (
              <div className="space-y-6 py-4 text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{t('client_reservations.details.circuit')}</p>
                    <p className="font-medium">{selectedReservation.tour?.nom_tour || t('reservations.details.custom')}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{t('client_reservations.details.statut')}</p>
                    <div>{getStatusBadge(selectedReservation.statut)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="text-center space-y-1">
                    <Calendar className="w-4 h-4 mx-auto text-primary" />
                    <p className="text-xs text-muted-foreground">{t('client_reservations.details.date')}</p>
                    <p className="text-sm font-medium">{formatDate(selectedReservation.date_tour_prevue)}</p>
                  </div>
                  <div className="text-center space-y-1 border-x border-border">
                    <Users className="w-4 h-4 mx-auto text-primary" />
                    <p className="text-xs text-muted-foreground">{t('client_reservations.details.voyageurs')}</p>
                    <p className="text-sm font-medium">{selectedReservation.nombre_pers}</p>
                  </div>
                  <div className="text-center space-y-1">
                    <Clock className="w-4 h-4 mx-auto text-primary" />
                    <p className="text-xs text-muted-foreground">{t('client_reservations.details.duree')}</p>
                    <p className="text-sm font-medium">{selectedReservation.nbre_jours} {t('client_reservations.details.days')}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-sm border-b pb-1">{t('client_reservations.details.distribution')}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><span className="text-muted-foreground">{t('reservations.details.adults')}:</span> {selectedReservation.nombre_adulte || 0}</div>
                    <div><span className="text-muted-foreground">{t('reservations.details.youth')}:</span> {selectedReservation.nombre_jeune || 0}</div>
                    <div><span className="text-muted-foreground">{t('reservations.details.children')}:</span> {selectedReservation.nombre_enfant || 0}</div>
                    <div><span className="text-muted-foreground">{t('reservations.details.men')}:</span> {selectedReservation.nombre_homme || 0}</div>
                    <div><span className="text-muted-foreground">{t('reservations.details.women')}:</span> {selectedReservation.nombre_femme || 0}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-sm border-b pb-1">{t('client_reservations.details.contact')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /> {selectedReservation.email}</div>
                    <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /> {selectedReservation.num_tel}</div>
                    <div className="flex items-center gap-2 md:col-span-2"><MapPin className="w-4 h-4 text-muted-foreground" /> {selectedReservation.adresse}</div>
                  </div>
                </div>

                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 flex justify-between items-center">
                  <span className="font-bold text-primary">{t('client_reservations.details.total')}</span>
                  <span className="text-xl font-black text-primary">{formatCurrency(selectedReservation.montant_total)}</span>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancellation Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('client_reservations.cancel_dialog.title')}</DialogTitle>
            <DialogDescription>
              {t('client_reservations.cancel_dialog.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-left">
            <Textarea
              placeholder={t('client_reservations.cancel_dialog.placeholder')}
              value={cancelMessage}
              onChange={(e) => setCancelMessage(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              {t('client_reservations.cancel_dialog.cancel')}
            </Button>
            <Button variant="destructive" onClick={submitCancel} disabled={loading}>
              {loading ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
              {t('client_reservations.cancel_dialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
