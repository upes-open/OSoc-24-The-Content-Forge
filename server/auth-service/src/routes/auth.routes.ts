import { Router } from "express";
import { authenticateUser } from "../middleware/auth.middleware";
import { registerUser } from "../controllers/auth.controller";

const router = Router();

// authentication

router.route("/register").post(authenticateUser, registerUser);

export default router;
