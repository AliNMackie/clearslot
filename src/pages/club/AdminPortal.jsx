import React from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminDiary from '../../crm/AdminDiary';

const AdminPortal = () => {
    const { clubSlug } = useParams();

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <div className="bg-gray-900 text-white p-4">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <h1 className="font-bold text-lg">Club Admin: {clubSlug}</h1>
                    <Link to={`/clubs/${clubSlug}/app`} className="text-sm opacity-80 hover:opacity-100">Back to App</Link>
                </div>
            </div>

            <main className="max-w-6xl mx-auto p-6 space-y-6">

                {/* Quick Actions / Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Members</h3>
                        <div className="text-3xl font-bold text-gray-900">142</div>
                        <button className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">Export CSV</button>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Fleet Status</h3>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="font-bold">2 Online</span>
                        </div>
                        <button className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">Manage Aircraft</button>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">ClearSlot Score</h3>
                        <div className="text-3xl font-bold text-green-600">85/100</div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Modernised</span>
                    </div>
                </div>

                {/* Diary View */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-bold mb-4">7-Day Diary</h2>
                    <AdminDiary />
                </div>

            </main>
        </div>
    );
};

export default AdminPortal;
