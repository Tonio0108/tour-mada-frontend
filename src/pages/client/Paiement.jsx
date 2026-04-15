import React, { useEffect, useState, useCallback } from "react";
import {
  Calendar,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  X,
  MoreVertical,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getAuthToken, PaiementApi, reservationAPI } from "../../../lib/api";
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from 'react-i18next';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const paiementSchema = z.object({
  id_reservation: z.number().min(1, "La réservation est requise"),
  reference_paiement: z.string().min(1, "La référence est requise"),
  montant: z.string().min(1, "Le montant est requis"),
  mode_paiement: z.string().min(1, "Le mode de paiement est requis"),
  file: z.any(),
});

export const Paiement = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [paiements, setPaiements] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const url = import.meta.env.VITE_API_URL;

  const {
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    register
  } = useForm({
    resolver: zodResolver(paiementSchema),
  });

  const selectedFile = watch("file");

  const fetchPaiements = useCallback(async () => {
    if (!user?.Clients.id_client) return;
    try {
      setLoading(true);
      const data = await PaiementApi.getClientPaiements(user.Clients.id_client);
      setPaiements(data);
      setFilteredData(data);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des paiements");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchReservations = useCallback(async () => {
    if (!user?.Clients.id_client) return;
    try {
      const data = await reservationAPI.getClientReservations(user.Clients.id_client);
      setReservations(data.filter(res => res.statut === "CONFIRMER"));
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  useEffect(() => {
    fetchPaiements();
    fetchReservations();
  }, [fetchPaiements, fetchReservations]);

  useEffect(() => {
    const filtered = paiements.filter(p => {
      const tourName = p.reservation?.tour?.nom_tour || p.reservation?.tour_personnalise?.interets || "";
      return (
        p.reference_paiement?.toLowerCase().includes(searchText.toLowerCase()) ||
        tourName.toLowerCase().includes(searchText.toLowerCase()) ||
        p.mode_paiement?.toLowerCase().includes(searchText.toLowerCase())
      );
    });
    setFilteredData(filtered);
  }, [searchText, paiements]);

  const notify = async (nomClient, montant) => {
    try {
      await fetch(`${url}/mail/notify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomClient, montant }),
      });
    } catch (e) { console.error(e); }
  };

  const onSubmit = async (data) => {
    const token = await getAuthToken();
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("id_reservation", data.id_reservation.toString());
      formData.append("reference_paiement", data.reference_paiement);
      formData.append("montant", data.montant);
      formData.append("mode_paiement", data.mode_paiement);

      if (data.file && data.file[0]) {
        formData.append("file", data.file[0]);
      }

      await PaiementApi.addPaiement(formData, token);
      
      const selectedRes = reservations.find(res => res.id_reservation === parseInt(data.id_reservation));
      if (selectedRes) {
        await notify(selectedRes.nom_complet || 'Client', data.montant);
      }

      toast.success("Paiement enregistré avec succès");
      reset();
      setShowForm(false);
      fetchPaiements();
    } catch (err) {
      toast.error(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setUploading(false);
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
          <h2 className="text-2xl font-bold text-foreground">Historique des Paiements</h2>
          <p className="text-sm text-muted-foreground mt-1">Gérez vos règlements et justificatifs</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" /> Nouveau Paiement
        </Button>
      </div>

      <div className="bg-white rounded border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher par référence ou circuit..."
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
                <TableHead className="px-4 py-3 font-medium">Référence</TableHead>
                <TableHead className="px-4 py-3 font-medium">Circuit / Destination</TableHead>
                <TableHead className="px-4 py-3 font-medium">Date</TableHead>
                <TableHead className="px-4 py-3 font-medium">Mode</TableHead>
                <TableHead className="px-4 py-3 font-medium text-right">Montant</TableHead>
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
                    Aucun paiement trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((p) => (
                  <TableRow key={p.id_paiement} className="border-border group">
                    <TableCell className="px-4 py-4 text-left">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-gray-900">{p.reference_paiement}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-left text-sm">
                      {p.reservation?.tour?.nom_tour || p.reservation?.tour_personnalise?.interets || "Circuit Personnalisé"}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-left text-sm text-muted-foreground">
                      {formatDate(p.date_paiement)}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-left">
                      <Badge variant="outline" className="font-normal">{p.mode_paiement}</Badge>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-right font-bold text-primary">
                      {formatCurrency(p.montant)}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuItem onClick={() => toast.info("Détails bientôt disponibles")}>
                            <Eye className="w-4 h-4 mr-2" /> Voir justificatif
                          </DropdownMenuItem>
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

      {/* Payment Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Enregistrer un paiement</DialogTitle>
            <DialogDescription>
              Veuillez remplir les informations concernant votre règlement.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="space-y-1 text-left">
              <label className="text-sm font-medium">Réservation</label>
              <select
                {...register("id_reservation", { valueAsNumber: true })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Sélectionnez une réservation</option>
                {reservations.map((res) => (
                  <option key={res.id_reservation} value={res.id_reservation}>
                    #{res.id_reservation} - {res.tour?.nom_tour || "Personnalisé"}
                  </option>
                ))}
              </select>
              {errors.id_reservation && <p className="text-xs text-destructive">{errors.id_reservation.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Référence"
                placeholder="N° de transaction"
                error={errors.reference_paiement?.message}
                {...register("reference_paiement")}
              />
              <Input
                label="Montant (€)"
                type="number"
                placeholder="0"
                error={errors.montant?.message}
                {...register("montant")}
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="text-sm font-medium">Mode de paiement</label>
              <select
                {...register("mode_paiement")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Choisir un mode</option>
                <option value="Mobile Money">Mobile Money</option>
                <option value="Virement">Virement Bancaire</option>
                <option value="Espèces">Espèces</option>
              </select>
              {errors.mode_paiement && <p className="text-xs text-destructive">{errors.mode_paiement.message}</p>}
            </div>

            <div className="space-y-1 text-left">
              <label className="text-sm font-medium">Justificatif (Image ou PDF)</label>
              <Input type="file" accept="image/*,.pdf" {...register("file")} />
              {selectedFile?.[0] && <p className="text-xs text-primary font-medium">Fichier : {selectedFile[0].name}</p>}
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Annuler</Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Enregistrer le paiement
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
