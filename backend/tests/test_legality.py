"""Tests for backend.legality — pilot licence and recency checks."""
import pytest
from datetime import datetime, timedelta
from backend.legality import is_slot_legal, has_valid_licence, get_relevant_rating


# --- Helpers ---

def make_logbook(hours_pic=15, instruction=2, to_landings=15, days_ago=180):
    """Create a single logbook entry for testing recency."""
    entry_date = (datetime.now() - timedelta(days=days_ago)).isoformat()
    return [{
        "date": entry_date,
        "hours_pic": hours_pic,
        "instruction": instruction,
        "to_landings": to_landings,
    }]


# --- Licence Validation ---

class TestHasValidLicence:
    def test_valid_nppl_licence(self):
        """NPPL(A) with 32h total and 10h supervised solo → valid."""
        pilot = {"licence_type": "NPPL(A)", "total_hours": 32, "supervised_solo_hours": 10}
        assert has_valid_licence(pilot) is True

    def test_invalid_nppl_hours(self):
        """NPPL(A) with only 20h total → invalid."""
        pilot = {"licence_type": "NPPL(A)", "total_hours": 20, "supervised_solo_hours": 10}
        assert has_valid_licence(pilot) is False

    def test_valid_ppl_licence(self):
        """PPL(A) with 40h, 10h solo, and XC completed → valid."""
        pilot = {"licence_type": "PPL(A)", "total_hours": 40, "supervised_solo_hours": 10, "xc_done": True}
        assert has_valid_licence(pilot) is True

    def test_ppl_missing_xc(self):
        """PPL(A) without cross-country done → invalid."""
        pilot = {"licence_type": "PPL(A)", "total_hours": 40, "supervised_solo_hours": 10, "xc_done": False}
        assert has_valid_licence(pilot) is False

    def test_unknown_licence_type(self):
        """Unknown licence type → always invalid."""
        pilot = {"licence_type": "LAPL(A)", "total_hours": 100, "supervised_solo_hours": 30}
        assert has_valid_licence(pilot) is False


# --- Rating Validation ---

class TestGetRelevantRating:
    def test_microlight_rating(self):
        """Pilot with Microlight rating on C42 → valid."""
        pilot = {"ratings": ["Microlight"]}
        assert get_relevant_rating(pilot, "C42") == "Microlight"

    def test_sep_with_differences(self):
        """SEP rating + differences trained → valid for C42."""
        pilot = {"ratings": ["SEP"], "microlight_differences_trained": True}
        assert get_relevant_rating(pilot, "C42") == "SEP"

    def test_no_rating_for_aircraft(self):
        """No applicable rating → returns None."""
        pilot = {"ratings": ["Multi-Engine"]}
        assert get_relevant_rating(pilot, "C42") is None

    def test_sep_without_differences(self):
        """SEP without differences training → no rating for C42."""
        pilot = {"ratings": ["SEP"], "microlight_differences_trained": False}
        assert get_relevant_rating(pilot, "C42") is None


# --- Full Legality Check (is_slot_legal) ---

class TestIsSlotLegal:
    def test_recency_sufficient(self):
        """Pilot meeting all 12-in-24 requirements → legal."""
        pilot = {
            "licence_type": "NPPL(A)",
            "total_hours": 50,
            "supervised_solo_hours": 15,
            "ratings": ["Microlight"],
            "logbook": make_logbook(hours_pic=15, instruction=2, to_landings=15),
        }
        result = is_slot_legal(pilot, "C42")
        assert result["legal"] is True
        assert result["reason"] == "Legal"

    def test_recency_insufficient_hours(self):
        """Only 5h PIC in last 24 months → not legal."""
        pilot = {
            "licence_type": "NPPL(A)",
            "total_hours": 50,
            "supervised_solo_hours": 15,
            "ratings": ["Microlight"],
            "logbook": make_logbook(hours_pic=5, instruction=2, to_landings=15),
        }
        result = is_slot_legal(pilot, "C42")
        assert result["legal"] is False

    def test_recency_insufficient_landings(self):
        """Only 3 T/Os in 24 months → not legal."""
        pilot = {
            "licence_type": "NPPL(A)",
            "total_hours": 50,
            "supervised_solo_hours": 15,
            "ratings": ["Microlight"],
            "logbook": make_logbook(hours_pic=15, instruction=2, to_landings=3),
        }
        result = is_slot_legal(pilot, "C42")
        assert result["legal"] is False

    def test_single_seat_constraint(self):
        """Pilot with single-seat constraint attempting to fly C42 (2-seat) → illegal."""
        pilot = {
            "licence_type": "NPPL(A)",
            "total_hours": 50,
            "supervised_solo_hours": 15,
            "ratings": ["Microlight"],
            "single_seat_constraint": True,
            "logbook": make_logbook(hours_pic=15, instruction=2, to_landings=15),
        }
        result = is_slot_legal(pilot, "C42")
        assert result["legal"] is False

    def test_invalid_licence_fails_early(self):
        """Pilot without sufficient hours for NPPL → fails at licence step."""
        pilot = {
            "licence_type": "NPPL(A)",
            "total_hours": 10,
            "supervised_solo_hours": 3,
            "ratings": ["Microlight"],
            "logbook": make_logbook(),
        }
        result = is_slot_legal(pilot, "C42")
        assert result["legal"] is False
        assert "licence" in result["reason"].lower()

    def test_no_rating_fails(self):
        """Pilot without any C42 rating → fails at rating step."""
        pilot = {
            "licence_type": "NPPL(A)",
            "total_hours": 50,
            "supervised_solo_hours": 15,
            "ratings": ["Multi-Engine"],
            "logbook": make_logbook(),
        }
        result = is_slot_legal(pilot, "C42")
        assert result["legal"] is False
        assert "rating" in result["reason"].lower()
