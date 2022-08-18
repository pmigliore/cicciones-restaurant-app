import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "XXXXXXXXXXXXXXXXXX",
  authDomain: "XXXXXXXXXXXXXXXXXX",
  projectId: "XXXXXXXXXXXXXXXXXX",
  storageBucket: "XXXXXXXXXXXXXXXXXX",
  messagingSenderId: "XXXXXXXXXXXXXXXXXX",
  appId: "XXXXXXXXXXXXXXXXXX",
  measurementId: "XXXXXXXXXXXXXXXXXX"
};

let app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const dbMenu = getDatabase(app);
const user = getAuth().currentUser;
const functions = getFunctions();

export { auth, db, user, dbMenu, functions };

