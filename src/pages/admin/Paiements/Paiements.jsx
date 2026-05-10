import { PaiementApi, MailApi } from "../../../../lib/api";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw,Search,Filter,MoreVertical,Download,CalendarIcon } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
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
import TableSkeleton from "@/components/ui/TableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

import { getImageUrl } from "../../../utils/imageUrl";

export default function Paiements() {
  const { t } = useTranslation();
  const [paiementsData, setPaiementsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    statut: "all",
    modePaiement: "all",
    date: null,
    minMontant: "",
    maxMontant: "",
    typeTour: "all",
  });

  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState(""); // "VALIDE" or "REJETE"
  const [commentaire, setCommentaire] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPaiements();
  }, []);

  const fetchPaiements = async () => {
    try {
      setLoading(true);
      const data = await PaiementApi.getAllPaiement();
      setPaiementsData(data);
      setFilteredData(data);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(t('admin_payments.toast.load_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = paiementsData;

    if (searchText) {
      const search = searchText.toLowerCase();
      result = result.filter(
        (p) =>
          p.reference_paiement?.toLowerCase().includes(search) ||
          p.mode_paiement?.toLowerCase().includes(search) ||
          p.reservation?.client?.nom?.toLowerCase().includes(search) ||
          p.reservation?.client?.prenom?.toLowerCase().includes(search) ||
          p.reservation?.tour?.nom_tour?.toLowerCase().includes(search)
      );
    }

    if (filters.statut !== "all") {
      result = result.filter((p) => p.statut === filters.statut);
    }

    if (filters.modePaiement !== "all") {
      result = result.filter((p) => p.mode_paiement === filters.modePaiement);
    }

    if (filters.date) {
      result = result.filter((p) => 
        dayjs(p.date_paiement).isSame(dayjs(filters.date), 'day')
      );
    }

    if (filters.minMontant) {
      result = result.filter((p) => parseFloat(p.montant) >= parseFloat(filters.minMontant));
    }
    if (filters.maxMontant) {
      result = result.filter((p) => parseFloat(p.montant) <= parseFloat(filters.maxMontant));
    }

    if (filters.typeTour !== "all") {
      result = result.filter((p) => {
        if (filters.typeTour === "standard") return !!p.reservation?.tour;
        if (filters.typeTour === "personnalise") return !!p.reservation?.tour_personnalise;
        return true;
      });
    }

    setFilteredData(result);
  }, [searchText, filters, paiementsData]);

  const showActionModal = (type, record) => {
    setSelectedRecord(record);
    setActionType(type);
    setCommentaire("");
    setIsActionModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedRecord) return;
    setActionLoading(true);

    try {
      await PaiementApi.updatePaiementStatus(selectedRecord.id_paiement, {
        statut: actionType,
      });

      const nomClient = `${selectedRecord.reservation?.client?.prenom} ${selectedRecord.reservation?.client?.nom}`;
      const email = selectedRecord.reservation?.client?.utilisateur?.email || selectedRecord.reservation?.email;
      const montant = parseFloat(selectedRecord.montant).toLocaleString();

      try {
        if (actionType === "VALIDE") {
          await MailApi.confirmPayment({
            nomClient,
            email,
            montant,
            message: commentaire.trim()
          });
        } else {
          await MailApi.refusePayment({
            nomClient,
            email,
            montant,
            message: commentaire.trim()
          });
        }
      } catch (e) {
        console.error("Mail error:", e);
      }

      toast.success(t('admin_payments.toast.update_success'));
      fetchPaiements();
      setIsActionModalOpen(false);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(t('admin_payments.toast.update_error'));
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dayjs(dateString).format("DD/MM/YYYY HH:mm");
  };

  const getStatusBadge = (status) => {
    const s = status?.toUpperCase();
    if (s === "VALIDE") return <Badge variant="outline" className="bg-primary text-primary-foreground border-none">{t('admin_common.validate')}</Badge>;
    if (s === "REJETE") return <Badge variant="destructive">{t('admin_common.reject')}</Badge>;
    return <Badge variant="secondary">{t('reservations.status.pending')}</Badge>;
  };

  const clearFilters = () => {
    setFilters({
      statut: "all",
      modePaiement: "all",
      date: null,
      minMontant: "",
      maxMontant: "",
      typeTour: "all",
    });
    setSearchText("");
  };

  const handleDownload = (filePath) => {
    const url = getImageUrl(filePath);
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t('admin_payments.title')}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t('admin_payments.subtitle')}</p>
        </div>
        <Button variant="outline" onClick={fetchPaiements} disabled={loading} className="gap-2">
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
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button 
            variant="outline"
            onClick={() => setIsFilterVisible(!isFilterVisible)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" /> {t('admin_common.filters')}
          </Button>
        </div>

        {isFilterVisible && (
          <div className="p-4 bg-muted/20 border-b border-border space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={filters.statut} onValueChange={(v) => setFilters(f => ({...f, statut: v}))}>
                <SelectTrigger>
                  <SelectValue placeholder={t('admin_common.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('admin_common.all_status')}</SelectItem>
                  <SelectItem value="EN_ATTENTE">{t('reservations.status.pending')}</SelectItem>
                  <SelectItem value="VALIDE">{t('admin_common.validate')}</SelectItem>
                  <SelectItem value="REJETE">{t('admin_common.reject')}</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("justify-start text-left font-normal", !filters.date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.date ? dayjs(filters.date).format("DD/MM/YYYY") : t('admin_payments.filters.date_placeholder')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.date}
                    onSelect={(d) => setFilters(f => ({...f, date: d}))}
                  />
                </PopoverContent>
              </Popover>

              <Select value={filters.typeTour} onValueChange={(v) => setFilters(f => ({...f, typeTour: v}))}>
                <SelectTrigger>
                  <SelectValue placeholder={t('admin_payments.filters.type_tour')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('admin_payments.filters.all_types')}</SelectItem>
                  <SelectItem value="standard">{t('admin_payments.filters.standard')}</SelectItem>
                  <SelectItem value="personnalise">{t('admin_payments.filters.custom')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearFilters}>{t('admin_common.clear_filters')}</Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-3 font-medium">{t('admin_payments.table.reference')}</TableHead>
                <TableHead className="px-4 py-3 font-medium">{t('admin_common.client')}</TableHead>
                <TableHead className="px-4 py-3 font-medium">{t('admin_payments.table.circuit')}</TableHead>
                <TableHead className="px-4 py-3 font-medium text-right">{t('admin_common.amount')}</TableHead>
                <TableHead className="px-4 py-3 font-medium text-center">{t('admin_common.status')}</TableHead>
                <TableHead className="w-12 px-4 py-3 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-none">
                    <TableCell colSpan={6} className="p-0">
                      <div className="px-4 py-4">
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">{t('admin_payments.table.no_payments')}</TableCell>
                </TableRow>
              ) : (
                filteredData.map((p) => (
                  <TableRow key={p.id_paiement} className="border-border group">
                    <TableCell className="px-4 py-3 font-medium">#{p.id_paiement}</TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="text-sm font-medium">{p.reservation?.client?.prenom} {p.reservation?.client?.nom}</div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                      {p.reservation?.tour?.nom_tour || t('tour.custom_tour')}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right font-medium text-primary">
                      {parseFloat(p.montant).toLocaleString()} Ar
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      {getStatusBadge(p.statut)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setSelectedRecord(p); setIsModalOpen(true); }}>
                            {t('admin_common.details')}
                          </DropdownMenuItem>
                          {p.fichier_justificatif_path && (
                            <DropdownMenuItem onClick={() => handleDownload(p.fichier_justificatif_path)}>
                              {t('payments.form.proof')}
                            </DropdownMenuItem>
                          )}
                          {(!p.statut || p.statut === "EN_ATTENTE") && (
                            <>
                              <DropdownMenuItem onClick={() => showActionModal("VALIDE", p)} className="text-primary font-bold">
                                {t('admin_common.validate')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => showActionModal("REJETE", p)} className="text-destructive font-bold">
                                {t('admin_common.reject')}
                              </DropdownMenuItem>
                            </>
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          {selectedRecord && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl font-bold">{t('admin_payments.details.title')}</DialogTitle>
                  {getStatusBadge(selectedRecord.statut)}
                </div>
                <DialogDescription>{t('admin_payments.table.reference')}: {selectedRecord.reference_paiement}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground">{t('admin_payments.details.payment_info')}</h4>
                    <div className="text-sm">
                      <p className="text-2xl font-bold text-primary">{parseFloat(selectedRecord.montant).toLocaleString()} Ar</p>
                      <p className="text-muted-foreground">{t('navbar.payments')} {selectedRecord.mode_paiement}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground">{t('admin_payments.details.client_info')}</h4>
                    <div className="text-sm">
                      <p className="font-medium">{selectedRecord.reservation?.client?.prenom} {selectedRecord.reservation?.client?.nom}</p>
                      <p className="text-muted-foreground">{selectedRecord.reservation?.client?.telephone}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-muted-foreground">{t('admin_payments.details.linked_tour')}</h4>
                  <div className="text-sm flex justify-between items-center">
                    <p className="font-medium">{selectedRecord.reservation?.tour?.nom_tour || t('tour.custom_tour')}</p>
                    <p className="text-muted-foreground">{t('admin_payments.details.planned_for')} {dayjs(selectedRecord.reservation?.date_tour_prevue).format("DD/MM/YYYY")}</p>
                  </div>
                </div>

                {selectedRecord.fichier_justificatif_path && (
                  <Button onClick={() => handleDownload(selectedRecord.fichier_justificatif_path)} className="w-full">
                    <Download className="mr-2 h-4 w-4" /> {t('admin_payments.details.download_proof')}
                  </Button>
                )}
              </div>

              <DialogFooter className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>{t('admin_common.close')}</Button>
                {(!selectedRecord.statut || selectedRecord.statut === "EN_ATTENTE") && (
                  <>
                    <Button variant="destructive" onClick={() => { setIsModalOpen(false); showActionModal("REJETE", selectedRecord); }}>
                      {t('admin_common.reject')}
                    </Button>
                    <Button onClick={() => { setIsModalOpen(false); showActionModal("VALIDE", selectedRecord); }}>
                      {t('admin_common.validate')}
                    </Button>
                  </>
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
              {actionType === 'VALIDE' ? t('admin_payments.actions.validate_title') : t('admin_payments.actions.reject_title')}
            </DialogTitle>
            <DialogDescription>
              {t('admin_common.client')}: {selectedRecord?.reservation?.client?.prenom} {selectedRecord?.reservation?.client?.nom}
              <br />
              {t('admin_common.amount')}: {parseFloat(selectedRecord?.montant || 0).toLocaleString()} Ar
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">{t('admin_common.message_to_client')}</label>
              <span className="text-[10px] text-muted-foreground ml-2">({t('admin_common.mail_included')})</span>
              <Textarea
                placeholder={t('admin_common.message_placeholder')}
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsActionModalOpen(false)} disabled={actionLoading}>{t('admin_common.cancel')}</Button>
            <Button 
              onClick={handleUpdateStatus} 
              disabled={actionLoading || (actionType === "REJETE" && !commentaire.trim())}
              variant={actionType === 'REJETE' ? "destructive" : "default"}
            >
              {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
              {actionType === 'VALIDE' ? t('admin_common.validate') : t('admin_common.reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
