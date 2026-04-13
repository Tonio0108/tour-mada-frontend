import { Routes, Route, Navigate } from "react-router";
import ClientTours from "../pages/client/Tours.jsx";
import HomePage from "../pages/client/HomePage.jsx";
import TourDetails from "./../pages/client/TourDetails";
import { Reservations } from "../pages/client/Reservation.jsx";
import AdminLayout from "../pages/admin/AdminLayout.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import Tours from "../pages/admin/Tours/Tours.jsx";
import NewTour from "../pages/admin/Tours/NewTour.jsx";
import DetailTours from "../pages/admin/Tours/DetailTours.jsx";
import { WebsiteLayout } from "../pages/client/WebsiteLayout.jsx";
import Login from "../pages/Auth/Login.jsx";
import Register from "../pages/Auth/Register.jsx";
import UpdateTour from "../pages/admin/Tours/UpdateTour.jsx";
import Paiements from "../pages/admin/Paiements/Paiements.jsx";
import Propositions from "../pages/admin/Tours/Propositions.jsx";
import AdminRoute from "./AdminRoute.jsx";
import ClientRoute from "./ClientRoute";
import { AdminReservation } from "../pages/admin/Reservations/AdminReservation.jsx";
import NormalReservation from "../pages/client/NormalReservation.jsx";
import { Paiement } from "../pages/client/Paiement.jsx";
import Profile from "../pages/admin/profile/Profile.jsx";
import Accounts from "../pages/admin/accounts/Accounts.jsx";
import ClientList from "../pages/admin/client/ClientList.jsx";
import ClientProfile from "../pages/client/ClientProfile.jsx";
export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<WebsiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/tours" element={<ClientTours />} />
        <Route path="/tours/:id" element={<TourDetails />} />
        <Route
          path="/tours/reservation/:id"
          element={
            <ClientRoute>
              <NormalReservation />
            </ClientRoute>
          }
        />
        <Route
          path="/tours/reservation/"
          element={
            <ClientRoute>
              <NormalReservation />
            </ClientRoute>
          }
        />
        <Route
          path="/client/reservations"
          element={
            <ClientRoute>
              <Reservations />
            </ClientRoute>
          }
        />
        <Route
          path="/client/paiements"
          element={
            <ClientRoute>
              <Paiement />
            </ClientRoute>
          }
        />
        <Route
          path="/client/profile"
          element={
            <ClientRoute>
              <ClientProfile />
            </ClientRoute>
          }
        />
      </Route>

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="reservations" element={<AdminReservation />} />
        <Route path="tours" element={<Tours />} />
        <Route path="tours/new" element={<NewTour />} />
        <Route path="tours/:id/details" element={<DetailTours />} />
        <Route path="tours/:id/edit" element={<UpdateTour />} />
        <Route path="tours/propositions" element={<Propositions />} />
        {/* Paiements */}
        <Route path="paiements" element={<Paiements />} />

        {/* Profile */}

        <Route path="profile" element={<Profile />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="clients" element={<ClientList />}/>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

