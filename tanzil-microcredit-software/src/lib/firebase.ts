import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  getFirestore,
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDzzgnlySeW1pyvuytjBYY04OG4tiLeQIU",
  authDomain: "tanzil-ngo-management-system.firebaseapp.com",
  projectId: "tanzil-ngo-management-system",
  storageBucket: "tanzil-ngo-management-system.firebasestorage.app",
  messagingSenderId: "1042943775303",
  appId: "1:1042943775303:web:fa0e48f03c6257adfe9762",
  databaseId: "ai-studio-5b426ede-852d-43bb-b077-e175f6695ba1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use initializeFirestore with experimentalForceLongPolling and conditional persistent cache
let dbInstance;
const isIframe = typeof window !== "undefined" && window.self !== window.top;

try {
  if (isIframe) {
    // In an iframe, avoid persistentLocalCache because browsers block third-party IndexedDB/localStorage by default.
    dbInstance = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    }, firebaseConfig.databaseId);
    console.log("Firestore initialized in iframe mode (memory cache, long polling)");
  } else {
    dbInstance = initializeFirestore(app, {
      experimentalForceLongPolling: true,
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    }, firebaseConfig.databaseId);
    console.log("Firestore initialized in standard mode (persistent cache, long polling)");
  }
} catch (e) {
  console.warn("initializeFirestore failed, falling back to getFirestore:", e);
  dbInstance = getFirestore(app, firebaseConfig.databaseId);
}

export const db = dbInstance;

export { signInWithEmailAndPassword } from "firebase/auth";
export { collection, getDocs } from "firebase/firestore";

