import { db } from "../firebaseConfig.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import { onAuthReady } from "../authentication.js";

function initUI() {
  let currentUser = null;

  onAuthReady(function (user) {
    if (!user) {
      location.href = "/index.html"; // Not logged in → back to start
    } else {
      currentUser = user; // 1. Remember who's logged in
    }
  });

  // --- DOM Elements ---
  const createCapsuleForm = document.getElementById("createCapsuleForm");

  async function createCapsule() {
    console.log("Creating Time Capsule");

    try {
      const capsuleRef = collection(
        db,
        "users",
        currentUser.uid,
        "timeCapsules",
      );

      const titleInput = document.querySelector("#titleInput");
      const messageInput = document.querySelector("#messageInput");
      const openingDateInput = document.querySelector("#openingDateInput");
      const hiddenCheckBox = document.querySelector("#hiddenCheckBox");

      const title = titleInput?.value?.trim() ?? "";
      const message = messageInput?.value?.trim() ?? "";
      const openingDate = new Date(openingDateInput?.value) ?? serverTimestamp;
      const hidden = hiddenCheckBox?.checked ?? false;

      await addDoc(capsuleRef, {
        title,
        message,
        openingDate,
        hidden,
        fileRef: "",
        createdAt: serverTimestamp(),
      });

      console.log("Time Capsule Created");

      location.href = "home.html";
    } catch (err) {
      console.log(`Error when creating capsule, ${err}`);
    }
  }

  // --- Event Listeners ---
  createCapsuleForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    createCapsule();
  });
}

// --- Initialize UI on DOMContentLoaded ---
document.addEventListener("DOMContentLoaded", initUI);
