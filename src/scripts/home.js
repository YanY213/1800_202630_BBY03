import { onAuthReady } from "../authentication.js";

import { db } from "../firebaseConfig.js"

import { 
    collection,
    onSnapshot,
    doc,
    deleteDoc
} from "firebase/firestore"

const capsuleList = document.getElementById("capsule-list");
const emptyMessage = document.getElementById("empty-message");

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

  const visableCapsules = snapshot.docs.filter(
    capsuleDoc => capsuleDoc.data().hidden !== true
  );

  emptyMessage.hidden = visableCapsules.length !== 0;

  visableCapsules.forEach((capsuleDoc) => {

    const capsule = capsuleDoc.data();

    console.log(capsule);

    if (capsule.hidden === true) {
      return;
    }
  })
}



// --- Initialize UI on DOMContentLoaded ---
document.addEventListener("DOMContentLoaded", initUI);
