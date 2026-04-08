document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Admin elements
  const createForm = document.getElementById("create-form");
  const updateForm = document.getElementById("update-form");
  const deleteForm = document.getElementById("delete-form");
  const updateActivitySelect = document.getElementById("update-activity");
  const deleteActivitySelect = document.getElementById("delete-activity");
  const adminMessageDiv = document.getElementById("admin-message");

  let activitiesData = {};

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();
      activitiesData = activities;

      // Clear loading message
      activitiesList.innerHTML = "";

      // Clear selects
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';
      updateActivitySelect.innerHTML = '<option value="">-- Select an activity --</option>';
      deleteActivitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft =
          details.max_participants - details.participants.length;

        // Create participants HTML with delete icons instead of bullet points
        const participantsHTML =
          details.participants.length > 0
            ? `<div class="participants-section">
              <h5>Participants:</h5>
              <ul class="participants-list">
                ${details.participants
                  .map(
                    (email) =>
                      `<li><span class="participant-email">${email}</span><button class="delete-btn" data-activity="${name}" data-email="${email}">❌</button></li>`
                  )
                  .join("")}
              </ul>
            </div>`
            : `<p><em>No participants yet</em></p>`;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-container">
            ${participantsHTML}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdowns
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
        updateActivitySelect.appendChild(option.cloneNode(true));
        deleteActivitySelect.appendChild(option.cloneNode(true));
      });

      // Add event listeners to delete buttons
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", handleUnregister);
      });
    } catch (error) {
      activitiesList.innerHTML =
        "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle unregister functionality
  async function handleUnregister(event) {
    const button = event.target;
    const activity = button.getAttribute("data-activity");
    const email = button.getAttribute("data-email");

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/unregister?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";

        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to unregister. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error unregistering:", error);
    }
  }

  // Handle update activity select change
  updateActivitySelect.addEventListener("change", () => {
    const name = updateActivitySelect.value;
    if (name && activitiesData[name]) {
      document.getElementById("update-description").value = activitiesData[name].description;
      document.getElementById("update-schedule").value = activitiesData[name].schedule;
      document.getElementById("update-max").value = activitiesData[name].max_participants;
    }
  });

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();

        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Handle create form submission
  createForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = {
      name: document.getElementById("create-name").value,
      description: document.getElementById("create-description").value,
      schedule: document.getElementById("create-schedule").value,
      max_participants: parseInt(document.getElementById("create-max").value)
    };

    try {
      const response = await fetch("/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        adminMessageDiv.textContent = result.message;
        adminMessageDiv.className = "success";
        createForm.reset();
        fetchActivities();
      } else {
        adminMessageDiv.textContent = result.detail || "An error occurred";
        adminMessageDiv.className = "error";
      }

      adminMessageDiv.classList.remove("hidden");

      setTimeout(() => {
        adminMessageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      adminMessageDiv.textContent = "Failed to create activity. Please try again.";
      adminMessageDiv.className = "error";
      adminMessageDiv.classList.remove("hidden");
      console.error("Error creating activity:", error);
    }
  });

  // Handle update form submission
  updateForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = updateActivitySelect.value;
    const data = {
      name: name,
      description: document.getElementById("update-description").value,
      schedule: document.getElementById("update-schedule").value,
      max_participants: parseInt(document.getElementById("update-max").value)
    };

    try {
      const response = await fetch(`/activities/${encodeURIComponent(name)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        adminMessageDiv.textContent = result.message;
        adminMessageDiv.className = "success";
        updateForm.reset();
        fetchActivities();
      } else {
        adminMessageDiv.textContent = result.detail || "An error occurred";
        adminMessageDiv.className = "error";
      }

      adminMessageDiv.classList.remove("hidden");

      setTimeout(() => {
        adminMessageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      adminMessageDiv.textContent = "Failed to update activity. Please try again.";
      adminMessageDiv.className = "error";
      adminMessageDiv.classList.remove("hidden");
      console.error("Error updating activity:", error);
    }
  });

  // Handle delete form submission
  deleteForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = deleteActivitySelect.value;

    try {
      const response = await fetch(`/activities/${encodeURIComponent(name)}`, {
        method: "DELETE"
      });

      const result = await response.json();

      if (response.ok) {
        adminMessageDiv.textContent = result.message;
        adminMessageDiv.className = "success";
        deleteForm.reset();
        fetchActivities();
      } else {
        adminMessageDiv.textContent = result.detail || "An error occurred";
        adminMessageDiv.className = "error";
      }

      adminMessageDiv.classList.remove("hidden");

      setTimeout(() => {
        adminMessageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      adminMessageDiv.textContent = "Failed to delete activity. Please try again.";
      adminMessageDiv.className = "error";
      adminMessageDiv.classList.remove("hidden");
      console.error("Error deleting activity:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
