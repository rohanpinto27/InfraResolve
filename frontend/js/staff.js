console.log("Staff dashboard loaded.");


const updateComplaintForm =
    document.getElementById("updateComplaintForm");


const logoutBtn =
    document.getElementById("logoutBtn");


if (updateComplaintForm) {

    updateComplaintForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const ticketNumber =
                document.getElementById("ticketNumber").value;

            const status =
                document.getElementById("status").value;

            const workNote =
                document.getElementById("workNote").value;

            const token =
                localStorage.getItem("token");

            if (!token) {
                alert("Please login as staff first.");
                window.location.href = "login.html";
                return;
            }

            try {

                const response = await fetch(
                    `${API_BASE_URL}/api/complaints/${ticketNumber}/status`,
    {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            status: status,
            note: workNote
        })
    }
);

                const data = await response.json();

                console.log("Update response:", data);

                if (!response.ok) {

                    alert(
                        data.message ||
                        "Complaint update failed."
                    );

                    return;
                }

                alert(
                    data.message ||
                    "Complaint updated successfully!"
                );

                updateComplaintForm.reset();

                loadAssignedComplaints();

            } catch (error) {

                console.error(
                    "Update error:",
                    error
                );

                alert(
                    "Unable to connect to the server."
                );

            }

        }
    );

}


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            window.location.href = "login.html";

        }
    );

}


/* =========================
   LOAD ASSIGNED COMPLAINTS
========================= */

async function loadAssignedComplaints() {

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/complaints/assigned`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        console.log("Assigned complaints:", data);
        const complaints = data.complaints;

const complaintsTable =
    document.getElementById("assignedComplaintsTable");

if (complaintsTable) {

    complaintsTable.innerHTML = "";

    complaints.forEach(function (complaint) {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>${complaint.ticket_number}</td>

            <td>${complaint.title}</td>

            <td>${complaint.category}</td>

            <td>${complaint.location}</td>

            <td>
                <span class="priority-badge priority-${complaint.priority.toLowerCase()}">
                    ${complaint.priority}
                </span>
            </td>

            <td>
                <span class="status-badge status-${complaint.status.toLowerCase()}">
                    ${complaint.status.replace("_", " ")}
                </span>
            </td>

            <td>
                <button
                    class="btn"
                    onclick="openUpdateForm(${complaint.complaint_id})">
                    Update
                </button>
            </td>
        `;

        complaintsTable.appendChild(row);
    });
}

        if (!response.ok) {
            console.error(
                data.message || "Unable to load assigned complaints."
            );
            return;
        }

    } catch (error) {

        console.error(
            "Unable to load assigned complaints:",
            error
        );

    }
}

loadAssignedComplaints();

function openUpdateForm(complaintId) {

    const ticketNumber =
        document.getElementById("ticketNumber");

    if (ticketNumber) {
        ticketNumber.value = complaintId;
    }

    const updatesSection =
        document.getElementById("updates");

    if (updatesSection) {
        updatesSection.scrollIntoView({
            behavior: "smooth"
        });
    }

}