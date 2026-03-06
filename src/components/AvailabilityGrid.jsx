import React, { useState, useEffect, useMemo } from 'react';
import { getDayGrid, resolveGridData } from '../services/bookingService';
import { Popover, Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Info, AlertTriangle, X } from 'lucide-react';

const CACHE = {};

export default function AvailabilityGrid({ clubSlug, date, onSlotClick }) {
    const [gridPayload, setGridPayload] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [warningModalOpen, setWarningModalOpen] = useState(false);
    const [selectedRedSlot, setSelectedRedSlot] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchGrid = async () => {
            setLoading(true);
            setError(null);

            const dateKey = date instanceof Date ? date.toISOString().split('T')[0] : date;
            const cacheKey = `${clubSlug}_${dateKey}`;

            if (CACHE[cacheKey] && (Date.now() - CACHE[cacheKey].timestamp < 60000)) {
                if (isMounted) {
                    setGridPayload(CACHE[cacheKey].data);
                    setLoading(false);
                }
                return;
            }

            try {
                const data = await getDayGrid(clubSlug, date);
                CACHE[cacheKey] = { data, timestamp: Date.now() };
                if (isMounted) {
                    setGridPayload(data);
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.message || 'Failed to load availability');
                    setLoading(false);
                }
            }
        };

        fetchGrid();
        return () => { isMounted = false; };
    }, [clubSlug, date]);

    const fleetRegs = useMemo(() => {
        if (!gridPayload?.fleet) return [];
        return gridPayload.fleet.map(f => f.registration || f.id);
    }, [gridPayload]);

    const gridData = useMemo(() => {
        if (!gridPayload || fleetRegs.length === 0) return {};
        return resolveGridData(gridPayload.bookings, fleetRegs, date);
    }, [gridPayload, fleetRegs, date]);

    const renderTimeLabels = () => {
        const labels = [];
        for (let h = 8; h < 20; h++) {
            labels.push(
                <div key={`label-${h}`} className="h-24 border-b border-r border-gray-200 flex flex-col items-end pr-2 py-1 text-sm text-gray-500 bg-gray-50">
                    <span>{h.toString().padStart(2, '0')}:00</span>
                </div>
            );
        }
        return labels;
    };

    const handleSlotClick = (reg, slot) => {
        if (slot.isBooked) return;
        if (slot.status === 'Red') {
            setSelectedRedSlot({ reg, slot });
            setWarningModalOpen(true);
        } else {
            onSlotClick(reg, slot.time);
        }
    };

    const confirmRedBooking = () => {
        setWarningModalOpen(false);
        if (selectedRedSlot) {
            onSlotClick(selectedRedSlot.reg, selectedRedSlot.slot.time);
        }
    };

    const getSlotBaseClasses = (slot) => {
        if (slot.isBooked) {
            return "bg-gray-200 border-gray-300 cursor-not-allowed striped-bg";
        }

        switch (slot.status) {
            case 'Red':
                return "bg-red-50/50 striped-red-bg cursor-pointer transition-colors hover:bg-red-100";
            case 'Amber':
                return "bg-amber-50/50 border-l-4 border-l-amber-500 cursor-pointer transition-colors hover:bg-amber-100";
            case 'Green':
                return "bg-green-50/50 border-l-4 border-l-green-500 cursor-pointer transition-colors hover:bg-green-100";
            default:
                return "bg-white hover:bg-blue-50 cursor-pointer border-gray-100 transition-colors";
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading grid...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="flex flex-col relative">
            <div className="flex border border-gray-200 rounded-lg shadow-sm overflow-hidden bg-white">
                {/* Y-Axis: Time */}
                <div className="w-20 flex-shrink-0 z-10 bg-gray-50 drop-shadow-sm">
                    <div className="h-12 border-b border-r border-gray-200 flex items-center justify-center font-semibold text-gray-600">
                        Time
                    </div>
                    <div className="flex flex-col">
                        {renderTimeLabels()}
                    </div>
                </div>

                {/* X-Axis: Aircraft */}
                <div className="flex-1 flex overflow-x-auto relative">
                    {fleetRegs.map(reg => (
                        <div key={reg} className="flex-1 min-w-[150px] border-r border-gray-200 last:border-r-0">
                            <div className="h-12 border-b border-gray-200 bg-gray-50 flex items-center justify-center font-bold text-gray-800 sticky top-0 z-10">
                                {reg}
                            </div>
                            <div className="flex flex-col relative">
                                {gridData[reg]?.map((slot) => (
                                    <Popover key={`${reg}-${slot.timeString}`} className="relative">
                                        {({ open }) => (
                                            <>
                                                <Popover.Button
                                                    as="div"
                                                    onClick={() => handleSlotClick(reg, slot)}
                                                    className={`h-6 w-full outline-none border-b ${getSlotBaseClasses(slot)}`}
                                                />
                                                <Transition
                                                    as={Fragment}
                                                    enter="transition ease-out duration-200"
                                                    enterFrom="opacity-0 translate-y-1"
                                                    enterTo="opacity-100 translate-y-0"
                                                    leave="transition ease-in duration-150"
                                                    leaveFrom="opacity-100 translate-y-0"
                                                    leaveTo="opacity-0 translate-y-1"
                                                >
                                                    <Popover.Panel className="absolute z-50 w-64 p-3 mt-1 ml-4 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none pointer-events-none">
                                                        <div className="flex flex-col space-y-2">
                                                            <div className="flex items-center space-x-2 border-b pb-2">
                                                                <Info className="w-4 h-4 text-blue-500" />
                                                                <span className="font-semibold text-sm">{slot.timeString} - {reg}</span>
                                                            </div>
                                                            {slot.isBooked ? (
                                                                <p className="text-sm text-gray-600">Booked by: {slot.booking?.pilot_uid || 'unknown'}</p>
                                                            ) : (
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-xs text-gray-500 uppercase tracking-wider">Score</span>
                                                                        <span className={`text-sm font-bold ${slot.status === 'Red' ? 'text-red-600' :
                                                                                slot.status === 'Amber' ? 'text-amber-600' : 'text-green-600'
                                                                            }`}>{slot.flyability_score}/100</span>
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <span className="text-xs text-gray-500 uppercase tracking-wider">Constraint:</span>
                                                                        <span className="text-sm font-medium text-gray-800">{slot.primary_constraint || 'None'}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </Popover.Panel>
                                                </Transition>
                                            </>
                                        )}
                                    </Popover>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Safety Warning Modal */}
            <Transition appear show={warningModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[100]" onClose={() => setWarningModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-40" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-3 text-red-600">
                                            <AlertTriangle className="h-6 w-6" />
                                            <Dialog.Title as="h3" className="text-lg font-bold leading-6">
                                                Safety Warning: No-Go Advisory
                                            </Dialog.Title>
                                        </div>
                                        <button onClick={() => setWarningModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-600 mb-4">
                                            You are attempting to book a slot that falls under a Red "No-Go" advisory. Operating outside envelope limits voids club insurance.
                                        </p>
                                        <div className="bg-red-50 p-3 rounded border border-red-100 mb-6">
                                            <p className="text-sm font-mono text-red-800">
                                                <strong>Constraint:</strong> {selectedRedSlot?.slot?.primary_constraint}
                                            </p>
                                            <p className="text-sm font-mono text-red-800">
                                                <strong>Flyability Score:</strong> {selectedRedSlot?.slot?.flyability_score}/100
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none"
                                            onClick={() => setWarningModalOpen(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none"
                                            onClick={confirmRedBooking}
                                        >
                                            Acknowledge & Book
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            <style dangerouslySetInnerHTML={{
                __html: `
        .striped-bg {
          background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px);
        }
        .striped-red-bg {
          background-image: repeating-linear-gradient(45deg, rgba(254, 226, 226, 0.5), rgba(254, 226, 226, 0.5) 10px, rgba(254, 202, 202, 0.7) 10px, rgba(254, 202, 202, 0.7) 20px);
        }
      `}} />
        </div>
    );
}
