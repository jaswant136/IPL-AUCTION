// =========================
// FIREBASE IMPORTS
// =========================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// =========================
// FIREBASE CONFIG
// =========================

const firebaseConfig = {

  apiKey: "AIzaSyDoJPxpU4M0cnlTCyjIPPjBBHcsaYVwrx8",

  authDomain: "ipl-auction-fa326.firebaseapp.com",

  projectId: "ipl-auction-fa326",

  storageBucket: "ipl-auction-fa326.firebasestorage.app",

  messagingSenderId: "453469766516",

  appId: "1:453469766516:web:2a04e195ea946a53fee221"

};

// =========================
// INIT
// =========================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

// =========================
// GOOGLE LOGIN
// =========================

window.googleLogin = async function(){

    try{

        const result = await signInWithPopup(
            auth,
            provider
        );

        const user = result.user;

        localStorage.setItem(
            "userName",
            user.displayName
        );

        localStorage.setItem(
            "userEmail",
            user.email
        );

        localStorage.setItem(
            "userPhoto",
            user.photoURL
        );

        window.location.href = "home.html";

    }catch(error){

        console.log(error);

    }

}

// =========================
// LOGOUT
// =========================

window.logout = async function(){

    await signOut(auth);

    localStorage.clear();

    window.location.href = "login.html";

}