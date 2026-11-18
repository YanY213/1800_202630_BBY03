import { onAuthReady } from "../authentication.js";

import { db } from "../firebaseConfig.js"

import { 
    collection,
    onSnapshot,
    doc,
    deleteDoc,
    Timestamp
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

    // Capsule Info Variables
    const capsule = capsuleDoc.data();

    const createdAt = capsule.createdAt.toDate();
    const fileRef = capsule.fileRef;
    const hidden = capsule.hidden;
    const message = capsule.message;
    const openingDate = capsule.openingDate.toDate();
    const title = capsule.title;

    const currentDate = new Date();

    const createdAtShort = createdAt.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    const openingDateShort = openingDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    const isLocked = openingDate > currentDate;


    // Capsule Info Log
    console.log("Current Capsule: " + capsule
      + "\n\tCreated At: " + createdAtShort
      + "\n\tFile Reference: " + fileRef
      + "\n\tHidden: " + hidden
      + "\n\tMessage: " + message
      + "\n\tOpening Date: " + openingDateShort
      + "\n\tTitle: " + title
      + "\n\tIs Locked: " + isLocked
    );

    if (hidden === true) {
      return;
    }
  })
}



// --- Initialize UI on DOMContentLoaded ---
document.addEventListener("DOMContentLoaded", initUI);
