import pytest
from backend.geospatial import calculate_haversine_distance, is_inside_geofence
from backend.schemas import Geofence

def test_haversine_distance():
    # London (LHR) to Paris (CDG)
    lat1, lon1 = 51.4700, -0.4543
    lat2, lon2 = 49.0097, 2.5479
    
    distance = calculate_haversine_distance(lat1, lon1, lat2, lon2)
    # The actual distance is roughly 348 km. We allow some margin of error.
    assert 340000 < distance < 360000

def test_is_inside_geofence():
    # Example Geofence around a club
    geofence = Geofence(
        latitude=55.8580,
        longitude=-4.2590,
        radius_meters=3000.0  # 3km radius
    )
    
    # Very close coordinates (inside)
    assert is_inside_geofence(55.8590, -4.2580, geofence) == True
    
    # Exactly same point (inside)
    assert is_inside_geofence(55.8580, -4.2590, geofence) == True
    
    # Edinburgh coordinates (outside Glasgow geofence)
    assert is_inside_geofence(55.9533, -3.1883, geofence) == False
