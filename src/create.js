import { db } from "./firebaseConfig.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import { onAuthReady } from "./authentication";

function initUI() {
  // --- DOM Elements ---
  const createCapsuleForm = document.getElementById("createCapsuleForm");

  function createCapsule() {
    try {
      onAuthReady(function (user) {
        const capsuleRef = collection(db, "users", user.uid, "timeCapsules");

        console.log("Create Time Capsule");

        const title =
          document.querySelector("#titleInput")?.value?.trim() ?? "";
        const message =
          document.querySelector("#messageInput")?.value?.trim() ?? "";
        const openingDate =
          document.querySelector("#openingDateInput")?.value ?? serverTimestamp;
        const hidden =
          document.querySelector("#hideCapsuleCheckBox")?.checked ?? false;

        addDoc(capsuleRef, {
          title,
          message,
          openingDate,
          hidden,
          fileRef: "",
          createdAt: serverTimestamp(),
        });
      });
    } catch (err) {
      console.log(`Error when creating capsule, ${err}`);
    }
  }

  // --- Event Listeners ---
  createCapsuleForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    createCapsule();
  });
}

// --- Initialize UI on DOMContentLoaded ---
document.addEventListener("DOMContentLoaded", initUI);
