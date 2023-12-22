// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCKdKCSoxSZltIT6xReqyAWtqFqyA-LICc",
  authDomain: "ziara-sos.firebaseapp.com",
  projectId: "ziara-sos",
  storageBucket: "ziara-sos.appspot.com",
  messagingSenderId: "961907156714",
  appId: "1:961907156714:web:511c3b8ebb9f6ea77ed993",
  measurementId: "G-G5GC9GCC24"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
console.log('app firebase: ', app)
const db = getFirestore(app);
export {}
export default {
  install: (app) => {
    app.config.globalProperties.$firestore = db
    app.config.globalProperties.$storage = storage
  }
}
// const analytics = getAnalytics(app);