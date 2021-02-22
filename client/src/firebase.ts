import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyBXXDCkMM_wW-E8LMe5Yo7GAvpKxcUwl30",
  authDomain: "tenderd-rfsc.firebaseapp.com",
  databaseURL:
    "https://tenderd-rfsc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tenderd-rfsc",
  storageBucket: "tenderd-rfsc.appspot.com",
  messagingSenderId: "1041703231126",
  appId: "1:1041703231126:web:8bc6fdd88b9c449e39acb7",
  measurementId: "G-0LZDN1848X",
};

firebase.initializeApp(firebaseConfig);
firebase.functions().useEmulator("localhost", 5001);

export default !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();