import { onAuthReady } from "../authentication.js";

import { db } from "../firebaseConfig.js"
import * as bootstrap from "bootstrap";

import { 
    collection,
    onSnapshot,
    doc,
    deleteDoc,
    Timestamp
} from "firebase/firestore"

let currentUserId = null;
let lastClickedCapsule = null;
let latestSnapshot = null;
const searchBar = document.getElementById("searchbar");
const capsuleList = document.getElementById("capsule-list");
const emptyMessage = document.getElementById("empty-message");


function initUI() {
  onAuthReady(function (user) {
    if (!user) {
      location.href = "/index.html"; // Not logged in → back to start
      return;
    }

    currentUserId = user.uid

    const capsuleRef = collection(
      db,
      "users",
      currentUserId,
      "timeCapsules"
    );

    // Listen for changes
    onSnapshot(capsuleRef, (snapshot) => {

        latestSnapshot = snapshot;

        displayCapsules(snapshot);

    });


  });
}

function displayCapsules(snapshot) {

    capsuleList.replaceChildren();

    const searchText = searchBar.value.toLowerCase().trim();
        
    const visableCapsules = snapshot.docs.filter(
        capsuleDoc => capsuleDoc.data().hidden !== true
    );

    const filteredCapsules = visableCapsules.filter(capsuleDoc => {

        const title = capsuleDoc.data().title.toLowerCase();

        return title.includes(searchText);
    })

    emptyMessage.hidden = filteredCapsules.length !== 0;

    filteredCapsules.forEach((capsuleDoc) => {

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

        // Difference in milliseconds
        const diffMs = openingDate - currentDate;

        const progress = diffMs > 0
        ? Math.max(0, Math.min(100, (currentDate / openingDate) * 100))
        : 100;

        // Convert milliseconds into days and hours
        const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
        const daysRemaining = Math.floor(totalHours / 24);
        const hoursRemaining = totalHours % 24;

        const capsuleHTML = `
            <div class="card bg-light mb-3 capsuleCard">

                <div class="card-body">

                    <div
                    role="button"
                    tabindex="0"
                    class="capsule-content"
                    data-capsule-id="${capsuleId}"
                    data-capsule-title="${title}"
                    data-opening-date="${openingDate}"
                    data-is-locked="${isLocked}"
                >

                        <div class="d-flex align-items-center gap-3 mb-3">
                            
                            <div class="border border-dark rounded d-inline-flex align-items-center justify-content-center" style="width: 64px; height: 64px;">
                                <i class="bi ${isLocked ? 'bi-lock-fill' : 'bi-unlock-fill'} fs-2"></i>
                            </div>


                            <div>
                                <h4 class="fw-bold mb-0">
                                    ${title}
                                </h4>

                                <small class="fw-bold">
                                    ${memoryCount} Memories Inside
                                </small>
                            </div>

                        </div>

                        <div class="border border-dark rounded p-3">

                            <h5 class="fw-bold mb-0">
                                ${isLocked ? "Opens in" : "Available now"}
                            </h5>

                            <p class="fw-bold mb-2">
                                ${isLocked
                                    ? `${daysRemaining} Days ${hoursRemaining} Hours`
                                    : "Your capsule is ready!"}
                            </p>

                            <div class="progress mb-2">
                                <div
                                    class="progress-bar bg-secondary"
                                    style="width: ${progress}%"
                                ></div>
                            </div>

                            <small class="fw-bold">
                                Created ${createdAtShort} • Opens ${openingDateShort}
                            </small>

                        </div>

                    </div>

                    <button
                        type="button"
                        class="btn btn-danger mt-3 delete-btn"
                        data-capsule-id="${capsuleId}"
                    >
                        <i class="bi bi-trash"></i> Delete
                    </button>

                </div>
            </div>
        `;

        capsuleList.insertAdjacentHTML("beforeend", capsuleHTML);
    })
}

