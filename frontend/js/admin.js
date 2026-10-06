console.log("Admin dashboard loaded.");


/* =========================
   LOGOUT
========================= */

const logoutBtn =
    document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href =
                "login.html";

        }
    );

}


/* =========================
   ASSIGN STAFF
========================= */

const assignmentForm =
    document.getElementById("assignmentForm");


if (assignmentForm) {

    assignmentForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const complaintId =
                document.getElementById(
                    "complaintId"
                ).value;


            const staffUserId =
                document.getElementById(
                    "staffId"
                ).value;


            const token =
                localStorage.getItem("token");


            if (!token) {

                alert(
                    "Please login as admin first."
                );

                window.location.href =
                    "login.html";

                return;
            }


            try {

                const response =
                    await fetch(
                        `http://127.0.0.1:5000/api/complaints/${complaintId}/assign`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`
                            },

                            body: JSON.stringify({
                                assigned_to:
                                    parseInt(
                                        staffUserId
                                    )
                            })
                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "Assignment response:",
                    data
                );


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Assignment failed."
                    );

                    return;
                }


                alert(
                    data.message ||
                    "Complaint assigned successfully!"
                );


                assignmentForm.reset();


                // Refresh complaints
                loadAdminComplaints();

            }


            catch (error) {

                console.error(
                    "Assignment error:",
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
   LOAD ALL COMPLAINTS
========================= */

async function loadAdminComplaints() {

    const token =
        localStorage.getItem("token");


    if (!token) {

        window.location.href =
            "login.html";

        return;
    }


    try {

        console.log(
            "Loading admin complaints..."
        );


        const response =
            await fetch(
                "http://127.0.0.1:5000/api/complaints/admin/all",
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        console.log(
            "Admin complaints:",
            data
        );


        if (!response.ok) {

            console.error(
                data.message ||
                "Unable to load complaints."
            );

            return;
        }


        const complaints =
            data.complaints || [];


        console.log(
            "Number of complaints:",
            complaints.length
        );


        /* =========================
           UPDATE STATISTICS
        ========================== */

        const totalComplaints =
            document.getElementById(
                "totalComplaints"
            );


        const openComplaints =
            document.getElementById(
                "openComplaints"
            );


        const progressComplaints =
            document.getElementById(
                "progressComplaints"
            );


        const criticalComplaints =
            document.getElementById(
                "criticalComplaints"
            );


        const total =
            complaints.length;


        const open =
            complaints.filter(
                function (complaint) {

                    return complaint.status ===
                        "OPEN";

                }
            ).length;


        const inProgress =
            complaints.filter(
                function (complaint) {

                    return complaint.status ===
                        "IN_PROGRESS";

                }
            ).length;


        const critical =
            complaints.filter(
                function (complaint) {

                    return complaint.priority ===
                        "CRITICAL";

                }
            ).length;


        if (totalComplaints) {

            totalComplaints.textContent =
                total;

        }


        if (openComplaints) {

            openComplaints.textContent =
                open;

        }


        if (progressComplaints) {

            progressComplaints.textContent =
                inProgress;

        }


        if (criticalComplaints) {

            criticalComplaints.textContent =
                critical;

        }


        /* =========================
           LOAD COMPLAINT TABLE
        ========================== */

        const complaintsTable =
            document.getElementById(
                "adminComplaintsTable"
            );


        if (!complaintsTable) {

            console.error(
                "adminComplaintsTable not found."
            );

            return;
        }


        complaintsTable.innerHTML = "";


        /* =========================
           NO COMPLAINTS
        ========================== */

        if (complaints.length === 0) {

            complaintsTable.innerHTML = `
                <tr>
                    <td
                        colspan="8"
                        class="empty-state"
                    >
                        No complaints available.
                    </td>
                </tr>
            `;

            return;
        }


        /* =========================
           DISPLAY COMPLAINTS
        ========================== */

        complaints.forEach(
            function (complaint) {

                const row =
                    document.createElement("tr");


                const formattedStatus =
                    complaint.status
                        .replaceAll("_", " ");


                const formattedDate =
                    new Date(
                        complaint.created_at
                    ).toLocaleDateString();


                row.innerHTML = `

                    <td>
                        ${complaint.ticket_number}
                    </td>


                    <td>
                        ${complaint.title}
                    </td>


                    <td>
                        ${complaint.reported_by_name}
                    </td>


                    <td>
                        ${complaint.category}
                    </td>


                    <td>
                        ${complaint.location}
                    </td>


                    <td>

                        <span
                            class="priority-badge priority-${complaint.priority.toLowerCase()}"
                        >

                            ${complaint.priority}

                        </span>

                    </td>


                    <td>

                        <span
                            class="status-badge status-${complaint.status.toLowerCase()}"
                        >

                            ${formattedStatus}

                        </span>

                    </td>


                    <td>
                        ${formattedDate}
                    </td>

                `;


                complaintsTable.appendChild(
                    row
                );

            }
        );

    }


    catch (error) {

        console.error(
            "Unable to load admin complaints:",
            error
        );

    }

}


/* =========================
   START ADMIN DASHBOARD
========================= */

loadAdminComplaints();