import { Router } from "express";
import { authenticateUser } from "../middleware/auth.middleware";
import {
  customRegisterUser,
  oAuthUserRegister,
} from "../controllers/auth.controller";

const router = Router();

// authentication

router.route("/oauth-register").post(authenticateUser, oAuthUserRegister);
router.route("custom-register").post(authenticateUser, customRegisterUser);

export default router;
