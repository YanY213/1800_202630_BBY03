import { logoutUser } from "./authentication.js";

function initAuthUI() {
  // --- DOM Elements ---
  const signoutButton = document.getElementById("signoutButton");

  // --- Event Listeners ---
  signoutButton?.addEventListener("click", logoutUser);
}

// --- Initialize UI on DOMContentLoaded ---
document.addEventListener("DOMContentLoaded", initAuthUI);
