/* =====================================================
   INFRARESOLVE THEME CONTROLLER
   Supports:
   - Dashboard dark mode
   - Login dark mode
   - Student dark mode
   - Staff dark mode
   - Admin dark mode
   - Saves theme preference
===================================================== */


/* =====================================================
   FIND THE THEME BUTTON
===================================================== */

const themeToggle =
    document.getElementById("themeToggle") ||
    document.getElementById("authThemeToggle");


/* =====================================================
   APPLY THE SELECTED THEME
===================================================== */

function applyTheme(theme) {

    if (theme === "dark") {

        document.body.classList.add("dark-mode");

        if (themeToggle) {

            themeToggle.textContent = "☀️";

            themeToggle.setAttribute(
                "title",
                "Switch to light mode"
            );

        }

    } else {

        document.body.classList.remove("dark-mode");

        if (themeToggle) {

            themeToggle.textContent = "🌙";

            themeToggle.setAttribute(
                "title",
                "Switch to dark mode"
            );

        }

    }

}


/* =====================================================
   LOAD SAVED THEME
===================================================== */

const savedTheme =
    localStorage.getItem("infraresolve-theme") || "light";


applyTheme(savedTheme);


/* =====================================================
   THEME TOGGLE BUTTON
===================================================== */

if (themeToggle) {

    themeToggle.addEventListener(
        "click",
        function () {

            const isDark =
                document.body.classList.contains("dark-mode");


            const newTheme =
                isDark ? "light" : "dark";


            /* Save preference */

            localStorage.setItem(
                "infraresolve-theme",
                newTheme
            );


            /* Apply theme */

            applyTheme(newTheme);

        }
    );

}