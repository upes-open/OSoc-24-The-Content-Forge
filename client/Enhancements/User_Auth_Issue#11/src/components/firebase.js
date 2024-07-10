// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQ9G0cDaPjPWBaP50UErRQa78XXI0PtiY",
  authDomain: "thecontenthub-34cc3.firebaseapp.com",
  projectId: "thecontenthub-34cc3",
  storageBucket: "thecontenthub-34cc3.appspot.com",
  messagingSenderId: "819354162885",
  appId: "1:819354162885:web:ae687c82231f9d758302ac",
  measurementId: "G-0YVJ4S0RW6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth=getAuth();
export const db=getFirestore(app);
export default app;