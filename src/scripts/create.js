import { db } from "../firebaseConfig.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import { onAuthReady } from "../authentication.js";
import * as bootstrap from "bootstrap";

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

let selectedFiles = [];
let carouselCurrentIndex = 0;

const fileInput = document.getElementById("fileInput");

// Render carousel Image Preview
function displayFiles() {
  console.log(selectedFiles);

  const imagePreview = document.getElementById("imagePreview");
  imagePreview.hidden = true;
  carouselCurrentIndex = 0;

  if (selectedFiles.length === 0) {
    return;
  }

  const carouselIndicators = document.getElementById("carousel-indicators");
  const carouselInner = document.getElementById("carousel-inner");

  carouselIndicators.innerHTML = "";
  carouselInner.innerHTML = "";

  selectedFiles.forEach((file, i) => {
    ((carouselIndicators.innerHTML =
      carouselIndicators.innerHTML +
      `
      <button
        type="button"
        data-bs-target="#carouselExampleIndicators"
        data-bs-slide-to="${i}"
        class="${i === 0 ? "active" : ""}"
        aria-current="true"
        aria-label="Slide ${i + 1}"
      ></button>
      `),
      (carouselInner.innerHTML =
        carouselInner.innerHTML +
        `
      <div class="carousel-item ${i === 0 ? "active" : ""}">
        <img
          src="${file}"
          class="d-block w-100 object-fit-contain"
          alt="Image"
        />
      </div>
      `));
  });

  imagePreview.hidden = false;
}

// Track current carousel index
document
  .getElementById("carouselExampleIndicators")
  .addEventListener("slide.bs.carousel", (event) => {
    carouselCurrentIndex = event.to ?? 0;
  });

// Remove file from list by the current index of the carousel
function removeFile() {
  selectedFiles.splice(carouselCurrentIndex, 1);
  displayFiles();
}

// Add file to list
async function addFiles(event) {
  const file = fileInput.files[0] ? await resizeImage(fileInput.files[0]) : "";

  selectedFiles.push(file);
  displayFiles();
}

fileInput.addEventListener("change", addFiles);
document.getElementById("removeImgBtn").addEventListener("click", removeFile);

function initUI() {
  let currentUser = null;

  onAuthReady(function (user) {
    if (!user) {
      location.href = "/index.html"; // Not logged in → back to start
    } else {
      currentUser = user; // 1. Remember who's logged in
    }
  });

  displayFiles();

  // --- Initialize Bootstrap Tooltips ---
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]',
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
      const openingDateInput = document.querySelector("#openingDateInput");
      const hiddenCheckBox = document.querySelector("#hiddenCheckBox");

      const title = titleInput?.value?.trim() ?? "";
      const message = messageInput?.value?.trim() ?? "";
      const hidden = hiddenCheckBox?.checked ?? false;
      const [year, month, day] = openingDateInput.value.split("-").map(Number);
      const openingDate = new Date(year, month - 1, day);

      await addDoc(capsuleRef, {
        title,
        message,
        openingDate,
        hidden,
        file: selectedFiles,
        memoryCount: selectedFiles.length,
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
