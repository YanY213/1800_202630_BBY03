import {
  logoutUser,
  onAuthReady,
  authErrorMessage,
} from "../authentication.js";
import { db } from "../firebaseConfig.js";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";

// The profileFields we store in Firestore (email comes from Auth, not from here)
const profileFields = ["name", "bio"];
const passwordFields = ["currentPassword", "newPassword", "confirmPassword"];
let currentUser = null;

async function loadProfileFields(user) {
  // 1. Read the document
  const userDoc = await getDoc(doc(db, "users", user.uid));
  const data = userDoc.data() || {};

  // 2. Pre-populate each input (empty string if the field doesn't exist yet)
  profileFields.forEach((field) => {
    document.getElementById(field + "Input").value = data[field] || "";
  });
}

onAuthReady(function (user) {
  if (!user) {
    location.href = "/index.html";
  } else {
    currentUser = user;
    loadProfileFields(user);
  }
});

// -- PROFILES --

// Alert Message
const profileAlertBox = document.getElementById("profileAlert");

let profileAlertTimeout;

function showProfileAlert(msg, type) {
  profileAlertBox.textContent = msg || "";

  profileAlertBox.classList.remove("alert-success", "alert-danger");
  profileAlertBox.classList.add(type);

  profileAlertBox.classList.remove("d-none");

  clearTimeout(profileAlertTimeout);
  profileAlertTimeout = setTimeout(hideProfileAlert, 5000); // Auto-hide after 5s
}

function hideProfileAlert() {
  profileAlertBox.classList.add("d-none");
  profileAlertBox.textContent = "";

  clearTimeout(profileAlertTimeout);
}

// ---- (1) What to do when Edit is clicked ----
let isEditingProfile = false;

function toggleProfileEdit() {
  profileFields.forEach(
    (field) =>
      (document.getElementById(field + "Input").disabled = isEditingProfile),
  );

  document.getElementById("saveBtnProfile").hidden = isEditingProfile;
  document.getElementById("cancelBtnProfile").hidden = isEditingProfile;
  document.getElementById("editBtnProfile").hidden = !isEditingProfile;

  if (isEditingProfile) {
    loadProfileFields(currentUser);
  } else {
    document.getElementById("nameInput").focus();
  }

  isEditingProfile = !isEditingProfile;
}

// ---- (2) Connect it to the button ----
document
  .getElementById("editBtnProfile")
  .addEventListener("click", toggleProfileEdit);

document
  .getElementById("cancelBtnProfile")
  .addEventListener("click", toggleProfileEdit);

// ---- (1) What to do when the profile form is submitted ----
async function saveProfile(event) {
  event.preventDefault();

  // Build an object from the inputs: { name: "...", country: "...", school: "...", bio: "..." }
  const updates = {};
  profileFields.forEach((field) => {
    updates[field] = document.getElementById(field + "Input").value;
  });

  try {
    document.getElementById("cancelBtnProfile").disabled = true;

    await updateDoc(doc(db, "users", currentUser.uid), updates);
    showProfileAlert("Profile saved!", "alert-success");
  } catch (error) {
    showProfileAlert(`Error! ${error.message || error}`, "alert-danger");
    console.error("Error saving profile:", error.code, error.message);
  } finally {
    document.getElementById("cancelBtnProfile").disabled = false;

    isEditingProfile = true;
    toggleProfileEdit();
  }
}

// ---- (2) Connect it to the form ----
document.getElementById("profileForm").addEventListener("submit", saveProfile);

// -- PASSWORD --

// Alert Message
const passwordAlertBox = document.getElementById("passwordAlert");

let passwordAlertTimeout;

function showPasswordAlert(msg, type) {
  passwordAlertBox.textContent = msg || "";

  passwordAlertBox.classList.remove("alert-success", "alert-danger");
  passwordAlertBox.classList.add(type);

  passwordAlertBox.classList.remove("d-none");

  clearTimeout(passwordAlertTimeout);
  passwordAlertTimeout = setTimeout(hidePasswordAlert, 5000); // Auto-hide after 5s
}

function hidePasswordAlert() {
  passwordAlertBox.classList.add("d-none");
  passwordAlertBox.textContent = "";

  clearTimeout(passwordAlertTimeout);
}

// ---- (1) What to do when Password Edit is clicked ----
let isEditingPassword = false;

function togglePasswordEdit() {
  passwordFields.forEach(
    (field) =>
      (document.getElementById(field + "Div").hidden = isEditingPassword),
  );

  document.getElementById("saveBtnPassword").hidden = isEditingPassword;
  document.getElementById("cancelBtnPassword").hidden = isEditingPassword;
  document.getElementById("editBtnPassword").hidden = !isEditingPassword;

  if (isEditingPassword) {
    passwordFields.forEach(
      (field) => (document.getElementById(field + "Input").value = ""),
    );
  } else {
    document.getElementById("currentPasswordInput").focus();
  }

  isEditingPassword = !isEditingPassword;
}

// ---- (2) Connect it to the button ----
document
  .getElementById("editBtnPassword")
  .addEventListener("click", togglePasswordEdit);

document
  .getElementById("cancelBtnPassword")
  .addEventListener("click", togglePasswordEdit);

// ---- (1) What to do when the password form is submitted ----
async function changeUserPassword(event) {
  event.preventDefault();

  const currentPassword = document.getElementById("currentPasswordInput");
  const newPassword = document.getElementById("newPasswordInput");
  const confirmPassword = document.getElementById("confirmPasswordInput");

  const currentPasswordValue = currentPassword?.value;
  const newPasswordValue = newPassword?.value;
  const confirmPasswordValue = confirmPassword?.value;

  if (!currentPasswordValue) {
    showPasswordAlert(
      "Error! Please enter your Current Password.",
      "alert-danger",
    );
    return;
  }

  if (!newPasswordValue) {
    showPasswordAlert("Error! Please enter a New Password.", "alert-danger");
    return;
  }

  if (newPasswordValue !== confirmPasswordValue) {
    showPasswordAlert(
      "Error! New Password does not match with Confirm Password.",
      "alert-danger",
    );
    return;
  }

  if (newPasswordValue === currentPasswordValue) {
    showPasswordAlert(
      "Error! New Password cannot be the same as the Current Password.",
      "alert-danger",
    );
    return;
  }

  try {
    document.getElementById("cancelBtnPassword").disabled = true;

    // 1. Create a credential using the user's email and current password
    const credential = EmailAuthProvider.credential(
      currentUser.email,
      currentPasswordValue,
    );

    // 2. Re-authenticate the user
    await reauthenticateWithCredential(currentUser, credential);

    // 3. Update the password
    await updatePassword(currentUser, newPasswordValue);
    showPasswordAlert("Password changed!", "alert-success");

    isEditingPassword = true;
    togglePasswordEdit();
  } catch (error) {
    showPasswordAlert(
      `Error! ${authErrorMessage(error).replace("email or ", "")}`,
      "alert-danger",
    );
    console.error("Error updating password:", error.code, error.message);
  } finally {
    document.getElementById("cancelBtnPassword").disabled = false;

    currentPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";
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
