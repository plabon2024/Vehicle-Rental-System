import express, { Request, Response } from "express";
import config from "./config";
import { initDB } from "./config/db";
import { authRoute } from "./modules/auth/auth.route";
import { userRoute } from "./modules/user/user.route";
import { vehicleRoute } from "./modules/vehicles/vehicles.route";
import { bookingRoute } from "./modules/bookings/bookings.route";
import { autoReturnMiddleware } from "./middleware/autoReturn";
import { startAutoReturnScheduler } from "./schedulers/autoReturn.scheduler";

const app = express();
app.use(express.json());

// user
app.use("/api/v1/users", userRoute);
// auth
app.use("/api/v1/auth", authRoute);
// vehicle
app.use("/api/v1/vehicles", vehicleRoute);
// bookings
app.use("/api/v1/bookings", bookingRoute);

const port = config.port || 5000;
// 404
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found !",
    path: req.path,
  });
});

(async () => {
  await initDB();
  startAutoReturnScheduler();

  app.listen(port, () => console.log("server running on port", port));
})();

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "this is the root route",
    path: req.path,
  });
});
