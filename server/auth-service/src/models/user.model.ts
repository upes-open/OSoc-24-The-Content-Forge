import mongoose, { Model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { admin } from "../utils/firebaseAdmin";
import { IUser } from "../ts/interfaces/user.interface";

const userSchema = new Schema(
  {
    firebase_uid: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      default: "user",
      required: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  if (!this.passwordHash) return next();

  this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model<IUser>("User", userSchema);
