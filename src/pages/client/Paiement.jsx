import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import {Input} from "./../../../components/ui/Input";
import {Button} from "./../../../components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getAuthToken, PaiementApi, reservationAPI } from "./../../../lib/api";
import { useAuth } from "./../../hooks/useAuth";
import { useTranslation, Trans } from 'react-i18next';

// Schéma de validation avec Zod
const paiementSchema = z.object({
  id_reservation: z.number().min(1, "La réservation est requise"),
  reference_paiement: z.string().min(1, "La référence est requise"),
  montant: z.string().min(1, "Le montant est requis"),
  mode_paiement: z.string().min(1, "Le mode de paiement est requis"),
  file: z.any(),
});

export const Paiement = () => {
  const { t } = useTranslation();
  const [paiements, setPaiements] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reservationsLoading, setReservationsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false); // Caché par défaut
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  // Configuration du formulaire avec react-hook-form et zod
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

  useEffect(() => {
    if (user?.Clients.id_client) {
      fetchPaiements();
      fetchReservations();
    }
  }, [user]);

  const fetchPaiements = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.Clients.id_client) {
        throw new Error("Utilisateur non connecté");
      }

      const data = await PaiementApi.getClientPaiements(user.Clients.id_client);

      setPaiements(data);
    } catch (err) {
      setError(err.message);
      console.error("Erreur lors du chargement des paiements:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      setReservationsLoading(true);
      if (!user?.Clients.id_client) {
        throw new Error("Impossible de charger les clients");
      }

      const data = await reservationAPI.getClientReservations(
        user.Clients.id_client
      );

      const filteredReservations = data.filter((reservation) => {
        return reservation.statut === "CONFIRMER";
      });

      setReservations(filteredReservations);
    } catch (err) {
      console.error("Erreur lors du chargement des réservations:", err);
    } finally {
      setReservationsLoading(false);
    }
  };

  const toggleForm = () => {
    setShowForm(!showForm);
    if (!showForm) {
      // Si on affiche le formulaire, charger les réservations
      fetchReservations();
    } else {
      // Si on cache le formulaire, nettoyer les erreurs
      setFormError(null);
      setFormSuccess(null);
      reset();
    }
  };
  const url = import.meta.env.VITE_API_URL;

  const notify = async (nomClient, montant) => {
    const response = await fetch(`${url}/mail/notify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nomClient: nomClient,
        montant: montant,
      }),
    });
    const result = await response.json();
    console.log(result);  
  };

  const onSubmit = async (data) => {
    const token = await getAuthToken()
    try {
      setUploading(true);
      setFormError(null);
      setFormSuccess(null);

      const formData = new FormData();
      formData.append("id_reservation", data.id_reservation.toString());
      formData.append("reference_paiement", data.reference_paiement);
      formData.append("montant", data.montant);
      formData.append("mode_paiement", data.mode_paiement);

      if (data.file && data.file[0]) {
        formData.append("file", data.file[0]);
      }

      await PaiementApi.addPaiement(formData, token);
      
      // Récupérer les informations pour la notification
      const selectedReservation = reservations.find(
        res => res.id_reservation === parseInt(data.id_reservation)
      );
      
      if (selectedReservation) {
        const nomClient = selectedReservation.nom_complet || 'Client';       
        // Appeler notify avec les paramètres requis
        await notify(nomClient, data.montant);
      }

      setFormSuccess(t('payments.form.success'));
      reset();

      // Rafraîchir la liste des paiements immédiatement
      await fetchPaiements();

      // Cacher le formulaire après un court délai
      setTimeout(() => {
        setShowForm(false);
        setFormSuccess(null);
      }, 1500);
    } catch (err) {
      setFormError(
        err.message || t('payments.form.error')
      );
      console.error("Erreur lors de l'ajout du paiement:", err);
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return (
      new Intl.NumberFormat("fr-FR", {
        minimumFractionDigits: 0,
      }).format(Number(amount)) + " Ar"
    );
  };

  const getReservationDisplayName = (reservation) => {
    if (reservation.tour?.nom_tour) {
      return reservation.tour.nom_tour;
    } else if (reservation.tour_personnalise?.interets) {
      return reservation.tour_personnalise.interets;
    }
    return `Réservation #${reservation.id_reservation}`;
  };

  const filteredPaiements = paiements.filter((paiement) => {
    const matchesSearch =
      paiement.reservation?.nom_complet
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      paiement.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (paiement.reservation?.tour?.nom_tour || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            <span className="ml-3 text-gray-600">
              {t('payments.loading')}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 pb-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <div className="flex">
              <XCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">{t('payments.error')}</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <Button
                  variant="ghost"
                  onClick={fetchPaiements}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  {t('payments.retry')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header avec bouton d'ajout */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('payments.title')}
            </h1>
            <p className="text-gray-600">
              {t('payments.subtitle')}
            </p>
          </div>

          <Button
            onClick={toggleForm}
            variant={showForm ? "destructive" : "default"}
            className="font-medium"
          >
            {showForm ? (
              <>
                <X className="h-5 w-5 mr-2" />
                {t('payments.cancel_payment')}
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 mr-2" />
                {t('payments.add_payment')}
              </>
            )}
          </Button>
        </div>

        {showForm && (
          /* Formulaire d'ajout de paiement */
          <div className="bg-white rounded shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {t('payments.form.title')}
            </h2>

            {formError && (
              <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
                <div className="flex">
                  <XCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-700">{formError}</p>
                  </div>
                </div>
              </div>
            )}

            {formSuccess && (
              <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
                <div className="flex">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-700">{formSuccess}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('payments.form.reservation')}
                  </label>
                  {reservationsLoading ? (
                    <div className="flex items-center justify-center h-10 border border-gray-300 rounded">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                      <span className="ml-2 text-gray-600">{t('payments.form.loading_reservations')}</span>
                    </div>
                  ) : (
                    <select
                      {...register("id_reservation", { valueAsNumber: true })}
                      className="flex h-10 w-full rounded border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                    >
                      <option value="">{t('payments.form.reservation_placeholder')}</option>
                      {reservations.map((reservation) => (
                        <option
                          key={reservation.id_reservation}
                          value={reservation.id_reservation}
                        >
                          {reservation.id_reservation}-{" "}
                          {getReservationDisplayName(reservation)} -{" "}
                          {reservation.nom_complet}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.id_reservation && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.id_reservation.message}
                    </p>
                  )}
                </div>

                <div>
                  <Input
                    id="reference_paiement"
                    type="text"
                    label={t('payments.form.reference')}
                    placeholder={t('payments.form.reference_placeholder')}
                    value={watch("reference_paiement") || ""}
                    onChange={(e) =>
                      setValue("reference_paiement", e.target.value)
                    }
                    error={errors.reference_paiement?.message}
                  />
                </div>

                <div>
                  <Input
                    id="montant"
                    type="text"
                    label={t('payments.form.amount')}
                    placeholder={t('payments.form.amount_placeholder')}
                    value={watch("montant") || ""}
                    onChange={(e) => setValue("montant", e.target.value)}
                    error={errors.montant?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('payments.form.payment_method')}
                  </label>
                  <select
                    {...register("mode_paiement")}
                    className="flex h-10 w-full rounded border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                  >
                    <option value="">{t('payments.form.method_placeholder')}</option>
                    <option value="Carte Bancaire">{t('payments.methods.credit_card')}</option>
                    <option value="Virement">{t('payments.methods.transfer')}</option>
                    <option value="Mobile Money">{t('payments.methods.mobile_money')}</option>
                    <option value="Espèces">{t('payments.methods.cash')}</option>
                  </select>
                  {errors.mode_paiement && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.mode_paiement.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('payments.form.proof')}
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded">
                    <div className="space-y-1 text-center">
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500"
                        >
                          <span>{t('payments.form.upload_text')}</span>
                          <input
                            id="file-upload"
                            type="file"
                            {...register("file")}
                            className="sr-only"
                            accept=".jpg,.jpeg,.png,.pdf"
                          />
                        </label>
                        <p className="pl-1">{t('payments.form.drag_drop')}</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {t('payments.form.file_types')}
                      </p>
                      {selectedFile && selectedFile[0] && (
                        <p className="text-sm text-gray-900 mt-2">
                          {t('payments.form.file_selected')} {selectedFile[0].name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={toggleForm}
                  className="mr-3"
                >
                  {t('payments.form.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={uploading || reservationsLoading}
                  className="flex items-center"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('payments.form.uploading')}
                    </>
                  ) : (
                    t('payments.form.submit')
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {!showForm && (
          /* Liste des paiements */
          <>
            {/* Filters */}
            <div className="bg-white rounded shadow mb-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  id="search"
                  type="text"
                  placeholder={t('payments.search.placeholder')}
                  icon={Search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('payments.table.reference')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('payments.table.reservation')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('payments.table.amount')}
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('payments.table.method')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPaiements.map((paiement) => (
                      <tr
                        key={paiement.id_paiement}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {paiement.reference_paiement}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(paiement.date_paiement)}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {paiement.reservation?.nom_complet || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {paiement.reservation?.tour?.nom_tour ||
                              paiement.reservation?.tour_personnalise
                                ?.interets ||
                              t('payments.table.tour_not_specified')}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(paiement.montant)}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {paiement.mode_paiement}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredPaiements.length === 0 && !loading && (
                <div className="text-center py-12">
                  <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    {t('payments.empty_state.title')}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm
                      ? t('payments.empty_state.description')
                      : t('payments.empty_state.no_payments')}
                  </p>
                  {!searchTerm && (
                    <Button
                      onClick={() => setShowForm(true)}
                      className="mt-4 flex items-center mx-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t('payments.empty_state.first_payment')}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

