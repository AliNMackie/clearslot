import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminDiary from '../../crm/AdminDiary';
import { apiClient } from '../../services/apiClient';

import Skeleton from '../../components/Skeleton';

const AdminPortal = () => {
    const { clubSlug } = useParams();
    const [news, setNews] = useState([]);
    const [fleet, setFleet] = useState([]);
    const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | news | fleet
    const [loading, setLoading] = useState(true);

    // Forms state
    const [newNews, setNewNews] = useState({ title: '', body: '' });
    const [newFleet, setNewFleet] = useState({ type: '', registration: '', rate_per_hour: '' });

    useEffect(() => {
        loadData();
    }, [clubSlug]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [n, f] = await Promise.all([
                apiClient.getClubNews(clubSlug),
                apiClient.getClubFleet(clubSlug)
            ]);
            setNews(n);
            setFleet(f);
        } catch (error) {
            console.error("Failed to load admin data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNews = async (e) => {
        e.preventDefault();
        try {
            await apiClient.createNews(clubSlug, newNews);
            setNewNews({ title: '', body: '' });
            loadData();
        } catch (error) {
            alert("Failed to create news: " + error.message);
        }
    };

    const handleDeleteNews = async (id) => {
        if (!window.confirm("Delete this news item?")) return;
        try {
            await apiClient.deleteNews(clubSlug, id);
            loadData();
        } catch (error) {
            alert("Failed to delete news");
        }
    };

    const handleCreateFleet = async (e) => {
        e.preventDefault();
        try {
            await apiClient.createFleet(clubSlug, {
                ...newFleet,
                rate_per_hour: parseFloat(newFleet.rate_per_hour)
            });
            setNewFleet({ type: '', registration: '', rate_per_hour: '' });
            loadData();
        } catch (error) {
            alert("Failed to add aircraft: " + error.message);
        }
    };

    const handleDeleteFleet = async (id) => {
        if (!window.confirm("Delete this aircraft?")) return;
        try {
            await apiClient.deleteFleet(clubSlug, id);
            loadData();
        } catch (error) {
            alert("Failed to delete aircraft");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <div className="bg-gray-900 text-white p-4 shadow-md">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <h1 className="font-bold text-lg">Club Admin: {clubSlug}</h1>
                        <nav className="flex gap-4 text-sm font-medium">
                            <button onClick={() => setActiveTab('dashboard')} className={`hover:text-white ${activeTab === 'dashboard' ? 'text-white' : 'text-gray-400'}`}>Dashboard</button>
                            <button onClick={() => setActiveTab('news')} className={`hover:text-white ${activeTab === 'news' ? 'text-white' : 'text-gray-400'}`}>News</button>
                            <button onClick={() => setActiveTab('fleet')} className={`hover:text-white ${activeTab === 'fleet' ? 'text-white' : 'text-gray-400'}`}>Fleet</button>
                        </nav>
                    </div>
                    <Link to={`/clubs/${clubSlug}/app`} className="text-sm opacity-80 hover:opacity-100 bg-gray-800 px-3 py-1 rounded">Back to Portal</Link>
                </div>
            </div>

            <main className="max-w-6xl mx-auto p-6 space-y-6">

                {activeTab === 'dashboard' && (
                    <>
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Members</h3>
                                <div className="text-3xl font-bold text-gray-900">142</div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Fleet Status</h3>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="font-bold">{fleet.length} Aircraft Online</span>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                <h3 className="text-sm font-medium text-gray-500 mb-2">ClearSlot Score</h3>
                                <div className="text-3xl font-bold text-green-600">85/100</div>
                            </div>
                        </div>

                        {/* Recent News */}
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                            <h2 className="text-xl font-bold mb-4">Latest News</h2>
                            {loading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-5 w-1/3 mb-2" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                </div>
                            ) : (
                                news.length === 0 ? <p className="text-gray-500">No news items.</p> : (
                                    <ul className="space-y-3">
                                        {news.slice(0, 3).map(item => (
                                            <li key={item.id} className="border-b pb-2 last:border-0">
                                                <div className="font-bold">{item.title}</div>
                                                <div className="text-sm text-gray-600 truncate">{item.body}</div>
                                            </li>
                                        ))}
                                    </ul>
                                )
                            )}
                        </div>

                        {/* Diary View */}
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                            <h2 className="text-xl font-bold mb-4">7-Day Diary</h2>
                            <AdminDiary />
                        </div>
                    </>
                )}

                {activeTab === 'news' && (
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 h-fit">
                            <h2 className="text-xl font-bold mb-4">Post News</h2>
                            <form onSubmit={handleCreateNews} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                        value={newNews.title}
                                        onChange={e => setNewNews({ ...newNews, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Content</label>
                                    <textarea
                                        required
                                        rows={4}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                        value={newNews.body}
                                        onChange={e => setNewNews({ ...newNews, body: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium w-full">
                                    Post Update
                                </button>
                            </form>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                            <h2 className="text-xl font-bold mb-4">Active News ({news.length})</h2>
                            <ul className="space-y-4">
                                {news.map(item => (
                                    <li key={item.id} className="p-4 bg-gray-50 rounded-lg relative group">
                                        <button
                                            onClick={() => handleDeleteNews(item.id)}
                                            className="absolute top-2 right-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                                        >
                                            Delete
                                        </button>
                                        <h3 className="font-bold text-gray-900">{item.title}</h3>
                                        <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{item.body}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'fleet' && (
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 h-fit">
                            <h2 className="text-xl font-bold mb-4">Add Aircraft</h2>
                            <form onSubmit={handleCreateFleet} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Registration</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="G-ABCD"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border uppercase"
                                        value={newFleet.registration}
                                        onChange={e => setNewFleet({ ...newFleet, registration: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Type</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ikarus C42"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                        value={newFleet.type}
                                        onChange={e => setNewFleet({ ...newFleet, type: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Rate (£/hr)</label>
                                    <input
                                        type="number"
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                        value={newFleet.rate_per_hour}
                                        onChange={e => setNewFleet({ ...newFleet, rate_per_hour: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium w-full">
                                    Add to Fleet
                                </button>
                            </form>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                            <h2 className="text-xl font-bold mb-4">Fleet List ({fleet.length})</h2>
                            <div className="space-y-3">
                                {fleet.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <div>
                                            <div className="font-bold text-gray-900">{item.registration}</div>
                                            <div className="text-sm text-gray-600">{item.type}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-mono text-gray-900 font-bold">£{item.rate_per_hour}/hr</div>
                                            <button
                                                onClick={() => handleDeleteFleet(item.id)}
                                                className="text-xs text-red-600 hover:underline mt-1"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
};

export default AdminPortal;
