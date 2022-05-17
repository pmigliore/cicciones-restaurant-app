import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyDW_ZjxW8n1WDURkY6nvN4aUNuUXJ8eQXY",
  authDomain: "restaurantapptemplate-691c3.firebaseapp.com",
  projectId: "restaurantapptemplate-691c3",
  storageBucket: "restaurantapptemplate-691c3.appspot.com",
  messagingSenderId: "1092201071579",
  appId: "1:1092201071579:web:cb2b8cb9329e011a0addfe",
  measurementId: "G-9ZW5EECKL5"
};

let app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const dbMenu = getDatabase(app);
const user = getAuth().currentUser;
const functions = getFunctions();

export { auth, db, user, dbMenu, functions };

