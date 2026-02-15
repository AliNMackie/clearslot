import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

const UserProfileModal = ({ isOpen, onClose, onUpdate }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        weight_kg: '',
        medical_expiry: '',
        license_expiry: ''
    });

    useEffect(() => {
        if (isOpen) {
            loadProfile();
        }
    }, [isOpen]);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const profile = await apiClient.getUserProfile();
            setFormData({
                weight_kg: profile.weight_kg || '',
                medical_expiry: profile.medical_expiry || '',
                license_expiry: profile.license_expiry || ''
            });
        } catch (error) {
            console.error("Failed to load profile", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Convert weight to number
            const payload = {
                ...formData,
                weight_kg: formData.weight_kg ? parseInt(formData.weight_kg, 10) : null
            };

            await apiClient.updateUserProfile(payload);
            if (onUpdate) onUpdate();
            onClose();
        } catch (error) {
            alert("Failed to update profile: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800">Update Pilot Profile</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {loading ? (
                        <div className="text-center py-4 text-gray-500">Loading profile...</div>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Weight (kg)</label>
                                <input
                                    type="number"
                                    className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.weight_kg}
                                    onChange={e => setFormData({ ...formData, weight_kg: e.target.value })}
                                    placeholder="e.g. 85"
                                />
                                <p className="text-xs text-gray-400 mt-1">Used for W&B calculations.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">License Expiry</label>
                                    <input
                                        type="date"
                                        className="w-full border rounded-md p-2"
                                        value={formData.license_expiry}
                                        onChange={e => setFormData({ ...formData, license_expiry: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Medical Expiry</label>
                                    <input
                                        type="date"
                                        className="w-full border rounded-md p-2"
                                        value={formData.medical_expiry}
                                        onChange={e => setFormData({ ...formData, medical_expiry: e.target.value })}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex gap-3 pt-4 border-t mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving || loading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserProfileModal;
