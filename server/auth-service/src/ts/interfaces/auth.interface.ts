import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user: {
    firebase_uid: string;
    email: string | undefined;
  };
}

export interface AuthorizedRequest extends Request {
  user: {
    mongo_id: string;
    uid: string;
    role: string;
  };
}
