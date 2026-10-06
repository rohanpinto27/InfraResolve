console.log("Student dashboard loaded.");


const complaintForm =
    document.getElementById("complaintForm");


const logoutBtn =
    document.getElementById("logoutBtn");


/* =========================
   CREATE COMPLAINT
========================= */

if (complaintForm) {

    complaintForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const title =
                document.getElementById("title").value;

            const category =
                document.getElementById("category").value;

            const location =
                document.getElementById("location").value;

            const roomNumber =
                document.getElementById("roomNumber").value;

            const description =
                document.getElementById("description").value;


            const token =
                localStorage.getItem("token");


            if (!token) {

                alert("Please login first.");

                window.location.href = "login.html";

                return;
            }


            try {

                const response = await fetch(
                    "http://127.0.0.1:5000/api/complaints/",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },

                        body: JSON.stringify({

                            title: title,

                            description: description,

                            category: category,

                            location: location,

                            room_number: roomNumber

                        })
                    }
                );


                const data = await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Unable to create complaint."
                    );

                    return;
                }


                alert(
                    `Complaint created successfully!\nTicket: ${data.ticket_number}`
                );


                complaintForm.reset();
                loadComplaints();


            } catch (error) {

                console.error(error);

                alert(
                    "Unable to connect to the server."
                );

            }

        }
    );

}


/* =========================
   LOGOUT
========================= */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            localStorage.removeItem("token");

            localStorage.removeItem("user");

            window.location.href = "login.html";

        }
    );

}




/* =========================
   LOAD COMPLAINTS
========================= */

async function loadComplaints() {

    const token =
        localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/api/complaints/",
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error(data);
            return;
        }

        const complaints = data.complaints;

        const feedbackStatus = {};

for (const complaint of complaints) {

    if (complaint.status === "CLOSED") {

        feedbackStatus[complaint.complaint_id] =
            await hasFeedback(
                complaint.complaint_id
            );
    }
}

console.log("Complaints loaded:", complaints);
/* =========================
   DISPLAY COMPLAINTS
========================= */

const complaintsTable =
    document.getElementById("complaintsTable");

if (complaintsTable) {

    complaintsTable.innerHTML = "";

    complaints.forEach(function (complaint) {

        const row =
            document.createElement("tr");

        row.innerHTML = `
    <td>
        <a href="complaint-details.html?id=${complaint.complaint_id}">
            ${complaint.ticket_number}
        </a>
    </td>

    <td>${complaint.title}</td>

    <td>${complaint.category}</td>

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
        ${
            complaint.status === "RESOLVED"
            ? `<button
                    class="btn"
                    onclick="confirmResolution(${complaint.complaint_id})">
                    Confirm Resolution
               </button>`
            : complaint.status === "CLOSED"
            ? "Completed"
            : "-"
        }
    </td>
    <td>
    ${
        complaint.status !== "CLOSED"
        ? "-"
        : feedbackStatus[complaint.complaint_id]
        ? "Feedback Submitted ✓"
        : `<button
                class="btn"
                onclick="openFeedbackForm(${complaint.complaint_id})">
                Give Feedback
           </button>`
    }
</td>
`;

        complaintsTable.appendChild(row);

    });

}


/* =========================
   STATISTICS
========================= */

const totalComplaints =
    document.getElementById("totalComplaints");

const openComplaints =
    document.getElementById("openComplaints");

const progressComplaints =
    document.getElementById("progressComplaints");

const resolvedComplaints =
    document.getElementById("resolvedComplaints");


totalComplaints.textContent =
    complaints.length;

openComplaints.textContent =
    complaints.filter(
        complaint => complaint.status === "OPEN"
    ).length;

progressComplaints.textContent =
    complaints.filter(
        complaint => complaint.status === "IN_PROGRESS"
    ).length;

resolvedComplaints.textContent =
    complaints.filter(
        complaint =>
            complaint.status === "RESOLVED" ||
            complaint.status === "CLOSED"
    ).length;

    } catch (error) {

        console.error(
            "Unable to load complaints:",
            error
        );

    }
}


loadComplaints();

/* =========================
   CONFIRM RESOLUTION
========================= */

async function confirmResolution(complaintId) {

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    const confirmed = confirm(
        "Have you verified that this issue has been resolved?"
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(
            `http://127.0.0.1:5000/api/complaints/${complaintId}/confirm`,
            {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        console.log(
            "Confirmation response:",
            data
        );

        if (!response.ok) {

            alert(
                data.message ||
                "Unable to confirm resolution."
            );

            return;
        }

        alert(
            data.message ||
            "Complaint closed successfully!"
        );

        loadComplaints();

    } catch (error) {

        console.error(
            "Confirmation error:",
            error
        );

        alert(
            "Unable to connect to the server."
        );
    }
}


/* =========================
   FEEDBACK
========================= */

function openFeedbackForm(complaintId) {

    const feedbackModal =
        document.getElementById("feedbackModal");

    const feedbackComplaintId =
        document.getElementById("feedbackComplaintId");

    if (feedbackComplaintId) {
        feedbackComplaintId.value = complaintId;
    }

    if (feedbackModal) {
        feedbackModal.style.display = "block";
    }
}


const feedbackForm =
    document.getElementById("feedbackForm");


if (feedbackForm) {

    feedbackForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const complaintId =
                document.getElementById(
                    "feedbackComplaintId"
                ).value;

            const rating =
                document.getElementById(
                    "rating"
                ).value;

            const comment =
                document.getElementById(
                    "feedbackComment"
                ).value;

            const token =
                localStorage.getItem("token");


            if (!token) {

                alert("Please login first.");

                window.location.href =
                    "login.html";

                return;
            }


            try {

                const response =
                    await fetch(
                        `http://127.0.0.1:5000/api/complaints/${complaintId}/feedback`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`
                            },

                            body: JSON.stringify({
                                rating:
                                    parseInt(rating),

                                comment:
                                    comment
                            })
                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "Feedback response:",
                    data
                );


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Unable to submit feedback."
                    );

                    return;
                }


                alert(
                    data.message ||
                    "Feedback submitted successfully!"
                );


                feedbackForm.reset();


                document.getElementById(
                    "feedbackModal"
                ).style.display = "none";


                loadComplaints();


            } catch (error) {

                console.error(
                    "Feedback error:",
                    error
                );

                alert(
                    "Unable to connect to the server."
                );
            }
        }
    );
}


/* =========================
   CLOSE FEEDBACK
========================= */

const closeFeedbackBtn =
    document.getElementById(
        "closeFeedbackBtn"
    );


if (closeFeedbackBtn) {

    closeFeedbackBtn.addEventListener(
        "click",
        function () {

            document.getElementById(
                "feedbackModal"
            ).style.display = "none";

        }
    );
}


/* =========================
   CHECK EXISTING FEEDBACK
========================= */

async function hasFeedback(complaintId) {

    const token = localStorage.getItem("token");

    try {

        const response = await fetch(
            `http://127.0.0.1:5000/api/complaints/${complaintId}/feedback`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return false;
        }

        return data.has_feedback;

    } catch (error) {

        console.error(
            "Feedback status error:",
            error
        );

        return false;
    }
}