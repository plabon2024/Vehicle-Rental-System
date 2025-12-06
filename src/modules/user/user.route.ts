import { Router } from "express";
import { userController } from "./user.controller";
import auth from "../../middleware/auth";
import { Roles } from "../auth/auth.constant";

const router = Router();
router.post("/api/v1/auth/signup", userController.createUser);
router.get("/api/v1/users", auth(Roles.admin), userController.getAllUser);

export const userRoute = router;
