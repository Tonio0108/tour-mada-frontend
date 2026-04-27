import React, { useEffect, useState, useCallback } from "react";
import {
  Eye,
  Search,
  CheckCircle,
  Plus,
  MoreVertical,
  FileText,
  Loader
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

export const Paiement = () => {
  const { t } = useTranslation();

  const paiementSchema = z.object({
    id_reservation: z.number().min(1, t('reservation.people_distribution.sum_error').split('(')[0]),
    reference_paiement: z.string().min(1, t('client_payments.form.reference_label')),
    montant: z.string().min(1, t('client_payments.form.amount_label')),
    mode_paiement: z.string().min(1, t('client_payments.form.mode_label')),
    file: z.any(),
  });

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
      toast.error(t('client_payments.toast.load_error'));
    } finally {
      setLoading(false);
    }
  }, [user, t]);

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
        await notify(selectedRes.nom_complet || t('navbar.user'), data.montant);
      }

      toast.success(t('client_payments.toast.save_success'));
      reset();
      setShowForm(false);
      fetchPaiements();
    } catch (err) {
      toast.error(err.message || t('client_payments.toast.save_error'));
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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
          <h2 className="text-2xl font-bold text-foreground">{t('client_payments.title')}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t('client_payments.subtitle')}</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" /> {t('client_payments.new_payment')}
        </Button>
      </div>

      <div className="bg-white rounded border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={t('client_common.search_placeholder')}
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
                <TableHead className="px-4 py-3 font-medium">{t('client_payments.table.reference')}</TableHead>
                <TableHead className="px-4 py-3 font-medium">{t('client_payments.table.circuit_destination')}</TableHead>
                <TableHead className="px-4 py-3 font-medium">{t('client_payments.table.date')}</TableHead>
                <TableHead className="px-4 py-3 font-medium">{t('client_payments.table.mode')}</TableHead>
                <TableHead className="px-4 py-3 font-medium text-right">{t('client_payments.table.amount')}</TableHead>
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
                    {t('client_payments.no_payments')}
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
                      {p.reservation?.tour?.nom_tour || p.reservation?.tour_personnalise?.interets || t('tour.custom_tour')}
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
                           <DropdownMenuItem onClick={() => toast.info(t('client_payments.toast.details_soon'))}>
                            <Eye className="w-4 h-4 mr-2" /> {t('payments.form.proof')}
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
            <DialogTitle>{t('client_payments.form.title')}</DialogTitle>
            <DialogDescription>
              {t('client_payments.form.subtitle')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="space-y-1 text-left">
              <label className="text-sm font-medium">{t('client_payments.form.reservation')}</label>
              <select
                {...register("id_reservation", { valueAsNumber: true })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">{t('client_payments.form.select_reservation')}</option>
                {reservations.map((res) => (
                  <option key={res.id_reservation} value={res.id_reservation}>
                    #{res.id_reservation} - {res.tour?.nom_tour || t('tour.custom_tour')}
                  </option>
                ))}
              </select>
              {errors.id_reservation && <p className="text-xs text-destructive">{errors.id_reservation.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('client_payments.form.reference_label')}
                placeholder={t('client_payments.form.reference_placeholder')}
                error={errors.reference_paiement?.message}
                {...register("reference_paiement")}
              />
              <Input
                label={t('client_payments.form.amount_label')}
                type="number"
                placeholder="0"
                error={errors.montant?.message}
                {...register("montant")}
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="text-sm font-medium">{t('client_payments.form.mode_label')}</label>
              <select
                {...register("mode_paiement")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">{t('client_payments.form.select_mode')}</option>
                <option value="Mobile Money">{t('payments.methods.mobile_money')}</option>
                <option value="Virement">{t('payments.methods.transfer')}</option>
                <option value="Espèces">{t('payments.methods.cash')}</option>
              </select>
              {errors.mode_paiement && <p className="text-xs text-destructive">{errors.mode_paiement.message}</p>}
            </div>

            <div className="space-y-1 text-left">
              <label className="text-sm font-medium">{t('client_payments.form.proof_label')}</label>
              <Input type="file" accept="image/*,.pdf" {...register("file")} />
              {selectedFile?.[0] && <p className="text-xs text-primary font-medium">{t('client_payments.form.file_selected', { name: selectedFile[0].name })}</p>}
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>{t('admin_common.cancel')}</Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                {t('client_payments.form.submit')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
