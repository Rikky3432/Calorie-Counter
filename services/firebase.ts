import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAc9Te1hnj8BV6ueks4HHHMgTooJqZmg48",
    authDomain: "nutrisnap-12.firebaseapp.com",
    projectId: "nutrisnap-12",
    storageBucket: "nutrisnap-12.firebasestorage.app",
    messagingSenderId: "803614236470",
    appId: "1:803614236470:web:c3c1c6ade533b9ee36dd97",
    measurementId: "G-X0EH5GWE9M"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
