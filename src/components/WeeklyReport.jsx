import { useState, useEffect } from 'react';

export default function WeeklyReport({ isOpen, onClose }) {
    const [weekOffset, setWeekOffset] = useState(0);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Calculate Week Range (Ending on Saturday)
    const getWeekRange = (offset) => {
        const today = new Date();
        const endOfWeek = new Date(today);
        // Find next Saturday (or today if it's Saturday)
        const dayOfWeek = endOfWeek.getDay(); // 0 (Sun) to 6 (Sat)
        const diffToSaturday = 6 - dayOfWeek;
        endOfWeek.setDate(today.getDate() + diffToSaturday + (offset * 7));
        endOfWeek.setHours(23, 59, 59, 999);

        const startOfWeek = new Date(endOfWeek);
        startOfWeek.setDate(endOfWeek.getDate() - 6);
        startOfWeek.setHours(0, 0, 0, 0);

        return { start: startOfWeek, end: endOfWeek };
    };

    const { start, end } = getWeekRange(weekOffset);

    useEffect(() => {
        if (isOpen) {
            fetchReport();
        }
    }, [isOpen, weekOffset]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            // Fetch logs for the date range
            const res = await fetch(`/api/logs?start=${start.toISOString()}&end=${end.toISOString()}`);
            const logs = await res.json();
            
            // Process logs to tally by student
            const tally = {};
            logs.forEach(log => {
                // Only count "Yellow Card" related logs (ignore resets or removals)
                if (!log.description.startsWith('+1 YC')) return;
                
                if (!tally[log.studentId]) {
                    tally[log.studentId] = {
                        name: log.student.fullName,
                        grade: log.student.grade,
                        count: 0,
                        reasons: []
                    };
                }
                tally[log.studentId].count += 1;
                // Clean up description for display (remove the +1 YC prefix if redundant, or keep it)
                // log.description is like "+1 YC (Reason) -> Converted..."
                // We'll keep the full description as it contains context
                tally[log.studentId].reasons.push(log.description);
            });

            setReportData(Object.values(tally).sort((a, b) => b.count - a.count));
        } catch (error) {
            console.error("Error fetching report:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-500 bg-opacity-75 p-4 sm:p-0">
            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold leading-6 text-gray-900">
                                Weekly Tally Report
                            </h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                <span className="sr-only">Close</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mb-4">
                            <button 
                                onClick={() => setWeekOffset(weekOffset - 1)}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                            >
                                &larr; Previous Week
                            </button>
                            <div className="text-sm font-medium text-gray-900">
                                {start.toLocaleDateString()} - {end.toLocaleDateString()}
                            </div>
                            <button 
                                onClick={() => setWeekOffset(weekOffset + 1)}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                                disabled={weekOffset >= 0}
                            >
                                Next Week &rarr;
                            </button>
                        </div>

                        {loading ? (
                            <div className="text-center py-8">Loading...</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Student</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Grade</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Cards Issued</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {reportData.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="py-4 text-center text-sm text-gray-500">
                                                    No yellow cards issued this week.
                                                </td>
                                            </tr>
                                        ) : (
                                            reportData.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{item.name}</td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.grade}</td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-bold">{item.count}</td>
                                                    <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                        {item.reasons.join(', ')}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        
                        <div className="mt-4 text-xs text-gray-500 text-center">
                            * Weeks are calculated ending on Saturday.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
