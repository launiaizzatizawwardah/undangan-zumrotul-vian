// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDwUv36kra0F_ajCjyjDvalvhxrpFI1XSc",
  authDomain: "dito-project-62acb.firebaseapp.com",
  projectId: "dito-project-62acb",
  storageBucket: "dito-project-62acb.firebasestorage.app",
  messagingSenderId: "383699251773",
  appId: "1:383699251773:web:551491da5c175e3089b054",
  measurementId: "G-6WZ6KENY78"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export {addDoc, getDocs, collection, query, where, serverTimestamp};
// const analytics = getAnalytics(app);