import { onAuthReady } from "../authentication.js";

import { db } from "../firebaseConfig.js"

import { 
    collection,
    onSnapshot,
    doc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js"

function initUI() {
  onAuthReady(function (user) {
    if (!user) {
      location.href = "/index.html"; // Not logged in → back to start
    }
  });
}



// --- Initialize UI on DOMContentLoaded ---
document.addEventListener("DOMContentLoaded", initUI);
