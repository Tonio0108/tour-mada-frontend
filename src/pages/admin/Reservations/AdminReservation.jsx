import React, { useEffect, useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  MapPin,
  Mail,
  Phone,
  Users,
  Eye,
  Search,
  CheckCircle,
  XCircle,
  RefreshCw,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { reservationAPI, MailApi } from "../../../../lib/api";
import { Input } from "../../../../components/ui/Input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export const AdminReservation = () => {
  const { t } = useTranslation();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReservations, setSelectedReservations] = useState(new Set());
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState(""); // "CONFIRMER" or "ANNULER"
  const [commentaire, setCommentaire] = useState("");

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const data = await reservationAPI.getAllReservations();
      setReservations(data);
    } catch (err) {
      console.error("Erreur:", err);
      toast.error(t('admin_reservations.toast.load_error'));
    } finally {
      setLoading(false);
    }
  };

  const showDetails = (reservation) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };

  const handleSelectRow = (id) => {
    const newSelected = new Set(selectedReservations);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedReservations(newSelected);
  };

  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      const matchesSearch =
        r.nom_complet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.tour?.nom_tour || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || r.statut === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [reservations, searchTerm, statusFilter]);

  const pendingCount = useMemo(() => 
    filteredReservations.filter(r => r.statut === "EN_ATTENTE").length,
  [filteredReservations]);

  const handleSelectAllPending = () => {
    const pendingIds = filteredReservations
      .filter(r => r.statut === "EN_ATTENTE")
      .map(r => r.id_reservation);
    
    if (selectedReservations.size === pendingIds.length && pendingIds.length > 0) {
      setSelectedReservations(new Set());
    } else {
      setSelectedReservations(new Set(pendingIds));
    }
  };

  const showActionModal = (type, reservation = null) => {
    if (reservation) {
      setSelectedReservations(new Set([reservation.id_reservation]));
    }
    setActionType(type);
    setCommentaire("");
    setIsActionModalOpen(true);
  };

  const updateStatus = async () => {
    if (selectedReservations.size === 0) return;
    setUpdatingStatus(true);

    try {
      const promises = Array.from(selectedReservations).map(async (id) => {
        await reservationAPI.updateReservation(id, { statut: actionType });
        const res = reservations.find(r => r.id_reservation === id);
        if (!res) return;

        try {
          if (actionType === "CONFIRMER") {
            await MailApi.confirmReservation({
              nomClient: `${res.client?.nom || res.nom_complet}`,
              nomTour: res.tour?.nom_tour || t('tour.custom_tour'),
              email: res.email,
              message: commentaire.trim()
            });
          } else if (actionType === "ANNULER") {
            await MailApi.refuseReservation({
              nomClient: `${res.client?.nom || res.nom_complet}`,
              nomTour: res.tour?.nom_tour || t('tour.custom_tour'),
              email: res.email,
              message: commentaire.trim()
            });
          }
        } catch (e) { console.error("Mail error", e); }
      });

      await Promise.all(promises);
      toast.success(t('admin_reservations.toast.update_success'));
      fetchReservations();
      setSelectedReservations(new Set());
      setIsActionModalOpen(false);
    } catch (err) {
      toast.error(t('admin_reservations.toast.update_error'));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = status?.toUpperCase();
    if (s === "CONFIRMER") return <Badge variant="outline" className="bg-primary text-primary-foreground border-none">{t('reservations.status.confirmed')}</Badge>;
    if (s === "ANNULER") return <Badge variant="destructive">{t('reservations.status.cancelled')}</Badge>;
    return <Badge variant="secondary">{t('reservations.status.pending')}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t('admin_reservations.title')}</h2>
        </div>
        <Button variant="outline" onClick={fetchReservations} disabled={loading} className="gap-2">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          {t('admin_common.refresh')}
        </Button>
      </div>

      <div className="bg-white rounded border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-75">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={t('admin_common.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t('admin_common.status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin_common.all_status')}</SelectItem>
              <SelectItem value="EN_ATTENTE">{t('reservations.status.pending')}</SelectItem>
              <SelectItem value="CONFIRMER">{t('reservations.status.confirmed')}</SelectItem>
              <SelectItem value="ANNULER">{t('reservations.status.cancelled')}</SelectItem>
            </SelectContent>
          </Select>
          {selectedReservations.size > 0 && (
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => showActionModal("CONFIRMER")} disabled={updatingStatus}>
                {t('admin_common.confirm')} ({selectedReservations.size})
              </Button>
              <Button size="sm" variant="destructive" onClick={() => showActionModal("ANNULER")} disabled={updatingStatus}>
                {t('admin_common.reject')}
              </Button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 px-4 py-3">
                  <Checkbox 
                    checked={selectedReservations.size === pendingCount && pendingCount > 0} 
                    onCheckedChange={handleSelectAllPending} 
                  />
                </TableHead>
                <TableHead className="px-4 py-3 font-medium">{t('admin_common.client')}</TableHead>
                <TableHead className="px-4 py-3 font-medium">{t('tour.tour_name')}</TableHead>
                <TableHead className="px-4 py-3 font-medium">{t('admin_common.date')}</TableHead>
                <TableHead className="px-4 py-3 font-medium text-right">{t('admin_common.amount')}</TableHead>
                <TableHead className="px-4 py-3 font-medium text-center">{t('admin_common.status')}</TableHead>
                <TableHead className="w-12 px-4 py-3 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({length: 5}).map((_, i) => (
                  <TableRow key={i} className="border-none">
                    <TableCell colSpan={7} className="h-16 bg-muted/5 animate-pulse" />
                  </TableRow>
                ))
              ) : filteredReservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">{t('admin_reservations.no_reservations')}</TableCell>
                </TableRow>
              ) : (
                filteredReservations.map((r) => (
                  <TableRow key={r.id_reservation} className="border-border group">
                    <TableCell className="px-4 py-3">
                      {r.statut === "EN_ATTENTE" && (
                        <Checkbox checked={selectedReservations.has(r.id_reservation)} onCheckedChange={() => handleSelectRow(r.id_reservation)} />
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="font-medium text-foreground">{r.nom_complet}</div>
                      <div className="text-xs text-muted-foreground">{r.email}</div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                      {r.tour?.nom_tour || t('tour.custom_tour')}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(r.date_tour_prevue)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right font-medium text-primary">
                      {parseInt(r.montant_total)?.toLocaleString()} {t('admin_common.currency')}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">{getStatusBadge(r.statut)}</TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" onClick={() => showDetails(r)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          {selectedReservation && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl font-bold">{t('admin_reservations.details.title')}</DialogTitle>
                  {getStatusBadge(selectedReservation.statut)}
                </div>
                <DialogDescription>
                  {t('admin_reservations.details.received_on')} {formatDate(selectedReservation.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground">{t('admin_reservations.details.client')}</h4>
                    <div className="text-sm space-y-1">
                      <p className="font-medium">{selectedReservation.nom_complet}</p>
                      <p className="flex items-center gap-2"><Phone className="w-3 h-3" /> {selectedReservation.num_tel}</p>
                      <p className="flex items-center gap-2"><Mail className="w-3 h-3" /> {selectedReservation.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground">{t('admin_reservations.details.finance')}</h4>
                    <div className="text-sm space-y-1">
                      <p>{t('admin_common.amount')}: <span className="font-bold text-primary">{parseInt(selectedReservation.montant_total)?.toLocaleString()} {t('admin_common.currency')}</span></p>
                      <p>{t('admin_reservations.details.budget')}: {parseInt(selectedReservation.budget_estime)?.toLocaleString()} {t('admin_common.currency')}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-muted-foreground">{t('admin_reservations.details.tour')}</h4>
                  <div className="text-sm grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">{selectedReservation.tour?.nom_tour || t('tour.custom_tour')}</p>
                      <p className="text-xs text-muted-foreground">{t('admin_reservations.details.departure')}: {formatDate(selectedReservation.date_tour_prevue)}</p>
                    </div>
                    <div className="text-right">
                      <p>{selectedReservation.nbre_jours} {t('tour.days_plural')} / {selectedReservation.nombre_pers} {t('reservations.reservation_card.persons')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>{t('admin_common.close')}</Button>
                {selectedReservation.statut === "EN_ATTENTE" && (
                  <div className="flex gap-2">
                    <Button variant="destructive" onClick={() => { setIsModalOpen(false); showActionModal("ANNULER", selectedReservation); }}>
                      {t('admin_common.reject')}
                    </Button>
                    <Button onClick={() => { setIsModalOpen(false); showActionModal("CONFIRMER", selectedReservation); }}>
                      {t('admin_common.confirm')}
                    </Button>
                  </div>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'CONFIRMER' ? t('admin_reservations.actions.confirm_title') : t('admin_reservations.actions.refuse_title')}
            </DialogTitle>
            <DialogDescription>
              {selectedReservations.size > 1 
                ? t('admin_reservations.actions.selected_count', { count: selectedReservations.size })
                : `${t('admin_common.client')}: ${reservations.find(r => r.id_reservation === Array.from(selectedReservations)[0])?.nom_complet}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">{t('admin_common.message_to_client')}</label>
              <Textarea
                placeholder={t('admin_common.message_placeholder')}
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsActionModalOpen(false)} disabled={updatingStatus}>{t('admin_common.cancel')}</Button>
            <Button 
              onClick={updateStatus} 
              disabled={updatingStatus || (actionType === "ANNULER" && !commentaire.trim())}
              variant={actionType === "ANNULER" ? "destructive" : "default"}
            >
              {updatingStatus ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
              {actionType === 'CONFIRMER' ? t('admin_common.confirm') : t('admin_common.reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
