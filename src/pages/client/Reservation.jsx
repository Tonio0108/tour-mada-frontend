import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { reservationAPI } from "../../../lib/api";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
  Mail,
  Phone,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useTranslation, Trans } from 'react-i18next';
import { Button } from "@/components/ui/button";

export const Reservations = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedReservation, setExpandedReservation] = useState(null);

  useEffect(() => {
    const fetchReservations = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }

      try {
        const clientId = user.Clients.id_client;
        const data = await reservationAPI.getClientReservations(clientId);
        setReservations(data);
      } catch (err) {
        setError(err.message);
        console.error("Erreur lors du chargement des réservations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [isAuthenticated, user]);

  const toggleReservationDetails = (reservationId) => {
    setExpandedReservation(expandedReservation === reservationId ? null : reservationId);
  };

  const getStatusIcon = (statut) => {
    switch (statut) {
      case "CONFIRMER":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "EN_ATTENTE":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "ANNULER":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (statut) => {
    switch (statut) {
      case "CONFIRMER":
        return t('reservations.status.confirmed');
      case "EN_ATTENTE":
        return t('reservations.status.pending');
      case "ANNULER":
        return t('reservations.status.cancelled');
      default:
        return statut;
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
      currency: "MGA",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader className="h-8 w-8 animate-spin text-emerald-600" />
            <span className="ml-2 text-gray-600">{t('reservations.loading')}</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <h3 className="text-red-800 font-medium">{t('reservations.error')}</h3>
            </div>
            <p className="text-red-600 mt-2">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {t('reservations.title')}
          </h1>
          <p className="text-gray-600">
            {reservations.length === 0 ? (
              t('reservations.no_reservations')
            ) : (
              <Trans 
                i18nKey="reservations.reservations_count" 
                values={{ count: reservations.length }}
              />
            )}
          </p>
        </div>

        <div className="space-y-4">
          {reservations.map((reservation) => (
            <div
              key={reservation.id_reservation}
              className="bg-white rounded-lg shadow-md p-4"
            >
              {/* En-tête de la réservation */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(reservation.statut)}
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">
                      {reservation.tour?.nom_tour ||
                        reservation.tour_personnalise?.interets ||
                        t('reservations.reservation_card.custom_reservation')}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {formatDate(reservation.date_tour_prevue)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    reservation.statut === "CONFIRMER" ? "bg-green-100 text-green-800" :
                    reservation.statut === "EN_ATTENTE" ? "bg-yellow-100 text-yellow-800" :
                    reservation.statut === "ANNULER" ? "bg-red-100 text-red-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {getStatusText(reservation.statut)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleReservationDetails(reservation.id_reservation)}
                    className="h-8 w-8"
                    aria-label={
                      expandedReservation === reservation.id_reservation 
                        ? t('reservations.reservation_card.collapse_details')
                        : t('reservations.reservation_card.expand_details')
                    }
                  >
                    {expandedReservation === reservation.id_reservation ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Informations basiques */}
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-gray-600">
                <div className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  <span>{reservation.nombre_pers} {t('reservations.reservation_card.persons')}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{reservation.nbre_jours} {t('reservations.reservation_card.days')}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-3 w-3 mr-1" />
                  <span>{formatCurrency(reservation.montant_total)}</span>
                </div>
                <div className="flex items-center">
                  <User className="h-3 w-3 mr-1" />
                  <span className="truncate">{reservation.nom_complet}</span>
                </div>
              </div>

              {/* Détails expandables */}
              {expandedReservation === reservation.id_reservation && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    {/* Informations de contact */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700">
                        {t('reservations.details.contact')}
                      </h4>
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>{reservation.email}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>{reservation.num_tel}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="truncate">{reservation.adresse}</span>
                      </div>
                    </div>

                    {/* Détails de répartition */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700">
                        {t('reservations.details.details')}
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-gray-600">
                        <span>{t('reservations.details.adults')}: {reservation.nombre_adulte || 0}</span>
                        <span>{t('reservations.details.youth')}: {reservation.nombre_jeune || 0}</span>
                        <span>{t('reservations.details.children')}: {reservation.nombre_enfant || 0}</span>
                        <span>{t('reservations.details.budget')}: {formatCurrency(reservation.budget_estime)}</span>
                        <span>{t('reservations.details.men')}: {reservation.nombre_homme || 0}</span>
                        <span>{t('reservations.details.women')}: {reservation.nombre_femme || 0}</span>
                        <span>{t('reservations.details.oldest_age')}: {reservation.age_plus_age || 0}</span>
                        <span>{t('reservations.details.youngest_age')}: {reservation.age_moins_age || 0}</span>
                      </div>
                    </div>

                    {/* Tour details */}
                    {reservation.tour && (
                      <div className="space-y-1">
                        <h4 className="font-medium text-gray-700">
                          {t('reservations.details.tour')}
                        </h4>
                        <p className="text-sm text-gray-600">{reservation.tour.description?.substring(0, 100)}...</p>
                      </div>
                    )}

                    {reservation.tour_personnalise && (
                      <div className="space-y-1">
                        <h4 className="font-medium text-gray-700">
                          {t('reservations.details.custom')}
                        </h4>
                        <p className="text-sm text-gray-600">{reservation.tour_personnalise.interets}</p>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      {t('reservations.details.reserved_on')} {formatDate(reservation.createdAt)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex space-x-2">
                    {reservation.statut === "EN_ATTENTE" && (
                      <Button variant="destructive" size="sm" className="h-8 text-xs">
                        {t('reservations.actions.cancel')}
                      </Button>
                    )}
                    <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700">
                      {t('reservations.actions.contact')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {reservations.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {t('reservations.empty_state.title')}
            </h3>
            <p className="text-gray-500 mb-4">
              {t('reservations.empty_state.description')}
            </p>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <a href="/tours">
                {t('reservations.empty_state.discover_tours')}
              </a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

