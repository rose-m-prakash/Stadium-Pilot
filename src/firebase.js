import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

export const firebaseConfig = {
  apiKey: "AIzaSyC2rSBBZYo6qGrI9fHpIcA-08SlD7O8mOE",
  authDomain: "stadiumpilot-db780.firebaseapp.com",
  projectId: "stadiumpilot-db780",
  databaseURL: "https://stadiumpilot-db780-default-rtdb.asia-southeast1.firebasedatabase.app/",
  messagingSenderId: "382919691000",
  appId: "1:382919691000:web:a03979f8386a6be90e890d"
}

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

export { app, db }
