import {
  Eye,
  Download,
  Search,
  Filter,
  RefreshCw,
  Calendar as CalendarIcon,
  X,
  MoreVertical,
  CreditCard,
} from "lucide-react";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { PaiementApi } from "../../../../lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

import { getImageUrl } from "../../../utils/imageUrl";

export default function Paiements() {
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
      toast.error("Impossible de charger les paiements");
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
      result = result.filter((p) => p.reservation?.statut === filters.statut);
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dayjs(dateString).format("DD/MM/YYYY HH:mm");
  };

  const getStatusBadge = (status) => {
    const s = status?.toUpperCase();
    if (s === "CONFIRMER") return <Badge variant="outline" className="bg-primary text-primary-foreground border-none">Confirmé</Badge>;
    if (s === "ANNULE" || s === "ANNULER") return <Badge variant="destructive">Annulé</Badge>;
    return <Badge variant="secondary">En attente</Badge>;
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
          <h2 className="text-2xl font-bold text-foreground">Paiements</h2>
          <p className="text-sm text-muted-foreground mt-1">Suivi des règlements clients</p>
        </div>
        <Button variant="outline" onClick={fetchPaiements} disabled={loading} className="gap-2">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          Actualiser
        </Button>
      </div>

      <div className="bg-white rounded border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher..."
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
            <Filter className="w-4 h-4" /> Filtres
          </Button>
        </div>

        {isFilterVisible && (
          <div className="p-4 bg-muted/20 border-b border-border space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={filters.statut} onValueChange={(v) => setFilters(f => ({...f, statut: v}))}>
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                  <SelectItem value="CONFIRMER">Confirmé</SelectItem>
                  <SelectItem value="ANNULE">Annulé</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("justify-start text-left font-normal", !filters.date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.date ? dayjs(filters.date).format("DD/MM/YYYY") : "Choisir une date"}
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
                  <SelectValue placeholder="Type de tour" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="personnalise">Personnalisé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearFilters}>Effacer les filtres</Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-3 font-medium">Référence</TableHead>
                <TableHead className="px-4 py-3 font-medium">Client</TableHead>
                <TableHead className="px-4 py-3 font-medium">Circuit</TableHead>
                <TableHead className="px-4 py-3 font-medium text-right">Montant</TableHead>
                <TableHead className="px-4 py-3 font-medium text-center">Statut</TableHead>
                <TableHead className="w-12 px-4 py-3 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({length: 5}).map((_, i) => (
                  <TableRow key={i} className="border-none">
                    <TableCell colSpan={6} className="h-16 bg-muted/5 animate-pulse" />
                  </TableRow>
                ))
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">Aucun paiement</TableCell>
                </TableRow>
              ) : (
                filteredData.map((p) => (
                  <TableRow key={p.id_paiement} className="border-border group">
                    <TableCell className="px-4 py-3 font-medium">#{p.id_paiement}</TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="text-sm font-medium">{p.reservation?.client?.prenom} {p.reservation?.client?.nom}</div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                      {p.reservation?.tour?.nom_tour || "Tour Personnalisé"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right font-medium text-primary">
                      {parseFloat(p.montant).toLocaleString()} Ar
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      {getStatusBadge(p.reservation?.statut)}
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
                            Détails
                          </DropdownMenuItem>
                          {p.fichier_justificatif_path && (
                            <DropdownMenuItem onClick={() => handleDownload(p.fichier_justificatif_path)}>
                              Justificatif
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          {selectedRecord && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl font-bold">Détails du paiement</DialogTitle>
                  {getStatusBadge(selectedRecord.reservation?.statut)}
                </div>
                <DialogDescription>Réf: {selectedRecord.reference_paiement}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground">Paiement</h4>
                    <div className="text-sm">
                      <p className="text-2xl font-bold text-primary">{parseFloat(selectedRecord.montant).toLocaleString()} Ar</p>
                      <p className="text-muted-foreground">Via {selectedRecord.mode_paiement}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground">Client</h4>
                    <div className="text-sm">
                      <p className="font-medium">{selectedRecord.reservation?.client?.prenom} {selectedRecord.reservation?.client?.nom}</p>
                      <p className="text-muted-foreground">{selectedRecord.reservation?.client?.telephone}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-muted-foreground">Circuit lié</h4>
                  <div className="text-sm flex justify-between items-center">
                    <p className="font-medium">{selectedRecord.reservation?.tour?.nom_tour || "Tour Personnalisé"}</p>
                    <p className="text-muted-foreground">Prévu le {dayjs(selectedRecord.reservation?.date_tour_prevue).format("DD/MM/YYYY")}</p>
                  </div>
                </div>

                {selectedRecord.fichier_justificatif_path && (
                  <Button onClick={() => handleDownload(selectedRecord.fichier_justificatif_path)} className="w-full">
                    <Download className="mr-2 h-4 w-4" /> Télécharger le justificatif
                  </Button>
                )}
              </div>

              <div className="flex justify-end">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Fermer</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
