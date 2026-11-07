import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBkaSS_TZ1WI0XZhbFxnbb1hjcwfddpqAI",
  authDomain: "nurish-c956b.firebaseapp.com",
  projectId: "nurish-c956b",
  storageBucket: "nurish-c956b.firebasestorage.app",
  messagingSenderId: "159123655967",
  appId: "1:159123655967:web:648e14e1573ccce154b42a",
  measurementId: "G-DGPYDL1TP3"
};

// Initialize Firebase safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Analytics conditionally
let analyticsInstance: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analyticsInstance = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics unavailable or blocked by adblocker, ignore gracefully
  });
}

export { analyticsInstance as analytics };
