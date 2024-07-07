import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import * as z from "zod";
import { User } from "../models/user.model";
import { AuthenticatedRequest } from "../ts/interfaces/auth.interface";
import { admin } from "../utils/firebaseAdmin";
import { getDatabase } from "firebase-admin/database";

const UserType = z.object({
  firebase_uid: z.string(),
  username: z.string().trim().min(3).toLowerCase(),
  email: z.string().toLowerCase().trim().email(),
  role: z.string().toLowerCase().trim(),
  password: z
    .string()
    .regex(new RegExp(".*[A-Z].*"), "One uppercase character")
    .regex(new RegExp(".*[a-z].*"), "One lowercase character")
    .regex(new RegExp(".*\\d.*"), "One number")
    .regex(
      new RegExp(".*[`~<>?,./!@#$%^&*()\\-_+=\"'|{}\\[\\];:\\\\].*"),
      "One special character"
    )
    .min(8, "Must be at least 8 characters in length"),
});

const oAuthUserRegister = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { role, username } = req.body;
    const { email, firebase_uid } = req.user;

    if (!role || !email || !firebase_uid || !username)
      throw new ApiError(409, "All fields are required");

    const existingUser = await User.findOne({ email });

    if (existingUser) throw new ApiError(400, "User alredy exists");

    const user = await User.create({
      firebase_uid,
      username,
      email,
      role,
    });

    if (!user) throw new ApiError(500, "Something went wrong creating user");

    await admin
      .auth()
      .setCustomUserClaims(firebase_uid, { mongo_id: user._id, role });

    const metadataRef = getDatabase().ref("metadata/" + firebase_uid);

    await metadataRef.set({ refreshTime: new Date().getTime() });

    const customToken = await admin
      .auth()
      .createCustomToken(firebase_uid, { mongo_id: user._id, role });

    const options = {
      httOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("customToken", customToken, options)
      .json(
        new ApiResponse(200, { customToken, user }, "User created successfully")
      );
  }
);

const customRegisterUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const {
      username,
      email,
      password,
      role,
    }: { username: string; email: string; password: string; role: string } =
      req.body;

    const firebase_uid = req.user.firebase_uid;

    const validatedData = await validateData({
      firebase_uid,
      username,
      email,
      password,
      role,
    });

    if (!validatedData) throw new ApiError(401, "Invalid credentials");

    const existingUser = await User.findOne({
      $or: [
        { email: validatedData.email },
        { username: validatedData.username },
      ],
    });

    if (existingUser) throw new ApiError(409, "User already exists");

    const user = await User.create({
      firebase_uid: validatedData.firebase_uid,
      username: validatedData.username,
      email: validatedData.email,
      passwordHash: validatedData.password,
      role: validatedData.role,
    });

    const createdUser = await User.findById(user._id).select(
      "-passwordHash -refreshToken -firebase_uid"
    );

    if (!createdUser) throw new ApiError(500, "Something went wrong");

    await admin
      .auth()
      .setCustomUserClaims(firebase_uid, { mongo_id: user._id, role });

    const metadataRef = getDatabase().ref("metadata/" + firebase_uid);

    await metadataRef.set({ refreshTime: new Date().getTime() });

    const customToken = await admin
      .auth()
      .createCustomToken(firebase_uid, { mongo_id: user._id, role });

    const options = {
      httOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("customToken", customToken, options)
      .json(
        new ApiResponse(200, { customToken, user }, "User created successfully")
      );
  }
);

// const customLoginUser = asyncHandler(
//   async (req: AuthenticatedRequest, res: Response) => {
//     const { email, password }: { email: string; password: string } = req.body;
//     const firebase_uid = req.user.firebase_uid;

//     if (!email || !password) throw new ApiError(400, "All fields are required");

//     const v_email = UserType.shape.email.safeParse(email);
//     const v_firebase_uid = UserType.shape.firebase_uid.safeParse(firebase_uid);
//     const v_password = UserType.shape.password.safeParse(password);

//     if (!v_email.success || !v_firebase_uid.success || !v_password.success)
//       throw new ApiError(409, "Invalid Credentials");

//     const user = await User.findOne({
//       $and: [{ email: v_email.data }, { firebase_uid: v_firebase_uid.data }],
//     }).select("-passwordHash -refreshToken");

//     if (!user) throw new ApiError(404, "User does not exist");

//     const customToken = await admin.auth().createCustomToken(firebase_uid, {
//       mongo_id: user.firebase_uid,
//       role: user.role,
//     });

//     const options = {
//       httpOnly: true,
//       secure: true,
//     };

//     return res
//       .status(200)
//       .cookie("customToken", customToken, options)
//       .json(
//         new ApiResponse(200, {
//           user: user,
//           customToken,
//         })
//       );
//   }
// );

const validateData = async ({
  firebase_uid,
  username,
  email,
  password,
  role,
}: z.infer<typeof UserType>) => {
  const result = UserType.safeParse({
    firebase_uid,
    username,
    email,
    password,
    role,
  });

  if (!result.success) throw new ApiError(400, "All fields must be valid");

  return result.data;
};

export { oAuthUserRegister, customRegisterUser };
