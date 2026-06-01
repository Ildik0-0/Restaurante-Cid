import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB_5U2jdg4GTSImjBe1QvILLPmvJOmObEQ",
  authDomain: "restaurant-813ff.firebaseapp.com",
  projectId: "restaurant-813ff",
  storageBucket: "restaurant-813ff.firebasestorage.app",
  messagingSenderId: "224937481490",
  appId: "1:224937481490:web:1be40e15d60df3aaf4cfcb",
  measurementId: "G-ZWCVNVMY5N"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;