import { onAuthReady } from "../authentication.js";

import { db } from "../firebaseConfig.js"

import { 
    collection,
    onSnapshot,
    doc,
    deleteDoc
} from "firebase/firestore"

let capsuleList = document.getElementById("capsule-list");

function initUI() {
  onAuthReady(function (user) {
    if (!user) {
      location.href = "/index.html"; // Not logged in → back to start
      return;
    }

    const capsuleRef = collection(
      db,
      "users",
      user.uid,
      "timeCapsules"
    );

    // Listen for changes
    onSnapshot(capsuleRef, (snapshot) => {

      displayCapsules(snapshot);

    });


  });
}

function displayCapsules(snapshot) {

  capsuleList.replaceChildren();

  snapshot.forEach((capsuleDoc) => {

    const capsule = capsuleDoc.data();

    console.log(capsule);
  })
}



// --- Initialize UI on DOMContentLoaded ---
document.addEventListener("DOMContentLoaded", initUI);
