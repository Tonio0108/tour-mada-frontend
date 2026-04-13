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
import { reservationAPI } from "../../../../lib/api";
import { Input } from "../../../../components/ui/Input";
import { Button } from "@/components/ui/button";
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
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReservations, setSelectedReservations] = useState(new Set());
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);

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
      toast.error("Impossible de charger les réservations");
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

  const updateStatus = async (status) => {
    if (selectedReservations.size === 0) return;
    setUpdatingStatus(true);
    const url = import.meta.env.VITE_API_URL;

    try {
      const promises = Array.from(selectedReservations).map(async (id) => {
        await reservationAPI.updateReservation(id, { statut: status });
        const res = reservations.find(r => r.id_reservation === id);
        if (!res) return;

        const endpoint = status === "CONFIRMER" ? "confirm-reservation" : "refuse-reservation";
        try {
          await fetch(`${url}/mail/${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nomClient: `${res.client?.nom || res.nom_complet}`,
              nomTour: res.tour?.nom_tour || "Tour personnalisé",
              email: res.email
            }),
          });
        } catch (e) { console.error("Mail error", e); }
      });

      await Promise.all(promises);
      toast.success(`Statut mis à jour`);
      fetchReservations();
      setSelectedReservations(new Set());
    } catch (err) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = status?.toUpperCase();
    if (s === "CONFIRMER") return <Badge variant="outline" className="bg-primary text-primary-foreground border-none">Confirmé</Badge>;
    if (s === "ANNULER") return <Badge variant="destructive">Annulé</Badge>;
    return <Badge variant="secondary">En attente</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestion des réservations</h2>
        </div>
        <Button variant="outline" onClick={fetchReservations} disabled={loading} className="gap-2">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          Actualiser
        </Button>
      </div>

      <div className="bg-white rounded border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-75">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="EN_ATTENTE">En attente</SelectItem>
              <SelectItem value="CONFIRMER">Confirmé</SelectItem>
              <SelectItem value="ANNULER">Annulé</SelectItem>
            </SelectContent>
          </Select>
          {selectedReservations.size > 0 && (
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => updateStatus("CONFIRMER")} disabled={updatingStatus}>
                Confirmer ({selectedReservations.size})
              </Button>
              <Button size="sm" variant="destructive" onClick={() => updateStatus("ANNULER")} disabled={updatingStatus}>
                Annuler
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
                <TableHead className="px-4 py-3 font-medium">Client</TableHead>
                <TableHead className="px-4 py-3 font-medium">Tour</TableHead>
                <TableHead className="px-4 py-3 font-medium">Date</TableHead>
                <TableHead className="px-4 py-3 font-medium text-right">Montant</TableHead>
                <TableHead className="px-4 py-3 font-medium text-center">Statut</TableHead>
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
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">Aucune réservation</TableCell>
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
                      {r.tour?.nom_tour || "Tour sur mesure"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(r.date_tour_prevue)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right font-medium text-primary">
                      {parseInt(r.montant_total)?.toLocaleString()} Ar
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
                  <DialogTitle className="text-xl font-bold">Détails de la réservation</DialogTitle>
                  {getStatusBadge(selectedReservation.statut)}
                </div>
                <DialogDescription>
                  Reçue le {formatDate(selectedReservation.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground">Client</h4>
                    <div className="text-sm space-y-1">
                      <p className="font-medium">{selectedReservation.nom_complet}</p>
                      <p className="flex items-center gap-2"><Phone className="w-3 h-3" /> {selectedReservation.num_tel}</p>
                      <p className="flex items-center gap-2"><Mail className="w-3 h-3" /> {selectedReservation.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground">Finance</h4>
                    <div className="text-sm space-y-1">
                      <p>Montant: <span className="font-bold text-primary">{parseInt(selectedReservation.montant_total)?.toLocaleString()} Ar</span></p>
                      <p>Budget: {parseInt(selectedReservation.budget_estime)?.toLocaleString()} Ar</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-muted-foreground">Circuit</h4>
                  <div className="text-sm grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">{selectedReservation.tour?.nom_tour || "Tour personnalisé"}</p>
                      <p className="text-xs text-muted-foreground">Départ: {formatDate(selectedReservation.date_tour_prevue)}</p>
                    </div>
                    <div className="text-right">
                      <p>{selectedReservation.nbre_jours} Jours / {selectedReservation.nombre_pers} Pers.</p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Fermer</Button>
                {selectedReservation.statut === "EN_ATTENTE" && (
                  <div className="flex gap-2">
                    <Button variant="destructive" onClick={() => { setSelectedReservations(new Set([selectedReservation.id_reservation])); updateStatus("ANNULER"); setIsModalOpen(false); }}>
                      Annuler
                    </Button>
                    <Button onClick={() => { setSelectedReservations(new Set([selectedReservation.id_reservation])); updateStatus("CONFIRMER"); setIsModalOpen(false); }}>
                      Confirmer
                    </Button>
                  </div>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
