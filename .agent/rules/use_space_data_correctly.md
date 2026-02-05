# Rule: Use Space Data Correctly

**Only use data sources listed in `docs/space_connection.md`.**

## Requirements

1.  **When adding weather logic, prefer fields actually available from MAVIS / Met Office APIs.**
    *   Do not rely on hypothetical data fields. checking against the actual API response schema is required.
2.  **Do not invent non-existent satellite products or random EO layers.**
    *   Stick to the defined assets (e.g., OS NGD, GNSS logs).
3.  **Any new provider must be added explicitly to `docs/space_connection.md`.**
    *   If a new data source is needed, it must first be documented and approved in the `space_connection.md` file before implementation.
