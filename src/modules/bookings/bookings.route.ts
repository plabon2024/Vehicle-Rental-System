import { Router } from "express";
import { Roles } from "../auth/auth.constant";
import auth from "../../middleware/auth";
import { bookingController } from "./bookings.controller";

const router = Router();

router.post(
  "/",
  auth(Roles.admin, Roles.customer),
  bookingController.createBooking
);

router.get(
  "/",
  auth(Roles.admin, Roles.customer),
  bookingController.getAllBookings
);
router.put(
  "/:bookingId",
  auth(Roles.admin, Roles.customer),
  bookingController.updateBooking
);
export const bookingRoute = router;
