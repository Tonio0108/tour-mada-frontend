import { useState, useEffect, useCallback } from "react";
import { Eye, Plus, Search, Filter, X, Trash2, RefreshCw, MoreVertical, MapPin, Clock, DollarSign, AlertCircle } from "lucide-react";
import { Link } from "react-router";
import { Tours as ToursService } from "../../../../lib/api";
import { Input } from "@/components/ui/Input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import TableSkeleton from "@/components/ui/TableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

import { getImageUrl } from "../../../utils/imageUrl";

export default function Tours() {
  const [dataSource, setDataSource] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    prixMin: "",
    prixMax: "",
    dureeMin: "",
    dureeMax: ""
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // Chargement des données
  const fetchTours = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ToursService.getAllTourStandards();
      setDataSource(data);
      setFilteredData(data);
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du chargement des tours');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  // Filtrage des données
  useEffect(() => {
    const filtered = dataSource.filter(item => {
      if (searchText && 
          !item.nom_tour.toLowerCase().includes(searchText.toLowerCase()) &&
          !item.id_tour.toString().includes(searchText)) {
        return false;
      }
      
      if (filters.prixMin && item.prix_par_pers < parseInt(filters.prixMin)) return false;
      if (filters.prixMax && item.prix_par_pers > parseInt(filters.prixMax)) return false;
      if (filters.dureeMin && item.duree_jours < parseInt(filters.dureeMin)) return false;
      if (filters.dureeMax && item.duree_jours > parseInt(filters.dureeMax)) return false;
      
      return true;
    });
    setFilteredData(filtered);
  }, [searchText, filters, dataSource]);

  const toggleSelectAll = () => {
    if (selectedRowKeys.length === filteredData.length) {
      setSelectedRowKeys([]);
    } else {
      setSelectedRowKeys(filteredData.map(item => item.id_tour));
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedRowKeys(prev => 
      prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]
    );
  };

  const handleDeleteMultiple = async () => {
    setDeleteLoading(true);
    try {
      await Promise.all(selectedRowKeys.map(id => ToursService.deleteTourStandards(id)));
      toast.success(`${selectedRowKeys.length} tour(s) supprimé(s)`);
      fetchTours();
      setSelectedRowKeys([]);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleteLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchText("");
    setFilters({ prixMin: "", prixMax: "", dureeMin: "", dureeMax: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Catalogue des Tours</h2>
          <p className="text-sm text-muted-foreground mt-1">Gérez vos offres de circuits standards</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/tours/propositions">Propositions</Link>
          </Button>
          <Button asChild>
            <Link to="/admin/tours/new"><Plus className="w-4 h-4 mr-2" /> Nouveau Tour</Link>
          </Button>
        </div>
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
          {selectedRowKeys.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={() => setIsDeleteModalOpen(true)}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" /> Supprimer ({selectedRowKeys.length})
            </Button>
          )}
        </div>

        {isFilterVisible && (
          <div className="p-4  border-b border-border space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input placeholder="Prix Min" type="number" value={filters.prixMin} onChange={(e) => setFilters(f => ({...f, prixMin: e.target.value}))} />
              <Input placeholder="Prix Max" type="number" value={filters.prixMax} onChange={(e) => setFilters(f => ({...f, prixMax: e.target.value}))} />
              <Input placeholder="Durée Min" type="number" value={filters.dureeMin} onChange={(e) => setFilters(f => ({...f, dureeMin: e.target.value}))} />
              <Input placeholder="Durée Max" type="number" value={filters.dureeMax} onChange={(e) => setFilters(f => ({...f, dureeMax: e.target.value}))} />
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
                <TableHead className="w-12 px-4 py-3">
                  <Checkbox checked={selectedRowKeys.length === filteredData.length && filteredData.length > 0} onCheckedChange={toggleSelectAll} />
                </TableHead>
                <TableHead className="px-4 py-3 font-medium">Circuit</TableHead>
                <TableHead className="px-4 py-3 font-medium text-right">Prix</TableHead>
                <TableHead className="px-4 py-3 font-medium text-center">Durée</TableHead>
                <TableHead className="w-12 px-4 py-3 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-none">
                    <TableCell colSpan={5} className="p-0">
                      <div className="px-4 py-4">
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">Aucun circuit</TableCell>
                </TableRow>
              ) : (
                filteredData.map((tour) => (
                  <TableRow key={tour.id_tour} className="border-border group">
                    <TableCell className="px-4 py-3">
                      <Checkbox checked={selectedRowKeys.includes(tour.id_tour)} onCheckedChange={() => toggleSelectRow(tour.id_tour)} />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                          {(() => {
                            const firstImage = tour.photos?.find(p => p.type === 'image' || !p.url.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i));
                            if (firstImage) {
                              return <img src={getImageUrl(firstImage.url)} className="w-full h-full object-cover" alt="" />;
                            }
                            return <MapPin className="w-4 h-4 text-muted-foreground opacity-50" />;
                          })()}
                        </div>
                        <span className="font-medium">{tour.nom_tour}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right font-medium text-primary">
                      {parseInt(tour.prix_par_pers)?.toLocaleString()} €
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <Badge variant="secondary">{tour.duree_jours}j</Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/tours/${tour.id_tour}/details`}>Détails</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/tours/${tour.id_tour}/edit`}>Modifier</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setSelectedRowKeys([tour.id_tour]); setIsDeleteModalOpen(true); }} className="text-destructive">
                            Supprimer
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

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer les tours ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Vous allez supprimer {selectedRowKeys.length} tour(s).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDeleteMultiple} disabled={deleteLoading}>
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
