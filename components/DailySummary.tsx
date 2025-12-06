import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { Trophy, Flame, Wheat, Drumstick, Droplets, ChevronDown, ChevronUp } from 'lucide-react';
import { AnalysisResult } from '../types';

interface DailySummaryProps {
    user: User;
}

interface ScanData {
    id: string;
    analysis: AnalysisResult;
    timestamp: Timestamp;
}

export const DailySummary: React.FC<DailySummaryProps> = ({ user }) => {
    const [scans, setScans] = useState<ScanData[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        // Determine start of today (local time)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // Filter by userId only to avoid needing a composite index immediately.
        // We will filter by date in client-side for simplicity in this demo.
        const q = query(
            collection(db, "scans"),
            where("userId", "==", user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const todayScans: ScanData[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                // Check if timestamp exists and is from today
                if (data.timestamp) {
                    const date = data.timestamp.toDate();
                    if (date >= startOfDay) {
                        todayScans.push({
                            id: doc.id,
                            analysis: data.analysis,
                            timestamp: data.timestamp
                        });
                    }
                }
            });
            // Sort by newest first
            todayScans.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
            setScans(todayScans);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const totals = scans.reduce(
        (acc, scan) => {
            acc.calories += scan.analysis.totalCalories || 0;
            acc.protein += scan.analysis.protein || 0;
            acc.carbs += scan.analysis.carbs || 0;
            acc.fat += scan.analysis.fat || 0;
            return acc;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    if (loading) return null;
    if (scans.length === 0) return null;

    return (
        <div className="w-full max-w-3xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                            <Trophy size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Today's Summary</h3>
                            <p className="text-xs text-slate-500">{scans.length} meals tracked</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-black text-slate-900">{Math.round(totals.calories)}</span>
                        <span className="text-xs text-slate-400 font-medium block uppercase tracking-wider">kcal</span>
                    </div>
                </div>

                {/* Macro Progress Bars */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {/* Protein */}
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-2 text-blue-600">
                            <Drumstick size={14} />
                            <span className="text-xs font-bold uppercase tracking-wider">Protein</span>
                        </div>
                        <p className="text-lg font-bold text-slate-700">{Math.round(totals.protein)}g</p>
                    </div>

                    {/* Carbs */}
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-2 text-amber-600">
                            <Wheat size={14} />
                            <span className="text-xs font-bold uppercase tracking-wider">Carbs</span>
                        </div>
                        <p className="text-lg font-bold text-slate-700">{Math.round(totals.carbs)}g</p>
                    </div>

                    {/* Fat */}
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-2 text-rose-600">
                            <Droplets size={14} />
                            <span className="text-xs font-bold uppercase tracking-wider">Fat</span>
                        </div>
                        <p className="text-lg font-bold text-slate-700">{Math.round(totals.fat)}g</p>
                    </div>
                </div>

                {/* Toggle List */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-600 py-2 transition border-t border-slate-100"
                >
                    {expanded ? (
                        <>Hide Meals <ChevronUp size={16} /></>
                    ) : (
                        <>View Meals <ChevronDown size={16} /></>
                    )}
                </button>

                {expanded && (
                    <div className="mt-4 space-y-3 animate-in fade-in duration-300">
                        {scans.map((scan) => (
                            <div key={scan.id} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                                <div>
                                    <p className="font-medium text-slate-700 text-sm">
                                        {scan.analysis.items.map(i => i.name).join(", ")}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {scan.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold text-slate-700 text-sm">{Math.round(scan.analysis.totalCalories)}</span>
                                    <span className="text-xs text-slate-400 ml-1">kcal</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
