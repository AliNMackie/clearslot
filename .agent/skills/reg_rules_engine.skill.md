---
name: Regulations Rules Engine
description: Generates logic and tests for Pilot regulations (NPPL, currency, medical).
---

# Skill: Regulations Rules Engine

**Purpose:** Generate or extend a regulations rules engine using `docs/regulations_matrix.md` as the canonical source.

## Instructions

When asked to implement regulation logic, follow these steps:

1.  **Source of Truth:** ALWAYS refer to `docs/regulations_matrix.md` for the specific rule definitions.

2.  **Implementation:**
    *   **Pure Functions:** Implement checks (e.g., `check_12_in_24`, `check_90_day_currency`) as pure functions that take a Pilot Profile/Logbook as input and return a Boolean + Reason.
    *   **No Side Effects:** These functions should not read from databases directly; input data should be passed as arguments.

3.  **Testing (Mandatory):**
    *   Generate unit tests for every rule implemented.
    *   **Edge Cases:** You MUST cover:
        *   Exact boundary conditions (e.g., exactly 12 hours, exactly 3 landings).
        *   Window shifts (e.g., a flight falling just outside the 24-month window).
        *   Medical expiry (day of, day before, day after).

## Example Function Signature (Python)

```python
def check_90_day_currency(landings: List[Landing], current_date: date) -> Dict[str, Any]:
    """
    Checks if pilot has 3 landings in the last 90 days.
    """
    # ... logic here ...
    return {"is_compliant": True, "details": "3 landings found"}
```
