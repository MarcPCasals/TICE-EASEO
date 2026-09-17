import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAzj6CkSyWSXNC3gzSV-Q5IugiW32hGnrM",
  authDomain: "tice-easeo.firebaseapp.com",
  projectId: "tice-easeo",
  storageBucket: "tice-easeo.firebasestorage.app",
  messagingSenderId: "149127703819",
  appId: "1:149127703819:web:e5b667ea516d8b9b7a460e",
  measurementId: "G-39B68FQ4FT",
};

export const firebaseApp = initializeApp(firebaseConfig);

// Analytics queda desactivat en aquesta primera base. L'activarem, si convé,
// quan hàgim acordat la política de privacitat i les mètriques realment útils.

