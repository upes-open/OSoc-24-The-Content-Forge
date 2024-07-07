import { Request, Response, NextFunction } from "express";
import * as admin from "firebase-admin";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import {
  AuthenticatedRequest,
  AuthorizedRequest,
} from "../ts/interfaces/auth.interface";

export const authenticateUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const idToken = req.cookies?.idToken || req.body.idToken;

      if (!idToken) throw new ApiError(401, "Unauthorized Request");

      const decodedToken = await admin.auth().verifyIdToken(idToken);

      if (!decodedToken) throw new ApiError(401, "Invalid Token");

      req.user = {
        firebase_uid: decodedToken.uid,
        email: decodedToken.email,
      };

      next();
    } catch (err: any) {
      console.log("Error verifying token");
      throw new ApiError(401, err?.message || "Invalid Token");
    }
  }
);

export const authorizeUser = asyncHandler(
  async (req: AuthorizedRequest, res: Response, next: NextFunction) => {
    try {
      const idToken =
        req.cookies?.idToken ||
        req.header("Authorization")?.replace("Bearer ", "");

      if (!idToken) throw new ApiError(401, "Unauthorized Request");

      const decodedToken = await admin.auth().verifyIdToken(idToken);

      if (!decodedToken) throw new ApiError(401, "Invalid Token");

      req.user = {
        mongo_id: decodedToken.mongo_id,
        uid: decodedToken.uid,
        role: decodedToken.role,
      };

      next();
    } catch (err: any) {
      console.log("Error verifying token");
      throw new ApiError(401, err?.message || "Invalid Token");
    }
  }
);
