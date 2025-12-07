import express, { Request, Response } from "express";
import config from "./config";
import { initDB } from "./config/db";
import { authRoute } from "./modules/auth/auth.route";
import { userRoute } from "./modules/user/user.route";
import { vehicleRoute } from "./modules/vehicles/vehicles.route";

const app = express();
app.use(express.json());



// user
app.use("/api/v1/users", userRoute);
// auth
app.use("/api/v1/auth", authRoute);
// vehicle
app.use("/api/v1/vehicles", vehicleRoute);

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
  app.listen(5000, () => console.log("server running on 5000"));
})();

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "this is the root route",
    path: req.path,
  });
});
