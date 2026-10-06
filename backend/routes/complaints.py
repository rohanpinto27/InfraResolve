from flask import Blueprint, request, jsonify
from config.database import get_db_connection
from middleware.auth_middleware import token_required, role_required
from services.priority_engine import calculate_priority
from services.duplicate_detector import find_duplicate_complaint

complaints_bp = Blueprint("complaints", __name__)


@complaints_bp.route("/", methods=["POST"])
@token_required
def create_complaint():

    data = request.get_json()

    title = data.get("title")
    description = data.get("description")
    category = data.get("category")
    location = data.get("location")
    room_number = data.get("room_number")

    if not title or not description or not category or not location:
        return jsonify({
            "status": "error",
            "message": "Title, description, category and location are required"
        }), 400

    priority = calculate_priority(
        title,
        description,
        category
    )

      
    connection = get_db_connection()
    cursor = connection.cursor()
    duplicate = find_duplicate_complaint(
    connection,
    category,
    location,
    title
)
    if duplicate:
        cursor.close()
        connection.close()

        return jsonify({
            "status": "error",
            "message": "Possible duplicate complaint detected",
            "existing_complaint": {
            "ticket_number": duplicate["ticket_number"],
            "title": duplicate["title"],
            "status": duplicate["status"]
        }
    }), 409

    # Generate the next ticket number
    cursor.execute(
        "SELECT COUNT(*) FROM complaints"
    )

    count = cursor.fetchone()[0]
    ticket_number = f"IR-{count + 1:06d}"

    cursor.execute(
        """
        INSERT INTO complaints
(
    ticket_number,
    title,
    description,
    category,
    location,
    room_number,
    priority,
    reported_by
)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (
    ticket_number,
    title,
    description,
    category,
    location,
    room_number,
    priority,
    request.user["user_id"]
)
    )

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "status": "success",
        "message": "Complaint created successfully",
        "ticket_number": ticket_number
    }), 201


@complaints_bp.route("/", methods=["GET"])
@token_required
def get_my_complaints():

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            complaint_id,
            ticket_number,
            title,
            description,
            category,
            location,
            room_number,
            priority,
            status,
            created_at,
            updated_at
        FROM complaints
        WHERE reported_by = %s
        ORDER BY created_at DESC
        """,
        (request.user["user_id"],)
    )

    complaints = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify({
        "status": "success",
        "complaints": complaints
    }), 200


@complaints_bp.route("/<int:complaint_id>", methods=["GET"])
@token_required
def get_complaint(complaint_id):

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            complaint_id,
            ticket_number,
            title,
            description,
            category,
            location,
            room_number,
            priority,
            status,
            created_at,
            updated_at
        FROM complaints
        WHERE complaint_id = %s
        AND reported_by = %s
        """,
        (complaint_id, request.user["user_id"])
    )

    complaint = cursor.fetchone()

    cursor.close()
    connection.close()

    if not complaint:
        return jsonify({
            "status": "error",
            "message": "Complaint not found"
        }), 404

    return jsonify({
        "status": "success",
        "complaint": complaint
    }), 200


@complaints_bp.route("/<int:complaint_id>/status", methods=["PUT"])
@token_required
@role_required("STAFF")
def update_complaint_status(complaint_id):

    data = request.get_json()

    new_status = data.get("status")
    note = data.get("note")

    allowed_statuses = [
        "OPEN",
        "ASSIGNED",
        "IN_PROGRESS",
        "RESOLVED",
        "CLOSED"
    ]

    if new_status not in allowed_statuses:
        return jsonify({
            "status": "error",
            "message": "Invalid complaint status"
        }), 400

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    # Get current complaint status
    cursor.execute(
        """
        SELECT status
        FROM complaints
        WHERE complaint_id = %s
        """,
        (complaint_id,)
    )

    complaint = cursor.fetchone()

    if not complaint:
        cursor.close()
        connection.close()

        return jsonify({
            "status": "error",
            "message": "Complaint not found"
        }), 404

    old_status = complaint["status"]

    # Update complaint status
    cursor.execute(
        """
        UPDATE complaints
        SET status = %s
        WHERE complaint_id = %s
        """,
        (new_status, complaint_id)
    )

    # Record status change
    cursor.execute(
        """
        INSERT INTO complaint_updates
        (
            complaint_id,
            updated_by,
            old_status,
            new_status,
            note
        )
        VALUES (%s, %s, %s, %s, %s)
        """,
        (
            complaint_id,
            request.user["user_id"],
            old_status,
            new_status,
            note
        )
    )

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "status": "success",
        "message": "Complaint status updated successfully",
        "complaint_id": complaint_id,
        "old_status": old_status,
        "new_status": new_status
    }), 200


@complaints_bp.route("/<int:complaint_id>/updates", methods=["GET"])
@token_required
def get_complaint_updates(complaint_id):

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            cu.update_id,
            cu.old_status,
            cu.new_status,
            cu.note,
            cu.created_at,
            u.full_name AS updated_by
        FROM complaint_updates cu
        JOIN users u
            ON cu.updated_by = u.user_id
        WHERE cu.complaint_id = %s
        ORDER BY cu.created_at ASC
        """,
        (complaint_id,)
    )

    updates = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify({
        "status": "success",
        "complaint_id": complaint_id,
        "updates": updates
    }), 200




