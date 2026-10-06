console.log("Complaint details page loaded.");

const urlParams = new URLSearchParams(window.location.search);

const complaintId = urlParams.get("id");

console.log("Complaint ID:", complaintId);

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}



async function loadComplaintDetails() {

    try {

        const response = await fetch(
            `http://127.0.0.1:5000/api/complaints/${complaintId}`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        console.log("Complaint details:", data);

        if (!response.ok) {
            alert(data.message || "Unable to load complaint.");
            return;
        }

        const complaint = data.complaint;

document.getElementById("ticketNumber").textContent =
    complaint.ticket_number;

document.getElementById("complaintDetails").innerHTML = `
    <div class="complaint-info-grid">

        <div>
            <strong>Title</strong>
            <p>${complaint.title}</p>
        </div>

        <div>
            <strong>Category</strong>
            <p>${complaint.category}</p>
        </div>

        <div>
            <strong>Location</strong>
            <p>${complaint.location}</p>
        </div>

        <div>
            <strong>Room Number</strong>
            <p>${complaint.room_number || "Not provided"}</p>
        </div>

        <div>
            <strong>Priority</strong>
            <p>${complaint.priority}</p>
        </div>

        <div>
            <strong>Status</strong>
            <p>${complaint.status.replace("_", " ")}</p>
        </div>

        <div class="full-width">
            <strong>Description</strong>
            <p>${complaint.description}</p>
        </div>

    </div>
`;

    } catch (error) {

        console.error("Error loading complaint:", error);

    }
}

loadComplaintDetails();


async function loadStatusHistory() {

    try {

        const response = await fetch(
            `http://127.0.0.1:5000/api/complaints/${complaintId}/updates`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        console.log("Status history:", data);

        if (!response.ok) {
            console.error(
                data.message || "Unable to load status history."
            );
            return;
        }

        const historyContainer =
            document.getElementById("statusHistory");

        if (!data.updates || data.updates.length === 0) {

            historyContainer.innerHTML =
                "<p>No status updates yet.</p>";

            return;
        }

        historyContainer.innerHTML = "";

        data.updates.forEach(function (update) {

            const historyItem =
                document.createElement("div");

            historyItem.className = "status-history-item";

            historyItem.innerHTML = `
                <h3>
                    ${update.old_status || "CREATED"}
                    → ${update.new_status}
                </h3>

                <p>
                    ${update.note || "No note provided."}
                </p>

                <small>
                    Updated by: ${update.updated_by_name}
                </small>

                <small>
                    ${update.created_at}
                </small>
            `;

            historyContainer.appendChild(historyItem);
        });

    } catch (error) {

        console.error(
            "Error loading status history:",
            error
        );

    }
}

loadStatusHistory();