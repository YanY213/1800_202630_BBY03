import { db } from "../firebaseConfig.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import { onAuthReady } from "../authentication.js";

// Shrink a photo so its longest side is at most maxSize px,
// then return it as a base64 text string ("data:image/jpeg;base64,....")
function resizeImage(file, maxSize = 600) {
  return new Promise(function (resolve, reject) {
    const img = new Image(); // an invisible <img>
    img.onload = function () {
      // runs once the photo is decoded
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.7)); // JPEG at 70% quality, as text
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function initUI() {
  let currentUser = null;

  onAuthReady(function (user) {
    if (!user) {
      location.href = "/index.html"; // Not logged in → back to start
    } else {
      currentUser = user; // 1. Remember who's logged in
    }
  });

  // --- Initialize Bootstrap Tooltips ---
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );

  tooltipTriggerList.forEach(function (element) {
    new bootstrap.Tooltip(element);
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
      const fileInput = document.querySelector("#fileInput");
      const openingDateInput = document.querySelector("#openingDateInput");
      const hiddenCheckBox = document.querySelector("#hiddenCheckBox");

      const title = titleInput?.value?.trim() ?? "";
      const message = messageInput?.value?.trim() ?? "";
      const file = fileInput.files[0]
        ? await resizeImage(fileInput.files[0])
        : "";
      const openingDate = new Date(openingDateInput?.value) ?? serverTimestamp;
      const hidden = hiddenCheckBox?.checked ?? false;

      await addDoc(capsuleRef, {
        title,
        message,
        openingDate,
        hidden,
        file,
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