// Search capsules by title
searchBar.addEventListener("input", function () {

    if (latestSnapshot) {
        displayCapsules(latestSnapshot);
    }

});

// Delete capsule button
capsuleList.addEventListener("click", async (event) => {

    const deleteButton = event.target.closest(".delete-btn");

    if (!deleteButton) {
        return;
    }
    if (!currentUserId) {
      alert("You must be logged in to delete a capsule.");
      return;
    }

    event.stopPropagation();

    const capsuleId = deleteButton.dataset.capsuleId;

    if (!confirm("Are you sure you want to delete this time capsule?")) {
        return;
    }

    try {

        await deleteDoc(
            doc(
                db,
                "users",
                currentUserId,
                "timeCapsules",
                capsuleId
            )
        );

        console.log("Capsule successfully deleted!");

    } catch (error) {

        console.error("Error deleting capsule:", error);

        alert("Could not delete the time capsule.");

    }

});

// Open the locked capsule popup

capsuleList.addEventListener("click", function (event) {

    // Find the capsule that was clicked
    const capsuleContent = event.target.closest(".capsule-content");

    // If the click wasn't on a capsule, stop
    if (!capsuleContent) {
        return;
    }

    // Remember which capsule opened the popup
    lastClickedCapsule = capsuleContent;

    // Retrieve capsule information from its data attributes
    const title = capsuleContent.dataset.capsuleTitle;
    const openingDate = new Date(capsuleContent.dataset.openingDate);

    // Check if capsule is still locked
    const currentDate = new Date();
    const isLocked = openingDate > currentDate;

    // Find the popup elements
    const modalTitle = document.getElementById("lockedModalLabel");
    const modalIcon = document.getElementById("modal-lock-icon");
    const modalStatus = document.getElementById("modal-status");
    const modalMessage = document.getElementById("modal-message");
    const modalOpeningDate = document.getElementById("modal-opening-date");

    // Format opening date
    const formattedDate = openingDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    // Update popup title
    modalTitle.textContent = title;

    // Display locked or unlocked information
    if (isLocked) {

        modalIcon.className = "bi bi-lock-fill fs-1";

        modalStatus.textContent = "This Capsule Is Locked";

        modalMessage.textContent =
            "Your memories will be available when this capsule unlocks.";

        modalOpeningDate.textContent = "Opens " + formattedDate;

    } else {

        modalIcon.className = "bi bi-unlock-fill fs-1";

        modalStatus.textContent = "This Capsule Is Unlocked!";

        modalMessage.textContent =
            "Your memories are now available. Open your capsule to explore them!";

        modalOpeningDate.textContent = "Opened " + formattedDate;

    }

    // Display the Bootstrap modal
    const modalElement = document.getElementById("lockedModal");
    modalElement.dataset.capsuleId = capsuleContent.dataset.capsuleId;

    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

    modal.show();

});


// Keyboard support for capsule popup

capsuleList.addEventListener("keydown", function (event) {

    // Find the capsule that was pressed
    const capsuleContent = event.target.closest(".capsule-content");

    if (!capsuleContent) {
        return;
    }

    // Open popup using Enter or Space
    if (event.key === "Enter" || event.key === " ") {

        event.preventDefault();

        capsuleContent.click();

    }

});

// Restore focus after closing the modal

const modalElement = document.getElementById("lockedModal");

// Remove focus from the modal's Close button before it is hidden
modalElement.addEventListener("hide.bs.modal", function () {

    if (modalElement.contains(document.activeElement)) {
        document.activeElement.blur();
    }
});

// Return focus to the capsule after the modal has finished closing
modalElement.addEventListener("hidden.bs.modal", function () {

    if (lastClickedCapsule && lastClickedCapsule.isConnected) {
        lastClickedCapsule.focus();
    }

});


// --- Initialize UI on DOMContentLoaded ---
document.addEventListener("DOMContentLoaded", initUI);
