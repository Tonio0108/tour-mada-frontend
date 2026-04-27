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
import ReviewsPage from "../pages/client/ReviewsPage.jsx";
import Profile from "../pages/admin/profile/Profile.jsx";
import Accounts from "../pages/admin/accounts/Accounts.jsx";
import ClientList from "../pages/admin/client/ClientList.jsx";
import ClientProfile from "../pages/client/ClientProfile.jsx";
import ClientLayout from "../pages/client/ClientLayout.jsx";
import ClientDashboard from "../pages/client/ClientDashboard.jsx";
import AdminReviews from "../pages/admin/Reviews/AdminReviews.jsx";
import Notifications from "../pages/client/Notifications.jsx";
import AdminNotifications from "../pages/admin/Notifications.jsx";
import AdminChat from "../pages/admin/Chat.jsx";
import ClientChat from "../pages/client/Chat.jsx";

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<WebsiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/tours" element={<ClientTours />} />
        <Route path="/tours/:id" element={<TourDetails />} />
        <Route path="/avis" element={<ReviewsPage />} />
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
      </Route>

      {/* Client Space */}
      <Route
        path="/client"
        element={
          <ClientRoute>
            <ClientLayout />
          </ClientRoute>
        }
      >
        <Route index element={<ClientDashboard />} />
        <Route path="reservations" element={<Reservations />} />
        <Route path="paiements" element={<Paiement />} />
        <Route path="profile" element={<ClientProfile />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="chat" element={<ClientChat />} />
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
        <Route path="avis" element={<AdminReviews />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="chat" element={<AdminChat />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

