"""Tests for T12 — Medical & permit expiry checks in legality."""
import pytest
from backend.legality import is_slot_legal


def _make_legal_pilot():
    """Create a pilot dict that passes all existing legality checks."""
    return {
        'licence_type': 'NPPL(A)',
        'total_hours': 50,
        'supervised_solo_hours': 15,
        'ratings': ['Microlight'],
        'microlight_differences_trained': False,
        'single_seat_constraint': False,
        'logbook': [
            {
                'date': '2026-01-01',
                'hours_pic': 15,
                'to_landings': 15,
                'instruction': 2,
            }
        ],
    }


class TestMedicalExpiry:
    """T12: Medical certificate expiry blocks bookings."""

    def test_expired_medical_blocks(self):
        pilot = _make_legal_pilot()
        pilot['medical_expiry'] = '2026-01-01'
        result = is_slot_legal(pilot, 'C42', '2026-06-15')
        assert result['legal'] is False
        assert 'Medical certificate expired' in result['reason']
        assert '2026-01-01' in result['reason']

    def test_valid_medical_passes(self):
        pilot = _make_legal_pilot()
        pilot['medical_expiry'] = '2027-12-31'
        result = is_slot_legal(pilot, 'C42', '2026-06-15')
        assert result['legal'] is True

    def test_no_medical_field_passes(self):
        """Pilot without medical_expiry field should not be blocked."""
        pilot = _make_legal_pilot()
        result = is_slot_legal(pilot, 'C42', '2026-06-15')
        assert result['legal'] is True


class TestPermitExpiry:
    """T12: Aircraft permit expiry blocks bookings."""

    def test_expired_permit_blocks(self):
        pilot = _make_legal_pilot()
        aircraft_details = {'permit_expiry': '2025-12-31'}
        result = is_slot_legal(pilot, 'C42', '2026-06-15', aircraft_details=aircraft_details)
        assert result['legal'] is False
        assert 'Aircraft permit expired' in result['reason']
        assert '2025-12-31' in result['reason']

    def test_valid_permit_passes(self):
        pilot = _make_legal_pilot()
        aircraft_details = {'permit_expiry': '2027-12-31'}
        result = is_slot_legal(pilot, 'C42', '2026-06-15', aircraft_details=aircraft_details)
        assert result['legal'] is True

    def test_no_permit_field_passes(self):
        """Aircraft without permit_expiry should not be blocked."""
        pilot = _make_legal_pilot()
        aircraft_details = {}
        result = is_slot_legal(pilot, 'C42', '2026-06-15', aircraft_details=aircraft_details)
        assert result['legal'] is True

    def test_no_aircraft_details_passes(self):
        """No aircraft_details arg at all should not block."""
        pilot = _make_legal_pilot()
        result = is_slot_legal(pilot, 'C42', '2026-06-15')
        assert result['legal'] is True

    def test_medical_checked_before_permit(self):
        """Medical should be checked before permit — expired medical takes priority."""
        pilot = _make_legal_pilot()
        pilot['medical_expiry'] = '2025-06-01'
        aircraft_details = {'permit_expiry': '2025-12-01'}
        result = is_slot_legal(pilot, 'C42', '2026-06-15', aircraft_details=aircraft_details)
        assert result['legal'] is False
        assert 'Medical' in result['reason']
