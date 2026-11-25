import { onAuthReady } from "../authentication.js";

import { db } from "../firebaseConfig.js";

import {
    doc,
    getDoc,
} from "firebase/firestore";



let currentUserId = null;


// HTML Elements
const capsuleImages = document.getElementById("capsule-images");
const imageTemplate = document.getElementById("image-template");




function initUI() {

    onAuthReady(async function (user) {
        // Get capsule ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const capsuleId = urlParams.get("id");

        if (!user) {
            location.href = "/index.html";
            return;
        }

        currentUserId = user.uid;
        console.log("testing");

        if (!capsuleId) {
            console.error("No capsule ID provided.");
            return;
        }

        // Get capsule document
        const capsuleRef = doc(
            db,
            "users",
            currentUserId,
            "timeCapsules",
            capsuleId
        );

        const capsuleDoc = await getDoc(capsuleRef);

        if (!capsuleDoc.exists()) {
            console.error("Capsule not found.");
            return;
        }

        // Capsule Info Variables
        const capsule = capsuleDoc.data();

        const createdAt = capsule.createdAt.toDate();
        const fileRef = capsule.fileRef;
        const hidden = capsule.hidden;
        const message = capsule.message;
        const openingDate = capsule.openingDate.toDate();
        const title = capsule.title;
        const memoryCount = capsule.memoryCount;

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

        if (isLocked) {
            location.href = "/pages/home.html";
            return;
        }

        // Display capsule information
        document.getElementById("capsule-title").textContent = title;

        document.getElementById("created-date").textContent = createdAtShort;

        document.getElementById("unlock-date").textContent = openingDateShort;

        document.getElementById("capsule-message").textContent = message || "";

       // Get images from capsule document
        const images = capsule.file || [];

        // Display capsule images
        displayImages(images);
    });
}

// Display capsule images
function displayImages(images) {

    capsuleImages.replaceChildren();

    images.forEach((image) => {

        // Clone image template
        const imageHTML = imageTemplate.content.cloneNode(true);

        // Find image element
        const img = imageHTML.querySelector("img");

        // Set image source
        img.src = image;

        // Add image to page
        capsuleImages.appendChild(imageHTML);

    });
}

// Initilize page
document.addEventListener("DOMContentLoaded", initUI);