@complaints_bp.route("/<int:complaint_id>/assign", methods=["POST"])
@token_required
@role_required("ADMIN")
def assign_complaint(complaint_id):

    data = request.get_json()

    assigned_to = data.get("assigned_to")

    if not assigned_to:
        return jsonify({
            "status": "error",
            "message": "assigned_to is required"
        }), 400

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    # Check complaint exists
    cursor.execute(
        """
        SELECT complaint_id, status
        FROM complaints
        WHERE complaint_id = %s
        """,
        (complaint_id,)
    )

    complaint = cursor.fetchone()

    if not complaint:
        cursor.close()
        connection.close()

        return jsonify({
            "status": "error",
            "message": "Complaint not found"
        }), 404

    # Check assigned user exists and is STAFF
    cursor.execute(
        """
        SELECT user_id, full_name, role
        FROM users
        WHERE user_id = %s
        """,
        (assigned_to,)
    )

    staff = cursor.fetchone()

    if not staff:
        cursor.close()
        connection.close()

        return jsonify({
            "status": "error",
            "message": "Staff member not found"
        }), 404

    if staff["role"] != "STAFF":
        cursor.close()
        connection.close()

        return jsonify({
            "status": "error",
            "message": "User is not a staff member"
        }), 400

    # Create assignment
    cursor.execute(
        """
        INSERT INTO assignments
        (
            complaint_id,
            assigned_to,
            assigned_by
        )
        VALUES (%s, %s, %s)
        """,
        (
            complaint_id,
            assigned_to,
            request.user["user_id"]
        )
    )

    # Update complaint status
    cursor.execute(
        """
        UPDATE complaints
        SET status = 'ASSIGNED'
        WHERE complaint_id = %s
        """,
        (complaint_id,)
    )

    # Add history entry
    cursor.execute(
        """
        INSERT INTO complaint_updates
        (
            complaint_id,
            updated_by,
            old_status,
            new_status,
            note
        )
        VALUES (%s, %s, %s, %s, %s)
        """,
        (
            complaint_id,
            request.user["user_id"],
            complaint["status"],
            "ASSIGNED",
            f"Complaint assigned to {staff['full_name']}"
        )
    )

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "status": "success",
        "message": "Complaint assigned successfully",
        "complaint_id": complaint_id,
        "assigned_to": staff["full_name"]
    }), 200




