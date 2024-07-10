import * as admin from "firebase-admin";
import { firebaseConfig } from "../firebaseConfig";

admin.initializeApp(firebaseConfig);

export { admin };
