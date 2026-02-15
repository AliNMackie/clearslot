"""Tests for backend.analytics.scoring — Club Operational Score."""
import pytest
from backend.analytics.scoring import compute_club_operational_score, ClubMetrics


class TestClubOperationalScore:
    def test_modernised_band(self):
        """High adoption + sync + high RAG → score ≥80, 'Modernised'."""
        metrics = ClubMetrics(
            portal_adoption_rate=0.9,
            rag_usage_percent=0.8,
            calendar_sync_active=True,
        )
        result = compute_club_operational_score(metrics)
        assert result.score >= 80
        assert result.band == "Modernised"

    def test_in_transition_band(self):
        """Medium adoption + sync, moderate RAG → 50 ≤ score < 80, 'In Transition'.

        Score: (0.5*40) + (0.5*20) + 40(sync) = 20 + 10 + 40 = 70.
        """
        metrics = ClubMetrics(
            portal_adoption_rate=0.5,
            rag_usage_percent=0.5,
            calendar_sync_active=True,
        )
        result = compute_club_operational_score(metrics)
        assert 50 <= result.score < 80
        assert result.band == "In Transition"

    def test_legacy_heavy_band(self):
        """Low everything → score < 50, 'Legacy-Heavy'."""
        metrics = ClubMetrics(
            portal_adoption_rate=0.1,
            rag_usage_percent=0.1,
            calendar_sync_active=False,
        )
        result = compute_club_operational_score(metrics)
        assert result.score < 50
        assert result.band == "Legacy-Heavy"

    def test_score_clamping_max(self):
        """Even with max inputs, score should not exceed 100."""
        metrics = ClubMetrics(
            portal_adoption_rate=1.0,
            rag_usage_percent=1.0,
            calendar_sync_active=True,
        )
        result = compute_club_operational_score(metrics)
        assert result.score == 100

    def test_score_clamping_min(self):
        """All zeros → score is 0."""
        metrics = ClubMetrics(
            portal_adoption_rate=0.0,
            rag_usage_percent=0.0,
            calendar_sync_active=False,
        )
        result = compute_club_operational_score(metrics)
        assert result.score == 0
        assert result.band == "Legacy-Heavy"

    def test_explanation_not_empty(self):
        """Every band should have an explanation string."""
        for adoption, rag, sync in [(0.9, 0.8, True), (0.5, 0.5, False), (0.1, 0.1, False)]:
            metrics = ClubMetrics(
                portal_adoption_rate=adoption,
                rag_usage_percent=rag,
                calendar_sync_active=sync,
            )
            result = compute_club_operational_score(metrics)
            assert len(result.explanation) > 0
