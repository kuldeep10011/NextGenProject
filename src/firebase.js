// firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your config
const firebaseConfig = {
  apiKey: "AIzaSyAlyV5xDryWiKZerqaTFl78JH0VON4Mcis",
  authDomain: "nextgenproject-28a21.firebaseapp.com",
  projectId: "nextgenproject-28a21",
  storageBucket: "nextgenproject-28a21.firebasestorage.app",
  messagingSenderId: "535957374088",
  appId: "1:535957374088:web:01649e49511e33494a0b3d",
  measurementId: "G-Y33LQS7HVX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firestore
export const db = getFirestore(app);