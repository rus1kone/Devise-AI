import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDizTzYBMm7P4tnRZBEi3QY7fcJq0m2x7E",
  authDomain: "devise-webstudio.firebaseapp.com",
  projectId: "devise-webstudio",
  storageBucket: "devise-webstudio.firebasestorage.app",
  messagingSenderId: "546396749046",
  appId: "1:546396749046:web:0d2135768761ed09fbc0d7",
  measurementId: "G-JLBM6CGTK6"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const provider = new GoogleAuthProvider()
provider.setCustomParameters({
  prompt: 'select_account'
})
const db = getFirestore(app)

export { app, auth, provider, db }
