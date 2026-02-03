from datetime import datetime, timedelta

def has_valid_licence(pilot):
    """CAA mins: NPPL(A) 32h/10 solo; PPL(A) 40h/10 solo/XC."""
    if pilot.get('licence_type') == 'NPPL(A)':
        return pilot.get('total_hours', 0) >= 32 and pilot.get('supervised_solo_hours', 0) >= 10
    elif pilot.get('licence_type') == 'PPL(A)':
        return (pilot.get('total_hours', 0) >= 40 and 
                pilot.get('supervised_solo_hours', 0) >= 10 and 
                pilot.get('xc_done', False))
    return False

def get_relevant_rating(pilot, aircraft):
    """C42: Microlight or SEP + differences (post-Oct 2025). SSEA auto-SEP pre-1/10/25."""
    if aircraft == 'C42':
        if 'Microlight' in pilot.get('ratings', []):
            return 'Microlight'
        if ('SEP' in pilot.get('ratings', []) and 
            pilot.get('microlight_differences_trained', False)):
            return 'SEP'
    return None

def filter_logbook(pilot, start_date, end_date):
    logbook = pilot.get('logbook', [])
    # Filter entries within the date range
    relevant_entries = []
    for e in logbook:
        entry_date = datetime.fromisoformat(e['date'])
        if start_date <= entry_date <= end_date:
            relevant_entries.append(e)
    return relevant_entries

def is_ppl_microlight_transition(pilot):
    """BMAA: Pre-Oct 2025 PPL microlight transition to 12-in-24."""
    return pilot.get('ppl_microlight_pre_oct2025', False)

def single_seat_only(pilot):
    return pilot.get('single_seat_constraint', False)

def is_slot_legal(pilot, aircraft='C42', slot_date_str=None):
    # Default to now if no date provided
    slot_date = datetime.now() if not slot_date_str else datetime.fromisoformat(slot_date_str)
    
    # 1. Licence Validation
    if not has_valid_licence(pilot):
        return {'legal': False, 'reason': 'Invalid licence mins'}
    
    # 2. Rating Validation
    rating = get_relevant_rating(pilot, aircraft)
    if not rating:
        return {'legal': False, 'reason': 'No C42 rating/privs'}
    
    # 3. Recency Logic (12-in-24 / 5-in-13)
    recency_start = slot_date - timedelta(days=730)  # 24 months back
    entries = filter_logbook(pilot, recency_start, slot_date)
    
    total_h = sum(e.get('hours_pic', 0) for e in entries)
    instr_h = sum(e.get('instruction', 0) for e in entries)
    to_l = sum(e.get('to_landings', 0) for e in entries)
    
    # Standard 12-in-24 check (simplified for MVP as requested)
    # Rules: 12h total, >=1h instruction, >=12 T/Os, >=6h PIC
    # Note: Using >6h PIC as per BMAA "6 hours PIC" requirement for revalidation
    legal_recency = (total_h >= 12 and 
                     instr_h >= 1 and instr_h <= 6 and 
                     to_l >= 12 and 
                     total_h >= 6)
                     
    # 4. Constraints
    if single_seat_only(pilot):
         legal_recency = False # Fail if single seat only (assuming C42 is 2-seat)

    return {
        'legal': legal_recency,
        'expires': (slot_date - timedelta(days=730)).isoformat() if legal_recency else None,
        'total_h': total_h, 'to_l': to_l, 'instr_h': instr_h,
        'reason': 'Recency requirements not met' if not legal_recency else 'Legal',
        'needs': ['More PIC hours'] if total_h < 6 else []
    }
