# InfraResolve

### Intelligent Campus Infrastructure Maintenance & Resolution Platform

InfraResolve is a web-based campus maintenance management platform designed to streamline the reporting, assignment, tracking, and resolution of infrastructure-related complaints.

The system connects students, maintenance staff, and administrators through a centralized platform.

---

## 📌 Problem Statement

In colleges and hostels, maintenance complaints such as electrical problems, water leakage, Wi-Fi failures, furniture damage, and cleaning issues are often reported through informal channels.

This can lead to:

- Delayed complaint resolution
- Difficulty tracking complaint status
- Poor communication between students and maintenance staff
- Difficulty assigning complaints to the appropriate staff
- Lack of maintenance history
- Difficulty identifying high-priority issues

InfraResolve provides a centralized workflow for managing these problems.

---

## 💡 Solution

InfraResolve provides a structured complaint management workflow:

```text
Student
   │
   │ Submit Complaint
   ▼
Admin
   │
   │ Review & Assign
   ▼
Maintenance Staff
   │
   │ Work on Complaint
   ▼
Resolved
   │
   │ Student Confirmation
   ▼
Closed
   │
   ▼
Feedback

👥 User Roles
🎓 Student
Students can:
- Register and log in
- Submit maintenance complaints
- Select complaint categories
- View submitted complaints
- Track complaint status
- View complaint details
- Confirm resolution
- Submit feedback
🔧 Maintenance Staff
Staff members can:
- Log in to the system
- View assigned complaints
- Update complaint status
- Add work notes
- Track assigned maintenance tasks
👨‍💼 Administrator
Administrators can:
- View all complaints
- Monitor complaint statistics
- Assign complaints to maintenance staff
- Track complaint priority
- Monitor complaint status
🚀 Key Features
📝 Complaint Management
- Complaint creation
- Automatic ticket number generation
- Complaint categories
- Complaint status tracking
- Complaint details
- Complaint update history
- Staff assignment
⚡ Priority Management
InfraResolve includes a rule-based priority engine that evaluates complaint information and assigns priority levels.
Priority levels include:
- LOW
- MEDIUM
- HIGH
- CRITICAL
Critical keywords and certain complaint categories can automatically increase the priority of an issue.
For example, issues involving:
- Fire
- Smoke
- Electric shock
- Gas leaks
- Flooding
can be identified as critical situations.
🔍 Duplicate Complaint Detection
The system includes duplicate complaint detection to help identify potentially repeated complaints.
The detection process considers factors such as:
- Complaint category
- Location
- Similar words in complaint titles
- Existing active complaints
This can help reduce repeated complaints for the same maintenance issue.
🔄 Complaint Workflow
OPEN
  ↓
ASSIGNED
  ↓
IN_PROGRESS
  ↓
RESOLVED
  ↓
CLOSED

A student can confirm a resolved complaint before it is finally closed.
⭐ Feedback
Students can submit feedback after a complaint has been closed.
🛠️ Technology Stack
Frontend
- HTML5
- CSS3
- JavaScript
Backend
- Python
- Flask
- REST APIs
Database
- MySQL
Authentication & Security
- JWT Authentication
- bcrypt Password Hashing
- Role-Based Access Control
- Environment Variables
- CORS Configuration
Development Tools
- Visual Studio Code
- Git
- GitHub
- Postman
🏗️ System Architecture
                    ┌──────────────────────┐
                    │       Student        │
                    │                      │
                    │ Submit / Track /     │
                    │ Confirm / Feedback   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      Frontend        │
                    │  HTML / CSS / JS     │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │     Flask Backend    │
                    │                      │
                    │ Authentication       │
                    │ Complaint APIs       │
                    │ Priority Engine      │
                    │ Duplicate Detection  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │        MySQL         │
                    │                      │
                    │ Users                │
                    │ Complaints           │
                    │ Assignments          │
                    │ Updates              │
                    │ Feedback             │
                    └──────────────────────┘
                               ▲
                               │
                    ┌──────────┴───────────┐
                    │                      │
             ┌──────┴──────┐      ┌──────┴──────┐
             │    Admin     │      │    Staff     │
             │              │      │              │
             │ Review &     │      │ Assigned     │
             │ Assign       │      │ Work         │
             └──────────────┘      └──────────────┘

📂 Project Structure
InfraResolve/
│
├── backend/
│   ├── app.py
│   │
│   ├── config/
│   │   └── database.py
│   │
│   ├── middleware/
│   │   └── auth_middleware.py
│   │
│   ├── routes/
│   │   ├── auth.py
│   │   └── complaints.py
│   │
│   └── services/
│       ├── duplicate_detector.py
│       └── priority_engine.py
│
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── student-dashboard.html
│   ├── staff-dashboard.html
│   ├── admin-dashboard.html
│   ├── complaint-details.html
│   │
│   ├── css/
│   │   ├── style.css
│   │   ├── auth.css
│   │   └── dashboard.css
│   │
│   └── js/
│       ├── app.js
│       ├── auth.js
│       ├── student.js
│       ├── staff.js
│       ├── admin.js
│       ├── complaint-details.js
│       └── theme.js
│
├── .gitignore
├── README.md
└── .env

.env is a local configuration file and is intentionally excluded from GitHub.

🗄️ Database
InfraResolve uses MySQL as its relational database.
The application database is:
infraresolve

The system manages data related to:
- Users
- Complaints
- Complaint updates
- Staff assignments
- Feedback
The backend communicates with MySQL using mysql-connector-python.
🔐 Authentication & Security
InfraResolve implements several security mechanisms.
Password Security
Passwords are stored using bcrypt hashing rather than storing plain-text passwords.
JWT Authentication
JSON Web Tokens are used to authenticate protected API requests.
Role-Based Access
Different user roles have different access levels:
STUDENT
   │
   ├── Create complaints
   ├── View own complaints
   ├── Confirm resolution
   └── Submit feedback


STAFF
   │
   ├── View assigned complaints
   ├── Update complaint status
   └── Add work notes


ADMIN
   │
   ├── View complaints
   ├── Assign staff
   └── Monitor system activity

Environment Variables
Sensitive configuration such as database credentials and secret keys are stored in a local .env file.
Example:
SECRET_KEY=your_secret_key

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=infraresolve

Never commit your .env file or database password to GitHub.
⚙️ Local Setup
1. Clone the repository
git clone https://github.com/rohanpinto27/InfraResolve.git

2. Open the project
cd InfraResolve

3. Create a virtual environment
python -m venv venv

4. Activate the virtual environment
For Windows PowerShell:
venv\Scripts\Activate.ps1

5. Install dependencies
pip install flask
pip install flask-cors
pip install mysql-connector-python
pip install bcrypt
pip install PyJWT
pip install python-dotenv

6. Create the MySQL database
Open MySQL and create the database:
CREATE DATABASE infraresolve;

7. Configure environment variables
Create a local .env file in the project root:
SECRET_KEY=your_secret_key

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=infraresolve

Use your own MySQL credentials.
8. Start the Flask backend
python backend/app.py

The backend runs at:
http://127.0.0.1:5000

9. Start the frontend
Open the frontend folder using VS Code Live Server.
The frontend can then be accessed through the Live Server URL.
🔄 Application Workflow
Step 1 — Student submits a complaint
The student provides information such as:
- Complaint title
- Description
- Category
- Location
Step 2 — System determines priority
The priority engine evaluates the complaint and assigns an appropriate priority level.
Step 3 — Admin reviews the complaint
The administrator can view complaints and assign them to maintenance staff.
Step 4 — Staff handles the complaint
The assigned staff member works on the issue and updates the complaint status.
Step 5 — Complaint is resolved
The staff member marks the complaint as resolved and can add work notes.
Step 6 — Student confirms resolution
The student confirms that the reported issue has been resolved.
Step 7 — Complaint is closed
The complaint status changes to:
CLOSED

Step 8 — Student provides feedback
The student can submit feedback after the complaint has been closed.
🎯 Example Complaint Lifecycle
Student reports:

"Water leakage near Block A"

        ↓

Ticket Generated:

IR-000004

        ↓

Priority:

MEDIUM

        ↓

Admin assigns:

Maintenance Staff

        ↓

Status:

ASSIGNED

        ↓

Staff starts work:

IN_PROGRESS

        ↓

Staff completes work:

RESOLVED

        ↓

Student confirms:

CLOSED

        ↓

Student submits:

FEEDBACK

📊 Dashboard
InfraResolve provides role-specific dashboards.
Student Dashboard
Provides:
- Complaint overview
- Complaint status
- Complaint history
- Complaint tracking
- Feedback
Staff Dashboard
Provides:
- Assigned complaints
- Priority information
- Status updates
- Work notes
Admin Dashboard
Provides:
- Complaint statistics
- Complaint list
- Priority information
- Staff assignment
- Complaint monitoring
- Analytics overview
🌙 User Interface
The application includes a modern responsive interface with:
- Professional dashboard layouts
- Responsive design
- Dark mode
- Status badges
- Priority badges
- Interactive navigation
- Role-specific dashboards
🧪 Testing
The backend APIs can be tested using tools such as:
- Postman
- Browser
- Frontend interface
Example backend health endpoint:
GET /api/health

The application workflow has been tested across:
Student
   ↓
Complaint Creation
   ↓
Admin Assignment
   ↓
Staff Update
   ↓
Resolution
   ↓
Student Confirmation
   ↓
Closure
   ↓
Feedback

📈 Future Improvements
Possible future improvements include:
- Email notifications
- Mobile application
- Image attachments for complaints
- Real-time notifications
- Advanced analytics
- Predictive maintenance
- Automated escalation for overdue complaints
- Maintenance performance reports
- Cloud deployment
- Mobile-friendly progressive web application

🎓 Academic Project
InfraResolve was developed as a practical web-based software engineering project demonstrating:
- Full-stack web development
- REST API development
- Relational database management
- Authentication and authorization
- Role-based access control
- Backend service design
- Frontend development
- Git version control
👨‍💻 Author
Rohan Pinto
Computer Science & Engineering
GitHub:
https://github.com/rohanpinto27
📄 License
This project is developed for educational and academic purposes.