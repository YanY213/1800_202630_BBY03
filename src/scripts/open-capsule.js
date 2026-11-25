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