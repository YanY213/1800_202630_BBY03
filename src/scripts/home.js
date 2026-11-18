import { onAuthReady } from "../authentication.js";

import { db } from "../firebaseConfig.js"

import { 
    collection,
    onSnapshot,
    doc,
    deleteDoc,
    Timestamp
} from "firebase/firestore"

const capsuleList = document.getElementById("capsule-list");
const emptyMessage = document.getElementById("empty-message");

function initUI() {
  onAuthReady(function (user) {
    if (!user) {
      location.href = "/index.html"; // Not logged in → back to start
      return;
    }

    const capsuleRef = collection(
      db,
      "users",
      user.uid,
      "timeCapsules"
    );

    // Listen for changes
    onSnapshot(capsuleRef, (snapshot) => {

      displayCapsules(snapshot);

    });


  });
}

function displayCapsules(snapshot) {

  capsuleList.replaceChildren();

  const visableCapsules = snapshot.docs.filter(
    capsuleDoc => capsuleDoc.data().hidden !== true
  );

  emptyMessage.hidden = visableCapsules.length !== 0;

  visableCapsules.forEach((capsuleDoc) => {

    // Capsule Info Variables
    const capsule = capsuleDoc.data();

    const createdAt = capsule.createdAt.toDate();
    const fileRef = capsule.fileRef;
    const hidden = capsule.hidden;
    const message = capsule.message;
    const openingDate = capsule.openingDate.toDate();
    const title = capsule.title;
    const capsuleId = capsule.id;

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

    // Capsule Info Log
    console.log("Current Capsule: " + capsule
      + "\n\tCreated At: " + createdAtShort
      + "\n\tFile Reference: " + fileRef
      + "\n\tHidden: " + hidden
      + "\n\tMessage: " + message
      + "\n\tOpening Date: " + openingDateShort
      + "\n\tTitle: " + title
      + "\n\tIs Locked: " + isLocked
      + "\n\t" + daysRemaining + " Days "
      + hoursRemaining + " Hours Remaining"
    );

    if (hidden === true) {
      return;
    }

    const capsuleHTML = `
        <div class="card bg-light mb-3 capsuleCard">

            <div class="card-body">

                <div
                    role="button"
                    tabindex="0"
                    class="capsule-content"
                    data-bs-toggle="modal"
                    data-bs-target="#lockedModal"
                    data-capsule-id="${capsuleId}"
                >

                    <div class="d-flex align-items-center gap-3 mb-3">

                        <div class="border border-dark rounded p-3">
                            <i class="bi ${isLocked ? "bi-lock-fill" : "bi-unlock-fill"} fs-2"></i>
                        </div>

                        <div>
                            <h4 class="fw-bold mb-0">
                                ${title}
                            </h4>

                            <small class="fw-bold">
                              <!-- TODO/ implement memory counter -->
                                -- Memories
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



// --- Initialize UI on DOMContentLoaded ---
document.addEventListener("DOMContentLoaded", initUI);
