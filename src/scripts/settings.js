import { logoutUser, onAuthReady } from "../authentication.js";
import { db } from "../firebaseConfig.js";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";

// The fields we store in Firestore (email comes from Auth, not from here)
const fields = ["name", "bio"];
const passwordFields = ["currentPassword", "newPassword", "confirmPassword"];
let currentUser = null;

onAuthReady(async function (user) {
  if (!user) {
    location.href = "/index.html";
  } else {
    currentUser = user;

    // 1. Read the document
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const data = userDoc.data() || {};

    // 2. Pre-populate each input (empty string if the field doesn't exist yet)
    fields.forEach((field) => {
      document.getElementById(field + "Input").value = data[field] || "";
    });
  }
});

// ---- (1) What to do when Edit is clicked ----
function enableEdit() {
  fields.forEach(
    (field) => (document.getElementById(field + "Input").disabled = false),
  );
  document.getElementById("saveBtn").disabled = false;
  document.getElementById("nameInput").focus();
}

// ---- (2) Connect it to the button ----
document.getElementById("editBtn").addEventListener("click", enableEdit);

// ---- (1) What to do when the profile form is submitted ----
async function saveProfile(event) {
  event.preventDefault();

  // Build an object from the inputs: { name: "...", country: "...", school: "...", bio: "..." }
  const updates = {};
  fields.forEach((field) => {
    updates[field] = document.getElementById(field + "Input").value;
  });

  try {
    await updateDoc(doc(db, "users", currentUser.uid), updates);

    // Lock the form again, refresh the header, show a confirmation
    fields.forEach(
      (field) => (document.getElementById(field + "Input").disabled = true),
    );
    document.getElementById("saveBtn").disabled = true;

    const alertBox = document.getElementById("profileAlert");
    alertBox.textContent = "Profile saved!";
    alertBox.classList.remove("d-none");
  } catch (error) {
    alert(
      `Error saving profile:\n${error.code || ""}\n${error.message || error}`,
    );
  }
}

// ---- (2) Connect it to the form ----
document.getElementById("profileForm").addEventListener("submit", saveProfile);

// ---- (1) What to do when Password Edit is clicked ----
function enableEditPassword() {
  passwordFields.forEach(
    (field) => (document.getElementById(field + "Input").disabled = false),
  );
  document.getElementById("saveBtnPassword").disabled = false;
  document.getElementById("currentPasswordInput").focus();
}

// ---- (2) Connect it to the button ----
document
  .getElementById("editBtnPassword")
  .addEventListener("click", enableEditPassword);

// ---- (1) What to do when the password form is submitted ----
async function changeUserPassword(event) {
  event.preventDefault();

  const currentPassword = document.getElementById("currentPasswordInput").value;
  const newPassword = document.getElementById("newPasswordInput").value;
  const confirmPassword = document.getElementById("confirmPasswordInput").value;

  if (!newPassword || newPassword !== confirmPassword) {
    alert("Error! \n New Password does not match with Confirm Password");
    return;
  }

  try {
    // 1. Create a credential using the user's email and current password
    const credential = EmailAuthProvider.credential(
      currentUser.email,
      currentPassword,
    );

    // 2. Re-authenticate the user
    await reauthenticateWithCredential(currentUser, credential);

    // 3. Update the password
    await updatePassword(currentUser, newPassword);
    console.log("Password updated successfully.");
  } catch (error) {
    console.error("Error updating password:", error.code, error.message);
  }
}

// ---- (2) Connect it to the form ----
document
  .getElementById("passwordForm")
  .addEventListener("submit", changeUserPassword);

function initUI() {
  // --- DOM Elements ---
  const signoutButton = document.getElementById("signoutButton");

  // --- Event Listeners ---
  signoutButton?.addEventListener("click", logoutUser);
}

// --- Initialize UI on DOMContentLoaded ---
document.addEventListener("DOMContentLoaded", initUI);
