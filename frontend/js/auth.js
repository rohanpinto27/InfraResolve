console.log("Authentication frontend loaded.");


/* =====================================================
   LOGIN
===================================================== */

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                document.getElementById("email").value;


            const password =
                document.getElementById("password").value;


            const message =
                document.getElementById("message");


            try {

                const response =
                    await fetch(
                        "http://127.0.0.1:5000/api/auth/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email: email,
                                password: password
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    message.textContent =
                        data.message ||
                        "Login failed.";

                    return;

                }


                /* ============================
                   SAVE LOGIN INFORMATION
                ============================ */

                localStorage.setItem(
                    "token",
                    data.token
                );


                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );


                message.textContent =
                    "Login successful!";


                /* ============================
                   REDIRECT BASED ON ROLE
                ============================ */

                if (data.user.role === "STUDENT") {

                    window.location.href =
                        "student-dashboard.html";

                }

                else if (data.user.role === "STAFF") {

                    window.location.href =
                        "staff-dashboard.html";

                }

                else if (data.user.role === "ADMIN") {

                    window.location.href =
                        "admin-dashboard.html";

                }

            }


            catch (error) {

                console.error(error);

                message.textContent =
                    "Unable to connect to the server.";

            }

        }
    );

}



/* =====================================================
   REGISTER
===================================================== */

const registerForm =
    document.getElementById("registerForm");


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const fullName =
                document.getElementById("fullName").value;


            const email =
                document.getElementById("email").value;


            const password =
                document.getElementById("password").value;


            const message =
                document.getElementById("message");


            try {

                const response =
                    await fetch(
                        "http://127.0.0.1:5000/api/auth/register",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                full_name:
                                    fullName,

                                email:
                                    email,

                                password:
                                    password

                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    message.textContent =
                        data.message ||
                        "Registration failed.";

                    return;

                }


                message.textContent =
                    "Registration successful! Redirecting to login...";


                registerForm.reset();


                setTimeout(
                    function () {

                        window.location.href =
                            "login.html";

                    },
                    1500
                );

            }


            catch (error) {

                console.error(error);

                message.textContent =
                    "Unable to connect to the server.";

            }

        }
    );

}