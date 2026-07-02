// Barrel re-export depuis la nouvelle architecture src/lib/
export {
  API_BASE_URL,
  BASE_URL,
  setAuthToken,
  getAuthToken,
  removeAuthToken,
  withToken,
} from "../src/lib/api";

export { authService as authAPI } from "../src/lib/services/authService";
export { toursService as Tours } from "../src/lib/services/toursService";
export { reservationService as reservationAPI } from "../src/lib/services/reservationService";
export { paymentService as PaiementApi } from "../src/lib/services/paymentService";
export { mailService as MailApi } from "../src/lib/services/mailService";
export { reviewService as AvisApi } from "../src/lib/services/reviewService";
export { notificationService as NotificationApi } from "../src/lib/services/notificationService";
export { userService as UserApi, adminUserService as AdminUser } from "../src/lib/services/adminService";
