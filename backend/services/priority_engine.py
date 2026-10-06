def calculate_priority(title, description, category):

    text = f"{title} {description}".lower()

    critical_keywords = [
        "fire",
        "smoke",
        "electric shock",
        "danger",
        "gas leak",
        "flood"
    ]

    for keyword in critical_keywords:
        if keyword in text:
            return "CRITICAL"

    if category in ["ELECTRICAL", "INTERNET"]:
        return "HIGH"

    if category in ["PLUMBING", "CIVIL", "FURNITURE"]:
        return "MEDIUM"

    if category == "CLEANING":
        return "LOW"

    return "MEDIUM"