import { onAuthReady } from "../authentication.js";

import { db } from "../firebaseConfig.js";

import {
    doc,
    getDoc,
    collection,
    getDocs
} from "firebase/firestore";



let currentUserId = null;


// HTML Elements
const capsuleImages = document.getElementById("capsule-images");
const imageTemplate = document.getElementById("images-template");

// Get capsule ID from URL
const urlParams = new URLSearchParams(window.location.search);
const capsuleId = urlParams.get("id");


function initUI() {

    onAuthReady(async function (user) {

        if (!user) {
            location.href = "/index.html";
            return;
        }

        currentUserId = user.uid;

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

        const capsuleSnap = await getDoc(capsuleRef);

        if (!capsuleSnap.exists()) {
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
        const capsuleId = capsuleDoc.id;

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

        // Get files subcollection
        const filesRef = collection(
            db,
            "users",
            currentUserId,
            "timeCapsules",
            capsuleId,
            "files"
        );

        const filesSnap = await getDocs(filesRef);

    });

}

