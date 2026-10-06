def find_duplicate_complaint(
    connection,
    category,
    location,
    title
):
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            complaint_id,
            ticket_number,
            title,
            status,
            priority,
            created_at
        FROM complaints
        WHERE category = %s
        AND location = %s
        AND status NOT IN ('CLOSED')
        ORDER BY created_at DESC
        LIMIT 5
        """,
        (
            category,
            location
        )
    )

    complaints = cursor.fetchall()

    cursor.close()

    title_words = set(title.lower().split())

    for complaint in complaints:

        existing_title_words = set(
            complaint["title"].lower().split()
        )

        common_words = title_words.intersection(
            existing_title_words
        )

        if len(common_words) >= 2:
            return complaint

    return None