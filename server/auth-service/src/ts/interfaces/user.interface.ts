import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  firebase_uid: string;
  username: string;
  email: string;
  role: string;
  passwordHash: string;
}
