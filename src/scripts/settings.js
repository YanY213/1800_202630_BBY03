import { logoutUser, onAuthReady } from "../authentication.js";

function initUI() {
  onAuthReady(function (user) {
    if (!user) {
      location.href = "/index.html"; // Not logged in → back to start
    }
  });

  // --- DOM Elements ---
  const signoutButton = document.getElementById("signoutButton");

  // --- Event Listeners ---
  signoutButton?.addEventListener("click", logoutUser);
}

// --- Initialize UI on DOMContentLoaded ---
document.addEventListener("DOMContentLoaded", initUI);
