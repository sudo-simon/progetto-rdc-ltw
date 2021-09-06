// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyBkSiTwQdm55BCmCLx76JJjrPi-97bGgGM",
    authDomain: "prova-bf94d.firebaseapp.com",
    projectId: "prova-bf94d",
    storageBucket: "prova-bf94d.appspot.com",
    messagingSenderId: "1004443487287",
    appId: "1:1004443487287:web:14efff62264856038c43b2"
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// Auth and Firestore references
const auth = firebase.auth();
const db = firebase.firestore();