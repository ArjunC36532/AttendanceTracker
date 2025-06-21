// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from "firebase/auth"


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDiNYZ3DXD6llnDJRfDCOvQhL7ig14xKXg",
  authDomain: "attendance-tracker-e5e83.firebaseapp.com",
  projectId: "attendance-tracker-e5e83",
  storageBucket: "attendance-tracker-e5e83.firebasestorage.app",
  messagingSenderId: "340416424956",
  appId: "1:340416424956:web:31407d0baf4f048d722079",
  measurementId: "G-PBGN8BB9RS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app)

export {app, auth}