// Your web app's Firebase configuration
var firebaseConfig_luca = {
    apiKey: "AIzaSyBkSiTwQdm55BCmCLx76JJjrPi-97bGgGM",
    authDomain: "prova-bf94d.firebaseapp.com",
    projectId: "prova-bf94d",
    storageBucket: "prova-bf94d.appspot.com",
    messagingSenderId: "1004443487287",
    appId: "1:1004443487287:web:14efff62264856038c43b2"
};

var firebaseConfig_simone = {
    apiKey: "AIzaSyDuVssTtCbyHqFfFtiiNv9fWwmUFKXfWC8",
    authDomain: "sapiens-313216.firebaseapp.com",
    projectId: "sapiens-313216",
    storageBucket: "sapiens-313216.appspot.com",
    messagingSenderId: "990666211388",
    appId: "1:990666211388:web:00ef77fd45bd53f2e8c339"
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig_simone);
// Auth and Firestore references
const auth = firebase.auth();
const db = firebase.firestore();