import { db } from "../firebaseConfig.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import { onAuthReady } from "../authentication.js";
import * as bootstrap from "bootstrap";


// Image preview styling
const style = document.createElement("style");

style.textContent = `
  #imagePreview {
    width: 100%;
    max-width: 250px;
    margin: 0 auto;
  }

  #carouselExampleIndicators {
    height: 160px;
  }

  #carouselExampleIndicators .carousel-inner,
  #carouselExampleIndicators .carousel-item {
    height: 160px;
  }

  #carouselExampleIndicators img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

document.head.appendChild(style);

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
  const carouselElement = document.getElementById("carouselExampleIndicators");

  const carouselIndicators = document.getElementById("carousel-indicators");
  const carouselInner = document.getElementById("carousel-inner");

  // Hide preview
  imagePreview.hidden = true;

  // Dispose of the previous carousel instance
  const oldCarousel = bootstrap.Carousel.getInstance(carouselElement);

  if (oldCarousel) {
    oldCarousel.dispose();
  }

  // Clear previous slides and indicators
  carouselIndicators.innerHTML = "";
  carouselInner.innerHTML = "";

  // No images selected
  if (selectedFiles.length === 0) {
    return;
  }

  // Select the newest image
  carouselCurrentIndex = selectedFiles.length - 1;

  selectedFiles.forEach((file, i) => {

    // Create indicators
    carouselIndicators.innerHTML += `
      <button
        type="button"
        data-bs-target="#carouselExampleIndicators"
        data-bs-slide-to="${i}"
        class="${i === carouselCurrentIndex ? "active" : ""}"
        aria-current="${i === carouselCurrentIndex ? "true" : "false"}"
        aria-label="Slide ${i + 1}"
      ></button>
    `;

    // Create slides
    carouselInner.innerHTML += `
      <div class="carousel-item ${i === carouselCurrentIndex ? "active" : ""}">
        <img
          src="${file}"
          class="d-block w-100 object-fit-contain"
          alt="Image"
        />
      </div>
    `;
  });

  // Show preview
  imagePreview.hidden = false;

  // Initialize carousel at the newest image
  const carousel = new bootstrap.Carousel(carouselElement, {
    interval: false,
    wrap: true
  });

  carousel.to(carouselCurrentIndex);
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
