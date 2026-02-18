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
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Glass/Sticky App Bar */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                                A
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900">Club Admin <span className="text-slate-400 font-normal">/ {clubSlug}</span></h1>
                        </div>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex bg-slate-100/50 p-1 rounded-lg border border-slate-200/50">
                            {[
                                { id: 'dashboard', label: 'Dashboard' },
                                { id: 'news', label: 'News' },
                                { id: 'fleet', label: 'Fleet' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === tab.id
                                            ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200'
                                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <Link
                        to={`/clubs/${clubSlug}/app`}
                        className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                    >
                        &larr; Back to Portal
                    </Link>
                </div>

                {/* Mobile Nav */}
                <div className="md:hidden mt-4 pb-2 overflow-x-auto">
                    <div className="flex gap-2">
                        {[
                            { id: 'dashboard', label: 'Dashboard' },
                            { id: 'news', label: 'News' },
                            { id: 'fleet', label: 'Fleet' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap border transition-colors ${activeTab === tab.id
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'bg-white border-slate-200 text-slate-600'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">

                {activeTab === 'dashboard' && (
                    <>
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Members</h3>
                                    <div className="mt-2 text-3xl font-bold text-slate-900">142</div>
                                </div>
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Fleet Status</h3>
                                    <div className="mt-2 flex items-center gap-2">
                                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                                        <span className="text-xl font-bold text-slate-900">{fleet.length} Active</span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">System Health</h3>
                                    <div className="mt-2 text-3xl font-bold text-emerald-600">98%</div>
                                </div>
                                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* Recent News Preview */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h2 className="text-lg font-bold text-slate-900">Latest Announcements</h2>
                                <button onClick={() => setActiveTab('news')} className="text-sm text-blue-600 font-medium hover:text-blue-700">Manage News &rarr;</button>
                            </div>
                            <div className="p-6">
                                {loading ? (
                                    <div className="space-y-4">
                                        <Skeleton className="h-5 w-1/3 mb-2" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-2/3" />
                                    </div>
                                ) : (
                                    news.length === 0 ? <p className="text-slate-400 italic">No news items posted.</p> : (
                                        <ul className="space-y-4">
                                            {news.slice(0, 3).map(item => (
                                                <li key={item.id} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                                    <div className="font-bold text-slate-800">{item.title}</div>
                                                    <div className="text-sm text-slate-600 mt-1 line-clamp-2">{item.body}</div>
                                                </li>
                                            ))}
                                        </ul>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Diary View */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h2 className="text-lg font-bold text-slate-900">7-Day Flight Diary</h2>
                            </div>
                            <div className="p-6">
                                <AdminDiary />
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'news' && (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Form Column */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
                                <h2 className="text-lg font-bold text-slate-900 mb-4">Post Announcement</h2>
                                <form onSubmit={handleCreateNews} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                            placeholder="e.g. Runway Maintenance"
                                            value={newNews.title}
                                            onChange={e => setNewNews({ ...newNews, title: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Content</label>
                                        <textarea
                                            required
                                            rows={6}
                                            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                            placeholder="Details..."
                                            value={newNews.body}
                                            onChange={e => setNewNews({ ...newNews, body: e.target.value })}
                                        />
                                    </div>
                                    <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 font-semibold shadow-sm transition-all active:scale-95">
                                        Post Update
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* List Column */}
                        <div className="lg:col-span-2">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Active News ({news.length})</h2>
                            <ul className="space-y-4">
                                {news.map(item => (
                                    <li key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative group transition hover:shadow-md">
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleDeleteNews(item.id)}
                                                className="text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                        <h3 className="font-bold text-lg text-slate-900 pr-16">{item.title}</h3>
                                        <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap leading-relaxed">{item.body}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'fleet' && (
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
                                <h2 className="text-lg font-bold text-slate-900 mb-4">Add Aircraft</h2>
                                <form onSubmit={handleCreateFleet} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Registration</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="G-ABCD"
                                            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm uppercase font-mono"
                                            value={newFleet.registration}
                                            onChange={e => setNewFleet({ ...newFleet, registration: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Type</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ikarus C42"
                                            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                            value={newFleet.type}
                                            onChange={e => setNewFleet({ ...newFleet, type: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Hourly Rate (£)</label>
                                        <input
                                            type="number"
                                            required
                                            placeholder="95.00"
                                            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                            value={newFleet.rate_per_hour}
                                            onChange={e => setNewFleet({ ...newFleet, rate_per_hour: e.target.value })}
                                        />
                                    </div>
                                    <button type="submit" className="w-full bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700 font-semibold shadow-sm transition-all active:scale-95">
                                        Add to Fleet
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Fleet List ({fleet.length})</h2>
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="divide-y divide-slate-100">
                                    {fleet.map(item => (
                                        <div key={item.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 font-mono text-lg">{item.registration}</div>
                                                    <div className="text-sm text-slate-500">{item.type}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-slate-700">£{item.rate_per_hour}<span className="text-sm font-normal text-slate-400">/hr</span></div>
                                                <button
                                                    onClick={() => handleDeleteFleet(item.id)}
                                                    className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline mt-1"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {fleet.length === 0 && (
                                        <div className="p-8 text-center text-slate-400">
                                            No aircraft in fleet. Add one to get started.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
};

export default AdminPortal;
