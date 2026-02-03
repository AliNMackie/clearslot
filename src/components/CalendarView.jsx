import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { apiClient } from '../services/apiClient';
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const CalendarView = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                // In the future, this calls apiClient.getCalendarEvents()
                // For now, we simulate transforming the booking list into calendar events
                const bookings = await apiClient.getBookings();

                const calendarEvents = bookings.map(b => {
                    // Quick parse of "10:00 - 12:00" to ISO strings for today/tomorrow
                    // This is a rough mock conversion for MVP visual
                    const today = new Date().toISOString().split('T')[0];
                    const [startStr, endStr] = b.time.split(' - ');

                    let color = '#27AE60'; // Green
                    if (b.status === 'amber') color = '#F2994A';
                    if (b.status === 'red') color = '#EB5757';

                    return {
                        id: b.id,
                        title: `${b.pilot} (${b.asset})`,
                        start: `${today}T${startStr}:00`,
                        end: `${today}T${endStr}:00`,
                        backgroundColor: color,
                        borderColor: color,
                        extendedProps: {
                            status: b.status,
                            reason: b.reason,
                            runway: b.runway // Pass runway state to event
                        }
                    };
                });

                setEvents(calendarEvents);
            } catch (err) {
                console.error("Calendar load failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSchedule();
    }, []);

    const handleDateClick = (arg) => {
        // Placeholder for "Click to Book"
        alert('Agentic Check: Checking flyability for ' + arg.dateStr);
    };

    const renderEventContent = (eventInfo) => {
        const { reason, runway } = eventInfo.event.extendedProps;
        return (
            <div className="flex flex-col px-1 overflow-hidden" style={{ fontSize: '0.75rem' }}>
                <div className="font-bold truncate">{eventInfo.event.title}</div>
                <div className="italic opacity-80 truncate">{reason}</div>
                {runway && runway !== 'Firm' && (
                    <div className="text-[0.65rem] uppercase font-bold text-yellow-800 mt-0.5 animate-pulse">
                        ⚠️ {runway}
                    </div>
                )}
            </div>
        )
    }

    if (loading) return <div className="p-8 text-center text-navy opacity-50">Loading Smart Calendar...</div>;

    return (
        <section className="container max-w-6xl mx-auto p-4 md:p-8">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 p-6">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h2 className="font-serif text-2xl text-navy">Live Operations Calendar</h2>
                        <p className="text-sm opacity-60">Real-time Legality & Flyability overlays</p>
                    </div>
                </div>

                <div className="calendar-wrapper" style={{
                    '--fc-border-color': 'rgba(27,42,58,0.1)',
                    '--fc-button-text-color': '#1B2A3A',
                    '--fc-button-bg-color': '#fff',
                    '--fc-button-border-color': '#e5e7eb',
                    '--fc-button-hover-bg-color': '#f3f4f6',
                    '--fc-button-hover-border-color': '#d1d5db',
                    '--fc-today-bg-color': 'rgba(14, 165, 233, 0.05)',
                    fontFamily: 'Instrument Sans, sans-serif'
                }}>
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'timeGridWeek,timeGridDay'
                        }}
                        slotMinTime="08:00:00"
                        slotMaxTime="20:00:00"
                        allDaySlot={false}
                        events={events}
                        dateClick={handleDateClick}
                        eventContent={renderEventContent}
                        height="auto"
                        contentHeight={600}
                    />
                </div>
            </div>
        </section>
    );
};

export default CalendarView;
