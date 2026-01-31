import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText, Clock, Laptop, AlertCircle, ChevronLeft, BarChart2, TrendingUp, Shield, Search
} from 'lucide-react';
import { documentService, Project } from '../../services/documentService';
import {
    LineChart, Line, AreaChart, Area, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip
} from "recharts";
import { OriginalityService, OriginalityScan } from '../../services/originalityService';
import { AnalyticsService } from '../../services/analyticsService';
import { OriginalityReportModal } from '../originality/OriginalityReportModal';

interface DocumentMetric extends Project {
    keystrokes?: number;
    timeSpentMinutes?: number;
    revisionCount?: number;
    status?: 'on-track' | 'urgent' | 'completed' | 'overdue';
    dueDate?: string;
}

// Scan data interfaces are handled by services

export const DocumentAnalyticsPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'history'>('overview');
    const [documents, setDocuments] = useState<DocumentMetric[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [scans, setScans] = useState<OriginalityScan[]>([]);
    const [monthlyData, setMonthlyData] = useState<any[]>([]);
    const [yearlyData, setYearlyData] = useState<any[]>([]);
    const [productivity, setProductivity] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<OriginalityScan | null>(null);
    const [isReportOpen, setIsReportOpen] = useState(false);

    useEffect(() => {
        const loadAllData = async () => {
            setLoading(true);
            try {
                const [docsRes, scansRes, trendsRes] = await Promise.all([
                    documentService.getProjects(),
                    OriginalityService.getScanHistory(),
                    AnalyticsService.getDetailedTrends()
                ]);

                if (docsRes.success && docsRes.data) {
                    const enrichedData = docsRes.data.map((doc: any, index: number) => {
                        const mockKeystrokes = (doc.word_count || 0) * 6 + Math.floor(Math.random() * 500);
                        const mockTimeMinutes = Math.floor((doc.word_count || 0) / 10) + Math.floor(Math.random() * 60);

                        const now = new Date();
                        const daysOffset = (index % 10) - 2;
                        const mockDueDate = new Date(now);
                        mockDueDate.setDate(now.getDate() + daysOffset);

                        let status: 'on-track' | 'urgent' | 'completed' | 'overdue' = 'on-track';
                        if (daysOffset < 0) status = 'overdue';
                        else if (daysOffset <= 2) status = 'urgent';
                        else if (index % 5 === 0) status = 'completed';

                        return {
                            ...doc,
                            keystrokes: mockKeystrokes,
                            timeSpentMinutes: mockTimeMinutes,
                            dueDate: doc.due_date || mockDueDate.toISOString(),
                            status: status
                        };
                    });
                    setDocuments(enrichedData);
                }

                if (scansRes) setScans(scansRes);

                if (trendsRes) {
                    // Map monthlyGrowth (monthKey/month_name/count) to recharts (name/docs)
                    setMonthlyData(trendsRes.monthlyGrowth.map((m: any) => ({
                        name: m.month_name,
                        docs: m.count
                    })));

                    setYearlyData(trendsRes.yearlyOverview);
                    setProductivity(trendsRes.productivityInsight);
                }

            } catch (error) {
                console.error('Error fetching analytics data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadAllData();
    }, []);

    const formatTime = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'urgent': return 'bg-red-50 text-red-700 border-red-100';
            case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
            case 'completed': return 'bg-green-50 text-green-700 border-green-100';
            case 'pass': return 'bg-green-50 text-green-700 border-green-100';
            case 'fail': return 'bg-red-50 text-red-700 border-red-100';
            case 'warning': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'verified': return 'bg-purple-50 text-purple-700 border-purple-100';
            default: return 'bg-blue-50 text-blue-700 border-blue-100';
        }
    };

    const handleViewReport = (scan: OriginalityScan) => {
        setSelectedReport(scan);
        setIsReportOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <button onClick={() => navigate('/dashboard')} className="flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-2 transition-colors">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
                    <p className="text-gray-500 mt-1">Deep dive into your writing habits, trends, and scan history.</p>
                </div>

                {/* Tab Navigation */}
                <div className="bg-gray-100/50 p-1 rounded-xl flex gap-1">
                    {(['overview', 'trends', 'history'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Overview Tab (Existing Table) */}
            {activeTab === 'overview' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-gray-400 uppercase">Total Time</span>
                            </div>
                            <span className="text-2xl font-bold text-gray-900">{formatTime(documents.reduce((acc, curr) => acc + (curr.timeSpentMinutes || 0), 0))}</span>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Laptop className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-gray-400 uppercase">Keystrokes</span>
                            </div>
                            <span className="text-2xl font-bold text-gray-900">{(documents.reduce((acc, curr) => acc + (curr.keystrokes || 0), 0) / 1000).toFixed(1)}k</span>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-gray-400 uppercase">Documents</span>
                            </div>
                            <span className="text-2xl font-bold text-gray-900">{documents.length}</span>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-gray-400 uppercase">Urgent</span>
                            </div>
                            <span className="text-2xl font-bold text-gray-900">{documents.filter(d => d.status === 'urgent' || d.status === 'overdue').length}</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="border-b border-gray-100 p-4 flex gap-4 items-center">
                            <Search className="w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search documents..."
                                className="w-full outline-none text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50/50 text-xs text-gray-500 uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-3">Document</th>
                                    <th className="px-6 py-3">Deadline</th>
                                    <th className="px-6 py-3">Effort</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {documents.filter(d => d.title.toLowerCase().includes(searchTerm.toLowerCase())).map(doc => (
                                    <tr key={doc.id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{doc.title}</td>
                                        <td className="px-6 py-4 text-gray-500">{new Date(doc.dueDate!).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-gray-500">{formatTime(doc.timeSpentMinutes || 0)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusColor(doc.status || 'on-track')}`}>
                                                {doc.status?.replace('-', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <a href={`/dashboard/editor/${doc.id}`} className="text-indigo-600 hover:text-indigo-800 font-semibold">Open</a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Trends Tab */}
            {activeTab === 'trends' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-indigo-600" /> Monthly Growth
                            </h3>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                                        <Line type="monotone" dataKey="docs" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4, fill: '#4F46E5', strokeWidth: 2, stroke: '#fff' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <BarChart2 className="w-5 h-5 text-purple-600" /> Yearly Overview
                            </h3>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={yearlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorDocs" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                                        <Area type="monotone" dataKey="docs" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorDocs)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-xl p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-sm">
                        <div>
                            <h3 className="text-2xl font-bold mb-2 font-serif tracking-tight">Productivity Insight</h3>
                            <p className="text-slate-300 max-w-xl text-lg leading-relaxed">
                                {productivity ? (
                                    <>
                                        You are most productive on <span className="text-white font-semibold">{productivity.most_productive_day}s</span>,
                                        contributing <span className="text-white font-semibold">{productivity.percentage_contribution}%</span> of your total content ({productivity.total_words} words).
                                    </>
                                ) : (
                                    "Start writing in the editor to see your productivity trends and insights appear here."
                                )}
                            </p>
                        </div>
                        <div className="mt-6 md:mt-0 p-4 bg-white/5 rounded-lg border border-white/10">
                            <div className="text-3xl font-bold mb-1 font-mono">
                                {productivity && productivity.total_words > 1000 ? "Top 1%" : "Novice"}
                            </div>
                            <div className="text-xs text-slate-400 uppercase tracking-widest">Writer Rank</div>
                        </div>
                    </div>
                </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Scan History</h3>
                            <p className="text-sm text-gray-500">Record of all previous Originality, AI, and Authorship checks.</p>
                        </div>

                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50/50 text-xs text-gray-500 uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-3">Scan Type</th>
                                    <th className="px-6 py-3">Document</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Score</th>
                                    <th className="px-6 py-3">Result</th>
                                    <th className="px-6 py-3 text-right">Report</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {scans.length > 0 ? scans.map(scan => (
                                    <tr key={scan.id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-indigo-600" />
                                                <span className="capitalize font-medium text-gray-700">Originality</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{scan.documentTitle}</td>
                                        <td className="px-6 py-4 text-gray-500">{new Date(scan.scannedAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-bold text-gray-900">{Math.round(scan.overallScore)}%</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(scan.classification === 'safe' ? 'pass' : scan.classification === 'action_required' ? 'fail' : 'warning')}`}>
                                                {scan.classification === 'safe' ? 'PASS' : scan.classification === 'action_required' ? 'FAIL' : 'REVIEW'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleViewReport(scan)}
                                                className="text-gray-500 hover:text-indigo-600 text-xs font-bold uppercase tracking-wide"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                            No scan history available. Start scanning documents in the editor to see results here.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Report Modal */}
            {selectedReport && (
                <OriginalityReportModal
                    isOpen={isReportOpen}
                    onClose={() => setIsReportOpen(false)}
                    results={selectedReport}
                    documentContent={selectedReport.scannedContent || ""}
                />
            )}
        </div>
    );
};