@complaints_bp.route("/assigned", methods=["GET"])
@token_required
@role_required("STAFF")
def get_assigned_complaints():

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            c.complaint_id,
            c.ticket_number,
            c.title,
            c.description,
            c.category,
            c.location,
            c.room_number,
            c.priority,
            c.status,
            c.created_at,
            c.updated_at,
            a.assigned_at
        FROM complaints c
        JOIN assignments a
            ON c.complaint_id = a.complaint_id
        WHERE a.assigned_to = %s
        ORDER BY a.assigned_at DESC
        """,
        (request.user["user_id"],)
    )

    complaints = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify({
        "status": "success",
        "complaints": complaints
    }), 200





@complaints_bp.route("/<int:complaint_id>/confirm", methods=["PUT"])
@token_required
@role_required("STUDENT")
def confirm_resolution(complaint_id):

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    # Check that the complaint belongs to the logged-in student
    cursor.execute(
        """
        SELECT complaint_id, status
        FROM complaints
        WHERE complaint_id = %s
        AND reported_by = %s
        """,
        (
            complaint_id,
            request.user["user_id"]
        )
    )

    complaint = cursor.fetchone()

    if not complaint:
        cursor.close()
        connection.close()

        return jsonify({
            "status": "error",
            "message": "Complaint not found"
        }), 404

    # Complaint must be RESOLVED first
    if complaint["status"] != "RESOLVED":
        cursor.close()
        connection.close()

        return jsonify({
            "status": "error",
            "message": "Complaint must be RESOLVED before confirmation"
        }), 400

    old_status = complaint["status"]

    # Close complaint
    cursor.execute(
        """
        UPDATE complaints
        SET status = 'CLOSED'
        WHERE complaint_id = %s
        """,
        (complaint_id,)
    )

    # Record history
    cursor.execute(
        """
        INSERT INTO complaint_updates
        (
            complaint_id,
            updated_by,
            old_status,
            new_status,
            note
        )
        VALUES (%s, %s, %s, %s, %s)
        """,
        (
            complaint_id,
            request.user["user_id"],
            old_status,
            "CLOSED",
            "Student confirmed that the issue has been resolved."
        )
    )

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "status": "success",
        "message": "Complaint confirmed and closed successfully",
        "complaint_id": complaint_id,
        "new_status": "CLOSED"
    }), 200




@complaints_bp.route("/<int:complaint_id>/feedback", methods=["POST"])
@token_required
@role_required("STUDENT")
def submit_feedback(complaint_id):

    data = request.get_json()

    rating = data.get("rating")
    comment = data.get("comment")

    if rating is None:
        return jsonify({
            "status": "error",
            "message": "Rating is required"
        }), 400

    if not isinstance(rating, int) or rating < 1 or rating > 5:
        return jsonify({
            "status": "error",
            "message": "Rating must be between 1 and 5"
        }), 400

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    # Check complaint ownership and status
    cursor.execute(
        """
        SELECT complaint_id, status
        FROM complaints
        WHERE complaint_id = %s
        AND reported_by = %s
        """,
        (
            complaint_id,
            request.user["user_id"]
        )
    )

    complaint = cursor.fetchone()

    if not complaint:
        cursor.close()
        connection.close()

        return jsonify({
            "status": "error",
            "message": "Complaint not found"
        }), 404

    if complaint["status"] != "CLOSED":
        cursor.close()
        connection.close()

        return jsonify({
            "status": "error",
            "message": "Feedback can only be submitted for closed complaints"
        }), 400

    # Check if feedback already exists
    cursor.execute(
        """
        SELECT feedback_id
        FROM feedback
        WHERE complaint_id = %s
        AND submitted_by = %s
        """,
        (
            complaint_id,
            request.user["user_id"]
        )
    )

    existing_feedback = cursor.fetchone()

    if existing_feedback:
        cursor.close()
        connection.close()

        return jsonify({
            "status": "error",
            "message": "Feedback already submitted"
        }), 409

    cursor.execute(
        """
        INSERT INTO feedback
        (
            complaint_id,
            submitted_by,
            rating,
            comment
        )
        VALUES (%s, %s, %s, %s)
        """,
        (
            complaint_id,
            request.user["user_id"],
            rating,
            comment
        )
    )

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "status": "success",
        "message": "Feedback submitted successfully",
        "complaint_id": complaint_id,
        "rating": rating
    }), 201


# =========================
# CHECK FEEDBACK
# =========================

@complaints_bp.route(
    "/<int:complaint_id>/feedback",
    methods=["GET"]
)
@token_required
@role_required("STUDENT")
def get_feedback_status(complaint_id):

    user_id = request.user["user_id"]

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            feedback_id,
            rating,
            comment
        FROM feedback
        WHERE complaint_id = %s
        AND submitted_by = %s
        """,
        (
            complaint_id,
            user_id
        )
    )

    feedback = cursor.fetchone()

    cursor.close()
    connection.close()

    return jsonify({
        "status": "success",
        "has_feedback": feedback is not None,
        "feedback": feedback
    }), 200



# =========================
# ADMIN - ALL COMPLAINTS
# =========================

@complaints_bp.route("/admin/all", methods=["GET"])
@token_required
@role_required("ADMIN")
def get_all_complaints():

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            c.complaint_id,
            c.ticket_number,
            c.title,
            c.description,
            c.category,
            c.location,
            c.room_number,
            c.priority,
            c.status,
            c.created_at,
            c.updated_at,
            u.full_name AS reported_by_name
        FROM complaints c
        JOIN users u
            ON c.reported_by = u.user_id
        ORDER BY c.created_at DESC
        """
    )

    complaints = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify({
        "status": "success",
        "complaints": complaints
    }), 200