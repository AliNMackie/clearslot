# Development Tickets

## v1: MVP & Core Core Safety (Microlight Focus)

- [ ] **Implement `weather_ingestor` Module**
    *   **Description:** Create a service or module to consume weather data from the Met Office DataHub (MAVIS) API. For v1 dev, a mock implementation is acceptable, but the interface must match the real API structure.
    *   **Inputs:** `site_id` (String), `t0` (Timestamp), `t1` (Timestamp)
    *   **Outputs:** Object containing: `{ wind_speed, wind_direction, gusts, cloud_base, visibility, precipitation_rate }`
    *   **Acceptance Criteria:**
        *   [ ] Can fetch forecast for a specific Site ID between two timestamps.
        *   [ ] Handles API failures/timeouts gracefully (returns error or cached data if allowed).
        *   [ ] Unit tests verify parsing of MAVIS-style JSON responses.
        *   [ ] Mock mode allows injecting specific weather conditions for testing.

- [ ] **Implement `compute_flyability` Function**
    *   **Description:** A pure function to determine if a slot is "Flyable" based on weather conditions and aircraft limitations.
    *   **Inputs:**
        *   `forecast`: Output from `weather_ingestor`.
        *   `aircraft_profile`: Object `{ max_wind, max_gust, min_cloud_base, min_vis }`.
        *   `runway_surface`: Enum (GRASS, HARD, WATER).
    *   **Outputs:** Object `{ score, status, reasons[] }`
        *   `status`: enum('GO', 'CHECK', 'NO_GO')
    *   **Acceptance Criteria:**
        *   [ ] **GO:** All metrics are well within limits (>20% margin).
        *   [ ] **NO_GO:** Any single metric (Wind, Cloud, Vis) exceeds safety limits.
        *   [ ] **CHECK:** Metrics are marginal (within 20% of limit).
        *   [ ] Returns clear, human-readable reasons (e.g., "Wind gusts 25kt exceed limit 20kt").
        *   [ ] Configurable thresholds via config file/env vars.

## v2: Advanced Features (Do Not Start in v1)

- [ ] **Implement `gnss_logbook` Module** (LATER)
    *   **Description:** Process a stream of GNSS data to automatically deduce flight events (Block Off, Takeoff, Landing, Block On).
    *   **Inputs:** Stream of `{ lat, lon, alt, timestamp, accuracy }`.
    *   **Outputs:** Logbook entries in database: `{ flight_id, block_off, takeoff_time, landing_time, block_on, total_time }`.
    *   **Acceptance Criteria:**
        *   [ ] Detects takeoff when speed > X knots AND alt increases.
        *   [ ] Detects landing when speed < X knots AND alt matches airfield elevation.
        *   [ ] Filters noise/GPS drift when stationary.

- [ ] **Implement `hazard_layer` Module** (LATER)
    *   **Description:** Query OS NGD usage data to identify physical hazards around a coordinate.
    *   **Inputs:** `lat`, `lon`, `radius_km`.
    *   **Outputs:** List of hazards: `[{ type: "POWERLINE", distance: 500m }, { type: "TOWER", height: 50m }]`.
    *   **Acceptance Criteria:**
        *   [ ] Successfully queries OS NGD API (or mock).
        *   [ ] returns correct hazard types within the specified radius.
        *   [ ] Returns empty list if no hazards found.
