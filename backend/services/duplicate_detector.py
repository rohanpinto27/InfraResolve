import re


# Common words that should NOT be used for duplicate detection.
# These words appear in many different complaints.
STOP_WORDS = {
    "a",
    "an",
    "and",
    "are",
    "at",
    "be",
    "for",
    "from",
    "has",
    "have",
    "in",
    "is",
    "it",
    "my",
    "not",
    "of",
    "on",
    "or",
    "the",
    "this",
    "to",
    "with",
    "working",
    "works",
    "issue",
    "problem",
}


def normalize_title(title):
    """
    Convert a complaint title into meaningful words.

    Example:
        "The Fan is NOT working!"
        -> {"fan"}
    """

    if not title:
        return set()

    # Convert to lowercase
    title = title.lower()

    # Remove punctuation
    title = re.sub(r"[^a-z0-9\s]", " ", title)

    # Split into words
    words = title.split()

    # Remove common/non-useful words
    meaningful_words = {
        word
        for word in words
        if word not in STOP_WORDS and len(word) > 1
    }

    return meaningful_words


def find_duplicate_complaint(
    connection,
    category,
    location,
    title
):
    """
    Find a possible duplicate complaint.

    A complaint is considered a duplicate when:

    1. It belongs to the same category.
    2. It is reported from the same location.
    3. The title is exactly the same after normalization,
       OR at least two meaningful title words are shared.

    Common words such as 'not', 'working', 'the', 'is',
    etc. are ignored to reduce false duplicate detections.
    """

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

    # Normalize the new complaint title
    title_words = normalize_title(title)

    # If the title contains no meaningful words,
    # don't attempt duplicate detection.
    if not title_words:
        return None

    for complaint in complaints:

        existing_title_words = normalize_title(
            complaint["title"]
        )

        # -------------------------------------------------
        # Rule 1: Exact normalized title match
        # -------------------------------------------------
        if title_words == existing_title_words:
            return complaint

        # -------------------------------------------------
        # Rule 2: At least two meaningful words are shared
        # -------------------------------------------------
        common_words = title_words.intersection(
            existing_title_words
        )

        if len(common_words) >= 2:
            return complaint

    return None